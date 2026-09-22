import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Row,
  Col,
  ListGroup,
  Alert,
} from "react-bootstrap";
import {
  BsPerson,
  BsSearch,
  BsCalendar3,
  BsGeoAlt,
  BsX,
} from "react-icons/bs";

const apiUrl = process.env.REACT_APP_API_URL;

const nombreEmpleado = (item) => {
  const ap =
    item?.clientePersona?.apellido ||
    item?.empleado?.apellido ||
    item?.apellido ||
    "";

  const no =
    item?.clientePersona?.nombre ||
    item?.empleado?.nombre ||
    item?.nombre ||
    "";

  const full = `${ap} ${no}`.trim();

  return (
    full ||
    `Empleado #${item?.empleado?.id ?? item?.id ?? ""}`
  );
};

export default function EventoModal({
  show,
  onClose,
  initialData,
  conceptos,
  sucursales,
  empleados,
  datosEmpleado = [],
}) {
  const isEdit = Boolean(initialData?.id);

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [conceptoId, setConceptoId] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [
    sucursalDestinoId,
    setSucursalDestinoId,
  ] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Buscador de empleados
  const [busquedaEmpleado, setBusquedaEmpleado] =
    useState("");

  const [mostrarResultados, setMostrarResultados] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState(null);

  const conceptosOpts = useMemo(() => {
    const list = [...(conceptos || [])];

    list.sort((a, b) =>
      String(a?.nombre || "").localeCompare(
        String(b?.nombre || "")
      )
    );

    return list;
  }, [conceptos]);

  const conceptoSeleccionado = useMemo(() => {
    if (!conceptoId) return null;

    return conceptosOpts.find(
      (c) => Number(c.id) === Number(conceptoId)
    ) || null;
  }, [conceptosOpts, conceptoId]);

  const cambiaSucursal =
    Boolean(conceptoSeleccionado?.cambia_sucursal);

  const sucursalesOpts = useMemo(() => {
    const list = [...(sucursales || [])];

    list.sort((a, b) =>
      String(a?.nombre || "").localeCompare(
        String(b?.nombre || "")
      )
    );

    return list;
  }, [sucursales]);

  const empleadosOpts = useMemo(() => {
    const list = [...(empleados || [])];

    // Solo empleados activos
    const empleadosActivos = list.filter(
      (e) => !e?.empleado?.fechabaja
    );

    empleadosActivos.sort((a, b) => {
      const nombreA =
        nombreEmpleado(a).toLowerCase();

      const nombreB =
        nombreEmpleado(b).toLowerCase();

      return nombreA.localeCompare(nombreB);
    });

    return empleadosActivos;
  }, [empleados]);

  const empleadoSeleccionado = useMemo(() => {
    if (!empleadoId) return null;

    return empleadosOpts.find((e) => {
      const id =
        e?.empleado?.id ?? e?.id;

      return Number(id) === Number(empleadoId);
    });
  }, [empleadosOpts, empleadoId]);

  const empleadosFiltrados = useMemo(() => {
    const q = busquedaEmpleado
      .trim()
      .toLowerCase();

    if (!q) {
      return empleadosOpts.slice(0, 15);
    }

    return empleadosOpts
      .filter((e) =>
        nombreEmpleado(e)
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 20);
  }, [empleadosOpts, busquedaEmpleado]);

  const datosEmpleadoMap = useMemo(() => {
    const map = new Map();

    for (const item of datosEmpleado || []) {
      map.set(
        Number(item.empleado_id),
        item
      );
    }

    return map;
  }, [datosEmpleado]);

  useEffect(() => {
    if (!show) return;

    setErr(null);

    setFechaDesde(
      initialData?.fecha_desde || ""
    );

    setFechaHasta(
      initialData?.fecha_hasta || ""
    );

    setConceptoId(
      initialData?.concepto_id || ""
    );

    setEmpleadoId(
      initialData?.empleado_id || ""
    );

    setSucursalId(
      initialData?.sucursal_id || ""
    );

    setSucursalDestinoId(
      initialData?.sucursal_destino_id || ""
    );

    setObservaciones(
      initialData?.observaciones || ""
    );

    setBusquedaEmpleado("");
    setMostrarResultados(false);
  }, [show, initialData]);

  const seleccionarEmpleado = (empleado) => {
    const id =
      empleado?.empleado?.id ??
      empleado?.id;

    setEmpleadoId(id);

    // Buscar la configuración habitual
    // del empleado.
    const datos =
      datosEmpleadoMap.get(
        Number(id)
      );

    // Cargar automáticamente
    // su sucursal habitual.
    const sucursalHabitualId =
      Number(datos?.sucursal_id) || "";

    setSucursalId(
      sucursalHabitualId
    );

    // Al cambiar de empleado eliminamos
    // cualquier destino temporal anterior.
    setSucursalDestinoId("");

    setBusquedaEmpleado("");

    setMostrarResultados(false);
  };

  const quitarEmpleado = () => {
    setEmpleadoId("");

    setSucursalId("");

    setSucursalDestinoId("");

    setBusquedaEmpleado("");

    setMostrarResultados(true);
  };

  const validar = () => {
    if (!fechaDesde) {
      return "La fecha desde es requerida.";
    }

    if (!fechaHasta) {
      return "La fecha hasta es requerida.";
    }

    if (
      new Date(`${fechaDesde}T00:00:00`) >
      new Date(`${fechaHasta}T00:00:00`)
    ) {
      return "Fecha desde no puede ser mayor que fecha hasta.";
    }

    if (!Number(conceptoId)) {
      return "Debés seleccionar un concepto.";
    }

    if (!Number(empleadoId)) {
      return "Debés seleccionar un empleado.";
    }

    if (!Number(sucursalId)) {
      return "Debés seleccionar una sucursal.";
    }

    if (
      cambiaSucursal &&
      !Number(sucursalDestinoId)
    ) {
      return "Debés seleccionar la sucursal destino.";
    }

    if (
      cambiaSucursal &&
      Number(sucursalDestinoId) === Number(sucursalId)
    ) {
      return "La sucursal destino debe ser diferente de la sucursal actual.";
    }

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
      const payload = {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,

        concepto_id:
          Number(conceptoId),

        empleado_id:
          Number(empleadoId),

        sucursal_id:
          Number(sucursalId),

        sucursal_destino_id:
          cambiaSucursal
            ? Number(sucursalDestinoId)
            : null,

        observaciones: observaciones
          ? String(observaciones).trim()
          : null,
      };

      let r;
      let data;

      if (isEdit) {
        r = await fetch(
          `${apiUrl}/eventos/${initialData.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify(payload),
          }
        );

        data = await r
          .json()
          .catch(() => null);
      } else {
        r = await fetch(
          `${apiUrl}/eventos`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify(payload),
          }
        );

        data = await r
          .json()
          .catch(() => null);
      }

      if (!r.ok) {
        throw new Error(
          data?.error ||
          "No se pudo guardar el evento."
        );
      }

      onClose(true);
    } catch (e) {
      console.error(e);

      setErr(
        e.message ||
        "Error al guardar."
      );
    } finally {
      setSaving(false);
    }
  };

  const eliminarEvento = async () => {
    if (!isEdit || !initialData?.id) {
      return;
    }

    const confirmar = window.confirm(
      "¿Está seguro de que desea eliminar este evento?"
    );

    if (!confirmar) {
      return;
    }

    setDeleting(true);
    setErr(null);

    try {
      const r = await fetch(
        `${apiUrl}/eventos/${initialData.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await r
        .json()
        .catch(() => null);

      if (!r.ok) {
        throw new Error(
          data?.error ||
          "No se pudo eliminar el evento."
        );
      }

      // true indica a PlanificacionManager
      // que hubo una modificación y debe recargar.
      onClose(true);

    } catch (e) {
      console.error(e);

      setErr(
        e.message ||
        "Error al eliminar el evento."
      );
    } finally {
      setDeleting(false);
    }
  };

  const onExited = () => {
    setErr(null);
    setSaving(false);
    setDeleting(false);

    setFechaDesde("");
    setFechaHasta("");

    setConceptoId("");
    setEmpleadoId("");
    setSucursalId("");

    setObservaciones("");

    setSucursalDestinoId("");

    setBusquedaEmpleado("");
    setMostrarResultados(false);
  };

  return (
    <Modal
      show={show}
      onHide={() => onClose(false)}
      onExited={onExited}
      centered
      size="lg"
      fullscreen="sm-down"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">
          {isEdit
            ? "Editar evento"
            : "Nuevo evento"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {err && (
          <Alert
            variant="danger"
            className="py-2"
          >
            {err}
          </Alert>
        )}

        {/* EMPLEADO */}
        <Form.Group className="mb-3">

          <Form.Label className="fw-semibold">
            <BsPerson className="me-2" />
            Empleado
          </Form.Label>

          {empleadoSeleccionado ? (

            <div className="border rounded p-3 d-flex justify-content-between align-items-center bg-light">

              <div>
                <div className="fw-semibold">
                  {nombreEmpleado(
                    empleadoSeleccionado
                  )}
                </div>

                <small className="text-muted">
                  Empleado seleccionado
                </small>
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={quitarEmpleado}
                disabled={saving}
              >
                <BsX size={20} />
              </Button>

            </div>

          ) : (

            <div className="position-relative">

              <div className="position-relative">

                <BsSearch
                  className="position-absolute text-muted"
                  style={{
                    left: 12,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    zIndex: 2,
                  }}
                />

                <Form.Control
                  type="text"
                  value={busquedaEmpleado}
                  onChange={(e) => {
                    setBusquedaEmpleado(
                      e.target.value
                    );

                    setMostrarResultados(
                      true
                    );
                  }}
                  onFocus={() =>
                    setMostrarResultados(true)
                  }
                  placeholder="Buscar por apellido o nombre..."
                  autoComplete="off"
                  style={{
                    paddingLeft: 38,
                    minHeight: 46,
                  }}
                />

              </div>

              {mostrarResultados && (

                <ListGroup
                  className="mt-1 shadow-sm"
                  style={{
                    maxHeight: 250,
                    overflowY: "auto",
                  }}
                >

                  {empleadosFiltrados.length ? (

                    empleadosFiltrados.map(
                      (e) => {

                        const id =
                          e?.empleado?.id ??
                          e?.id;

                        return (
                          <ListGroup.Item
                            key={id}
                            action
                            onClick={() =>
                              seleccionarEmpleado(
                                e
                              )
                            }
                            className="py-3"
                          >
                            <BsPerson className="me-2 text-muted" />

                            {nombreEmpleado(e)}
                          </ListGroup.Item>
                        );
                      }
                    )

                  ) : (

                    <ListGroup.Item className="text-muted text-center py-3">
                      No se encontraron empleados
                    </ListGroup.Item>

                  )}

                </ListGroup>

              )}

            </div>

          )}

        </Form.Group>

        {/* CONCEPTO */}
        <Form.Group className="mb-3">

          <Form.Label className="fw-semibold">
            Concepto
          </Form.Label>

          <Form.Select
            value={conceptoId}
            onChange={(e) => {
              const nuevoConceptoId =
                e.target.value;

              setConceptoId(
                nuevoConceptoId
              );

              const nuevoConcepto =
                conceptosOpts.find(
                  (c) =>
                    Number(c.id) ===
                    Number(nuevoConceptoId)
                );

              if (!nuevoConcepto?.cambia_sucursal) {
                setSucursalDestinoId("");
              }
            }}
            disabled={saving}
            style={{
              minHeight: 46,
            }}
          >

            <option value="">
              — Seleccione —
            </option>

            {conceptosOpts.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.nombre}
              </option>
            ))}

          </Form.Select>

        </Form.Group>

        {/* FECHAS */}
        <div className="mb-1">

          <Form.Label className="fw-semibold">
            <BsCalendar3 className="me-2" />
            Período
          </Form.Label>

          <Row className="g-2">

            <Col xs={12} sm={6}>
              <Form.Group>

                <Form.Label className="small text-muted">
                  Desde
                </Form.Label>

                <Form.Control
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => {
                    const nuevaFecha =
                      e.target.value;

                    setFechaDesde(
                      nuevaFecha
                    );

                    // Si todavía no hay fecha hasta,
                    // usamos la misma fecha.
                    if (!fechaHasta) {
                      setFechaHasta(
                        nuevaFecha
                      );
                    }
                  }}
                  disabled={saving}
                  style={{
                    minHeight: 46,
                  }}
                />

              </Form.Group>

              {cambiaSucursal && (
                <Form.Group className="mb-3">

                  <Form.Label className="fw-semibold">
                    <BsGeoAlt className="me-2" />
                    Sucursal destino
                  </Form.Label>

                  <Form.Select
                    value={sucursalDestinoId}
                    onChange={(e) =>
                      setSucursalDestinoId(
                        e.target.value
                      )
                    }
                    disabled={saving}
                    style={{
                      minHeight: 46,
                    }}
                  >

                    <option value="">
                      — Seleccione sucursal destino —
                    </option>

                    {sucursalesOpts
                      .filter(
                        (s) =>
                          Number(s.id) !==
                          Number(sucursalId)
                      )
                      .map((s) => (
                        <option
                          key={s.id}
                          value={s.id}
                        >
                          {s.nombre}
                        </option>
                      ))}

                  </Form.Select>

                  <Form.Text className="text-muted">
                    El empleado será asignado temporalmente
                    a esta sucursal solamente durante el
                    período indicado.
                  </Form.Text>

                </Form.Group>
              )}
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>

                <Form.Label className="small text-muted">
                  Hasta
                </Form.Label>

                <Form.Control
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde || undefined}
                  onChange={(e) =>
                    setFechaHasta(
                      e.target.value
                    )
                  }
                  disabled={saving}
                  style={{
                    minHeight: 46,
                  }}
                />

              </Form.Group>
            </Col>

          </Row>

        </div>

        {/* SUCURSAL */}
        <Form.Group className="my-3">

          <Form.Label className="fw-semibold">
            <BsGeoAlt className="me-2" />
            Sucursal
          </Form.Label>

          <Form.Select
            value={sucursalId}
            onChange={(e) =>
              setSucursalId(
                e.target.value
              )
            }
            disabled={
              saving ||
              Boolean(empleadoId)
            }
            style={{
              minHeight: 46,
            }}
          >

            <option value="">
              — Seleccione —
            </option>

            {sucursalesOpts.map((s) => (
              <option
                key={s.id}
                value={s.id}
              >
                {s.nombre}
              </option>
            ))}

          </Form.Select>

        </Form.Group>

        {/* OBSERVACIONES */}
        <Form.Group className="mb-2">

          <Form.Label className="fw-semibold">
            Observaciones
          </Form.Label>

          <Form.Control
            as="textarea"
            rows={3}
            value={observaciones}
            onChange={(e) =>
              setObservaciones(
                e.target.value
              )
            }
            placeholder="Ingrese observaciones..."
            disabled={saving}
            maxLength={255}
          />

          <div className="text-end mt-1">
            <small className="text-muted">
              {observaciones.length}/255
            </small>
          </div>

        </Form.Group>

      </Modal.Body>

      <Modal.Footer className="d-flex flex-column flex-sm-row gap-2">

        {isEdit && (
          <Button
            variant="outline-danger"
            className="w-100 order-3 order-sm-1"
            onClick={eliminarEvento}
            disabled={saving || deleting}
            style={{
              minHeight: 46,
            }}
          >
            {deleting ? (
              <>
                <Spinner
                  size="sm"
                  className="me-2"
                />
                Eliminando…
              </>
            ) : (
              "Eliminar evento"
            )}
          </Button>
        )}

        <Button
          variant="outline-secondary"
          className="w-100 order-2 order-sm-1"
          onClick={() =>
            onClose(false)
          }
          disabled={saving || deleting}
          style={{
            minHeight: 46,
          }}
        >
          Cancelar
        </Button>

        <Button
          className="w-100 order-1 order-sm-2"
          onClick={guardar}
          disabled={
            saving ||
            deleting ||
            !fechaDesde ||
            !fechaHasta ||
            !conceptoId ||
            !empleadoId ||
            !sucursalId ||
            (
              cambiaSucursal &&
              !sucursalDestinoId
            )
          }
          style={{
            minHeight: 46,
          }}
        >

          {saving ? (
            <>
              <Spinner
                size="sm"
                className="me-2"
              />

              Guardando…
            </>
          ) : isEdit ? (
            "Guardar cambios"
          ) : (
            "Crear evento"
          )}

        </Button>

      </Modal.Footer>

    </Modal>
  );
}