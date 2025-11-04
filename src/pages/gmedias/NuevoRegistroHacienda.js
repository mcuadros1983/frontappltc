// src/components/hacienda/NuevoRegistroHacienda.js
import { useEffect, useMemo, useState, useContext } from "react";
import { Modal, Button, Table, Form, Alert, Row, Col } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import "../../components/css/modal-overrides.css";

const apiUrl = process.env.REACT_APP_API_URL;

// ===== Helpers
const evalExpr = (val) => {
  const s = String(val ?? "").trim();
  if (!s) return 0;
  const cleaned = s.replace(/,/g, ".").replace(/[^0-9+\-*/(). \t]/g, "");
  if (!cleaned) return 0;
  try {
    // eslint-disable-next-line no-new-func
    const out = Function(`"use strict"; return (${cleaned});`)();
    const num = Number(out);
    return Number.isFinite(num) ? num : 0;
  } catch {
    return 0;
  }
};
const fmt2 = (n) => {
  const v = Number(n);
  return Number.isFinite(v)
    ? v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0,00";
};
const fmt0 = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString("es-AR", { maximumFractionDigits: 0 }) : "0";
};

export default function NuevoRegistroHacienda({
  show,
  onHide,
  onCreated,
  mode = "create",      // "create" | "edit"
  initialItem = null,   // cuando mode === "edit"
}) {
  const data = useContext(Contexts.DataContext);
  const {
    proveedoresTabla = [],
    empresasTabla = [],
    frigorificoTabla = [],
    categoriaAnimalTabla = [],
  } = data || {};

  const today = () => new Date().toISOString().slice(0, 10);

  // ===== Header (solo para create -> POST /hacienda)
  const [fecha, setFecha] = useState(today());
  const [comprobante_id, setComprobanteId] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // ===== Ítem editable (fila "excel")
  const [tropa, setTropa] = useState("");
  const [categoriaanimal_id, setCategoriaAnimalId] = useState("");
  const [proveedorItemId, setProveedorItemId] = useState("");
  const [frigorifico_id, setFrigorificoId] = useState("");
  const [empresa_id, setEmpresaId] = useState("");
  const [cantidadanimales, setCantidadAnimales] = useState("");

  const [pesonetoTxt, setPesonetoTxt] = useState("");
  const [preciokgvivoTxt, setPrecioKgVivoTxt] = useState("");
  const [fleteTxt, setFleteTxt] = useState("");
  const [comsionTxt, setComsionTxt] = useState("");
  const [viaticosTxt, setViaticosTxt] = useState("");
  const [imptoalchequeTxt, setImptoalchequeTxt] = useState("");
  const [gastosfaenaTxt, setGastosfaenaTxt] = useState("");
  const [kgsromaneoTxt, setKgsRomaneoTxt] = useState("");
  const [preciokgcarneTxt, setPrecioKgCarneTxt] = useState(""); // editable/manual

  // ===== Borrador de ítems (lista temporal antes de GRABAR)
  const [itemsDraft, setItemsDraft] = useState([]);

  const [msg, setMsg] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // ===== Númericos (evaluados)
  const pesoneto = useMemo(() => evalExpr(pesonetoTxt), [pesonetoTxt]);
  const preciokgvivo = useMemo(() => evalExpr(preciokgvivoTxt), [preciokgvivoTxt]);
  const flete = useMemo(() => evalExpr(fleteTxt), [fleteTxt]);
  const comsion = useMemo(() => evalExpr(comsionTxt), [comsionTxt]);
  const viaticos = useMemo(() => evalExpr(viaticosTxt), [viaticosTxt]);
  const imptoalcheque = useMemo(() => evalExpr(imptoalchequeTxt), [imptoalchequeTxt]);
  const gastosfaena = useMemo(() => evalExpr(gastosfaenaTxt), [gastosfaenaTxt]);
  const kgsromaneo = useMemo(() => evalExpr(kgsromaneoTxt), [kgsromaneoTxt]);
  const preciokgcarneManual = useMemo(() => evalExpr(preciokgcarneTxt), [preciokgcarneTxt]);

  // ===== Auto-cálculos
  const importeneto = useMemo(() => pesoneto * preciokgvivo, [pesoneto, preciokgvivo]);
  const montototal = useMemo(
    () => importeneto + flete + comsion + viaticos + imptoalcheque + gastosfaena,
    [importeneto, flete, comsion, viaticos, imptoalcheque, gastosfaena]
  );
  const rendimiento = useMemo(
    () => (pesoneto > 0 ? (kgsromaneo / pesoneto) * 100 : null),
    [kgsromaneo, pesoneto]
  );
  const preciokgcarneAuto = useMemo(
    () => (kgsromaneo > 0 ? montototal / kgsromaneo : 0),
    [montototal, kgsromaneo]
  );
  const preciokgcarne = useMemo(
    () => (String(preciokgcarneTxt).trim() !== "" ? preciokgcarneManual : preciokgcarneAuto),
    [preciokgcarneTxt, preciokgcarneManual, preciokgcarneAuto]
  );

  // ===== Helpers de selects + labels seleccionados
  const optProveedor = (p) => p.razonsocial || p.nombre || p.descripcion || `Proveedor #${p.id}`;
  const optEmpresa = (e) => e.descripcion || e.nombre || e.fantasia || `Empresa #${e.id}`;
  const optFrigorifico = (f) => f.nombre || f.descripcion || `Frigorífico #${f.id}`;
  const optCategoriaAnimal = (c) => c.descripcion || c.nombre || c.alias || `Categoría #${c.id}`;

  const selProveedor = useMemo(
    () => proveedoresTabla.find((p) => Number(p.id) === Number(proveedorItemId)) || null,
    [proveedoresTabla, proveedorItemId]
  );
  const selFrigorifico = useMemo(
    () => frigorificoTabla.find((f) => Number(f.id) === Number(frigorifico_id)) || null,
    [frigorificoTabla, frigorifico_id]
  );
  const selEmpresa = useMemo(
    () => empresasTabla.find((e) => Number(e.id) === Number(empresa_id)) || null,
    [empresasTabla, empresa_id]
  );
  const selCategoria = useMemo(
    () => categoriaAnimalTabla.find((c) => Number(c.id) === Number(categoriaanimal_id)) || null,
    [categoriaAnimalTabla, categoriaanimal_id]
  );

  // ===== Precarga para edición
  useEffect(() => {
    if (!show) return;
    if (mode !== "edit" || !initialItem) return;

    const r = initialItem;
    setFecha(r.fecha || today());
    setTropa(r.tropa || "");
    setCategoriaAnimalId(r.categoriaanimal_id != null ? String(r.categoriaanimal_id) : "");
    setProveedorItemId(r.proveedor_id != null ? String(r.proveedor_id) : "");
    setFrigorificoId(r.frigorifico_id != null ? String(r.frigorifico_id) : "");
    setEmpresaId(r.empresa_id != null ? String(r.empresa_id) : "");
    setCantidadAnimales(r.cantidadanimales != null ? String(r.cantidadanimales) : "");

    setPesonetoTxt(r.pesoneto != null ? String(r.pesoneto) : "");
    setPrecioKgVivoTxt(r.preciokgvivo != null ? String(r.preciokgvivo) : "");
    setFleteTxt(r.flete != null ? String(r.flete) : "");
    setComsionTxt(r.comsion != null ? String(r.comsion) : "");
    setViaticosTxt(r.viaticos != null ? String(r.viaticos) : "");
    setImptoalchequeTxt(r.imptoalcheque != null ? String(r.imptoalcheque) : "");
    setGastosfaenaTxt(r.gastosfaena != null ? String(r.gastosfaena) : "");
    setKgsRomaneoTxt(r.kgsromaneo != null ? String(r.kgsromaneo) : "");

    const auto = r.kgsromaneo > 0 ? Number(r.montototal || 0) / Number(r.kgsromaneo) : 0;
    const saved = Number(r.preciokgcarne ?? 0);
    const diff = Math.abs(saved - auto);
    if (saved && diff > 0.005) setPrecioKgCarneTxt(String(saved));
    else setPrecioKgCarneTxt("");

    setComprobanteId("");
    setObservaciones("");
    setItemsDraft([]); // en edición no usamos lista
  }, [show, mode, initialItem]);

  // ===== Validaciones
  const rowValida = useMemo(() => {
    if (!fecha) return false;
    if (!tropa?.trim()) return false;
    if (!categoriaanimal_id) return false;
    if (!proveedorItemId) return false;
    if (!frigorifico_id) return false;
    if (!empresa_id) return false;
    if (!(Number(cantidadanimales) > 0)) return false;
    if (!(pesoneto > 0)) return false;
    if (!(preciokgvivo > 0)) return false;
    return true;
  }, [
    fecha, tropa, categoriaanimal_id, proveedorItemId, frigorifico_id, empresa_id,
    cantidadanimales, pesoneto, preciokgvivo
  ]);

  const puedeGrabar = useMemo(() => {
    if (mode === "edit") return rowValida;               // edita 1 registro
    return itemsDraft.length > 0;                        // crea varios ítems
  }, [mode, rowValida, itemsDraft.length]);

  useEffect(() => { if (show) setMsg(null); }, [show]);

  // ===== Arma un ítem a partir del estado actual
  const buildItemFromState = () => ({
    fecha,
    tropa: tropa.trim(),
    categoriaanimal_id: Number(categoriaanimal_id),
    proveedor_id: Number(proveedorItemId),
    frigorifico_id: Number(frigorifico_id),
    empresa_id: Number(empresa_id),
    cantidadanimales: Number(cantidadanimales),
    pesoneto: Number(pesoneto.toFixed(2)),
    preciokgvivo: Number(preciokgvivo.toFixed(2)),
    importeneto: Number(importeneto.toFixed(2)),
    flete: Number(flete.toFixed(2)),
    comsion: Number(comsion.toFixed(2)),
    viaticos: Number(viaticos.toFixed(2)),
    imptoalcheque: Number(imptoalcheque.toFixed(2)),
    gastosfaena: Number(gastosfaena.toFixed(2)),
    montototal: Number(montototal.toFixed(2)),
    kgsromaneo: Number(kgsromaneo.toFixed(2)),
    rendimiento: rendimiento != null ? Number(rendimiento.toFixed(2)) : null,
    preciokgcarne: Number(preciokgcarne.toFixed(2)),
  });

  // ===== Acciones draft
  const handleAddItem = () => {
    if (!rowValida) {
      setMsg({ type: "warning", text: "Completá los campos del ítem antes de agregar." });
      return;
    }
    const item = buildItemFromState();
    setItemsDraft((prev) => [...prev, item]);

    // Limpieza parcial: dejo proveedor/empresa/frigorífico como atajo para cargar varias categorías
    setTropa("");
    setCategoriaAnimalId("");
    setCantidadAnimales("");
    setPesonetoTxt("");
    setPrecioKgVivoTxt("");
    setFleteTxt("");
    setComsionTxt("");
    setViaticosTxt("");
    setImptoalchequeTxt("");
    setGastosfaenaTxt("");
    setKgsRomaneoTxt("");
    setPrecioKgCarneTxt("");
    setFrigorificoId("");
    setEmpresaId("");
    setCantidadAnimales("");
  };

  const handleRemoveDraft = (idx) => {
    setItemsDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalDraft = useMemo(
    () => itemsDraft.reduce((a, b) => a + Number(b.montototal || 0), 0),
    [itemsDraft]
  );

  const limpiarTodo = () => {
    setFecha(today());
    setComprobanteId("");
    setObservaciones("");
    setTropa("");
    setCategoriaAnimalId("");
    setProveedorItemId("");
    setFrigorificoId("");
    setEmpresaId("");
    setCantidadAnimales("");
    setPesonetoTxt("");
    setPrecioKgVivoTxt("");
    setFleteTxt("");
    setComsionTxt("");
    setViaticosTxt("");
    setImptoalchequeTxt("");
    setGastosfaenaTxt("");
    setKgsRomaneoTxt("");
    setPrecioKgCarneTxt("");
    setItemsDraft([]);
    setMsg(null);
  };

  const handleClose = () => { if (!enviando) { limpiarTodo(); onHide?.(); } };

  // ===== Submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMsg(null);

    try {
      setEnviando(true);

      if (mode === "edit" && initialItem?.id) {
        if (!rowValida) {
          setMsg({ type: "warning", text: "Completá los campos requeridos." });
          setEnviando(false);
          return;
        }
        const payloadUpdate = { ...buildItemFromState(), hacienda_id: initialItem.hacienda_id ?? undefined };
        const res = await fetch(`${apiUrl}/registrohacienda/${initialItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payloadUpdate),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo actualizar el registro");
        onCreated?.(json);
        limpiarTodo();
        onHide?.();
        return;
      }

      // ==== CREATE con múltiples ítems
      if (itemsDraft.length === 0) {
        setMsg({ type: "warning", text: "Agregá al menos un ítem antes de grabar." });
        setEnviando(false);
        return;
      }

      // Header proveedor: tomamos el del primer ítem (todos deberían compartirlo)
      const proveedorHeader = Number(itemsDraft[0].proveedor_id);

      const payloadCreate = {
        fecha,
        proveedor_id: proveedorHeader,
        comprobante_id: comprobante_id ? Number(comprobante_id) : null,
        observaciones: observaciones?.trim() || null,
        items: itemsDraft,
      };

      const res = await fetch(`${apiUrl}/hacienda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payloadCreate),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo crear la Hacienda");

      onCreated?.(json);
      limpiarTodo();
      onHide?.();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      fullscreen
      scrollable
      dialogClassName="modal-xxl-fluid"
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>
            {mode === "edit"
              ? `Editar Registro de Hacienda${initialItem?.id ? ` #${initialItem.id}` : ""}`
              : "Nuevo Registro de Hacienda"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {msg && (
            <Alert variant={msg.type} className="py-2" onClose={() => setMsg(null)} dismissible>
              {msg.text}
            </Alert>
          )}

          {/* Header */}
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
              <small className="text-muted d-block mt-1">{fecha || ""}</small>
            </Col>

            {/* {mode === "create" && (
              <Col md={8}>
                <Form.Label>Comprobante (opcional)</Form.Label>
                <Form.Control
                  type="number"
                  value={comprobante_id}
                  onChange={(e) => setComprobanteId(e.target.value)}
                  placeholder="Número / ID"
                />
                <small className="text-muted d-block mt-1">{comprobante_id || ""}</small>
              </Col>
            )} */}
          </Row>

          {mode === "create" && (
            <Form.Group className="mb-3">
              <Form.Label>Observaciones (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas generales de la operación"
              />
              <small className="text-muted d-block mt-1">{observaciones || ""}</small>
            </Form.Group>
          )}

          <div className="mb-2 text-muted">
            Podés usar operaciones como <code>100*2</code>, <code>2500/3</code>, <code>(10+5)*1.21</code>.
            Las columnas <strong>Importe Neto</strong>, <strong>Monto Total</strong>,
            <strong> Precio Kg Carne</strong> (si no lo escribís) y <strong>Rendimiento</strong> se calculan automáticamente.
          </div>

          {/* ===== Fila de carga (excel-like) ===== */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Ítem</h6>
            {mode === "create" && (
              <Button
                type="button"
                size="sm"
                variant="outline-success"
                onClick={handleAddItem}
                disabled={!rowValida}
                title={!rowValida ? "Completá el ítem para poder agregarlo" : "Agregar ítem"}
              >
                Agregar ítem
              </Button>
            )}
          </div>

          <Table bordered responsive>
            <thead>
              <tr>
                <th>Tropa</th>
                <th>Cat. Animal</th>
                <th>Proveedor (Ítem)</th>
                <th>Frigorífico</th>
                <th>Titular (Empresa)</th>
                <th>Cant. Anim.</th>
                <th>Peso Neto</th>
                <th>Precio Kg Vivo</th>
                <th>Importe Neto</th>
                <th>Flete</th>
                <th>Comisión</th>
                <th>Viáticos</th>
                <th>Imp. Cheque</th>
                <th>Gastos Faena</th>
                <th>Monto Total</th>
                <th>Kgs Romaneo</th>
                <th>Precio Kg Carne</th>
                <th>Rendimiento %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Tropa */}
                <td>
                  <Form.Control value={tropa} onChange={(e) => setTropa(e.target.value)} required={mode === "edit"} />
                  <small className="text-muted d-block text-end">{tropa || ""}</small>
                </td>

                {/* Cat. Animal */}
                <td>
                  <Form.Select
                    value={categoriaanimal_id}
                    onChange={(e) => setCategoriaAnimalId(e.target.value)}
                    required={mode === "edit"}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione…</option>
                    {categoriaAnimalTabla.map((c) => (
                      <option key={c.id} value={c.id}>
                        {optCategoriaAnimal(c)}
                      </option>
                    ))}
                  </Form.Select>
                  <small className="text-muted d-block text-end">
                    {selCategoria ? optCategoriaAnimal(selCategoria) : ""}
                  </small>
                </td>

                {/* Proveedor */}
                <td>
                  <Form.Select
                    value={proveedorItemId}
                    onChange={(e) => setProveedorItemId(e.target.value)}
                    required={mode === "edit"}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione…</option>
                    {proveedoresTabla.map((p) => (
                      <option key={p.id} value={p.id}>{optProveedor(p)}</option>
                    ))}
                  </Form.Select>
                  <small className="text-muted d-block text-end">
                    {selProveedor ? optProveedor(selProveedor) : ""}
                  </small>
                </td>

                {/* Frigorífico */}
                <td>
                  <Form.Select
                    value={frigorifico_id}
                    onChange={(e) => setFrigorificoId(e.target.value)}
                    required={mode === "edit"}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione…</option>
                    {frigorificoTabla.map((f) => (
                      <option key={f.id} value={f.id}>{optFrigorifico(f)}</option>
                    ))}
                  </Form.Select>
                  <small className="text-muted d-block text-end">
                    {selFrigorifico ? optFrigorifico(selFrigorifico) : ""}
                  </small>
                </td>

                {/* Empresa */}
                <td>
                  <Form.Select
                    value={empresa_id}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    required={mode === "edit"}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione…</option>
                    {empresasTabla.map((e) => (
                      <option key={e.id} value={e.id}>{optEmpresa(e)}</option>
                    ))}
                  </Form.Select>
                  <small className="text-muted d-block text-end">
                    {selEmpresa ? optEmpresa(selEmpresa) : ""}
                  </small>
                </td>

                {/* Cant. Anim. */}
                <td>
                  <Form.Control
                    type="number"
                    value={cantidadanimales}
                    onChange={(e) => setCantidadAnimales(e.target.value)}
                    required={mode === "edit"}
                  />
                  <small className="text-muted d-block text-end">{fmt0(cantidadanimales)}</small>
                </td>

                {/* Peso Neto */}
                <td>
                  <Form.Control value={pesonetoTxt} onChange={(e) => setPesonetoTxt(e.target.value)} placeholder="e.g., 12000*0.95" />
                  <small className="text-muted d-block text-end">{fmt2(pesoneto)}</small>
                </td>

                {/* Precio Kg Vivo */}
                <td>
                  <Form.Control value={preciokgvivoTxt} onChange={(e) => setPrecioKgVivoTxt(e.target.value)} placeholder="e.g., 1500/1.21" />
                  <small className="text-muted d-block text-end">{fmt2(preciokgvivo)}</small>
                </td>

                {/* Importe Neto (auto) */}
                <td className="text-end align-middle">
                  <strong>{fmt2(importeneto)}</strong>
                  <small className="text-muted d-block">{fmt2(importeneto)}</small>
                </td>

                {/* Flete */}
                <td>
                  <Form.Control value={fleteTxt} onChange={(e) => setFleteTxt(e.target.value)} />
                  <small className="text-muted d-block text-end">{fmt2(flete)}</small>
                </td>

                {/* Comisión */}
                <td>
                  <Form.Control value={comsionTxt} onChange={(e) => setComsionTxt(e.target.value)} />
                  <small className="text-muted d-block text-end">{fmt2(comsion)}</small>
                </td>

                {/* Viáticos */}
                <td>
                  <Form.Control value={viaticosTxt} onChange={(e) => setViaticosTxt(e.target.value)} />
                  <small className="text-muted d-block text-end">{fmt2(viaticos)}</small>
                </td>

                {/* Imp. Cheque */}
                <td>
                  <Form.Control value={imptoalchequeTxt} onChange={(e) => setImptoalchequeTxt(e.target.value)} />
                  <small className="text-muted d-block text-end">{fmt2(imptoalcheque)}</small>
                </td>

                {/* Gastos Faena */}
                <td>
                  <Form.Control value={gastosfaenaTxt} onChange={(e) => setGastosfaenaTxt(e.target.value)} />
                  <small className="text-muted d-block text-end">{fmt2(gastosfaena)}</small>
                </td>

                {/* Monto Total (auto) */}
                <td className="text-end align-middle">
                  <strong>{fmt2(montototal)}</strong>
                  <small className="text-muted d-block">{fmt2(montototal)}</small>
                </td>

                {/* Kgs Romaneo */}
                <td>
                  <Form.Control value={kgsromaneoTxt} onChange={(e) => setKgsRomaneoTxt(e.target.value)} />
                  <small className="text-muted d-block text-end">{fmt2(kgsromaneo)}</small>
                </td>

                {/* Precio Kg Carne (editable/auto) */}
                <td>
                  <Form.Control
                    value={preciokgcarneTxt}
                    onChange={(e) => setPrecioKgCarneTxt(e.target.value)}
                    placeholder="(auto: total / romaneo)"
                  />
                  <small className="text-muted d-block text-end">{fmt2(preciokgcarne)}</small>
                </td>

                {/* Rendimiento % (auto) */}
                <td className="text-end align-middle">
                  {rendimiento != null ? <strong>{fmt2(rendimiento)}</strong> : ""}
                  <small className="text-muted d-block">{rendimiento != null ? fmt2(rendimiento) : ""}</small>
                </td>
              </tr>
            </tbody>
          </Table>

          {/* ===== Tabla de ítems agregados (borrador) ===== */}
          {mode === "create" && (
            <>
              <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                <h6 className="mb-0">Ítems agregados</h6>
                <div className="small text-muted">Total parcial: <strong>{fmt2(totalDraft)}</strong></div>
              </div>

              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tropa</th>
                    <th>Cat. Animal</th>
                    <th>Proveedor</th>
                    <th>Frigorífico</th>
                    <th>Empresa</th>
                    <th className="text-end">Cant.</th>
                    <th className="text-end">Peso Neto</th>
                    <th className="text-end">P. Kg Vivo</th>
                    <th className="text-end">Importe Neto</th>
                    <th className="text-end">Flete</th>
                    <th className="text-end">Comisión</th>
                    <th className="text-end">Viáticos</th>
                    <th className="text-end">Imp. Cheque</th>
                    <th className="text-end">Gastos</th>
                    <th className="text-end">Monto Total</th>
                    <th className="text-end">Kgs Romaneo</th>
                    <th className="text-end">P. Kg Carne</th>
                    <th className="text-end">Rend. %</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {itemsDraft.length === 0 && (
                    <tr><td colSpan={20} className="text-center text-muted">No agregaste ítems todavía.</td></tr>
                  )}
                  {itemsDraft.map((it, idx) => {
                    const p = proveedoresTabla.find(x => Number(x.id) === Number(it.proveedor_id));
                    const f = frigorificoTabla.find(x => Number(x.id) === Number(it.frigorifico_id));
                    const e = empresasTabla.find(x => Number(x.id) === Number(it.empresa_id));
                    const c = categoriaAnimalTabla.find(x => Number(x.id) === Number(it.categoriaanimal_id));
                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{it.tropa}</td>
                        <td>{c ? (c.descripcion || c.nombre || c.alias) : it.categoriaanimal_id}</td>
                        <td>{p ? (p.razonsocial || p.nombre || p.descripcion) : it.proveedor_id}</td>
                        <td>{f ? (f.nombre || f.descripcion) : it.frigorifico_id}</td>
                        <td>{e ? (e.descripcion || e.nombre || e.fantasia) : it.empresa_id}</td>
                        <td className="text-end">{fmt0(it.cantidadanimales)}</td>
                        <td className="text-end">{fmt2(it.pesoneto)}</td>
                        <td className="text-end">{fmt2(it.preciokgvivo)}</td>
                        <td className="text-end">{fmt2(it.importeneto)}</td>
                        <td className="text-end">{fmt2(it.flete)}</td>
                        <td className="text-end">{fmt2(it.comsion)}</td>
                        <td className="text-end">{fmt2(it.viaticos)}</td>
                        <td className="text-end">{fmt2(it.imptoalcheque)}</td>
                        <td className="text-end">{fmt2(it.gastosfaena)}</td>
                        <td className="text-end">{fmt2(it.montototal)}</td>
                        <td className="text-end">{fmt2(it.kgsromaneo)}</td>
                        <td className="text-end">{fmt2(it.preciokgcarne)}</td>
                        <td className="text-end">{it.rendimiento != null ? fmt2(it.rendimiento) : ""}</td>
                        <td className="text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleRemoveDraft(idx)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {itemsDraft.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={15} className="text-end"><strong>Total</strong></td>
                      <td className="text-end"><strong>{fmt2(totalDraft)}</strong></td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={enviando}>
            Cancelar
          </Button>

          {mode === "edit" ? (
            <Button variant="primary" type="submit" disabled={!puedeGrabar || enviando}>
              {enviando ? "Guardando…" : "Guardar cambios"}
            </Button>
          ) : (
            <Button variant="primary" type="submit" disabled={!puedeGrabar || enviando}>
              {enviando ? "Grabando…" : "Grabar"}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
