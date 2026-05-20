import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteBotBranchMeta, getBotBranchMeta } from "../../services/botApi";

const BotBranchMetaList = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [activoBot, setActivoBot] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtros = useMemo(() => {
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (activoBot !== "todos") params.activo_bot = activoBot === "activos";
    return params;
  }, [q, activoBot]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getBotBranchMeta(filtros);

      if (res.ok) {
        setRows(res.data || []);
      } else {
        setRows([]);
        setError(res.error || "No se pudo cargar la metadata de sucursales");
      }
    } catch (err) {
      console.error(err);
      setRows([]);
      setError("Error al cargar metadata de sucursales");
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
    if (!window.confirm("¿Seguro que querés eliminar esta metadata de sucursal?")) return;

    try {
      await deleteBotBranchMeta(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el registro");
    }
  };

  const renderAliases = (aliases) => {
    if (!Array.isArray(aliases) || aliases.length === 0) {
      return <span className="text-muted">-</span>;
    }

    return aliases.slice(0, 4).map((alias, index) => (
      <Badge key={`${alias}-${index}`} bg="primary" className="me-1 mb-1">
        {alias}
      </Badge>
    ));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Sucursales para el Bot</h3>
          <p className="text-muted mb-0">
            Direcciones, horarios, zonas, teléfonos, alias y ubicación de Google Maps.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/bot/branch-meta/nuevo")}
          style={{ borderRadius: "10px" }}
        >
          Nueva sucursal bot
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="p-4">
          <Form onSubmit={handleBuscar}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Buscar</Form.Label>
                  <Form.Control
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por nombre, zona, dirección o alias..."
                    style={{ borderRadius: "10px" }}
                  />
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

              <Col md={3}>
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
                  <th>Sucursal ERP</th>
                  <th>Nombre bot</th>
                  <th>Zona</th>
                  <th>Dirección</th>
                  <th>Aliases</th>
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
                      No hay metadata de sucursales cargada.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>
                        <div className="fw-semibold">{row.sucursal?.nombre || "-"}</div>
                        <small className="text-muted">
                          Código: {row.sucursal?.codigo || "-"}
                        </small>
                      </td>
                      <td>{row.nombre_visible}</td>
                      <td>{row.zona || "-"}</td>
                      <td>{row.direccion || "-"}</td>
                      <td>{renderAliases(row.aliases)}</td>
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
                            onClick={() => navigate(`/bot/branch-meta/${row.id}`)}
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

export default BotBranchMetaList;