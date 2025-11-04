// src/pages/Asistencia/VacacionesModal.js
import React, { useEffect, useState, useContext } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";

import Contexts from "../../context/Contexts";

import {
  crearVacacion,
  actualizarVacacion,
  getEstadoVacaciones,
} from "../../services/vacacionesApi";

// -------- helpers para empleados en tu shape actual --------
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
  return full || `Empleado #${getEmpleadoId(e) || "—"}`;
}

// años tipo período
const YEARS = Array.from({ length: 10 }, (_, i) => 2023 + i);

export function VacacionesModal({ show, onHide, onSuccess, editVacacion }) {
  const { empleados, sucursales } = useContext(Contexts.DataContext);

  // --- estado principal del form ---
  const [formData, setFormData] = useState({
    empleado_id: "",
    periodo: "",
    dias_vacaciones: "",
    sucursal_id: "",
    fecha_desde: "",
    fecha_hasta: "",
  });

  // --- estado de UI inteligente (replicado del AssignVacations viejo) ---
  const [allFieldsEnabled, setAllFieldsEnabled] = useState(false);
  const [maxDiasVacaciones, setMaxDiasVacaciones] = useState(0);

  // --- misc estado ---
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // si estamos editando una asignación existente, precargamos
  useEffect(() => {
    if (editVacacion) {
      setFormData({
        empleado_id: editVacacion.empleado_id ?? "",
        periodo: String(editVacacion.periodo ?? ""),
        dias_vacaciones: String(editVacacion.dias_vacaciones ?? ""),
        sucursal_id: editVacacion.sucursal_id
          ? String(editVacacion.sucursal_id)
          : "",
        fecha_desde: editVacacion.fecha_desde ?? "",
        fecha_hasta: editVacacion.fecha_hasta ?? "",
      });

      // comportamiento original: en edición habilitamos todo
      setAllFieldsEnabled(true);
      setMaxDiasVacaciones(
        Number(editVacacion.dias_vacaciones ?? 0)
      );
    } else {
      // alta nueva
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
    }
  }, [editVacacion]);

  // --- handlers ---

  // cambio genérico
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // cuando elijo empleado:
  //   - reseteo resto del form
  //   - deshabilito campos dependientes hasta elegir período
  function handleEmployeeChange(e) {
    const value = e.target.value;
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
  }

  // cuando elijo período:
  //   1. reseteo campos dependientes
  //   2. consulto backend getEstadoVacaciones(empleado_id, periodo)
  //   3. aplico EXACTAMENTE la lógica vieja
  async function handlePeriodoChange(e) {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      periodo: value,
      dias_vacaciones: "",
      sucursal_id: "",
      fecha_desde: "",
      fecha_hasta: "",
    }));

    // si todavía no elegiste empleado, no puedo evaluar nada
    if (!formData.empleado_id) {
      setAllFieldsEnabled(false);
      setMaxDiasVacaciones(0);
      return;
    }

    try {
      const status = await getEstadoVacaciones(
        formData.empleado_id,
        value
      );
      // status: { total_days_assigned, total_days_taken, remaining_days }
      // comportamiento idéntico al AssignVacations original:

      if (status.total_days_assigned === 0) {
        alert(
          "No se han asignado días de vacaciones para este periodo"
        );
        // caso "primera vez": libero todos los campos
        setAllFieldsEnabled(true);
        setMaxDiasVacaciones(0);

        // dias_vacaciones queda vacío para que el usuario lo escriba
        setFormData((prev) => ({
          ...prev,
          dias_vacaciones: "",
        }));
      } else if (status.remaining_days <= 0) {
        alert(
          "El empleado ya se tomó todos sus días de vacaciones para este periodo"
        );
        // sigue bloqueado todo lo que depende de días
        setAllFieldsEnabled(false);
        setMaxDiasVacaciones(0);

        // lo dejamos en 0 porque no tiene saldo
        setFormData((prev) => ({
          ...prev,
          dias_vacaciones: "0",
        }));
      } else {
        // tiene saldo disponible
        setFormData((prev) => ({
          ...prev,
          dias_vacaciones: status.remaining_days.toString(),
        }));

        setMaxDiasVacaciones(status.remaining_days);
        // en la app vieja en este caso: setAllFieldsEnabled(false)
        setAllFieldsEnabled(false);
      }
    } catch (err) {
      setError(
        "No se pudo consultar el estado de vacaciones: " + err.message
      );
      // fallback seguro
      setAllFieldsEnabled(false);
      setMaxDiasVacaciones(0);
    }
  }

  // validación final + submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { fecha_desde, fecha_hasta, dias_vacaciones } = formData;

    // validaciones idénticas + fix de límite
    if (fecha_desde && fecha_hasta) {
        const dDesde = new Date(fecha_desde);
        const dHasta = new Date(fecha_hasta);

        if (dHasta < dDesde) {
          setError(
            "La fecha hasta no puede ser menor a la fecha desde"
          );
          return;
        }

        // días solicitados en el rango
        const diffTime = dHasta.getTime() - dDesde.getTime();
        const diffDays =
          Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // incluye ambos extremos

        // USAMOS SIEMPRE lo que está actualmente en el input dias_vacaciones
        const limiteUsuario = Number(dias_vacaciones || 0);

        if (limiteUsuario > 0 && diffDays > limiteUsuario) {
          setError(
            "El rango de fechas no puede ser mayor a los días de vacaciones disponibles"
          );
          return;
        }
    }

    try {
      setSaving(true);

      if (editVacacion) {
        await actualizarVacacion(editVacacion.id, {
          // backend espera snake_case:
          periodo: Number(formData.periodo),
          dias_vacaciones: Number(formData.dias_vacaciones),
          empleado_id: Number(formData.empleado_id),
          sucursal_id: formData.sucursal_id
            ? Number(formData.sucursal_id)
            : null,
          fecha_desde: formData.fecha_desde || null,
          fecha_hasta: formData.fecha_hasta || null,
        });
      } else {
        await crearVacacion({
          periodo: Number(formData.periodo),
          dias_vacaciones: Number(formData.dias_vacaciones),
          empleado_id: Number(formData.empleado_id),
          sucursal_id: formData.sucursal_id
            ? Number(formData.sucursal_id)
            : null,
          fecha_desde: formData.fecha_desde || null,
          fecha_hasta: formData.fecha_hasta || null,
        });
      }

      // avisamos al padre que se guardó OK para que refresque
      if (typeof onSuccess === "function") onSuccess();
      // y cerramos modal
      if (typeof onHide === "function") onHide();
    } catch (err) {
      setError("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // misma lógica que validateForm() del original
  function isSubmitEnabled() {
    if (formData.dias_vacaciones === "") {
      return false;
    }
    if (allFieldsEnabled) {
      // caso "primera vez": puede guardar aunque no tenga fechas
      return true;
    }
    // si está intentando cargar un tramo concreto,
    // obligamos a que complete sucursal / fechas
    if (
      formData.sucursal_id ||
      formData.fecha_desde ||
      formData.fecha_hasta
    ) {
      return (
        formData.sucursal_id &&
        formData.fecha_desde &&
        formData.fecha_hasta
      );
    }
    return true;
  }

  // reglas de habilitado de inputs (calcadas del original):
  const empleadoDisabled = !!editVacacion; // en edición no se cambia empleado
  const periodoDisabled = !formData.empleado_id;
  const diasVacDisabled =
    !formData.empleado_id ||
    !formData.periodo ||
    !allFieldsEnabled;

  // en la vieja app: sucursal/fechas se habilitaban cuando había
  // dias_vacaciones ya seteado O si era allFieldsEnabled
  const rangoDisabled =
    !formData.dias_vacaciones && !allFieldsEnabled;

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {editVacacion
            ? "Editar Vacaciones"
            : "Asignar Vacaciones"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="empleado_id">
                <Form.Label>Empleado</Form.Label>
                <Form.Select
                  name="empleado_id"
                  value={formData.empleado_id}
                  onChange={handleEmployeeChange}
                  required
                  disabled={empleadoDisabled}
                  className="my-input form-control"
                >
                  <option value="">Seleccionar empleado</option>
                  {empleados.map((emp) => {
                    const id = getEmpleadoId(emp);
                    const label = getEmpleadoNombre(emp);
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="periodo">
                <Form.Label>Periodo</Form.Label>
                <Form.Select
                  name="periodo"
                  value={formData.periodo}
                  onChange={handlePeriodoChange}
                  required
                  disabled={periodoDisabled}
                   className="my-input form-control"
                >
                  <option value="">Seleccionar periodo</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="dias_vacaciones">
                <Form.Label>Días de Vacaciones</Form.Label>
                <Form.Control
                  type="number"
                  name="dias_vacaciones"
                  value={formData.dias_vacaciones}
                  onChange={handleChange}
                  required
                  disabled={diasVacDisabled}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="sucursal_id">
                <Form.Label>Sucursal</Form.Label>
                <Form.Select
                  name="sucursal_id"
                  value={formData.sucursal_id}
                  onChange={handleChange}
                  disabled={rangoDisabled}
                   className="my-input form-control"
                >
                  <option value="">Seleccionar sucursal</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="fecha_desde">
                <Form.Label>Fecha Desde</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_desde"
                  value={formData.fecha_desde || ""}
                  onChange={handleChange}
                  disabled={rangoDisabled}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fecha_hasta">
                <Form.Label>Fecha Hasta</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_hasta"
                  value={formData.fecha_hasta || ""}
                  onChange={handleChange}
                  disabled={rangoDisabled}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end mt-4">
            <Button
              variant="secondary"
              onClick={onHide}
              className="me-2"
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={!isSubmitEnabled() || saving}
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
              ) : editVacacion ? (
                "Actualizar Vacaciones"
              ) : (
                "Asignar Vacaciones"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
