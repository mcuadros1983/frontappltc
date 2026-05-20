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
import { getBotConversations } from "../../services/botApi";

const BotConversationsPage = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [canal, setCanal] = useState("whatsapp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtros = useMemo(() => {
    const params = {};

    if (q.trim()) params.q = q.trim();
    if (estado !== "todos") params.estado = estado;
    if (canal !== "todos") params.canal = canal;

    return params;
  }, [q, estado, canal]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getBotConversations(filtros);

      if (res.ok) {
        setRows(res.data || []);
      } else {
        setRows([]);
        setError(res.error || "No se pudieron cargar las conversaciones");
      }
    } catch (err) {
      console.error("Error al cargar conversaciones:", err);
      setRows([]);
      setError("Error al cargar las conversaciones del bot");
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

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoBadge = (value) => {
    const estadoActual = value || "abierta";

    if (estadoActual === "cerrada") {
      return <Badge bg="secondary">Cerrada</Badge>;
    }

    if (estadoActual === "humano") {
      return <Badge bg="warning">Humano</Badge>;
    }

    if (estadoActual === "pausada") {
      return <Badge bg="info">Pausada</Badge>;
    }

    return <Badge bg="success">Abierta</Badge>;
  };

  const getUltimoMensaje = (row) => {
    return (
      row.ultimo_mensaje ||
      row.last_message ||
      row.lastMessage?.content ||
      row.messages?.[0]?.content ||
      "-"
    );
  };

  const getNombreCliente = (row) => {
    return (
      row.nombre_cliente ||
      row.customer_name ||
      row.metadata?.profile_name ||
      "Cliente WhatsApp"
    );
  };

  const getTelefono = (row) => {
    return row.telefono_cliente || row.phone || row.telefono || "-";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Conversaciones del Bot</h3>
          <p className="text-muted mb-0">
            Consultá los chats reales recibidos desde WhatsApp y el estado de atención.
          </p>
        </div>

        <Button
          variant="outline-dark"
          onClick={loadData}
          style={{ borderRadius: "10px" }}
          disabled={loading}
        >
          Actualizar
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="p-4">
          <Form onSubmit={handleBuscar}>
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Buscar</Form.Label>
                  <Form.Control
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por nombre, teléfono o mensaje..."
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Estado</Form.Label>
                  <Form.Select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="todos">Todos</option>
                    <option value="abierta">Abiertas</option>
                    <option value="humano">Atención humana</option>
                    <option value="pausada">Pausadas</option>
                    <option value="cerrada">Cerradas</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Canal</Form.Label>
                  <Form.Select
                    value={canal}
                    onChange={(e) => setCanal(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="todos">Todos</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2} className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="dark"
                  className="w-100"
                  style={{ borderRadius: "10px" }}
                  disabled={loading}
                >
                  Buscar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="shadow-sm">
          {error}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Último mensaje</th>
                  <th style={{ width: "140px" }}>Estado</th>
                  <th style={{ width: "180px" }}>Última actividad</th>
                  <th style={{ width: "120px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Cargando conversaciones...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay conversaciones para mostrar.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      style={{ cursor: "pointer" }}
                      onDoubleClick={() => navigate(`/bot/conversations/${row.id}`)}
                    >
                      <td>{row.id}</td>

                      <td>
                        <div className="fw-semibold">{getNombreCliente(row)}</div>
                        <small className="text-muted">
                          Canal: {row.canal || "whatsapp"}
                        </small>
                      </td>

                      <td>{getTelefono(row)}</td>

                      <td>
                        <div
                          style={{
                            maxWidth: "420px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={getUltimoMensaje(row)}
                        >
                          {getUltimoMensaje(row)}
                        </div>
                      </td>

                      <td>{getEstadoBadge(row.estado)}</td>

                      <td>
                        {formatDateTime(
                          row.last_message_at || row.updatedAt || row.createdAt
                        )}
                      </td>

                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/bot/conversations/${row.id}`)}
                          style={{ borderRadius: "8px" }}
                        >
                          Ver chat
                        </Button>
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

export default BotConversationsPage;