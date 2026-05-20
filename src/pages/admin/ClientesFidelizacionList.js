import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";
import * as XLSX from "xlsx";

const API_URL = process.env.REACT_APP_API_URL;

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "activo": return "success";
    case "bloqueado": return "danger";
    case "sospechoso": return "warning";
    default: return "secondary";
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const exportToExcel = (rows, filename) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");
  XLSX.writeFile(wb, filename);
};

const DetailRow = ({ label, value }) => (
  <div className="col-md-6 mb-2"><div className="text-muted small">{label}</div><div className="fw-semibold">{value || "-"}</div></div>
);

const ClientesFidelizacionList = () => {
  const [clientes, setClientes] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);

  useEffect(() => { cargarClientes(1); /* eslint-disable-next-line */ }, [estado, desde, hasta]);

  const buildParams = (page = 1, limit = 50, exportMode = false) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", exportMode ? 5000 : limit);
    if (buscar.trim()) params.append("buscar", buscar.trim());
    if (estado) params.append("estado", estado);
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    return params;
  };

  const cargarClientes = async (page = 1) => {
    try {
      setLoading(true); setError("");
      const params = buildParams(page, pagination.limit || 50);
      const response = await fetch(`${API_URL}/fidelizacion/admin/clientes?${params.toString()}`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.ok) { setError(data.message || "No se pudieron cargar los clientes"); return; }
      setClientes(data.data || []);
      setPagination(data.pagination || { total: 0, page, limit: 50, pages: 1 });
    } catch (err) { console.error("[ClientesFidelizacionList cargarClientes]", err); setError("Error de conexión al cargar clientes"); }
    finally { setLoading(false); }
  };

  const abrirDetalle = async (id) => {
    try {
      setDetalleLoading(true); setShowDetalle(true); setDetalle(null);
      const response = await fetch(`${API_URL}/fidelizacion/admin/clientes/${id}`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.ok) { setError(data.message || "No se pudo obtener el detalle"); setShowDetalle(false); return; }
      setDetalle(data.data);
    } catch (err) { console.error("[ClientesFidelizacionList abrirDetalle]", err); setError("Error de conexión al obtener detalle"); setShowDetalle(false); }
    finally { setDetalleLoading(false); }
  };

  const exportarClientes = async () => {
    try {
      setError("");
      const params = buildParams(1, 5000, true);
      const response = await fetch(`${API_URL}/fidelizacion/admin/clientes?${params.toString()}`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.ok) { setError(data.message || "No se pudo exportar"); return; }
      const rows = (data.data || []).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono,
        telefono_normalizado: c.telefono_normalizado,
        estado: c.estado,
        fecha_registro: formatDate(c.createdAt),
        participaciones: c.metricas?.participaciones || 0,
        cupones_generados: c.metricas?.cupones_generados || 0,
        cupones_usados: c.metricas?.cupones_usados || 0,
        canjes_confirmados: c.metricas?.canjes_confirmados || 0,
        ultima_participacion: formatDate(c.ultima_participacion?.fecha_participacion),
        ultimo_comercio: c.ultima_participacion?.comercio?.nombre_fantasia || "",
        ultima_campania: c.ultima_participacion?.campania?.nombre || "",
      }));
      exportToExcel(rows, `clientes_fidelizacion_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) { console.error("[ClientesFidelizacionList exportarClientes]", err); setError("Error al exportar clientes"); }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-3 gap-2 flex-wrap">
        <div><h3 className="fw-bold mb-1">Clientes Registrados</h3><p className="text-muted mb-0">Consultá y exportá clientes que participaron en Comercios Amigos.</p></div>
        <Button variant="success" onClick={exportarClientes} disabled={loading}>Exportar Excel</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card className="shadow-sm border-0 mb-3"><Card.Body><div className="row g-2 align-items-end">
        <div className="col-md-4"><Form.Label>Buscar</Form.Label><Form.Control value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Nombre o teléfono" onKeyDown={(e) => e.key === "Enter" && cargarClientes(1)} /></div>
        <div className="col-md-2"><Form.Label>Estado</Form.Label><Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Todos</option><option value="activo">Activo</option><option value="bloqueado">Bloqueado</option><option value="sospechoso">Sospechoso</option></Form.Select></div>
        <div className="col-md-2"><Form.Label>Desde alta</Form.Label><Form.Control type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
        <div className="col-md-2"><Form.Label>Hasta alta</Form.Label><Form.Control type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></div>
        <div className="col-md-2 d-grid"><Button onClick={() => cargarClientes(1)}>Buscar</Button></div>
      </div></Card.Body></Card>
      <Card className="shadow-sm border-0"><Card.Body>
        {loading ? <div className="text-center py-5"><Spinner animation="border" /><p className="mt-3 mb-0">Cargando clientes...</p></div> : clientes.length === 0 ? <Alert variant="light" className="border mb-0">No hay clientes para mostrar.</Alert> : <>
          <Table responsive bordered hover size="sm" className="mb-0 align-middle"><thead><tr><th>ID</th><th>Nombre</th><th>Teléfono</th><th>Estado</th><th>Alta</th><th>Participaciones</th><th>Cupones</th><th>Usados</th><th>Canjes</th><th>Último comercio</th><th>Acción</th></tr></thead><tbody>
            {clientes.map((c) => <tr key={c.id}><td>{c.id}</td><td className="fw-semibold">{c.nombre}</td><td>{c.telefono}</td><td><Badge bg={getEstadoBadge(c.estado)}>{c.estado}</Badge></td><td>{formatDate(c.createdAt)}</td><td>{c.metricas?.participaciones || 0}</td><td>{c.metricas?.cupones_generados || 0}</td><td>{c.metricas?.cupones_usados || 0}</td><td>{c.metricas?.canjes_confirmados || 0}</td><td>{c.ultima_participacion?.comercio?.nombre_fantasia || "-"}</td><td><Button size="sm" variant="outline-primary" onClick={() => abrirDetalle(c.id)}>Ver</Button></td></tr>)}
          </tbody></Table>
          <div className="d-flex justify-content-between align-items-center mt-3"><small className="text-muted">Página {pagination.page || 1} de {pagination.pages || 1} — Total {pagination.total || 0}</small><div className="d-flex gap-2"><Button size="sm" variant="outline-secondary" disabled={(pagination.page || 1) <= 1} onClick={() => cargarClientes((pagination.page || 1) - 1)}>Anterior</Button><Button size="sm" variant="outline-secondary" disabled={(pagination.page || 1) >= (pagination.pages || 1)} onClick={() => cargarClientes((pagination.page || 1) + 1)}>Siguiente</Button></div></div>
        </>}
      </Card.Body></Card>
      <Modal show={showDetalle} onHide={() => setShowDetalle(false)} size="xl" centered><Modal.Header closeButton><Modal.Title>Detalle del Cliente</Modal.Title></Modal.Header><Modal.Body>{detalleLoading ? <div className="text-center py-4"><Spinner animation="border" /></div> : detalle && <><h5 className="fw-bold mb-3">Datos del cliente</h5><div className="row"><DetailRow label="Nombre" value={detalle.nombre} /><DetailRow label="Teléfono" value={detalle.telefono} /><DetailRow label="Teléfono normalizado" value={detalle.telefono_normalizado} /><DetailRow label="Estado" value={detalle.estado} /><DetailRow label="Alta" value={formatDate(detalle.createdAt)} /></div><hr /><h5 className="fw-bold mb-3">Resumen</h5><div className="row"><DetailRow label="Participaciones" value={detalle.metricas?.participaciones} /><DetailRow label="Cupones generados" value={detalle.metricas?.cupones_generados} /><DetailRow label="Cupones usados" value={detalle.metricas?.cupones_usados} /><DetailRow label="Canjes confirmados" value={detalle.metricas?.canjes_confirmados} /></div><hr /><h5 className="fw-bold mb-3">Últimas participaciones</h5><Table responsive size="sm" bordered><thead><tr><th>Fecha</th><th>Comercio</th><th>Campaña</th><th>Resultado</th><th>Estado</th><th>Premio</th><th>Device</th><th>IP</th></tr></thead><tbody>{(detalle.participaciones || []).slice(0, 20).map((p) => <tr key={p.id}><td>{formatDate(p.fecha_participacion)}</td><td>{p.comercio?.nombre_fantasia || "-"}</td><td>{p.campania?.nombre || "-"}</td><td>{p.resultado}</td><td>{p.estado}</td><td>{p.premio?.nombre || "-"}</td><td>{p.device_id}</td><td>{p.ip}</td></tr>)}</tbody></Table><h5 className="fw-bold mb-3 mt-4">Cupones</h5><Table responsive size="sm" bordered><thead><tr><th>Número</th><th>Fecha</th><th>Estado</th><th>Premio</th><th>Comercio</th><th>Canje</th></tr></thead><tbody>{(detalle.cupones || []).slice(0, 20).map((c) => <tr key={c.id}><td>{c.numero_cupon}</td><td>{formatDate(c.fecha_emision)}</td><td>{c.estado}</td><td>{c.premio?.nombre}</td><td>{c.comercio?.nombre_fantasia}</td><td>{c.canje ? c.canje.estado : "pendiente"}</td></tr>)}</tbody></Table></>}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={() => setShowDetalle(false)}>Cerrar</Button></Modal.Footer></Modal>
    </Container>
  );
};

export default ClientesFidelizacionList;
