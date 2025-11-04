import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Crear/Editar tipo de adicional variable (descripción + categoría opcional).
 * Props:
 *  - show
 *  - onClose(didChange: bool)
 *  - editItem?: { id, descripcion, categoria }
 */
export default function AdicionalVariableTipoCreateModal({ show, onClose, editItem }) {
  const isEdit = !!editItem;

  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState(""); // "", "adicional", "descuento"
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Reset / precarga al abrir
  useEffect(() => {
    if (show) {
      setErr(null);
      if (isEdit) {
        setDescripcion(editItem?.descripcion || "");
        setCategoria(editItem?.categoria || "");
      } else {
        setDescripcion("");
        setCategoria("");
      }
    }
  }, [show, isEdit, editItem]);

  const handleExited = () => {
    setErr(null);
    setDescripcion("");
    setCategoria("");
  };

  const guardar = async () => {
    try {
      setSaving(true);
      setErr(null);
      if (!descripcion.trim()) throw new Error("La descripción es requerida.");

      const payload = {
        descripcion: descripcion.trim(),
        categoria: categoria || null, // opcional
      };

      const url = isEdit
        ? `${apiUrl}/adicionalvariabletipo/${editItem.id}`
        : `${apiUrl}/adicionalvariabletipo`;
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
    <Modal show={show} onHide={() => onClose(false)} onExited={handleExited} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar tipo de adicional variable" : "Crear tipo de adicional variable"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej.: Horas extra, Viáticos, Premio, etc."
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Categoría (opcional)</Form.Label>
          <Form.Select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="form-control my-input"
          >
            <option value="">-- Sin categoría --</option>
            <option value="adicional">adicional</option>
            <option value="descuento">descuento</option>
          </Form.Select>
          <Form.Text className="text-muted">
            Usá “adicional” para haberes que suman y “descuento” para deducciones. Si lo dejás vacío, se guarda sin categoría.
          </Form.Text>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving}>
          {saving ? (<><Spinner size="sm" className="me-2" />Guardando…</>) : (isEdit ? "Actualizar" : "Guardar")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
