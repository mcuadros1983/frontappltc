import React, { useState } from "react";
import { Container, Button, Form, Alert, ProgressBar } from "react-bootstrap";
import * as XLSX from "xlsx";


const SellUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";
  

  // Manejar la selección de archivo
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Validar el archivo antes de enviarlo
  const validateFile = async (file) => {
    try {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Verificar si las columnas requeridas están presentes
        const requiredColumns = [
          "item_id", "sucursal", "data", "ticket", "cliente", "dni", "monto",
          "descuento", "anulada", "usuario", "articulo", "cantidad",
          "totalitem", "preciopromo", "preciolista", "fecha2"
        ];

        const fileColumns = jsonData[0] || [];
        const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));

        if (missingColumns.length > 0) {
          setUploadSuccess(false);
          setUploadMessage(`Faltan las siguientes columnas: ${missingColumns.join(", ")}`);
          return;
        }

        // Validar que los valores numéricos sean correctos
        // const invalidRows = jsonData.slice(1).some((row) => {
        //   return isNaN(row[6]) || isNaN(row[7]) || isNaN(row[11]) || isNaN(row[12]); // Validamos monto, descuento, cantidad y totalitem
        // });

        // if (invalidRows) {
        //   setUploadSuccess(false);
        //   setUploadMessage("Hay valores no numéricos en las columnas numéricas.");
        //   return;
        // }

        // Si pasa todas las validaciones, proceder con la carga del archivo
        handleUpload();
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error al validar el archivo:", error);
    }
  };

  // Subir el archivo al backend con barra de progreso
  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Por favor, selecciona un archivo.");
      return;
    }

    setProgress(0);
    setUploadMessage("");
    setUploadSuccess(false);
    setButtonDisabled(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${apiUrl}/statics-upload`, true);
      xhr.withCredentials = true; // ✅ Esto permite que se envíen las credenciales
      

      // Manejar la barra de progreso
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded / event.total) * 100);
          setProgress(percentCompleted);
        }
      };

      // Manejar la respuesta
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadSuccess(true);
          setUploadMessage(response.message || "Archivo subido exitosamente.");
        } else {
          setUploadSuccess(false);
          setUploadMessage("Error al subir el archivo.");
        }
        setButtonDisabled(false);
        setProgress(0); // Reiniciar la barra de progreso
      };

      xhr.onerror = () => {
        setUploadSuccess(false);
        setUploadMessage("Error en la carga del archivo.");
        setButtonDisabled(false);
        setProgress(0);
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setUploadMessage("Error en la carga del archivo.");
      setUploadSuccess(false);
      setButtonDisabled(false);
    }
  };

  // Descargar plantilla de ejemplo
  const downloadTemplate = () => {
    const headers = [
      ["item_id", "sucursal", "data", "ticket", "cliente", "dni", "monto",
      "descuento", "anulada", "usuario", "articulo", "cantidad",
      "totalitem", "preciopromo", "preciolista", "fecha2"]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "VentasTemplate");
    XLSX.writeFile(workbook, "VentasTemplate.xlsx");
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Subir Archivo de Ventas</h1>

      {/* Alertas de éxito o error */}
      {uploadSuccess && <Alert variant="success">{uploadMessage}</Alert>}
      {!uploadSuccess && uploadMessage && <Alert variant="danger">{uploadMessage}</Alert>}

      <Form>
        {/* Selector de archivo */}
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Seleccione un archivo Excel:</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>

        {/* Barra de progreso */}
        {progress > 0 && <ProgressBar animated now={progress} label={`${progress}%`} className="mb-3" />}

        {/* Botón para subir archivo */}
        <Button variant="primary" onClick={() => validateFile(file)} disabled={!file || buttonDisabled}>
          Subir Ventas
        </Button>

        {/* Botón para descargar plantilla */}
        <div style={{ marginTop: "20px" }}>
          <Button variant="secondary" onClick={downloadTemplate}>
            Descargar Plantilla
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default SellUpload;
