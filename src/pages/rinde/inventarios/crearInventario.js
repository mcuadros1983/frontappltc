// pages/inventarios/CrearInventarioDesdeExcel.js
import React, { useState, useEffect, useContext } from "react";
import { Container, Button, Form, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";
import Contexts from "../../../context/Contexts";

const CrearInventarioDesdeExcel = () => {
  //   const { user } = useContext(Contexts.UserContext);
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [fecha, setFecha] = useState("");
  const context = useContext(Contexts.UserContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await fetch(`${apiUrl}/sucursales/`, {
          credentials: "include",
        });
        const data = await res.json();
        setSucursales(data);
      } catch (error) {
        console.error("Error al obtener sucursales:", error);
      }
    };
    fetchSucursales();
  }, [apiUrl]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !sucursalId || !anio || !mes || !fecha) {
      setUploadSuccess(false);
      setUploadMessage("Debe completar todos los campos antes de subir.");
      return;
    }
  
    try {
      setButtonDisabled(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sucursal_id", sucursalId);
      formData.append("anio", anio);
      formData.append("mes", mes);
      formData.append("fecha", fecha);
      formData.append("usuario_id", context.user?.id);
  
      const response = await fetch(`${apiUrl}/cargarinventarios-excel`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
  
      let responseData;
      try {
        responseData = await response.json(); // intentar parsear respuesta siempre
      } catch (e) {
        responseData = {}; // si no se puede, usar objeto vacío
      }
  
      if (response.ok) {
        setUploadSuccess(true);
        setUploadMessage(responseData.mensaje || "Inventario creado exitosamente.");
  
        // limpiar los campos
        setFile(null);
        setSucursalId("");
        setAnio("");
        setMes("");
        setFecha("");
      } else {
        setUploadSuccess(false);
        setUploadMessage(responseData.message || "Error al procesar el archivo.");
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setUploadSuccess(false);
      setUploadMessage("Error: " + error.message);
    } finally {
      setButtonDisabled(false);
    }
  };
  
  

  const handleUploadButtonClick = () => {
    if (!file) {
      setUploadSuccess(false);
      setUploadMessage("Debe seleccionar un archivo.");
      return;
    }
    handleUpload();
  };

  const downloadTemplate = () => {
    const headers = ["articulocodigo", "cantidadpeso"];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InventarioTemplate");
    XLSX.writeFile(workbook, "InventarioTemplate.xlsx");
  };

  const selectStyle = {
    width: "300px",
  };

  return (
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Cargar Inventario desde Excel</h1>

    {uploadSuccess && <Alert variant="success" className="vt-alert">{uploadMessage}</Alert>}
    {!uploadSuccess && uploadMessage && (
      <Alert variant="danger" className="vt-alert">{uploadMessage}</Alert>
    )}

    <Form className="vt-form vt-form-narrow">
      <Form.Group controlId="sucursalSelect" className="mb-3">
        <Form.Label className="vt-label">Sucursal:</Form.Label>
        <Form.Select
          value={sucursalId}
          onChange={(e) => setSucursalId(e.target.value)}
          className="vt-input"
          size="lg"
          style={selectStyle}
        >
          <option value="">Seleccione una sucursal</option>
          {sucursales.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {sucursalId && (
        <>
          <Form.Group controlId="anioInput" className="mb-3">
            <Form.Label className="vt-label">Año:</Form.Label>
            <Form.Control
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="vt-input"
              size="lg"
              style={selectStyle}
            />
          </Form.Group>

          <Form.Group controlId="mesInput" className="mb-3">
            <Form.Label className="vt-label">Mes (en número):</Form.Label>
            <Form.Control
              type="number"
              value={mes}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 12) {
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
        </>
      )}

      {mes && (
        <Form.Group controlId="fechaInput" className="mb-3">
          <Form.Label className="vt-label">Fecha:</Form.Label>
          <Form.Control
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="vt-input"
            size="lg"
            style={selectStyle}
          />
        </Form.Group>
      )}

      {fecha && (
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label className="vt-label">Seleccione un archivo Excel:</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            className="vt-input"
            style={selectStyle}
          />
        </Form.Group>
      )}

      {fecha && (
        <Button
          variant="primary"
          onClick={handleUploadButtonClick}
          disabled={!file || buttonDisabled}
          className="vt-btn"
        >
          Subir Inventario
        </Button>
      )}

      <div className="mt-3">
        <Button
          variant="secondary"
          onClick={downloadTemplate}
          className="vt-btn-secondary"
          style={selectStyle}
        >
          Descargar Plantilla
        </Button>
      </div>
    </Form>
  </Container>
);

};

export default CrearInventarioDesdeExcel;
