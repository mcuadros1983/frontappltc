import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Button,
  Form,
  Alert,
  Card,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import Contexts from "../../../context/Contexts";


const CrearInventarioDesdeExcel = () => {

  const [modoCarga, setModoCarga] = useState("");

  const [file, setFile] = useState(null);

  const [uploadSuccess, setUploadSuccess] =
    useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [errores, setErrores] =
    useState([]);

  const [buttonDisabled, setButtonDisabled] =
    useState(false);

  const [sucursales, setSucursales] =
    useState([]);

  const [sucursalId, setSucursalId] =
    useState("");

  const [anio, setAnio] =
    useState("");

  const [mes, setMes] =
    useState("");

  const [fecha, setFecha] =
    useState("");

  const context =
    useContext(Contexts.UserContext);

  const apiUrl =
    process.env.REACT_APP_API_URL;


  // =====================================================
  // CARGAR SUCURSALES
  // =====================================================

  useEffect(() => {

    const fetchSucursales = async () => {

      try {

        const res = await fetch(
          `${apiUrl}/sucursales/`,
          {
            credentials: "include",
          }
        );

        const data =
          await res.json();

        setSucursales(data);

      } catch (error) {

        console.error(
          "Error al obtener sucursales:",
          error
        );

      }

    };

    fetchSucursales();

  }, [apiUrl]);


  // =====================================================
  // CAMBIAR MODO DE CARGA
  // =====================================================

  const handleModoCarga = (modo) => {

    setModoCarga(modo);

    // Limpiamos datos para evitar mezclar
    // una carga individual con una masiva.

    setFile(null);
    setSucursalId("");
    setAnio("");
    setMes("");
    setFecha("");

    setUploadMessage("");
    setUploadSuccess(false);
    setErrores([]);

    // Limpiar input file si existiera

    const inputFile =
      document.getElementById("formFile");

    if (inputFile) {
      inputFile.value = "";
    }

  };


  // =====================================================
  // ARCHIVO
  // =====================================================

  const handleFileChange = (e) => {

    setFile(
      e.target.files[0] || null
    );

    setUploadMessage("");
    setErrores([]);

  };


  // =====================================================
  // SUBIR INVENTARIO
  // =====================================================

  const handleUpload = async () => {

    // -----------------------------------------------------
    // Validaciones generales
    // -----------------------------------------------------

    if (!modoCarga) {

      setUploadSuccess(false);

      setUploadMessage(
        "Debe seleccionar el tipo de carga."
      );

      return;
    }


    if (
      !file ||
      !anio ||
      !mes ||
      !fecha
    ) {

      setUploadSuccess(false);

      setUploadMessage(
        "Debe completar todos los campos antes de subir."
      );

      return;
    }


    // -----------------------------------------------------
    // Individual necesita sucursal
    // -----------------------------------------------------

    if (
      modoCarga === "individual" &&
      !sucursalId
    ) {

      setUploadSuccess(false);

      setUploadMessage(
        "Debe seleccionar una sucursal."
      );

      return;
    }


    if (!context.user?.id) {

      setUploadSuccess(false);

      setUploadMessage(
        "No se pudo identificar al usuario."
      );

      return;
    }


    try {

      setButtonDisabled(true);

      setUploadMessage("");
      setErrores([]);


      const formData =
        new FormData();


      formData.append(
        "file",
        file
      );

      formData.append(
        "anio",
        anio
      );

      formData.append(
        "mes",
        mes
      );

      formData.append(
        "fecha",
        fecha
      );

      formData.append(
        "usuario_id",
        context.user.id
      );


      // ---------------------------------------------------
      // Sólo individual envía sucursal_id
      // ---------------------------------------------------

      if (modoCarga === "individual") {

        formData.append(
          "sucursal_id",
          sucursalId
        );

      }


      // ---------------------------------------------------
      // Endpoint según modo
      // ---------------------------------------------------

      const endpoint =
        modoCarga === "individual"
          ? "/cargarinventarios-excel"
          : "/cargarinventarios-masivos-excel";


      const response =
        await fetch(
          `${apiUrl}${endpoint}`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );


      let responseData = {};


      try {

        responseData =
          await response.json();

      } catch (e) {

        responseData = {};

      }


      // =================================================
      // ÉXITO
      // =================================================

      if (response.ok) {

        setUploadSuccess(true);

        setUploadMessage(
          responseData.mensaje ||
          (
            modoCarga === "individual"
              ? "Inventario creado exitosamente."
              : "Inventarios creados exitosamente."
          )
        );

        setErrores([]);

        // -----------------------------------------------
        // Limpiar datos de carga
        // pero conservar el modo seleccionado
        // -----------------------------------------------

        setFile(null);
        setSucursalId("");
        setAnio("");
        setMes("");
        setFecha("");


        const inputFile =
          document.getElementById(
            "formFile"
          );

        if (inputFile) {
          inputFile.value = "";
        }

      }

      // =================================================
      // ERROR
      // =================================================

      else {

        setUploadSuccess(false);

        setUploadMessage(
          responseData.message ||
          "Error al procesar el archivo."
        );


        // -----------------------------------------------
        // Errores por fila
        // -----------------------------------------------

        if (
          Array.isArray(
            responseData.errores
          )
        ) {

          setErrores(
            responseData.errores
          );

        }

        // -----------------------------------------------
        // Artículos inexistentes
        // -----------------------------------------------

        else if (
          Array.isArray(
            responseData.articulos
          )
        ) {

          setErrores(
            responseData.articulos.map(
              (codigo) =>
                `Artículo inexistente: ${codigo}`
            )
          );

        }

        // -----------------------------------------------
        // Sucursales
        // -----------------------------------------------

        else if (
          Array.isArray(
            responseData.sucursales
          )
        ) {

          setErrores(
            responseData.sucursales.map(
              (sucursal) => {

                if (
                  typeof sucursal ===
                  "object"
                ) {

                  return (
                    `Sucursal ${
                      sucursal.codigo || ""
                    } ${
                      sucursal.nombre
                        ? `- ${sucursal.nombre}`
                        : ""
                    }`
                  );

                }

                return (
                  `Sucursal inexistente: ${sucursal}`
                );

              }
            )
          );

        }

      }

    } catch (error) {

      console.error(
        "Error al subir el archivo:",
        error
      );

      setUploadSuccess(false);

      setUploadMessage(
        "Error: " +
        error.message
      );

    } finally {

      setButtonDisabled(false);

    }

  };


  // =====================================================
  // BOTÓN SUBIR
  // =====================================================

  const handleUploadButtonClick = () => {

    if (!file) {

      setUploadSuccess(false);

      setUploadMessage(
        "Debe seleccionar un archivo."
      );

      return;
    }

    handleUpload();

  };


  // =====================================================
  // DESCARGAR PLANTILLA
  // =====================================================

  const downloadTemplate = () => {

    if (!modoCarga) {

      setUploadSuccess(false);

      setUploadMessage(
        "Primero debe seleccionar el tipo de carga."
      );

      return;
    }


    let headers;
    let nombreArchivo;
    let nombreHoja;


    // -----------------------------------------------------
    // INDIVIDUAL
    // -----------------------------------------------------

    if (modoCarga === "individual") {

      headers = [
        "articulocodigo",
        "cantidadpeso",
      ];

      nombreArchivo =
        "InventarioTemplate.xlsx";

      nombreHoja =
        "InventarioTemplate";

    }

    // -----------------------------------------------------
    // MASIVA
    // -----------------------------------------------------

    else {

      headers = [
        "sucursal_codigo",
        "articulocodigo",
        "cantidadpeso",
      ];

      nombreArchivo =
        "InventariosMasivosTemplate.xlsx";

      nombreHoja =
        "InventariosMasivos";

    }


    const worksheet =
      XLSX.utils.aoa_to_sheet([
        headers,
      ]);


    worksheet["!cols"] =
      modoCarga === "individual"
        ? [
            { wch: 20 },
            { wch: 20 },
          ]
        : [
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
          ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      nombreHoja
    );


    XLSX.writeFile(
      workbook,
      nombreArchivo
    );

  };


  const selectStyle = {
    width: "300px",
  };


  return (

    <Container className="vt-page">

      <h1 className="my-list-title dark-text vt-title">
        Cargar Inventario desde Excel
      </h1>


      {/* ================================================= */}
      {/* MENSAJES */}
      {/* ================================================= */}

      {uploadMessage && (

        <Alert
          variant={
            uploadSuccess
              ? "success"
              : "danger"
          }
          className="vt-alert"
        >

          <div>
            {uploadMessage}
          </div>


          {errores.length > 0 && (

            <ul className="mb-0 mt-2">

              {errores.map(
                (error, index) => (

                  <li key={index}>
                    {error}
                  </li>

                )
              )}

            </ul>

          )}

        </Alert>

      )}


      <Form className="vt-form vt-form-narrow">


        {/* ================================================= */}
        {/* TIPO DE CARGA */}
        {/* ================================================= */}

        <Card
          className="mb-4"
          style={{
            maxWidth: "650px",
          }}
        >

          <Card.Body>

            <Card.Title>
              Tipo de carga
            </Card.Title>


            <Form.Check
              type="radio"
              id="modoIndividual"
              name="modoCarga"
              label="Carga individual por sucursal"
              value="individual"
              checked={
                modoCarga === "individual"
              }
              onChange={() =>
                handleModoCarga(
                  "individual"
                )
              }
              className="mb-2"
            />


            <Form.Check
              type="radio"
              id="modoMasivo"
              name="modoCarga"
              label="Carga masiva de todas las sucursales"
              value="masivo"
              checked={
                modoCarga === "masivo"
              }
              onChange={() =>
                handleModoCarga(
                  "masivo"
                )
              }
            />


            {modoCarga === "individual" && (

              <Alert
                variant="info"
                className="mt-3 mb-0"
              >

                Se cargará un inventario
                para una única sucursal.

              </Alert>

            )}


            {modoCarga === "masivo" && (

              <Alert
                variant="warning"
                className="mt-3 mb-0"
              >

                El archivo debe contener
                la columna{" "}
                <strong>
                  sucursal_codigo
                </strong>
                . Los artículos repetidos
                dentro de una misma
                sucursal serán sumados
                automáticamente.

              </Alert>

            )}

          </Card.Body>

        </Card>


        {/* ================================================= */}
        {/* SUCURSAL - SÓLO INDIVIDUAL */}
        {/* ================================================= */}

        {modoCarga === "individual" && (

          <Form.Group
            controlId="sucursalSelect"
            className="mb-3"
          >

            <Form.Label className="vt-label">
              Sucursal:
            </Form.Label>

            <Form.Select
              value={sucursalId}
              onChange={(e) =>
                setSucursalId(
                  e.target.value
                )
              }
              className="vt-input"
              size="lg"
              style={selectStyle}
            >

              <option value="">
                Seleccione una sucursal
              </option>

              {sucursales.map(
                (sucursal) => (

                  <option
                    key={sucursal.id}
                    value={sucursal.id}
                  >

                    {sucursal.nombre}

                  </option>

                )
              )}

            </Form.Select>

          </Form.Group>

        )}


        {/* ================================================= */}
        {/* AÑO */}
        {/* ================================================= */}

        {(
          modoCarga === "masivo" ||
          (
            modoCarga === "individual" &&
            sucursalId
          )
        ) && (

          <Form.Group
            controlId="anioInput"
            className="mb-3"
          >

            <Form.Label className="vt-label">
              Año:
            </Form.Label>

            <Form.Control
              type="number"
              value={anio}
              onChange={(e) =>
                setAnio(
                  e.target.value
                )
              }
              className="vt-input"
              size="lg"
              style={selectStyle}
            />

          </Form.Group>

        )}


        {/* ================================================= */}
        {/* MES */}
        {/* ================================================= */}

        {anio && (

          <Form.Group
            controlId="mesInput"
            className="mb-3"
          >

            <Form.Label className="vt-label">
              Mes (en número):
            </Form.Label>

            <Form.Control
              type="number"
              min="1"
              max="12"
              value={mes}
              onChange={(e) => {

                const value =
                  parseInt(
                    e.target.value
                  );

                if (
                  value >= 1 &&
                  value <= 12
                ) {

                  setMes(value);

                } else {

                  setMes("");

                }

              }}
              className="vt-input"
              size="lg"
              style={selectStyle}
            />

          </Form.Group>

        )}


        {/* ================================================= */}
        {/* FECHA */}
        {/* ================================================= */}

        {mes && (

          <Form.Group
            controlId="fechaInput"
            className="mb-3"
          >

            <Form.Label className="vt-label">
              Fecha:
            </Form.Label>

            <Form.Control
              type="date"
              value={fecha}
              onChange={(e) =>
                setFecha(
                  e.target.value
                )
              }
              className="vt-input"
              size="lg"
              style={selectStyle}
            />

          </Form.Group>

        )}


        {/* ================================================= */}
        {/* ARCHIVO */}
        {/* ================================================= */}

        {fecha && (

          <Form.Group
            controlId="formFileGroup"
            className="mb-3"
          >

            <Form.Label className="vt-label">

              {modoCarga === "individual"
                ? "Seleccione el inventario de la sucursal:"
                : "Seleccione el archivo con los inventarios de todas las sucursales:"}

            </Form.Label>


            <Form.Control
              id="formFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={
                handleFileChange
              }
              className="vt-input"
              style={selectStyle}
            />

          </Form.Group>

        )}


        {/* ================================================= */}
        {/* SUBIR */}
        {/* ================================================= */}

        {fecha && (

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

            {buttonDisabled
              ? "Procesando..."
              : modoCarga === "individual"
                ? "Subir Inventario"
                : "Subir Inventarios Masivos"}

          </Button>

        )}


        {/* ================================================= */}
        {/* DESCARGAR PLANTILLA */}
        {/* ================================================= */}

        {modoCarga && (

          <div className="mt-3">

            <Button
              variant="secondary"
              onClick={
                downloadTemplate
              }
              className="vt-btn-secondary"
              style={selectStyle}
            >

              {modoCarga === "individual"
                ? "Descargar Plantilla Individual"
                : "Descargar Plantilla Masiva"}

            </Button>

          </div>

        )}

      </Form>

    </Container>

  );

};


export default CrearInventarioDesdeExcel;