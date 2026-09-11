import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";

import Contexts
  from "../../context/Contexts";


const apiUrl =
  process.env.REACT_APP_API_URL;


const hoyISO = () =>
  new Date()
    .toISOString()
    .slice(0, 10);


const fmtMoney = (value) =>
  Number(value || 0).toLocaleString(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }
  );


export default function AcreditarPagoProgramadoModal({
  show,
  pago,
  onHide,
  onAcreditado,
}) {

  const data =
    useContext(Contexts.DataContext) || {};


  const {
    bancosTabla = [],
    proyectosTabla = [],
    cajaAbierta,
  } = data;


  const [
    fechaAcreditacion,
    setFechaAcreditacion,
  ] = useState(hoyISO());


  const [
    medio,
    setMedio,
  ] = useState("banco");


  const [
    bancoId,
    setBancoId,
  ] = useState("");


  const [
    monto,
    setMonto,
  ] = useState("");


  const [
    descripcion,
    setDescripcion,
  ] = useState("");


  const [
    observaciones,
    setObservaciones,
  ] = useState("");


  const [
    proyectoId,
    setProyectoId,
  ] = useState("");


  const [
    numeroEcheq,
    setNumeroEcheq,
  ] = useState("");


  const [
    echeqFechaVencimiento,
    setEcheqFechaVencimiento,
  ] = useState("");


  const [
    generarAbonoCtaCte,
    setGenerarAbonoCtaCte,
  ] = useState(false);


  const [
    enviando,
    setEnviando,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  // ==========================================================
  // BANCOS
  // ==========================================================

  const bancosDisponibles =
    useMemo(
      () =>
        bancosTabla || [],
      [bancosTabla]
    );


  // ==========================================================
  // CARGAR DATOS DEL PROGRAMADO
  // ==========================================================

  useEffect(() => {

    if (
      !show ||
      !pago
    ) {
      return;
    }


    setFechaAcreditacion(
      hoyISO()
    );


    setMedio(
      pago.medio ||
      "banco"
    );


    setBancoId(
      pago.banco_id
        ? String(pago.banco_id)
        : ""
    );


    setMonto(
      pago.monto !== undefined &&
        pago.monto !== null
        ? String(pago.monto)
        : ""
    );


    setDescripcion(
      pago.descripcion ||
      ""
    );


    setObservaciones(
      pago.observaciones ||
      ""
    );


    setProyectoId(
      pago.proyecto_id
        ? String(pago.proyecto_id)
        : ""
    );


    setNumeroEcheq("");


    setEcheqFechaVencimiento(
      pago.echeq_fecha_vencimiento ||
      ""
    );


    setGenerarAbonoCtaCte(
      false
    );


    setError(null);

  }, [
    show,
    pago,
  ]);


  // ==========================================================
  // DATOS DERIVADOS
  // ==========================================================

  const montoNumero =
    Number(
      monto || 0
    );


  const montoAplicado =
    Number(
      pago?.monto_aplicado ??
      pago?.importe_aplicado ??
      0
    );


  const montoBloqueado =
    montoAplicado > 0;


  const comprobantesAplicados =
    Array.isArray(
      pago?.comprobantes_aplicados
    )
      ? pago.comprobantes_aplicados
      : [];


  const numerosComprobantesAplicados =
    comprobantesAplicados
      .map(
        (c) =>
          c?.nrocomprobante ||
          null
      )
      .filter(Boolean);


  const cajaId =
    cajaAbierta?.id ||
    null;


  const esAnticipo =
    pago?.tipo ===
    "anticipo";


  const puedeGenerarAbono =
    !esAnticipo &&
    !pago?.comprobanteegreso_id;


  // ==========================================================
  // VALIDACIÓN
  // ==========================================================

  const puedeAcreditar =

    !!pago?.id &&

    pago?.estado ===
    "pendiente" &&

    !!fechaAcreditacion &&

    [
      "banco",
      "caja",
      "echeq",
    ].includes(
      medio
    ) &&

    montoNumero > 0 &&

    !!descripcion.trim() &&

    (
      medio !== "banco" ||
      !!bancoId
    ) &&

    (
      medio !== "caja" ||
      !!cajaId
    ) &&

    (
      medio !== "echeq" ||
      (
        !!bancoId &&
        !!echeqFechaVencimiento &&
        echeqFechaVencimiento >=
        fechaAcreditacion
      )
    );


  // ==========================================================
  // CERRAR
  // ==========================================================

  const handleClose = () => {

    if (enviando) {
      return;
    }


    setError(null);

    onHide?.();
  };


  // ==========================================================
  // ACREDITAR
  // ==========================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError(null);


      if (!puedeAcreditar) {

        setError(
          "Completá todos los datos requeridos para acreditar el pago."
        );

        return;
      }


      try {

        setEnviando(true);


        const payload = {

          fecha_acreditacion:
            fechaAcreditacion,

          medio,

          monto:
            montoNumero,

          descripcion:
            descripcion.trim(),

          observaciones:
            observaciones.trim() ||
            null,

          proyecto_id:
            proyectoId
              ? Number(proyectoId)
              : null,

          banco_id:
            (
              medio === "banco" ||
              medio === "echeq"
            )
              ? Number(bancoId)
              : null,

          caja_id:
            medio === "caja"
              ? Number(cajaId)
              : null,

          echeq_fecha_vencimiento:
            medio === "echeq"
              ? echeqFechaVencimiento
              : null,

          numero_echeq:
            medio === "echeq" &&
              numeroEcheq.trim()
              ? numeroEcheq.trim()
              : null,

          generar_abono_ctacte:
            puedeGenerarAbono
              ? generarAbonoCtaCte
              : false,
        };


        const res =
          await fetch(
            `${apiUrl}/pagos-programados/${pago.id}/acreditar`,
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );


        const json =
          await res
            .json()
            .catch(
              () => ({})
            );


        if (!res.ok) {

          throw new Error(
            json?.error ||
            "No se pudo acreditar el pago programado"
          );
        }


        onAcreditado?.(
          json
        );


        onHide?.();

      } catch (e) {

        setError(
          e.message ||
          "Error acreditando el pago programado"
        );

      } finally {

        setEnviando(false);
      }
    };


  if (!pago) {
    return null;
  }


  return (

    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
    >

      <Form
        onSubmit={handleSubmit}
      >

        <Modal.Header
          closeButton
        >

          <Modal.Title>
            Acreditar Pago Programado
          </Modal.Title>

        </Modal.Header>


        <Modal.Body>

          {error && (

            <Alert
              variant="danger"
              className="py-2"
            >
              {error}
            </Alert>

          )}


          <Alert
            variant="info"
            className="py-2"
          >
            Se acreditará el pago programado{" "}
            <strong>
              #{pago.id}
            </strong>{" "}
            por{" "}
            <strong>
              {fmtMoney(
                pago.monto
              )}
            </strong>.
          </Alert>


          {/* ================================================
              FECHA + MEDIO
             ================================================ */}

          <Row className="mb-3">

            <Col md={6}>

              <Form.Label>
                Fecha de acreditación
              </Form.Label>

              <Form.Control
                type="date"
                value={
                  fechaAcreditacion
                }
                onChange={(e) =>
                  setFechaAcreditacion(
                    e.target.value
                  )
                }
                required
              />

            </Col>


            <Col md={6}>

              <Form.Label>
                Medio definitivo
              </Form.Label>

              <Form.Select
                value={medio}
                onChange={(e) => {

                  const nuevoMedio =
                    e.target.value;

                  setMedio(
                    nuevoMedio
                  );


                  if (
                    nuevoMedio !==
                    "echeq"
                  ) {
                    setNumeroEcheq("");
                  }
                }}
                required
              >

                <option value="banco">
                  Transferencia / Banco
                </option>

                <option value="caja">
                  Caja
                </option>

                <option value="echeq">
                  eCheq
                </option>

              </Form.Select>

            </Col>

          </Row>


          {/* ================================================
              BANCO
             ================================================ */}

          {(
            medio === "banco" ||
            medio === "echeq"
          ) && (

              <Row className="mb-3">

                <Col md={6}>

                  <Form.Label>
                    Banco
                  </Form.Label>

                  <Form.Select
                    value={bancoId}
                    onChange={(e) =>
                      setBancoId(
                        e.target.value
                      )
                    }
                    required
                  >

                    <option value="">
                      Seleccione…
                    </option>

                    {bancosDisponibles.map(
                      (b) => (

                        <option
                          key={b.id}
                          value={b.id}
                        >
                          {b.nombre ||
                            b.descripcion ||
                            b.alias ||
                            `Banco ${b.id}`}
                        </option>

                      )
                    )}

                  </Form.Select>

                </Col>


                {medio === "echeq" && (

                  <Col md={6}>

                    <Form.Label>
                      Número de eCheq
                    </Form.Label>

                    <Form.Control
                      value={
                        numeroEcheq
                      }
                      onChange={(e) =>
                        setNumeroEcheq(
                          e.target.value
                        )
                      }
                      placeholder="Número del eCheq"
                    />

                  </Col>

                )}

              </Row>

            )}


          {/* ================================================
              ECHEQ
             ================================================ */}

          {medio === "echeq" && (

            <Row className="mb-3">

              <Col md={6}>

                <Form.Label>
                  Fecha de vencimiento
                </Form.Label>

                <Form.Control
                  type="date"
                  value={
                    echeqFechaVencimiento
                  }
                  min={
                    fechaAcreditacion ||
                    undefined
                  }
                  onChange={(e) =>
                    setEcheqFechaVencimiento(
                      e.target.value
                    )
                  }
                  required
                  isInvalid={
                    !!echeqFechaVencimiento &&
                    !!fechaAcreditacion &&
                    echeqFechaVencimiento <
                    fechaAcreditacion
                  }
                />

                <Form.Control.Feedback
                  type="invalid"
                >
                  El vencimiento no puede ser anterior
                  a la fecha de acreditación.
                </Form.Control.Feedback>

              </Col>

            </Row>

          )}


          {/* ================================================
              CAJA
             ================================================ */}

          {medio === "caja" && (

            <Alert
              variant={
                cajaId
                  ? "light"
                  : "warning"
              }
              className="py-2"
            >

              {cajaId ? (
                <>
                  El egreso se registrará en la caja
                  actualmente abierta{" "}
                  <strong>
                    #{cajaId}
                  </strong>.
                </>
              ) : (
                <>
                  No existe una caja abierta. Debe abrirse
                  una caja antes de acreditar este pago.
                </>
              )}

            </Alert>

          )}


          {/* ================================================
              MONTO + PROYECTO
             ================================================ */}

          <Row className="mb-3">

            <Col md={6}>

              <Form.Label>
                Importe definitivo
              </Form.Label>

              <Form.Control
                type="number"
                min="0.01"
                step="0.01"
                value={monto}
                onChange={(e) =>
                  setMonto(
                    e.target.value
                  )
                }
                disabled={
                  montoBloqueado
                }
                required
              />

              {montoBloqueado && (

                <Form.Text className="text-warning">

                  El importe no puede modificarse porque este
                  Pago Programado está asociado a
                  {
                    numerosComprobantesAplicados.length > 1
                      ? " los comprobantes: "
                      : " el comprobante: "
                  }

                  <strong>
                    {
                      numerosComprobantesAplicados.length > 0
                        ? numerosComprobantesAplicados.join(", ")
                        : "asociado"
                    }
                  </strong>.

                </Form.Text>

              )}

            </Col>


            <Col md={6}>

              <Form.Label>
                Proyecto
              </Form.Label>

              <Form.Select
                value={proyectoId}
                onChange={(e) =>
                  setProyectoId(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Sin proyecto
                </option>

                {(proyectosTabla || [])
                  .map(
                    (p) => (

                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.nombre ||
                          p.descripcion ||
                          `Proyecto ${p.id}`}
                      </option>

                    )
                  )}

              </Form.Select>

            </Col>

          </Row>


          {/* ================================================
              DESCRIPCIÓN
             ================================================ */}

          <Row className="mb-3">

            <Col md={12}>

              <Form.Label>
                Descripción
              </Form.Label>

              <Form.Control
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(
                    e.target.value
                  )
                }
                required
              />

            </Col>

          </Row>


          {/* ================================================
              OBSERVACIONES
             ================================================ */}

          <Row className="mb-3">

            <Col md={12}>

              <Form.Label>
                Observaciones
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={2}
                value={
                  observaciones
                }
                onChange={(e) =>
                  setObservaciones(
                    e.target.value
                  )
                }
              />

            </Col>

          </Row>


          {/* ================================================
              DISPONIBLE CTA CTE
             ================================================ */}

          {/* {puedeGenerarAbono && (

            <Alert
              variant="light"
            >

              <Form.Check
                type="checkbox"
                id="generar-abono-ctacte"
                checked={
                  generarAbonoCtaCte
                }
                onChange={(e) =>
                  setGenerarAbonoCtaCte(
                    e.target.checked
                  )
                }
                label="Dejar este pago disponible para aplicarlo posteriormente a facturas del proveedor"
              />

              {generarAbonoCtaCte && (

                <small className="text-muted d-block mt-1">
                  Se generará un abono en la cuenta corriente
                  del proveedor por el importe acreditado.
                </small>

              )}

            </Alert>

          )} */}

        </Modal.Body>


        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={enviando}
          >
            Cancelar
          </Button>


          <Button
            variant="success"
            type="submit"
            disabled={
              enviando ||
              !puedeAcreditar
            }
          >

            {enviando ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Acreditando…
              </>
            ) : (
              "Acreditar Pago"
            )}

          </Button>

        </Modal.Footer>

      </Form>

    </Modal>
  );
}