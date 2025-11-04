import { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Cierra vigencia de una asignación (setea vigencia_hasta).
 * Props:
 *  - show
 *  - onClose(didChange: bool)
 *  - asignacion  { id, vigencia_desde, vigencia_hasta, AdicionalFijoTipo }
 */
export default function EmpleadoAdicionalFijoCerrarModal({ show, onClose, asignacion }) {
  const [vigenciaHasta, setVigenciaHasta] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const cerrar = async () => {
    try {
      setSaving(true);
      setErr(null);
      if (!vigenciaHasta) throw new Error("Indicá la fecha de cierre (vigencia hasta).");

      const r = await fetch(`${apiUrl}/empleadoadicionalfijo/${asignacion.id}/cerrar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vigencia_hasta: vigenciaHasta }), credentials: "include",
      });

      if (!r.ok) {
        const x = await r.json().catch(() => ({}));
        throw new Error(x?.error || "No se pudo cerrar la vigencia.");
      }

      onClose(true);
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo cerrar la vigencia.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Cerrar vigencia — {asignacion?.AdicionalFijoTipo?.descripcion || `Tipo #${asignacion?.adicionalfijotipo_id}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <div className="mb-2">
          <small className="text-muted">
            Vigencia actual: {asignacion?.vigencia_desde} → {asignacion?.vigencia_hasta ?? "abierto"}
          </small>
        </div>

        <Form.Group>
          <Form.Label>Vigencia hasta</Form.Label>
          <Form.Control
            type="date"
            value={vigenciaHasta}
            onChange={(e) => setVigenciaHasta(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={cerrar} disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" />
              Cerrando…
            </>
          ) : (
            "Cerrar vigencia"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
