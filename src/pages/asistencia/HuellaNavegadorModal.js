// HuellaNavegadorModal.jsx
import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Alert, Row, Col } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

export default function HuellaNavegadorModal({ show, onClose, initialData, sucursales = [] }) {
  const isEdit = Boolean(initialData?.id);

  const [sucursalId, setSucursalId] = useState(initialData?.sucursal_id ?? "");
  const [fingerprint, setFingerprint] = useState(initialData?.fingerprint ?? "");
  const [ipAddress, setIpAddress] = useState(initialData?.ip_address ?? ""); // opcional
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Ordeno sucursales por nombre
  const sucs = useMemo(() => {
    return [...(sucursales || [])].sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || "")));
  }, [sucursales]);

  useEffect(() => {
    setErr(null);
  }, [show]);

  const canSave = String(sucursalId).trim() !== "" && String(fingerprint).trim() !== "";

  const handleSave = async () => {
    if (!canSave) {
      setErr("Completá Sucursal y Fingerprint.");
      return;
    }
    setSaving(true);
    setErr(null);

    try {
      const payload = {
        sucursal_id: Number(sucursalId),
        fingerprint: String(fingerprint),
      };
      // ip_address sólo si lo completan (backend de todas formas resuelve la IP si no va)
      if (ipAddress && String(ipAddress).trim()) payload.ip_address = String(ipAddress).trim();

      let r;
      if (isEdit) {
        // PUT /huellanavegador/:id
        r = await fetch(`${apiUrl}/huellanavegador/${initialData.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // POST /huellanavegador
        r = await fetch(`${apiUrl}/huellanavegador`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await r.json().catch(() => null);
      if (!r.ok) {
        throw new Error(data?.error || (isEdit ? "No se pudo actualizar." : "No se pudo crear."));
      }
      onClose(true); // cerrar y refrescar lista
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar Huella de Dispositivo" : "Nueva Huella de Dispositivo"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger" className="mb-3">{err}</Alert>}

        <Form>
          <Row className="g-3">
            <Col md={12}>
              <Form.Label>Sucursal <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={sucursalId}
                onChange={(e) => setSucursalId(e.target.value)}
                className="my-input form-control"
              >
                <option value="">Seleccioná…</option>
                {sucs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre || s.codigo || `#${s.id}`} (#{s.id})
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={12}>
              <Form.Label>Fingerprint <span className="text-danger">*</span></Form.Label>
              <Form.Control
                value={fingerprint}
                onChange={(e) => setFingerprint(e.target.value)}
                placeholder="ID único del dispositivo"
              />
              <Form.Text>El móvil Flutter lo genera con device_info_plus (AndroidId / fallback).</Form.Text>
            </Col>

            <Col md={12}>
              <Form.Label>IP (opcional)</Form.Label>
              <Form.Control
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Se puede dejar vacío (se resuelve en backend)"
              />
            </Col>

            {isEdit && (
              <Col md={12}>
                <Form.Text className="text-muted">
                  ID: #{initialData.id} — Último acceso: {initialData.accessed_at ? new Date(initialData.accessed_at).toLocaleString() : "—"}
                </Form.Text>
              </Col>
            )}
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!canSave || saving}>
          {saving ? <><Spinner size="sm" className="me-2" />Guardando…</> : (isEdit ? "Guardar cambios" : "Crear")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
