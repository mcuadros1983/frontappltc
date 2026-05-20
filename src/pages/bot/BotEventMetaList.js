import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteBotEventMeta, getBotEventMeta } from "../../services/botApi";

const BotEventMetaList = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [activoBot, setActivoBot] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtros = useMemo(() => {
    const params = {};

    if (q.trim()) params.q = q.trim();
    if (tipo) params.tipo_evento = tipo;
    if (activoBot !== "todos") params.activo_bot = activoBot === "activos";

    return params;
  }, [q, tipo, activoBot]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getBotEventMeta(filtros);

      if (res.ok) {
        setRows(res.data || []);
      } else {
        setRows([]);
        setError(res.error || "No se pudieron cargar los eventos");
      }
    } catch (err) {
      console.error(err);
      setRows([]);
      setError("Error al cargar eventos del bot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar este evento?")) return;

    try {
      await deleteBotEventMeta(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el evento");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const [year, month, day] = String(value).split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
  };

  const renderSucursal = (row) => {
    if (row.aplica_todas_sucursales) return "Todas";
    return row.sucursal?.nombre || row.sucursal?.descripcion || row.sucursal_id || "-";
  };

  const renderTipoBadge = (tipoEvento) => {
    const map = {
      degustacion: "success",
      sorteo: "warning",
      feriado_abierto: "info",
      feriado_cerrado: "danger",
      cierre_sucursal: "danger",
      cierre_general: "danger",
      horario_especial: "primary",
      evento_infantil: "success",
      capacitacion: "secondary",
      comunicado: "dark",
      otro: "secondary",
    };

    return <Badge bg={map[tipoEvento] || "secondary"}>{tipoEvento}</Badge>;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Eventos del Bot</h3>
          <p className="text-muted mb-0">
            Sorteos, degustaciones, feriados, cierres, capacitaciones y horarios especiales.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/bot/event-meta/nuevo")}
          style={{ borderRadius: "10px" }}
        >
          Nuevo evento
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="p-4">
          <Form onSubmit={handleBuscar}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Buscar</Form.Label>
                  <Form.Control
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por feriado, sorteo, capacitación..."
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Tipo</Form.Label>
                  <Form.Select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="">Todos</option>
                    <option value="degustacion">Degustación</option>
                    <option value="sorteo">Sorteo</option>
                    <option value="feriado_abierto">Feriado abierto</option>
                    <option value="feriado_cerrado">Feriado cerrado</option>
                    <option value="cierre_sucursal">Cierre sucursal</option>
                    <option value="cierre_general">Cierre general</option>
                    <option value="horario_especial">Horario especial</option>
                    <option value="evento_infantil">Evento infantil</option>
                    <option value="capacitacion">Capacitación</option>
                    <option value="comunicado">Comunicado</option>
                    <option value="otro">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Estado</Form.Label>
                  <Form.Select
                    value={activoBot}
                    onChange={(e) => setActivoBot(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="todos">Todos</option>
                    <option value="activos">Activos</option>
                    <option value="inactivos">Inactivos</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Button
                  type="submit"
                  variant="dark"
                  className="w-100"
                  disabled={loading}
                  style={{ borderRadius: "10px" }}
                >
                  Buscar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Sucursal</th>
                  <th>Estado</th>
                  <th style={{ width: "170px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Cargando...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No hay eventos cargados.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>

                      <td>
                        <div className="fw-semibold">{row.titulo}</div>
                        <small className="text-muted">{row.descripcion || "-"}</small>
                      </td>

                      <td>{renderTipoBadge(row.tipo_evento)}</td>

                      <td>
                        {formatDate(row.fecha_inicio)}
                        {row.fecha_fin && row.fecha_fin !== row.fecha_inicio
                          ? ` al ${formatDate(row.fecha_fin)}`
                          : ""}
                      </td>

                      <td>
                        {row.hora_inicio || row.hora_fin
                          ? `${row.hora_inicio || ""}${row.hora_fin ? ` a ${row.hora_fin}` : ""}`
                          : "-"}
                      </td>

                      <td>{renderSucursal(row)}</td>

                      <td>
                        {row.activo_bot ? (
                          <Badge bg="success">Activo</Badge>
                        ) : (
                          <Badge bg="secondary">Inactivo</Badge>
                        )}
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => navigate(`/bot/event-meta/${row.id}`)}
                            style={{ borderRadius: "8px" }}
                          >
                            Editar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleEliminar(row.id)}
                            style={{ borderRadius: "8px" }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BotEventMetaList;