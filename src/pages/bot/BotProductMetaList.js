import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Row, Table, Badge, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  getBotProductMeta,
  deleteBotProductMeta,
} from "../../services/botApi";

const BotProductMetaList = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [activoBot, setActivoBot] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtros = useMemo(() => {
    const params = {};

    if (q.trim()) {
      params.q = q.trim();
    }

    if (activoBot !== "todos") {
      params.activo_bot = activoBot === "activos";
    }

    return params;
  }, [q, activoBot]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getBotProductMeta(filtros);

      if (res.ok) {
        setRows(res.data || []);
      } else {
        setRows([]);
        setError(res.error || "No se pudo cargar la metadata del bot");
      }
    } catch (err) {
      console.error("Error al cargar metadata del bot:", err);
      setRows([]);
      setError("Error al cargar la metadata del bot");
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
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar esta metadata del bot?"
    );

    if (!confirmar) return;

    try {
      await deleteBotProductMeta(id);
      await loadData();
    } catch (err) {
      console.error("Error al eliminar metadata:", err);
      alert("No se pudo eliminar el registro");
    }
  };

  const getArticuloNombre = (row) => {
    return (
      row?.articulo?.descripcion ||
      row?.ArticuloTabla?.descripcion ||
      row?.Articulotabla?.descripcion ||
      "Sin artículo vinculado"
    );
  };

  const getArticuloCodigo = (row) => {
    return (
      row?.articulo?.codigobarra ||
      row?.ArticuloTabla?.codigobarra ||
      row?.Articulotabla?.codigobarra ||
      "-"
    );
  };

  const renderJsonBadges = (items, variant = "secondary") => {
    if (!Array.isArray(items) || items.length === 0) {
      return <span className="text-muted">-</span>;
    }

    return items.slice(0, 4).map((item, index) => (
      <Badge
        key={`${item}-${index}`}
        bg={variant}
        className="me-1 mb-1"
        style={{ fontSize: "12px" }}
      >
        {item}
      </Badge>
    ));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Metadata comercial del Bot</h3>
          <p className="text-muted mb-0">
            Información que usa el bot para recomendar cortes, cocción, platos y alternativas.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/bot/product-meta/nuevo")}
          style={{ borderRadius: "10px" }}
        >
          Nueva metadata
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
                    placeholder="Buscar por corte, descripción o palabra clave..."
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
                    <option value="activos">Activos en bot</option>
                    <option value="inactivos">Inactivos</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3} className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="dark"
                  className="w-100"
                  style={{ borderRadius: "10px" }}
                  disabled={loading}
                >
                  Buscar
                </Button>

                <Button
                  type="button"
                  variant="outline-secondary"
                  style={{ borderRadius: "10px" }}
                  onClick={() => {
                    setQ("");
                    setActivoBot("todos");
                    setTimeout(loadData, 0);
                  }}
                >
                  Limpiar
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
                  <th style={{ width: "70px" }}>ID</th>
                  <th>Artículo ERP</th>
                  <th>Nombre bot</th>
                  <th>Aliases</th>
                  <th>Cocción</th>
                  <th>Platos</th>
                  <th>Perfil</th>
                  <th style={{ width: "90px" }}>Prioridad</th>
                  <th style={{ width: "100px" }}>Estado</th>
                  <th style={{ width: "170px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Cargando metadata...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted py-4">
                      No hay metadata cargada para el bot.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>

                      <td>
                        <div className="fw-semibold">{getArticuloNombre(row)}</div>
                        <small className="text-muted">
                          Código: {getArticuloCodigo(row)}
                        </small>
                      </td>

                      <td>
                        <div className="fw-semibold">{row.nombre_visible}</div>
                        <small className="text-muted">
                          {row.descripcion_corta || "Sin descripción corta"}
                        </small>
                      </td>

                      <td>{renderJsonBadges(row.aliases, "primary")}</td>

                      <td>{renderJsonBadges(row.metodos_coccion, "info")}</td>

                      <td>{renderJsonBadges(row.platos_recomendados, "success")}</td>

                      <td>
                        <div>
                          <small>
                            <strong>Terneza:</strong> {row.terneza || "-"}
                          </small>
                        </div>
                        <div>
                          <small>
                            <strong>Rinde:</strong> {row.rendimiento || "-"}
                          </small>
                        </div>
                        <div>
                          <small>
                            <strong>Precio:</strong> {row.precio_nivel || "-"}
                          </small>
                        </div>
                      </td>

                      <td>{row.prioridad}</td>

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
                            onClick={() => navigate(`/bot/product-meta/${row.id}`)}
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

export default BotProductMetaList;