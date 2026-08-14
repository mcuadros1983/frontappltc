import React, {
  useEffect,
  useState,
} from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Table,
} from "react-bootstrap";

import {
  Doughnut,
  Bar,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const API =
  process.env.REACT_APP_API_URL;

const DashboardInspecciones =
  () => {
    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      dashboard,
      setDashboard,
    ] = useState(null);

    const [
      ranking,
      setRanking,
    ] = useState([]);

    const [
      topProblemas,
      setTopProblemas,
    ] = useState([]);

    const cargar =
      async () => {
        try {
          setLoading(true);

          const [
            dashboardRes,
            rankingRes,
            topRes,
          ] =
            await Promise.all([
              fetch(
                `${API}/inspecciones/dashboard`,
                {
                  credentials:
                    "include",
                }
              ),
              fetch(
                `${API}/inspecciones/ranking`,
                {
                  credentials:
                    "include",
                }
              ),
              fetch(
                `${API}/inspecciones/top-problemas`,
                {
                  credentials:
                    "include",
                }
              ),
            ]);

          const [
            dashboardData,
            rankingData,
            topData,
          ] =
            await Promise.all([
              dashboardRes.json(),
              rankingRes.json(),
              topRes.json(),
            ]);

          setDashboard(
            dashboardData
          );

          setRanking(
            Array.isArray(
              rankingData
            )
              ? rankingData
              : []
          );

          setTopProblemas(
            Array.isArray(
              topData
            )
              ? topData
              : []
          );
        } catch (
        error
        ) {
          console.error(
            error
          );
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
      cargar();
    }, []);

    if (
      loading ||
      !dashboard
    ) {
      return (
        <Container
          fluid
          className="mt-4 text-center"
        >
          <Spinner animation="border" />
        </Container>
      );
    }

    const estadoData = {
      labels: [
        "Abiertas",
        "Parciales",
        "Cerradas",
      ],
      datasets: [
        {
          data: [
            dashboard
              .inspecciones
              .abiertas,

            dashboard
              .inspecciones
              .parciales,

            dashboard
              .inspecciones
              .cerradas,
          ],
        },
      ],
    };


    const rankingSafe =
      Array.isArray(
        ranking
      )
        ? ranking
        : [];

    const rankingData = {
      labels:
        rankingSafe.map(
          (r) =>
            r.sucursal
        ),

      datasets: [
        {
          label:
            "Cumplimiento (%)",

          data:
            rankingSafe.map(
              (r) =>
                Number(
                  r.cumplimiento
                )
            ),
        },
      ],
    };

    const topProblemasSafe =
      Array.isArray(
        topProblemas
      )
        ? topProblemas
        : [];

    const topProblemasData = {
      labels:
        topProblemasSafe.map(
          (p) =>
            p.descripcion_item
        ),

      datasets: [
        {
          label:
            "Cantidad",

          data:
            topProblemasSafe.map(
              (p) =>
                p.cantidad
            ),
        },
      ],
    };
    return (
      <Container
        fluid
        className="mt-3"
      >
        <h3 className="mb-4">
          Dashboard de
          Inspecciones
        </h3>

        <Row>
          <Col
            xs={6}
            md={3}
            className="mb-3"
          >
            <Card>
              <Card.Body>
                <h6>
                  Inspecciones
                </h6>

                <h3>
                  {
                    dashboard
                      .inspecciones
                      .total
                  }
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col
            xs={6}
            md={3}
            className="mb-3"
          >
            <Card>
              <Card.Body>
                <h6>
                  Abiertas
                </h6>

                <h3>
                  {
                    dashboard
                      .inspecciones
                      .abiertas
                  }
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col
            xs={6}
            md={3}
            className="mb-3"
          >
            <Card>
              <Card.Body>
                <h6>
                  Vencidas
                </h6>

                <h3>
                  {
                    dashboard
                      .respuestas
                      .vencidas
                  }
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col
            xs={6}
            md={3}
            className="mb-3"
          >
            <Card>
              <Card.Body>
                <h6>
                  Críticas
                </h6>

                <h3>
                  {
                    dashboard
                      .respuestas
                      .criticasAbiertas
                  }
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col
            lg={4}
            className="mb-4"
          >
            <Card>
              <Card.Header>
                Estado de
                Inspecciones
              </Card.Header>

              <Card.Body>
                <Doughnut
                  data={
                    estadoData
                  }
                />
              </Card.Body>
            </Card>
          </Col>

          <Col
            lg={8}
            className="mb-4"
          >
            <Card>
              <Card.Header>
                Ranking de
                Sucursales
              </Card.Header>

              <Card.Body>
                <Bar
                  data={
                    rankingData
                  }
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col
            lg={8}
            className="mb-4"
          >
            <Card>
              <Card.Header>
                Top Problemas
              </Card.Header>

              <Card.Body>
                <Bar
                  data={
                    topProblemasData
                  }
                />
              </Card.Body>
            </Card>
          </Col>

          <Col
            lg={4}
            className="mb-4"
          >
            <Card>
              <Card.Header>
                Resumen
              </Card.Header>

              <Card.Body>
                <Table
                  striped
                  size="sm"
                >
                  <tbody>
                    <tr>
                      <td>
                        Pendientes
                      </td>

                      <td>
                        {
                          dashboard
                            .respuestas
                            .pendientes
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        En Trabajo
                      </td>

                      <td>
                        {
                          dashboard
                            .respuestas
                            .enTrabajo
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        En Revisión
                      </td>

                      <td>
                        {
                          dashboard
                            .respuestas
                            .enRevision
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Aprobadas
                      </td>

                      <td>
                        {
                          dashboard
                            .respuestas
                            .aprobadas
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Rechazadas
                      </td>

                      <td>
                        {
                          dashboard
                            .respuestas
                            .rechazadas
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Reabiertas
                      </td>

                      <td>
                        {
                          dashboard
                            .respuestas
                            .reabiertas
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Evidencias
                      </td>

                      <td>
                        {
                          dashboard
                            .evidencias
                            .total
                        }
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  };

export default DashboardInspecciones;