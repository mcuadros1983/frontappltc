import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Row } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Modal para crear/editar teléfono de un empleado.
 * Validación: número de exactamente 10 dígitos (solo números).
 *
 * Props:
 *  - show: bool
 *  - onClose: (changed:boolean) => void
 *  - empleados: array con estructura similar a la que usás (empleado + clientePersona)
 *  - initialData: null | { id, empleado_id, numero, tipo? }
 */
export default function AsignarTelefonoModal({ show, onClose, empleados, initialData }) {
  const isEdit = Boolean(initialData?.id);

  const [empleadoId, setEmpleadoId] = useState(initialData?.empleado_id ? String(initialData.empleado_id) : "");
  const [numero, setNumero] = useState(initialData?.numero || "");
  const [tipo, setTipo] = useState(initialData?.tipo || "movil"); // opcional
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!show) return;
    // precargar cuando abre
    setErr(null);
    setEmpleadoId(initialData?.empleado_id ? String(initialData.empleado_id) : "");
    setNumero(initialData?.numero || "");
    setTipo(initialData?.tipo || "movil");
  }, [show, initialData]);

  const empleadosOpts = useMemo(() => {
    // Orden alfabético por apellido, nombre
    const list = [...(empleados || [])];
    list.sort((a, b) => {
      const apA = (a?.clientePersona?.apellido || a?.empleado?.apellido || "").toLowerCase();
      const apB = (b?.clientePersona?.apellido || b?.empleado?.apellido || "").toLowerCase();
      const noA = (a?.clientePersona?.nombre || a?.empleado?.nombre || "").toLowerCase();
      const noB = (b?.clientePersona?.nombre || b?.empleado?.nombre || "").toLowerCase();
      if (apA !== apB) return apA < apB ? -1 : 1;
      if (noA !== noB) return noA < noB ? -1 : 1;
      return 0;
    });
    return list;
  }, [empleados]);

  const nombreEmpleado = (item) => {
    const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || "";
    const no = item?.clientePersona?.nombre || item?.empleado?.nombre || "";
    const doc = item?.empleado?.cuil || "";
    const full = `${ap} ${no}`.trim();
    return `${full}${doc ? ` — ${doc}` : ""}`;
  };

  const validar = () => {
    if (!empleadoId) return "Seleccioná un empleado.";
    const clean = String(numero || "").trim();
    if (!/^\d{10}$/.test(clean)) {
      return "El número debe tener exactamente 10 dígitos (solo números).";
    }
    return null;
  };

  const guardar = async () => {
    const v = validar();
    if (v) { setErr(v); return; }

    setSaving(true);
    setErr(null);
    try {
      const payload = {
        empleado_id: Number(empleadoId),
        numero: String(numero).trim(),
        tipo: tipo || null, // opcional en backend
      };

      let r, data;
      if (isEdit) {
        r = await fetch(`${apiUrl}/telefonos/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ numero: payload.numero, tipo: payload.tipo }),
        });
        data = await r.json().catch(() => null);
      } else {
        r = await fetch(`${apiUrl}/telefonos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        data = await r.json().catch(() => null);
      }

      if (!r.ok) throw new Error(data?.error || "No se pudo guardar el teléfono.");

      onClose(true); // avisa que actualice la tabla
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
    setEmpleadoId("");
    setNumero("");
    setTipo("movil");
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} onExited={onExited} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar teléfono" : "Nueva asignación de teléfono"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Empleado</Form.Label>
          <Form.Select
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            disabled={isEdit} // opcional: bloquear cambio de empleado en edición
            className="form-control my-input"
          >
            <option value="">— Seleccioná un empleado —</option>
            {empleadosOpts.map((it) => {
              const id = it?.empleado?.id;
              return (
                <option key={id} value={id}>
                  {nombreEmpleado(it)}
                </option>
              );
            })}
          </Form.Select>
        </Form.Group>

        <Row className="g-3">
          <Form.Group className="mb-3">
            <Form.Label>Número (10 dígitos)</Form.Label>
            <Form.Control
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={10}
              placeholder="Ej: 3515551234"
              value={numero}
              onChange={(e) => {
                // Forzar solo dígitos y tope 10
                const onlyDigits = e.target.value.replace(/\D+/g, "").slice(0, 10);
                setNumero(onlyDigits);
              }}
            />
            <Form.Text className="text-muted">
              Solo números, sin prefijos ni símbolos. Ej: 3515551234
            </Form.Text>
          </Form.Group>

          {/* Campo tipo (opcional, si lo usás en el modelo) */}
          <Form.Group className="mb-1 mx-2">
            <Form.Label>Tipo</Form.Label>
            <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="form-control my-input">
              <option value="movil">Móvil</option>
              <option value="fijo">Fijo</option>
              <option value="otro">Otro</option>
            </Form.Select>
          </Form.Group>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving || !empleadoId || numero.length !== 10}>
          {saving ? (<><Spinner size="sm" className="me-2" /> Guardando…</>) : (isEdit ? "Guardar cambios" : "Asignar")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
