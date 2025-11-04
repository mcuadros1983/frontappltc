// src/pages/sueldosTesoreria/LiquidacionMensualManager.js
import { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import { Container, Row, Col, Table, Button, Form, Spinner, Alert, Modal } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import LiquidacionMensualModal from "./LIquidacionMensualModal";
import { renderToString } from "react-dom/server";
import ReciboPrint from "./ReciboPrint";
import { createRoot } from "react-dom/client";
import { FaWhatsapp } from "react-icons/fa";
import PhonePickerModal from "./PhonePickerModal";            // ⬅️ NUEVO
import { normalizeToWaAr, buildWaUrl } from "../../utils/phone";      // ⬅️ NUEVO

const apiUrl = process.env.REACT_APP_API_URL;

export default function LiquidacionMensualManager() {
  const dataContext = useContext(Contexts.DataContext);
  const empleadosCtx = dataContext?.empleados || [];
  const empresaSeleccionada = dataContext?.empresaSeleccionada || null;
  const empresas = dataContext?.empresas || [];

  // Filtros
  const [periodos, setPeriodos] = useState([]);
  const [periodoId, setPeriodoId] = useState("");   // "Todos"
  const [empleadoId, setEmpleadoId] = useState(""); // "Todos"
  const [empresaId, setEmpresaId] = useState("");   // "Todos"
  const [soloCompletos, setSoloCompletos] = useState(true);

  // Detalle (read-only)
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleErr, setDetalleErr] = useState(null);

  // Datos
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);

  // Modal teléfonos
  const [showPhones, setShowPhones] = useState(false);
  const [phonesSel, setPhonesSel] = useState([]);
  const [reciboParaEnvio, setReciboParaEnvio] = useState(null);

  const fmt = (v) => `$${Number(v ?? 0).toFixed(2)}`;
  const printRef = useRef(null);

  // ====== Mensaje que mandamos por WhatsApp ======
  const construirMensaje = useCallback((recibo, empleadoNombre, periodoStr, pdfUrl) => {
    return `Hola ${empleadoNombre}, te comparto tu recibo de sueldo. Podés descargarlo aquí: ${pdfUrl}`;
  }, []);

  // ====== Handler WhatsApp: teléfonos + link firmado + abrir wa.me ======
  const enviarPorWhatsapp = useCallback(async (recibo) => {
    try {
      // 1) Teléfonos del empleado
      const r = await fetch(`${apiUrl}/empleados/${recibo.empleado_id}/telefonos`, { credentials: "include" });
      const phones = await r.json();
      if (!Array.isArray(phones) || !phones.length) {
        alert("El empleado no tiene teléfonos cargados.");
        return;
      }

      // 2) Link firmado del backend (usa PUBLIC_BASE_URL del backend)
      const resp = await fetch(`${apiUrl}/links/recibo/${recibo.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}) // { ttlSeconds: opcional }
      });
      const payload = await resp.json();
      if (!resp.ok || !payload?.url) {
        throw new Error(payload?.error || "No se pudo generar el link del PDF.");
      }
      const pdfUrl = payload.url;

      // 3) Si hay más de un teléfono, permití elegir
      if (phones.length > 1) {
        setPhonesSel(phones);
        setReciboParaEnvio({ recibo, pdfUrl });
        setShowPhones(true);
        return;
      }

      // 4) Si hay uno solo, abrir directo
      const seleccionado = phones[0];
      abrirWhatsApp(recibo, seleccionado, pdfUrl);
    } catch (e) {
      console.error(e);
      alert(e.message || "No se pudo abrir WhatsApp.");
    }
  }, [apiUrl]);

  const abrirWhatsApp = useCallback((recibo, phoneRow, pdfUrl) => {
    const telRaw = phoneRow?.numero || phoneRow?.telefono || phoneRow?.celular;
    if (!telRaw) {
      alert("Número no válido.");
      return;
    }
    const numeroWa = normalizeToWaAr(telRaw);
    const periodoStr = nombrePeriodo(recibo.periodo_id);
    const empleadoNom = nombreEmpleado(recibo.empleado_id, recibo.Empleado);
    const msg = construirMensaje(recibo, empleadoNom, periodoStr, pdfUrl);
    const waUrl = buildWaUrl(numeroWa, msg);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }, [construirMensaje]);

  // ====== Imprimir (tu lógica intacta) ======
  const imprimirDetalle = () => {
    if (!detalle) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) return;

    doc.open();
    doc.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Recibo ${detalle?.id ? `#${detalle.id}` : ""}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    html, body { height: 100%; }
    body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans";
           font-size: 11pt; line-height: 1.35; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #111; }
    .row { display: flex; gap: 16px; }
    .col-6 { flex: 0 0 calc(50% - 8px); max-width: calc(50% - 8px); }
    .col-4 { flex: 0 0 calc(33.333% - 10.66px); max-width: calc(33.333% - 10.66px); }
    .no-break { break-inside: avoid; page-break-inside: avoid; }
    h5 { margin: 0 0 4px 0; font-size: 18px; }
    .muted { color: #6c757d; }
    .small { font-size: 10pt; }
    .sep { margin: 8px 0 16px; border: none; border-top: 1px solid #e5e7eb; }
    .label { font-size: 10pt; color: #6c757d; margin-bottom: 4px; }
    .field { border: 1px solid #e5e7eb; background: #f8f9fa; padding: 6px 8px; border-radius: 6px; }
    .field.white { background: #fff; }
    .summary { border: 1px solid #e5e7eb; background: #f8f9fa; padding: 8px 10px; border-radius: 6px; height: 100%; }
    .summary .line { display: flex; justify-content: space-between; margin: 2px 0; }
    .summary .strong { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; }
    thead th { text-align: left; padding: 8px; background: #f3f4f6; border: 1px solid #e5e7eb; font-weight: 600; }
    tbody td { padding: 8px; border: 1px solid #e5e7eb; }
    .right { text-align: right; }
    table, tr, td, th { break-inside: avoid; page-break-inside: avoid; }
    .print-root { padding: 6px; }
  </style>
</head>
<body>
  <div id="print-root" class="print-root"></div>
</body>
</html>`);
    doc.close();

    const mount = doc.getElementById("print-root");
    const root = createRoot(mount);
    root.render(
      <ReciboPrint
        detalle={detalle}
        nombreEmpleado={nombreEmpleado}
        nombrePeriodo={nombrePeriodo}
        fmtAr={(v) =>
          new Intl.NumberFormat("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number(v || 0))
        }
      />
    );

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      try { root.unmount(); } catch { }
      try {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch { }
    };

    win.requestAnimationFrame(() => {
      win.requestAnimationFrame(() => {
        const afterPrint = () => {
          win.removeEventListener("afterprint", afterPrint);
          cleanup();
        };
        win.addEventListener("afterprint", afterPrint);

        win.focus();
        win.print();

        setTimeout(() => {
          cleanup();
          win.removeEventListener("afterprint", afterPrint);
        }, 1200);
      });
    });
  };

  const fetchPeriodos = useCallback(async () => {
    try {
      const r = await fetch(`${apiUrl}/periodoliquidacion`, { credentials: "include" });
      const data = await r.json();
      const sorted = (data || []).sort((a, b) => (b.anio - a.anio) || (b.mes - a.mes));
      setPeriodos(sorted);
    } catch (e) {
      console.error(e);
    }
  }, [apiUrl]);

  useEffect(() => { fetchPeriodos(); }, [fetchPeriodos]);

  const fetchRecibos = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const url = `${apiUrl}/liquidacion/recibostotales?order=createdAt&dir=DESC&limit=300`;
      const r = await fetch(url, { credentials: "include" });
      const payload = await r.json().catch(() => null);
      if (!r.ok) throw new Error(payload?.error || "No se pudo obtener la lista de liquidaciones.");
      const list = Array.isArray(payload) ? payload.filter(item => item.estado === "calculado") : [];
      setRows(list);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar las liquidaciones.");
    } finally {
      setLoading(false);
    }
  }, [ apiUrl]);

  useEffect(() => { fetchRecibos(); }, [fetchRecibos]);

  const nombrePeriodo = (pId) => {
    const p = periodos.find((x) => String(x.id) === String(pId));
    if (!p) return `Período #${pId}`;
    const mm = String(p.mes).padStart(2, "0");
    return `${p.anio}-${mm}`;
  };

  const nombreEmpleado = (id, inc) => {
    const ctx = empleadosCtx.find((e) => String(e?.empleado?.id) === String(id));
    if (ctx) {
      const ap = ctx?.clientePersona?.apellido || ctx?.empleado?.apellido || "";
      const no = ctx?.clientePersona?.nombre || ctx?.empleado?.nombre || "";
      return `${ap} ${no}`.trim();
    }
    if (inc) {
      const ap = inc.apellido || "";
      const no = inc.nombre || "";
      return `${ap} ${no}`.trim();
    }
    return `Empleado #${id}`;
  };

  const abrirModal = () => setShowModal(true);
  const cerrarModal = (changed) => {
    setShowModal(false);
    if (changed) fetchRecibos();
  };

  const limpiarFiltros = () => {
    setPeriodoId("");
    setEmpleadoId("");
    setEmpresaId("");
    setSoloCompletos(true); // o false, según prefieras
  };

  const abrirDetalle = async (reciboId) => {
    setDetalle(null);
    setDetalleErr(null);
    setShowDetalle(true);
    setDetalleLoading(true);
    try {
      const r = await fetch(`${apiUrl}/liquidacion/recibo/${reciboId}/detalle`, { credentials: "include" });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo obtener el detalle del recibo.");
      setDetalle(data);
    } catch (e) {
      console.error(e);
      setDetalleErr(e.message || "Error al cargar el detalle.");
    } finally {
      setDetalleLoading(false);
    }
  };

  const cerrarDetalle = (refetch = false) => {
    setShowDetalle(false);
    setDetalle(null);
    setDetalleErr(null);
    if (refetch) fetchRecibos();
  };

  const eliminarRecibo = async (id) => {
    if (!id) return;
    const ok = window.confirm("¿Eliminar la liquidación completa? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      const r = await fetch(`${apiUrl}/liquidacion/recibo/${id}`, { method: "DELETE", credentials: "include" });
      const data = await r.json().catch(() => null);
      if (!r.ok || data?.ok !== true) throw new Error(data?.error || "No se pudo eliminar la liquidación.");
      cerrarDetalle(true);
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  // ====== NUEVO: eliminar directo desde la grilla principal (sin abrir modal) ======
  const eliminarReciboInline = useCallback(async (id) => {
    if (!id) return;
    const ok = window.confirm("¿Eliminar la liquidación? Esta acción no se puede deshacer.");
    if (!ok) return;

    try {
      const r = await fetch(`${apiUrl}/liquidacion/recibo/${id}`, { method: "DELETE", credentials: "include" });
      const data = await r.json().catch(() => null);
      if (!r.ok || data?.ok !== true) throw new Error(data?.error || "No se pudo eliminar la liquidación.");

      // Actualizar la grilla en memoria (sin abrir/cerrar modales)
      setRows((prev) => prev.filter((x) => String(x.id) !== String(id)));
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  }, [apiUrl]);

  const fmtAr = (v) =>
    new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .format(Number(v ?? 0));

  const rowsFiltradas = useMemo(() => {
    return (rows || []).filter(r => {
      if (periodoId && String(r.periodo_id) !== String(periodoId)) return false;
      if (empleadoId && String(r.empleado_id) !== String(empleadoId)) return false;
      if (empresaId && String(r.empresa_id) !== String(empresaId)) return false;
      if (soloCompletos) {
        // si tu definición de "completo" es distinta, ajustá esta condición
        if (r.estado !== "calculado") return false;
      }
      return true;
    });
  }, [rows, periodoId, empleadoId, empresaId, soloCompletos]);

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-2">
        <Col><h4 className="mb-0">Liquidaciones Mensuales</h4></Col>
        <Col md="auto">
          <Button onClick={abrirModal}>Nueva Liquidación</Button>
        </Col>
      </Row>

      {!empresaSeleccionada && (
        <Alert variant="warning" className="mb-2">
          Debés seleccionar una empresa para filtrar/crear liquidaciones.
        </Alert>
      )}

      <Row className="align-items-end g-3 mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Período</Form.Label>
            <Form.Select
              value={periodoId}
              onChange={(e) => setPeriodoId(e.target.value)}
              className="form-control my-input"
            >
              <option value="">— Todos —</option>
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {nombrePeriodo(p.id)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Empleado</Form.Label>
            <Form.Select
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
              className="form-control my-input"
            >
              <option value="">— Todos —</option>
              {empleadosCtx.map((item) => {
                const id = item?.empleado?.id;
                const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || "";
                const no = item?.clientePersona?.nombre || item?.empleado?.nombre || "";
                return (
                  <option key={id} value={id}>
                    {ap} {no}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Empresa</Form.Label>
            <Form.Select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="form-control my-input"
            >
              <option value="">— Todas —</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombrecorto || emp.nombre || `Empresa #${emp.id}`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md="auto" className="d-flex gap-2">
          <Button onClick={fetchRecibos} disabled={loading} className="my-2">
            {loading ? (<><Spinner size="sm" className="me-2" />Buscando…</>) : "Buscar"}
          </Button>
          <Button variant="outline-secondary" onClick={limpiarFiltros} className="my-2 mx-2">
            Limpiar
          </Button>
        </Col>
      </Row>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      <div className="table-responsive">
        <Table bordered hover striped size="sm">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Período</th>
              <th>Empleado</th>
              <th style={{ width: 120 }}>Sueldo</th>
              <th style={{ width: 140 }}>Total Haberes</th>
              <th style={{ width: 140 }}>Descuentos</th>
              <th style={{ width: 140 }}>A cobrar Banco</th>
              <th style={{ width: 160 }}>A cobrar Sucursal</th>
              <th style={{ width: 110 }}>Estado</th>
              <th style={{ width: 90 }} className="text-center">Enviar</th>
              {/* NUEVO */}
              <th style={{ width: 110 }} className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                {/* colSpan actualizado por la nueva columna */}
                <td colSpan={11} className="text-center">
                  <Spinner size="sm" className="me-2" />Cargando…
                </td>
              </tr>
            ) : rowsFiltradas.length ? (
              rowsFiltradas.map((r) => (
                <tr key={r.id} onDoubleClick={() => abrirDetalle(r.id)} style={{ cursor: "pointer" }}>
                  <td>{r.id}</td>
                  <td>{nombrePeriodo(r.periodo_id)}</td>
                  <td>{nombreEmpleado(r.empleado_id, r.Empleado)}</td>
                  <td>${Number(r.sueldo ?? 0).toFixed(2)}</td>
                  <td>${Number(r.totalhaberes ?? 0).toFixed(2)}</td>
                  <td>${Number(r.descuentos ?? 0).toFixed(2)}</td>
                  <td>${Number(r.acobrarporbanco ?? 0).toFixed(2)}</td>
                  <td>${Number(r.acobrarporsucursal ?? 0).toFixed(2)}</td>
                  <td>{r.estado}</td>
                  <td className="text-center">
                    <Button
                      variant="link"
                      className="p-0"
                      title="Enviar por WhatsApp"
                      onClick={(e) => { e.stopPropagation(); enviarPorWhatsapp(r); }}
                    >
                      <FaWhatsapp size={20} />
                    </Button>
                  </td>
                  {/* NUEVO: Botón Eliminar inline */}
                  <td className="text-center">
                    <Button
                      variant="danger"
                      size="sm"
                      title="Eliminar liquidación"
                      onClick={(e) => { e.stopPropagation(); eliminarReciboInline(r.id); }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* colSpan actualizado por la nueva columna */}
                <td colSpan={11} className="text-center">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {showModal && (
        <LiquidacionMensualModal
          show={showModal}
          onClose={cerrarModal}
          empleados={empleadosCtx}
          periodos={periodos}
          empresaIdDefault={empresaSeleccionada?.id ?? null}
        />
      )}

      {/* Modal de Detalle */}
      <Modal show={showDetalle} onHide={() => cerrarDetalle(false)} size="lg" centered>
        <Modal.Header closeButton>
          <div className="d-flex align-items-center justify-content-between w-100">
            <Modal.Title className="mb-0">Detalle de liquidación</Modal.Title>
            {detalle && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={imprimirDetalle}
                title="Imprimir solo el contenido del recibo"
              >
                Imprimir Recibo
              </Button>
            )}
          </div>
        </Modal.Header>

        <Modal.Body>
          {detalleErr && <div className="alert alert-danger py-2">{detalleErr}</div>}

          {detalleLoading ? (
            <div className="py-3 text-center">
              <Spinner size="sm" className="me-2" /> Cargando detalle…
            </div>
          ) : !detalle ? (
            <div className="text-muted">Sin datos.</div>
          ) : (
            <>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Empleado</Form.Label>
                    <div className="form-control bg-light">{nombreEmpleado(detalle.empleado_id, detalle.Empleado)}</div>
                    <small className="text-muted d-block mt-1">ID Recibo: #{detalle.id}</small>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Período</Form.Label>
                    <div className="form-control bg-light">
                      {detalle?.Periodo
                        ? `${detalle.Periodo.anio}-${String(detalle.Periodo.mes).padStart(2, "0")}`
                        : nombrePeriodo(detalle.periodo_id)}
                    </div>
                    <small className="text-muted d-block mt-1">Estado: <strong className="text-uppercase">{detalle.estado}</strong></small>
                  </Form.Group>
                </Col>
              </Row>

              <hr />

              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Sueldo</Form.Label>
                    <div className="form-control bg-white">${fmtAr(detalle.sueldo)}</div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>A cobrar por banco</Form.Label>
                    <div className="form-control bg-white">${fmtAr(detalle.acobrarporbanco)}</div>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <div className="alert alert-light w-100 mb-0">
                    <div className="d-flex justify-content-between">
                      <span>Total Haberes</span>
                      <span className="fw-semibold">${fmtAr(detalle.totalhaberes)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Descuentos</span>
                      <span className="fw-semibold">${fmtAr(detalle.descuentos)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between">
                      <strong>A cobrar en sucursal</strong>
                      <span className="fw-semibold">${fmtAr(detalle.acobrarporsucursal)}</span>
                    </div>
                  </div>
                </Col>
              </Row>

              <hr />

              <h6 className="mb-2">Adicionales fijos vigentes</h6>
              <div className="table-responsive mb-3">
                <Table bordered hover size="sm" striped>
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>ID</th>
                      <th>Descripción</th>
                      <th style={{ width: 160 }} className="text-end">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detalle.Items || []).filter(it => it.tipo === "FIJO").length ? (
                      (detalle.Items || []).filter(it => it.tipo === "FIJO").map(it => (
                        <tr key={it.id}>
                          <td>{it.id}</td>
                          <td>{it.descripcion || "—"}</td>
                          <td className="text-end">${fmtAr(it.monto_total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="text-center">Sin fijos vigentes para este período/empleado</td></tr>
                    )}
                  </tbody>
                </Table>
              </div>

              <h6 className="mb-2">Adicionales y Descuentos del período</h6>
              <div className="table-responsive">
                <Table bordered hover size="sm" striped>
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>ID</th>
                      <th>Descripción</th>
                      <th style={{ width: 160 }} className="text-end">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detalle.Items || []).filter(it => it.tipo !== "FIJO").length ? (
                      (detalle.Items || [])
                        .filter(it => it.tipo !== "FIJO")
                        .sort((a, b) => {
                          const ma = Number(a.monto_total || 0);
                          const mb = Number(b.monto_total || 0);
                          if (ma >= 0 && mb < 0) return -1;
                          if (ma < 0 && mb >= 0) return 1;
                          return 0;
                        })
                        .map(it => (
                          <tr key={it.id}>
                            <td>{it.id}</td>
                            <td>{it.descripcion || "—"}</td>
                            <td className="text-end">${fmtAr(it.monto_total)}</td>
                          </tr>
                        ))
                    ) : (
                      <tr><td colSpan={4} className="text-center">Sin adicionales para este período/empleado</td></tr>
                    )}
                  </tbody>
                </Table>
              </div>

              <small className="text-muted">
                Los montos positivos se suman a <strong>Total Haberes</strong>. Los montos negativos y los adelantos alimentan <strong>Descuentos</strong>.
              </small>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {detalle && (
            <Button variant="danger" onClick={() => eliminarRecibo(detalle.id)}>
              Eliminar liquidación
            </Button>
          )}
          <Button variant="secondary" onClick={() => cerrarDetalle(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para elegir teléfono (si hay varios) */}
      <PhonePickerModal
        show={showPhones}
        phones={phonesSel}
        onHide={() => { setShowPhones(false); setReciboParaEnvio(null); }}
        onSelect={(p) => {
          setShowPhones(false);
          if (reciboParaEnvio) abrirWhatsApp(reciboParaEnvio.recibo, p, reciboParaEnvio.pdfUrl);
          setReciboParaEnvio(null);
        }}
      />
    </Container>
  );
}
