import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

const DIAS = [
  { value: "", label: "— Sin asignar —" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export default function DatosEmpleadoModal({ show, onClose, empleados, sucursales, initialData }) {
  const isEdit = Boolean(initialData?.empleado_id);

  const [empleadoId, setEmpleadoId] = useState(initialData?.empleado_id ? String(initialData.empleado_id) : "");
  const [telefono, setTelefono] = useState(initialData?.telefono || "");
  const [sucursalId, setSucursalId] = useState(
    initialData?.sucursal_id != null ? String(initialData.sucursal_id) : ""
  );
  const [francoAm, setFrancoAm] = useState(initialData?.franco_am ?? "");
  const [francoPm, setFrancoPm] = useState(initialData?.franco_pm ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!show) return;
    setErr(null);
    setEmpleadoId(initialData?.empleado_id ? String(initialData.empleado_id) : "");
    setTelefono(initialData?.telefono || "");
    setSucursalId(initialData?.sucursal_id != null ? String(initialData.sucursal_id) : "");
    setFrancoAm(initialData?.franco_am ?? "");
    setFrancoPm(initialData?.franco_pm ?? "");
  }, [show, initialData]);

  const empleadosOpts = useMemo(() => {
    const list = [...(empleados || [])];
    list.sort((a, b) => {
      const apA = (a?.clientePersona?.apellido || a?.empleado?.apellido || a?.apellido || "").toLowerCase();
      const apB = (b?.clientePersona?.apellido || b?.empleado?.apellido || b?.apellido || "").toLowerCase();
      const noA = (a?.clientePersona?.nombre || a?.empleado?.nombre || a?.nombre || "").toLowerCase();
      const noB = (b?.clientePersona?.nombre || b?.empleado?.nombre || b?.nombre || "").toLowerCase();
      if (apA !== apB) return apA < apB ? -1 : 1;
      if (noA !== noB) return noA < noB ? -1 : 1;
      return 0;
    });
    return list;
  }, [empleados]);

  const sucursalesOpts = useMemo(() => {
    const list = [...(sucursales || [])];
    list.sort((a, b) => {
      const na = (a?.nombre || a?.descripcion || a?.denominacion || "").toLowerCase();
      const nb = (b?.nombre || b?.descripcion || b?.denominacion || "").toLowerCase();
      if (na !== nb) return na < nb ? -1 : 1;
      return 0;
    });
    return list;
  }, [sucursales]);

  const nombreEmpleado = (item) => {
    const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || item?.apellido || "";
    const no = item?.clientePersona?.nombre || item?.empleado?.nombre || item?.nombre || "";
    const doc = item?.empleado?.cuil || item?.cuil || "";
    const full = `${ap} ${no}`.trim();
    return `${full}${doc ? ` — ${doc}` : ""}`;
  };

  // Validación liviana: empleado obligatorio, teléfono opcional pero si se ingresa debe ser 10 dígitos
  const validar = () => {
    if (!empleadoId) return "Seleccioná un empleado.";
    const clean = String(telefono || "").trim();
    if (clean && !/^\d{10}$/.test(clean)) {
      return "Si cargás teléfono, debe tener exactamente 10 dígitos (solo números).";
    }
    const fam = francoAm === "" ? null : Number(francoAm);
    const fpm = francoPm === "" ? null : Number(francoPm);
    if (fam && (fam < 1 || fam > 7)) return "Franco AM debe estar entre 1 y 7.";
    if (fpm && (fpm < 1 || fpm > 7)) return "Franco PM debe estar entre 1 y 7.";
    return null;
  };

  const guardar = async () => {
    const v = validar();
    if (v) { setErr(v); return; }

    setSaving(true);
    setErr(null);
    try {
      const empleado_id_num = Number(empleadoId);
      const payload = {
        telefono: telefono ? String(telefono).trim() : null,
        sucursal_id: sucursalId ? Number(sucursalId) : null,
        franco_am: francoAm === "" ? null : Number(francoAm),
        franco_pm: francoPm === "" ? null : Number(francoPm),
      };

      const method = isEdit ? "PUT" : "POST";
      const r = await fetch(`${apiUrl}/empleados/${empleado_id_num}/datos`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ empleado_id: empleado_id_num, ...payload }),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo guardar los datos.");

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
    setEmpleadoId("");
    setTelefono("");
    setSucursalId("");
    setFrancoAm("");
    setFrancoPm("");
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} onExited={onExited} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar datos del empleado" : "Nuevos datos del empleado"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Empleado</Form.Label>
          <Form.Select
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            disabled={isEdit} // en edición, mantenemos el empleado fijo
            className="form-control my-input"
          >
            <option value="">— Seleccioná un empleado —</option>
            {empleadosOpts.map((it) => {
              const id = it?.empleado?.id ?? it?.id;
              return (
                <option key={id} value={id}>
                  {nombreEmpleado(it)}
                </option>
              );
            })}
          </Form.Select>
        </Form.Group>

        <Row className="g-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono (10 dígitos)</Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={10}
                placeholder="Ej: 3515551234"
                value={telefono}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D+/g, "").slice(0, 10);
                  setTelefono(onlyDigits);
                }}
              />
              <Form.Text className="text-muted">Opcional. Solo números.</Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Sucursal</Form.Label>
              <Form.Select
                value={sucursalId}
                onChange={(e) => setSucursalId(e.target.value)}
                className="form-control my-input"
              >
                <option value="">— Sin asignar —</option>
                {sucursalesOpts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s?.nombre || s?.descripcion || s?.denominacion || `Sucursal #${s.id}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Franco AM</Form.Label>
              <Form.Select value={francoAm} onChange={(e) => setFrancoAm(e.target.value)} className="form-control my-input">
                {DIAS.map((d) => (
                  <option key={`am-${d.value || "none"}`} value={d.value}>{d.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Franco PM</Form.Label>
              <Form.Select value={francoPm} onChange={(e) => setFrancoPm(e.target.value)} className="form-control my-input">
                {DIAS.map((d) => (
                  <option key={`pm-${d.value || "none"}`} value={d.value}>{d.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={guardar} disabled={saving || !empleadoId}>
          {saving ? (<><Spinner size="sm" className="me-2" /> Guardando…</>) : (isEdit ? "Guardar cambios" : "Asignar")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
