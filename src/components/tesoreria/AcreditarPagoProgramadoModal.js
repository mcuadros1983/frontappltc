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
  // ACREDITACIÓN PARCIAL
  // ==========================================================

  const [
    confirmarSaldo,
    setConfirmarSaldo,
  ] = useState(false);

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

    setConfirmarSaldo(false);

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

  /*
   * El monto original siempre se toma del PagoProgramado
   * recibido.
   *
   * Aunque el usuario modifique el input "monto",
   * pago.monto permanece intacto.
   */
  const montoOriginal =
    Number(
      pago?.monto || 0
    );

  const diferenciaMonto =
    Math.max(
      0,
      montoOriginal - montoNumero
    );

  const montoAplicado =
    Number(
      pago?.monto_aplicado ??
      pago?.importe_aplicado ??
      0
    );


  const montoBloqueado =
    montoAplicado > 0;

  /*
   * Solamente consideramos pago parcial cuando el monto
   * puede modificarse.
   *
   * Si está aplicado a comprobantes, se mantiene
   * exactamente la restricción actual.
   */
  const esAcreditacionParcial =
    !montoBloqueado &&
    montoNumero > 0 &&
    montoNumero < montoOriginal;

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

    setConfirmarSaldo(false);

    onHide?.();
  };


  // ==========================================================
  // ACREDITAR
  // ==========================================================

  const acreditarPago =
    async ({
      generarSaldo = false,
    } = {}) => {

      setError(null);

      if (!puedeAcreditar) {

        setError(
          "Completá todos los datos requeridos para acreditar el pago."
        );

        return;
      }


      try {

        setEnviando(true);


        // ====================================================
        // 1. ACREDITAR EL PAGO ACTUAL
        // ====================================================

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


        // ====================================================
        // 2. SI EL USUARIO LO SOLICITÓ,
        //    CREAR NUEVO PAGO PROGRAMADO POR LA DIFERENCIA
        // ====================================================

        if (
          generarSaldo &&
          diferenciaMonto > 0
        ) {

          /*
           * MUY IMPORTANTE:
           *
           * Todos los datos se toman de `pago`,
           * es decir, del PagoProgramado ORIGINAL.
           *
           * NO tomamos medio, banco, descripción,
           * proyecto, etc. del formulario de acreditación.
           *
           * El único dato funcional que cambia es MONTO.
           */

          const payloadSaldo = {

            empresa_id:
              Number(
                pago.empresa_id
              ),

            proveedor_id:
              Number(
                pago.proveedor_id
              ),

            tipo:
              pago.tipo,

            medio:
              pago.medio,

            fecha_programada:
              pago.fecha_programada,

            monto:
              diferenciaMonto,

            descripcion:
              pago.descripcion,

            observaciones:
              pago.observaciones ||
              null,

            formapago_id:
              pago.formapago_id
                ? Number(
                  pago.formapago_id
                )
                : null,

            banco_id:
              pago.banco_id
                ? Number(
                  pago.banco_id
                )
                : null,

            caja_id:
              pago.caja_id
                ? Number(
                  pago.caja_id
                )
                : null,

            echeq_fecha_vencimiento:
              pago.echeq_fecha_vencimiento ||
              null,

            categoriaegreso_id:
              pago.categoriaegreso_id
                ? Number(
                  pago.categoriaegreso_id
                )
                : null,

            imputacioncontable_id:
              pago.imputacioncontable_id
                ? Number(
                  pago.imputacioncontable_id
                )
                : null,

            proyecto_id:
              pago.proyecto_id
                ? Number(
                  pago.proyecto_id
                )
                : null,

            /*
             * No copiamos:
             *
             * - comprobanteegreso_id
             * - ordenpago_id
             * - movimiento_ctacte_id
             * - estado
             * - fecha_acreditacion
             * - movimiento_tipo
             * - movimiento_id
             * - idempotency_key
             *
             * El nuevo PagoProgramado debe generar
             * sus propias relaciones.
             */

            idempotencyKey:
              `saldo-pago-programado-${pago.id}-${Date.now()}`,
          };


          const resSaldo =
            await fetch(
              `${apiUrl}/pagos-programados`,
              {
                method:
                  "POST",

                credentials:
                  "include",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    payloadSaldo
                  ),
              }
            );


          const jsonSaldo =
            await resSaldo
              .json()
              .catch(
                () => ({})
              );


          if (!resSaldo.ok) {

            /*
             * ATENCIÓN:
             *
             * A esta altura la acreditación YA se realizó.
             * Por eso el mensaje debe dejarlo claramente
             * indicado.
             */

            throw new Error(
              `El pago de ${fmtMoney(
                montoNumero
              )} fue acreditado correctamente, pero no se pudo generar el nuevo Pago Programado por el saldo de ${fmtMoney(
                diferenciaMonto
              )}. ${jsonSaldo?.error || ""
              }`
            );
          }
        }


        // ====================================================
        // 3. TODO OK
        // ====================================================

        setConfirmarSaldo(false);

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


  // ==========================================================
  // SUBMIT
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


      /*
       * Si el usuario está acreditando menos que el
       * PagoProgramado original, NO acreditamos todavía.
       *
       * Primero mostramos la decisión sobre el saldo.
       */
      if (esAcreditacionParcial) {

        setConfirmarSaldo(true);

        return;
      }


      /*
       * Si no existe diferencia, seguimos exactamente
       * con la acreditación normal.
       */
      await acreditarPago({
        generarSaldo: false,
      });
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
                onChange={(e) => {

                  setMonto(
                    e.target.value
                  );

                  setConfirmarSaldo(
                    false
                  );
                }}
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

          {/* ==================================================
    ACREDITACIÓN PARCIAL
   ================================================== */}

          {confirmarSaldo &&
            esAcreditacionParcial && (

              <Alert
                variant="warning"
                className="mt-3 mb-0"
              >

                <div className="fw-bold mb-2">
                  Acreditación parcial del Pago Programado
                </div>


                <div className="mb-3">

                  El importe ingresado es menor al importe
                  original del Pago Programado.

                </div>


                <Row className="g-2">

                  <Col md={4}>

                    <div className="text-muted">
                      Importe original
                    </div>

                    <strong>
                      {fmtMoney(
                        montoOriginal
                      )}
                    </strong>

                  </Col>


                  <Col md={4}>

                    <div className="text-muted">
                      Importe a acreditar
                    </div>

                    <strong>
                      {fmtMoney(
                        montoNumero
                      )}
                    </strong>

                  </Col>


                  <Col md={4}>

                    <div className="text-muted">
                      Saldo pendiente
                    </div>

                    <strong>
                      {fmtMoney(
                        diferenciaMonto
                      )}
                    </strong>

                  </Col>

                </Row>


                <hr />


                <div className="fw-bold">

                  ¿Desea generar automáticamente un nuevo
                  Pago Programado por{" "}

                  {fmtMoney(
                    diferenciaMonto
                  )}{" "}

                  con los mismos datos del Pago Programado
                  original?

                </div>

              </Alert>

            )}

        </Modal.Body>


        <Modal.Footer>

          {confirmarSaldo &&
            esAcreditacionParcial ? (

            <>
              {/* ============================================
          VOLVER
         ============================================ */}

              <Button
                variant="secondary"
                type="button"
                disabled={enviando}
                onClick={() =>
                  setConfirmarSaldo(false)
                }
              >
                Volver
              </Button>


              {/* ============================================
          ACREDITAR SIN CREAR SALDO
         ============================================ */}

              <Button
                variant="outline-success"
                type="button"
                disabled={enviando}
                onClick={() =>
                  acreditarPago({
                    generarSaldo:
                      false,
                  })
                }
              >
                {enviando
                  ? "Procesando…"
                  : `Acreditar ${fmtMoney(
                    montoNumero
                  )} sin generar saldo`}
              </Button>


              {/* ============================================
          ACREDITAR + GENERAR DIFERENCIA
         ============================================ */}

              <Button
                variant="success"
                type="button"
                disabled={enviando}
                onClick={() =>
                  acreditarPago({
                    generarSaldo:
                      true,
                  })
                }
              >

                {enviando ? (

                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />

                    Procesando…
                  </>

                ) : (

                  `Acreditar y programar ${fmtMoney(
                    diferenciaMonto
                  )}`

                )}

              </Button>
            </>

          ) : (

            <>
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
            </>

          )}

        </Modal.Footer>

      </Form>

    </Modal>
  );
}