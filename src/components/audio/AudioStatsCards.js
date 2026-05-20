import React from "react";
import { Card, Col, Row } from "react-bootstrap";

function StatCard({ title, value }) {
  return (
    <Col md={3} sm={6} xs={12} className="mb-3">
      <Card className="shadow-sm h-100">
        <Card.Body>
          <div className="text-muted small mb-1">{title}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            {value ?? 0}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default function AudioStatsCards({ stats = {} }) {
  return (
    <Row>
      <StatCard title="Total segmentos" value={stats.totalSegments} />
      <StatCard title="Analizados" value={stats.analyzed} />
      <StatCard title="Con pregunta" value={stats.withQuestion} />
      <StatCard title="Con recomendación" value={stats.withRecommendation} />
      <StatCard title="Con venta sugerida" value={stats.withSuggestedSale} />
      <StatCard title="Oportunidades perdidas" value={stats.missedOpportunity} />
      <StatCard title="Promedio atención" value={stats.avgAttention} />
      <StatCard title="Promedio venta" value={stats.avgSales} />
    </Row>
  );
}