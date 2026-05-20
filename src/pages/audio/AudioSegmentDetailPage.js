import React, { useEffect, useState } from "react";
import { Alert, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getAudioSegmentById } from "../../services/audioApi";

export default function AudioSegmentDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAudioSegmentById(id);
      const payload = response?.data || response;
      setData(payload?.data || null);
    } catch (err) {
      setError(err?.message || "No se pudo cargar el detalle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">No se encontró información del segmento.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h3>Detalle del segmento #{data.id}</h3>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Datos del segmento</Card.Title>
              <p><strong>Sucursal:</strong> {data.sucursalCodigo || "-"}</p>
              <p><strong>Fecha:</strong> {data.fecha || "-"}</p>
              <p><strong>Archivo:</strong> {data.fileName || "-"}</p>
              <p><strong>Duración:</strong> {data.durationMs ?? "-"}</p>
              <p><strong>Estado análisis:</strong> {data.analysisStatus || "-"}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Clasificación local</Card.Title>
              <p><strong>Pregunta:</strong> {String(data.hasQuestion)}</p>
              <p><strong>Recomendación:</strong> {String(data.hasRecommendation)}</p>
              <p><strong>Oferta:</strong> {String(data.hasOffer)}</p>
              <p><strong>Venta sugerida:</strong> {String(data.hasSuggestedSale)}</p>
              <p><strong>Confianza:</strong> {data.classificationConfidence || "-"}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Transcripción</Card.Title>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {data.transcriptionText || "-"}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Análisis IA</Card.Title>
              {data.analysis ? (
                <>
                  <p><strong>Hubo recomendación:</strong> {String(data.analysis.hadRecommendation)}</p>
                  <p><strong>Hubo venta sugerida:</strong> {String(data.analysis.hadSuggestedSale)}</p>
                  <p><strong>Oportunidad perdida:</strong> {String(data.analysis.missedOpportunity)}</p>
                  <p><strong>Score atención:</strong> {data.analysis.scoreAttention ?? "-"}</p>
                  <p><strong>Score venta:</strong> {data.analysis.scoreSales ?? "-"}</p>
                  <p><strong>Resumen:</strong> {data.analysis.summary || "-"}</p>
                  <p><strong>Sugerencia de mejora:</strong> {data.analysis.improvementTip || "-"}</p>
                </>
              ) : (
                <div className="text-muted">Este segmento todavía no tiene análisis IA.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}