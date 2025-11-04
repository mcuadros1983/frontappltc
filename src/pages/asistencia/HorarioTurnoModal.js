import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

const toMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = String(hhmm).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const validar = ({ inicio_am, fin_am, inicio_pm, fin_pm }) => {
  const am_i = toMinutes(inicio_am), am_f = toMinutes(fin_am);
  const pm_i = toMinutes(inicio_pm), pm_f = toMinutes(fin_pm);
  if (am_i != null && am_f != null && am_i >= am_f) return "Rango AM inválido (inicio debe ser < fin).";
  if (pm_i != null && pm_f != null && pm_i >= pm_f) return "Rango PM inválido (inicio debe ser < fin).";
  return null;
};

export default function HorarioModal({ show, onClose, initialData }) {
  const isEdit = Boolean(initialData?.id);

  const [inicioAm, setInicioAm] = useState(initialData?.inicio_am || "");
  const [finAm, setFinAm] = useState(initialData?.fin_am || "");
  const [inicioPm, setInicioPm] = useState(initialData?.inicio_pm || "");
  const [finPm, setFinPm] = useState(initialData?.fin_pm || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!show) return;
    setErr(null);
    setInicioAm(initialData?.inicio_am || "");
    setFinAm(initialData?.fin_am || "");
    setInicioPm(initialData?.inicio_pm || "");
    setFinPm(initialData?.fin_pm || "");
  }, [show, initialData]);

  const guardar = async () => {
    const payload = {
      inicio_am: inicioAm || null,
      fin_am:    finAm   || null,
      inicio_pm: inicioPm|| null,
      fin_pm:    finPm   || null,
    };
    const v = validar(payload);
    if (v) { setErr(v); return; }

    setSaving(true);
    setErr(null);
    try {
      let r, data;
      if (isEdit) {
        r = await fetch(`${apiUrl}/horarioturno/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        data = await r.json().catch(() => null);
      } else {
        r = await fetch(`${apiUrl}/horarioturno`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        data = await r.json().catch(() => null);
      }
      if (!r.ok) throw new Error(data?.error || "No se pudo guardar el horario.");
      onClose(true);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const onExited = () => {
    setErr(null);
    setSaving(false);
    setInicioAm("");
    setFinAm("");
    setInicioPm("");
    setFinPm("");
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} onExited={onExited} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar horario" : "Nuevo horario"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>AM Inicio</Form.Label>
              <Form.Control
                type="time"
                value={inicioAm || ""}
                onChange={(e) => setInicioAm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>AM Fin</Form.Label>
              <Form.Control
                type="time"
                value={finAm || ""}
                onChange={(e) => setFinAm(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>PM Inicio</Form.Label>
              <Form.Control
                type="time"
                value={inicioPm || ""}
                onChange={(e) => setInicioPm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>PM Fin</Form.Label>
              <Form.Control
                type="time"
                value={finPm || ""}
                onChange={(e) => setFinPm(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving}>
          {saving ? (<><Spinner size="sm" className="me-2" /> Guardando…</>) : (isEdit ? "Guardar cambios" : "Crear")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
