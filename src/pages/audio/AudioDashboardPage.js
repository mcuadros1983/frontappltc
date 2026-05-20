import React, { useEffect, useState } from "react";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import AudioSyncRequestCard from "../../components/audio/AudioSyncRequestCard";
import AudioStatsCards from "../../components/audio/AudioStatsCards";
import { getAudioDashboard } from "../../services/audioApi";

export default function AudioDashboardPage() {
  const [stats, setStats] = useState({
    totalSegments: 0,
    analyzed: 0,
    withQuestion: 0,
    withRecommendation: 0,
    withSuggestedSale: 0,
    missedOpportunity: 0,
    avgAttention: 0,
    avgSales: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAudioDashboard();
      const payload = response?.data || response;

      setStats(
        payload?.data || {
          totalSegments: 0,
          analyzed: 0,
          withQuestion: 0,
          withRecommendation: 0,
          withSuggestedSale: 0,
          missedOpportunity: 0,
          avgAttention: 0,
          avgSales: 0,
        }
      );
    } catch (err) {
      setError(err?.message || "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSyncSuccess = () => {
    loadDashboard();
  };

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h3>Auditoría de Atención - Dashboard</h3>
        </Col>
      </Row>

      <AudioSyncRequestCard onSyncSuccess={handleSyncSuccess} />

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <AudioStatsCards stats={stats} />
      )}
    </Container>
  );
}