import React, { useState } from "react";
import { Container, Form, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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

  const [product, setProduct] = useState(initialProductState);
  const [products, setProducts] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [codeProcessed, setCodeProcessed] = useState(false);

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
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    } catch (error) {
      console.error("Error al imprimir el comprobante de ingreso:", error);
      alert("Ocurrió un error al imprimir el comprobante de ingreso.");
    }
  };

  const handleCategoriaSelection = (categoriaSeleccionada) => {
    if (products.length > 0) {
      const confirmChange = window.confirm(
        "Si cambia de categoría, se borrarán los productos agregados. ¿Desea continuar?"
      );
      if (!confirmChange) return;
    }
    setCategoria(categoriaSeleccionada);
    setProducts([]);
    setProduct(initialProductState);
    setManualEntry(false);
    setFieldsDisabled(true);
    setCodeProcessed(false);
  };

  const handleManualEntry = () => {
    setManualEntry(true);
    setFieldsDisabled(false);
    setProduct({
      ...initialProductState,
      precio: 0,
    });
  };

  const handleCancelManualEntry = () => {
    setManualEntry(false);
    setFieldsDisabled(true);
    setProduct(initialProductState);
    setCodeProcessed(false);
  };

  const handleSave = async () => {
    const generateNumericId = () => {
      const now = Date.now(); // ejemplo: 1716830456789
      return now.toString().slice(-8); // últimos 8 dígitos: "30456789"
    };

    if (manualEntry) {
      let { num_media, tropa, kg, subcategoria } = product;

      // Validaciones para bovino
      if (categoria === "bovino") {
        if (!num_media || !tropa || !kg) {
          alert("Todos los campos (Número de media, Tropa y Peso) son obligatorios.");
          return;
        }

        if (!/^\d+$/.test(num_media) || !/^\d+$/.test(tropa) || !/^\d+$/.test(kg)) {
          alert("Los campos Número de media, Tropa y Peso deben ser solo números.");
          return;
        }

        const mediaExists = products.some((prod) => prod.num_media == num_media);
        if (mediaExists) {
          alert("El producto ya existe en la lista.");
          return;
        }

        const productExists = await checkProductExistenceNumMedia(num_media);
        if (productExists && productExists.sucursal_id !== 32) {
          alert("¡Alerta! El producto ya ha sido ingresado anteriormente.");
          return;
        }
      }

      // Generación para porcino
      if (categoria === "porcino") {
        num_media = generateNumericId();
        subcategoria = "cerdo";
      }

      const productoFinal = {
        ...product,
        num_media,
        tropa: tropa || "0",
        kg: kg || "0",
        categoria_producto: categoria,
        subcategoria: categoria === "porcino" ? "cerdo" : subcategoria || "",
      };

      // Generar código de barra
      let codigo_de_barra = `00${num_media}00${productoFinal.tropa}00${productoFinal.kg}`;

      if (categoria !== "porcino") {
        const exists = await checkProductExistence(codigo_de_barra);
        if (exists && exists.sucursal_id !== 32) {
          alert("¡Alerta! El producto ya ha sido ingresado anteriormente.");
          return;
        }
      }

      // Guardar producto
      setProducts([...products, { ...productoFinal, codigo_de_barra }]);
      setManualEntry(false);
      setProduct(initialProductState);
      setFieldsDisabled(true);
    } else {
      // Ingreso por escaneo de código de barras
      if (!product.codigo_de_barra) {
        alert("El campo código de barra es requerido");
        return;
      }

      const productoFinal = {
        ...product,
        tropa: product.tropa || "0",
        kg: product.kg || "0",
        categoria_producto: categoria,
        subcategoria: categoria === "porcino" ? "cerdo" : product.subcategoria || "",
      };

      const productExists = await checkProductExistence(product.codigo_de_barra);
      if (productExists && productExists.sucursal_id !== 32) {
        alert("¡Alerta! El producto ya ha sido ingresado anteriormente.");
        return;
      }

      setProducts([...products, productoFinal]);
      setFieldsDisabled(true);
    }

    // Limpiar estado
    setProduct(initialProductState);
    setManualEntry(false);
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
      return data;
    } catch (error) {
      console.error("Error al verificar la existencia del producto", error);
      return false;
    }
  };

  const checkProductExistenceNumMedia = async (num_media) => {
    try {
      const response = await fetch(
        `${apiUrl}/productos/${num_media}/numeromedia`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al verificar la existencia del producto", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const peso_total = products.reduce(
      (acum, product) => acum + parseFloat(product.kg || 0),
      0
    );
    const cantidad_total = products.length;

    const confirmSubmit = window.confirm(
      "¿Estás seguro de que deseas grabar este ingreso?"
    );
    if (!confirmSubmit) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/ingresos`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({
          products,
          categoria,
          cantidad_total,
          peso_total,
          fecha,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("No se pudo guardar el ingreso.");

      const data = await res.json();
      handleIngresoExitoso(data.nuevoIngreso, data.productos);
      setProducts([]);
      navigate("/receipts");
    } catch (error) {
      console.error(error);
      alert("Error al guardar el ingreso. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processCodeBarHandler = async (codigoDeBarra, numeroMedia) => {

    const numMedia = parseFloat(codigoDeBarra.slice(2, 13))
    console.log("numero", numMedia)

    const processedData = processBarCode(codigoDeBarra, categoria);
    if (processedData.success) {
      const productExists = await checkProductExistence(codigoDeBarra);

      if (productExists && productExists.sucursal_id !== 32) {
        if (productExists.orden_id) {
          alert(`¡Alerta! El producto ya fue despachado bajo la Orden Número ${productExists.orden_id}`);
        } else if (productExists.venta_id) {
          alert(`¡Alerta! El producto ya fue despachado bajo la Venta Número ${productExists.venta_id}`);
        } else {
          alert("¡Alerta! El producto ya ha sido ingresado anteriormente.");
        }
        return;
      }


      const barcodeExists = products.some(
        (prod) => prod.codigo_de_barra === codigoDeBarra
      );
      if (barcodeExists) {
        alert("El producto ya existe en la lista.");
        return;
      }

      const numMediaExists = products.some(
        (prod) => prod.num_media == numMedia
      );
      if (numMediaExists) {
        alert("El producto ya existe en la lista.");
        return;
      }
      // }

      setProduct((prevProduct) => ({
        ...prevProduct,
        num_media: processedData.data.num_media,
        tropa: categoria === "porcino" ? "" : processedData.data.tropa,
        kg: categoria === "porcino" ? "" : processedData.data.kg,
        precio: 0,
        codigo_de_barra: codigoDeBarra,
      }));

      // Agregar directamente el producto a la lista si la categoría es bovino
      setProducts((prevProducts) => [
        ...prevProducts,
        {
          ...product,
          codigo_de_barra: codigoDeBarra,
          num_media: processedData.data.num_media,
          tropa: processedData.data.tropa || "",
          kg: processedData.data.kg || "",
          precio: 0,
        },
      ]);
      setProduct(initialProductState);
      setCodeProcessed(true);
    } else {
      alert(`Error al procesar el código de barras: ${processedData.message}`);
    }
  };

  const handleCodeBarChange = (e) => {
    const newCode = e.target.value;
    setProduct(initialProductState);
    setFieldsDisabled(true);
    setCodeProcessed(false);
    setProduct((prevProduct) => ({
      ...prevProduct,
      codigo_de_barra: newCode,
    }));
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentFilteredProducts = [...products]
    .reverse()
    .slice(indexOfFirstProduct, indexOfLastProduct);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">Agregar Ingreso</h1>

      <div className="my-buttons-container">
        <Form.Group className="mb-3">
          <Form.Label>Fecha del ingreso</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="my-input"
          />
        </Form.Group>
      </div>

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

      <Form className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Codigo de barra</Form.Label>
          <Form.Control
            type="text"
            name="codigo_de_barra"
            value={product.codigo_de_barra}
            onChange={handleCodeBarChange}
            placeholder="Ingresa el código de barra"
            className="my-input"
            disabled={manualEntry}
          />
          <Button
            variant="success"
            onClick={() => processCodeBarHandler(product.codigo_de_barra, product.num_media)}
            className="mt-2"
            disabled={
              manualEntry ||
              !(
                (categoria === "bovino" &&
                  product.codigo_de_barra.length === 30) ||
                (categoria === "porcino" &&
                  product.codigo_de_barra.length === 30)
              )
            }
          >
            Procesar
          </Button>
        </Form.Group>
        <div className="d-flex mb-3">
          <Button
            variant="success"
            onClick={handleManualEntry}
            disabled={manualEntry || !categoria}
            className="mr-2"
          >
            Ingreso Manual
          </Button>
          {manualEntry && (
            <Button
              variant="danger"
              className="ms-2"
              onClick={handleCancelManualEntry}
            >
              Cancelar
            </Button>
          )}
        </div>
        {categoria !== "porcino" && (
          <Form.Group className="mb-3">
            <Form.Label>Numero de media</Form.Label>
            <Form.Control
              type="number"
              name="num_media"
              value={product.num_media}
              onChange={(e) =>
                setProduct({ ...product, num_media: e.target.value })
              }
              placeholder="Ingresa el número de media"
              className="my-input"
              disabled={fieldsDisabled}
            />
          </Form.Group>
        )}
        {/* <Form.Group className="mb-3">
          <Form.Label>Numero de media</Form.Label>
          <Form.Control
            type="number"
            name="num_media"
            value={product.num_media}
            onChange={(e) =>
              setProduct({ ...product, num_media: e.target.value })
            }
            placeholder="Ingresa el número de media"
            className="my-input"
            disabled={fieldsDisabled}
          />
        </Form.Group> */}
        {/* Renderizar el campo "Número de Tropa" solo si la categoría no es porcino */}
        <Form.Group className="mb-3">
          <Form.Label>Numero de tropa</Form.Label>
          <Form.Control
            type="number"
            name="tropa"
            value={product.tropa}
            onChange={(e) =>
              setProduct({ ...product, tropa: e.target.value })
            }
            placeholder="Ingresa el número de tropa"
            className="my-input"
            disabled={fieldsDisabled}
          />
        </Form.Group>
        {/* )} */}
        <Form.Group className="mb-3">
          <Form.Label>Peso de la media</Form.Label>
          <Form.Control
            type="number"
            name="kg"
            value={product.kg}
            onChange={(e) => setProduct({ ...product, kg: e.target.value })}
            placeholder="Ingresa el peso de la media"
            className="my-input"
            disabled={fieldsDisabled}
          />
        </Form.Group>
        {/* <Button
          variant="primary"
          type="button"
          onClick={handleSave}
          disabled={!product.num_media}
        >
          Guardar
        </Button> */}
        <Button
          variant="primary"
          type="button"
          onClick={handleSave}
          disabled={
            manualEntry &&
            (
              (categoria === "bovino" && !product.num_media) ||
              !categoria // Por si no eligieron aún la categoría
            )
          }
        >
          Guardar
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
          {currentFilteredProducts.map((product) => (
            <tr key={product.codigo_de_barra}>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>{product.precio}</td>
              <td>{product.kg}</td>
              <td>{product.tropa}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  onClick={() =>
                    setProducts((prev) =>
                      prev.filter(
                        (p) => p.codigo_de_barra !== product.codigo_de_barra
                      )
                    )
                  }
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
          disabled={products.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Grabando..." : "Grabar"}
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
