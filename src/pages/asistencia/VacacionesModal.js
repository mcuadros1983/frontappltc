import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
} from "react";

import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  ListGroup,
  Card,
} from "react-bootstrap";

import {
  BsPerson,
  BsSearch,
  BsX,
  BsCalendar3,
  BsGeoAlt,
} from "react-icons/bs";

import Contexts from "../../context/Contexts";

import {
  crearVacacion,
  actualizarVacacion,
  getEstadoVacaciones,
} from "../../services/vacacionesApi";

function getEmpleadoId(e) {
  return (
    e?.empleado?.id ??
    e?.id ??
    e?.empleado_id ??
    null
  );
}

function getEmpleadoNombre(e) {
  const ap =
    e?.clientePersona?.apellido ||
    e?.empleado?.apellido ||
    "";

  const no =
    e?.clientePersona?.nombre ||
    e?.empleado?.nombre ||
    "";

  const full = `${ap} ${no}`.trim();

  return (
    full ||
    `Empleado #${getEmpleadoId(e) || "—"}`
  );
}

const YEARS = Array.from(
  { length: 10 },
  (_, i) => 2023 + i
);

export function VacacionesModal({
  show,
  onHide,
  onSuccess,
  editVacacion,
}) {
  const {
    empleados = [],
    sucursales = [],
  } = useContext(Contexts.DataContext);

  const esNuevaAsignacionVirtual =
    editVacacion?.esNuevaAsignacion === true;

  const esEdicionReal =
    !!editVacacion &&
    !esNuevaAsignacionVirtual &&
    editVacacion.id != null;

  const [formData, setFormData] =
    useState({
      empleado_id: "",
      periodo: "",
      dias_vacaciones: "",
      sucursal_id: "",
      fecha_desde: "",
      fecha_hasta: "",
    });

  const [
    allFieldsEnabled,
    setAllFieldsEnabled,
  ] = useState(false);

  const [
    maxDiasVacaciones,
    setMaxDiasVacaciones,
  ] = useState(0);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [
    consultandoEstado,
    setConsultandoEstado,
  ] = useState(false);

  const [
    busquedaEmpleado,
    setBusquedaEmpleado,
  ] = useState("");

  const [
    mostrarEmpleados,
    setMostrarEmpleados,
  ] = useState(false);

  /*
   * Empleados activos.
   *
   * IMPORTANTE:
   * si estamos editando y por algún motivo
   * el empleado tiene fechabaja, igualmente
   * permitimos mostrarlo.
   */
  const empleadosOpts = useMemo(() => {
    const filtrados = (empleados || []).filter(
      (item) => {
        const empleado =
          item?.empleado ?? item;

        return empleado?.fechabaja == null;
      }
    );

    filtrados.sort((a, b) =>
      getEmpleadoNombre(a).localeCompare(
        getEmpleadoNombre(b),
        "es",
        {
          sensitivity: "base",
        }
      )
    );

    return filtrados;
  }, [empleados]);

  const empleadoSeleccionado =
    useMemo(() => {
      if (!formData.empleado_id) {
        return null;
      }

      return empleadosOpts.find(
        (e) =>
          String(getEmpleadoId(e)) ===
          String(
            formData.empleado_id
          )
      );
    }, [
      empleadosOpts,
      formData.empleado_id,
    ]);

  const empleadosFiltrados =
    useMemo(() => {
      const q =
        busquedaEmpleado
          .trim()
          .toLowerCase();

      if (!q) {
        return empleadosOpts.slice(
          0,
          15
        );
      }

      return empleadosOpts
        .filter((e) =>
          getEmpleadoNombre(e)
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 20);
    }, [
      empleadosOpts,
      busquedaEmpleado,
    ]);

  const sucursalesOpts = useMemo(() => {
    const list = [...sucursales];

    list.sort((a, b) =>
      String(
        a?.nombre || ""
      ).localeCompare(
        String(b?.nombre || "")
      )
    );

    return list;
  }, [sucursales]);

  /*
   * Precarga alta / edición
   */
  useEffect(() => {
    if (!show) return;

    setError("");
    setBusquedaEmpleado("");
    setMostrarEmpleados(false);

    // =====================================
    // EDICIÓN DE UNA ASIGNACIÓN REAL
    // =====================================
    if (esEdicionReal) {
      setFormData({
        empleado_id:
          editVacacion.empleado_id ?? "",

        periodo: String(
          editVacacion.periodo ?? ""
        ),

        dias_vacaciones: String(
          editVacacion.dias_vacaciones ?? ""
        ),

        sucursal_id:
          editVacacion.sucursal_id
            ? String(editVacacion.sucursal_id)
            : "",

        fecha_desde:
          editVacacion.fecha_desde ?? "",

        fecha_hasta:
          editVacacion.fecha_hasta ?? "",
      });

      setAllFieldsEnabled(true);

      setMaxDiasVacaciones(
        Number(
          editVacacion.dias_vacaciones ?? 0
        )
      );

      return;
    }

    // =====================================
    // ASIGNACIÓN VIRTUAL
    // Viene desde VacacionesManager.
    // Todavía NO existe en BD.
    // =====================================
    if (esNuevaAsignacionVirtual) {
      setFormData({
        empleado_id:
          editVacacion.empleado_id ?? "",

        periodo: String(
          editVacacion.periodo ?? ""
        ),

        dias_vacaciones: "",

        sucursal_id: "",

        fecha_desde: "",

        fecha_hasta: "",
      });

      // Como todavía no tiene días asignados,
      // permitimos ingresarlos.
      setAllFieldsEnabled(true);

      setMaxDiasVacaciones(0);

      return;
    }

    // =====================================
    // ALTA MANUAL NORMAL
    // =====================================
    setFormData({
      empleado_id: "",
      periodo: "",
      dias_vacaciones: "",
      sucursal_id: "",
      fecha_desde: "",
      fecha_hasta: "",
    });

    setAllFieldsEnabled(false);
    setMaxDiasVacaciones(0);

  }, [
    show,
    editVacacion,
    esEdicionReal,
    esNuevaAsignacionVirtual,
  ]);

  function handleChange(e) {
    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /*
   * Selección de empleado desde
   * buscador mobile-friendly.
   *
   * Conserva la misma lógica del
   * handleEmployeeChange original.
   */
  function seleccionarEmpleado(emp) {
    if (
      esEdicionReal ||
      esNuevaAsignacionVirtual
    ) {
      return;
    }

    const value = getEmpleadoId(emp);

    setFormData({
      empleado_id: value,
      periodo: "",
      dias_vacaciones: "",
      sucursal_id: "",
      fecha_desde: "",
      fecha_hasta: "",
    });

    setAllFieldsEnabled(false);
    setMaxDiasVacaciones(0);

    setBusquedaEmpleado("");
    setMostrarEmpleados(false);
    setError("");
  }

  function quitarEmpleado() {
    if (
      esEdicionReal ||
      esNuevaAsignacionVirtual
    ) {
      return;
    }

    setFormData({
      empleado_id: "",
      periodo: "",
      dias_vacaciones: "",
      sucursal_id: "",
      fecha_desde: "",
      fecha_hasta: "",
    });

    setAllFieldsEnabled(false);
    setMaxDiasVacaciones(0);

    setBusquedaEmpleado("");
    setMostrarEmpleados(true);
  }

  /*
   * PERÍODO
   *
   * Conservamos la lógica existente.
   */
  async function handlePeriodoChange(e) {
    const value = e.target.value;

    setError("");

    setFormData((prev) => ({
      ...prev,
      periodo: value,
      dias_vacaciones: "",
      sucursal_id: "",
      fecha_desde: "",
      fecha_hasta: "",
    }));

    if (!formData.empleado_id) {
      setAllFieldsEnabled(false);
      setMaxDiasVacaciones(0);
      return;
    }

    if (!value) {
      setAllFieldsEnabled(false);
      setMaxDiasVacaciones(0);
      return;
    }

    try {
      setConsultandoEstado(true);

      const status =
        await getEstadoVacaciones(
          formData.empleado_id,
          value
        );

      if (
        status.total_days_assigned === 0
      ) {
        alert(
          "No se han asignado días de vacaciones para este periodo"
        );

        setAllFieldsEnabled(true);
        setMaxDiasVacaciones(0);

        setFormData((prev) => ({
          ...prev,
          dias_vacaciones: "",
        }));
      } else if (
        status.remaining_days <= 0
      ) {
        alert(
          "El empleado ya se tomó todos sus días de vacaciones para este periodo"
        );

        setAllFieldsEnabled(false);
        setMaxDiasVacaciones(0);

        setFormData((prev) => ({
          ...prev,
          dias_vacaciones: "0",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,

          dias_vacaciones:
            status.remaining_days.toString(),
        }));

        setMaxDiasVacaciones(
          status.remaining_days
        );

        setAllFieldsEnabled(false);
      }
    } catch (err) {
      setError(
        "No se pudo consultar el estado de vacaciones: " +
        err.message
      );

      setAllFieldsEnabled(false);
      setMaxDiasVacaciones(0);
    } finally {
      setConsultandoEstado(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const {
      fecha_desde,
      fecha_hasta,
      dias_vacaciones,
    } = formData;

    if (
      fecha_desde &&
      fecha_hasta
    ) {
      const dDesde = new Date(
        `${fecha_desde}T00:00:00`
      );

      const dHasta = new Date(
        `${fecha_hasta}T00:00:00`
      );

      if (dHasta < dDesde) {
        setError(
          "La fecha hasta no puede ser menor a la fecha desde"
        );

        return;
      }

      const diffTime =
        dHasta.getTime() -
        dDesde.getTime();

      const diffDays =
        Math.ceil(
          diffTime /
          (1000 *
            60 *
            60 *
            24)
        ) + 1;

      const limiteUsuario =
        Number(
          dias_vacaciones || 0
        );

      if (
        limiteUsuario > 0 &&
        diffDays > limiteUsuario
      ) {
        setError(
          "El rango de fechas no puede ser mayor a los días de vacaciones disponibles"
        );

        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        periodo: Number(
          formData.periodo
        ),

        dias_vacaciones: Number(
          formData.dias_vacaciones
        ),

        empleado_id: Number(
          formData.empleado_id
        ),

        sucursal_id:
          formData.sucursal_id
            ? Number(
              formData.sucursal_id
            )
            : null,

        fecha_desde:
          formData.fecha_desde ||
          null,

        fecha_hasta:
          formData.fecha_hasta ||
          null,
      };

      if (esEdicionReal) {
        await actualizarVacacion(
          editVacacion.id,
          payload
        );
      } else {
        await crearVacacion(
          payload
        );
      }

      if (
        typeof onSuccess ===
        "function"
      ) {
        await onSuccess();
      }

      if (
        typeof onHide === "function"
      ) {
        onHide();
      }
    } catch (err) {
      setError(
        "Error al guardar: " +
        err.message
      );
    } finally {
      setSaving(false);
    }
  }

  function isSubmitEnabled() {
    if (
      formData.dias_vacaciones ===
      ""
    ) {
      return false;
    }

    if (allFieldsEnabled) {
      return true;
    }

    if (
      formData.sucursal_id ||
      formData.fecha_desde ||
      formData.fecha_hasta
    ) {
      return Boolean(
        formData.sucursal_id &&
        formData.fecha_desde &&
        formData.fecha_hasta
      );
    }

    return true;
  }

  const empleadoDisabled =
    esEdicionReal ||
    esNuevaAsignacionVirtual;

  const periodoDisabled =
    !formData.empleado_id ||
    esEdicionReal ||
    esNuevaAsignacionVirtual;

  const diasVacDisabled =
    !formData.empleado_id ||
    !formData.periodo ||
    !allFieldsEnabled;

  const rangoDisabled =
    !formData.dias_vacaciones &&
    !allFieldsEnabled;

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      size="lg"
      fullscreen="sm-down"
      scrollable
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">
          {esEdicionReal
            ? "Editar Vacaciones"
            : "Asignar Vacaciones"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert
              variant="danger"
              className="py-2"
            >
              {error}
            </Alert>
          )}

          {/* EMPLEADO */}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <BsPerson className="me-2" />
              Empleado
            </Form.Label>

            {empleadoSeleccionado ? (
              <Card className="bg-light">
                <Card.Body className="p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">
                      {getEmpleadoNombre(
                        empleadoSeleccionado
                      )}
                    </div>

                    <small className="text-muted">
                      Empleado seleccionado
                    </small>
                  </div>

                  {!empleadoDisabled && (
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      onClick={
                        quitarEmpleado
                      }
                    >
                      <BsX size={20} />
                    </Button>
                  )}
                </Card.Body>
              </Card>
            ) : (
              <div>
                <div className="position-relative">
                  <BsSearch
                    className="position-absolute text-muted"
                    style={{
                      left: 13,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      zIndex: 2,
                    }}
                  />

                  <Form.Control
                    type="text"
                    value={
                      busquedaEmpleado
                    }
                    onChange={(e) => {
                      setBusquedaEmpleado(
                        e.target.value
                      );

                      setMostrarEmpleados(
                        true
                      );
                    }}
                    onFocus={() =>
                      setMostrarEmpleados(
                        true
                      )
                    }
                    placeholder="Buscar apellido o nombre..."
                    autoComplete="off"
                    disabled={
                      empleadoDisabled
                    }
                    style={{
                      paddingLeft: 40,
                      minHeight: 46,
                    }}
                  />
                </div>

                {mostrarEmpleados && (
                  <ListGroup
                    className="mt-1 shadow-sm"
                    style={{
                      maxHeight: 250,
                      overflowY: "auto",
                    }}
                  >
                    {empleadosFiltrados.length ? (
                      empleadosFiltrados.map(
                        (emp) => {
                          const id =
                            getEmpleadoId(
                              emp
                            );

                          return (
                            <ListGroup.Item
                              key={id}
                              action
                              className="py-3"
                              onClick={() =>
                                seleccionarEmpleado(
                                  emp
                                )
                              }
                            >
                              <BsPerson className="me-2 text-muted" />

                              {getEmpleadoNombre(
                                emp
                              )}
                            </ListGroup.Item>
                          );
                        }
                      )
                    ) : (
                      <ListGroup.Item className="text-center text-muted py-3">
                        No se encontraron
                        empleados
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                )}
              </div>
            )}
          </Form.Group>

          {/* PERIODO */}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Período
            </Form.Label>

            <div className="position-relative">
              <Form.Select
                name="periodo"
                value={formData.periodo}
                onChange={
                  handlePeriodoChange
                }
                required
                disabled={
                  periodoDisabled ||
                  consultandoEstado ||
                  saving
                }
                style={{
                  minHeight: 46,
                }}
              >
                <option value="">
                  Seleccionar período
                </option>

                {YEARS.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </Form.Select>

              {consultandoEstado && (
                <small className="text-muted d-block mt-2">
                  <Spinner
                    size="sm"
                    className="me-2"
                  />
                  Consultando vacaciones
                  disponibles...
                </small>
              )}
            </div>
          </Form.Group>

          {/* DÍAS */}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Días de Vacaciones
            </Form.Label>

            <Form.Control
              type="number"
              name="dias_vacaciones"
              value={
                formData.dias_vacaciones
              }
              onChange={handleChange}
              required
              disabled={
                diasVacDisabled ||
                saving
              }
              min="0"
              style={{
                minHeight: 46,
                fontSize: "1.1rem",
              }}
            />

            {maxDiasVacaciones >
              0 && (
                <Form.Text muted>
                  Saldo disponible:{" "}
                  <strong>
                    {maxDiasVacaciones} días
                  </strong>
                </Form.Text>
              )}
          </Form.Group>

          <hr />

          {/* SUCURSAL */}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <BsGeoAlt className="me-2" />
              Sucursal
            </Form.Label>

            <Form.Select
              name="sucursal_id"
              value={
                formData.sucursal_id
              }
              onChange={handleChange}
              disabled={
                rangoDisabled ||
                saving
              }
              style={{
                minHeight: 46,
              }}
            >
              <option value="">
                Seleccionar sucursal
              </option>

              {sucursalesOpts.map(
                (s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.nombre}
                  </option>
                )
              )}
            </Form.Select>
          </Form.Group>

          {/* FECHAS */}

          <Form.Label className="fw-semibold">
            <BsCalendar3 className="me-2" />
            Fechas
          </Form.Label>

          <Row className="g-2">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="small text-muted">
                  Desde
                </Form.Label>

                <Form.Control
                  type="date"
                  name="fecha_desde"
                  value={
                    formData.fecha_desde ||
                    ""
                  }
                  onChange={(e) => {
                    handleChange(e);

                    if (
                      !formData.fecha_hasta
                    ) {
                      setFormData(
                        (prev) => ({
                          ...prev,
                          fecha_desde:
                            e.target
                              .value,
                          fecha_hasta:
                            e.target
                              .value,
                        })
                      );
                    }
                  }}
                  disabled={
                    rangoDisabled ||
                    saving
                  }
                  style={{
                    minHeight: 46,
                  }}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="small text-muted">
                  Hasta
                </Form.Label>

                <Form.Control
                  type="date"
                  name="fecha_hasta"
                  value={
                    formData.fecha_hasta ||
                    ""
                  }
                  min={
                    formData.fecha_desde ||
                    undefined
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    rangoDisabled ||
                    saving
                  }
                  style={{
                    minHeight: 46,
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        {/* BOTONES */}

        <Modal.Footer className="d-flex flex-column flex-sm-row gap-2">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={onHide}
            disabled={saving}
            className="w-100 order-2 order-sm-1"
            style={{
              minHeight: 46,
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={
              !isSubmitEnabled() ||
              saving ||
              consultandoEstado
            }
            className="w-100 order-1 order-sm-2"
            style={{
              minHeight: 46,
            }}
          >
            {saving ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Guardando...
              </>
            ) : esEdicionReal ? (
              "Actualizar Vacaciones"
            ) : (
              "Asignar Vacaciones"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}