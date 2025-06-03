// pages/inventarios/crearMovimientosOtros.js
import React, { useState } from "react";
import { Container, Button, Form, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";

const CrearMovimientosOtros = () => {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState(""); // "Fabrica" o "Achuras"

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !tipoMovimiento) {
      setUploadSuccess(false);
      setUploadMessage("Debe seleccionar tipo de movimiento y archivo.");
      return;
    }

    try {
      setButtonDisabled(true);

      // Definir tipo y sucursal_codigo según selección
      const tipo = tipoMovimiento === "Fabrica" ? "FABRICA" : "ACHURA";
      const sucursal_codigo = tipoMovimiento === "Fabrica" ? 20 : 1;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", tipo);
      formData.append("sucursal_codigo", sucursal_codigo);

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

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Validaciones básicas si fueran necesarias
      handleUpload();
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const headers = [
      "fecha",
      "articulocodigo",
      "cantidad",
      "remito",
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
        <Form.Group controlId="tipoMovimiento" className="mb-3">
          <Form.Label>Seleccione el tipo de movimiento:</Form.Label>
          <Form.Select
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value)}
          >
            <option value="">-- Seleccione --</option>
            <option value="Fabrica">Fábrica</option>
            <option value="Achuras">Achuras</option>
          </Form.Select>
        </Form.Group>

        {tipoMovimiento && (
          <>
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
          </>
        )}

        <div className="mt-3">
          <Button variant="secondary" onClick={downloadTemplate}>
            Descargar Plantilla
          </Button>
        </div>

        <Alert variant="info" className="mt-3">
          <strong>Importante:</strong> El archivo debe contener las columnas{" "}
          <code>fecha</code>, <code>articulocodigo</code>,{" "}
          <code>cantidad</code>, <code>remito</code>,{" "}
          <code>sucursaldestino_codigo</code>. El tipo y la sucursal de origen
          se seleccionan automáticamente según el tipo de movimiento.
        </Alert>
      </Form>
    </Container>
  );
};

export default CrearMovimientosOtros;
