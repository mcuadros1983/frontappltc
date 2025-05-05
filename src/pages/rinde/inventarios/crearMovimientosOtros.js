// pages/inventarios/crearMovimientosOtros.js
import React, { useState } from "react";
import { Container, Button, Form, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";

const CrearMovimientosOtros = () => {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadSuccess(false);
      setUploadMessage("Debe seleccionar un archivo.");
      return;
    }

    try {
      setButtonDisabled(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/movimientos-otro-excel`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setUploadSuccess(true);
        setUploadMessage(data.mensaje || "Archivo procesado correctamente.");
      } else {
        setUploadSuccess(false);
        setUploadMessage(data.mensaje || "Error al procesar el archivo.");
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setUploadMessage("Error: " + error.message);
      setUploadSuccess(false);
    } finally {
      setButtonDisabled(false);
    }
  };

  const handleUploadButtonClick = () => {
    if (!file) {
      setUploadMessage("Debe seleccionar un archivo.");
      setUploadSuccess(false);
      return;
    }

    // Opcional: Validación básica de Excel
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Aquí podrías validar campos obligatorios, por ahora solo sube
      handleUpload();
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const headers = [
      "fecha",
      "tipo",
      "articulocodigo",
      "cantidad",
      "remito",
      "sucursal_codigo",
      "sucursaldestino_codigo",
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MovimientosOtrosTemplate");
    XLSX.writeFile(workbook, "MovimientosOtrosTemplate.xlsx");
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Cargar Movimientos Otros</h1>
      {uploadSuccess && <Alert variant="success">{uploadMessage}</Alert>}
      {!uploadSuccess && uploadMessage && (
        <Alert variant="danger">{uploadMessage}</Alert>
      )}
      <Form>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Seleccione un archivo Excel:</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
        <Button
          variant="primary"
          onClick={handleUploadButtonClick}
          disabled={!file || buttonDisabled}
        >
          Subir Movimientos
        </Button>
        <div className="mt-3">
          <Button variant="secondary" onClick={downloadTemplate}>
            Descargar Plantilla
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CrearMovimientosOtros;
