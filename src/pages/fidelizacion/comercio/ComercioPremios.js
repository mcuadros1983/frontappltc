import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ComercioPremios = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("lt_comercio_portal_token");

  const [saldo, setSaldo] = useState(0);
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/comercio/login");
      return;
    }
    cargarPremios();
  }, []);

  const cargarPremios = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/fidelizacion/comercio/premios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "No se pudieron cargar premios");
        return;
      }

      setSaldo(data.data.saldo || 0);
      setPremios(data.data.premios || []);
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const solicitarCanje = async (premioId) => {
    try {
      setSolicitando(premioId);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_URL}/fidelizacion/comercio/canjes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ premio_comercio_id: premioId }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "No se pudo solicitar el canje");
        return;
      }

      setSuccess("Solicitud de canje realizada correctamente");
      await cargarPremios();
    } catch (err) {
      setError("Error de conexión al solicitar canje");
    } finally {
      setSolicitando(null);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">Premios disponibles</h3>
          <p className="text-muted mb-0">Canjeá tus puntos por beneficios.</p>
        </div>

        <Button variant="outline-secondary" onClick={() => navigate("/comercio/dashboard")}>
          Volver
        </Button>
      </div>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <small className="text-muted">Tus puntos disponibles</small>
          <h1 className="fw-bold text-success mb-0">{saldo}</h1>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="g-3">
          {premios.map((premio) => {
            const puede = saldo >= premio.costo_puntos;

            return (
              <Col md={4} key={premio.id}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <Badge bg="dark" className="mb-2">
                      {premio.tipo_premio}
                    </Badge>

                    <h5 className="fw-bold">{premio.nombre}</h5>
                    <p className="text-muted">{premio.descripcion || "-"}</p>

                    <h3 className="fw-bold text-danger">
                      {premio.costo_puntos} pts
                    </h3>

                    <Button
                      variant={puede ? "success" : "secondary"}
                      className="w-100 fw-bold"
                      disabled={!puede || solicitando === premio.id}
                      onClick={() => solicitarCanje(premio.id)}
                    >
                      {solicitando === premio.id
                        ? "Solicitando..."
                        : puede
                        ? "Solicitar canje"
                        : "Puntos insuficientes"}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default ComercioPremios;