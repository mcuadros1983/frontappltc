import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Modal para crear/editar tipo de adicional variable (solo descripción).
 * Props:
 * - show
 * - onClose(didChange: bool)
 * - editItem (obj|null)
 */
export default function AdicionalVariableTipoModal({ show, onClose, editItem }) {
  const isEdit = !!editItem;
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (show) {
      setErr(null);
      setDescripcion(isEdit ? (editItem?.descripcion || "") : "");
    }
  }, [show, isEdit, editItem]);

  const guardar = async () => {
    try {
      setSaving(true);
      setErr(null);
      if (!descripcion.trim()) throw new Error("La descripción es requerida.");

      const payload = { descripcion: descripcion.trim() };
      const url = isEdit ? `${apiUrl}/adicionalvariabletipo/${editItem.id}` : `${apiUrl}/adicionalvariabletipo`;
      const method = isEdit ? "PUT" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), credentials: "include",
      });

      if (!r.ok) {
        const x = await r.json().catch(() => ({}));
        throw new Error(x?.error || "No se pudo guardar.");
      }
      onClose(true);
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar tipo" : "Crear tipo"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}
        <Form.Group>
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej.: Horas extra, Viáticos, Premios…"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving}>
          {saving ? (<><Spinner size="sm" className="me-2" />Guardando…</>) : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
