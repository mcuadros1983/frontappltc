import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ConceptoModal({ show, onClose, initialData }) {
  const isEdit = Boolean(initialData?.id);

  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [codigo, setCodigo] = useState(initialData?.codigo || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!show) return;
    setErr(null);
    setNombre(initialData?.nombre || "");
    setCodigo(initialData?.codigo || "");
  }, [show, initialData]);

  const validar = () => {
    if (!String(nombre).trim()) return "El nombre es requerido.";
    if (!String(codigo).trim()) return "El código es requerido.";
    // Podés agregar regex para el código si querés un formato particular
    return null;
  };

  const guardar = async () => {
    const v = validar();
    if (v) { setErr(v); return; }

    setSaving(true);
    setErr(null);
    try {
      const payload = {
        nombre: String(nombre).trim(),
        codigo: String(codigo).trim(),
      };

      let r, data;
      if (isEdit) {
        r = await fetch(`${apiUrl}/conceptos/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        data = await r.json().catch(() => null);
      } else {
        r = await fetch(`${apiUrl}/conceptos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        data = await r.json().catch(() => null);
      }

      if (!r.ok) {
        // Mensaje más claro para violación de índice único
        const msg = data?.error || (data?.detalle?.includes("unique") ? "Nombre o código duplicado." : "No se pudo guardar el concepto.");
        throw new Error(msg);
      }

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
    setNombre("");
    setCodigo("");
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} onExited={onExited} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar concepto" : "Nuevo concepto"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Feriado"
            autoFocus
          />
        </Form.Group>

        <Form.Group className="mb-1">
          <Form.Label>Código</Form.Label>
          <Form.Control
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ej: FER-ARG-2025"
          />
          <Form.Text className="text-muted">
            Debe ser único. Ejemplos: VAC-2025, SUSP-001, FERIADO-NAC.
          </Form.Text>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving || !nombre.trim() || !codigo.trim()}>
          {saving ? (<><Spinner size="sm" className="me-2" /> Guardando…</>) : (isEdit ? "Guardar cambios" : "Crear")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
