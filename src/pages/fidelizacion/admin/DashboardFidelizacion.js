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

const API_URL = process.env.REACT_APP_API_URL;

const todayInput = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("es-AR");
};

const MetricCard = ({ title, value, subtitle, variant = "primary" }) => {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body>
        <small className="text-muted">{title}</small>
        <h2 className={`fw-bold mb-0 text-${variant}`}>
          {formatNumber(value)}
        </h2>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </Card.Body>
    </Card>
  );
};

const DashboardFidelizacion = () => {
  const [desde, setDesde] = useState(todayInput());
  const [hasta, setHasta] = useState(todayInput());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resumen = data?.resumen || {};
  const rankingComercios = data?.rankingComercios || [];
  const rankingPremios = data?.rankingPremios || [];

  useEffect(() => {
    cargarDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (desde) params.append("desde", `${desde}T00:00:00`);
      if (hasta) params.append("hasta", `${hasta}T23:59:59`);

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/dashboard?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.message || "No se pudo cargar el dashboard");
        setData(null);
        return;
      }

      setData(result.data);
    } catch (err) {
      console.error("[DashboardFidelizacion cargarDashboard]", err);
      setError("Error de conexión al cargar dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    const today = todayInput();
    setDesde(today);
    setHasta(today);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <h3 className="fw-bold mb-1">Dashboard Fidelización</h3>
          <p className="text-muted mb-0">
            Métricas básicas de comercios, participaciones, cupones, canjes y
            puntos.
          </p>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Row className="align-items-end g-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Desde</Form.Label>
                <Form.Control
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Button
                variant="primary"
                className="w-100 fw-bold"
                onClick={cargarDashboard}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Consultando...
                  </>
                ) : (
                  "Actualizar"
                )}
              </Button>
            </Col>

            <Col md={3}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={limpiarFiltros}
                disabled={loading}
              >
                Hoy
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && !data ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Cargando dashboard...</p>
        </div>
      ) : (
        data && (
          <>
            <Row className="mb-3 g-3">
              <Col md={3}>
                <MetricCard
                  title="Comercios activos"
                  value={resumen.comerciosActivos}
                  subtitle={`Total registrados: ${formatNumber(
                    resumen.totalComercios
                  )}`}
                  variant="success"
                />
              </Col>

              <Col md={3}>
                <MetricCard
                  title="Participaciones"
                  value={resumen.totalParticipaciones}
                  subtitle={`Ganadores: ${formatNumber(
                    resumen.participacionesGanadas
                  )}`}
                  variant="primary"
                />
              </Col>

              <Col md={3}>
                <MetricCard
                  title="Cupones generados"
                  value={resumen.totalCupones}
                  subtitle={`Disponibles: ${formatNumber(
                    resumen.cuponesDisponibles
                  )}`}
                  variant="danger"
                />
              </Col>

              <Col md={3}>
                <MetricCard
                  title="Canjes confirmados"
                  value={resumen.totalCanjes}
                  subtitle={`Tasa canje: ${resumen.tasaCanje || 0}%`}
                  variant="warning"
                />
              </Col>
            </Row>

            <Row className="mb-3 g-3">
              <Col md={3}>
                <MetricCard
                  title="Siga participando"
                  value={resumen.participacionesSiga}
                  subtitle="Resultados sin premio"
                  variant="secondary"
                />
              </Col>

              <Col md={3}>
                <MetricCard
                  title="Participaciones bloqueadas"
                  value={resumen.participacionesBloqueadas}
                  subtitle="GPS, device o límites"
                  variant="dark"
                />
              </Col>

              <Col md={3}>
                <MetricCard
                  title="Cupones usados"
                  value={resumen.cuponesUsados}
                  subtitle={`Vencidos: ${formatNumber(resumen.cuponesVencidos)}`}
                  variant="info"
                />
              </Col>

              <Col md={3}>
                <MetricCard
                  title="Puntos acreditados"
                  value={resumen.totalPuntos}
                  subtitle={`Movimientos: ${formatNumber(
                    resumen.totalMovimientosPuntos
                  )}`}
                  variant="success"
                />
              </Col>
            </Row>

            <Row className="mb-3 g-3">
              <Col md={6}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Indicadores</h5>

                    <Table bordered size="sm" className="mb-0">
                      <tbody>
                        <tr>
                          <th>Tasa de ganadores</th>
                          <td>
                            <Badge bg="primary">
                              {resumen.tasaGanadores || 0}%
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <th>Tasa de canje</th>
                          <td>
                            <Badge bg="success">{resumen.tasaCanje || 0}%</Badge>
                          </td>
                        </tr>
                        <tr>
                          <th>Cupones pendientes/disponibles</th>
                          <td>{formatNumber(resumen.cuponesDisponibles)}</td>
                        </tr>
                        <tr>
                          <th>Participaciones bloqueadas</th>
                          <td>{formatNumber(resumen.participacionesBloqueadas)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Lectura rápida</h5>

                    <Alert variant="light" className="border mb-2">
                      Si hay muchas participaciones pero pocos canjes, revisar
                      atractivo del premio o distancia hacia sucursal.
                    </Alert>

                    <Alert variant="light" className="border mb-0">
                      Si hay muchos bloqueos, revisar radio GPS de los comercios
                      y precisión de ubicación en celulares.
                    </Alert>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3">
              <Col lg={6}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Top comercios por participación</h5>

                    {rankingComercios.length === 0 ? (
                      <Alert variant="light" className="border mb-0">
                        Sin participaciones en el período.
                      </Alert>
                    ) : (
                      <Table responsive bordered hover size="sm" className="mb-0">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Comercio</th>
                            <th>Participaciones</th>
                            <th>Ganadores</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rankingComercios.map((row, index) => (
                            <tr key={row.comercio_id || index}>
                              <td>{index + 1}</td>
                              <td>
                                <strong>
                                  {row.comercio?.nombre_fantasia ||
                                    `Comercio ${row.comercio_id}`}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  {row.comercio?.domicilio || "-"}
                                </small>
                              </td>
                              <td>{row.get ? row.get("participaciones") : row.participaciones}</td>
                              <td>{row.get ? row.get("ganadores") : row.ganadores}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="fw-bold mb-3">Top premios obtenidos</h5>

                    {rankingPremios.length === 0 ? (
                      <Alert variant="light" className="border mb-0">
                        Sin premios en el período.
                      </Alert>
                    ) : (
                      <Table responsive bordered hover size="sm" className="mb-0">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Premio</th>
                            <th>Tipo</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rankingPremios.map((row, index) => (
                            <tr key={row.premio_cliente_id || index}>
                              <td>{index + 1}</td>
                              <td>
                                {row.premio?.nombre ||
                                  `Premio ${row.premio_cliente_id}`}
                              </td>
                              <td>
                                <Badge bg="secondary">
                                  {row.premio?.tipo_premio || "-"}
                                </Badge>
                              </td>
                              <td>{row.get ? row.get("total") : row.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )
      )}
    </Container>
  );
};

export default DashboardFidelizacion;