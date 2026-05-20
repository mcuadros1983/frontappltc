import React, { useState } from "react";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ComercioLoginPage = () => {
  const navigate = useNavigate();

  const [documentoNumero, setDocumentoNumero] = useState("");
  const [telefono, setTelefono] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!documentoNumero.trim() || !telefono.trim()) {
      setError("Ingresá CUIT/DNI y teléfono");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/fidelizacion/comercio/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documento_numero: documentoNumero,
          telefono,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo iniciar sesión");
        return;
      }

      localStorage.setItem("lt_comercio_portal_token", data.data.token);
      localStorage.setItem(
        "lt_comercio_portal_data",
        JSON.stringify(data.data.comercio)
      );

      navigate("/comercio/dashboard");
    } catch (err) {
      console.error("[ComercioLoginPage handleLogin]", err);
      setError("Error de conexión al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{
        background:
          "linear-gradient(135deg, #fff7ed 0%, #ffffff 45%, #fee2e2 100%)",
      }}
    >
      <Card
        className="shadow border-0"
        style={{ maxWidth: 430, width: "100%", borderRadius: 22 }}
      >
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <div style={{ fontSize: 54 }}>🏪</div>
            <h3 className="fw-bold mt-2 mb-1">Portal Comercio</h3>
            <p className="text-muted mb-0">
              Consultá los puntos generados por tus clientes derivados.
            </p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>CUIT / DNI registrado</Form.Label>
              <Form.Control
                type="text"
                value={documentoNumero}
                onChange={(e) => setDocumentoNumero(e.target.value)}
                placeholder="Ej: 30711222333"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono registrado</Form.Label>
              <Form.Control
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 3834555555"
                disabled={loading}
              />
            </Form.Group>

            <Button
              type="submit"
              variant="danger"
              size="lg"
              className="w-100 fw-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          </Form>

          <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 13 }}>
            Acceso exclusivo para comercios asociados habilitados.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ComercioLoginPage;