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
  const isEdit =
    initialData?.modo === "editar";


  const [sucursalId, setSucursalId] = useState(initialData?.sucursal_id ?? "");
  const [jornadaId, setJornadaId] = useState(initialData?.jornada_id ?? "");
  const [francoAm, setFrancoAm] = useState(initialData?.franco_am ?? "");
  const [francoPm, setFrancoPm] = useState(initialData?.franco_pm ?? "");
  const [telefono, setTelefono] = useState(initialData?.telefono || "");
  const [tipo, setTipo] = useState(initialData?.tipo || "VENDEDOR");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!show) return;

    console.log("initialData recibido por el modal:", initialData);
    console.log("tipo recibido:", initialData?.tipo);
    setErr(null);
    setSucursalId(initialData?.sucursal_id ?? "");
    setJornadaId(initialData?.jornada_id ?? "");
    setFrancoAm(initialData?.franco_am ?? "");
    setFrancoPm(initialData?.franco_pm ?? "");
    setTelefono(initialData?.telefono || "");
    setTipo(initialData?.tipo || "VENDEDOR");
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

    // ✅ Validación de teléfono (misma lógica que en el otro modal)
    const clean = String(telefono || "").trim();
    if (clean && !/^\d{10}$/.test(clean)) {
      return "Si cargás teléfono, debe tener exactamente 10 dígitos (solo números).";
    }

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

      // ✅ Envío de teléfono como en el primer modal
      payload.telefono = telefono ? String(telefono).trim() : null;

      payload.tipo = tipo;

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
    setTelefono("");
    setTipo("VENDEDOR");
  };

  return (
    <Modal
      show={show}
      onHide={() => onClose(false)}
      onExited={onExited}
      centered
      fullscreen="sm-down"
      scrollable
    >
      <Modal.Header closeButton className="py-3">
        <div>
          <Modal.Title className="fs-5 fw-semibold mb-0">
            {isEdit
              ? "Editar datos"
              : "Asignar datos"}
          </Modal.Title>

          <small className="text-muted">
            {isEdit
              ? "Modificar datos del empleado"
              : "Nueva asignación"}
          </small>
        </div>
      </Modal.Header>

      <Modal.Body>
        {err && (
          <Alert variant="danger" className="py-2 px-3 small fw-semibold">
            {err}
          </Alert>
        )}

        <Row className="g-3">

          {/* SUCURSAL */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">
                Sucursal
              </Form.Label>

              <Form.Select
                value={sucursalId ?? ""}
                onChange={(e) =>
                  setSucursalId(
                    e.target.value || ""
                  )
                }
                style={{ minHeight: 48 }}
              >
                <option value="">
                  — Sin asignar —
                </option>

                {sucursalOpts.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* JORNADA */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">
                Jornada
              </Form.Label>

              <Form.Select
                value={jornadaId ?? ""}
                onChange={(e) =>
                  setJornadaId(
                    e.target.value || ""
                  )
                }
                style={{ minHeight: 48 }}
              >
                <option value="">
                  — Sin asignar —
                </option>

                {jornadaOpts.map((j) => (
                  <option
                    key={j.id}
                    value={j.id}
                  >
                    {j.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* TIPO */}
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">
                Tipo de empleado
              </Form.Label>

              <Form.Select
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value)
                }
                style={{ minHeight: 48 }}
              >
                <option value="VENDEDOR">
                  Vendedor
                </option>

                <option value="ENCARGADO">
                  Encargado
                </option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* TELÉFONO */}
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold mb-1">
                Teléfono
              </Form.Label>

              <Form.Control
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                maxLength={10}
                placeholder="10 dígitos"
                value={telefono}
                onChange={(e) => {
                  const onlyDigits =
                    e.target.value
                      .replace(/\D+/g, "")
                      .slice(0, 10);

                  setTelefono(onlyDigits);
                }}
                style={{ minHeight: 48 }}
              />

              <Form.Text className="text-muted">
                Opcional. Solo números.
              </Form.Text>
            </Form.Group>
          </Col>

          {/* FRANCOS */}
          <Col xs={12}>
            <div className="border-top pt-3 mt-1">
              <div className="fw-semibold mb-2">
                Francos
              </div>

              <Row className="g-2">

                {/* FRANCO AM */}
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">
                      Turno AM
                    </Form.Label>

                    <Form.Select
                      value={francoAm ?? ""}
                      onChange={(e) =>
                        setFrancoAm(
                          e.target.value || ""
                        )
                      }
                      style={{ minHeight: 48 }}
                    >
                      <option value="">
                        Sin franco
                      </option>

                      {daysOfWeek.map((d) => (
                        <option
                          key={d.value}
                          value={d.value}
                        >
                          {d.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* FRANCO PM */}
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">
                      Turno PM
                    </Form.Label>

                    <Form.Select
                      value={francoPm ?? ""}
                      onChange={(e) =>
                        setFrancoPm(
                          e.target.value || ""
                        )
                      }
                      style={{ minHeight: 48 }}
                    >
                      <option value="">
                        Sin franco
                      </option>

                      {daysOfWeek.map((d) => (
                        <option
                          key={d.value}
                          value={d.value}
                        >
                          {d.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

              </Row>
            </div>
          </Col>

        </Row>
      </Modal.Body>

      {/* EMPLEADO SELECCIONADO */}
      <div className="bg-light rounded p-3 mb-3">
        <small className="text-muted d-block mb-1">
          Empleado
        </small>

        <div className="fw-bold fs-5">
          {initialData?.empleado_nombre ||
            `Empleado #${initialData?.empleado_id ?? "—"}`}
        </div>

        {initialData?.empleado_dni && (
          <div className="text-muted small mt-1">
            DNI / CUIL: {initialData.empleado_dni}
          </div>
        )}
      </div>

      <Modal.Footer className="p-3">

        <Row className="g-2 w-100 m-0">

          {/* GUARDAR PRIMERO EN MOBILE */}
          <Col xs={12} md={{ span: 6, order: 2 }}>
            <Button
              onClick={guardar}
              disabled={
                saving ||
                !initialData?.empleado_id
              }
              variant="primary"
              className="w-100 fw-semibold"
              style={{ minHeight: 48 }}
            >
              {saving ? (
                <>
                  <Spinner
                    size="sm"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : isEdit ? (
                "Guardar cambios"
              ) : (
                "Asignar datos"
              )}
            </Button>
          </Col>

          {/* CANCELAR */}
          <Col xs={12} md={{ span: 6, order: 1 }}>
            <Button
              variant="outline-secondary"
              onClick={() =>
                onClose(false)
              }
              disabled={saving}
              className="w-100"
              style={{ minHeight: 48 }}
            >
              Cancelar
            </Button>
          </Col>

        </Row>

      </Modal.Footer>
    </Modal>
  );
}
