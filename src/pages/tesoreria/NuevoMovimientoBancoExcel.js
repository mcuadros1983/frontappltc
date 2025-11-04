// src/components/tesoreria/NuevoMovimientoBancoExcel.js
import React, { useContext, useMemo, useState } from "react";
import { Card, Button, Alert, Form, Table, Spinner, Row, Col, Modal } from "react-bootstrap";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Carga masiva de Movimientos Banco Tesorería (ahora admite ingreso/egreso).
 * Validación por NOMBRE/DESCRIPCIÓN usando el contexto:
 * - proveedor: razonsocial | nombre | descripcion
 * - categoria: nombre
 * - proyecto:  descripcion | nombre
 * - banco:     SELECCIONADO EN UI (no en el Excel)
 *
 * Columnas requeridas (case-insensitive):
 *  fecha, descripcion, monto, tipo, proveedor, categoria, proyecto
 *
 * BACKEND: POST /movimientos-banco-tesoreria/importar-excel (multipart: file)
 *          Campos: file, empresa_id, banco_id
 */
export default function NuevoMovimientoBancoExcel() {
  const data = useContext(Contexts.DataContext) || {};
  const {
    empresaSeleccionada,
    bancosTabla = [],
    proveedoresTabla = [],
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
    proyectosTabla = [],
  } = data;

  const [showConfirm, setShowConfirm] = useState(false);
  const [rowsCount, setRowsCount] = useState(0);

  const empresa_id = empresaSeleccionada?.id || null;

  // ---- Derivados de contexto ----
  const bancosEmpresa = useMemo(() => {
    if (!empresa_id) return [];
    return (bancosTabla || []).filter(b => Number(b.empresa_id) === Number(empresa_id));
  }, [bancosTabla, empresa_id]);

  const categorias = useMemo(
    () => (categoriasEgresoTabla?.length ? categoriasEgresoTabla : categoriasEgreso) || [],
    [categoriasEgresoTabla, categoriasEgreso]
  );

  const norm = (s) => String(s || "").trim().toLowerCase();

  const proveedorByName = useMemo(() => {
    const m = new Map();
    (proveedoresTabla || []).forEach(p => {
      [p.razonsocial, p.nombre, p.descripcion].forEach(k => { const key = norm(k); if (key) m.set(key, p); });
    });
    return m;
  }, [proveedoresTabla]);

  const categoriaByName = useMemo(() => {
    const m = new Map();
    (categorias || []).forEach(c => { const key = norm(c.nombre); if (key) m.set(key, c); });
    return m;
  }, [categorias]);

  const proyectoByName = useMemo(() => {
    const m = new Map();
    (proyectosTabla || []).forEach(p => {
      [p.descripcion, p.nombre].forEach(k => { const key = norm(k); if (key) m.set(key, p); });
    });
    return m;
  }, [proyectosTabla]);

  // ---- Estado UI ----
  const [file, setFile] = useState(null);
  const [rowsPreview, setRowsPreview] = useState([]); // primeras 20 filas parseadas
  const [errors, setErrors] = useState([]);           // {rowNumber, issues: [...]}
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const [bancoIdUI, setBancoIdUI] = useState("");     // banco seleccionado en UI

  // ---- Plantilla XLSX con validaciones para 4 columnas ----
  const handleDownloadTemplate = async () => {
    if (!empresa_id) return;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Movimientos");   // hoja principal
    const wsListas = wb.addWorksheet("Listas");  // hoja para listas
    wsListas.state = "veryHidden";

    // Encabezados (SIN banco)
    const headers = [
      "fecha",        // YYYY-MM-DD
      "descripcion",
      "monto",
      "tipo",         // ingreso | egreso
      "proveedor",    // desde proveedoresTabla
      "categoria",    // desde categoriasEgreso/categoriasEgresoTabla
      "proyecto",     // desde proyectosTabla
    ];
    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };
    ws.columns = headers.map(h => ({ header: h, key: h, width: Math.max(16, h.length + 2) }));

    // ------- Construcción de listas desde el contexto -------
    const tipos = ["ingreso", "egreso"];

    const proveedoresValores = Array.from(
      new Set(
        (proveedoresTabla || [])
          .map(p => (p?.razonsocial || p?.nombre || p?.descripcion || "").toString().trim())
          .filter(Boolean)
      )
    );

    const categoriasValores = Array.from(
      new Set(
        (categorias || [])
          .map(c => (c?.nombre || "").toString().trim())
          .filter(Boolean)
      )
    );

    const proyectosValores = Array.from(
      new Set(
        (proyectosTabla || [])
          .map(p => (p?.descripcion || p?.nombre || "").toString().trim())
          .filter(Boolean)
      )
    );

    // Helper para volcar una lista en una columna de "Listas" y devolver el rango absoluto A1
    const putListAndGetRange = (colLetter, title, values) => {
      wsListas.getCell(`${colLetter}1`).value = title;
      values.forEach((v, i) => {
        wsListas.getCell(`${colLetter}${i + 2}`).value = v;
      });
      // Rango absoluto para validación: Listas!$X$2:$X${n}
      const endRow = values.length + 1; // porque empieza en 2
      return `Listas!$${colLetter}$2:$${colLetter}$${endRow}`;
    };

    const rangoTipos = putListAndGetRange("A", "Tipo", tipos);
    const rangoProveedores = putListAndGetRange("B", "Proveedores", proveedoresValores);
    const rangoCategorias = putListAndGetRange("C", "Categorias", categoriasValores);
    const rangoProyectos = putListAndGetRange("D", "Proyectos", proyectosValores);

    // Validaciones de datos en hoja principal (hasta 1000 filas)
    for (let r = 2; r <= 1000; r++) {
      // tipo -> columna D
      ws.getCell(`D${r}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [rangoTipos],
        showErrorMessage: true,
        errorTitle: "Valor inválido",
        error: "El tipo debe ser 'ingreso' o 'egreso'.",
      };
      // proveedor -> columna E
      ws.getCell(`E${r}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [rangoProveedores],
        showErrorMessage: true,
        errorTitle: "Proveedor inválido",
        error: "Seleccione un proveedor del listado.",
      };
      // categoria -> columna F
      ws.getCell(`F${r}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [rangoCategorias],
        showErrorMessage: true,
        errorTitle: "Categoría inválida",
        error: "Seleccione una categoría del listado.",
      };
      // proyecto -> columna G
      ws.getCell(`G${r}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [rangoProyectos],
        showErrorMessage: true,
        errorTitle: "Proyecto inválido",
        error: "Seleccione un proyecto del listado.",
      };
    }

    // Fila de ejempl

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "plantilla_movimientos_banco.xlsx");
  };

  // ---- Parse + Validación cliente ----
  const handleFileChange = async (e) => {
    setServerResult(null);
    const f = e.target.files?.[0] || null;
    setFile(f);
    setRowsPreview([]);
    setErrors([]);
    if (!f) return;
    if (!empresa_id) return;

    setParsing(true);
    try {
      const ab = await f.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

      // Normalizar encabezados -> claves esperadas
      const keyMap = (obj) => {
        const out = {};
        Object.keys(obj).forEach((k) => {
          const nk = norm(k);
          if (["fecha"].includes(nk)) out.fecha = obj[k];
          else if (["descripcion", "descripción"].includes(nk)) out.descripcion = obj[k];
          else if (["monto", "importe"].includes(nk)) out.monto = obj[k];
          else if (["tipo"].includes(nk)) out.tipo = obj[k];
          else if (["proveedor", "entidad"].includes(nk)) out.proveedor = obj[k];
          else if (["categoria", "categoría"].includes(nk)) out.categoria = obj[k];
          else if (["proyecto"].includes(nk)) out.proyecto = obj[k];
        });
        return out;
      };


      const rows = json.map(keyMap).filter(r =>
        Object.values(r).some(v => String(v).trim() !== "")
      );
      setRowsCount(rows.length);

      const errs = [];
      const preview = [];

      const toISO = (v) => {
        if (!v) return null;
        if (typeof v === "number") {
          const d = XLSX.SSF.parse_date_code(v);
          if (!d) return null;
          const mm = String(d.m).padStart(2, "0");
          const dd = String(d.d).padStart(2, "0");
          return `${d.y}-${mm}-${dd}`;
        }
        const s = String(v).trim();
        const m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
        if (m1) return s;
        const m2 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
        if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
        return null;
      };

      rows.forEach((r, idx) => {
        const rowNumber = idx + 2; // 1 = headers
        const issues = [];

        const fechaISO = toISO(r.fecha);
        if (!fechaISO) issues.push("Fecha inválida (use YYYY-MM-DD o DD/MM/AAAA)");

        const desc = String(r.descripcion || "").trim();
        if (!desc) issues.push("Descripción requerida");

        let montoNum = Number(String(r.monto).toString().replace(",", "."));
        if (!(montoNum > 0)) issues.push("Monto inválido (> 0)");

        const tipo = norm(r.tipo);
        if (!tipo) issues.push("Tipo requerido");
        else if (!["egreso", "ingreso"].includes(tipo)) {
          issues.push("Tipo debe ser 'egreso' o 'ingreso'");
        }
        // Si tu backend por ahora solo soporta EGRESOS, descomenta la siguiente línea:
        // else if (tipo !== "egreso") issues.push("Por importación masiva solo se admite 'egreso'");

        const provName = norm(r.proveedor);
        const prov = provName ? (proveedorByName.get(provName) || null) : null;
        if (!prov) issues.push(`Proveedor inexistente: "${r.proveedor}"`);

        const catName = norm(r.categoria);
        const cat = catName ? (categoriaByName.get(catName) || null) : null;
        if (!cat) issues.push(`Categoría inexistente: "${r.categoria}"`);
        else if (!cat.imputacioncontable_id) issues.push(`La categoría "${r.categoria}" no tiene imputación contable asociada`);

        const projName = norm(r.proyecto);
        const proy = projName ? (proyectoByName.get(projName) || null) : null;
        if (!proy) issues.push(`Proyecto inexistente: "${r.proyecto}"`);

        if (issues.length) {
          errs.push({ rowNumber, issues });
        }

        preview.push({
          fecha: fechaISO || r.fecha,
          descripcion: desc,
          monto: montoNum || r.monto,
          tipo,
          proveedor: r.proveedor,
          categoria: r.categoria,
          proyecto: r.proyecto,
        });
      });

      setRowsPreview(preview.slice(0, 20));
      setErrors(errs);
    } catch (e) {
      setErrors([{ rowNumber: "-", issues: [`No se pudo leer el archivo: ${e.message}`] }]);
      setRowsPreview([]);
    } finally {
      setParsing(false);
    }
  };

  // ---- Enviar al backend (se envía el archivo + empresa_id + banco_id) ----
  const handleUpload = async () => {
    if (!file || !empresa_id || !bancoIdUI) return;
    setUploading(true);
    setServerResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("empresa_id", String(empresa_id));
      fd.append("banco_id", String(bancoIdUI)); // Banco elegido en UI

      const res = await fetch(`${apiUrl}/movimientos-banco-tesoreria/importar-excel`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error al importar");

      setServerResult(json);
    } catch (err) {
      setServerResult({ error: err.message || "Error inesperado" });
    } finally {
      setUploading(false);
    }
  };

  const hasErrors = errors.length > 0;

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div><strong>IMPORTAR MOVIMIENTOS BANCARIOS (Excel)</strong></div>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={!empresa_id}
            onClick={handleDownloadTemplate}
            title={!empresa_id ? "Seleccione una empresa para generar la plantilla" : ""}
          >
            Descargar plantilla
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {!empresa_id && (
          <Alert variant="warning" className="py-2">
            Seleccioná una empresa para continuar. La plantilla y la validación dependen de la empresa seleccionada.
          </Alert>
        )}

        {/* Banco seleccionado por UI (obligatorio) */}
        <Form.Group className="mb-3">
          <Form.Label>Banco (se aplicará a TODAS las filas importadas)</Form.Label>
          <Form.Select
            value={bancoIdUI}
            onChange={(e) => setBancoIdUI(e.target.value)}
            disabled={!empresa_id || uploading || parsing}
            required
            className="my-input custom-style-select"
          >
            <option value="">{empresa_id ? "Seleccione…" : "Seleccione empresa"}</option>
            {bancosEmpresa.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Row className="mb-3">
          <Col md={8}>
            <Form.Group controlId="excelFile">
              <Form.Label>Archivo Excel (.xlsx)</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={!empresa_id || parsing || uploading}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <div className="ms-auto">
              <Button
                variant="success"
                disabled={!file || parsing || uploading || hasErrors || !empresa_id || !bancoIdUI}
                onClick={() => setShowConfirm(true)}
              >
                {uploading ? <><Spinner size="sm" animation="border" className="me-2" /> Enviando…</> : "Grabar movimientos"}
              </Button>
            </div>
          </Col>
        </Row>

        <Alert variant="light">
          <div className="mb-2"><strong>Columnas requeridas en el Excel:</strong> fecha, descripcion, monto, tipo, proveedor, categoria, proyecto.</div>
          <ul className="mb-0">
            <li><em>tipo</em>: desplegable (ingreso/egreso) en la plantilla.</li>
            <li><em>proveedor</em>, <em>categoría</em> y <em>proyecto</em>: desplegables construidos desde el contexto actual.</li>
            <li><em>categoría</em>: debe existir y tener imputación contable asociada (se deriva automáticamente).</li>
            <li><em>fecha</em>: YYYY-MM-DD o DD/MM/AAAA. <em>monto</em>: número &gt; 0.</li>
            <li><strong>Banco:</strong> se selecciona arriba y se aplica a todas las filas (no va en el Excel).</li>
          </ul>
        </Alert>

        {parsing && <div className="text-muted"><Spinner size="sm" animation="border" className="me-2" /> Leyendo archivo…</div>}

        {errors.length > 0 && (
          <Alert variant="danger">
            <strong>Errores encontrados ({errors.length}):</strong>
            <ul className="mb-0">
              {errors.slice(0, 50).map((e, i) => (
                <li key={i}>Fila {e.rowNumber}: {e.issues.join(" · ")}</li>
              ))}
            </ul>
            {errors.length > 50 && <div className="mt-1">…y más</div>}
          </Alert>
        )}

        {rowsPreview.length > 0 && (
          <>
            <div className="mb-2"><strong>Vista previa (primeras {rowsPreview.length} filas):</strong></div>
            <Table size="sm" bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Tipo</th>
                  <th>Proveedor</th>
                  <th>Categoría</th>
                  <th>Proyecto</th>
                </tr>
              </thead>
              <tbody>
                {rowsPreview.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 2}</td>
                    <td>{r.fecha}</td>
                    <td>{r.descripcion}</td>
                    <td className="text-end">{Number(r.monto || 0).toFixed(2)}</td>
                    <td>{r.tipo}</td>
                    <td>{r.proveedor}</td>
                    <td>{r.categoria}</td>
                    <td>{r.proyecto}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {serverResult && (
          <Alert variant={serverResult.error ? "danger" : "success"} className="mt-3">
            {serverResult.error
              ? <>{serverResult.error}</>
              : <>
                <div><strong>Importación realizada.</strong></div>
                {serverResult.insertados != null && <div>Insertados: {serverResult.insertados}</div>}
                {serverResult.duplicados != null && <div>Duplicados/omitidos: {serverResult.duplicados}</div>}
                {serverResult.detalle?.length > 0 && (
                  <>
                    <div className="mt-2"><strong>Detalle:</strong></div>
                    <ul className="mb-0">
                      {serverResult.detalle.slice(0, 50).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            }
          </Alert>
        )}
        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar importación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Vas a grabar <strong>{rowsCount}</strong> filas como movimientos bancarios en el banco seleccionado.
            <div className="mt-2">
              <strong>Banco:</strong>{" "}
              {(() => {
                const b = (bancosEmpresa || []).find(x => String(x.id) === String(bancoIdUI));
                return b ? (b.nombre || b.descripcion || b.alias || `Banco ${b.id}`) : "-";
              })()}
            </div>
            {hasErrors && (
              <Alert variant="danger" className="mt-2 mb-0">
                Hay errores en el archivo. Corregilos antes de continuar.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowConfirm(false)} disabled={uploading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => { setShowConfirm(false); handleUpload(); }}
              disabled={uploading || hasErrors}
            >
              {uploading ? <><Spinner size="sm" animation="border" className="me-2" /> Enviando…</> : "Confirmar y enviar"}
            </Button>
          </Modal.Footer>
        </Modal>

      </Card.Body>
    </Card >
  );
}
