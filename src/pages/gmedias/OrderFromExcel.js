import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";

const OrderFromExcel = () => {
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleCategoriaChange = (e) => {
    setCategoria(e.target.value);
    setSubcategoria(""); // Resetear subcategoría al cambiar categoría
  };

  const getSubcategorias = () => {
    if (categoria === "bovino") return ["nt", "va"];
    if (categoria === "porcino") return ["cerdo"];
    return [];
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !categoria || !subcategoria) {
      setUploadSuccess(false);
      setUploadMessage("Debe completar todos los campos antes de subir.");
      return;
    }

    try {
      setButtonDisabled(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categoria", categoria);
      formData.append("subcategoria", subcategoria);

      const response = await fetch(`${apiUrl}/ordenes/cargar-productos-excel`, {
        method: "POST",
        credentials:"include",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setUploadSuccess(true);
        setUploadMessage(data.mensaje);
      } else {
        setUploadSuccess(false);
        setUploadMessage(data.mensaje || "Error al subir archivo.");
      }
    } catch (error) {
      setUploadSuccess(false);
      setUploadMessage("Error al subir archivo: " + error.message);
    } finally {
      setButtonDisabled(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "fecha",
      "sucursaldestino_codigo",
      "tropa",
      "kg",
      "costo",
      "remito",
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "Plantilla_Ordenes_Productos.xlsx");
  };

  return (
    <Container>
      <h1 className="my-4">Cargar Productos desde Excel</h1>

      {uploadSuccess && <Alert variant="success">{uploadMessage}</Alert>}
      {!uploadSuccess && uploadMessage && (
        <Alert variant="danger">{uploadMessage}</Alert>
      )}

      <Form>
        <Form.Group controlId="categoria" className="mb-3">
          <Form.Label>Categoría:</Form.Label>
          <Form.Select
            value={categoria}
            onChange={handleCategoriaChange}
            className="custom-style-select"
          >
            <option value="">Seleccione una categoría</option>
            <option value="bovino">Bovino</option>
            <option value="porcino">Porcino</option>
          </Form.Select>
        </Form.Group>

        {categoria && (
          <Form.Group controlId="subcategoria" className="mb-3">
            <Form.Label>Subcategoría:</Form.Label>
            <Form.Select
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
              className="custom-style-select"
            >
              <option value="">Seleccione una subcategoría</option>
              {getSubcategorias().map((sub, idx) => (
                <option key={idx} value={sub}>
                  {sub}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}

        {categoria && subcategoria && (
          <>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Archivo Excel:</Form.Label>
              <Form.Control type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!file || buttonDisabled}
            >
              Subir Archivo
            </Button>
          </>
        )}

        <div className="mt-4">
          <Button variant="secondary" onClick={handleDownloadTemplate}>
            Descargar plantilla
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default OrderFromExcel;
