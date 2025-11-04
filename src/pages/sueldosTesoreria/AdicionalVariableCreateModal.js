import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Carga manual de Adicional Variable
 * Props:
 *  - show
 *  - onClose(didChange: bool)
 *  - empleados: [{ clientePersona, empleado }, ...]
 *  - tipos: [{ id, descripcion }, ...]
 *  - defaultPeriodo?: "YYYY-MM" (opcional)
 */
export default function AdicionalVariableCreateModal({
  show,
  onClose,
  empleados,
  tipos,
  defaultPeriodo = "",
}) {
  const [empleadoId, setEmpleadoId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [periodo, setPeriodo] = useState(defaultPeriodo || "");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // reset estricto al abrir
  useEffect(() => {
    if (show) {
      setErr(null);
      setEmpleadoId("");
      setTipoId("");
      setPeriodo(defaultPeriodo || "");
      setMonto("");
      setObservaciones("");
    }
  }, [show, defaultPeriodo]);

  const handleExited = () => {
    setErr(null);
    setEmpleadoId("");
    setTipoId("");
    setPeriodo(defaultPeriodo || "");
    setMonto("");
    setObservaciones("");
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
      if (!tipoId) throw new Error("Seleccioná un tipo.");
      if (!periodo) throw new Error("Indicá el período (YYYY-MM).");
      if (monto === "" || isNaN(Number(monto))) throw new Error("Indicá un monto válido.");

      const payload = {
        empleado_id: Number(empleadoId),
        adicionalvariabletipo_id: Number(tipoId),
        periodo,                       // "YYYY-MM"
        monto: Number(monto),
        observaciones: observaciones?.trim() || null,
      };

      const r = await fetch(`${apiUrl}/adicionalvariable`, {
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
    <Modal show={show} onHide={() => onClose(false)} onExited={handleExited} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cargar adicional variable</Modal.Title>
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
          <Form.Label>Tipo</Form.Label>
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
          <Form.Label>Período</Form.Label>
          <Form.Control
            type="month"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            placeholder="YYYY-MM"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Monto</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Observaciones (opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas…"
          />
        </Form.Group>
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
            "Guardar"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
