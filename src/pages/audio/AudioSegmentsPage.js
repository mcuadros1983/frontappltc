import React, { useEffect, useState } from "react";
import { Alert, Container, Row, Col, Card } from "react-bootstrap";
import AudioFilters from "../../components/audio/AudioFilters";
import AudioSegmentsTable from "../../components/audio/AudioSegmentsTable";
import { getAudioSegments } from "../../services/audioApi";

const initialFilters = {
  sucursalCodigo: "",
  fecha: "",
  analysisStatus: "",
  hasQuestion: "",
  hasRecommendation: "",
  hasSuggestedSale: "",
  search: "",
  limit: 50,
  offset: 0,
};

export default function AudioSegmentsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      const response = await getAudioSegments(customFilters);
      const payload = response?.data || response;

      setRows(payload?.data || []);
      setTotal(payload?.total || 0);
    } catch (err) {
      setError(err?.message || "No se pudieron cargar los segmentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(initialFilters);
  }, []);

  const handleChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextFilters = { ...filters, offset: 0 };
    setFilters(nextFilters);
    loadData(nextFilters);
  };

  const handleReset = async () => {
    setFilters(initialFilters);
    loadData(initialFilters);
  };

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h3>Auditoría de Atención - Segmentos</h3>
        </Col>
      </Row>

      <AudioFilters
        filters={filters}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        loading={loading}
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Card className="shadow-sm">
        <Card.Body>
          <div className="mb-3">
            <strong>Total:</strong> {total}
          </div>

          <AudioSegmentsTable rows={rows} loading={loading} />
        </Card.Body>
      </Card>
    </Container>
  );
}