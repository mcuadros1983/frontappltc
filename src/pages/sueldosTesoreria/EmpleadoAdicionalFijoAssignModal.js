import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Alta de asignación de adicional fijo.
 * Seleccionás empleado y tipo dentro del modal.
 * Al abrir SIEMPRE resetea los campos a vacío.
 */
export default function EmpleadoAdicionalFijoAssignModal({ show, onClose, empleados, tipos }) {
  const [empleadoId, setEmpleadoId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [vigenciaDesde, setVigenciaDesde] = useState("");
  const [montoOverride, setMontoOverride] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Reset estricto al abrir
  useEffect(() => {
    if (show) {
      setErr(null);
      setEmpleadoId("");
      setTipoId("");
      setVigenciaDesde("");
      setMontoOverride("");
    }
  }, [show]);

  // Limpia definitivamente al terminar de cerrar (por si hay animaciones)
  const handleExited = () => {
    setErr(null);
    setEmpleadoId("");
    setTipoId("");
    setVigenciaDesde("");
    setMontoOverride("");
  };

  const nombreEmpleadoSeleccionado = useMemo(() => {
    const emp = empleados.find((e) => String(e?.empleado?.id) === String(empleadoId));
    const ap = emp?.clientePersona?.apellido || emp?.empleado?.apellido || "";
    const no = emp?.clientePersona?.nombre || emp?.empleado?.nombre || "";
    return `${ap} ${no}`.trim() || "-";
  }, [empleados, empleadoId]);

  const guardar = async () => {
    try {
      setSaving(true);
      setErr(null);

      if (!empleadoId) throw new Error("Seleccioná un empleado.");
      if (!tipoId) throw new Error("Seleccioná un tipo de adicional.");
      if (!vigenciaDesde) throw new Error("Ingresá vigencia desde.");

      const payload = {
        empleado_id: Number(empleadoId),
        adicionalfijotipo_id: Number(tipoId),
        vigencia_desde: vigenciaDesde,
        vigencia_hasta: null,
        monto_override: montoOverride !== "" ? Number(montoOverride) : null,
      };

      const r = await fetch(`${apiUrl}/empleadoadicionalfijo`, {
        method: "POST",
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
    <Modal
      show={show}
      onHide={() => onClose(false)}
      onExited={handleExited}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Asignar adicional fijo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Empleado</Form.Label>
          <Form.Select
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            className="form-control my-input"
          >
            <option value="">-- Seleccionar --</option>
            {empleados.map((item) => {
              const id = item?.empleado?.id;
              const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || "";
              const no = item?.clientePersona?.nombre || item?.empleado?.nombre || "";
              return (
                <option key={id} value={id}>
                  {ap} {no}
                </option>
              );
            })}
          </Form.Select>
          <small className="text-muted">Seleccionado: {nombreEmpleadoSeleccionado}</small>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tipo de adicional</Form.Label>
          <Form.Select
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            className="form-control my-input"
          >
            <option value="">-- Seleccionar --</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.descripcion}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Vigencia desde</Form.Label>
          <Form.Control
            type="date"
            value={vigenciaDesde}
            onChange={(e) => setVigenciaDesde(e.target.value)}
          />
        </Form.Group>
{/* */}
        {/* <Form.Group>
          <Form.Label>Monto override (opcional)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            placeholder="Dejar vacío para usar valor global"
            value={montoOverride}
            onChange={(e) => setMontoOverride(e.target.value)}
          />
        </Form.Group> */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" />
              Guardando…
            </>
          ) : (
            "Asignar"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
