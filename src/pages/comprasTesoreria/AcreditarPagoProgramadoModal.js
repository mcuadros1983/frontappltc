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


// ======================================================
// HELPERS
// ======================================================

const isoToday = () =>
  new Date()
    .toISOString()
    .slice(0, 10);


const N = (value) => {

  const n =
    Number(value);

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

export default function AcreditarPagoProgramadoModal({
  show,
  onHide,
  row,
  onConfirm,
}) {

  const dataContext =
    useContext(
      Contexts.DataContext
    );


  const {
    empresaSeleccionada,
    cajaAbierta,
    cajasTesoreria = [],
    bancosTabla = [],
    formasPagoTesoreria = [],
    proyectosTabla = [],
  } =
    dataContext || {};

  console.log(
    "CAJA ABIERTA DATA CONTEXT:",
    cajaAbierta
  );

  console.log(
    "FORMAS PAGO TESORERIA:",
    formasPagoTesoreria
  );

  // ======================================================
  // ESTADOS
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

  const [
    formaPagoId,
    setFormaPagoId,
  ] = useState("");

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================

  const empresaId =
    row?.empresa_id ||
    empresaSeleccionada?.id ||
    null;


  const esAnticipo =
    row?.pago_programado_tipo ===
    "anticipo";

  const formaPagoAutomatica =
    useMemo(() => {

      const descripcionBuscada =
        medio === "caja"
          ? "EFECTIVO"
          : "TRANSFERENCIA";

      return (
        formasPagoTesoreria || []
      ).find(
        (fp) =>
          String(
            fp.descripcion || ""
          )
            .trim()
            .toUpperCase() ===
          descripcionBuscada
      ) || null;

    }, [
      formasPagoTesoreria,
      medio,
    ]);

  // ======================================================
  // BANCOS EMPRESA
  // ======================================================

  // const bancosEmpresa =
  //   useMemo(
  //     () =>
  //       (bancosTabla || []).filter(
  //         (b) =>
  //           !empresaId ||
  //           Number(b.empresa_id) ===
  //           Number(empresaId)
  //       ),
  //     [
  //       bancosTabla,
  //       empresaId,
  //     ]
  //   );

  const bancosDisponibles =
    useMemo(() => {

      return bancosTabla || [];

    }, [
      bancosTabla,
    ]);


  // ======================================================
  // CAJAS EMPRESA
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
  // PRECARGAR PAGO PROGRAMADO
  // ======================================================

  useEffect(
    () => {

      if (
        !show ||
        !row
      ) {
        return;
      }


      setError(null);

      setSaving(false);


      // Fecha efectiva del pago:
      // por defecto hoy.
      setFecha(
        isoToday()
      );


      setMonto(
        String(
          N(row.monto_base)
        )
      );


      setDescripcion(
        row.descripcion ||
        ""
      );


      setObservaciones(
        row.observaciones ||
        ""
      );


      setProyectoId(
        row.proyecto_id
          ? String(
            row.proyecto_id
          )
          : ""
      );

      setFormaPagoId(
        row.formapago_id
          ? String(
            row.formapago_id
          )
          : ""
      );


      setAplicarVariasFacturas(
        false
      );


      // ================================================
      // MEDIO ORIGINAL PROGRAMADO
      // ================================================

      if (
        row.medio === "banco"
      ) {

        setMedio(
          "banco"
        );

      } else {

        setMedio(
          "caja"
        );
      }


      // ================================================
      // BANCO ORIGINAL
      // ================================================

      setBancoId(
        row.banco_id
          ? String(
            row.banco_id
          )
          : ""
      );


      // ================================================
      // CAJA ORIGINAL
      // ================================================

      // setCajaId(
      //   row.caja_id
      //     ? String(
      //       row.caja_id
      //     )
      //     : ""
      // );

    },
    [
      show,
      row,
    ]
  );


  // ======================================================
  // AUTOSELECCIONAR BANCO SI HAY UNO SOLO
  // ======================================================

  useEffect(
    () => {

      if (
        medio === "banco" &&
        !bancoId &&
        bancosDisponibles.length === 1
      ) {

        setBancoId(
          String(
            bancosDisponibles[0].id
          )
        );
      }

    },
    [
      medio,
      bancoId,
      bancosDisponibles,
    ]
  );


  // ======================================================
  // AUTOSELECCIONAR CAJA SI HAY UNA SOLA
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


  // ======================================================
  // VALIDAR
  // ======================================================

  const validar = () => {

    if (!row?.id) {

      throw new Error(
        "No se indicó el pago programado"
      );
    }


    if (!fecha) {

      throw new Error(
        "Debe indicar la fecha de pago"
      );
    }


    if (
      !(N(monto) > 0)
    ) {

      throw new Error(
        "El monto debe ser mayor a cero"
      );
    }


    if (
      !descripcion.trim()
    ) {

      throw new Error(
        "Debe indicar una descripción"
      );
    }


    if (
      !["caja", "banco"].includes(
        medio
      )
    ) {

      throw new Error(
        "Debe seleccionar una forma de pago"
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

    if (!formaPagoAutomatica?.id) {

      throw new Error(
        medio === "caja"
          ? "No se encontró la forma de pago Efectivo"
          : "No se encontró la forma de pago Transferencia"
      );
    }
    // if (!formaPagoId) {

    //   throw new Error(
    //     "Debe seleccionar una forma de pago"
    //   );
    // }

  };


  // ======================================================
  // CONFIRMAR
  // ======================================================

  const confirmar =
    async () => {

      try {

        setError(null);

        validar();

        setSaving(true);


        const payload = {

          fecha_acreditacion:
            fecha,

          medio,

          formapago_id:
            Number(
              formaPagoAutomatica.id
            ),

          caja_id:
            medio === "caja"
              ? Number(
                cajaAbierta.caja.id
              )
              : null,

          banco_id:
            medio === "banco"
              ? Number(
                bancoId
              )
              : null,

          monto:
            N(monto),

          descripcion:
            descripcion.trim(),

          observaciones:
            observaciones.trim() ||
            null,

          proyecto_id:
            proyectoId
              ? Number(
                proyectoId
              )
              : null,

          generar_abono_ctacte:
            esAnticipo
              ? false
              : aplicarVariasFacturas,
        };


        console.log(
          "AcreditarPagoProgramado payload:",
          payload
        );


        await onConfirm?.(
          payload
        );


      } catch (e) {

        console.error(
          "AcreditarPagoProgramadoModal:",
          e
        );


        setError(
          e.message ||
          "No se pudo acreditar el pago programado"
        );


        /*
         * IMPORTANTE:
         * si onConfirm lanza error,
         * el modal permanece abierto.
         */
        setSaving(false);
      }
    };


  // ======================================================
  // CERRAR
  // ======================================================

  const cerrar = () => {

    if (saving) {
      return;
    }

    onHide?.();
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <Modal
      show={show}
      onHide={cerrar}
      centered
      size="lg"
      backdrop={
        saving
          ? "static"
          : true
      }
    >

      <Modal.Header
        closeButton={
          !saving
        }
      >

        <Modal.Title>
          Acreditar pago programado
        </Modal.Title>

      </Modal.Header>


      <Modal.Body>

        {error && (

          <Alert
            variant="danger"
          >

            {error}

          </Alert>

        )}


        {!row ? (

          <Alert
            variant="warning"
          >

            No se indicó el pago programado.

          </Alert>

        ) : (

          <>

            {/* ======================================= */}
            {/* DATOS DEL PAGO PROGRAMADO              */}
            {/* ======================================= */}

            <Row
              className="g-3 mb-3"
            >

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Proveedor
                  </Form.Label>

                  <Form.Control
                    value={
                      row.proveedor_nombre ||
                      ""
                    }
                    disabled
                  />

                </Form.Group>

              </Col>


              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Tipo
                  </Form.Label>

                  <Form.Control
                    value={
                      esAnticipo
                        ? "Anticipo"
                        : "Egreso varios"
                    }
                    disabled
                  />

                </Form.Group>

              </Col>


              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Fecha programada
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={
                      row.fecha_programada ||
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
                      row.categoria_nombre ||
                      ""
                    }
                    disabled
                  />

                </Form.Group>

              </Col>


              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Monto programado
                  </Form.Label>

                  <Form.Control
                    value={
                      `$${toMoney(
                        row.monto_base
                      )}`
                    }
                    disabled
                  />

                </Form.Group>

              </Col>

            </Row>


            <hr />


            {/* ======================================= */}
            {/* FORMA DE PAGO                          */}
            {/* ======================================= */}

            <Form.Group
              className="mb-3"
            >

              <Form.Label>
                Medio de pago
              </Form.Label>


              <div>

                <Form.Check
                  inline
                  type="radio"
                  name="medio-programado"
                  id="programado-medio-caja"
                  label="Caja / Efectivo"
                  value="caja"
                  checked={
                    medio === "caja"
                  }
                  disabled={
                    saving
                  }
                  onChange={() =>
                    setMedio(
                      "caja"
                    )
                  }
                />


                <Form.Check
                  inline
                  type="radio"
                  name="medio-programado"
                  id="programado-medio-banco"
                  label="Banco / Transferencia"
                  value="banco"
                  checked={
                    medio === "banco"
                  }
                  disabled={
                    saving
                  }
                  onChange={() =>
                    setMedio(
                      "banco"
                    )
                  }
                />

              </div>

            </Form.Group>
            {/* 
            <Form.Group
              className="mb-3"
            >

              <Form.Label>
                Forma de pago
              </Form.Label>

              <Form.Select
                value={
                  formaPagoId
                }
                disabled={
                  saving
                }
                onChange={(e) =>
                  setFormaPagoId(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Seleccionar...
                </option>

                {(formasPagoTesoreria || []).map(
                  (fp) => (

                    <option
                      key={
                        fp.id
                      }
                      value={
                        fp.id
                      }
                    >
                      {
                        fp.descripcion ||
                        fp.nombre ||
                        `Forma de pago ${fp.id}`
                      }
                    </option>

                  )
                )}

              </Form.Select>

            </Form.Group> */}

            <Row
              className="g-3"
            >

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

                    {cajaAbierta?.id && (
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
                      value={
                        bancoId
                      }
                      disabled={
                        saving
                      }
                      onChange={(e) =>
                        setBancoId(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Seleccionar...
                      </option>


                      {bancosDisponibles.map(
                        (b) => (

                          <option
                            key={
                              b.id
                            }
                            value={
                              b.id
                            }
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


              {/* ===================================== */}
              {/* FECHA REAL                            */}
              {/* ===================================== */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Fecha de pago
                  </Form.Label>

                  <Form.Control
                    type="date"
                    value={
                      fecha
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setFecha(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


              {/* ===================================== */}
              {/* MONTO                                 */}
              {/* ===================================== */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Monto a acreditar
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      monto
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setMonto(
                        e.target.value
                      )
                    }
                  />

                  <Form.Text muted>

                    Programado: $
                    {toMoney(
                      row.monto_base
                    )}

                  </Form.Text>

                </Form.Group>

              </Col>


              {/* ===================================== */}
              {/* PROYECTO                              */}
              {/* ===================================== */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Proyecto
                  </Form.Label>

                  <Form.Select
                    value={
                      proyectoId
                    }
                    disabled={
                      saving
                    }
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
                          key={
                            p.id
                          }
                          value={
                            p.id
                          }
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


              {/* ===================================== */}
              {/* DESCRIPCIÓN                           */}
              {/* ===================================== */}

              <Col md={12}>

                <Form.Group>

                  <Form.Label>
                    Descripción
                  </Form.Label>

                  <Form.Control
                    value={
                      descripcion
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setDescripcion(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


              {/* ===================================== */}
              {/* OBSERVACIONES                         */}
              {/* ===================================== */}

              <Col md={12}>

                <Form.Group>

                  <Form.Label>
                    Observaciones
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={
                      observaciones
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setObservaciones(
                        e.target.value
                      )
                    }
                  />

                </Form.Group>

              </Col>


              {/* ===================================== */}
              {/* VARIAS FACTURAS                       */}
              {/* ===================================== */}

              {!esAnticipo && (

                <Col md={12}>

                  <Form.Check
                    type="checkbox"
                    id="varias-facturas-programado"
                    label="Este pago se aplicará a varias facturas"
                    checked={
                      aplicarVariasFacturas
                    }
                    disabled={
                      saving
                    }
                    onChange={(e) =>
                      setAplicarVariasFacturas(
                        e.target.checked
                      )
                    }
                  />


                  {aplicarVariasFacturas && (

                    <Form.Text muted>

                      Se generará un abono en la
                      cuenta corriente del proveedor
                      para distribuir posteriormente
                      este pago entre varias facturas.

                    </Form.Text>

                  )}

                </Col>

              )}


              {/* ===================================== */}
              {/* ANTICIPO                              */}
              {/* ===================================== */}

              {esAnticipo && (

                <Col md={12}>

                  <Alert
                    variant="light"
                    className="mb-0"
                  >

                    Este pago ya es un anticipo y
                    posee un abono en la cuenta
                    corriente del proveedor.

                  </Alert>

                </Col>

              )}

            </Row>

          </>

        )}

      </Modal.Body>


      <Modal.Footer>

        <Button
          variant="secondary"
          disabled={
            saving
          }
          onClick={
            cerrar
          }
        >

          Cancelar

        </Button>


        <Button
          variant="success"
          disabled={
            saving ||
            !row
          }
          onClick={
            confirmar
          }
        >

          {saving ? (

            <>

              <Spinner
                size="sm"
                animation="border"
                className="me-2"
              />

              Acreditando...

            </>

          ) : (

            "Acreditar"

          )}

        </Button>

      </Modal.Footer>

    </Modal>
  );
}