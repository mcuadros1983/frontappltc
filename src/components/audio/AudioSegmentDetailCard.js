import React from "react";
import { Badge, Card, Col, Row } from "react-bootstrap";

function boolBadge(value) {
  return value ? <Badge bg="success">Sí</Badge> : <Badge bg="secondary">No</Badge>;
}

export default function AudioSegmentDetailCard({ data }) {
  if (!data) return null;

  return (
    <>
      <Card className="shadow-sm mb-3">
        <Card.Header>Datos del segmento</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <p><strong>ID:</strong> {data.id}</p>
              <p><strong>Segment ID:</strong> {data.segmentId}</p>
              <p><strong>Sucursal:</strong> {data.sucursalCodigo}</p>
              <p><strong>Fecha:</strong> {data.fecha}</p>
              <p><strong>Archivo:</strong> {data.fileName || "-"}</p>
            </Col>
            <Col md={4}>
              <p><strong>Fecha local:</strong> {data.createdAtLocal || "-"}</p>
              <p><strong>Duración:</strong> {data.durationMs ?? "-"} ms</p>
              <p><strong>Sample rate:</strong> {data.sampleRate ?? "-"}</p>
              <p><strong>Motivo:</strong> {data.reason || "-"}</p>
              <p><strong>Estado transcripción:</strong> {data.transcriptionStatus || "-"}</p>
            </Col>
            <Col md={4}>
              <p><strong>Motor:</strong> {data.transcriptionEngine || "-"}</p>
              <p><strong>Modelo:</strong> {data.transcriptionModel || "-"}</p>
              <p><strong>Actualizado:</strong> {data.transcriptionUpdatedAt || "-"}</p>
              <p><strong>Estado análisis:</strong> {data.analysisStatus || "-"}</p>
              <p><strong>Confianza:</strong> {data.classificationConfidence || "-"}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Header>Clasificación local</Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}><strong>¿Tiene texto?</strong> {boolBadge(data.hasText)}</Col>
            <Col md={3}><strong>¿Pregunta?</strong> {boolBadge(data.hasQuestion)}</Col>
            <Col md={3}><strong>¿Recomendación?</strong> {boolBadge(data.hasRecommendation)}</Col>
            <Col md={3}><strong>¿Oferta?</strong> {boolBadge(data.hasOffer)}</Col>
          </Row>
          <Row className="mt-3">
            <Col md={3}><strong>¿Venta sugerida?</strong> {boolBadge(data.hasSuggestedSale)}</Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Header>Transcripción</Card.Header>
        <Card.Body style={{ whiteSpace: "pre-wrap" }}>
          {data.transcriptionText || "Sin transcripción"}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Header>Análisis IA</Card.Header>
        <Card.Body>
          {data.analysis ? (
            <>
              <Row>
                <Col md={4}>
                  <p><strong>¿Hubo recomendación?</strong> {boolBadge(data.analysis.hadRecommendation)}</p>
                  <p><strong>¿Hubo venta sugerida?</strong> {boolBadge(data.analysis.hadSuggestedSale)}</p>
                  <p><strong>¿Oportunidad perdida?</strong> {boolBadge(data.analysis.missedOpportunity)}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Score atención:</strong> {data.analysis.scoreAttention ?? "-"}</p>
                  <p><strong>Score venta:</strong> {data.analysis.scoreSales ?? "-"}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Creado:</strong> {data.analysis.createdAt || "-"}</p>
                  <p><strong>Actualizado:</strong> {data.analysis.updatedAt || "-"}</p>
                </Col>
              </Row>

              <hr />

              <p><strong>Resumen:</strong></p>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {data.analysis.summary || "-"}
              </div>

              <p className="mt-3"><strong>Sugerencia de mejora:</strong></p>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {data.analysis.improvementTip || "-"}
              </div>
            </>
          ) : (
            <div>No hay análisis IA disponible para este segmento.</div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}