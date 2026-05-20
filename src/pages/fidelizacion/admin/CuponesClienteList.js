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

const ESTADOS_CUPON = [
  "generado",
  "disponible",
  "usado",
  "vencido",
  "anulado",
  "cancelado",
];

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "generado":
    case "disponible":
      return "primary";
    case "usado":
      return "success";
    case "vencido":
      return "warning";
    case "anulado":
    case "cancelado":
      return "danger";
    default:
      return "secondary";
  }
};

const formatDate = (value, withTime = true) => {
  if (!value) return "-";
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  return new Date(value).toLocaleString("es-AR", options);
};

const safeText = (value) => (value === null || value === undefined || value === "" ? "-" : value);

const exportToExcel = (rows, filename) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, filename);
};

const DetailRow = ({ label, value }) => (
  <div className="col-md-6 mb-2">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{safeText(value)}</div>
  </div>
);

const CuponesClienteList = () => {
  const [cupones, setCupones] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [conCanje, setConCanje] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [detalle, setDetalle] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);

  useEffect(() => {
    cargarCupones(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, conCanje, desde, hasta]);

  const buildParams = (page = 1, limit = 50, exportMode = false) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", exportMode ? 5000 : limit);
    if (buscar.trim()) params.append("buscar", buscar.trim());
    if (estado) params.append("estado", estado);
    if (conCanje) params.append("con_canje", conCanje);
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    return params;
  };

  const cargarCupones = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const params = buildParams(page, pagination.limit || 50);
      const response = await fetch(`${API_URL}/fidelizacion/admin/cupones?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudieron cargar los cupones");
        return;
      }
      setCupones(data.data || []);
      setPagination(data.pagination || { total: 0, page, limit: 50, pages: 1 });
    } catch (err) {
      console.error("[CuponesClienteList cargarCupones]", err);
      setError("Error de conexión al cargar cupones");
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalle = async (id) => {
    try {
      setDetalleLoading(true);
      setShowDetalle(true);
      setDetalle(null);
      const response = await fetch(`${API_URL}/fidelizacion/admin/cupones/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo obtener el detalle del cupón");
        setShowDetalle(false);
        return;
      }
      setDetalle(data.data);
    } catch (err) {
      console.error("[CuponesClienteList abrirDetalle]", err);
      setError("Error de conexión al obtener detalle");
      setShowDetalle(false);
    } finally {
      setDetalleLoading(false);
    }
  };

  const exportarCupones = async () => {
    try {
      setError("");
      const params = buildParams(1, 5000, true);
      const response = await fetch(`${API_URL}/fidelizacion/admin/cupones?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo exportar");
        return;
      }
      const rows = (data.data || []).map((c) => ({
        id: c.id,
        numero_cupon: c.numero_cupon,
        estado: c.estado,
        fecha_emision: formatDate(c.fecha_emision),
        fecha_vencimiento: formatDate(c.fecha_vencimiento, false),
        cliente_nombre: c.cliente?.nombre || c.participacion?.nombre_ingresado || "",
        cliente_telefono: c.cliente?.telefono || c.participacion?.telefono_ingresado || "",
        comercio: c.comercio?.nombre_fantasia || "",
        comercio_documento: c.comercio?.documento_numero || "",
        campania: c.campania?.nombre || "",
        premio: c.premio?.nombre || "",
        tipo_premio: c.premio?.tipo_premio || "",
        valor: c.premio?.valor || "",
        puntos_comercio: c.premio?.puntos_otorga_comercio || 0,
        canje_estado: c.canje?.estado || "pendiente",
        canje_fecha: c.canje?.fecha_canje ? formatDate(c.canje.fecha_canje) : "",
        sucursal_canje: c.canje?.sucursal?.nombre || "",
        usuario_canje: c.canje?.usuario?.usuario || "",
        device_id: c.participacion?.device_id || "",
        ip: c.participacion?.ip || "",
        distancia_metros: c.participacion?.distancia_metros || "",
      }));
      exportToExcel(rows, `cupones_fidelizacion_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error("[CuponesClienteList exportarCupones]", err);
      setError("Error al exportar cupones");
    }
  };

  const resumen = useMemo(() => {
    return cupones.reduce(
      (acc, c) => {
        acc.total += 1;
        if (c.estado === "usado") acc.usados += 1;
        if (c.estado === "vencido") acc.vencidos += 1;
        if (!c.canje && c.estado !== "usado") acc.pendientes += 1;
        return acc;
      },
      { total: 0, usados: 0, vencidos: 0, pendientes: 0 }
    );
  }, [cupones]);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-3 gap-2 flex-wrap">
        <div>
          <h3 className="fw-bold mb-1">Cupones Generados</h3>
          <p className="text-muted mb-0">Consultá cupones emitidos, pendientes, vencidos y usados.</p>
        </div>
        <Button variant="success" onClick={exportarCupones} disabled={loading}>
          Exportar Excel
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row g-3 mb-3">
        <div className="col-md-3"><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Total página</div><h4 className="mb-0">{resumen.total}</h4></Card.Body></Card></div>
        <div className="col-md-3"><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Pendientes</div><h4 className="mb-0">{resumen.pendientes}</h4></Card.Body></Card></div>
        <div className="col-md-3"><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Usados</div><h4 className="mb-0">{resumen.usados}</h4></Card.Body></Card></div>
        <div className="col-md-3"><Card className="border-0 shadow-sm"><Card.Body><div className="text-muted small">Registros totales</div><h4 className="mb-0">{pagination.total || 0}</h4></Card.Body></Card></div>
      </div>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <Form.Label>Buscar</Form.Label>
              <Form.Control value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Cupón, token o código" onKeyDown={(e) => e.key === "Enter" && cargarCupones(1)} />
            </div>
            <div className="col-md-2">
              <Form.Label>Estado</Form.Label>
              <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="">Todos</option>
                {ESTADOS_CUPON.map((e) => <option key={e} value={e}>{e}</option>)}
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Form.Label>Canje</Form.Label>
              <Form.Select value={conCanje} onChange={(e) => setConCanje(e.target.value)}>
                <option value="">Todos</option>
                <option value="false">Pendientes de canje</option>
                <option value="true">Con canje</option>
              </Form.Select>
            </div>
            <div className="col-md-2">
              <Form.Label>Desde</Form.Label>
              <Form.Control type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="col-md-2">
              <Form.Label>Hasta</Form.Label>
              <Form.Control type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
            <div className="col-md-1 d-grid">
              <Button onClick={() => cargarCupones(1)}>Buscar</Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /><p className="mt-3 mb-0">Cargando cupones...</p></div>
          ) : cupones.length === 0 ? (
            <Alert variant="light" className="border mb-0">No hay cupones para mostrar.</Alert>
          ) : (
            <>
              <Table responsive bordered hover size="sm" className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Cupón</th><th>Estado</th><th>Cliente</th><th>Teléfono</th><th>Premio</th><th>Comercio</th><th>Emisión</th><th>Vence</th><th>Canje</th><th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cupones.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.numero_cupon}</td>
                      <td><Badge bg={getEstadoBadge(c.estado)}>{c.estado}</Badge></td>
                      <td>{c.cliente?.nombre || c.participacion?.nombre_ingresado || "-"}</td>
                      <td>{c.cliente?.telefono || c.participacion?.telefono_ingresado || "-"}</td>
                      <td>{c.premio?.nombre || "-"}</td>
                      <td>{c.comercio?.nombre_fantasia || "-"}</td>
                      <td>{formatDate(c.fecha_emision)}</td>
                      <td>{formatDate(c.fecha_vencimiento, false)}</td>
                      <td>{c.canje ? <Badge bg="success">Canjeado</Badge> : <Badge bg="warning">Pendiente</Badge>}</td>
                      <td><Button size="sm" variant="outline-primary" onClick={() => abrirDetalle(c.id)}>Ver</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">Página {pagination.page || 1} de {pagination.pages || 1}</small>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-secondary" disabled={(pagination.page || 1) <= 1} onClick={() => cargarCupones((pagination.page || 1) - 1)}>Anterior</Button>
                  <Button size="sm" variant="outline-secondary" disabled={(pagination.page || 1) >= (pagination.pages || 1)} onClick={() => cargarCupones((pagination.page || 1) + 1)}>Siguiente</Button>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetalle} onHide={() => setShowDetalle(false)} size="xl" centered>
        <Modal.Header closeButton><Modal.Title>Detalle del Cupón</Modal.Title></Modal.Header>
        <Modal.Body>
          {detalleLoading ? <div className="text-center py-4"><Spinner animation="border" /></div> : detalle && (
            <>
              <h5 className="fw-bold mb-3">Datos del cupón</h5>
              <div className="row">
                <DetailRow label="Número" value={detalle.numero_cupon} />
                <DetailRow label="Estado" value={detalle.estado} />
                <DetailRow label="Token" value={detalle.token} />
                <DetailRow label="Código validación" value={detalle.codigo_validacion} />
                <DetailRow label="Fecha emisión" value={formatDate(detalle.fecha_emision)} />
                <DetailRow label="Fecha vencimiento" value={formatDate(detalle.fecha_vencimiento)} />
              </div>
              <hr />
              <h5 className="fw-bold mb-3">Cliente y premio</h5>
              <div className="row">
                <DetailRow label="Cliente" value={detalle.cliente?.nombre || detalle.participacion?.nombre_ingresado} />
                <DetailRow label="Teléfono" value={detalle.cliente?.telefono || detalle.participacion?.telefono_ingresado} />
                <DetailRow label="Premio" value={detalle.premio?.nombre} />
                <DetailRow label="Tipo" value={detalle.premio?.tipo_premio} />
                <DetailRow label="Comercio origen" value={detalle.comercio?.nombre_fantasia} />
                <DetailRow label="Campaña" value={detalle.campania?.nombre} />
              </div>
              <hr />
              <h5 className="fw-bold mb-3">Participación / antifraude</h5>
              <div className="row">
                <DetailRow label="Device ID" value={detalle.participacion?.device_id} />
                <DetailRow label="IP" value={detalle.participacion?.ip} />
                <DetailRow label="Distancia metros" value={detalle.participacion?.distancia_metros} />
                <DetailRow label="Precisión GPS" value={detalle.participacion?.precision_gps} />
              </div>
              {detalle.canje && <><hr /><h5 className="fw-bold mb-3">Canje</h5><div className="row">
                <DetailRow label="Estado canje" value={detalle.canje.estado} />
                <DetailRow label="Fecha canje" value={formatDate(detalle.canje.fecha_canje)} />
                <DetailRow label="Sucursal" value={detalle.canje.sucursal?.nombre} />
                <DetailRow label="Usuario" value={detalle.canje.usuario?.usuario} />
                <DetailRow label="Observaciones" value={detalle.canje.observaciones} />
              </div></>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowDetalle(false)}>Cerrar</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CuponesClienteList;
