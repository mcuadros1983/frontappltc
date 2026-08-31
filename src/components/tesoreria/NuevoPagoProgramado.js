import React, {
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


const hoyISO = () =>
  new Date()
    .toISOString()
    .slice(0, 10);


export default function NuevoPagoProgramado({
  show,
  onHide,
  onCreated,
}) {

  const data =
    useContext(Contexts.DataContext) || {};


  const {
    empresaSeleccionada,

    proveedoresTabla = [],
    setProveedoresTabla,

    categoriasEgreso = [],
    setCategoriasEgreso,

    proyectosTabla = [],
    setProyectosTabla,

    formasPagoTesoreria = [],

    bancosTabla = [],
  } = data;


  const empresa_id =
    empresaSeleccionada?.id || null;


  // ==========================================================
  // FORMULARIO
  // ==========================================================

  const [tipo, setTipo] =
    useState("egreso_varios");
  // egreso_varios | anticipo


  const [medio, setMedio] =
    useState("banco");
  // banco | caja


  const [
    fechaProgramada,
    setFechaProgramada,
  ] = useState(hoyISO());


  const [
    proveedorId,
    setProveedorId,
  ] = useState("");


  const [
    descripcion,
    setDescripcion,
  ] = useState("");


  const [
    monto,
    setMonto,
  ] = useState("");


  const [
    observaciones,
    setObservaciones,
  ] = useState("");


  const [
    categoriaId,
    setCategoriaId,
  ] = useState("");


  const [
    imputacionId,
    setImputacionId,
  ] = useState("");


  const [
    proyectoId,
    setProyectoId,
  ] = useState("");


  const [
    bancoId,
    setBancoId,
  ] = useState("");


  const [
    formaPagoId,
    setFormaPagoId,
  ] = useState("");


  const [
    enviando,
    setEnviando,
  ] = useState(false);


  const [
    msg,
    setMsg,
  ] = useState(null);


  // ==========================================================
  // BANCOS DE LA EMPRESA
  // ==========================================================

  const bancosEmpresa =
    useMemo(() => {

      if (!empresa_id) {
        return [];
      }

      return (bancosTabla || []).filter(
        (b) =>
          !b.empresa_id ||
          Number(b.empresa_id) ===
          Number(empresa_id)
      );

    }, [
      bancosTabla,
      empresa_id,
    ]);


  // ==========================================================
  // FORMA DE PAGO SUGERIDA
  //
  // No dependemos del texto exacto para funcionar.
  // El usuario puede elegirla manualmente.
  // ==========================================================

  const formasPagoFiltradas =
    useMemo(() => {

      return formasPagoTesoreria || [];

    }, [formasPagoTesoreria]);


  // ==========================================================
  // REFRESCAR LISTAS AL ABRIR
  // ==========================================================

  useEffect(() => {

    if (!show) {
      return;
    }


    let cancelado =
      false;


    const cargarListas =
      async () => {

        try {

          const [
            resProv,
            resProy,
            resCat,
          ] =
            await Promise.all([
              fetch(
                `${apiUrl}/proveedores`,
                {
                  credentials:
                    "include",
                }
              ),

              fetch(
                `${apiUrl}/proyectos`,
                {
                  credentials:
                    "include",
                }
              ),

              fetch(
                `${apiUrl}/categorias-egreso`,
                {
                  credentials:
                    "include",
                }
              ),
            ]);


          const [
            prov,
            proy,
            cat,
          ] =
            await Promise.all([
              resProv.ok
                ? resProv.json()
                : Promise.resolve([]),

              resProy.ok
                ? resProy.json()
                : Promise.resolve([]),

              resCat.ok
                ? resCat.json()
                : Promise.resolve([]),
            ]);


          if (cancelado) {
            return;
          }


          if (
            Array.isArray(prov) &&
            setProveedoresTabla
          ) {
            setProveedoresTabla(
              prov
            );
          }


          if (
            Array.isArray(proy) &&
            setProyectosTabla
          ) {
            setProyectosTabla(
              proy
            );
          }


          if (
            Array.isArray(cat) &&
            setCategoriasEgreso
          ) {
            setCategoriasEgreso(
              cat
            );
          }

        } catch (error) {

          console.error(
            "Error refrescando listas PagoProgramado:",
            error
          );
        }
      };


    cargarListas();


    return () => {
      cancelado =
        true;
    };

  }, [
    show,
    setProveedoresTabla,
    setProyectosTabla,
    setCategoriasEgreso,
  ]);


  // ==========================================================
  // DERIVAR IMPUTACIÓN DESDE CATEGORÍA
  // ==========================================================

  useEffect(() => {

    if (!categoriaId) {

      setImputacionId("");

      return;
    }


    const categoria =
      (categoriasEgreso || [])
        .find(
          (c) =>
            Number(c.id) ===
            Number(categoriaId)
        );


    setImputacionId(
      categoria?.imputacioncontable_id
        ? String(
          categoria.imputacioncontable_id
        )
        : ""
    );

  }, [
    categoriaId,
    categoriasEgreso,
  ]);


  // ==========================================================
  // LIMPIAR
  // ==========================================================

  const limpiar =
    () => {

      setTipo(
        "egreso_varios"
      );

      setMedio(
        "banco"
      );

      setFechaProgramada(
        hoyISO()
      );

      setProveedorId("");
      setDescripcion("");
      setMonto("");
      setObservaciones("");
      setCategoriaId("");
      setImputacionId("");
      setProyectoId("");
      setBancoId("");
      setFormaPagoId("");
      setMsg(null);
    };


  const handleClose =
    () => {

      if (enviando) {
        return;
      }

      limpiar();

      onHide?.();
    };


  // ==========================================================
  // VALIDACIÓN
  // ==========================================================

  const montoNumero =
    Number(monto || 0);


  const puedeGuardar =

    !!empresa_id &&

    !!proveedorId &&

    !!fechaProgramada &&

    montoNumero > 0 &&

    !!descripcion.trim() &&

    !!categoriaId &&

    (
      medio !== "banco" ||
      !!bancoId
    );


  // ==========================================================
  // GUARDAR
  // ==========================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setMsg(null);


      if (!puedeGuardar) {

        setMsg({
          type:
            "warning",

          text:
            "Completá todos los campos requeridos.",
        });

        return;
      }


      try {

        setEnviando(
          true
        );


        const payload = {

          empresa_id:
            Number(empresa_id),

          proveedor_id:
            Number(proveedorId),

          tipo,

          medio,

          fecha_programada:
            fechaProgramada,

          monto:
            montoNumero,

          descripcion:
            descripcion.trim(),

          observaciones:
            observaciones.trim() ||
            null,

          formapago_id:
            formaPagoId
              ? Number(formaPagoId)
              : null,

          /*
           * Si es Banco sí dejamos el banco prefijado.
           *
           * Si es Caja dejamos caja_id en null por ahora.
           * La caja real puede resolverse al momento
           * de ACREDITAR.
           */
          banco_id:
            medio === "banco"
              ? Number(bancoId)
              : null,

          caja_id:
            null,

          categoriaegreso_id:
            Number(categoriaId),

          imputacioncontable_id:
            imputacionId
              ? Number(
                imputacionId
              )
              : null,

          proyecto_id:
            proyectoId
              ? Number(
                proyectoId
              )
              : null,

          idempotencyKey:
            `pago-programado-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`,
        };


        const res =
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
            "No se pudo registrar el pago programado"
          );
        }


        onCreated?.(
          json
        );


        handleClose();

      } catch (error) {

        setMsg({
          type:
            "danger",

          text:
            error.message ||
            "Error inesperado",
        });

      } finally {

        setEnviando(
          false
        );
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

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
            Nuevo Pago Programado
          </Modal.Title>

        </Modal.Header>


        <Modal.Body>

          {!empresa_id && (

            <Alert
              variant="warning"
              className="py-2"
            >
              Seleccioná una empresa para continuar.
            </Alert>

          )}


          {msg && (

            <Alert
              variant={msg.type}
              className="py-2"
              dismissible
              onClose={() =>
                setMsg(null)
              }
            >

              {msg.text}

            </Alert>

          )}


          {/* ==================================================
              TIPO
             ================================================== */}

          <Row className="mb-3">

            <Col md={12}>

              <Form.Label>
                Tipo de pago programado
              </Form.Label>


              <div
                className="d-flex flex-wrap align-items-center"
                style={{
                  gap: 16,
                }}
              >

                <Form.Check
                  inline
                  type="radio"
                  id="programado-egreso"
                  name="tipo-programado"
                  label="Egresos varios"
                  value="egreso_varios"
                  checked={
                    tipo ===
                    "egreso_varios"
                  }
                  onChange={(e) =>
                    setTipo(
                      e.target.value
                    )
                  }
                />


                <Form.Check
                  inline
                  type="radio"
                  id="programado-anticipo"
                  name="tipo-programado"
                  label="Anticipo a Proveedores"
                  value="anticipo"
                  checked={
                    tipo ===
                    "anticipo"
                  }
                  onChange={(e) =>
                    setTipo(
                      e.target.value
                    )
                  }
                />

              </div>

            </Col>

          </Row>


          {/* ==================================================
              MEDIO + FECHA
             ================================================== */}

          <Row className="mb-3">

            <Col md={6}>

              <Form.Label>
                Medio previsto
              </Form.Label>


              <div
                className="d-flex align-items-center"
                style={{
                  gap: 16,
                }}
              >

                <Form.Check
                  inline
                  type="radio"
                  id="medio-banco"
                  name="medio-programado"
                  label="Transferencia / Banco"
                  value="banco"
                  checked={
                    medio ===
                    "banco"
                  }
                  onChange={(e) =>
                    setMedio(
                      e.target.value
                    )
                  }
                />


                <Form.Check
                  inline
                  type="radio"
                  id="medio-caja"
                  name="medio-programado"
                  label="Caja"
                  value="caja"
                  checked={
                    medio ===
                    "caja"
                  }
                  onChange={(e) =>
                    setMedio(
                      e.target.value
                    )
                  }
                />

              </div>

            </Col>


            <Col md={6}>

              <Form.Label>
                Fecha programada
              </Form.Label>

              <Form.Control
                type="date"
                value={
                  fechaProgramada
                }
                onChange={(e) =>
                  setFechaProgramada(
                    e.target.value
                  )
                }
                required
              />

            </Col>

          </Row>


          {/* ==================================================
              BANCO
             ================================================== */}

          {medio === "banco" && (

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
                  className="form-control my-input"
                >

                  <option value="">
                    Seleccione…
                  </option>

                  {bancosEmpresa.map(
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


              {/* <Col md={6}>

                <Form.Label>
                  Forma de pago
                </Form.Label>

                <Form.Select
                  value={
                    formaPagoId
                  }
                  onChange={(e) =>
                    setFormaPagoId(
                      e.target.value
                    )
                  }
                  className="form-control my-input"
                >

                  <option value="">
                    Seleccione…
                  </option>

                  {formasPagoFiltradas.map(
                    (fp) => (

                      <option
                        key={fp.id}
                        value={fp.id}
                      >
                        {fp.descripcion ||
                          fp.nombre ||
                          `Forma ${fp.id}`}
                      </option>

                    )
                  )}

                </Form.Select>

              </Col> */}

            </Row>

          )}

          {medio === "caja" && (

            <Alert
              variant="light"
              className="py-2"
            >
              El pago se programará para realizarse por
              <strong> Caja</strong>. Al momento de acreditarlo,
              se utilizará automáticamente la caja que se
              encuentre abierta.
            </Alert>

          )}

          {/* ==================================================
              PROVEEDOR + PROYECTO
             ================================================== */}

          <Row className="mb-3">

            <Col md={6}>

              <Form.Label>
                Proveedor / Entidad
              </Form.Label>

              <Form.Select
                value={
                  proveedorId
                }
                onChange={(e) =>
                  setProveedorId(
                    e.target.value
                  )
                }
                required
                className="form-control my-input"
              >

                <option value="">
                  Seleccione…
                </option>

                {(proveedoresTabla || [])
                  .map(
                    (p) => (

                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.razonsocial ||
                          p.nombre ||
                          `Proveedor ${p.id}`}
                      </option>

                    )
                  )}

              </Form.Select>

            </Col>


            <Col md={6}>

              <Form.Label>
                Proyecto
              </Form.Label>

              <Form.Select
                value={
                  proyectoId
                }
                onChange={(e) =>
                  setProyectoId(
                    e.target.value
                  )
                }
                className="form-control my-input"
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


          {/* ==================================================
              CATEGORÍA
             ================================================== */}

          <Row className="mb-3">

            <Col md={6}>

              <Form.Label>
                Categoría de egreso
              </Form.Label>

              <Form.Select
                value={
                  categoriaId
                }
                onChange={(e) =>
                  setCategoriaId(
                    e.target.value
                  )
                }
                required
                className="form-control my-input"
              >

                <option value="">
                  Seleccione…
                </option>

                {(categoriasEgreso || [])
                  .map(
                    (c) => (

                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.nombre ||
                          `Categoría ${c.id}`}
                      </option>

                    )
                  )}

              </Form.Select>

            </Col>

            {/* 
            <Col md={6}>

              <Form.Label>
                Imputación contable
              </Form.Label>

              <Form.Control
                value={
                  imputacionId ||
                  ""
                }
                readOnly
                placeholder="Se deriva de la categoría"
              />

            </Col> */}

          </Row>


          {/* ==================================================
              DESCRIPCIÓN + MONTO
             ================================================== */}

          <Row className="mb-3">

            <Col md={8}>

              <Form.Label>
                Descripción
              </Form.Label>

              <Form.Control
                value={
                  descripcion
                }
                onChange={(e) =>
                  setDescripcion(
                    e.target.value
                  )
                }
                required
                placeholder={
                  tipo === "anticipo"
                    ? "Anticipo a proveedor"
                    : "Concepto del egreso"
                }
              />

            </Col>


            <Col md={4}>

              <Form.Label>
                Importe
              </Form.Label>

              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={monto}
                onChange={(e) =>
                  setMonto(
                    e.target.value
                  )
                }
                required
              />

            </Col>

          </Row>


          {/* ==================================================
              OBSERVACIONES
             ================================================== */}

          <Row>

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

        </Modal.Body>


        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={
              handleClose
            }
            disabled={
              enviando
            }
          >
            Cancelar
          </Button>


          <Button
            variant="success"
            type="submit"
            disabled={
              enviando ||
              !puedeGuardar
            }
          >

            {enviando ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Guardando…
              </>
            ) : (
              "Guardar Pago Programado"
            )}

          </Button>

        </Modal.Footer>

      </Form>

    </Modal>
  );
}