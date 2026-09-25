// src/components/tesoreria/NuevoMovimientoBancoExcel.js
import React, { useContext, useMemo, useState } from "react";
import { Card, Button, Alert, Form, Table, Spinner, Row, Col, Modal } from "react-bootstrap";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Carga masiva de Movimientos Banco Tesorería.
 *
 * Validación por NOMBRE/DESCRIPCIÓN usando el contexto:
 * - entidad:
 *      ingreso -> cliente
 *      egreso  -> proveedor
 * - categoria:
 *      ingreso -> categoría de ingreso
 *      egreso  -> categoría de egreso
 * - proyecto: descripcion | nombre
 * - banco: SELECCIONADO EN UI (no en el Excel)
 *
 * Columnas requeridas:
 * fecha, descripcion, monto, tipo, entidad, categoria, proyecto
 *
 * BACKEND:
 * POST /movimientos-banco-tesoreria/importar-excel
 * multipart: file, empresa_id, banco_id
 */

export default function NuevoMovimientoBancoExcel() {
  const data = useContext(Contexts.DataContext) || {};
  const {
    empresaSeleccionada,
    bancosTabla = [],
    proveedoresTabla = [],
    clientes = [],
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
    categoriasIngreso = [],
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

  const categoriasEgresoDisponibles = useMemo(
    () =>
      (
        categoriasEgresoTabla?.length
          ? categoriasEgresoTabla
          : categoriasEgreso
      ) || [],
    [categoriasEgresoTabla, categoriasEgreso]
  );


  const categoriasIngresoDisponibles = useMemo(
    () =>
      Array.isArray(categoriasIngreso)
        ? categoriasIngreso
        : [],
    [categoriasIngreso]
  );

  const norm = (s) => String(s || "").trim().toLowerCase();

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

    if (m1) {
      return s;
    }

    const m2 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);

    if (m2) {
      return `${m2[3]}-${m2[2]}-${m2[1]}`;
    }

    return null;
  };

  const toNumber = (v) => {

    if (typeof v === "number") {
      return v;
    }

    const raw =
      String(v ?? "")
        .trim()
        .replace(/\s/g, "");

    if (!raw) {
      return NaN;
    }

    // Formato argentino:
    // 150.000,50
    if (
      raw.includes(".") &&
      raw.includes(",")
    ) {

      const n =
        Number(
          raw
            .replace(/\./g, "")
            .replace(",", ".")
        );

      return Number.isFinite(n)
        ? n
        : NaN;
    }

    // Sólo coma:
    // 150000,50
    if (raw.includes(",")) {

      const n =
        Number(
          raw.replace(",", ".")
        );

      return Number.isFinite(n)
        ? n
        : NaN;
    }

    // Entero o decimal con punto:
    // 150000
    // 150000.50

    const n =
      Number(raw);

    return Number.isFinite(n)
      ? n
      : NaN;
  };

  const proveedorByName = useMemo(() => {
    const m = new Map();
    (proveedoresTabla || []).forEach(p => {
      [p.razonsocial, p.nombre, p.descripcion].forEach(k => { const key = norm(k); if (key) m.set(key, p); });
    });
    return m;
  }, [proveedoresTabla]);

  const clienteByName = useMemo(() => {
    const m = new Map();

    (clientes || []).forEach((c) => {
      [
        c.razonsocial,
        c.razon_social,
        c.nombre,
        c.descripcion,
      ].forEach((k) => {
        const key = norm(k);

        if (key) {
          m.set(key, c);
        }
      });
    });

    return m;
  }, [clientes]);

  const categoriaEgresoByName = useMemo(() => {

    const m = new Map();

    (categoriasEgresoDisponibles || [])
      .forEach((c) => {

        const key =
          norm(c.nombre);

        if (key) {
          m.set(key, c);
        }
      });

    return m;

  }, [categoriasEgresoDisponibles]);


  const categoriaIngresoByName = useMemo(() => {

    const m = new Map();

    (categoriasIngresoDisponibles || [])
      .forEach((c) => {

        const key =
          norm(c.nombre);

        if (key) {
          m.set(key, c);
        }
      });

    return m;

  }, [categoriasIngresoDisponibles]);

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

  // ============================================================
  // GRILLA COPIAR / PEGAR DESDE EXCEL
  // ============================================================

  const [gridRows, setGridRows] = useState([]);
  const [gridPasteErrors, setGridPasteErrors] = useState([]);
  const [gridErrors, setGridErrors] = useState([]);
  const [showGridConfirm, setShowGridConfirm] = useState(false);

  // ---- Plantilla XLSX con validaciones dependientes del tipo ----
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
      "entidad",      // ingreso = cliente | egreso = proveedor
      "categoria",
      "proyecto",
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

    const clientesValores = Array.from(
      new Set(
        (clientes || [])
          .map(c =>
            (
              c?.razonsocial ||
              c?.razon_social ||
              c?.nombre ||
              c?.descripcion ||
              ""
            )
              .toString()
              .trim()
          )
          .filter(Boolean)
      )
    );

    const categoriasEgresoValores = Array.from(
      new Set(
        (categoriasEgresoDisponibles || [])
          .map(
            c =>
              (c?.nombre || "")
                .toString()
                .trim()
          )
          .filter(Boolean)
      )
    );


    const categoriasIngresoValores = Array.from(
      new Set(
        (categoriasIngresoDisponibles || [])
          .map(
            c =>
              (c?.nombre || "")
                .toString()
                .trim()
          )
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

    const rangoTipos =
      putListAndGetRange(
        "A",
        "Tipo",
        tipos
      );
    putListAndGetRange(
      "B",
      "Clientes",
      clientesValores
    );

    putListAndGetRange(
      "C",
      "Proveedores",
      proveedoresValores
    );

    putListAndGetRange(
      "D",
      "CategoriasIngreso",
      categoriasIngresoValores
    );

    putListAndGetRange(
      "E",
      "CategoriasEgreso",
      categoriasEgresoValores
    );

    const rangoProyectos =
      putListAndGetRange(
        "F",
        "Proyectos",
        proyectosValores
      );

    // ============================================================
    // RANGOS NOMBRADOS PARA ENTIDAD DEPENDIENTE DEL TIPO
    // ============================================================

    if (clientesValores.length > 0) {
      wb.definedNames.add(
        `Listas!$B$2:$B$${clientesValores.length + 1}`,
        "Entidades_ingreso"
      );
    }

    if (proveedoresValores.length > 0) {
      wb.definedNames.add(
        `Listas!$C$2:$C$${proveedoresValores.length + 1}`,
        "Entidades_egreso"
      );
    }

    // ============================================================
    // RANGOS NOMBRADOS PARA CATEGORÍAS DEPENDIENTES DEL TIPO
    // ============================================================

    if (categoriasIngresoValores.length > 0) {
      wb.definedNames.add(
        `Listas!$D$2:$D$${categoriasIngresoValores.length + 1}`,
        "Categorias_ingreso"
      );
    }

    if (categoriasEgresoValores.length > 0) {
      wb.definedNames.add(
        `Listas!$E$2:$E$${categoriasEgresoValores.length + 1}`,
        "Categorias_egreso"
      );
    }

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

      // entidad -> columna E
      //
      // D = ingreso → clientes
      // D = egreso  → proveedores

      ws.getCell(`E${r}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [
          `INDIRECT("Entidades_"&LOWER($D${r}))`
        ],
        showErrorMessage: true,
        errorTitle: "Entidad inválida",
        error:
          "Seleccione primero el tipo. Para ingresos debe seleccionar un cliente y para egresos un proveedor.",
      };
      // categoria -> columna F
      // La lista depende del tipo indicado en la columna D.
      //
      // D = ingreso -> Categorias_ingreso
      // D = egreso  -> Categorias_egreso

      ws.getCell(`F${r}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [
          `INDIRECT("Categorias_"&LOWER($D${r}))`
        ],
        showErrorMessage: true,
        errorTitle: "Categoría inválida",
        error:
          "Seleccione primero el tipo de movimiento y luego una categoría correspondiente.",
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
          else if (["proveedor", "entidad"].includes(nk)) out.entidad = obj[k];
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

      rows.forEach((r, idx) => {
        const rowNumber = idx + 2; // 1 = headers
        const issues = [];

        const fechaISO = toISO(r.fecha);
        if (!fechaISO) issues.push("Fecha inválida (use YYYY-MM-DD o DD/MM/AAAA)");

        const desc = String(r.descripcion || "").trim();
        if (!desc) issues.push("Descripción requerida");

        const montoNum =
          toNumber(r.monto);
        if (!(montoNum > 0)) issues.push("Monto inválido (> 0)");

        const tipo = norm(r.tipo);
        if (!tipo) issues.push("Tipo requerido");
        else if (!["egreso", "ingreso"].includes(tipo)) {
          issues.push("Tipo debe ser 'egreso' o 'ingreso'");
        }


        const entidadName =
          norm(r.entidad);

        if (!entidadName) {

          issues.push(
            "Entidad requerida"
          );

        } else if (tipo === "ingreso") {

          const cliente =
            clienteByName.get(entidadName) ||
            null;

          if (!cliente) {

            issues.push(
              `Cliente inexistente: "${r.entidad || ""}"`
            );
          }

        } else if (tipo === "egreso") {

          const proveedor =
            proveedorByName.get(entidadName) ||
            null;

          if (!proveedor) {

            issues.push(
              `Proveedor inexistente: "${r.entidad || ""}"`
            );
          }
        }

        // La categoría de egreso solamente es obligatoria
        // cuando el movimiento importado es un EGRESO.
        const catName =
          norm(r.categoria);


        if (!catName) {

          issues.push(
            "Categoría requerida"
          );

        } else if (tipo === "egreso") {

          const cat =
            categoriaEgresoByName.get(catName) ||
            null;


          if (!cat) {

            issues.push(
              `Categoría de egreso inexistente: "${r.categoria}"`
            );

          } else if (!cat.imputacioncontable_id) {

            issues.push(
              `La categoría de egreso "${r.categoria}" no tiene imputación contable asociada`
            );
          }

        } else if (tipo === "ingreso") {

          const cat =
            categoriaIngresoByName.get(catName) ||
            null;


          if (!cat) {

            issues.push(
              `Categoría de ingreso inexistente: "${r.categoria}"`
            );
          }
        }
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
          entidad: r.entidad,
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

  // ============================================================
  // GRILLA - VALIDACIÓN
  // ============================================================

  const validarGridRows = (rows) => {

    const errs = [];

    rows.forEach((r, idx) => {

      // En la grilla no existe encabezado Excel.
      // Mostramos fila 1, 2, 3...
      const rowNumber = idx + 1;

      const issues = [];

      // --------------------------------------------------------
      // FECHA
      // --------------------------------------------------------

      const fechaISO = toISO(r.fecha);

      if (!fechaISO) {
        issues.push(
          "Fecha inválida (use YYYY-MM-DD o DD/MM/AAAA)"
        );
      }


      // --------------------------------------------------------
      // DESCRIPCIÓN
      // --------------------------------------------------------

      const desc =
        String(r.descripcion || "").trim();

      if (!desc) {
        issues.push("Descripción requerida");
      }


      // --------------------------------------------------------
      // MONTO
      // --------------------------------------------------------

      const montoNum =
        toNumber(r.monto);

      if (!(montoNum > 0)) {
        issues.push("Monto inválido (> 0)");
      }


      // --------------------------------------------------------
      // TIPO
      // --------------------------------------------------------

      const tipo =
        norm(r.tipo);

      if (!tipo) {

        issues.push("Tipo requerido");

      } else if (
        !["egreso", "ingreso"].includes(tipo)
      ) {

        issues.push(
          "Tipo debe ser 'egreso' o 'ingreso'"
        );
      }


      // --------------------------------------------------------
      // ENTIDAD
      // ingreso → cliente
      // egreso  → proveedor
      // --------------------------------------------------------

      const entidadName =
        norm(r.entidad);

      if (!entidadName) {

        issues.push(
          "Entidad requerida"
        );

      } else if (tipo === "ingreso") {

        const cliente =
          clienteByName.get(entidadName) ||
          null;

        if (!cliente) {
          issues.push(
            `Cliente inexistente: "${r.entidad || ""}"`
          );
        }

      } else if (tipo === "egreso") {

        const proveedor =
          proveedorByName.get(entidadName) ||
          null;

        if (!proveedor) {
          issues.push(
            `Proveedor inexistente: "${r.entidad || ""}"`
          );
        }
      }

      // --------------------------------------------------------
      // CATEGORÍA
      // --------------------------------------------------------

      const catName =
        norm(r.categoria);


      if (!catName) {

        issues.push(
          "Categoría requerida"
        );

      } else if (tipo === "egreso") {

        const cat =
          categoriaEgresoByName.get(catName) ||
          null;


        if (!cat) {

          issues.push(
            `Categoría de egreso inexistente: "${r.categoria || ""}"`
          );

        } else if (
          !cat.imputacioncontable_id
        ) {

          issues.push(
            `La categoría de egreso "${r.categoria}" no tiene imputación contable asociada`
          );
        }

      } else if (tipo === "ingreso") {

        const cat =
          categoriaIngresoByName.get(catName) ||
          null;


        if (!cat) {

          issues.push(
            `Categoría de ingreso inexistente: "${r.categoria || ""}"`
          );
        }
      }

      // --------------------------------------------------------
      // PROYECTO
      // --------------------------------------------------------

      const projName =
        norm(r.proyecto);

      const proy =
        projName
          ? (
            proyectoByName.get(projName) ||
            null
          )
          : null;

      if (!proy) {

        issues.push(
          `Proyecto inexistente: "${r.proyecto || ""}"`
        );
      }


      if (issues.length) {

        errs.push({
          rowNumber,
          issues,
        });
      }
    });


    return errs;
  };

  // ============================================================
  // GRILLA - PEGAR DESDE EXCEL
  // ============================================================

  const handleGridPaste = (e) => {

    e.preventDefault();

    setServerResult(null);
    setGridPasteErrors([]);


    const text =
      e.clipboardData.getData("text/plain");


    if (!text) {
      return;
    }


    /*
     * Excel copia:
     *
     * columnas -> TAB
     * filas    -> salto de línea
     */

    const lines =
      String(text)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n");


    /*
     * Excel suele agregar un salto de línea
     * al final del contenido copiado.
     */

    while (
      lines.length > 0 &&
      !lines[lines.length - 1].trim()
    ) {

      lines.pop();
    }


    const parsed = [];
    const pasteErrors = [];


    lines.forEach((line, idx) => {

      /*
       * Permitimos ignorar filas completamente vacías.
       */

      if (!line.trim()) {
        return;
      }


      const cols =
        line.split("\t");


      /*
     * La estructura debe ser EXACTAMENTE:
     *
     * 0 fecha
     * 1 descripcion
     * 2 monto
     * 3 tipo
     * 4 entidad
     * 5 categoria
     * 6 proyecto
     *
     * ingreso → entidad = cliente
     * egreso  → entidad = proveedor
     */
      if (cols.length !== 7) {

        pasteErrors.push(
          `Fila ${idx + 1}: se esperaban 7 columnas y se recibieron ${cols.length}.`
        );

        return;
      }


      const montoOriginal =
        String(cols[2] || "").trim();

      const montoNumerico =
        toNumber(montoOriginal);

      parsed.push({
        fecha:
          String(cols[0] || "").trim(),

        descripcion:
          String(cols[1] || "").trim(),

        // El signo no determina el tipo de movimiento.
        // ingreso / egreso se determina por la columna "tipo".
        monto:
          Number.isFinite(montoNumerico)
            ? Math.abs(montoNumerico)
            : montoOriginal,

        tipo:
          String(cols[3] || "")
            .trim()
            .toLowerCase(),

        entidad:
          String(cols[4] || "").trim(),

        categoria:
          String(cols[5] || "").trim(),

        proyecto:
          String(cols[6] || "").trim(),
      });
    });


    /*
     * Si la estructura del pegado está mal,
     * NO cargamos parcialmente la grilla.
     */

    if (pasteErrors.length) {

      setGridPasteErrors(
        pasteErrors
      );

      return;
    }


    if (!parsed.length) {

      setGridPasteErrors([
        "No se encontraron filas para importar.",
      ]);

      return;
    }


    /*
     * Reemplazamos el contenido anterior de la grilla
     * por lo recién pegado.
     */

    setGridRows(parsed);


    /*
     * Ejecutamos las mismas validaciones visuales.
     */

    setGridErrors(
      validarGridRows(parsed)
    );
  };

  // ============================================================
  // GRILLA - EDITAR CELDA
  // ============================================================

  const handleGridChange = (
    index,
    field,
    value
  ) => {

    const updated =
      gridRows.map(
        (row, idx) => {

          if (idx !== index) {
            return row;
          }


          // Si cambia ingreso <-> egreso,
          // limpiamos entidad y categoría porque
          // pertenecen a catálogos diferentes.

          if (
            field === "tipo" &&
            value !== row.tipo
          ) {

            return {
              ...row,
              tipo: value,
              entidad: "",
              categoria: "",
            };
          }


          return {
            ...row,
            [field]: value,
          };
        }
      );


    setGridRows(updated);

    setGridErrors(
      validarGridRows(updated)
    );
  };
  // ============================================================
  // GRILLA - ELIMINAR FILA
  // ============================================================

  const handleGridDeleteRow = (
    index
  ) => {

    const updated =
      gridRows.filter(
        (_, idx) =>
          idx !== index
      );


    setGridRows(updated);

    setGridErrors(
      validarGridRows(updated)
    );
  };

  // ============================================================
  // GRILLA - ENVIAR AL BACKEND
  // ============================================================

  const handleGridUpload = async () => {

    if (
      !empresa_id ||
      !bancoIdUI ||
      gridRows.length === 0 ||
      gridErrors.length > 0
    ) {
      return;
    }


    setUploading(true);
    setServerResult(null);


    try {

      const res =
        await fetch(
          `${apiUrl}/movimientos-banco-tesoreria/importar-grilla`,
          {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              empresa_id:
                Number(empresa_id),

              banco_id:
                Number(bancoIdUI),

              movimientos:
                gridRows.map(
                  (r) => ({
                    fecha:
                      r.fecha,

                    descripcion:
                      r.descripcion,

                    monto:
                      r.monto,

                    tipo:
                      r.tipo,

                    entidad:
                      r.entidad,

                    categoria:
                      r.categoria,

                    proyecto:
                      r.proyecto,
                  })
                ),
            }),
          }
        );


      const json =
        await res.json();


      if (!res.ok) {

        setServerResult(json);

        return;
      }


      setServerResult(json);


      /*
       * Si salió bien limpiamos la grilla para evitar
       * volver a registrar accidentalmente las mismas filas.
       */

      setGridRows([]);
      setGridErrors([]);
      setGridPasteErrors([]);


    } catch (err) {

      setServerResult({
        error:
          err.message ||
          "Error inesperado al importar la grilla",
      });

    } finally {

      setUploading(false);
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

      if (!res.ok) {

        setServerResult(json);

        return;
      }

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
        <div>
          <strong>
            IMPORTAR MOVIMIENTOS BANCARIOS
          </strong>
        </div>
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
          <div className="mb-2">
            <strong>Columnas requeridas en el Excel:</strong>{" "}
            fecha, descripcion, monto, tipo, entidad, categoria, proyecto.
          </div>
          <ul className="mb-0">
            <li><em>tipo</em>: desplegable (ingreso/egreso) en la plantilla.</li>
            <li>
              <em>entidad</em>: depende del tipo de movimiento. Para ingresos
              muestra clientes y para egresos muestra proveedores.
            </li>
            <li>
              <em>categoría</em>: obligatoria. Para egresos debe existir en
              categorías de egreso y tener imputación contable asociada.
              Para ingresos debe existir en categorías de ingreso.
            </li>
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
                  <th>Entidad</th>
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
                    <td>{r.entidad}</td>
                    <td>{r.categoria}</td>
                    <td>{r.proyecto}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {/* ============================================================
    IMPORTACIÓN POR COPIAR / PEGAR
============================================================ */}

        <Card className="mt-4">

          <Card.Header>
            <strong>
              Importar movimientos copiando desde Excel
            </strong>
          </Card.Header>


          <Card.Body>

            <Alert variant="info">

              Copie desde Excel exactamente estas 7 columnas,
              en este orden:

              <div className="mt-2">
                <strong>
                  fecha | descripcion | monto | tipo | entidad | categoria | proyecto
                </strong>
              </div>

              <div className="mt-2">
                El banco no debe copiarse. Se utilizará el banco
                seleccionado arriba para todas las filas.
              </div>

              <div className="mt-1">
                La entidad y la categoría dependen del tipo de movimiento.
                Para ingresos, la entidad debe ser un cliente y se utilizarán
                categorías de ingreso. Para egresos, la entidad debe ser un
                proveedor y se utilizarán categorías de egreso.
              </div>

            </Alert>


            <Form.Group className="mb-3">

              <Form.Label>
                Pegar datos desde Excel
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                placeholder={
                  "Haga clic aquí y presione Ctrl+V después de copiar las 7 columnas desde Excel"
                }
                onPaste={handleGridPaste}
                disabled={
                  !empresa_id ||
                  uploading ||
                  parsing
                }
              />

              <Form.Text muted>
                Cada fila pegada se convertirá en una fila editable
                de la grilla.
              </Form.Text>

            </Form.Group>


            {/* ERRORES DE ESTRUCTURA DEL PEGADO */}

            {gridPasteErrors.length > 0 && (

              <Alert variant="danger">

                <strong>
                  No se pudo cargar el contenido pegado.
                </strong>

                <div className="mt-2">

                  {gridPasteErrors.map(
                    (error, index) => (

                      <div key={index}>
                        {error}
                      </div>

                    )
                  )}

                </div>

              </Alert>

            )}


            {/* ========================================================
        GRILLA
    ======================================================== */}

            {gridRows.length > 0 && (

              <>

                <div className="mb-2">

                  <strong>
                    Filas cargadas: {gridRows.length}
                  </strong>

                  {" — "}

                  {gridErrors.length === 0 ? (

                    <span className="text-success">
                      Todas las filas son válidas
                    </span>

                  ) : (

                    <span className="text-danger">
                      {gridErrors.length} fila(s) con errores
                    </span>

                  )}

                </div>


                <div
                  style={{
                    overflowX: "auto",
                    maxHeight: "500px",
                    overflowY: "auto",
                  }}
                >

                  <Table
                    bordered
                    hover
                    size="sm"
                    className="align-middle"
                  >

                    <thead>

                      <tr>

                        <th style={{ minWidth: 55 }}>
                          #
                        </th>

                        <th style={{ minWidth: 130 }}>
                          Fecha
                        </th>

                        <th style={{ minWidth: 250 }}>
                          Descripción
                        </th>

                        <th style={{ minWidth: 120 }}>
                          Monto
                        </th>

                        <th style={{ minWidth: 120 }}>
                          Tipo
                        </th>

                        <th style={{ minWidth: 220 }}>
                          Entidad
                        </th>

                        <th style={{ minWidth: 220 }}>
                          Categoría
                        </th>

                        <th style={{ minWidth: 220 }}>
                          Proyecto
                        </th>

                        <th style={{ minWidth: 90 }}>
                          Acción
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {gridRows.map(
                        (row, index) => {

                          const rowError =
                            gridErrors.find(
                              e =>
                                e.rowNumber ===
                                index + 1
                            );


                          return (

                            <React.Fragment key={index}>

                              <tr
                                className={
                                  rowError
                                    ? "table-danger"
                                    : ""
                                }
                              >

                                {/* NÚMERO */}

                                <td>
                                  {index + 1}
                                </td>


                                {/* FECHA */}

                                <td>

                                  <Form.Control
                                    size="sm"
                                    type="text"
                                    value={row.fecha}
                                    placeholder="DD/MM/AAAA"
                                    onChange={(e) =>
                                      handleGridChange(
                                        index,
                                        "fecha",
                                        e.target.value
                                      )
                                    }
                                  />

                                </td>


                                {/* DESCRIPCIÓN */}

                                <td>

                                  <Form.Control
                                    size="sm"
                                    type="text"
                                    value={row.descripcion}
                                    onChange={(e) =>
                                      handleGridChange(
                                        index,
                                        "descripcion",
                                        e.target.value
                                      )
                                    }
                                  />

                                </td>


                                {/* MONTO */}

                                <td>

                                  <Form.Control
                                    size="sm"
                                    type="text"
                                    value={row.monto}
                                    onChange={(e) =>
                                      handleGridChange(
                                        index,
                                        "monto",
                                        e.target.value
                                      )
                                    }
                                  />

                                </td>


                                {/* TIPO */}

                                <td>

                                  <Form.Select
                                    size="sm"
                                    value={row.tipo}
                                    onChange={(e) =>
                                      handleGridChange(
                                        index,
                                        "tipo",
                                        e.target.value
                                      )
                                    }
                                  >

                                    <option value="">
                                      Seleccione
                                    </option>

                                    <option value="ingreso">
                                      ingreso
                                    </option>

                                    <option value="egreso">
                                      egreso
                                    </option>

                                  </Form.Select>

                                </td>


                                {/* ENTIDAD */}

                                <td>

                                  <Form.Select
                                    size="sm"
                                    value={row.entidad || ""}
                                    disabled={!row.tipo}
                                    onChange={(e) =>
                                      handleGridChange(
                                        index,
                                        "entidad",
                                        e.target.value
                                      )
                                    }
                                  >

                                    <option value="">
                                      {row.tipo === "ingreso"
                                        ? "Seleccione cliente"
                                        : row.tipo === "egreso"
                                          ? "Seleccione proveedor"
                                          : "Seleccione primero el tipo"}
                                    </option>

                                    {(
                                      row.tipo === "ingreso"
                                        ? clientes
                                        : row.tipo === "egreso"
                                          ? proveedoresTabla
                                          : []
                                    ).map((entidad) => {

                                      const nombre =
                                        entidad?.razonsocial ||
                                        entidad?.razon_social ||
                                        entidad?.nombre ||
                                        entidad?.descripcion ||
                                        "";

                                      return (

                                        <option
                                          key={entidad.id}
                                          value={nombre}
                                        >
                                          {nombre}
                                        </option>

                                      );
                                    })}

                                  </Form.Select>

                                </td>


                                {/* CATEGORÍA */}

                                <td>
                                  <Form.Select
                                    size="sm"
                                    value={row.categoria}
                                    disabled={!row.tipo}
                                    onChange={(e) =>
                                      handleGridChange(
                                        index,
                                        "categoria",
                                        e.target.value
                                      )
                                    }
                                  >

                                    <option value="">
                                      {row.tipo === "ingreso"
                                        ? "Seleccione categoría de ingreso"
                                        : row.tipo === "egreso"
                                          ? "Seleccione categoría de egreso"
                                          : "Seleccione primero el tipo"}
                                    </option>


                                    {(
                                      row.tipo === "ingreso"
                                        ? categoriasIngresoDisponibles
                                        : row.tipo === "egreso"
                                          ? categoriasEgresoDisponibles
                                          : []
                                    ).map(
                                      (c) => (

                                        <option
                                          key={c.id}
                                          value={c.nombre}
                                        >
                                          {c.nombre}
                                        </option>

                                      )
                                    )}

                                  </Form.Select>

                                </td>


                                {/* PROYECTO */}

                                <td>

                                  <Form.Select
                                    size="sm"
                                    value={row.proyecto}
                                    onChange={(e) =>
                                      handleGridChange(
                                        index,
                                        "proyecto",
                                        e.target.value
                                      )
                                    }
                                  >

                                    <option value="">
                                      Seleccione
                                    </option>

                                    {proyectosTabla.map(
                                      (p) => {

                                        const nombre =
                                          p?.descripcion ||
                                          p?.nombre ||
                                          "";

                                        return (

                                          <option
                                            key={p.id}
                                            value={nombre}
                                          >
                                            {nombre}
                                          </option>

                                        );
                                      }
                                    )}

                                  </Form.Select>

                                </td>


                                {/* ELIMINAR */}

                                <td className="text-center">

                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      handleGridDeleteRow(
                                        index
                                      )
                                    }
                                  >
                                    Eliminar
                                  </Button>

                                </td>

                              </tr>


                              {/* ERRORES DE ESTA FILA */}

                              {rowError && (

                                <tr className="table-danger">

                                  <td />

                                  <td colSpan={8}>

                                    <small>

                                      <strong>
                                        Errores:
                                      </strong>{" "}

                                      {rowError.issues.join(
                                        " | "
                                      )}

                                    </small>

                                  </td>

                                </tr>

                              )}

                            </React.Fragment>

                          );
                        }
                      )}

                    </tbody>

                  </Table>

                </div>


                {/* BOTONES */}

                <div
                  className="d-flex justify-content-between mt-3"
                >

                  <Button
                    variant="outline-secondary"
                    disabled={uploading}
                    onClick={() => {

                      setGridRows([]);
                      setGridErrors([]);
                      setGridPasteErrors([]);
                      setServerResult(null);

                    }}
                  >
                    Limpiar grilla
                  </Button>


                  <Button
                    variant="success"
                    disabled={
                      uploading ||
                      !empresa_id ||
                      !bancoIdUI ||
                      gridRows.length === 0 ||
                      gridErrors.length > 0
                    }
                    onClick={() =>
                      setShowGridConfirm(true)
                    }
                  >
                    Grabar {gridRows.length} movimientos
                  </Button>

                </div>

              </>

            )}

          </Card.Body>

        </Card>


        {serverResult && (
          <Alert
            variant={serverResult.error ? "danger" : "success"}
            className="mt-3"
          >
            {serverResult.error ? (
              <>
                <div>
                  <strong>Error:</strong>{" "}
                  {serverResult.error}
                </div>

                {serverResult.detalle && (
                  <div className="mt-1">
                    {serverResult.detalle}
                  </div>
                )}

                {Array.isArray(serverResult.detalles) &&
                  serverResult.detalles.length > 0 && (
                    <div className="mt-2">
                      {serverResult.detalles.map((item, index) => (
                        <div key={index}>
                          <strong>
                            Fila {item.fila}:
                          </strong>{" "}
                          {Array.isArray(item.errores)
                            ? item.errores.join(" | ")
                            : String(item.errores || "")}
                        </div>
                      ))}
                    </div>
                  )}
              </>
            ) : (
              <>
                <div>
                  <strong>
                    Importación realizada correctamente.
                  </strong>
                </div>

                <div>
                  Movimientos creados:{" "}
                  <strong>
                    {serverResult.creados ?? 0}
                  </strong>
                </div>
              </>
            )}
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

        {/* ============================================================
    CONFIRMACIÓN IMPORTACIÓN DESDE GRILLA
============================================================ */}

        <Modal
          show={showGridConfirm}
          onHide={() =>
            setShowGridConfirm(false)
          }
          centered
        >

          <Modal.Header closeButton>

            <Modal.Title>
              Confirmar importación desde grilla
            </Modal.Title>

          </Modal.Header>


          <Modal.Body>

            Vas a grabar{" "}

            <strong>
              {gridRows.length}
            </strong>{" "}

            movimientos bancarios.


            <div className="mt-2">

              <strong>
                Banco:
              </strong>{" "}

              {(() => {

                const b =
                  (bancosEmpresa || [])
                    .find(
                      x =>
                        String(x.id) ===
                        String(bancoIdUI)
                    );

                return b
                  ? (
                    b.nombre ||
                    b.descripcion ||
                    b.alias ||
                    `Banco ${b.id}`
                  )
                  : "-";

              })()}

            </div>


            {gridErrors.length > 0 && (

              <Alert
                variant="danger"
                className="mt-3 mb-0"
              >

                Hay filas con errores.
                Corregilas antes de continuar.

              </Alert>

            )}


            <Alert
              variant="warning"
              className="mt-3 mb-0"
            >

              Se crearán únicamente movimientos bancarios
              para conciliación. Esta operación no generará
              órdenes de pago, cobranzas ni movimientos
              auxiliares.

            </Alert>

          </Modal.Body>


          <Modal.Footer>

            <Button
              variant="outline-secondary"
              disabled={uploading}
              onClick={() =>
                setShowGridConfirm(false)
              }
            >
              Cancelar
            </Button>


            <Button
              variant="primary"
              disabled={
                uploading ||
                gridErrors.length > 0 ||
                gridRows.length === 0
              }
              onClick={() => {

                setShowGridConfirm(false);

                handleGridUpload();

              }}
            >

              {uploading ? (

                <>

                  <Spinner
                    size="sm"
                    animation="border"
                    className="me-2"
                  />

                  Enviando…

                </>

              ) : (

                `Confirmar y grabar ${gridRows.length}`

              )}

            </Button>

          </Modal.Footer>

        </Modal>



      </Card.Body>
    </Card >
  );
}
