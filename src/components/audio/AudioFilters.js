import React from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";

export default function AudioFilters(props = {}) {
  const {
    filters = {},
    onChange,
    onSubmit,
    onReset,
    loading = false,
  } = props;

  const safeFilters = {
    sucursalCodigo: filters?.sucursalCodigo || "",
    fecha: filters?.fecha || "",
    analysisStatus: filters?.analysisStatus || "",
    hasQuestion: filters?.hasQuestion || "",
    hasRecommendation: filters?.hasRecommendation || "",
    hasSuggestedSale: filters?.hasSuggestedSale || "",
    search: filters?.search || "",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (typeof onChange === "function") {
      onChange(name, value);
    }
  };

  return (
    <Card className="shadow-sm mb-3">
      <Card.Body>
        <Form onSubmit={onSubmit}>
          <Row>
            <Col md={2} className="mb-2">
              <Form.Group>
                <Form.Label>Sucursal</Form.Label>
                <Form.Control
                  name="sucursalCodigo"
                  value={safeFilters.sucursalCodigo}
                  onChange={handleChange}
                  placeholder="Ej: 001"
                />
              </Form.Group>
            </Col>

            <Col md={2} className="mb-2">
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  name="fecha"
                  value={safeFilters.fecha}
                  onChange={handleChange}
                  placeholder="YYYY/MM/DD"
                />
              </Form.Group>
            </Col>

            <Col md={2} className="mb-2">
              <Form.Group>
                <Form.Label>Estado análisis</Form.Label>
                <Form.Select
                  name="analysisStatus"
                  value={safeFilters.analysisStatus}
                  onChange={handleChange}
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="analyzed">Analizado</option>
                  <option value="skipped">Omitido</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2} className="mb-2">
              <Form.Group>
                <Form.Label>¿Pregunta?</Form.Label>
                <Form.Select
                  name="hasQuestion"
                  value={safeFilters.hasQuestion}
                  onChange={handleChange}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2} className="mb-2">
              <Form.Group>
                <Form.Label>¿Recomendación?</Form.Label>
                <Form.Select
                  name="hasRecommendation"
                  value={safeFilters.hasRecommendation}
                  onChange={handleChange}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2} className="mb-2">
              <Form.Group>
                <Form.Label>¿Venta sugerida?</Form.Label>
                <Form.Select
                  name="hasSuggestedSale"
                  value={safeFilters.hasSuggestedSale}
                  onChange={handleChange}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col md={8} className="mb-2">
              <Form.Group>
                <Form.Label>Búsqueda</Form.Label>
                <Form.Control
                  name="search"
                  value={safeFilters.search}
                  onChange={handleChange}
                  placeholder="Buscar en transcripción, archivo o segmento"
                />
              </Form.Group>
            </Col>

            <Col md={4} className="d-flex align-items-end gap-2 mb-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={onReset}
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