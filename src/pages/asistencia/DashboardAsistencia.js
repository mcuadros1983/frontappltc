import React, { useEffect, useState } from 'react';
import CardKPI from '../../components/common/CardKPI';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import Heatmap from '../../components/charts/Heatmap';
import { fetchResumenMetricas } from '../../services/metricasApi';
import {
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";

export default function DashboardAsistencia() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchResumenMetricas(); // por defecto rango backend
        setResumen(data);
      } catch (e) {
        setError(e.message || 'Error cargando métricas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Cargando métricas…</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!resumen) return null;

  const aciertos = resumen?.tasa_reconocimiento?.aciertos || 0;
  const fallos = resumen?.tasa_reconocimiento?.fallos || 0;
  const ratio = resumen?.tasa_reconocimiento?.ratio || 0;

return (
  <Container fluid className="mt-3 cpm-page">
    <Row className="g-3">
      <Col xs={12} sm={6} lg={3}>
        <CardKPI
          title="Asistencias (hoy)"
          value={resumen?.serie_diaria?.slice(-1)?.[0]?.total ?? 0}
          className="cpm-kpi"
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <CardKPI
          title="Llegadas tarde"
          value={resumen?.llegadas_tarde?.total ?? 0}
          className="cpm-kpi"
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <CardKPI
          title="Ausentismo"
          value={`${resumen?.ausentismo?.tasa ?? 0}%`}
          subtitle={`${resumen?.ausentismo?.total ?? 0} casos`}
          className="cpm-kpi"
        />
      </Col>
      <Col xs={12} sm={6} lg={3}>
        <CardKPI
          title="Reconocimiento"
          value={`${(ratio * 100).toFixed(1)}%`}
          subtitle={`${aciertos} OK / ${fallos} fallos`}
          className="cpm-kpi"
        />
      </Col>
    </Row>

    <Row className="g-3 mt-3">
      <Col lg={8}>
        <Card className="cpm-card h-100">
          <Card.Body className="p-3">
            <LineChart
              data={resumen?.serie_diaria || []}
              xKey="fecha"
              yKey="total"
              className="cpm-chart"
            />
          </Card.Body>
        </Card>
      </Col>

      <Col lg={4}>
        <Card className="cpm-card h-100">
          <Card.Body className="p-3">
            <BarChart
              data={resumen?.top_tardanzas || []}
              xKey="nombre"
              yKey="count"
              title="Top tardanzas"
              className="cpm-chart"
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <Row className="mt-3">
      <Col>
        <Card className="cpm-card">
          <Card.Body className="p-3">
            <Heatmap
              data={resumen?.heatmap_horas || []}
              className="cpm-chart"
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
  );
}
