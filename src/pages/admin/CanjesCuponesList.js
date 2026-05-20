import React, { useEffect, useMemo, useState } from "react";
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
    case "confirmado": return "success";
    case "anulado": return "danger";
    case "rechazado": return "warning";
    default: return "secondary";
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const exportToExcel = (rows, filename) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Canjes");
  XLSX.writeFile(wb, filename);
};

const DetailRow = ({ label, value }) => (
  <div className="col-md-6 mb-2"><div className="text-muted small">{label}</div><div className="fw-semibold">{value || "-"}</div></div>
);

const CanjesCuponesList = () => {
  const [canjes, setCanjes] = useState([]);
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

  useEffect(() => { cargarCanjes(1); /* eslint-disable-next-line */ }, [estado, desde, hasta]);

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

  const cargarCanjes = async (page = 1) => {
    try {
      setLoading(true); setError("");
      const params = buildParams(page, pagination.limit || 50);
      const response = await fetch(`${API_URL}/fidelizacion/admin/canjes-cupones?${params.toString()}`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.ok) { setError(data.message || "No se pudieron cargar los canjes"); return; }
      setCanjes(data.data || []);
      setPagination(data.pagination || { total: 0, page, limit: 50, pages: 1 });
    } catch (err) {
      console.error("[CanjesCuponesList cargarCanjes]", err);
      setError("Error de conexión al cargar canjes");
    } finally { setLoading(false); }
  };

  const abrirDetalle = async (id) => {
    try {
      setDetalleLoading(true); setShowDetalle(true); setDetalle(null);
      const response = await fetch(`${API_URL}/fidelizacion/admin/canjes-cupones/${id}`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.ok) { setError(data.message || "No se pudo obtener el detalle"); setShowDetalle(false); return; }
      setDetalle(data.data);
    } catch (err) {
      console.error("[CanjesCuponesList abrirDetalle]", err);
      setError("Error de conexión al obtener detalle"); setShowDetalle(false);
    } finally { setDetalleLoading(false); }
  };

  const exportarCanjes = async () => {
    try {
      setError("");
      const params = buildParams(1, 5000, true);
      const response = await fetch(`${API_URL}/fidelizacion/admin/canjes-cupones?${params.toString()}`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.ok) { setError(data.message || "No se pudo exportar"); return; }
      const rows = (data.data || []).map((c) => ({
        id: c.id,
        estado: c.estado,
        fecha_canje: formatDate(c.fecha_canje),
        numero_cupon: c.cupon?.numero_cupon || "",
        estado_cupon: c.cupon?.estado || "",
        cliente_nombre: c.cliente?.nombre || "",
        cliente_telefono: c.cliente?.telefono || "",
        comercio: c.comercio?.nombre_fantasia || "",
        premio: c.premio?.nombre || "",
        tipo_premio: c.premio?.tipo_premio || "",
        puntos_acreditados: (c.movimientosPuntos || []).reduce((acc, m) => acc + Number(m.puntos || 0), 0),
        sucursal: c.sucursal?.nombre || "",
        usuario: c.usuario?.usuario || "",
        observaciones: c.observaciones || "",
        device_id: c.cupon?.participacion?.device_id || "",
        ip: c.cupon?.participacion?.ip || "",
      }));
      exportToExcel(rows, `canjes_cupones_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) { console.error("[CanjesCuponesList exportarCanjes]", err); setError("Error al exportar canjes"); }
  };

  const resumen = useMemo(() => canjes.reduce((acc, c) => {
    acc.total += 1;
    if (c.estado === "confirmado") acc.confirmados += 1;
    acc.puntos += (c.movimientosPuntos || []).reduce((s, m) => s + Number(m.puntos || 0), 0);
    return acc;
  }, { total: 0, confirmados: 0, puntos: 0 }), [canjes]);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-3 gap-2 flex-wrap">
        <div><h3 className="fw-bold mb-1">Canjes de Cupones</h3><p className="text-muted mb-0">Consultá premios efectivamente canjeados en sucursal.</p></div>
        <Button variant="success" onClick={exportarCanjes} disabled={loading}>Exportar Excel</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="row g-3 mb-3">
        <div className="col-md-4"><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Total página</div><h4 className="mb-0">{resumen.total}</h4></Card.Body></Card></div>
        <div className="col-md-4"><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Confirmados</div><h4 className="mb-0">{resumen.confirmados}</h4></Card.Body></Card></div>
        <div className="col-md-4"><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Puntos acreditados página</div><h4 className="mb-0">{resumen.puntos}</h4></Card.Body></Card></div>
      </div>
      <Card className="shadow-sm border-0 mb-3"><Card.Body><div className="row g-2 align-items-end">
        <div className="col-md-4"><Form.Label>Buscar</Form.Label><Form.Control value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Cupón, token o código" onKeyDown={(e) => e.key === "Enter" && cargarCanjes(1)} /></div>
        <div className="col-md-2"><Form.Label>Estado</Form.Label><Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Todos</option><option value="confirmado">Confirmado</option><option value="anulado">Anulado</option><option value="rechazado">Rechazado</option></Form.Select></div>
        <div className="col-md-2"><Form.Label>Desde</Form.Label><Form.Control type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></div>
        <div className="col-md-2"><Form.Label>Hasta</Form.Label><Form.Control type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></div>
        <div className="col-md-2 d-grid"><Button onClick={() => cargarCanjes(1)}>Buscar</Button></div>
      </div></Card.Body></Card>
      <Card className="shadow-sm border-0"><Card.Body>
        {loading ? <div className="text-center py-5"><Spinner animation="border" /><p className="mt-3 mb-0">Cargando canjes...</p></div> : canjes.length === 0 ? <Alert variant="light" className="border mb-0">No hay canjes para mostrar.</Alert> : <>
          <Table responsive bordered hover size="sm" className="mb-0 align-middle"><thead><tr><th>ID</th><th>Fecha</th><th>Cupón</th><th>Cliente</th><th>Teléfono</th><th>Premio</th><th>Comercio</th><th>Sucursal</th><th>Usuario</th><th>Puntos</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            {canjes.map((c) => <tr key={c.id}><td>{c.id}</td><td>{formatDate(c.fecha_canje)}</td><td className="fw-semibold">{c.cupon?.numero_cupon || "-"}</td><td>{c.cliente?.nombre || "-"}</td><td>{c.cliente?.telefono || "-"}</td><td>{c.premio?.nombre || "-"}</td><td>{c.comercio?.nombre_fantasia || "-"}</td><td>{c.sucursal?.nombre || "-"}</td><td>{c.usuario?.usuario || "-"}</td><td>{(c.movimientosPuntos || []).reduce((acc, m) => acc + Number(m.puntos || 0), 0)}</td><td><Badge bg={getEstadoBadge(c.estado)}>{c.estado}</Badge></td><td><Button size="sm" variant="outline-primary" onClick={() => abrirDetalle(c.id)}>Ver</Button></td></tr>)}
          </tbody></Table>
          <div className="d-flex justify-content-between align-items-center mt-3"><small className="text-muted">Página {pagination.page || 1} de {pagination.pages || 1}</small><div className="d-flex gap-2"><Button size="sm" variant="outline-secondary" disabled={(pagination.page || 1) <= 1} onClick={() => cargarCanjes((pagination.page || 1) - 1)}>Anterior</Button><Button size="sm" variant="outline-secondary" disabled={(pagination.page || 1) >= (pagination.pages || 1)} onClick={() => cargarCanjes((pagination.page || 1) + 1)}>Siguiente</Button></div></div>
        </>}
      </Card.Body></Card>
      <Modal show={showDetalle} onHide={() => setShowDetalle(false)} size="xl" centered><Modal.Header closeButton><Modal.Title>Detalle del Canje</Modal.Title></Modal.Header><Modal.Body>{detalleLoading ? <div className="text-center py-4"><Spinner animation="border" /></div> : detalle && <><h5 className="fw-bold mb-3">Datos del canje</h5><div className="row"><DetailRow label="ID" value={detalle.id} /><DetailRow label="Estado" value={detalle.estado} /><DetailRow label="Fecha" value={formatDate(detalle.fecha_canje)} /><DetailRow label="Sucursal" value={detalle.sucursal?.nombre} /><DetailRow label="Usuario" value={detalle.usuario?.usuario} /><DetailRow label="Observaciones" value={detalle.observaciones} /></div><hr /><h5 className="fw-bold mb-3">Cupón, cliente y premio</h5><div className="row"><DetailRow label="Cupón" value={detalle.cupon?.numero_cupon} /><DetailRow label="Estado cupón" value={detalle.cupon?.estado} /><DetailRow label="Cliente" value={detalle.cliente?.nombre} /><DetailRow label="Teléfono" value={detalle.cliente?.telefono} /><DetailRow label="Premio" value={detalle.premio?.nombre} /><DetailRow label="Comercio origen" value={detalle.comercio?.nombre_fantasia} /></div><hr /><h5 className="fw-bold mb-3">Puntos</h5><Table responsive size="sm" bordered><thead><tr><th>Tipo</th><th>Puntos</th><th>Estado</th><th>Fecha</th><th>Motivo</th></tr></thead><tbody>{(detalle.movimientosPuntos || []).map((m) => <tr key={m.id}><td>{m.tipo_movimiento}</td><td>{m.puntos}</td><td>{m.estado}</td><td>{formatDate(m.fecha_movimiento)}</td><td>{m.motivo}</td></tr>)}</tbody></Table></>}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={() => setShowDetalle(false)}>Cerrar</Button></Modal.Footer></Modal>
    </Container>
  );
};

export default CanjesCuponesList;
