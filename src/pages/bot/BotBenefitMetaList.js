import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteBotBenefitMeta, getBotBenefitMeta } from "../../services/botApi";

const BotBenefitMetaList = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [activoBot, setActivoBot] = useState("todos");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtros = useMemo(() => {
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (tipo) params.tipo_beneficio = tipo;
    if (activoBot !== "todos") params.activo_bot = activoBot === "activos";
    return params;
  }, [q, tipo, activoBot]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getBotBenefitMeta(filtros);

      if (res.ok) {
        setRows(res.data || []);
      } else {
        setRows([]);
        setError(res.error || "No se pudieron cargar los beneficios");
      }
    } catch (err) {
      console.error(err);
      setRows([]);
      setError("Error al cargar beneficios del bot");
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
    if (!window.confirm("¿Seguro que querés eliminar este beneficio?")) return;

    try {
      await deleteBotBenefitMeta(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el beneficio");
    }
  };

  const renderDias = (dias) => {
    if (!Array.isArray(dias) || dias.length === 0) return <span className="text-muted">-</span>;

    return dias.map((d) => (
      <Badge key={d} bg="info" className="me-1 mb-1">
        {d}
      </Badge>
    ));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Beneficios del Bot</h3>
          <p className="text-muted mb-0">
            Descuentos recurrentes, convenios, tarjetas, jubilados y reintegros.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/bot/benefit-meta/nuevo")}
          style={{ borderRadius: "10px" }}
        >
          Nuevo beneficio
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
                    placeholder="Buscar por tarjeta, convenio, jubilados..."
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
                    <option value="cliente">Cliente</option>
                    <option value="medio_pago">Medio de pago</option>
                    <option value="convenio">Convenio</option>
                    <option value="reintegro">Reintegro</option>
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
                <Button type="submit" variant="dark" className="w-100" style={{ borderRadius: "10px" }}>
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
                  <th>Descuento</th>
                  <th>Días</th>
                  <th>Medio / Entidad</th>
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
                      No hay beneficios cargados.
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
                      <td>{row.tipo_beneficio}</td>
                      <td>{row.porcentaje_descuento ? `${Number(row.porcentaje_descuento)}%` : "-"}</td>
                      <td>{renderDias(row.dias_aplica)}</td>
                      <td>
                        <div>{row.medio_pago || "-"}</div>
                        <small className="text-muted">{row.entidad || ""}</small>
                      </td>
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
                            onClick={() => navigate(`/bot/benefit-meta/${row.id}`)}
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

export default BotBenefitMetaList;