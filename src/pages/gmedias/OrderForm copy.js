import React, { useContext, useEffect, useState, useRef } from "react";
import { Container, Form, Button, Table, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { GenerateReceiptOrderHTML } from "./GenerateReceiptOrderHTML"; // Importa la función de receiptGenerator
import CategorySummaryTable from "../../utils/CategorySummaryTable"; // Importa el componente CategorySummaryTable
import Contexts from "../../context/Contexts";

export default function OrderForm() {
  const context = useContext(Contexts.UserContext);
  // const toggleModal = () => setModal(!modal);
  const toggleModal = () => {
    setModal(!modal);
    setSearchMedia("");
    setSearchPeso("");
    setSearchTropa("");
    setSearchGarron("");
    setCurrentPage(1); // Reiniciar a la primera página
  };
  const codigoDeBarraRef = useRef(null);

  const initialProductState = {
    codigo_de_barra: "",
    num_media: "",
    precio: "",
    kg: "",
    tropa: "",
  };

  const [product, setProduct] = useState(initialProductState);
  const [products, setProducts] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(""); // Inicializa con un valor adecuado según tus necesidades
  const [availableProducts, setAvailableProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modal, setModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [currentPageOrder, setCurrentPageOrder] = useState(1);
  const [productsPerPageOrder] = useState(10);
  // ordenamiento
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  // filtros especificos
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchGarron, setSearchGarron] = useState("");
  // Dentro de la función OrderForm
  const [filteredProducts, setFilteredProducts] = useState([]);
  // const [currentFilteredProducts, setCurrentFilteredProducts] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]); // Fecha actual en formato YYYY-MM-DD
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Llamada a las sucursales al montar la página
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${apiUrl}/sucursales`, {
          credentials: "include",
        });
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, [apiUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/productos`, {
          credentials: "include",
        });
        const data = await response.json();
        // Filtrar los productos que tengan sucursal_id igual a 1
        const filteredProducts = data.filter(
          (producto) => producto.sucursal_id === 18
        );
        setAvailableProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (modal) {
      fetchProducts();
    }
  }, [modal, apiUrl]);

  // Actualizar los productos filtrados cada vez que se aplique un filtro
  useEffect(() => {
    const filtered = availableProducts.filter((product) => {
      // Verifica si num_media es null o undefined, y asigna una cadena vacía en ese caso
      const numMedia = product.num_media ?? "";
      // Verifica si kg es null o undefined, y asigna una cadena vacía en ese caso
      const kg = product.kg ?? "";
      // Verifica si tropa es null o undefined, y asigna una cadena vacía en ese caso
      const tropa = product.tropa ?? "";
      // Verifica si garron es null o undefined, y asigna una cadena vacía en ese caso
      const garron = product.garron ?? "";

      const mediaMatch = numMedia.toString().includes(searchMedia);
      const pesoMatch = kg.toString().includes(searchPeso);
      const tropaMatch = tropa.toString().includes(searchTropa);
      const garronMatch = garron.toString().includes(searchGarron);

      return mediaMatch && pesoMatch && tropaMatch && garronMatch;
    });

    setFilteredProducts(filtered);
  }, [searchMedia, searchPeso, searchTropa, searchGarron, availableProducts]);

  const handleOrderExitosa = async (orden, productos) => {
    try {
      // Obtener el nombre de la sucursal
      const sucursal = branches.find(
        (branch) => branch.id === orden.sucursal_id
      );
      const nombreSucursal = sucursal
        ? sucursal.nombre
        : "Sucursal Desconocida";

      // Generar el contenido HTML del comprobante
      const receiptHTML = GenerateReceiptOrderHTML(
        orden,
        productos,
        nombreSucursal
      );

      // Crear un nuevo elemento HTML para el contenido del comprobante
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();

      // Imprimir el contenido del comprobante
      printWindow.print();
      // Cerrar la ventana emergente después de imprimir
      printWindow.close();
    } catch (error) {
      console.error("Error al imprimir el recibo:", error);
      alert(
        "Ocurrió un error al imprimir el recibo. Intente nuevamente más tarde."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBranchId) {
      alert("Por favor, seleccione una sucursal antes de grabar.");
      return;
    }

    if (selectedBranchId === 1) {
      alert("No se pueden hacer envíos a la central, cambie la sucursal.");
      return;
    }

    if (products.some((product) => product.kg <= 0)) {
      alert("Debe ingresar el peso para todos los productos.");
      return;
    }

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas grabar esta orden?"
    );
    if (!confirmDelete) {
      return;
    }

    const cantidad_total = products.length;
    const peso_total = products.reduce(
      (acum, product) => acum + Number(product.kg),
      0
    );

    setIsSubmitting(true); // Inhabilita el botón

    try {
      const res = await fetch(`${apiUrl}/ordenes`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({
          products,
          cantidad_total,
          peso_total,
          selectedBranchId,
          fecha,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      handleOrderExitosa(data.nuevaOrden, data.productosActualizados);

      navigate("/orders");
    } catch (error) {
      console.error("Error al guardar la orden:", error);
      alert("No se pudo guardar la orden");
    } finally {
      setIsSubmitting(false); // Habilita el botón nuevamente
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Aquí aseguramos que el valor es numérico antes de establecerlo
    if (name === "sucursal_destino") {
      const numericValue = Number(value);
      setSelectedBranchId(numericValue);

      // Suponiendo que quieres enfocar el campo de entrada del código de barras después de seleccionar una sucursal
      if (codigoDeBarraRef.current) {
        codigoDeBarraRef.current.focus();
      }
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!product.codigo_de_barra) {
      alert("El campo código de barra es requerido");
      return;
    }

    // Buscar el producto en la base de datos
    const productResponse = await fetch(
      `${apiUrl}/productos/${product.codigo_de_barra}/barra`,
      {
        credentials: "include",
      }
    );
    const productData = await productResponse.json();

    if (!productData) {
      setModal(true); // Abre el modal si el producto no se encuentra
      return;
    }

    // if (productData.sucursal_id !== 18) {
    //   alert("El producto ya no se encuentra en stock");
    //   return;
    // }

    const excludedSucursales = [18, 32];
    if (!excludedSucursales.includes(productData.sucursal_id)) {
      alert("El producto ya no se encuentra en stock");
      return;
    }

    if (products.some((prod) => prod.codigo_de_barra === product.codigo_de_barra)) {
      alert("El código de barras ya existe en la lista");
      return;
    }

    const barcodePattern = /^\d+$/;
    if (!barcodePattern.test(product.codigo_de_barra)) {
      alert("El código de barras debe contener solo números");
      return;
    }

    // Agregar producto y limpiar formulario
    setProducts([...products, productData]);
    setProduct(initialProductState);
  };

  const handleDelete = (barcode) => {
    // Mostrar una alerta de confirmación
    const confirmDelete = window.confirm(
      "¿Seguro que desea eliminar este producto?"
    );

    // Si el usuario confirma la eliminación, proceder con la eliminación
    if (confirmDelete) {
      // Filtrar los productos para obtener una nueva lista sin el producto a eliminar
      const updatedProducts = products.filter(
        (prod) => prod.codigo_de_barra !== barcode
      );

      // Actualizar el estado de products con la nueva lista de productos
      setProducts(updatedProducts);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null); // Al cancelar la edición, simplemente establece el índice de edición en null
  };

  const handleWeightChange = (e, index) => {
    const newWeight = e.target.value;
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index].kg = newWeight;
      return updatedProducts;
    });
  };

  const handleTropaChange = (e, index) => {
    const newTropa = e.target.value;
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index].tropa = newTropa;
      return updatedProducts;
    });
  };

  const handleSaveChanges = (index) => {
    // Aquí puedes hacer cualquier cosa necesaria antes de guardar los cambios
    // Después de que se hayan guardado los cambios, establece el índice de edición en null
    setEditingIndex(null);
  };

  const handleProductDoubleClick = async (product) => {
    const productResponse = await fetch(
      `${apiUrl}/productos/${product.codigo_de_barra}/barra`,
      {
        credentials: "include",
      }
    );
    const productData = await productResponse.json();

    // Verificar si el producto existe en la base de datos
    if (!productData) {
      setModal(true);
      return;
    }

    // Validar los datos del formulario antes de guardar
    const formFields = ["codigo_de_barra"];
    if (formFields.some((field) => !product[field])) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Verificar si el producto existe en la base de datos
    // if (productData.sucursal_id !== 18) {
    //   alert("El producto ya no se encuentra en stock");
    //   return;
    // }

    const excludedSucursales = [18, 32];
    if (!excludedSucursales.includes(productData.sucursal_id)) {
      alert("El producto ya no se encuentra en stock");
      return;
    }

    const existingProductIndex = products.findIndex(
      (prod) => prod.codigo_de_barra === productData.codigo_de_barra
    );

    // Verificar si el código de barras ya existe en la lista
    if (existingProductIndex !== -1) {
      alert("El código de barras ya existe en la lista");
      return;
    }

    // Verificar si el código de barras solo contiene números
    const barcodePattern = /^\d+$/;
    if (!barcodePattern.test(product.codigo_de_barra)) {
      alert("El código de barras debe contener solo números");
      return;
    }

    // Agregar el producto a la lista de productos y limpiar el formulario
    setProducts([...products, productData]);
    setProduct(initialProductState);
    toggleModal(); // Cierra el modal después de agregar el producto
  };

  const handleSort = (columnName) => {
    // Cambiar la dirección de orden si la columna es la misma que la columna actualmente ordenada
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );

    // Actualizar la columna actualmente ordenada
    setSortColumn(columnName);

    // Ordenar los productos
    const sortedProducts = [...availableProducts].sort((a, b) => {
      const valueA = a[columnName];
      const valueB = b[columnName];

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setAvailableProducts(sortedProducts);
  };

  // Cálculo de la paginación para modal
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  // Reiniciar la página al aplicar un filtro
  useEffect(() => {
    if (searchMedia || searchPeso || searchTropa || searchGarron) {
      setCurrentPage(1);
    }
  }, [searchMedia, searchPeso, searchTropa, searchGarron]);

  // Cálculo de la paginación para modal después de filtrar
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredProducts.length / productsPerPage);
    // i <= Math.ceil(currentFilteredProducts.length / productsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Cálculo de la paginación para Ordenes
  const indexOfLastProductOrder = currentPageOrder * productsPerPageOrder;
  const indexOfFirstProductOrder =
    indexOfLastProductOrder - productsPerPageOrder;
  const currentProductsOrder = [...products]
    .reverse()
    .slice(indexOfFirstProductOrder, indexOfLastProductOrder);

  const pageNumbersOrder = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPageOrder); i++) {
    pageNumbersOrder.push(i);
  }

  const paginateOrder = (pageNumberOrder) =>
    setCurrentPageOrder(pageNumberOrder);

  return (
    <Container className="d-flex flex-column align-items-center">
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Buscar Producto</ModalHeader>
        <ModalBody>
          <div className="mb-3 d-flex justify-content-center align-items-center">
            <FormControl
              type="text"
              placeholder="Número"
              className="mr-2"
              value={searchMedia}
              onChange={(e) => setSearchMedia(e.target.value)}
            />

            <FormControl
              type="text"
              placeholder="Peso"
              className="mr-2"
              value={searchPeso}
              onChange={(e) => setSearchPeso(e.target.value)}
            />

            <FormControl
              type="text"
              placeholder="Tropa"
              className="mr-2"
              value={searchTropa}
              onChange={(e) => setSearchTropa(e.target.value)}
            />

            <FormControl
              type="text"
              placeholder="Garron"
              className="mr-2"
              value={searchGarron}
              onChange={(e) => setSearchGarron(e.target.value)}
            />
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Subcategoria</th>

                <th
                  onClick={() => handleSort("num_media")}
                  style={{ cursor: "pointer" }}
                >
                  Numero de Media
                </th>
                <th
                  onClick={() => handleSort("kg")}
                  style={{ cursor: "pointer" }}
                >
                  Peso
                </th>
                <th
                  onClick={() => handleSort("tropa")}
                  style={{ cursor: "pointer" }}
                >
                  Tropa
                </th>
                <th
                  onClick={() => handleSort("garron")}
                  style={{ cursor: "pointer" }}
                >
                  Garron
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr
                  key={product.id}
                  onDoubleClick={() => handleProductDoubleClick(product)}
                >
                  <td>{product.categoria_producto}</td>
                  <td>{product.subcategoria}</td>
                  <td>{product.num_media}</td>
                  <td>{product.kg}</td>
                  <td>{product.tropa}</td>
                  <td>{product.garron}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <div className="d-flex">
            {pageNumbers.map((number) => (
              <Button
                key={number}
                onClick={() => paginate(number)}
                className="mx-1 btn btn-primary" // Agrega las clases btn y btn-primary
              >
                {number}
              </Button>
            ))}
          </div>
          <Button color="secondary" onClick={toggleModal}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
      <h1 className="my-form-title text-center">
        {/* {editing ? "Editar Orden" : "Agregar Orden"} */}
        Agregar Orden
      </h1>
      <Form
        className="w-50"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Previene el comportamiento predeterminado del Enter
            handleSave(); // Ejecuta la función handleSave cuando se presiona Enter
          }
        }}
      >
        <Form.Group
          controlId="formSucursalDestino"
          className="mb-3 text-center"
        >
          <Form.Select
            name="sucursal_destino"
            value={selectedBranchId} // Usa el estado seleccionado
            onChange={handleChange}
            className="my-input custom-style-select"
            size="lg"
          >
            <option value="">Seleccione una sucursal</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3 justify-content-center">
          <Form.Label>Fecha de la Orden</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="my-input-date" // Clase personalizada
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Codigo de barra</Form.Label>
          <Form.Control
            type="text"
            name="codigo_de_barra"
            value={product.codigo_de_barra}
            onChange={handleChange}
            placeholder="Ingresa el codigo de barra y presione ENTER"
            className="my-input"
            ref={codigoDeBarraRef}
            // onBlur={handleSave} // Procesa el guardado al salir del campo
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Previene el comportamiento predeterminado de recargar la página
                handleSave(); // Procesa el guardado al presionar Enter
              }
            }}
          />
        </Form.Group>

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
          {currentProductsOrder.map((product, index) => (
            <tr key={product.codigo_de_barra}>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>{product.precio}</td>
              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="number"
                    value={product.kg}
                    onChange={(e) => handleWeightChange(e, index)}
                    min="0" // Establecer el valor mínimo como 0
                  />
                ) : (
                  product.kg
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="number"
                    value={product.tropa}
                    onChange={(e) => handleTropaChange(e, index)}
                    min="0" // Establecer el valor mínimo como 0
                  />
                ) : (
                  product.tropa
                )}
              </td>
              <td className="text-center">
                {/* Renderizado condicional para mostrar botones de editar o guardar/cancelar */}
                {editingIndex === index ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <Button
                      variant="primary"
                      // onClick={() => handleEdit(index)}
                      onClick={() => handleSaveChanges(index)} // Modifica la función de guardar cambios para pasar el índice
                      className="mx-2"
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCancelEdit}
                      className="mx-2"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center align-items-center">
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(product.codigo_de_barra)}
                      className="mx-2"
                    >
                      Eliminar
                    </Button>
                    {context.user && context.user.usuario === "admin" && (
                      <Button
                        variant="primary"
                        onClick={() => handleEdit(index)}
                        className="mx-2"
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                )}
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
        {pageNumbersOrder.map((numberOrder) => (
          <Button
            key={numberOrder}
            onClick={() => paginateOrder(numberOrder)}
            className="mx-1" // Agrega una pequeña separación horizontal entre los botones
          >
            {numberOrder}
          </Button>
        ))}
      </div>
      <CategorySummaryTable filteredProducts={products} />
    </Container>
  );
}
