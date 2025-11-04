import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Crear/Editar Adicional Variable
 * Props:
 *  - show
 *  - onClose(didChange: bool)
 *  - editItem?: { id, empleado_id, descripcion, periodo, monto, observaciones }
 *  - empleados: [{ clientePersona, empleado }, ...]
 */
export default function AdicionalVariableEditModal({ show, onClose, editItem, empleados }) {
  const isEdit = !!editItem;

  const [empleadoId, setEmpleadoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (show) {
      setErr(null);
      if (isEdit) {
        setEmpleadoId(editItem?.empleado_id ?? "");
        setDescripcion(editItem?.descripcion ?? "");
        setPeriodo(editItem?.periodo ?? "");
        setMonto(editItem?.monto != null ? String(editItem.monto) : "");
        setObservaciones(editItem?.observaciones ?? "");
      } else {
        const firstEmpId = empleados.length ? empleados[0]?.empleado?.id ?? "" : "";
        setEmpleadoId(firstEmpId);
        setDescripcion("");
        setPeriodo("");
        setMonto("");
        setObservaciones("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isEdit]);

  const empleadoLabel = useMemo(() => {
    const emp = empleados.find((e) => String(e?.empleado?.id) === String(empleadoId));
    const ap = emp?.clientePersona?.apellido || emp?.empleado?.apellido || "";
    const no = emp?.clientePersona?.nombre || emp?.empleado?.nombre || "";
    return `${ap} ${no}`.trim();
  }, [empleados, empleadoId]);

  const guardar = async () => {
    try {
      setSaving(true);
      setErr(null);

      if (!empleadoId) throw new Error("Seleccioná un empleado.");
      if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) throw new Error("Período inválido (YYYY-MM).");
      if (monto === "" || Number.isNaN(Number(monto))) throw new Error("Monto inválido.");

      const payload = {
        empleado_id: Number(empleadoId),
        descripcion: descripcion || null,
        periodo,
        monto: Number(monto), // admite negativos
        observaciones: observaciones || null,
      };

      const url = isEdit ? `${apiUrl}/adicionalvariable/${editItem.id}` : `${apiUrl}/adicionalvariable`;
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

  const onExited = () => {
    setErr(null);
    setEmpleadoId("");
    setDescripcion("");
    setPeriodo("");
    setMonto("");
    setObservaciones("");
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} onExited={onExited} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar adicional variable" : "Nuevo adicional variable"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Empleado</Form.Label>
          <Form.Select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}     className="form-control my-input">
            {empleados.length === 0 && <option value="">— Sin empleados —</option>}
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
          <small className="text-muted">Seleccionado: {empleadoLabel || "—"}</small>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej.: Horas extra, Premio, Ajuste, Viáticos…"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Período (YYYY-MM)</Form.Label>
          <Form.Control
            type="month"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Monto (usar negativo para descuento)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej.: 20000 o -30000"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Observaciones</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving}>
          {saving ? <><Spinner size="sm" className="me-2" />Guardando…</> : (isEdit ? "Actualizar" : "Crear")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
