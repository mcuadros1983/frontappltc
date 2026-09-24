// pages/inventarios/crearMovimientosOtros.js

import React, {
  useContext,
  useState
} from "react";

import {
  Container,
  Button,
  Form,
  Alert,
  Table,
  Card
} from "react-bootstrap";

import * as XLSX from "xlsx";

import Contexts from "../../../context/Contexts";


const CrearMovimientosOtros = () => {

  // =====================================================
  // DATACONTEXT
  // =====================================================

  const {
    sucursalesTabla,
    articulosTabla
  } = useContext(Contexts.DataContext);


  // =====================================================
  // ESTADOS GENERALES
  // =====================================================

  const [file, setFile] = useState(null);

  const [uploadSuccess, setUploadSuccess] =
    useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [buttonDisabled, setButtonDisabled] =
    useState(false);

  const [tipoMovimiento, setTipoMovimiento] =
    useState("");

  // false = archivo Excel
  // true  = copiar/pegar
  const [modoPegado, setModoPegado] =
    useState(false);

  const [textoPegado, setTextoPegado] =
    useState("");

  const [movimientosPegados, setMovimientosPegados] =
    useState([]);


  const apiUrl =
    process.env.REACT_APP_API_URL;


  // =====================================================
  // HELPERS
  // =====================================================

  const obtenerConfiguracionMovimiento = () => {

    if (tipoMovimiento === "Fabrica") {
      return {
        tipo: "FABRICA",
        sucursal_codigo: 20
      };
    }

    if (tipoMovimiento === "Achuras") {
      return {
        tipo: "ACHURA",
        sucursal_codigo: 1
      };
    }

    return {
      tipo: "",
      sucursal_codigo: ""
    };
  };


  const buscarArticulo = (codigo) => {

    const codigoNormalizado =
      String(codigo || "").trim();

    return (
      articulosTabla.find(
        (articulo) =>
          String(
            articulo.codigobarra || ""
          ).trim() === codigoNormalizado
      ) || null
    );
  };


  const buscarSucursal = (codigo) => {

    const codigoNormalizado =
      String(codigo || "").trim();

    return (
      sucursalesTabla.find(
        (sucursal) =>
          String(
            sucursal.codigo || ""
          ).trim() === codigoNormalizado
      ) || null
    );
  };


  const validarFecha = (valor) => {

    const fecha =
      String(valor || "").trim();

    if (!fecha) {
      return false;
    }

    // dd/mm/yyyy
    if (fecha.includes("/")) {

      const partes =
        fecha.split("/");

      if (partes.length !== 3) {
        return false;
      }

      const [
        dia,
        mes,
        anio
      ] = partes.map(Number);

      if (
        !dia ||
        !mes ||
        !anio
      ) {
        return false;
      }

      const fechaJS =
        new Date(
          anio,
          mes - 1,
          dia
        );

      return (
        fechaJS.getFullYear() === anio &&
        fechaJS.getMonth() === mes - 1 &&
        fechaJS.getDate() === dia
      );
    }


    // yyyy-mm-dd
    const partesISO =
      fecha.split("-");

    if (partesISO.length === 3) {

      const [
        anio,
        mes,
        dia
      ] = partesISO.map(Number);

      const fechaJS =
        new Date(
          anio,
          mes - 1,
          dia
        );

      return (
        fechaJS.getFullYear() === anio &&
        fechaJS.getMonth() === mes - 1 &&
        fechaJS.getDate() === dia
      );
    }


    return false;
  };


  const validarCantidad = (valor) => {

    const numero =
      Number(
        String(valor ?? "")
          .trim()
          .replace(",", ".")
      );

    return (
      Number.isFinite(numero) &&
      numero > 0
    );
  };


  // =====================================================
  // CAMBIO DE TIPO
  // =====================================================

  const handleTipoMovimientoChange = (e) => {

    setTipoMovimiento(
      e.target.value
    );

    // Limpiamos cargas anteriores
    setMovimientosPegados([]);
    setTextoPegado("");
    setUploadMessage("");
    setUploadSuccess(false);
  };


  // =====================================================
  // CARGA TRADICIONAL POR ARCHIVO
  // =====================================================

  const handleFileChange = (event) => {

    setFile(
      event.target.files[0]
    );
  };


  const handleUpload = async () => {

    if (
      !file ||
      !tipoMovimiento
    ) {

      setUploadSuccess(false);

      setUploadMessage(
        "Debe seleccionar tipo de movimiento y archivo."
      );

      return;
    }


    try {

      setButtonDisabled(true);


      const {
        tipo,
        sucursal_codigo
      } =
        obtenerConfiguracionMovimiento();


      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "tipo",
        tipo
      );

      formData.append(
        "sucursal_codigo",
        sucursal_codigo
      );


      const response =
        await fetch(
          `${apiUrl}/movimientos-otro-excel`,
          {
            method: "POST",
            body: formData,
            credentials: "include"
          }
        );


      const data =
        await response.json();


      if (response.ok) {

        setUploadSuccess(true);

        setUploadMessage(
          data.mensaje ||
          "Archivo procesado correctamente."
        );

      } else {

        setUploadSuccess(false);

        setUploadMessage(
          data.mensaje ||
          "Error al procesar el archivo."
        );
      }

    } catch (error) {

      console.error(
        "Error al subir el archivo:",
        error
      );

      setUploadMessage(
        "Error: " +
        error.message
      );

      setUploadSuccess(false);

    } finally {

      setButtonDisabled(false);
    }
  };


  const handleUploadButtonClick = () => {

    if (!file) {

      setUploadMessage(
        "Debe seleccionar un archivo."
      );

      setUploadSuccess(false);

      return;
    }


    const reader =
      new FileReader();


    reader.onload = () => {

      // Conservamos la lógica actual.
      handleUpload();
    };


    reader.readAsArrayBuffer(file);
  };


  // =====================================================
  // PEGAR DESDE EXCEL
  // =====================================================

  const handlePaste = (e) => {

    e.preventDefault();


    const texto =
      e.clipboardData.getData(
        "text/plain"
      );


    if (!texto) {
      return;
    }


    let lineas =
      String(texto)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n");


    // Excel suele agregar una línea vacía al final.
    while (
      lineas.length > 0 &&
      !lineas[
        lineas.length - 1
      ].trim()
    ) {
      lineas.pop();
    }


    const nuevosMovimientos = [];


    lineas.forEach(
      (linea) => {

        if (!linea.trim()) {
          return;
        }


        const columnas =
          linea.split("\t");


        // Deben venir exactamente 5 columnas.
        if (columnas.length !== 5) {

          nuevosMovimientos.push({

            fecha:
              String(
                columnas[0] || ""
              ).trim(),

            articulocodigo:
              String(
                columnas[1] || ""
              ).trim(),

            articulodescripcion: "",

            cantidad:
              String(
                columnas[2] || ""
              ).trim(),

            remito:
              String(
                columnas[3] || ""
              ).trim(),

            sucursaldestino_codigo:
              String(
                columnas[4] || ""
              ).trim(),

            sucursaldestino_nombre: "",

            errorEstructura: true,
            errorFecha: true,
            errorArticulo: true,
            errorCantidad: true,
            errorSucursal: true
          });

          return;
        }


        const fecha =
          String(
            columnas[0] || ""
          ).trim();


        const articulocodigo =
          String(
            columnas[1] || ""
          ).trim();


        const cantidad =
          String(
            columnas[2] || ""
          ).trim();


        const remito =
          String(
            columnas[3] || ""
          ).trim();


        const sucursaldestino_codigo =
          String(
            columnas[4] || ""
          ).trim();


        // -----------------------------------------
        // BUSCAR ARTÍCULO
        // -----------------------------------------

        const articulo =
          buscarArticulo(
            articulocodigo
          );


        // -----------------------------------------
        // BUSCAR SUCURSAL
        // -----------------------------------------

        const sucursal =
          buscarSucursal(
            sucursaldestino_codigo
          );


        nuevosMovimientos.push({

          fecha,

          articulocodigo,

          articulo_id:
            articulo?.id || "",

          articulodescripcion:
            articulo?.descripcion || "",

          cantidad,

          remito,

          sucursaldestino_codigo,

          sucursaldestino_id:
            sucursal?.id || "",

          sucursaldestino_nombre:
            sucursal?.nombre || "",


          errorEstructura: false,

          errorFecha:
            !validarFecha(fecha),

          errorArticulo:
            !articulo,

          errorCantidad:
            !validarCantidad(cantidad),

          errorSucursal:
            !sucursal
        });

      }
    );


    setMovimientosPegados(
      nuevosMovimientos
    );


    setTextoPegado("");

    setUploadMessage("");
    setUploadSuccess(false);
  };


  // =====================================================
  // CORREGIR FECHA
  // =====================================================

  const actualizarFecha = (
    index,
    valor
  ) => {

    setMovimientosPegados(
      (prev) =>
        prev.map(
          (item, i) => {

            if (i !== index) {
              return item;
            }

            return {
              ...item,

              fecha:
                valor,

              errorFecha:
                !validarFecha(valor),

              errorEstructura:
                false
            };
          }
        )
    );
  };


  // =====================================================
  // CORREGIR ARTÍCULO
  // =====================================================

  const actualizarArticulo = (
    index,
    codigo
  ) => {

    const codigoLimpio =
      String(codigo || "").trim();


    const articulo =
      buscarArticulo(
        codigoLimpio
      );


    setMovimientosPegados(
      (prev) =>
        prev.map(
          (item, i) => {

            if (i !== index) {
              return item;
            }


            return {

              ...item,

              articulocodigo:
                codigo,

              articulo_id:
                articulo?.id || "",

              articulodescripcion:
                articulo?.descripcion || "",

              errorArticulo:
                !articulo,

              errorEstructura:
                false
            };
          }
        )
    );
  };


  // =====================================================
  // CORREGIR CANTIDAD
  // =====================================================

  const actualizarCantidad = (
    index,
    valor
  ) => {

    setMovimientosPegados(
      (prev) =>
        prev.map(
          (item, i) => {

            if (i !== index) {
              return item;
            }

            return {

              ...item,

              cantidad:
                valor,

              errorCantidad:
                !validarCantidad(valor),

              errorEstructura:
                false
            };
          }
        )
    );
  };


  // =====================================================
  // CORREGIR REMITO
  // =====================================================

  const actualizarRemito = (
    index,
    valor
  ) => {

    setMovimientosPegados(
      (prev) =>
        prev.map(
          (item, i) => {

            if (i !== index) {
              return item;
            }

            return {
              ...item,
              remito: valor
            };
          }
        )
    );
  };


  // =====================================================
  // CORREGIR SUCURSAL
  // =====================================================

  const actualizarSucursal = (
    index,
    codigo
  ) => {

    const codigoLimpio =
      String(codigo || "").trim();


    const sucursal =
      buscarSucursal(
        codigoLimpio
      );


    setMovimientosPegados(
      (prev) =>
        prev.map(
          (item, i) => {

            if (i !== index) {
              return item;
            }


            return {

              ...item,

              sucursaldestino_codigo:
                codigo,

              sucursaldestino_id:
                sucursal?.id || "",

              sucursaldestino_nombre:
                sucursal?.nombre || "",

              errorSucursal:
                !sucursal,

              errorEstructura:
                false
            };
          }
        )
    );
  };


  // =====================================================
  // ELIMINAR FILA
  // =====================================================

  const eliminarMovimiento = (
    index
  ) => {

    setMovimientosPegados(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
    );
  };


  // =====================================================
  // VALIDACIÓN GLOBAL
  // =====================================================

  const hayErrores =
    movimientosPegados.some(
      (item) =>
        item.errorEstructura ||
        item.errorFecha ||
        item.errorArticulo ||
        item.errorCantidad ||
        item.errorSucursal
    );


  // =====================================================
  // GUARDAR MOVIMIENTOS PEGADOS
  // =====================================================

  const guardarPegados = async () => {

    if (!tipoMovimiento) {

      setUploadSuccess(false);

      setUploadMessage(
        "Debe seleccionar el tipo de movimiento."
      );

      return;
    }


    if (
      movimientosPegados.length === 0
    ) {

      setUploadSuccess(false);

      setUploadMessage(
        "Debe pegar al menos un movimiento."
      );

      return;
    }


    if (hayErrores) {

      setUploadSuccess(false);

      setUploadMessage(
        "Hay movimientos con errores. Corríjalos antes de guardar."
      );

      return;
    }


    try {

      setButtonDisabled(true);


      const {
        tipo,
        sucursal_codigo
      } =
        obtenerConfiguracionMovimiento();


      // Enviamos solamente los campos que necesita
      // el backend.
      const movimientos =
        movimientosPegados.map(
          (item) => ({

            fecha:
              item.fecha,

            articulocodigo:
              String(
                item.articulocodigo
              ).trim(),

            cantidad:
              Number(
                String(
                  item.cantidad
                )
                  .trim()
                  .replace(",", ".")
              ),

            remito:
              String(
                item.remito || ""
              ).trim(),

            sucursaldestino_codigo:
              String(
                item.sucursaldestino_codigo
              ).trim()
          })
        );


      const response =
        await fetch(
          `${apiUrl}/movimientos-otro-excel/pegado`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                tipo,
                sucursal_codigo,
                movimientos
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.mensaje ||
          "Error al guardar los movimientos."
        );
      }


      setUploadSuccess(true);

      setUploadMessage(
        data.mensaje ||
        "Movimientos creados correctamente."
      );


      setMovimientosPegados([]);
      setTextoPegado("");


    } catch (error) {

      console.error(
        "Error al guardar movimientos pegados:",
        error
      );

      setUploadSuccess(false);

      setUploadMessage(
        error.message
      );

    } finally {

      setButtonDisabled(false);
    }
  };


  // =====================================================
  // DESCARGAR PLANTILLA
  // =====================================================

  const downloadTemplate = () => {

    const workbook =
      XLSX.utils.book_new();


    // ---------------------------------------------------
    // HOJA CARGA
    // ---------------------------------------------------

    const headers = [
      [
        "fecha",
        "articulocodigo",
        "cantidad",
        "remito",
        "sucursaldestino_codigo"
      ]
    ];


    const worksheet =
      XLSX.utils.aoa_to_sheet(
        headers
      );


    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 }
    ];


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Carga"
    );


    // ---------------------------------------------------
    // HOJA ARTÍCULOS
    // ---------------------------------------------------

    const datosArticulos =
      articulosTabla.map(
        (articulo) => ({

          codigo:
            articulo.codigobarra || "",

          descripcion:
            articulo.descripcion || ""
        })
      );


    const hojaArticulos =
      XLSX.utils.json_to_sheet(
        datosArticulos
      );


    hojaArticulos["!cols"] = [
      { wch: 20 },
      { wch: 50 }
    ];


    XLSX.utils.book_append_sheet(
      workbook,
      hojaArticulos,
      "Articulos"
    );


    // ---------------------------------------------------
    // HOJA SUCURSALES
    // ---------------------------------------------------

    const datosSucursales =
      sucursalesTabla.map(
        (sucursal) => ({

          codigo:
            sucursal.codigo || "",

          nombre:
            sucursal.nombre || ""
        })
      );


    const hojaSucursales =
      XLSX.utils.json_to_sheet(
        datosSucursales
      );


    hojaSucursales["!cols"] = [
      { wch: 15 },
      { wch: 40 }
    ];


    XLSX.utils.book_append_sheet(
      workbook,
      hojaSucursales,
      "Sucursales"
    );


    XLSX.writeFile(
      workbook,
      "MovimientosOtrosTemplate.xlsx"
    );
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <Container className="vt-page">

      <h1 className="my-list-title dark-text vt-title">
        Cargar Movimientos Otros
      </h1>


      {uploadSuccess && (

        <Alert
          variant="success"
          className="vt-alert"
        >
          {uploadMessage}
        </Alert>

      )}


      {!uploadSuccess &&
        uploadMessage && (

          <Alert
            variant="danger"
            className="vt-alert"
          >
            {uploadMessage}
          </Alert>

        )}


      <Form className="vt-form">

        {/* ========================================= */}
        {/* TIPO MOVIMIENTO                           */}
        {/* ========================================= */}

        <Form.Group
          controlId="tipoMovimiento"
          className="mb-3"
        >

          <Form.Label className="vt-label">
            Seleccione el tipo de movimiento:
          </Form.Label>

          <Form.Select
            value={tipoMovimiento}
            onChange={
              handleTipoMovimientoChange
            }
            className="vt-input"
          >

            <option value="">
              -- Seleccione --
            </option>

            <option value="Fabrica">
              Fábrica
            </option>

            <option value="Achuras">
              Achuras
            </option>

          </Form.Select>

        </Form.Group>


        {/* ========================================= */}
        {/* BOTONES MODO                              */}
        {/* ========================================= */}

        {tipoMovimiento && (

          <div className="d-flex gap-2 mb-3">

            <Button
              variant={
                !modoPegado
                  ? "primary"
                  : "outline-primary"
              }
              onClick={() => {

                setModoPegado(false);
                setUploadMessage("");

              }}
            >
              Cargar archivo
            </Button>


            <Button
              variant={
                modoPegado
                  ? "primary"
                  : "outline-primary"
              }
              onClick={() => {

                setModoPegado(true);
                setUploadMessage("");

              }}
            >
              Pegar desde Excel
            </Button>

          </div>

        )}


        {/* ========================================= */}
        {/* MODO ARCHIVO                              */}
        {/* ========================================= */}

        {tipoMovimiento &&
          !modoPegado && (

            <>

              <Form.Group
                controlId="formFile"
                className="mb-3"
              >

                <Form.Label className="vt-label">
                  Seleccione un archivo Excel:
                </Form.Label>

                <Form.Control
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={
                    handleFileChange
                  }
                  className="vt-input"
                />

              </Form.Group>


              <Button
                variant="primary"
                onClick={
                  handleUploadButtonClick
                }
                disabled={
                  !file ||
                  buttonDisabled
                }
                className="vt-btn"
              >
                Subir Movimientos
              </Button>

            </>

          )}


        {/* ========================================= */}
        {/* MODO PEGADO                               */}
        {/* ========================================= */}

        {tipoMovimiento &&
          modoPegado && (

            <>

              <Card className="mb-3">

                <Card.Body>

                  <Form.Label>
                    Copiar desde Excel
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={textoPegado}
                    placeholder={
                      "Copie las 5 columnas desde Excel y presione Ctrl+V aquí"
                    }
                    onChange={(e) =>
                      setTextoPegado(
                        e.target.value
                      )
                    }
                    onPaste={
                      handlePaste
                    }
                  />

                  <Form.Text muted>
                    Copie las columnas: fecha,
                    código de artículo, cantidad,
                    remito y código de sucursal
                    destino.
                  </Form.Text>

                </Card.Body>

              </Card>


              {movimientosPegados.length > 0 && (

                <Table
                  bordered
                  striped
                  hover
                  responsive
                  size="sm"
                >

                  <thead>

                    <tr>

                      <th>Fecha</th>

                      <th>
                        Código
                      </th>

                      <th>
                        Producto
                      </th>

                      <th>
                        Cantidad
                      </th>

                      <th>
                        Remito
                      </th>

                      <th>
                        Cód. sucursal
                      </th>

                      <th>
                        Sucursal destino
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Acción
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {movimientosPegados.map(
                      (item, index) => {

                        const tieneError =
                          item.errorEstructura ||
                          item.errorFecha ||
                          item.errorArticulo ||
                          item.errorCantidad ||
                          item.errorSucursal;


                        return (

                          <tr
                            key={index}
                            className={
                              tieneError
                                ? "table-danger"
                                : ""
                            }
                          >

                            {/* FECHA */}

                            <td>

                              <Form.Control
                                size="sm"
                                type="text"
                                value={
                                  item.fecha
                                }
                                isInvalid={
                                  item.errorFecha
                                }
                                onChange={(e) =>
                                  actualizarFecha(
                                    index,
                                    e.target.value
                                  )
                                }
                              />

                            </td>


                            {/* CÓDIGO ARTÍCULO */}

                            <td>

                              <Form.Control
                                size="sm"
                                type="text"
                                value={
                                  item.articulocodigo
                                }
                                isInvalid={
                                  item.errorArticulo
                                }
                                onChange={(e) =>
                                  actualizarArticulo(
                                    index,
                                    e.target.value
                                  )
                                }
                              />

                            </td>


                            {/* DESCRIPCIÓN */}

                            <td>

                              {item.errorArticulo ? (

                                <span className="text-danger fw-bold">
                                  Código inexistente
                                </span>

                              ) : (

                                <span className="text-success">
                                  {
                                    item.articulodescripcion
                                  }
                                </span>

                              )}

                            </td>


                            {/* CANTIDAD */}

                            <td>

                              <Form.Control
                                size="sm"
                                type="text"
                                value={
                                  item.cantidad
                                }
                                isInvalid={
                                  item.errorCantidad
                                }
                                onChange={(e) =>
                                  actualizarCantidad(
                                    index,
                                    e.target.value
                                  )
                                }
                              />

                            </td>


                            {/* REMITO */}

                            <td>

                              <Form.Control
                                size="sm"
                                type="text"
                                value={
                                  item.remito
                                }
                                onChange={(e) =>
                                  actualizarRemito(
                                    index,
                                    e.target.value
                                  )
                                }
                              />

                            </td>


                            {/* CÓDIGO SUCURSAL */}

                            <td>

                              <Form.Control
                                size="sm"
                                type="text"
                                value={
                                  item.sucursaldestino_codigo
                                }
                                isInvalid={
                                  item.errorSucursal
                                }
                                onChange={(e) =>
                                  actualizarSucursal(
                                    index,
                                    e.target.value
                                  )
                                }
                              />

                            </td>


                            {/* NOMBRE SUCURSAL */}

                            <td>

                              {item.errorSucursal ? (

                                <span className="text-danger fw-bold">
                                  Sucursal inexistente
                                </span>

                              ) : (

                                <span className="text-success fw-bold">
                                  {
                                    item.sucursaldestino_nombre
                                  }
                                </span>

                              )}

                            </td>


                            {/* ESTADO */}

                            <td>

                              {item.errorEstructura ? (

                                <span className="text-danger fw-bold">
                                  Formato incorrecto
                                </span>

                              ) : item.errorFecha ? (

                                <span className="text-danger fw-bold">
                                  Fecha inválida
                                </span>

                              ) : item.errorArticulo ? (

                                <span className="text-danger fw-bold">
                                  Artículo inválido
                                </span>

                              ) : item.errorCantidad ? (

                                <span className="text-danger fw-bold">
                                  Cantidad inválida
                                </span>

                              ) : item.errorSucursal ? (

                                <span className="text-danger fw-bold">
                                  Sucursal inválida
                                </span>

                              ) : (

                                <span className="text-success fw-bold">
                                  OK
                                </span>

                              )}

                            </td>


                            {/* ELIMINAR */}

                            <td>

                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  eliminarMovimiento(
                                    index
                                  )
                                }
                              >
                                X
                              </Button>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </Table>

              )}


              {movimientosPegados.length > 0 && (

                <Button
                  variant="success"
                  onClick={
                    guardarPegados
                  }
                  disabled={
                    hayErrores ||
                    buttonDisabled
                  }
                  className="vt-btn"
                >
                  {buttonDisabled
                    ? "Procesando..."
                    : `Guardar ${movimientosPegados.length} movimientos`}
                </Button>

              )}

            </>

          )}


        {/* ========================================= */}
        {/* DESCARGAR PLANTILLA                       */}
        {/* ========================================= */}

        <div className="mt-3">

          <Button
            variant="secondary"
            onClick={
              downloadTemplate
            }
            className="vt-btn-secondary"
          >
            Descargar Plantilla
          </Button>

        </div>


        <Alert
          variant="info"
          className="mt-3 vt-alert"
        >

          <strong>
            Importante:
          </strong>{" "}

          La carga utiliza las columnas{" "}

          <code>fecha</code>,{" "}

          <code>articulocodigo</code>,{" "}

          <code>cantidad</code>,{" "}

          <code>remito</code> y{" "}

          <code>
            sucursaldestino_codigo
          </code>.

          {" "}El tipo y la sucursal de
          origen se determinan automáticamente
          según Fábrica o Achuras.

        </Alert>

      </Form>

    </Container>
  );
};


export default CrearMovimientosOtros;