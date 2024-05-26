import React, { useState } from "react";
import { Container, Form, Button, Spinner, Table } from "react-bootstrap";
import { useNavigate,  } from "react-router-dom";
import { processBarCode } from "../../utils/processBarCode";
import { GenerateReceiptReceiptHTML } from "./GenerateReceiptReceiptHTML";
import CategorySummaryTable from "../../utils/CategorySummaryTable";

const ReceiptForm = () => {
  const initialProductState = {
    codigo_de_barra: "",
    categoria_producto: "",
    subcategoria: "",
    num_media: "",
    precio: 0,
    kg: "",
    tropa: "",
  };

  const initialProductStateOnProcess = {
    codigo_de_barra: "",
    categoria_producto: "",
    subcategoria: "",
    num_media: "",
    precio: 0,
    kg: "",
    tropa: "",
  };

  const [product, setProduct] = useState(initialProductState);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  // const [receipt, setReceipt] = useState({
  //   cantidad_total: "",
  //   peso_total: "",
  //   categoria_ingreso: "",
  //   branch_id: "",
  //   movement_id: "",
  // });

  const [isCodeProcessing, setIsCodeProcessing] = useState(false);
  const [isCancelButtonDisabled, setIsCancelButtonDisabled] = useState(true);
  const [categoria, setCategoria] = useState(null);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [canGenerateCode, setCanGenerateCode] = useState(true); // Estado para controlar la generación de códigos
  // const [saveGeneratedCodes, setSaveGeneratedCodes] = useState([]); // Estado para controlar la generación de códigos

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleIngresoExitoso = async (ingreso, productos) => {
    try {
      const receiptHTML = GenerateReceiptReceiptHTML(ingreso, productos);
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    } catch (error) {
      console.error("Error al imprimir el comprobante de ingreso:", error);
      alert(
        "Ocurrió un error al imprimir el comprobante de ingreso. Intente nuevamente más tarde."
      );
    }
  };

  const checkProductExistence = async (codigoDeBarra) => {
    try {
      const response = await fetch(
        `${apiUrl}/productos/${codigoDeBarra}/barra`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      return !!data;
    } catch (error) {
      console.error("Error al verificar la existencia del producto", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const peso_total = products.reduce(
      (acum, product) => acum + Number(product.kg),
      0
    );
    const cantidad_total = products.length;

    const confirmSubmit = window.confirm(
      "¿Estás seguro de que deseas grabar este ingreso?"
    );
    if (!confirmSubmit) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/ingresos`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({
          products,
          categoria,
          cantidad_total,
          peso_total,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      handleIngresoExitoso(data.nuevoIngreso, data.productos);
      setGeneratedCodes([]);
      navigate("/receipts");
    } catch (error) {
      console.error("Error al guardar el ingreso:", error);
      alert("No se pudo guardar el ingreso");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "kg") {
      // Permite solo números y punto decimal
      if (/^\d*\.?\d*$/.test(value) || value === "") {
        setProduct(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  // const handleEdit = (product, index) => {
  //   setProduct(product);
  //   setEditingIndex(index);
  // };

  const handleSave = async () => {
    if (!product.codigo_de_barra) {
      alert("El campo código de barra es requerido");
      return;
    }

    const productExists = await checkProductExistence(product.codigo_de_barra);

    if (productExists) {
      alert("¡Alerta! El producto ya existe en la base de datos.");
      return;
    }

    const barcodeExists = products.some(
      (prod, index) =>
        index !== editingIndex &&
        prod.codigo_de_barra === product.codigo_de_barra
    );
    if (barcodeExists) {
      alert("El código de barras ya existe en la lista");
      return;
    }

    const barcodePattern = /^\d+$/;
    if (!barcodePattern.test(product.codigo_de_barra)) {
      alert("El código de barras debe contener solo números");
      return;
    }

    if (editingIndex !== null) {
      const updatedProducts = [...products];
      updatedProducts[editingIndex] = product;
      setProducts(updatedProducts);
      setEditingIndex(null);
      setIsCancelButtonDisabled(true);
    } else {
      setProducts([...products, product]);
      setIsCancelButtonDisabled(true);
    }

    setProduct(initialProductState);
    setCanGenerateCode(true);
  };

  const handleDelete = (barcode) => {
    const confirmDelete = window.confirm(
      "¿Seguro que desea eliminar este elemento?"
    );

    if (confirmDelete) {
      const updatedProducts = products.filter(
        (prod) => prod.codigo_de_barra !== barcode
      );
      // Buscar el valor del input codigo_de_barra en generatedCodes
      const index = generatedCodes.indexOf(barcode);

      // Si el valor del input codigo_de_barra está en generatedCodes, eliminarlo
      if (index !== -1) {
        const updatedGeneratedCodes = [...generatedCodes];
        updatedGeneratedCodes.splice(index, 1); // Eliminar el elemento en el índice encontrado
        setGeneratedCodes(updatedGeneratedCodes); // Actualizar el estado con el nuevo array
      }

      setProducts(updatedProducts);
    }
  };

  const processCodeBarHandler = async (codigoDeBarra) => {
    setIsCodeProcessing(true);

    const processedData = processBarCode(codigoDeBarra, categoria);

    if (processedData.success) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        num_media: processedData.data.num_media,
        tropa: processedData.data.tropa,
        kg: processedData.data.kg,
        precio: 0,
      }));
      setIsCancelButtonDisabled(false);
    } else {
      alert(`Error al procesar el código de barras: ${processedData.message}`);
    }
    setIsCodeProcessing(false);
  };

  const handleCancel = () => {
    // Buscar el valor del input codigo_de_barra en generatedCodes
    const index = generatedCodes.indexOf(product.codigo_de_barra);

    // Si el valor del input codigo_de_barra está en generatedCodes, eliminarlo
    if (index !== -1) {
      const updatedGeneratedCodes = [...generatedCodes];
      updatedGeneratedCodes.splice(index, 1); // Eliminar el elemento en el índice encontrado
      setGeneratedCodes(updatedGeneratedCodes); // Actualizar el estado con el nuevo array
    }

    // Restaurar el estado inicial del producto y deshabilitar el botón Cancelar
    setProduct(initialProductStateOnProcess);
    setIsCancelButtonDisabled(true);
    // setGeneratedCodes([]);
    setCanGenerateCode(true);
  };

  const handleCategoriaSelection = (categoriaSeleccionada) => {
    if (products.length > 0) {
      const confirmChange = window.confirm(
        "Si cambia de categoría, se borrarán los productos agregados. ¿Desea continuar?"
      );
      if (!confirmChange) {
        return;
      }
    }
    setIsCancelButtonDisabled(true);
    setCategoria(categoriaSeleccionada);
    setProducts([]);
    setProduct(initialProductState);
    setGeneratedCodes([]);
    setCanGenerateCode(true);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentFilteredProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleGenerateCode = async () => {
    // console.log("categoria", categoria);
    if (!canGenerateCode) return; // Verificar si se puede generar un nuevo código

    if (generatedCodes.length > 0) {
      // console.log("arraycontenido", generatedCodes);
      let newId;
      if (categoria === "bovino") {
        const lastGeneratedCode = generatedCodes[generatedCodes.length - 1];
        newId = parseInt(lastGeneratedCode, 10) + 1;
        const codigo_de_barra = newId.toString().padStart(30, "0");
        const num_media = codigo_de_barra.slice(-11);

        setProduct((prevProduct) => ({
          ...prevProduct,
          codigo_de_barra: codigo_de_barra,
          num_media: num_media,
          precio: 0,
          kg: 0,
          tropa: 0,
        }));
        setGeneratedCodes([...generatedCodes, codigo_de_barra]);
        setIsCancelButtonDisabled(false);
        setCanGenerateCode(false); // Deshabilitar la generación de códigos hasta que se presione "Guardar"
      } else if (categoria === "porcino") {
        const lastGeneratedCode = generatedCodes[generatedCodes.length - 1];
        newId = parseInt(lastGeneratedCode, 10) + 1;
        const codigo_de_barra = newId.toString().padStart(7, "0");

        setProduct((prevProduct) => ({
          ...prevProduct,
          codigo_de_barra,
          num_media: codigo_de_barra,
          precio: 0,
          kg: 0,
          tropa: 0,
        }));
        setGeneratedCodes([...generatedCodes, codigo_de_barra]);
        setIsCancelButtonDisabled(false);
        setCanGenerateCode(false); // Deshabilitar la generación de códigos hasta que se presione "Guardar"
      } else {
        alert("Categoría desconocida");
      }
    } else {
      // console.log("categoria2", categoria);
      // console.log("arraysincontenido", generatedCodes);
      try {
        const response = await fetch(`${apiUrl}/productos/generarcodigos`, {
          credentials: "include",
          method: "POST",
          // body: JSON.stringify(categoria),
          body: JSON.stringify({ categoria }), // Convertir categoria a JSON
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al generar el código de barras");
        }

        const data = await response.json();
        // console.log("datos backend", data);

        if (generatedCodes.includes(data.codigo_de_barra)) {
          alert("El código de barras ya ha sido generado previamente.");
          return;
        }

        setGeneratedCodes([...generatedCodes, data.codigo_de_barra]);

        processCodeBarHandler(data.codigo_de_barra);
        setCanGenerateCode(false);

        setProduct((prevProduct) => ({
          ...prevProduct,
          codigo_de_barra: data.codigo_de_barra,
          num_media: data.num_media,
          precio: 0,
          kg: 0,
          tropa: 0,
        }));
      } catch (error) {
        console.error("Error al generar el código de barras:", error);
        alert("Ocurrió un error al generar el código de barras.");
      }
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Ingreso" : "Agregar Ingreso"}
      </h1>

      <div className="my-buttons-container">
        <Button
          variant={categoria === "bovino" ? "success" : "outline-success"}
          onClick={() => handleCategoriaSelection("bovino")}
          className="mx-2"
        >
          Bovino
        </Button>
        <Button
          variant={categoria === "porcino" ? "success" : "outline-success"}
          onClick={() => handleCategoriaSelection("porcino")}
          className="mx-2"
        >
          Porcino
        </Button>
      </div>

      <Form onSubmit={(e) => e.preventDefault()} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Codigo de barra</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              name="codigo_de_barra"
              value={product.codigo_de_barra}
              onChange={(e) => {
                setGeneratedCodes([]);
                setCanGenerateCode(true);
                const inputValue = e.target.value;
                if (/^\d*$/.test(inputValue)) {
                  setProduct({
                    ...product,
                    codigo_de_barra: inputValue,
                    num_media: "",
                    precio: 0,
                    kg: "",
                    tropa: "",
                  });
                } else {
                  alert("El código de barras debe contener solo números");
                }
              }}
              placeholder="Ingresa el codigo de barra"
              className="my-input me-1"
            />

            <span className="ms-1">
              <Button
                variant="success"
                onClick={() => processCodeBarHandler(product.codigo_de_barra)}
                className="ml-1"
                disabled={
                  isCodeProcessing ||
                  (categoria === "bovino" &&
                    product.codigo_de_barra.length !== 30) ||
                  (categoria === "porcino" &&
                    product.codigo_de_barra.length !== 7) ||
                  generatedCodes.length > 0 // Deshabilitar si generatedCodes tiene contenido
                }
              >
                Procesar
              </Button>
            </span>

            <span className="ms-1">
              <Button
                variant="danger"
                onClick={handleCancel}
                className="ml-1"
                disabled={isCancelButtonDisabled}
              >
                Cancelar
              </Button>
            </span>
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <span className="ms-1">
            <Button
              variant="success"
              onClick={() => handleGenerateCode()}
              className="ml-1"
              disabled={!categoria || product.codigo_de_barra.trim() !== ""}
            >
              Generar
            </Button>
          </span>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Numero de media</Form.Label>
          <Form.Control
            type="number"
            name="num_media"
            value={product.num_media}
            onChange={handleChange}
            placeholder="Ingresa el numero de la media"
            className="my-input"
            disabled
            min="0"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Numero de Tropa</Form.Label>
          <Form.Control
            type="number"
            name="tropa"
            value={product.tropa}
            onChange={handleChange}
            placeholder="Ingresa el numero de la tropa"
            className="my-input"
            disabled={
              categoria !== "porcino" || generatedCodes.length !== 0
                ? false
                : true
            }
            min="0"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Peso de la media</Form.Label>
          <Form.Control
            type="number"
            name="kg"
            value={product.kg}
            onChange={handleChange}
            placeholder="Ingresa el peso de la media"
            className="my-input"
            disabled={
              categoria !== "porcino" || generatedCodes.length !== 0
                ? false
                : true
            }
            // min="0"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Precio de la media</Form.Label>
          <Form.Control
            type="number"
            name="precio"
            value={product.precio}
            onChange={handleChange}
            placeholder="Ingresa el precio de la media"
            className="my-input"
            min="0"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="button"
          onClick={handleSave}
          disabled={loading || !product.num_media}
          style={{ position: "relative" }}
        >
          {editing ? (
            "Editar"
          ) : loading ? (
            <Spinner
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Guardar"
          )}
        </Button>
      </Form>
      <h1 className="my-list-title dark-text">Productos a agregar</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Codigo de Barra</th>
            <th>Numero de Media</th>
            <th>Precio</th>
            <th>Peso</th>
            <th>Numero de Tropa</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentFilteredProducts.map((product, index) => (
            <tr key={product.codigo_de_barra}>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>{product.precio}</td>
              <td>{product.kg}</td>
              <td>{product.tropa}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(product.codigo_de_barra)}
                  className="mx-2"
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="py-2">
        <Button
          color="inherit"
          onClick={handleSubmit}
          disabled={products.length === 0}
        >
          Grabar
        </Button>
      </div>
      <div>
        {pageNumbers.map((number) => (
          <Button
            key={number}
            onClick={() => paginate(number)}
            className="mx-1"
          >
            {number}
          </Button>
        ))}
      </div>
      <CategorySummaryTable filteredProducts={products} />
    </Container>
  );
};

export default ReceiptForm;
