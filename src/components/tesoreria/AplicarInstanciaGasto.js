import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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


const apiUrl =
  process.env.REACT_APP_API_URL;


// ======================================================
// HELPERS
// ======================================================

const isoToday = () =>
  new Date()
    .toISOString()
    .slice(0, 10);


const N = (value) => {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : 0;
};


const toMoney = (value) =>
  N(value).toLocaleString(
    "es-AR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );


// ======================================================
// COMPONENTE
// ======================================================

export default function AplicarInstanciaGasto({
  show,
  onHide,
  onApplied,
  instancia,
}) {

  const dataContext =
    useContext(Contexts.DataContext);


  const {
    empresaSeleccionada,
    cajaAbierta,
    bancosTabla = [],
    formasPagoTesoreria = [],
    categoriasEgreso = [],
    proyectosTabla = [],
  } = dataContext || {};


  // ======================================================
  // ESTADO
  // ======================================================

  const [
    medio,
    setMedio,
  ] = useState("caja");


  const [
    cajaId,
    setCajaId,
  ] = useState("");


  const [
    bancoId,
    setBancoId,
  ] = useState("");


  const [
    fecha,
    setFecha,
  ] = useState(
    isoToday()
  );


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
    cancelarRenovacion,
    setCancelarRenovacion,
  ] = useState(false);

  const [
    aplicarVariasFacturas,
    setAplicarVariasFacturas,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  // ======================================================
  // DATOS DERIVADOS
  // ======================================================

  const empresaId =
    instancia?.empresa_id ||
    empresaSeleccionada?.id ||
    null;


  const proveedorId =
    instancia?.proveedor_id ||
    null;


  const categoriaId =
    instancia?.categoria_id ||
    instancia?.categoriaegreso_id ||
    null;


  const saldoInstancia =
    N(instancia?.monto_base);


  // ======================================================
  // FORMA DE PAGO CAJA
  // ======================================================

  const formaPagoCaja =
    useMemo(
      () =>
        formasPagoTesoreria.find(
          (fp) =>
            /(caja|efectivo)/i.test(
              String(
                fp.descripcion || ""
              )
            )
        ) || null,
      [
        formasPagoTesoreria,
      ]
    );


  // ======================================================
  // FORMA DE PAGO BANCO
  // ======================================================

  const formaPagoBanco =
    useMemo(
      () =>
        formasPagoTesoreria.find(
          (fp) =>
            /(transfer|banco)/i.test(
              String(
                fp.descripcion || ""
              )
            )
        ) || null,
      [
        formasPagoTesoreria,
      ]
    );


  // ======================================================
  // BANCOS DE LA EMPRESA
  // ======================================================

  const bancosEmpresa =
    useMemo(
      () =>
        (bancosTabla || []).filter(
          (b) =>
            !empresaId ||
            Number(b.empresa_id) ===
            Number(empresaId)
        ),
      [
        bancosTabla,
        empresaId,
      ]
    );


  // ======================================================
  // CAJAS DE LA EMPRESA
  // ======================================================

  // const cajasEmpresa =
  //   useMemo(
  //     () =>
  //       (cajasTesoreria || []).filter(
  //         (c) =>
  //           !empresaId ||
  //           !c.empresa_id ||
  //           Number(c.empresa_id) ===
  //           Number(empresaId)
  //       ),
  //     [
  //       cajasTesoreria,
  //       empresaId,
  //     ]
  //   );


  // ======================================================
  // PRECARGAR INSTANCIA
  // ======================================================

  useEffect(
    () => {

      if (
        !show ||
        !instancia
      ) {
        return;
      }


      setError(null);

      setSaving(false);

      setFecha(
        isoToday()
      );


      setMonto(
        String(
          N(instancia.monto_base)
        )
      );


      setDescripcion(
        instancia.descripcion ||
        ""
      );


      setObservaciones(
        ""
      );


      setProyectoId(
        instancia.proyecto_id
          ? String(
            instancia.proyecto_id
          )
          : ""
      );


      setCancelarRenovacion(
        false
      );


      // ================================================
      // Intentamos respetar FP acordada
      // ================================================

      const fp =
        String(
          instancia.formapago_futuro_desc ||
          ""
        ).toLowerCase();


      if (
        fp.includes("transfer") ||
        fp.includes("banco")
      ) {

        setMedio(
          "banco"
        );

      } else {

        setMedio(
          "caja"
        );
      }


      setCajaId(
        ""
      );

      setBancoId(
        ""
      );

    },
    [
      show,
      instancia,
    ]
  );


  // ======================================================
  // AUTOPRESELECCIONAR CAJA/BANCO SI HAY UNO SOLO
  // ======================================================

  // useEffect(
  //   () => {

  //     if (
  //       medio === "caja" &&
  //       !cajaId &&
  //       cajasEmpresa.length === 1
  //     ) {

  //       setCajaId(
  //         String(
  //           cajasEmpresa[0].id
  //         )
  //       );
  //     }

  //   },
  //   [
  //     medio,
  //     cajaId,
  //     cajasEmpresa,
  //   ]
  // );


  useEffect(
    () => {

      if (
        medio === "banco" &&
        !bancoId &&
        bancosEmpresa.length === 1
      ) {

        setBancoId(
          String(
            bancosEmpresa[0].id
          )
        );
      }

    },
    [
      medio,
      bancoId,
      bancosEmpresa,
    ]
  );


  // ======================================================
  // VALIDACIÓN
  // ======================================================

  const validar = () => {

    if (!instancia?.id) {
      throw new Error(
        "No se indicó la instancia a aplicar"
      );
    }


    if (!empresaId) {
      throw new Error(
        "No se pudo determinar la empresa"
      );
    }


    if (!proveedorId) {
      throw new Error(
        "La instancia no tiene proveedor"
      );
    }


    if (!categoriaId) {
      throw new Error(
        "La instancia no tiene categoría de egreso"
      );
    }


    if (!fecha) {
      throw new Error(
        "Debe indicar la fecha"
      );
    }


    if (!(N(monto) > 0)) {
      throw new Error(
        "El monto debe ser mayor a cero"
      );
    }


    if (
      saldoInstancia > 0 &&
      N(monto) >
      saldoInstancia
    ) {

      throw new Error(
        `El monto no puede superar el saldo pendiente de $${toMoney(
          saldoInstancia
        )}`
      );
    }


    if (
      medio === "caja" &&
      (
        !cajaAbierta?.caja?.id ||
        cajaAbierta?.abierta !== true
      )
    ) {

      throw new Error(
        "No hay una caja abierta disponible para registrar el pago"
      );
    }


    if (
      medio === "banco" &&
      !bancoId
    ) {

      throw new Error(
        "Debe seleccionar un banco"
      );
    }


    if (
      medio === "caja" &&
      !formaPagoCaja?.id
    ) {

      throw new Error(
        "No se encontró la forma de pago Caja/Efectivo"
      );
    }


    if (
      medio === "banco" &&
      !formaPagoBanco?.id
    ) {

      throw new Error(
        "No se encontró la forma de pago Banco/Transferencia"
      );
    }
  };


  // ======================================================
  // REGISTRAR MOVIMIENTO REAL
  // ======================================================

  const registrarMovimiento = async () => {

    const formapagoId =
      medio === "caja"
        ? formaPagoCaja.id
        : formaPagoBanco.id;


    const egreso = {

      fecha,

      monto:
        N(monto),

      descripcion:
        descripcion.trim() ||
        instancia.descripcion ||
        `Pago instancia #${instancia.id}`,

      generar_abono_ctacte:
        aplicarVariasFacturas,

      proyecto_id:
        proyectoId
          ? Number(proyectoId)
          : null,

      categoriaegreso_id:
        Number(categoriaId),

      imputacioncontable_id:
        instancia.imputacioncontable_id
          ? Number(
            instancia.imputacioncontable_id
          )
          : null,

      observaciones:
        observaciones.trim() ||
        null,

      proveedor_id:
        Number(proveedorId),

      formapago_id:
        Number(formapagoId),
    };


    let url;


    if (
      medio === "caja"
    ) {

      egreso.caja_id =
        Number(
          cajaAbierta.caja.id
        );

      url =
        `${apiUrl}/movimientos-caja-tesoreria/egresos-independientes`;

    } else {
      egreso.banco_id =
        Number(bancoId);

      url =
        `${apiUrl}/movimientos-banco-tesoreria/egresos-independientes`;
    }


    const response =
      await fetch(
        url,
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
            JSON.stringify({
              empresa_id:
                Number(empresaId),

              egreso,
            }),
        }
      );


    const json =
      await response
        .json()
        .catch(
          () => ({})
        );


    if (!response.ok) {

      throw new Error(
        json?.error ||
        "No se pudo registrar el movimiento"
      );
    }


    return {
      json,
      formapagoId,
    };
  };


  // ======================================================
  // OBTENER ID DEL MOVIMIENTO
  // ======================================================

  const obtenerMovimientoId = (
    respuesta
  ) => {

    return Number(

      respuesta?.movimiento?.id ||

      respuesta?.movimientoCaja?.id ||

      respuesta?.movimientoBanco?.id ||

      respuesta?.movimiento_id ||

      respuesta?.id ||

      0
    );
  };


  // ======================================================
  // APLICAR A INSTANCIA
  // ======================================================

  const aplicarAInstancia =
    async (
      movimientoId,
      formapagoId
    ) => {

      const referenciaTipo =
        medio === "caja"
          ? "MovimientoCajaTesoreria"
          : "MovimientoBancoTesoreria";


      const response =
        await fetch(
          `${apiUrl}/gasto-estimado/instancias/${instancia.id}/pagos`,
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
              JSON.stringify({

                referencia_tipo:
                  referenciaTipo,

                referencia_id:
                  movimientoId,

                formapago_id:
                  Number(
                    formapagoId
                  ),

                fecha_aplicacion:
                  fecha,

                monto_aplicado:
                  N(monto),

                observaciones:
                  observaciones.trim() ||
                  descripcion.trim() ||
                  null,

                cancelar_renovacion:
                  cancelarRenovacion,
              }),
          }
        );


      const json =
        await response
          .json()
          .catch(
            () => ({})
          );


      if (!response.ok) {

        throw new Error(
          json?.error ||
          "El movimiento fue creado, pero no se pudo aplicar a la instancia"
        );
      }


      return json;
    };


  // ======================================================
  // GUARDAR
  // ======================================================

  const handleAplicar =
    async () => {

      try {

        setError(null);

        validar();

        setSaving(true);


        // ================================================
        // 1. Crear egreso real
        // ================================================

        const {
          json:
          movimientoResponse,

          formapagoId,

        } =
          await registrarMovimiento();


        // ================================================
        // 2. Obtener ID
        // ================================================

        const movimientoId =
          obtenerMovimientoId(
            movimientoResponse
          );


        if (!movimientoId) {

          throw new Error(
            "El movimiento fue registrado, pero el backend no devolvió su ID"
          );
        }


        // ================================================
        // 3. Aplicar a instancia
        // ================================================

        await aplicarAInstancia(
          movimientoId,
          formapagoId
        );


        // ================================================
        // 4. Refrescar SitFinanciera
        // ================================================

        if (onApplied) {

          await onApplied({
            instancia_id:
              instancia.id,

            movimiento_id:
              movimientoId,

            medio,
          });
        }


      } catch (e) {

        console.error(
          "AplicarInstanciaGasto:",
          e
        );


        setError(
          e.message ||
          "No se pudo aplicar la instancia"
        );

      } finally {

        setSaving(false);
      }
    };


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <Modal
      show={show}
      onHide={
        saving
          ? undefined
          : onHide
      }
      backdrop={
        saving
          ? "static"
          : true
      }
      centered
      size="lg"
    >

      <Modal.Header closeButton={!saving}>

        <Modal.Title>
          Aplicar gasto mensual
        </Modal.Title>

      </Modal.Header>


      <Modal.Body>

        {error && (

          <Alert variant="danger">

            {error}

          </Alert>

        )}


        {!instancia ? (

          <Alert variant="warning">

            No se indicó una instancia.

          </Alert>

        ) : (

          <>

            {/* ======================================= */}
            {/* DATOS PRECARGADOS                      */}
            {/* ======================================= */}

            <Row className="g-3 mb-3">

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Proveedor
                  </Form.Label>

                  <Form.Control
                    value={
                      instancia.proveedor_nombre ||
                      ""
                    }
                    disabled
                  />

                </Form.Group>

              </Col>


              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Instancia
                  </Form.Label>

                  <Form.Control
                    value={
                      instancia.descripcion ||
                      ""
                    }
                    disabled
                  />

                </Form.Group>

              </Col>


              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Vencimiento
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={
                      instancia.fecha_vencimiento ||
                      ""
                    }
                    disabled
                  />

                </Form.Group>

              </Col>


              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Categoría
                  </Form.Label>

                  <Form.Control
                    value={
                      instancia.categoria_nombre ||
                      ""
                    }
                    disabled
                  />

                </Form.Group>

              </Col>


              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Saldo pendiente
                  </Form.Label>

                  <Form.Control
                    value={
                      `$${toMoney(
                        saldoInstancia
                      )}`
                    }
                    disabled
                  />

                </Form.Group>

              </Col>

            </Row>


            <hr />


            {/* ======================================= */}
            {/* MEDIO                                   */}
            {/* ======================================= */}

            <Form.Group className="mb-3">

              <Form.Label>
                Forma de pago
              </Form.Label>


              <div>

                <Form.Check
                  inline
                  type="radio"
                  name="medio-instancia"
                  id="instancia-medio-caja"
                  label="Caja / Efectivo"
                  value="caja"
                  checked={
                    medio === "caja"
                  }
                  disabled={saving}
                  onChange={() =>
                    setMedio(
                      "caja"
                    )
                  }
                />


                <Form.Check
                  inline
                  type="radio"
                  name="medio-instancia"
                  id="instancia-medio-banco"
                  label="Banco / Transferencia"
                  value="banco"
                  checked={
                    medio === "banco"
                  }
                  disabled={saving}
                  onChange={() =>
                    setMedio(
                      "banco"
                    )
                  }
                />

              </div>

            </Form.Group>


            <Row className="g-3">

              {/* ===================================== */}
              {/* CAJA                                  */}
              {/* ===================================== */}

              {medio === "caja" && (

                <Col md={6}>

                  <Form.Group>

                    <Form.Label>
                      Caja
                    </Form.Label>

                    <Form.Control
                      value={
                        cajaAbierta?.caja?.id
                          ? `Caja abierta #${cajaAbierta.caja.id}`
                          : "No hay caja abierta"
                      }
                      disabled
                    />

                    {cajaAbierta?.caja?.id && (

                      <Form.Text muted>
                        Saldo actual: $
                        {toMoney(
                          cajaAbierta.saldo
                        )}
                      </Form.Text>

                    )}

                  </Form.Group>

                </Col>

              )}

              {/* ===================================== */}
              {/* BANCO                                 */}
              {/* ===================================== */}

              {medio === "banco" && (

                <Col md={6}>

                  <Form.Group>

                    <Form.Label>
                      Banco
                    </Form.Label>

                    <Form.Select
                      value={bancoId}
                      disabled={saving}
                      onChange={(e) =>
                        setBancoId(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Seleccionar...
                      </option>

                      {bancosEmpresa.map(
                        (b) => (

                          <option
                            key={b.id}
                            value={b.id}
                          >
                            {
                              b.descripcion ||
                              b.nombre ||
                              `Banco ${b.id}`
                            }
                          </option>

                        )
                      )}

                    </Form.Select>

                  </Form.Group>

                </Col>

              )}


              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Fecha de pago
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={fecha}
                    disabled={saving}
                    onChange={(e) =>
                      setFecha(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Monto a aplicar
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={monto}
                    disabled={saving}
                    onChange={(e) =>
                      setMonto(
                        e.target.value
                      )
                    }
                  />

                  <Form.Text muted>

                    Máximo: $
                    {toMoney(
                      saldoInstancia
                    )}

                  </Form.Text>

                </Form.Group>

              </Col>


              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Proyecto
                  </Form.Label>

                  <Form.Select
                    value={proyectoId}
                    disabled={saving}
                    onChange={(e) =>
                      setProyectoId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Sin proyecto
                    </option>

                    {(proyectosTabla || []).map(
                      (p) => (

                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {
                            p.nombre ||
                            p.descripcion ||
                            `Proyecto ${p.id}`
                          }
                        </option>

                      )
                    )}

                  </Form.Select>

                </Form.Group>

              </Col>


              <Col md={12}>

                <Form.Group>

                  <Form.Label>
                    Descripción
                  </Form.Label>

                  <Form.Control
                    value={descripcion}
                    disabled={saving}
                    onChange={(e) =>
                      setDescripcion(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


              <Col md={12}>

                <Form.Group>

                  <Form.Label>
                    Observaciones
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={observaciones}
                    disabled={saving}
                    onChange={(e) =>
                      setObservaciones(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>

              <Col md={12}>
                <Form.Check
                  type="checkbox"
                  id="aplicar-varias-facturas-instancia"
                  label="Este pago se aplicará a varias facturas"
                  checked={aplicarVariasFacturas}
                  disabled={saving}
                  onChange={(e) =>
                    setAplicarVariasFacturas(
                      e.target.checked
                    )
                  }
                />

                {aplicarVariasFacturas && (
                  <Form.Text muted>
                    Se generará un abono en la cuenta corriente del proveedor
                    para poder distribuir este pago entre varias facturas.
                  </Form.Text>
                )}
              </Col>

              <Col md={12}>

                <Form.Check
                  type="checkbox"
                  id="cancelar-renovacion-instancia"
                  label="Cancelar renovación del gasto mensual"
                  checked={
                    cancelarRenovacion
                  }
                  disabled={saving}
                  onChange={(e) =>
                    setCancelarRenovacion(
                      e.target.checked
                    )
                  }
                />

              </Col>

            </Row>

          </>

        )}

      </Modal.Body>


      <Modal.Footer>

        <Button
          variant="secondary"
          disabled={saving}
          onClick={onHide}
        >
          Cancelar
        </Button>


        <Button
          variant="success"
          disabled={
            saving ||
            !instancia
          }
          onClick={
            handleAplicar
          }
        >

          {saving ? (

            <>
              <Spinner
                size="sm"
                animation="border"
                className="me-2"
              />

              Aplicando...
            </>

          ) : (

            "Aplicar"

          )}

        </Button>

      </Modal.Footer>

    </Modal>
  );
}