import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

export default function PrestamoEmpleadoModal({
  show,
  onClose,
  empleados = [],
  prestamo = null,
}) {
  const esEdicion = Boolean(prestamo?.id);

  // =====================================================
  // FORMULARIO
  // =====================================================

  const [empleadoId, setEmpleadoId] = useState("");
  const [numero, setNumero] = useState("");
  const [montoOriginal, setMontoOriginal] = useState("");
  const [fechaOtorgamiento, setFechaOtorgamiento] =
    useState("");
  const [fechaPrimerDescuento, setFechaPrimerDescuento] =
    useState("");
  const [observaciones, setObservaciones] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // =====================================================
  // FORMATOS
  // =====================================================

  const formatMonto = (valor) =>
    new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(valor) || 0);

  // =====================================================
  // NOMBRE EMPLEADO
  // =====================================================

  const nombreEmpleado = useMemo(() => {
    const item = empleados.find(
      (e) =>
        String(e?.empleado?.id) ===
        String(empleadoId)
    );

    if (!item) {
      return empleadoId
        ? `Empleado #${empleadoId}`
        : "—";
    }

    const apellido =
      item?.clientePersona?.apellido ||
      item?.empleado?.apellido ||
      "";

    const nombre =
      item?.clientePersona?.nombre ||
      item?.empleado?.nombre ||
      "";

    return `${apellido} ${nombre}`.trim() || "—";
  }, [empleados, empleadoId]);

  // =====================================================
  // PRECARGA AL ABRIR
  // =====================================================

  useEffect(() => {
    if (!show) return;

    setErr(null);

    if (prestamo?.id) {
      // EDICIÓN
      setEmpleadoId(
        prestamo.empleado_id != null
          ? String(prestamo.empleado_id)
          : ""
      );

      setNumero(
        prestamo.numero != null
          ? String(prestamo.numero)
          : ""
      );

      setMontoOriginal(
        prestamo.monto_original != null
          ? String(prestamo.monto_original)
          : ""
      );

      setFechaOtorgamiento(
        prestamo.fecha_otorgamiento || ""
      );

      setFechaPrimerDescuento(
        prestamo.fecha_primer_descuento || ""
      );

      setObservaciones(
        prestamo.observaciones || ""
      );

      return;
    }

    // NUEVO
    const primerEmpleado =
      empleados?.[0]?.empleado?.id;

    setEmpleadoId(
      primerEmpleado != null
        ? String(primerEmpleado)
        : ""
    );

    setNumero("");
    setMontoOriginal("");

    // Fecha actual local YYYY-MM-DD.
    const hoy = new Date();

    const yyyy = hoy.getFullYear();
    const mm = String(
      hoy.getMonth() + 1
    ).padStart(2, "0");
    const dd = String(
      hoy.getDate()
    ).padStart(2, "0");

    setFechaOtorgamiento(
      `${yyyy}-${mm}-${dd}`
    );

    setFechaPrimerDescuento("");
    setObservaciones("");

  }, [show, prestamo, empleados]);

  // =====================================================
  // VALIDACIÓN
  // =====================================================

  const validar = () => {
    if (!empleadoId) {
      throw new Error(
        "Seleccioná un empleado."
      );
    }

    const monto =
      Number(montoOriginal);

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      throw new Error(
        "El monto original debe ser mayor a cero."
      );
    }

    if (!fechaOtorgamiento) {
      throw new Error(
        "Ingresá la fecha de otorgamiento."
      );
    }

    if (
      fechaPrimerDescuento &&
      fechaPrimerDescuento <
        fechaOtorgamiento
    ) {
      throw new Error(
        "La fecha del primer descuento no puede ser anterior a la fecha de otorgamiento."
      );
    }
  };

  // =====================================================
  // GUARDAR
  // =====================================================

  const guardar = async () => {
    try {
      setSaving(true);
      setErr(null);

      validar();

      let url;
      let method;
      let body;

      if (esEdicion) {
        // ===============================================
        // EDITAR
        //
        // empleado_id NO se envía.
        // saldo NO se envía.
        // estado NO se envía.
        // ===============================================

        url =
          `${apiUrl}/prestamosempleado/${prestamo.id}`;

        method = "PUT";

        body = {
          numero:
            numero.trim() || null,

          monto_original:
            Number(montoOriginal),

          fecha_otorgamiento:
            fechaOtorgamiento,

          fecha_primer_descuento:
            fechaPrimerDescuento || null,

          observaciones:
            observaciones.trim() || null,
        };

      } else {
        // ===============================================
        // CREAR
        // ===============================================

        url =
          `${apiUrl}/prestamosempleado`;

        method = "POST";

        body = {
          empleado_id:
            Number(empleadoId),

          numero:
            numero.trim() || null,

          monto_original:
            Number(montoOriginal),

          fecha_otorgamiento:
            fechaOtorgamiento,

          fecha_primer_descuento:
            fechaPrimerDescuento || null,

          observaciones:
            observaciones.trim() || null,
        };
      }

      const r = await fetch(
        url,
        {
          method,
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const data =
        await r.json().catch(() => null);

      if (!r.ok) {
        throw new Error(
          data?.error ||
          (
            esEdicion
              ? "No se pudo actualizar el préstamo."
              : "No se pudo crear el préstamo."
          )
        );
      }

      onClose(true);

    } catch (e) {
      console.error(e);

      setErr(
        e.message ||
        "Error guardando préstamo."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RESET AL TERMINAR DE CERRAR
  // =====================================================

  const onExited = () => {
    setErr(null);
    setSaving(false);

    setEmpleadoId("");
    setNumero("");
    setMontoOriginal("");
    setFechaOtorgamiento("");
    setFechaPrimerDescuento("");
    setObservaciones("");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Modal
      show={show}
      onHide={() => onClose(false)}
      onExited={onExited}
      size="lg"
      centered
    >

      <Modal.Header closeButton>

        <Modal.Title>
          {esEdicion
            ? "Editar Préstamo"
            : "Nuevo Préstamo"}
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

        {/* ==============================================
            EMPLEADO
        =============================================== */}

        <Row className="g-3">

          <Col md={8}>
            <Form.Group>

              <Form.Label>
                Empleado
              </Form.Label>

              <Form.Select
                value={empleadoId}
                onChange={(e) =>
                  setEmpleadoId(
                    e.target.value
                  )
                }
                disabled={esEdicion}
                className="form-control my-input"
              >

                {empleados.length === 0 && (
                  <option value="">
                    — Sin empleados —
                  </option>
                )}

                {empleados.map((item) => {
                  const id =
                    item?.empleado?.id;

                  const apellido =
                    item?.clientePersona?.apellido ||
                    item?.empleado?.apellido ||
                    "";

                  const nombre =
                    item?.clientePersona?.nombre ||
                    item?.empleado?.nombre ||
                    "";

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {apellido} {nombre}
                    </option>
                  );
                })}

              </Form.Select>

              {esEdicion && (
                <small className="text-muted">
                  El empleado de un préstamo existente
                  no puede modificarse.
                </small>
              )}

            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>

              <Form.Label>
                Nº préstamo
              </Form.Label>

              <Form.Control
                type="text"
                value={numero}
                onChange={(e) =>
                  setNumero(
                    e.target.value
                  )
                }
                placeholder="Ej.: PR-0001"
              />

            </Form.Group>
          </Col>

        </Row>

        <Row className="g-3 mt-1">

          {/* ============================================
              MONTO ORIGINAL
          ============================================= */}

          <Col md={4}>
            <Form.Group>

              <Form.Label>
                Monto original
              </Form.Label>

              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={montoOriginal}
                onChange={(e) =>
                  setMontoOriginal(
                    e.target.value
                  )
                }
                placeholder="0.00"
              />

              {esEdicion && (
                <small className="text-muted">
                  Al modificarlo se recalculará
                  automáticamente el saldo.
                </small>
              )}

            </Form.Group>
          </Col>

          {/* ============================================
              SALDO
          ============================================= */}

          {esEdicion && (
            <Col md={4}>
              <Form.Group>

                <Form.Label>
                  Saldo actual
                </Form.Label>

                <Form.Control
                  type="text"
                  value={
                    `$${formatMonto(
                      prestamo?.saldo
                    )}`
                  }
                  readOnly
                />

                <small className="text-muted">
                  Se recalcula al guardar.
                </small>

              </Form.Group>
            </Col>
          )}

          {/* ============================================
              ESTADO
          ============================================= */}

          {esEdicion && (
            <Col md={4}>
              <Form.Group>

                <Form.Label>
                  Estado
                </Form.Label>

                <Form.Control
                  type="text"
                  value={
                    String(
                      prestamo?.estado || ""
                    ).toUpperCase()
                  }
                  readOnly
                />

              </Form.Group>
            </Col>
          )}

        </Row>

        <Row className="g-3 mt-1">

          {/* ============================================
              FECHA OTORGAMIENTO
          ============================================= */}

          <Col md={6}>
            <Form.Group>

              <Form.Label>
                Fecha de otorgamiento
              </Form.Label>

              <Form.Control
                type="date"
                value={fechaOtorgamiento}
                onChange={(e) =>
                  setFechaOtorgamiento(
                    e.target.value
                  )
                }
              />

            </Form.Group>
          </Col>

          {/* ============================================
              PRIMER DESCUENTO
          ============================================= */}

          <Col md={6}>
            <Form.Group>

              <Form.Label>
                Fecha primer descuento
              </Form.Label>

              <Form.Control
                type="date"
                value={fechaPrimerDescuento}
                onChange={(e) =>
                  setFechaPrimerDescuento(
                    e.target.value
                  )
                }
              />

              <small className="text-muted">
                A partir de esta fecha podrá incorporarse
                a una liquidación.
              </small>

            </Form.Group>
          </Col>

        </Row>

        {/* ==============================================
            OBSERVACIONES
        =============================================== */}

        <Row className="mt-3">

          <Col>
            <Form.Group>

              <Form.Label>
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
                placeholder="Observaciones del préstamo..."
              />

            </Form.Group>
          </Col>

        </Row>

        {/* ==============================================
            INFORMACIÓN EN EDICIÓN
        =============================================== */}

        {esEdicion && (
          <Alert
            variant="light"
            className="mt-3 mb-0"
          >

            <div>
              <strong>
                Empleado:
              </strong>{" "}
              {nombreEmpleado}
            </div>

            <div>
              <strong>
                Saldo actual:
              </strong>{" "}
              $
              {formatMonto(
                prestamo?.saldo
              )}
            </div>

            <small className="text-muted">
              Si modificás el monto original,
              el saldo será recalculado utilizando
              todos los pagos ya aplicados al préstamo.
            </small>

          </Alert>
        )}

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="secondary"
          onClick={() =>
            onClose(false)
          }
          disabled={saving}
        >
          Cancelar
        </Button>

        <Button
          onClick={guardar}
          disabled={
            saving ||
            !empleadoId ||
            !montoOriginal ||
            !fechaOtorgamiento
          }
        >

          {saving ? (
            <>
              <Spinner
                size="sm"
                className="me-2"
              />

              Guardando…
            </>
          ) : (
            esEdicion
              ? "Guardar cambios"
              : "Crear préstamo"
          )}

        </Button>

      </Modal.Footer>

    </Modal>
  );
}