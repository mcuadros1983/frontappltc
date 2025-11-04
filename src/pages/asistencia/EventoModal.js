import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

const nombreEmpleado = (item) => {
  const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || item?.apellido || "";
  const no = item?.clientePersona?.nombre || item?.empleado?.nombre || item?.nombre || "";
  const full = `${ap} ${no}`.trim();
  return full || `Empleado #${item?.empleado?.id ?? item?.id ?? ""}`;
};

export default function EventoModal({ show, onClose, initialData, conceptos, sucursales, empleados }) {
  const isEdit = Boolean(initialData?.id);

  const [fechaDesde, setFechaDesde] = useState(initialData?.fecha_desde || "");
  const [fechaHasta, setFechaHasta] = useState(initialData?.fecha_hasta || "");
  const [conceptoId, setConceptoId] = useState(initialData?.concepto_id || "");
  const [empleadoId, setEmpleadoId] = useState(initialData?.empleado_id || "");
  const [sucursalId, setSucursalId] = useState(initialData?.sucursal_id || "");
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!show) return;
    setErr(null);
    setFechaDesde(initialData?.fecha_desde || "");
    setFechaHasta(initialData?.fecha_hasta || "");
    setConceptoId(initialData?.concepto_id || "");
    setEmpleadoId(initialData?.empleado_id || "");
    setSucursalId(initialData?.sucursal_id || "");
    setObservaciones(initialData?.observaciones || "");
  }, [show, initialData]);

  const conceptosOpts = useMemo(() => {
    const list = [...(conceptos || [])];
    list.sort((a, b) => String(a?.nombre || "").localeCompare(String(b?.nombre || "")));
    return list;
  }, [conceptos]);

  const sucursalesOpts = useMemo(() => {
    const list = [...(sucursales || [])];
    list.sort((a, b) => String(a?.nombre || "").localeCompare(String(b?.nombre || "")));
    return list;
  }, [sucursales]);

  const empleadosOpts = useMemo(() => {
    const list = [...(empleados || [])];
    // Filtrar solo empleados activos (sin fechabaja)
    const empleadosActivos = list.filter((e) => !e?.empleado?.fechabaja);
    // Orden alfabético por apellido, nombre (soporta estructuras mixtas)
    empleadosActivos.sort((a, b) => {
      const apA = (a?.clientePersona?.apellido || a?.empleado?.apellido || "").toLowerCase();
      const apB = (b?.clientePersona?.apellido || b?.empleado?.apellido || "").toLowerCase();
      const noA = (a?.clientePersona?.nombre || a?.empleado?.nombre || "").toLowerCase();
      const noB = (b?.clientePersona?.nombre || b?.empleado?.nombre || "").toLowerCase();
      if (apA !== apB) return apA < apB ? -1 : 1;
      if (noA !== noB) return noA < noB ? -1 : 1;
      return 0;
    });
    return empleadosActivos;
  }, [empleados]);

  const validar = () => {
    if (!fechaDesde) return "La fecha desde es requerida.";
    if (!fechaHasta) return "La fecha hasta es requerida.";
    if (new Date(fechaDesde) > new Date(fechaHasta)) return "Fecha desde no puede ser mayor que fecha hasta.";
    if (!Number(conceptoId)) return "Debés seleccionar un concepto.";
    if (!Number(empleadoId)) return "Debés seleccionar un empleado.";
    if (!Number(sucursalId)) return "Debés seleccionar una sucursal.";
    return null;
  };

  const guardar = async () => {
    const v = validar();
    if (v) { setErr(v); return; }

    setSaving(true);
    setErr(null);
    try {
      const payload = {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        concepto_id: Number(conceptoId),
        empleado_id: Number(empleadoId),
        sucursal_id: Number(sucursalId),
        observaciones: observaciones ? String(observaciones).trim() : null,
      };

      let r, data;
      if (isEdit) {
        r = await fetch(`${apiUrl}/eventos/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        data = await r.json().catch(() => null);
      } else {
        r = await fetch(`${apiUrl}/eventos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        data = await r.json().catch(() => null);
      }

      if (!r.ok) throw new Error(data?.error || "No se pudo guardar el evento.");
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
    setFechaDesde("");
    setFechaHasta("");
    setConceptoId("");
    setEmpleadoId("");
    setSucursalId("");
    setObservaciones("");
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} onExited={onExited} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar evento" : "Nuevo evento"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha Desde</Form.Label>
              <Form.Control type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha Hasta</Form.Label>
              <Form.Control type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
            </Form.Group>
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Concepto</Form.Label>
              <Form.Select value={conceptoId} onChange={(e) => setConceptoId(e.target.value)} className="my-input form-control">
                <option value="">— Seleccione —</option>
                {conceptosOpts.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Empleado</Form.Label>
              <Form.Select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} className="my-input form-control">
                <option value="">— Seleccione —</option>
                {empleadosOpts.map((e) => {
                  const id = e?.empleado?.id ?? e?.id;
                  return <option key={id} value={id}>{nombreEmpleado(e)}</option>;
                })}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Sucursal</Form.Label>
              <Form.Select value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} className="my-input form-control">
                <option value="">— Seleccione —</option>
                {sucursalesOpts.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-1">
          <Form.Label>Observaciones</Form.Label>
          <Form.Control
            type="text"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ingrese observaciones"
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving || !fechaDesde || !fechaHasta || !conceptoId || !empleadoId || !sucursalId}>
          {saving ? (<><Spinner size="sm" className="me-2" /> Guardando…</>) : (isEdit ? "Guardar cambios" : "Crear")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}