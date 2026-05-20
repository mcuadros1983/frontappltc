import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Container, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ComercioCanjes = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("lt_comercio_portal_token");

  const [canjes, setCanjes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/comercio/login");
      return;
    }
    cargarCanjes();
  }, []);

  const cargarCanjes = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/fidelizacion/comercio/canjes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "No se pudieron cargar canjes");
        return;
      }

      setCanjes(data.data || []);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">Mis canjes</h3>
          <p className="text-muted mb-0">Historial de premios solicitados.</p>
        </div>

        <Button variant="outline-secondary" onClick={() => navigate("/comercio/dashboard")}>
          Volver
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : canjes.length === 0 ? (
            <Alert variant="light" className="border mb-0">
              Todavía no realizaste solicitudes de canje.
            </Alert>
          ) : (
            <Table responsive bordered hover size="sm">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Premio</th>
                  <th>Puntos</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {canjes.map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.fecha_solicitud).toLocaleString("es-AR")}</td>
                    <td>{c.premio?.nombre || "-"}</td>
                    <td>{c.puntos_requeridos}</td>
                    <td>
                      <Badge bg="secondary">{c.estado}</Badge>
                    </td>
                    <td>{c.observaciones || c.motivo_rechazo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ComercioCanjes;