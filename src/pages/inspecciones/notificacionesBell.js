import React, {
  useEffect,
  useState,
} from "react";

import {
  Badge,
  Dropdown,
} from "react-bootstrap";

import {
  useNavigate,
} from "react-router-dom";

import {
  inspeccionesApi,
} from "../../services/inspeccionesApi";

const NotificacionesBell = () => {
  const navigate =
    useNavigate();

  const [
    rows,
    setRows,
  ] = useState([]);

  const cargar =
    async () => {
      try {
        const data =
          await inspeccionesApi.notificaciones();

        setRows(
          Array.isArray(
            data
          )
            ? data
            : []
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };

  useEffect(() => {
    cargar();

    const interval =
      setInterval(
        cargar,
        60000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  const pendientes =
    rows.filter(
      (
        r
      ) => !r.leida
    ).length;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="light"
      >
        🔔

        {pendientes >
          0 && (
            <Badge bg="danger">
              {
                pendientes
              }
            </Badge>
          )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          minWidth:
            350,
        }}
      >
        {rows
          .slice(
            0,
            10
          )
          .map(
            (
              n
            ) => (
              <Dropdown.Item
                key={n.id}
                onClick={async () => {
                  try {
                    await inspeccionesApi.marcarLeida(
                      n.id
                    );

                    await cargar();

                    navigate(
                      `/inspecciones/${n.inspeccion_id}`
                    );
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                <strong>
                  {
                    n.titulo
                  }
                </strong>

                <div className="small text-muted">
                  {
                    n.mensaje
                  }
                </div>
              </Dropdown.Item>
            )
          )}

        <Dropdown.Divider />

        <Dropdown.Item
          onClick={() =>
            navigate(
              "/inspecciones/notificaciones"
            )
          }
        >
          Ver todas
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificacionesBell;