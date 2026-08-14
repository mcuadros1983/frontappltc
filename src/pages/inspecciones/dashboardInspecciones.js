import React, {
  useEffect,
  useState,
} from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Badge,
} from "react-bootstrap";

import {
  inspeccionesApi,
} from "../../services/inspeccionesApi";

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
      problemas,
      setProblemas,
    ] = useState([]);

    const [
      reincidencias,
      setReincidencias,
    ] = useState([]);

    const [
      categorias,
      setCategorias,
    ] = useState([]);

    const [
      vencidas,
      setVencidas,
    ] = useState([]);

    useEffect(() => {
      cargar();
    }, []);

    const cargar =
      async () => {
        try {
          setLoading(true);

          const [
            dashboardData,
            rankingData,
            problemasData,
            reincidenciasData,
            categoriasData,
            vencidasData,
          ] =
            await Promise.all([
              inspeccionesApi.dashboard(),
              inspeccionesApi.ranking(),
              inspeccionesApi.topProblemas(),
              inspeccionesApi.reincidencias(),
              inspeccionesApi.resumenCategorias(),
              inspeccionesApi.vencidas(),
            ]);

          setDashboard(
            dashboardData
          );

          setRanking(
            rankingData || []
          );

          setProblemas(
            problemasData || []
          );

          setReincidencias(
            reincidenciasData ||
              []
          );

          setCategorias(
            categoriasData || []
          );

          setVencidas(
            vencidasData || []
          );
        } catch (error) {
          console.error(
            error
          );
        } finally {
          setLoading(false);
        }
      };

    if (loading) {
      return (
        <Container
          fluid
          className="mt-3 text-center"
        >
          <Spinner animation="border" />
        </Container>
      );
    }

    return (
      <Container
        fluid
        className="mt-3 rpm-page px-3"
      >
        <h4 className="mb-3">
          Dashboard de
          Inspecciones
        </h4>

        {/* KPIS */}

        <Row className="mb-4">
          <Col
            xs={6}
            md={3}
            className="mb-3"
          >
            <Card>
              <Card.Body className="text-center">
                <h3>
                  {
                    dashboard
                      ?.inspecciones
                      ?.abiertas
                  }
                </h3>

                <small>
                  Abiertas
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col
            xs={6}
            md={3}
            className="mb-3"
          >
            <Card>
              <Card.Body className="text-center">
                <h3>
                  {
                    dashboard
                      ?.respuestas
                      ?.enRevision
                  }
                </h3>

                <small>
                  En
                  Revisión
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col
            xs={6}
            md={3}
            className="mb-3"
          >
            <Card>
              <Card.Body className="text-center">
                <h3>
                  {
                    dashboard
                      ?.respuestas
                      ?.vencidas
                  }
                </h3>

                <small>
                  Vencidas
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col
            xs={6}
            md={3}
            className="mb-3"
          >
            <Card>
              <Card.Body className="text-center">
                <h3>
                  {
                    dashboard
                      ?.respuestas
                      ?.criticasAbiertas
                  }
                </h3>

                <small>
                  Críticas
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* RANKING */}

        <Card className="mb-4">
          <Card.Header>
            Ranking de
            Sucursales
          </Card.Header>

          <Card.Body>
            <Table
              responsive
              striped
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    Sucursal
                  </th>
                  <th>
                    Inspecciones
                  </th>
                  <th>
                    Cumplimiento
                  </th>
                </tr>
              </thead>

              <tbody>
                {ranking.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      <td>
                        {index +
                          1}
                      </td>

                      <td>
                        {
                          item.sucursal
                        }
                      </td>

                      <td>
                        {
                          item.cantidad_inspecciones
                        }
                      </td>

                      <td>
                        <Badge bg="success">
                          {
                            item.cumplimiento
                          }
                          %
                        </Badge>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* TOP PROBLEMAS */}

        <Card className="mb-4">
          <Card.Header>
            Problemas Más
            Frecuentes
          </Card.Header>

          <Card.Body>
            <Table
              responsive
              striped
            >
              <thead>
                <tr>
                  <th>
                    Categoría
                  </th>

                  <th>
                    Problema
                  </th>

                  <th>
                    Cantidad
                  </th>
                </tr>
              </thead>

              <tbody>
                {problemas.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      <td>
                        {
                          item.categoria_nombre
                        }
                      </td>

                      <td>
                        {
                          item.descripcion_item
                        }
                      </td>

                      <td>
                        {
                          item.cantidad
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* REINCIDENCIAS */}

        <Card className="mb-4">
          <Card.Header>
            Reincidencias
          </Card.Header>

          <Card.Body>
            <Table
              responsive
              striped
            >
              <thead>
                <tr>
                  <th>
                    Sucursal
                  </th>

                  <th>
                    Categoría
                  </th>

                  <th>
                    Item
                  </th>

                  <th>
                    Veces
                  </th>
                </tr>
              </thead>

              <tbody>
                {reincidencias.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      <td>
                        {
                          item.sucursal
                        }
                      </td>

                      <td>
                        {
                          item.categoria
                        }
                      </td>

                      <td>
                        {
                          item.item
                        }
                      </td>

                      <td>
                        <Badge bg="danger">
                          {
                            item.cantidad
                          }
                        </Badge>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* VENCIDAS */}

        <Card className="mb-4">
          <Card.Header>
            Observaciones
            Vencidas
          </Card.Header>

          <Card.Body>
            <Table
              responsive
              striped
            >
              <thead>
                <tr>
                  <th>
                    Sucursal
                  </th>

                  <th>
                    Item
                  </th>

                  <th>
                    Fecha
                    límite
                  </th>

                  <th>
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {vencidas.map(
                  (
                    item
                  ) => (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td>
                        {
                          item
                            .inspeccion
                            ?.sucursal
                            ?.nombre
                        }
                      </td>

                      <td>
                        {
                          item.descripcion_item
                        }
                      </td>

                      <td>
                        {
                          item.fecha_limite
                        }
                      </td>

                      <td>
                        <Badge bg="danger">
                          {
                            item.estado
                          }
                        </Badge>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* CATEGORIAS */}

        <Card>
          <Card.Header>
            Resumen por
            Categorías
          </Card.Header>

          <Card.Body>
            <Table
              responsive
              striped
            >
              <thead>
                <tr>
                  <th>
                    Categoría
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Cumple
                  </th>

                  <th>
                    No
                    Cumple
                  </th>

                  <th>
                    No
                    Aplica
                  </th>
                </tr>
              </thead>

              <tbody>
                {categorias.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      <td>
                        {
                          item.categoria_nombre
                        }
                      </td>

                      <td>
                        {
                          item.total
                        }
                      </td>

                      <td>
                        {
                          item.cumple
                        }
                      </td>

                      <td>
                        {
                          item.no_cumple
                        }
                      </td>

                      <td>
                        {
                          item.no_aplica
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    );
  };

export default DashboardInspecciones;