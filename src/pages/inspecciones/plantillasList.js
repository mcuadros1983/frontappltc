import React, {
  useEffect,
  useState,
} from "react";

import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";

import {
  Link,
} from "react-router-dom";

import {
  inspeccionPlantillaApi,
} from "../../services/inspeccionPlantillaApi";

const PlantillasList = () => {
  const [
    rows,
    setRows,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    filtro,
    setFiltro,
  ] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);

      const data =
        await inspeccionPlantillaApi.listar();

      setRows(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
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

  const desactivar =
    async (id) => {
      if (
        !window.confirm(
          "¿Desactivar plantilla?"
        )
      )
        return;

      try {
        await inspeccionPlantillaApi.desactivar(
          id
        );

        cargar();
      } catch (error) {
        console.error(
          error
        );
      }
    };

  const rowsFiltrados =
    rows.filter((r) =>
      r.nombre
        ?.toLowerCase()
        .includes(
          filtro.toLowerCase()
        )
    );

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
      className="mt-3"
    >
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between">
            <h4>
              Plantillas
            </h4>

            <Link
              to="/inspecciones/plantillas/nueva"
              className="btn btn-primary"
            >
              Nueva
            </Link>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Form.Control
            className="mb-3"
            placeholder="Buscar..."
            value={filtro}
            onChange={(e) =>
              setFiltro(
                e.target.value
              )
            }
          />

          <Table
            striped
            hover
            responsive
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>
                  Nombre
                </th>
                <th>
                  Versión
                </th>
                <th>
                  Estado
                </th>
                <th>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {rowsFiltrados.map(
                (
                  row
                ) => (
                  <tr
                    key={
                      row.id
                    }
                  >
                    <td>
                      {
                        row.id
                      }
                    </td>

                    <td>
                      {
                        row.nombre
                      }
                    </td>

                    <td>
                      {
                        row.version
                      }
                    </td>

                    <td>
                      <Badge
                        bg={
                          row.activo
                            ? "success"
                            : "secondary"
                        }
                      >
                        {row.activo
                          ? "Activa"
                          : "Inactiva"}
                      </Badge>
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/inspecciones/plantillas/${row.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          Editar
                        </Link>

                        {row.activo && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              desactivar(
                                row.id
                              )
                            }
                          >
                            Desactivar
                          </Button>
                        )}
                      </div>
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

export default PlantillasList;