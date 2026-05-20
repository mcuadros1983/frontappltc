import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL;

const QrLandingPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    validarQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const validarQr = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/fidelizacion/public/qr/${token}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo validar el QR");
        setQrData(null);
        return;
      }

      setQrData(data.data);
    } catch (err) {
      console.error("[QrLandingPage validarQr]", err);
      setError("Error de conexión al validar el QR");
    } finally {
      setLoading(false);
    }
  };

  const handleParticipar = () => {
    navigate(`/qr/${token}/participar`, {
      state: {
        qrData,
      },
    });
  };

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
      >
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3 mb-0">Validando QR...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3"
      >
        <Card className="shadow-sm border-0" style={{ maxWidth: 420 }}>
          <Card.Body className="text-center p-4">
            <div style={{ fontSize: 48 }}>⚠️</div>
            <h4 className="mt-3">QR no disponible</h4>
            <Alert variant="warning" className="mt-3">
              {error}
            </Alert>
            <p className="text-muted mb-0">
              Consultá en el comercio o en una sucursal de La Tradición.
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const comercio = qrData?.comercio;
  const campania = qrData?.campania;

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
        className="shadow border-0 overflow-hidden"
        style={{
          maxWidth: 460,
          width: "100%",
          borderRadius: 22,
        }}
      >
        <div
          className="text-center text-white p-4"
          style={{
            background: "linear-gradient(135deg, #991b1b, #dc2626)",
          }}
        >
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              fontSize: 38,
            }}
          >
            🎁
          </div>

          <h3 className="fw-bold mb-1">¡Girás y podés ganar!</h3>
          <p className="mb-0 opacity-75">Beneficios exclusivos de La Tradición</p>
        </div>

        <Card.Body className="p-4">
          <div className="mb-3">
            <small className="text-muted d-block">Comercio asociado</small>
            <h5 className="fw-bold mb-1">{comercio?.nombre_fantasia}</h5>
            <p className="text-muted mb-0">{comercio?.domicilio}</p>
          </div>

          <div className="mb-3">
            <small className="text-muted d-block">Campaña activa</small>
            <h6 className="fw-semibold mb-1">{campania?.nombre}</h6>
            {campania?.descripcion && (
              <p className="text-muted mb-0">{campania.descripcion}</p>
            )}
          </div>

          <Alert variant="light" className="border">
            Para participar necesitás estar dentro del comercio y permitir el
            acceso a tu ubicación.
          </Alert>

          <Button
            variant="danger"
            size="lg"
            className="w-100 fw-bold"
            onClick={handleParticipar}
          >
            Participar ahora
          </Button>

          <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: 13 }}>
            Se permite participación según las condiciones de la promoción.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QrLandingPage;