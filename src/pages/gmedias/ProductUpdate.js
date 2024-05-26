// export default ProductUpdate;
import React, { useState, useEffect } from "react";
import { Container, Button, Form, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";
// import Contexts from "../../context/Contexts";

const ProductUpdate = () => {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [tipo, setTipo] = useState("Seleccione la acción");
  const [tipoSeleccionado, setTipoSeleccionado] = useState(false);
  const [operacion, setOperacion] = useState("Seleccione operación");
  const [destino, setDestino] = useState("");
  const [cliente, setCliente] = useState("");
  const [formaPago, setFormaPago] = useState("");
  // const { sucursales, formasPago, clientes } = useContext(Contexts.dataContext);
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !tipoSeleccionado || !operacion) {
      console.error("Falta información requerida para la carga del archivo.");
      return;
    }

    try {
      setButtonDisabled(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", tipo);
      formData.append("tipoSeleccionado", tipoSeleccionado);
      formData.append("operacion", operacion);
      formData.append("destino", destino);
      formData.append("cliente", cliente);
      formData.append("formaPago", formaPago);

      const response = await fetch(`${apiUrl}/productos/upload`, {
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
      setUploadMessage("Error al subir el archivo: " + error.message);
      setUploadSuccess(false);
    } finally {
      setButtonDisabled(false);
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

        // Excluir la séptima columna (índice 6) y validar números a partir de la tercera columna
        const invalidRows = jsonData.slice(1).some((row) => {
          const filteredRow = row.filter((cell, index) => index !== 6);
          return filteredRow.slice(2).some((cell) => isNaN(cell));
        });

        if (invalidRows) {
          setUploadSuccess(false);
          setUploadMessage(
            "El archivo debe contener solo datos numéricos a partir de la tercera columna, comenzando desde la segunda fila, excluyendo la séptima columna."
          );
          return;
        }

        // Validar la primera columna para "bovino" o "porcino" y que solo haya una categoría por archivo
        const categories = jsonData.slice(1).map((row) => row[0]);
        const validCategories = new Set(
          categories.filter(
            (category) => category === "bovino" || category === "porcino"
          )
        );

        if (validCategories.size > 1) {
          alert("Solo se permite una categoría por archivo.");
          return;
        } else if (
          categories.some(
            (category) => category !== "bovino" && category !== "porcino"
          )
        ) {
          alert("Ingresó una categoría inexistente (bovino o porcino)");
          return;
        }

        // Validación de subcategorías
        const subcategoryErrors = jsonData.slice(1).some((row, index) => {
          if (!row[0] || !row[1]) return false; // No validar si alguna de las dos primeras columnas está vacía
          const category = row[0];
          const subcategory = row[1];

          const validSubcategories = {
            bovino: ["nt", "va"],
            porcino: ["cerdo"],
          };

          if (!validSubcategories[category]?.includes(subcategory)) {
            alert("Ingreso una subcategoría inexistente (nt, va, cerdo)");
            return true;
          }

          if (
            (category === "bovino" && subcategory === "cerdo") ||
            (category === "porcino" &&
              (subcategory === "nt" || subcategory === "va"))
          ) {
            alert("No coinciden las categorías con las subcategorías");
            return true;
          }

          return false;
        });

        if (subcategoryErrors) return;

        // Si la validación es exitosa, puedes continuar con el proceso de carga del archivo
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
    let templateHeaders = [
      "categoria (bovino,porcino)",
      "subcategoria (nt,va,cerdo)",
      "num_media",
      "garron",
      "precio",
      "costo",
      "kg",
      "tropa",
    ];
    if (tipo === "crear") {
      // templateHeaders.unshift("num_media");
      templateHeaders = [
        "categoria",
        "subcategoria",
        "garron",
        "precio",
        "costo",
        "kg",
        "tropa",
      ];
    }
    const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductosTemplate");
    XLSX.writeFile(workbook, "ProductosTemplate.xlsx");
  };

  const handleTipoChange = (e) => {
    const selectedTipo = e.target.value;
    setTipo(selectedTipo);
    setTipoSeleccionado(selectedTipo !== "Seleccione la acción");
    // Limpiar los estados relacionados con Operación
    setOperacion("Seleccione operación");
    setDestino("");
    setCliente("");
    setFormaPago("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Llamada para obtener sucursales
        const resSucursales = await fetch(`${apiUrl}/sucursales/`, {
          credentials: "include",
        });
        const dataSucursales = await resSucursales.json();
        setSucursales(dataSucursales);

        // Llamada para obtener clientes
        const resClientes = await fetch(`${apiUrl}/clientes/`, {
          credentials: "include",
        });
        const dataClientes = await resClientes.json();
        setClientes(dataClientes);

        // Llamada para obtener formas de pago
        const resFormasPago = await fetch(`${apiUrl}/formas-pago/`, {
          credentials: "include",
        });
        const dataFormasPago = await resFormasPago.json();
        // console.log("formaspago", dataFormasPago);
        setFormasPago(dataFormasPago);
      } catch (error) {
        console.error("Error al obtener datos del backend:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Cada vez que 'operacion' cambie, restablecer los otros estados
    setDestino("");
    setCliente("");
    setFormaPago("");
  }, [operacion]); // Se ejecutará cada vez que cambie 'operacion'

  return (
    <Container>
      <h1 className="my-list-title dark-text">Subir Archivo Excel</h1>
      {uploadSuccess && <Alert variant="success">{uploadMessage}</Alert>}
      {!uploadSuccess && uploadMessage && (
        <Alert variant="danger">{uploadMessage}</Alert>
      )}
      <Form>
        <Form.Group controlId="tipo" className="mb-3">
          {/* <Form.Label>Tipo:</Form.Label> */}
          <Form.Select
            value={tipo}
            onChange={handleTipoChange}
            className="my-input custom-style-select"
            size="lg"
          >
            <option value="Seleccione la acción">Seleccione la acción</option>
            <option value="crear">Crear Productos</option>
            <option value="actualizar">Actualizar Productos</option>
          </Form.Select>
        </Form.Group>
        {tipoSeleccionado && tipo === "actualizar" && (
          <>
            {/* Selector de archivo */}
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Seleccione un archivo Excel:</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            {/* Botón para subir archivo */}
            <Button
              variant="primary"
              onClick={handleUploadButtonClick}
              disabled={!file || buttonDisabled}
            >
              Actualizar Productos
            </Button>
            <div style={{ marginTop: "20px" }}>
              <Button variant="secondary" onClick={downloadTemplate}>
                Descargar Archivo
              </Button>
            </div>
            <p className="mt-2">
              La actualización se hace en base al número de media, por lo cual
              si no se incluye el valor exacto de este campo, no se realizará la
              actualización.
            </p>
          </>
        )}
      </Form>
      {tipoSeleccionado && tipo === "crear" && (
        <>
          <Form>
            <Form.Group controlId="operacion" className="mb-3">
              <Form.Label>Operación:</Form.Label>
              <Form.Select
                value={operacion}
                onChange={(e) => setOperacion(e.target.value)}
                className="my-input custom-style-select"
                size="lg"
              >
                <option value="Seleccione operacion">
                  Seleccione operacion
                </option>
                <option value="venta">Venta</option>
                <option value="orden">Orden</option>
              </Form.Select>
            </Form.Group>
            {operacion === "orden" && (
              <Form.Group controlId="destino" className="mb-3">
                <Form.Label>Sucursal:</Form.Label>
                <Form.Select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="my-input custom-style-select"
                  size="lg"
                >
                  {/* Aquí se llenaría con las sucursales disponibles */}
                  <option value="">Seleccionar destino</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            {operacion === "venta" && (
              <>
                <Form.Group controlId="cliente" className="mb-3">
                  <Form.Label>Cliente:</Form.Label>
                  <Form.Select
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="my-input custom-style-select"
                    size="lg"
                  >
                    {/* Aquí se llenaría con los clientes disponibles */}
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </>
            )}
            {operacion === "venta" && destino && (
              <>
                <Form.Group controlId="formaPago" className="mb-3">
                  <Form.Label>Forma de Pago:</Form.Label>
                  <Form.Select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value)}
                    className="my-input custom-style-select"
                    size="lg"
                  >
                    <option value="">Seleccionar forma de pago</option>
                    {formasPago.map((formaPago) => (
                      <option key={formaPago.id} value={formaPago.id}>
                        {formaPago.tipo}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </>
            )}

            {(destino || formaPago) && (
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Seleccione un archivo Excel:</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
              </Form.Group>
            )}
            {(operacion === "venta" || operacion === "orden") && (
              <Button
                variant="primary"
                onClick={handleUploadButtonClick}
                disabled={!file || buttonDisabled}  // Asegúrate de que el botón esté deshabilitado según el estado
              >
                Crear Productos
              </Button>
            )}
          </Form>
          <div style={{ marginTop: "20px" }}>
            <Button variant="secondary" onClick={downloadTemplate}>
              Descargar Archivo
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default ProductUpdate;
