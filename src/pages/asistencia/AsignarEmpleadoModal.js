import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Row,
  Col,
  Alert,
} from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

const daysOfWeek = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export default function AsignarEmpleadoModal({
  show,
  onClose,
  initialData,
  sucursales,
  jornadas,
}) {
  const isEdit = Boolean(
    initialData?.sucursal_id ||
      initialData?.jornada_id ||
      initialData?.franco_am ||
      initialData?.franco_pm
  );

  const [sucursalId, setSucursalId] = useState(initialData?.sucursal_id ?? "");
  const [jornadaId, setJornadaId] = useState(initialData?.jornada_id ?? "");
  const [francoAm, setFrancoAm] = useState(initialData?.franco_am ?? "");
  const [francoPm, setFrancoPm] = useState(initialData?.franco_pm ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!show) return;
    setErr(null);
    setSucursalId(initialData?.sucursal_id ?? "");
    setJornadaId(initialData?.jornada_id ?? "");
    setFrancoAm(initialData?.franco_am ?? "");
    setFrancoPm(initialData?.franco_pm ?? "");
  }, [show, initialData]);

  const sucursalOpts = useMemo(() => {
    const list = [...(sucursales || [])];
    list.sort((a, b) =>
      String(a?.nombre || "").localeCompare(String(b?.nombre || ""))
    );
    return list;
  }, [sucursales]);

  const jornadaOpts = useMemo(() => {
    const list = [...(jornadas || [])];
    list.sort((a, b) =>
      String(a?.nombre || "").localeCompare(String(b?.nombre || ""))
    );
    return list;
  }, [jornadas]);

  const validar = () => {
    if (!initialData?.empleado_id) return "Falta empleado_id.";
    if (francoAm && (Number(francoAm) < 1 || Number(francoAm) > 7))
      return "Franco AM inválido.";
    if (francoPm && (Number(francoPm) < 1 || Number(francoPm) > 7))
      return "Franco PM inválido.";
    return null;
  };

  const guardar = async () => {
    const v = validar();
    if (v) {
      setErr(v);
      return;
    }

    setSaving(true);
    setErr(null);
    try {
      const empleadoId = Number(initialData.empleado_id);
      if (!empleadoId) throw new Error("empleado_id inválido.");

      // Mandamos SOLO lo que definió el usuario.
      const payload = {};
      if (sucursalId !== "") payload.sucursal_id = Number(sucursalId);
      else payload.sucursal_id = null;

      if (jornadaId !== "") payload.jornada_id = Number(jornadaId);
      else payload.jornada_id = null;

      if (francoAm !== "") payload.franco_am = Number(francoAm);
      else payload.franco_am = null;

      if (francoPm !== "") payload.franco_pm = Number(francoPm);
      else payload.franco_pm = null;

      const r = await fetch(`${apiUrl}/empleados/${empleadoId}/datos`, {
        method: "PUT", // tu upsertPorEmpleado acepta POST o PUT
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => null);
      if (!r.ok) {
        throw new Error(
          data?.error || "No se pudo guardar la asignación."
        );
      }

      onClose(true); // true = hubo cambios
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
    setSucursalId("");
    setJornadaId("");
    setFrancoAm("");
    setFrancoPm("");
  };

  return (
    <Modal
      show={show}
      onHide={() => onClose(false)}
      onExited={onExited}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-semibold mb-0">
          {isEdit ? "Editar asignación" : "Nueva asignación"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && (
          <Alert variant="danger" className="py-2 px-3 small fw-semibold">
            {err}
          </Alert>
        )}

        <Row className="g-3">
          {/* Sucursal */}
          <Col md={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-muted text-uppercase">
                Sucursal
              </Form.Label>
              <Form.Select
                value={sucursalId ?? ""}
                onChange={(e) => setSucursalId(e.target.value || "")}
                size="sm"
              >
                <option value="">— Sin asignar —</option>
                {sucursalOpts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Jornada */}
          <Col md={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-muted text-uppercase">
                Jornada
              </Form.Label>
              <Form.Select
                value={jornadaId ?? ""}
                onChange={(e) => setJornadaId(e.target.value || "")}
                size="sm"
              >
                <option value="">— Sin asignar —</option>
                {jornadaOpts.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nombre}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted small">
                La jornada define qué turnos / horarios aplica al empleado.
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Franco AM */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-muted text-uppercase">
                Franco AM
              </Form.Label>
              <Form.Select
                value={francoAm ?? ""}
                onChange={(e) => setFrancoAm(e.target.value || "")}
                size="sm"
              >
                <option value="">— Sin franco —</option>
                {daysOfWeek.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Franco PM */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-muted text-uppercase">
                Franco PM
              </Form.Label>
              <Form.Select
                value={francoPm ?? ""}
                onChange={(e) => setFrancoPm(e.target.value || "")}
                size="sm"
              >
                <option value="">— Sin franco —</option>
                {daysOfWeek.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button
          variant="outline-secondary"
          onClick={() => onClose(false)}
          disabled={saving}
          size="sm"
        >
          Cancelar
        </Button>
        <Button
          onClick={guardar}
          disabled={saving || !initialData?.empleado_id}
          size="sm"
          variant="primary"
        >
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" /> Guardando…
            </>
          ) : isEdit ? (
            "Guardar cambios"
          ) : (
            "Asignar"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
