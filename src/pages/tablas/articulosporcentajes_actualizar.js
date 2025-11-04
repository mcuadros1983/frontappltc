import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Form, Alert, Spinner } from "react-bootstrap";
import * as XLSX from "xlsx";

const ArticulosPorcentajeActualizar = () => {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [articulos, setArticulos] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerArticulos = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/obtenerarticulosporcentaje`, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Error al obtener los artículos con porcentaje");
      }
      const data = await response.json();
      setArticulos(data);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  useEffect(() => {
    obtenerArticulos();
  }, [obtenerArticulos]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setButtonDisabled(false);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("Falta el archivo para la carga.");
      return;
    }

    try {
      setButtonDisabled(true);
      setLoading(true); // Activar el spinner

      const formData = new FormData();
      formData.append("file", file);

      // console.log("formdata", formData)

      const response = await fetch(`${apiUrl}/actualizararticulosporcentaje`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadSuccess(true);
        setUploadMessage(data.mensaje);
      } else {
        setUploadSuccess(false);
        setUploadMessage(data.mensaje);
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
    } finally {
      setButtonDisabled(false);
      setLoading(false); // Desactivar el spinner
    }
  };

  const validateFile = async (file) => {
    try {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const porcentajeColumn = jsonData.map((row) => row[2]); // Obtener la tercera columna (índice 2)

        const invalidPercentages = porcentajeColumn
          .slice(1)
          .some(
            (percentage) => isNaN(percentage) || isNaN(parseFloat(percentage))
          );

        if (invalidPercentages) {
          setUploadSuccess(false);
          setUploadMessage(
            "La columna de porcentajes debe contener solo números o números con decimales."
          );
          return;
        }

        handleUpload();
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error al validar el archivo:", error);
    }
  };

  const handleUploadButtonClick = () => {
    validateFile(file);
  };

  const downloadTemplate = () => {
    const data = [
      ["codigo", "descripcion", "porcentaje", "subcategoria"],
      ...articulos.map((articulo) => [
        articulo.Articulotabla.codigobarra,
        articulo.Articulotabla.descripcion,
        articulo.porcentaje,
        articulo.subcategoria,
      ]),
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "ArticulosPorcentaje");

    XLSX.writeFile(workbook, "ArticulosPorcentaje.xlsx");
  };

  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">
        Actualizar Porcentajes desde Excel
      </h1>

      {uploadSuccess && (
        <Alert variant="success" className="vt-alert">
          {uploadMessage}
        </Alert>
      )}
      {!uploadSuccess && uploadMessage && (
        <Alert variant="danger" className="vt-alert">
          {uploadMessage}
        </Alert>
      )}

      <Form className="vt-form vt-form-narrow">
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label className="vt-label">Seleccione un archivo Excel:</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            disabled={loading}
            className="vt-input"
          />
        </Form.Group>

        <Button
          variant="primary"
          onClick={handleUploadButtonClick}
          disabled={buttonDisabled || loading}
          className="vt-btn"
        >
          {loading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Actualizar Porcentajes"
          )}
        </Button>
      </Form>

      <div className="mt-2">
        <Button
          variant="secondary"
          onClick={downloadTemplate}
          disabled={loading}
          className="vt-btn-secondary"
        >
          Descargar Plantilla
        </Button>
      </div>
    </Container>
  );

};

export default ArticulosPorcentajeActualizar;
