
// LiquidacionModal.js
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

const apiUrl2 = process.env.REACT_APP_API_URL;

export default function PeriodoModal({ show, onHide, onCreated, existingPeriods = [] }) {
    const hoy = new Date();
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [fechaDesde, setFechaDesde] = useState(isoFirstDay(hoy.getFullYear(), hoy.getMonth() + 1));
    const [fechaHasta, setFechaHasta] = useState(isoLastDay(hoy.getFullYear(), hoy.getMonth() + 1));

    const [err, setErr] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Autocompletar al cambiar año/mes
        setFechaDesde(isoFirstDay(anio, mes));
        setFechaHasta(isoLastDay(anio, mes));
    }, [anio, mes]);

    const yaExistePeriodo = useMemo(() => {
        return existingPeriods?.some((p) => Number(p.anio) === Number(anio) && Number(p.mes) === Number(mes));
    }, [existingPeriods, anio, mes]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(null);

        // Validaciones simples
        if (!anio || !mes || !fechaDesde || !fechaHasta) {
            setErr("Completá todos los campos.");
            return;
        }
        if (new Date(fechaDesde) > new Date(fechaHasta)) {
            setErr("La fecha DESDE no puede ser mayor a la fecha HASTA.");
            return;
        }
        if (yaExistePeriodo) {
            setErr("Ya existe un período con ese año y mes.");
            return;
        }

        try {
            setSubmitting(true);
            const r = await fetch(`${apiUrl2}/periodoliquidacion`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ anio: Number(anio), mes: Number(mes), fecha_desde: fechaDesde, fecha_hasta: fechaHasta })
            });
            if (!r.ok) throw new Error("No se pudo crear el período");
            const nuevo = await r.json();
            onCreated?.(nuevo);
            onHide?.();
        } catch (e) {
            setErr(e.message || "Error al crear el período");
        } finally {
            setSubmitting(false);
        }
    };

    return (
  <Modal
    show={show}
    onHide={onHide}
    backdrop="static"
    centered
    className="rpm-modal"
  >
    <Form onSubmit={onSubmit}>
      <Modal.Header closeButton className="rpm-modal-header">
        <Modal.Title className="fw-semibold">Nuevo período</Modal.Title>
      </Modal.Header>

      <Modal.Body className="rpm-modal-body">
        {err && (
          <Alert variant="danger" className="rpm-alert mb-3">
            {err}
          </Alert>
        )}

        <Row className="g-3">
          <Col md={4}>
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              min={2000}
              max={2100}
              required
              className="form-control my-input rpm-input"
            />
          </Col>

          <Col md={4}>
            <Form.Label>Mes</Form.Label>
            <Form.Select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              required
              className="form-control my-input rpm-input"
            >
              <option value="">Seleccione...</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString("es-AR", { month: "long" })}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6}>
            <Form.Label>Fecha desde</Form.Label>
            <Form.Control
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              required
              className="form-control my-input rpm-input"
            />
          </Col>

          <Col md={6}>
            <Form.Label>Fecha hasta</Form.Label>
            <Form.Control
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              required
              className="form-control my-input rpm-input"
            />
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between rpm-modal-footer">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={submitting}
          className="rpm-btn-outline"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={submitting}
          className="rpm-btn"
        >
          {submitting ? (
            <>
              <Spinner size="sm" animation="border" className="me-1" />
              Guardando...
            </>
          ) : (
            "Crear período"
          )}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);
}

// Helpers
function isoFirstDay(y, m) {
    const d = new Date(Number(y), Number(m) - 1, 1);
    return toISO(d);
}
function isoLastDay(y, m) {
    const d = new Date(Number(y), Number(m), 0); // día 0 del mes siguiente = último del mes
    return toISO(d);
}
function toISO(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
