import React, { useState, useContext } from "react";
import {
  Container,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import Contexts from "../../../context/Contexts";


const CrearInventariosMasivosDesdeExcel = () => {

  const [file, setFile] = useState(null);

  const [uploadSuccess, setUploadSuccess] =
    useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [errores, setErrores] =
    useState([]);

  const [buttonDisabled, setButtonDisabled] =
    useState(false);

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
  // ARCHIVO
  // =====================================================

  const handleFileChange = (e) => {

    const archivo =
      e.target.files[0];

    setFile(
      archivo || null
    );

    setUploadMessage("");
    setErrores([]);
  };


  // =====================================================
  // SUBIR ARCHIVO
  // =====================================================

  const handleUpload = async () => {

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


      const response =
        await fetch(
          `${apiUrl}/cargarinventarios-masivos-excel`,
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

      } catch (error) {

        console.error(
          "No se pudo interpretar la respuesta:",
          error
        );

      }


      // =================================================
      // RESPUESTA EXITOSA
      // =================================================

      if (response.ok) {

        setUploadSuccess(true);

        setUploadMessage(
          responseData.mensaje ||
          "Inventarios creados exitosamente."
        );

        setErrores([]);


        // Limpiar formulario

        setFile(null);
        setAnio("");
        setMes("");
        setFecha("");


        // Limpiar input file visualmente

        const inputFile =
          document.getElementById(
            "inventariosMasivosFile"
          );

        if (inputFile) {
          inputFile.value = "";
        }

      }

      // =================================================
      // ERROR DEL BACKEND
      // =================================================

      else {

        setUploadSuccess(false);

        setUploadMessage(
          responseData.message ||
          "Error al procesar el archivo."
        );


        // Errores de filas

        if (
          Array.isArray(
            responseData.errores
          )
        ) {

          setErrores(
            responseData.errores
          );

        }

        // Artículos inexistentes

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

        // Sucursales
        // Puede contener strings o objetos
        // dependiendo del error recibido.

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
        "Error al subir inventarios:",
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

    const headers = [
      "sucursal_codigo",
      "articulocodigo",
      "cantidadpeso",
    ];


    const worksheet =
      XLSX.utils.aoa_to_sheet([
        headers,
      ]);


    // Ancho de columnas

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "InventariosMasivos"
    );


    XLSX.writeFile(
      workbook,
      "InventariosMasivosTemplate.xlsx"
    );

  };


  // =====================================================
  // ESTILO
  // =====================================================

  const inputStyle = {
    width: "300px",
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <Container className="vt-page">

      <h1 className="my-list-title dark-text vt-title">
        Carga Masiva de Inventarios
      </h1>


      {/* ============================================= */}
      {/* MENSAJES */}
      {/* ============================================= */}

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

            <div className="mt-3">

              <strong>
                Detalle:
              </strong>

              <ul className="mb-0 mt-2">

                {errores.map(
                  (error, index) => (

                    <li key={index}>
                      {error}
                    </li>

                  )
                )}

              </ul>

            </div>

          )}

        </Alert>

      )}


      <Form className="vt-form vt-form-narrow">


        {/* ========================================= */}
        {/* AÑO */}
        {/* ========================================= */}

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
            style={inputStyle}
          />

        </Form.Group>


        {/* ========================================= */}
        {/* MES */}
        {/* ========================================= */}

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
              style={inputStyle}
            />

          </Form.Group>

        )}


        {/* ========================================= */}
        {/* FECHA */}
        {/* ========================================= */}

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
              style={inputStyle}
            />

          </Form.Group>

        )}


        {/* ========================================= */}
        {/* ARCHIVO */}
        {/* ========================================= */}

        {fecha && (

          <Form.Group
            controlId="inventariosMasivosFile"
            className="mb-3"
          >

            <Form.Label className="vt-label">

              Seleccione el archivo Excel:

            </Form.Label>

            <Form.Control
              id="inventariosMasivosFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={
                handleFileChange
              }
              className="vt-input"
              style={inputStyle}
            />

          </Form.Group>

        )}


        {/* ========================================= */}
        {/* SUBIR */}
        {/* ========================================= */}

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

            {
              buttonDisabled
                ? "Procesando..."
                : "Subir Inventarios"
            }

          </Button>

        )}


        {/* ========================================= */}
        {/* PLANTILLA */}
        {/* ========================================= */}

        <div className="mt-3">

          <Button
            variant="secondary"
            onClick={
              downloadTemplate
            }
            className="vt-btn-secondary"
            style={inputStyle}
          >

            Descargar Plantilla

          </Button>

        </div>

      </Form>

    </Container>

  );

};


export default CrearInventariosMasivosDesdeExcel;