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

  const [montoDisplay, setMontoDisplay] = useState("");

  // ==========================================================
  // CONTROL DE POSIBLES PAGOS DUPLICADOS
  // ==========================================================

  const [advertenciaDuplicado, setAdvertenciaDuplicado] =
    useState(null);

  const [detalleAbierto, setDetalleAbierto] =
    useState(null);

  const [verificandoDuplicado, setVerificandoDuplicado] =
    useState(false);

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
    echeqFechaVencimiento,
    setEcheqFechaVencimiento,
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

  const formatearImporteInput = (valor) => {
    let texto = String(valor || "");

    // Solo números y coma.
    // Los puntos de miles los genera automáticamente el sistema.
    texto = texto.replace(/[^\d,]/g, "");

    const partes = texto.split(",");

    let entero = partes[0] || "";

    // Máximo 2 decimales
    const tieneDecimal = partes.length > 1;

    const decimal = tieneDecimal
      ? partes
        .slice(1)
        .join("")
        .replace(/\D/g, "")
        .slice(0, 2)
      : "";

    // Eliminar ceros innecesarios al comienzo
    entero =
      entero.replace(/^0+(?=\d)/, "") || "";

    // Agregar puntos de miles automáticamente
    const enteroFormateado =
      entero.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        "."
      );

    if (tieneDecimal) {
      return `${enteroFormateado},${decimal}`;
    }

    return enteroFormateado;
  };


  const importeANumero = (valor) => {
    if (!valor) return "";

    const normalizado = String(valor)
      .replace(/\./g, "")
      .replace(",", ".");

    const numero = Number(normalizado);

    return Number.isFinite(numero)
      ? String(numero)
      : "";
  };


  const handleMontoChange = (e) => {
    const valorFormateado =
      formatearImporteInput(e.target.value);

    setMontoDisplay(valorFormateado);

    setMonto(
      importeANumero(valorFormateado)
    );
  };


  const handleMontoKeyDown = (e) => {
    // El punto normal o del teclado numérico
    // funciona como separador decimal.
    if (
      e.key === "." ||
      e.key === "Decimal"
    ) {
      e.preventDefault();

      // Ya existe separador decimal
      if (montoDisplay.includes(",")) {
        return;
      }

      const nuevoValor =
        montoDisplay === ""
          ? "0,"
          : `${montoDisplay},`;

      setMontoDisplay(nuevoValor);

      setMonto(
        importeANumero(nuevoValor)
      );
    }
  };


  // const handleMontoChange = (e) => {
  //   const valorFormateado =
  //     formatearImporteInput(e.target.value);

  //   setMontoDisplay(valorFormateado);

  //   setMonto(
  //     importeANumero(valorFormateado)
  //   );
  // };

  // const handleMontoKeyDown = (e) => {
  //   // Punto del teclado normal o numérico = coma decimal
  //   if (e.key === "." || e.key === "Decimal") {
  //     e.preventDefault();

  //     // Si ya existe decimal, no hacemos nada
  //     if (montoDisplay.includes(",")) {
  //       return;
  //     }

  //     const nuevoValor =
  //       montoDisplay === ""
  //         ? "0,"
  //         : `${montoDisplay},`;

  //     setMontoDisplay(nuevoValor);

  //     setMonto(
  //       importeANumero(nuevoValor)
  //     );
  //   }
  // };


  // const importeANumero = (valor) => {
  //   if (!valor) return "";

  //   const normalizado = String(valor)
  //     .replace(/\./g, "")
  //     .replace(",", ".");

  //   const numero = Number(normalizado);

  //   return Number.isFinite(numero)
  //     ? String(numero)
  //     : "";
  // };


  // const handleMontoChange = (e) => {
  //   const valorFormateado =
  //     formatearImporteInput(e.target.value);

  //   setMontoDisplay(valorFormateado);

  //   setMonto(
  //     importeANumero(valorFormateado)
  //   );
  // };
  // ==========================================================
  // BANCOS DE LA EMPRESA
  // ==========================================================

  // const bancosEmpresa =
  //   useMemo(() => {

  //     if (!empresa_id) {
  //       return [];
  //     }

  //     return (bancosTabla || []).filter(
  //       (b) =>
  //         !b.empresa_id ||
  //         Number(b.empresa_id) ===
  //         Number(empresa_id)
  //     );

  //   }, [
  //     bancosTabla,
  //     empresa_id,
  //   ]);

  // ==========================================================
  // TODOS LOS BANCOS DISPONIBLES
  // ==========================================================

  const bancosDisponibles =
    useMemo(() => {

      return bancosTabla || [];

    }, [
      bancosTabla,
    ]);

  // ==========================================================
  // FORMA DE PAGO SUGERIDA
  //
  // No dependemos del texto exacto para funcionar.
  // El usuario puede elegirla manualmente.
  // ==========================================================

  const formaPagoAutomatica =
    useMemo(() => {

      const descripcionBuscada =
        medio === "caja"
          ? "EFECTIVO"
          : medio === "echeq"
            ? "ECHEQ"
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
      setMontoDisplay("");
      setObservaciones("");
      setCategoriaId("");
      setImputacionId("");
      setProyectoId("");
      setBancoId("");
      setEcheqFechaVencimiento("");
      setFormaPagoId("");
      setMsg(null);

      setAdvertenciaDuplicado(null);
      setDetalleAbierto(null);
      setVerificandoDuplicado(false);
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

    !!formaPagoAutomatica?.id &&

    (
      !["banco", "echeq"].includes(medio) ||
      !!bancoId
    ) &&

    (
      medio !== "echeq" ||
      (
        !!echeqFechaVencimiento &&
        echeqFechaVencimiento >= fechaProgramada
      )
    );

  // ==========================================================
  // CREAR PAGO PROGRAMADO
  // ==========================================================

  const guardarPagoProgramado =
    async () => {

      setEnviando(true);
      setMsg(null);

      try {

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
            Number(
              formaPagoAutomatica.id
            ),

          banco_id:
            (
              medio === "banco" ||
              medio === "echeq"
            )
              ? Number(bancoId)
              : null,

          caja_id:
            null,

          echeq_fecha_vencimiento:
            medio === "echeq"
              ? echeqFechaVencimiento
              : null,

          categoriaegreso_id:
            Number(categoriaId),

          imputacioncontable_id:
            imputacionId
              ? Number(imputacionId)
              : null,

          proyecto_id:
            proyectoId
              ? Number(proyectoId)
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

        setEnviando(false);
      }
    };


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

        setVerificandoDuplicado(
          true
        );


        const params =
          new URLSearchParams({
            proveedor_id:
              String(proveedorId),

            monto:
              String(montoNumero),
          });


        const res =
          await fetch(
            `${apiUrl}/pagos-programados/verificar-duplicado?${params.toString()}`,
            {
              credentials:
                "include",
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
            "No se pudo verificar si existen pagos coincidentes"
          );
        }


        // ==============================================
        // EXISTEN COINCIDENCIAS
        // ==============================================

        if (json?.hay_coincidencias) {

          setAdvertenciaDuplicado(
            json
          );

          setDetalleAbierto(
            null
          );

          return;
        }


        // ==============================================
        // NO EXISTEN COINCIDENCIAS
        // GUARDAR NORMALMENTE
        // ==============================================

        await guardarPagoProgramado();

      } catch (error) {

        setMsg({
          type:
            "danger",

          text:
            error.message ||
            "Error verificando posibles pagos duplicados",
        });

      } finally {

        setVerificandoDuplicado(
          false
        );
      }
    };

  // ==========================================================
  // PRESENTACIÓN DE COINCIDENCIAS
  // ==========================================================

  const moneyAR =
    (valor) =>
      Number(valor || 0)
        .toLocaleString(
          "es-AR",
          {
            style: "currency",
            currency: "ARS",
          }
        );


  const fechaAR =
    (fecha) => {

      if (!fecha) {
        return "—";
      }

      const [
        anio,
        mes,
        dia,
      ] =
        String(fecha)
          .slice(0, 10)
          .split("-");

      if (
        !anio ||
        !mes ||
        !dia
      ) {
        return fecha;
      }

      return `${dia}/${mes}/${anio}`;
    };


  const nombreBanco =
    (id) => {

      if (!id) {
        return "—";
      }

      const banco =
        (bancosTabla || [])
          .find(
            (b) =>
              Number(b.id) ===
              Number(id)
          );

      return (
        banco?.nombre ||
        banco?.descripcion ||
        `Banco #${id}`
      );
    };


  const nombreFormaPago =
    (id) => {

      if (!id) {
        return "—";
      }

      const fp =
        (formasPagoTesoreria || [])
          .find(
            (f) =>
              Number(f.id) ===
              Number(id)
          );

      return (
        fp?.descripcion ||
        fp?.nombre ||
        `Forma #${id}`
      );
    };


  const toggleDetalle =
    (clave) => {

      setDetalleAbierto(
        (actual) =>
          actual === clave
            ? null
            : clave
      );
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
                className="d-flex flex-wrap align-items-center"
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
                    medio === "banco"
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
                    medio === "caja"
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
                  id="medio-echeq"
                  name="medio-programado"
                  label="eCheq"
                  value="echeq"
                  checked={
                    medio === "echeq"
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
                    className="form-control my-input"
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
                      Vencimiento previsto del eCheq
                    </Form.Label>

                    <Form.Control
                      type="date"
                      value={
                        echeqFechaVencimiento
                      }
                      min={
                        fechaProgramada || undefined
                      }
                      onChange={(e) =>
                        setEcheqFechaVencimiento(
                          e.target.value
                        )
                      }
                      required
                      isInvalid={
                        !!echeqFechaVencimiento &&
                        !!fechaProgramada &&
                        echeqFechaVencimiento <
                        fechaProgramada
                      }
                    />

                    <Form.Control.Feedback
                      type="invalid"
                    >
                      El vencimiento no puede ser anterior
                      a la fecha programada.
                    </Form.Control.Feedback>

                  </Col>

                )}
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
                type="text"
                inputMode="decimal"
                value={montoDisplay}
                onChange={handleMontoChange}
                placeholder="0,00"
                autoComplete="off"
                required
                onKeyDown={handleMontoKeyDown}
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

          {/* ==================================================
    ADVERTENCIA POSIBLE PAGO DUPLICADO
   ================================================== */}

          {advertenciaDuplicado?.hay_coincidencias && (

            <Alert
              variant="warning"
              className="mt-4"
            >

              <div
                className="fw-bold mb-2"
                style={{
                  fontSize: "1.05rem",
                }}
              >
                ⚠ Posible pago duplicado
              </div>


              <div className="mb-3">

                Se encontraron movimientos para este proveedor
                por un monto de{" "}

                <strong>
                  {moneyAR(
                    montoNumero
                  )}
                </strong>.

              </div>


              {/* ==============================================
        PAGOS ACREDITADOS
       ============================================== */}

              {advertenciaDuplicado
                ?.pagos_acreditados
                ?.length > 0 && (

                  <div className="mb-3">

                    <div className="fw-bold text-danger mb-2">
                      Ya existe un pago acreditado por ese monto
                      para este proveedor.
                    </div>


                    {advertenciaDuplicado
                      .pagos_acreditados
                      .map(
                        (pago, index) => {

                          const clave =
                            `acreditado-${pago.movimiento_tipo || pago.origen}-${pago.id}-${index}`;

                          const abierto =
                            detalleAbierto ===
                            clave;


                          return (

                            <div
                              key={clave}
                              className="border rounded mb-2 bg-white"
                            >

                              <button
                                type="button"
                                className="btn btn-link text-start text-decoration-none w-100"
                                onClick={() =>
                                  toggleDetalle(
                                    clave
                                  )
                                }
                              >

                                <strong>
                                  {abierto
                                    ? "▼"
                                    : "▶"}{" "}
                                  Pago acreditado
                                </strong>

                                {" · "}

                                {fechaAR(
                                  pago.fecha
                                )}

                                {" · "}

                                {moneyAR(
                                  pago.monto
                                )}

                                {" · "}

                                {pago.medio === "caja"
                                  ? "Caja"
                                  : pago.medio === "echeq"
                                    ? "eCheq"
                                    : "Banco"}

                              </button>


                              {abierto && (

                                <div
                                  className="px-3 pb-3"
                                  style={{
                                    fontSize:
                                      "0.9rem",
                                  }}
                                >

                                  <hr className="mt-0" />


                                  <Row>

                                    <Col md={6}>
                                      <strong>
                                        Fecha:
                                      </strong>{" "}
                                      {fechaAR(
                                        pago.fecha
                                      )}
                                    </Col>


                                    <Col md={6}>
                                      <strong>
                                        Monto:
                                      </strong>{" "}
                                      {moneyAR(
                                        pago.monto
                                      )}
                                    </Col>


                                    <Col
                                      md={6}
                                      className="mt-2"
                                    >
                                      <strong>
                                        Medio:
                                      </strong>{" "}

                                      {pago.medio === "caja"
                                        ? "Caja"
                                        : pago.medio === "echeq"
                                          ? "eCheq"
                                          : "Banco"}
                                    </Col>


                                    <Col
                                      md={6}
                                      className="mt-2"
                                    >
                                      <strong>
                                        Estado:
                                      </strong>{" "}

                                      {pago.estado ||
                                        "acreditado"}
                                    </Col>


                                    {pago.banco_id && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Banco:
                                        </strong>{" "}

                                        {nombreBanco(
                                          pago.banco_id
                                        )}
                                      </Col>

                                    )}


                                    {pago.formapago_id && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Forma de pago:
                                        </strong>{" "}

                                        {nombreFormaPago(
                                          pago.formapago_id
                                        )}
                                      </Col>

                                    )}


                                    {pago.numero_echeq && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Nº eCheq:
                                        </strong>{" "}

                                        {pago.numero_echeq}
                                      </Col>

                                    )}


                                    {pago.fecha_vencimiento && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Vencimiento:
                                        </strong>{" "}

                                        {fechaAR(
                                          pago.fecha_vencimiento
                                        )}
                                      </Col>

                                    )}


                                    {pago.ordenpago_id && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Orden de pago:
                                        </strong>{" "}

                                        #{pago.ordenpago_id}
                                      </Col>

                                    )}


                                    {pago.comprobanteegreso_id && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Comprobante:
                                        </strong>{" "}

                                        #{pago.comprobanteegreso_id}
                                      </Col>

                                    )}


                                    {pago.descripcion && (

                                      <Col
                                        md={12}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Descripción:
                                        </strong>{" "}

                                        {pago.descripcion}
                                      </Col>

                                    )}


                                    {pago.observaciones && (

                                      <Col
                                        md={12}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Observaciones:
                                        </strong>{" "}

                                        {pago.observaciones}
                                      </Col>

                                    )}

                                  </Row>

                                </div>

                              )}

                            </div>
                          );
                        }
                      )}

                  </div>

                )}


              {/* ==============================================
        PAGOS PROGRAMADOS
       ============================================== */}

              {advertenciaDuplicado
                ?.pagos_programados
                ?.length > 0 && (

                  <div className="mb-3">

                    <div className="fw-bold text-danger mb-2">
                      Ya existe un pago programado por ese monto
                      para este proveedor.
                    </div>


                    {advertenciaDuplicado
                      .pagos_programados
                      .map(
                        (pago, index) => {

                          const clave =
                            `programado-${pago.id}-${index}`;

                          const abierto =
                            detalleAbierto ===
                            clave;


                          return (

                            <div
                              key={clave}
                              className="border rounded mb-2 bg-white"
                            >

                              <button
                                type="button"
                                className="btn btn-link text-start text-decoration-none w-100"
                                onClick={() =>
                                  toggleDetalle(
                                    clave
                                  )
                                }
                              >

                                <strong>
                                  {abierto
                                    ? "▼"
                                    : "▶"}{" "}
                                  Pago programado #{pago.id}
                                </strong>

                                {" · "}

                                {fechaAR(
                                  pago.fecha_programada
                                )}

                                {" · "}

                                {moneyAR(
                                  pago.monto
                                )}

                              </button>


                              {abierto && (

                                <div
                                  className="px-3 pb-3"
                                  style={{
                                    fontSize:
                                      "0.9rem",
                                  }}
                                >

                                  <hr className="mt-0" />


                                  <Row>

                                    <Col md={6}>
                                      <strong>
                                        Fecha programada:
                                      </strong>{" "}

                                      {fechaAR(
                                        pago.fecha_programada
                                      )}
                                    </Col>


                                    <Col md={6}>
                                      <strong>
                                        Monto:
                                      </strong>{" "}

                                      {moneyAR(
                                        pago.monto
                                      )}
                                    </Col>


                                    <Col
                                      md={6}
                                      className="mt-2"
                                    >
                                      <strong>
                                        Medio previsto:
                                      </strong>{" "}

                                      {pago.medio === "caja"
                                        ? "Caja"
                                        : pago.medio === "echeq"
                                          ? "eCheq"
                                          : "Banco"}
                                    </Col>


                                    <Col
                                      md={6}
                                      className="mt-2"
                                    >
                                      <strong>
                                        Estado:
                                      </strong>{" "}

                                      {pago.estado}
                                    </Col>


                                    {pago.banco_id && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Banco:
                                        </strong>{" "}

                                        {nombreBanco(
                                          pago.banco_id
                                        )}
                                      </Col>

                                    )}


                                    {pago.formapago_id && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Forma de pago:
                                        </strong>{" "}

                                        {nombreFormaPago(
                                          pago.formapago_id
                                        )}
                                      </Col>

                                    )}


                                    {pago.echeq_fecha_vencimiento && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Vencimiento eCheq:
                                        </strong>{" "}

                                        {fechaAR(
                                          pago.echeq_fecha_vencimiento
                                        )}
                                      </Col>

                                    )}


                                    {pago.ordenpago_id && (

                                      <Col
                                        md={6}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Orden de pago:
                                        </strong>{" "}

                                        #{pago.ordenpago_id}
                                      </Col>

                                    )}


                                    {pago.descripcion && (

                                      <Col
                                        md={12}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Descripción:
                                        </strong>{" "}

                                        {pago.descripcion}
                                      </Col>

                                    )}


                                    {pago.observaciones && (

                                      <Col
                                        md={12}
                                        className="mt-2"
                                      >
                                        <strong>
                                          Observaciones:
                                        </strong>{" "}

                                        {pago.observaciones}
                                      </Col>

                                    )}

                                  </Row>

                                </div>

                              )}

                            </div>
                          );
                        }
                      )}


                    <div className="mt-3 fw-bold">
                      ¿Desea crear igualmente el pago programado?
                    </div>

                  </div>

                )}


              {!advertenciaDuplicado
                ?.pagos_programados
                ?.length &&
                advertenciaDuplicado
                  ?.pagos_acreditados
                  ?.length > 0 && (

                  <div className="fw-bold mt-3">
                    ¿Desea crear igualmente el pago programado?
                  </div>

                )}

            </Alert>

          )}

        </Modal.Body>



        <Modal.Footer>

          {advertenciaDuplicado?.hay_coincidencias ? (

            <>
              <Button
                variant="secondary"
                type="button"
                disabled={enviando}
                onClick={() => {
                  setAdvertenciaDuplicado(null);
                  setDetalleAbierto(null);
                }}
              >
                Cancelar
              </Button>


              <Button
                variant="warning"
                type="button"
                disabled={enviando}
                onClick={
                  guardarPagoProgramado
                }
              >

                {enviando
                  ? "Guardando..."
                  : "Continuar de todas formas"}

              </Button>
            </>

          ) : (

            <>
              <Button
                variant="secondary"
                type="button"
                disabled={
                  enviando ||
                  verificandoDuplicado
                }
                onClick={
                  handleClose
                }
              >
                Cancelar
              </Button>


              <Button
                variant="primary"
                type="submit"
                disabled={
                  !puedeGuardar ||
                  enviando ||
                  verificandoDuplicado
                }
              >

                {verificandoDuplicado
                  ? "Verificando..."
                  : enviando
                    ? "Guardando..."
                    : "Guardar Pago Programado"}

              </Button>
            </>

          )}

        </Modal.Footer>

      </Form>

    </Modal>
  );
}