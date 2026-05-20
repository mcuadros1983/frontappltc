import React, { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { requestAudioSync } from "../../services/audioApi";

const initialForm = {
  sucursalCodigo: "",
  fecha: "",
};

export default function AudioSyncRequestCard({ onSyncSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [requestId, setRequestId] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setRequestId("");

      const response = await requestAudioSync(form);
      const payload = response?.data || response;
      const result = payload?.data || {};

      setSuccessMessage(
        payload?.message || "Solicitud de sincronización enviada correctamente"
      );
      setRequestId(result?.requestId || "");

      if (typeof onSyncSuccess === "function") {
        onSyncSuccess(result);
      }
    } catch (err) {
      setError(
        err?.message || "No se pudo enviar la solicitud de sincronización"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setError("");
    setSuccessMessage("");
    setRequestId("");
  };

  return (
    <Card className="shadow-sm mb-3">
      <Card.Body>
        <Card.Title className="mb-3">Solicitar sincronización de audios</Card.Title>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        {successMessage ? (
          <Alert variant="success" className="mb-3">
            <div>{successMessage}</div>
            {requestId ? (
              <div className="mt-1">
                <strong>Request ID:</strong> {requestId}
              </div>
            ) : null}
          </Alert>
        ) : null}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Sucursal</Form.Label>
                <Form.Control
                  type="text"
                  name="sucursalCodigo"
                  value={form.sucursalCodigo}
                  onChange={handleChange}
                  placeholder="Ej: 001"
                />
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="text"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  placeholder="YYYY/MM/DD"
                />
              </Form.Group>
            </Col>

            <Col md={4} className="d-flex align-items-end gap-2 mb-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Solicitar sincronización"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Limpiar
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}