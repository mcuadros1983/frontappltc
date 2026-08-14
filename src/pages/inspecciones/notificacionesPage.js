import React, {
  useEffect,
  useState,
} from "react";

import {
  Container,
  Card,
  Spinner,
  Badge,
  Button,
} from "react-bootstrap";

import {
  useNavigate,
} from "react-router-dom";

import {
  inspeccionesApi,
} from "../../services/inspeccionesApi";

const NotificacionesPage =
  () => {
    const navigate =
      useNavigate();

    const [
      rows,
      setRows,
    ] = useState([]);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const cargar =
      async () => {
        try {
          setLoading(true);

          const data =
            await inspeccionesApi.notificaciones();

          setRows(
            Array.isArray(
              data
            )
              ? data
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

    const abrir =
      async (
        notificacion
      ) => {
        try {
          if (
            !notificacion.leida
          ) {
            await inspeccionesApi.marcarLeida(
              notificacion.id
            );
          }

          navigate(
            `/inspecciones/${notificacion.inspeccion_id}`
          );
        } catch (
          error
        ) {
          console.error(
            error
          );
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
        className="mt-3"
      >
        <h3 className="mb-4">
          Notificaciones
        </h3>

        {rows.length ===
          0 && (
          <Card>
            <Card.Body>
              No hay
              notificaciones.
            </Card.Body>
          </Card>
        )}

        {rows.map(
          (
            n
          ) => (
            <Card
              key={
                n.id
              }
              className="mb-3"
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center flex-wrap">

                  <div>
                    <h5>
                      {
                        n.titulo
                      }
                    </h5>

                    <div className="text-muted">
                      {
                        n.mensaje
                      }
                    </div>

                    <small className="text-muted">
                      {new Date(
                        n.createdAt
                      ).toLocaleString()}
                    </small>
                  </div>

                  <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">

                    {!n.leida && (
                      <Badge bg="danger">
                        Nueva
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      onClick={() =>
                        abrir(
                          n
                        )
                      }
                    >
                      Abrir
                    </Button>
                  </div>

                </div>
              </Card.Body>
            </Card>
          )
        )}
      </Container>
    );
  };

export default NotificacionesPage;