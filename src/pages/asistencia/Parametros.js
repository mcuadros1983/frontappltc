import React, { useEffect, useState } from 'react';
import { parametrosApi } from '../../services/parametrosApi';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";
export default function Parametros() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    threshold_cosine: 0.62,
    ventana_min_repeticion: 5,
    tz: process.env.REACT_APP_TZ || 'America/Argentina/Cordoba',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await parametrosApi.get();
        if (data && Object.keys(data).length) setForm({
          threshold_cosine: data.threshold_cosine ?? 0.62,
          ventana_min_repeticion: data.ventana_min_repeticion ?? 5,
          tz: data.tz || (process.env.REACT_APP_TZ || 'America/Argentina/Cordoba')
        });
      } catch (e) {
        setErr(e.message || 'Error cargando parámetros');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setSaved(false);
    try {
      await parametrosApi.update({
        threshold_cosine: Number(form.threshold_cosine),
        ventana_min_repeticion: Number(form.ventana_min_repeticion),
        tz: form.tz
      });
      setSaved(true);
    } catch (e) {
      alert(e.message || 'Error al guardar parámetros');
    }
  }

  if (loading) return <div>Cargando parámetros…</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

return (
  <Container fluid className="mt-3 cpm-page">
    <Row>
      <Col lg={8} md={10} className="mx-auto">
        <Card className="cpm-card">
          <Card.Header className="cpm-header">
            <strong>Parámetros del sistema</strong>
          </Card.Header>

          <Card.Body>
            <Form onSubmit={onSave} className="cpm-filters">
              <Row className="g-3">
                <Col sm={4}>
                  <Form.Label className="mb-1">Umbral cosine</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={form.threshold_cosine}
                    onChange={(e) =>
                      setForm({ ...form, threshold_cosine: e.target.value })
                    }
                    className="form-control my-input"
                  />
                </Col>

                <Col sm={4}>
                  <Form.Label className="mb-1">Ventana anti-doble-marca (min)</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.ventana_min_repeticion}
                    onChange={(e) =>
                      setForm({ ...form, ventana_min_repeticion: e.target.value })
                    }
                    className="form-control my-input"
                  />
                </Col>

                <Col sm={4}>
                  <Form.Label className="mb-1">Zona horaria</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.tz}
                    onChange={(e) =>
                      setForm({ ...form, tz: e.target.value })
                    }
                    placeholder="Ej: America/Argentina/Buenos_Aires"
                    className="form-control my-input"
                  />
                </Col>

                <Col xs={12}>
                  <Button type="submit" className="cpm-btn">
                    Guardar
                  </Button>
                  {saved && (
                    <span className="ms-3 text-success fw-medium">
                      Guardado
                    </span>
                  )}
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);
}
