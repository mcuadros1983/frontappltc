import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Modal para CREAR y EDITAR AdicionalFijoTipo.
 * Props:
 *  - show (bool)
 *  - onClose(didChange: bool)
 *  - editItem (obj|null)
 *  - empresa_id (number|null)
 */
export default function AdicionalFijoTipoModal({ show, onClose, editItem, empresa_id }) {
  const isEdit = !!editItem;

  const [descripcion, setDescripcion] = useState("");
  const [empresaId, setEmpresaId] = useState(empresa_id || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    if (isEdit) {
      setDescripcion(editItem?.descripcion || "");
      setEmpresaId(editItem?.empresa_id ?? empresa_id ?? null);
    } else {
      setDescripcion("");
      setEmpresaId(empresa_id ?? null);
    }
  }, [isEdit, editItem, empresa_id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        descripcion: descripcion?.trim() || null,
        // si tu backend requiere empresa_id, lo enviamos; si no, podés quitarlo
        ...(empresaId ? { empresa_id: empresaId } : {}),
      };

      if (isEdit) {
        await fetch(`${apiUrl}/adicionalfijotipo/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload), credentials: "include",
        });
      } else {
        await fetch(`${apiUrl}/adicionalfijotipo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload), credentials: "include",
        });
      }

      onClose(true);
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Editar adicional fijo (Tipo)" : "Crear adicional fijo (Tipo)"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej.: Jefatura, Coordinación, etc."
          />
        </Form.Group>

        {/* Si querés ocultar empresa_id en UI, podés dejarlo como hidden o removerlo */}
        <Form.Group className="mb-1" hidden>
          <Form.Label  >Empresa (ID)</Form.Label>
          <Form.Control
            type="number"
            value={empresaId ?? ""}
            onChange={(e) => setEmpresaId(e.target.value ? Number(e.target.value) : null)}
            placeholder="ID de empresa (opcional si el backend lo exige)"
            
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" /> Guardando...
            </>
          ) : isEdit ? (
            "Guardar cambios"
          ) : (
            "Crear"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
