import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTipoBadge = (tipo) => {
  switch (tipo) {
    case "acreditacion":
      return "success";
    case "debito_canje":
      return "danger";
    case "devolucion":
      return "info";
    case "vencimiento":
      return "warning";
    case "ajuste_manual":
      return "primary";
    case "reversion":
      return "secondary";
    default:
      return "dark";
  }
};

const getEstadoBadge = (estado) => {
  switch (estado) {
    case "activo":
      return "success";
    case "usado":
      return "secondary";
    case "vencido":
      return "warning";
    case "anulado":
      return "danger";
    default:
      return "dark";
  }
};

const PuntosComercioView = () => {
  const params = useParams();

  const [comercioId, setComercioId] = useState(params.id || "");
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const movimientos = data?.movimientos || [];
  const saldo = data?.saldo || 0;

  useEffect(() => {
    if (params.id) {
      cargarPuntos(params.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const cargarPuntos = async (idParam = comercioId) => {
    if (!idParam) {
      setError("Ingresá o seleccioná un comercio");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/comercios/${idParam}/puntos`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.message || "No se pudieron obtener los puntos");
        setData(null);
        return;
      }

      setData(result.data);
    } catch (err) {
      console.error("[PuntosComercioView cargarPuntos]", err);
      setError("Error de conexión al obtener puntos");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const totalAcreditaciones = movimientos
    .filter((m) => m.tipo_movimiento === "acreditacion")
    .reduce((acc, m) => acc + Number(m.puntos || 0), 0);

  const totalDebitos = movimientos
    .filter((m) =>
      ["debito_canje", "vencimiento", "reversion"].includes(m.tipo_movimiento)
    )
    .reduce((acc, m) => acc + Number(m.puntos || 0), 0);

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="fw-bold mb-1">Puntos del Comercio</h3>
          <p className="text-muted mb-0">
            Consultá el saldo y el historial de movimientos de puntos generados
            por canjes de cupones.
          </p>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>ID del comercio</Form.Label>
                <Form.Control
                  type="number"
                  value={comercioId}
                  onChange={(e) => setComercioId(e.target.value)}
                  placeholder="Ej: 1"
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={3} className="mt-3 mt-md-0">
              <Button
                variant="primary"
                className="w-100 fw-bold"
                onClick={() => cargarPuntos()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Consultando...
                  </>
                ) : (
                  "Consultar puntos"
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {data && (
        <>
          <Row className="mb-3">
            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <small className="text-muted">Saldo disponible</small>
                  <h2 className="fw-bold mb-0 text-success">{saldo}</h2>
                  <p className="text-muted mb-0">puntos activos</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <small className="text-muted">Total acreditado</small>
                  <h2 className="fw-bold mb-0">{totalAcreditaciones}</h2>
                  <p className="text-muted mb-0">puntos generados</p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <small className="text-muted">Débitos / ajustes</small>
                  <h2 className="fw-bold mb-0">{totalDebitos}</h2>
                  <p className="text-muted mb-0">movimientos negativos</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-0">Movimientos</h5>
                  <small className="text-muted">
                    Comercio ID: {data.comercio_id}
                  </small>
                </div>

                <Badge bg="dark" className="p-2">
                  {movimientos.length} movimientos
                </Badge>
              </div>

              {movimientos.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  Este comercio todavía no tiene movimientos de puntos.
                </Alert>
              ) : (
                <Table responsive bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Puntos</th>
                      <th>Estado</th>
                      <th>Cupón</th>
                      <th>Canje</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((mov) => (
                      <tr key={mov.id}>
                        <td>{formatDate(mov.fecha_movimiento)}</td>
                        <td>
                          <Badge bg={getTipoBadge(mov.tipo_movimiento)}>
                            {mov.tipo_movimiento}
                          </Badge>
                        </td>
                        <td className="fw-bold">{mov.puntos}</td>
                        <td>
                          <Badge bg={getEstadoBadge(mov.estado)}>
                            {mov.estado}
                          </Badge>
                        </td>
                        <td>{mov.cupon_id || "-"}</td>
                        <td>{mov.canje_cupon_id || "-"}</td>
                        <td>{mov.motivo || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default PuntosComercioView;