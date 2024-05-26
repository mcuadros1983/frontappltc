import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Form,
  Button,
  Table,
  FormControl,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { GenerateReceiptHTML } from "./GenerateReceiptHTML"; // Importa la función de receiptGenerator
import CategorySummaryTable from "../../utils/CategorySummaryTable"; // Importa el componente CategorySummaryTable

export default function SellForm() {
  const toggleModal = () => setModal(!modal);
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
  // const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  // const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [waypays, setWaypays] = useState([]);
  // const [loadingWaypays, setLoadingWaypays] = useState(true);
  const [selectedWaypaysId, setSelectedWaypaysId] = useState("");
  // const [sell, setSell] = useState({
  //   cantidad_total: 0,
  //   peso_total: 0,
  //   cliente_id: "",
  // });
  const [editingIndex, setEditingIndex] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [modal, setModal] = useState(false);
  // const [searchTerm, setSearchTerm] = useState(""); // Define setSearchTerm

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  const [currentPageSell, setCurrentPageSell] = useState(1);
  const [productsPerPageSell] = useState(10);

  // ordenamiento
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // filtros especificos
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchGarron, setSearchGarron] = useState("");

  const [filteredProducts, setFilteredProducts] = useState([]);
  // const [currentFilteredProducts, setCurrentFilteredProducts] = useState([]);

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Aquí puedes realizar las acciones que desees al cerrar la ventana de impresión manualmente
      // Por ejemplo, puedes limpiar el estado o mostrar un mensaje de confirmación al usuario
      // En este caso, puedes limpiar el estado o realizar otras acciones necesarias

      // Para cancelar el cierre de la ventana de impresión, puedes devolver un mensaje
      const confirmationMessage = "¿Estás seguro de que deseas salir?";
      event.returnValue = confirmationMessage; // Muestra un mensaje de confirmación al usuario
      return confirmationMessage; // Devuelve el mensaje de confirmación
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${apiUrl}/clientes`, {
          credentials: "include",
        });
        const data = await response.json();
        const sortedCustomers = data.sort((a, b) => {
          if (a.nombre === "CENTRAL") return -1;
          if (b.nombre === "CENTRAL") return 1;
          return a.nombre.localeCompare(b.nombre);
        });
        setCustomers(sortedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    const fetchWaypays = async () => {
      try {
        const response = await fetch(`${apiUrl}/formas-pago`, {
          credentials: "include",
        });
        const data = await response.json();
        setWaypays(data);
      } catch (error) {
        console.error("Error fetching Way Pays:", error);
      } 
    };

    fetchCustomers();
    fetchWaypays();
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
  }, [modal,apiUrl]);

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

  // useEffect(() => {
  //   if (filteredProducts) {
  //     const indexOfLastProduct = currentPage * productsPerPage;
  //     const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  //     const paginatedProducts = filteredProducts.slice(
  //       indexOfFirstProduct,
  //       indexOfLastProduct
  //     );
  //     setCurrentFilteredProducts(paginatedProducts);
  //   }
  // }, [filteredProducts, currentPage, productsPerPage]);

  // Función para manejar la venta exitosa y realizar la impresión del recibo
  const handleVentaExitosa = async (venta, productos) => {
    // setVentaExitosa(true); // Establecer ventaExitosa en true

    try {

      // Obtener el nombre del cliente
      const cliente = customers.find(
        (customer) => customer.id === venta.cliente_id
      );
      const nombreCliente = cliente ? cliente.nombre : "Cliente Desconocido";

      // Obtener el nombre de la forma de pago
      const formaPago = waypays.find(
        (waypay) => waypay.id === venta.formaPago_id
      );
      const nombreFormaPago = formaPago
        ? formaPago.tipo
        : "Forma de Pago Desconocida";

      // Generar el contenido HTML del comprobante
      const receiptHTML = GenerateReceiptHTML(
        venta,
        productos,
        nombreCliente,
        nombreFormaPago
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
    if (!selectedCustomerId) {
      alert("Por favor, seleccione un cliente antes de grabar.");
      return;
    }

    if (!selectedWaypaysId) {
      alert("Por favor, seleccione una forma de pago antes de grabar.");
      return;
    }

    if (selectedCustomerId === 1) {
      alert("No se pueden hacer ventas a la central, cambie de cliente.");
      return;
    }

    // Verificar si algún producto tiene peso menor o igual a cero
    if (products.some((product) => product.kg <= 0)) {
      alert("Debe ingresar el peso para todos los productos.");
      return;
    }

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas grabar esta venta?"
    );
    if (!confirmDelete) {
      return;
    }

    const cantidad_total = products.length;
    const peso_total = products.reduce(
      (acum, product) => acum + Number(product.kg),
      0
    );

    try {
      const response = await fetch(`${apiUrl}/ventas`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({
          cantidad_total,
          peso_total,
          cliente_id: selectedCustomerId,
          formaPago_id: selectedWaypaysId,
          productos: products,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          "Error al realizar la venta. Intente nuevamente más tarde."
        );
      }

      const data = await response.json();

      // Llamar a la función handleVentaExitosa después de que la venta sea exitosa
      handleVentaExitosa(data.nuevaVenta, data.productosActualizados);
      navigate("/sells");
    } catch (error) {
      console.error("Error al realizar la venta:", error.message);
      alert(
        "Ocurrió un error al realizar la venta. Intente nuevamente más tarde."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: name === "kg" ? Number(value) : value,
    });

    if (name === "cliente_destino" && codigoDeBarraRef.current) {
      setSelectedCustomerId(value);
      codigoDeBarraRef.current.focus();
    }

    if (name === "tipo") {
      setSelectedWaypaysId(value);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault()
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

    const formFields = ["codigo_de_barra"];
    if (formFields.some((field) => !product[field])) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (productData.sucursal_id !== 18) {
      alert("El producto ya no se encuentra en stock");
      return;
    }

    const existingProductIndex = products.findIndex(
      (prod) => prod.codigo_de_barra === productData.codigo_de_barra
    );

    if (existingProductIndex !== -1) {
      alert("El código de barras ya existe en la lista");
      return;
    }

    const barcodePattern = /^\d+$/;
    if (!barcodePattern.test(product.codigo_de_barra)) {
      alert("El código de barras debe contener solo números");
      return;
    }

    //Obtener cliente
    const res = await fetch(
      `${apiUrl}/clientes/${selectedCustomerId}`,
      {
        credentials: "include",
      }
    );
    const cliente = await res.json();

    if (
      !productData.precio &&
      cliente.margen &&
      productData.costo &&
      productData.categoria_producto === "bovino"
    ) {
      productData.precio = (1 + cliente.margen / 100) * productData.costo;
    }
    setProducts([...products, productData]);
    setProduct(initialProductState);
  };

  const handleDelete = (barcode) => {
    const confirmDelete = window.confirm(
      "¿Seguro que desea eliminar este producto?"
    );

    if (confirmDelete) {
      const updatedProducts = products.filter(
        (prod) => prod.codigo_de_barra !== barcode
      );

      setProducts(updatedProducts);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handlePriceChange = (e, index) => {
    const newPrice = e.target.value;
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index].precio = newPrice;
      return updatedProducts;
    });
  };

  const handleWeightChange = (e, index) => {
    const newWeight = e.target.value;
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index].kg = newWeight;
      return updatedProducts;
    });
  };

  const handleSaveEdit = (index) => {
    // Aquí puedes agregar la lógica para guardar los cambios del producto editado
    setEditingIndex(null); // Una vez guardado, establece el índice de edición en null
  };

  const handleCancelEdit = () => {
    setEditingIndex(null); // Al cancelar la edición, simplemente establece el índice de edición en null
  };

  const handleSetPigPrice = () => {
    const pigPrice = prompt("Ingrese el precio del cerdo:");
    if (pigPrice === null) return; // Si el usuario cancela el prompt, no hacemos nada
    const numericPigPrice = parseFloat(pigPrice);
    if (!isNaN(numericPigPrice)) {
      // Verificar si el valor ingresado es un número válido
      const updatedProducts = products.map((prod) =>
        prod.categoria_producto === "porcino"
          ? { ...prod, precio: numericPigPrice }
          : prod
      );
      setProducts(updatedProducts);
    } else {
      alert("Por favor, ingrese un precio válido para el cerdo.");
    }
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
    if (productData.sucursal_id !== 18) {
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
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredProducts.length / productsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Cálculo de la paginación para Ordenes
  const indexOfLastProductSell = currentPageSell * productsPerPageSell;
  const indexOfFirstProductSell = indexOfLastProductSell - productsPerPageSell;
  const currentProductsSell = products.slice(
    indexOfFirstProductSell,
    indexOfLastProductSell
  );
  const pageNumbersSell = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPageSell); i++) {
    pageNumbersSell.push(i);
  }

  const paginateSell = (pageNumberSell) => setCurrentPageSell(pageNumberSell);

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
                <th>Categoría</th>

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
      <h1 className="my-form-title text-center">Ventas</h1>
      <Form onSubmit={handleSave} className="w-50">
        <Form.Group className="mb-3 text-center">
          {/* <Form.Label className="px-2">Seleccione el cliente</Form.Label> */}
          <Form.Select
            name="cliente_destino"
            value={selectedCustomerId}
            onChange={handleChange}
            className="my-input custom-style-select"
            size="lg"
          >
            <option value="">Seleccione un cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3 text-center">
          {/* <Form.Label className="px-2">Seleccione una forma de pago</Form.Label> */}
          <Form.Select
            name="tipo"
            value={selectedWaypaysId}
            onChange={handleChange}
            className="my-input custom-style-select"
            size="lg"
          >
            <option value="">Seleccione una forma de pago</option>
            {waypays.map((waypay) => (
              <option key={waypay.id} value={waypay.id}>
                {waypay.tipo}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Codigo de barra</Form.Label>
          <Form.Control
            type="text"
            name="codigo_de_barra"
            value={product.codigo_de_barra}
            onChange={handleChange}
            placeholder="Ingresa el codigo de barra"
            className="my-input"
            ref={codigoDeBarraRef}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="button"
          onClick={handleSave}
          // disabled={loading}
          style={{ position: "relative" }}
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
            <th>Tropa</th>
            <th>Categoria</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProductsSell.map((product, index) => (
            <tr key={product.codigo_de_barra}>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="number"
                    value={product.precio}
                    onChange={(e) => handlePriceChange(e, index)}
                    min="0" // Establecer el valor mínimo como 0
                  />
                ) : (
                  product.precio
                )}
              </td>
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
              <td>{product.tropa}</td>
              <td>{product.categoria_producto}</td>
              <td className="text-center">
                {/* Renderizado condicional para mostrar botones de editar o guardar/cancelar */}
                {editingIndex === index ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <Button
                      variant="primary"
                      onClick={() => handleSaveEdit(index)}
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
                    <Button
                      variant="primary"
                      onClick={() => handleEdit(index)}
                      className="mx-2"
                    >
                      Editar
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="py-2">
        <Button variant="primary" onClick={handleSubmit}>
          Grabar
        </Button>
        <Button
          variant="secondary"
          onClick={handleSetPigPrice}
          className="mx-2"
          disabled={
            !products.some((prod) => prod.categoria_producto === "porcino")
          }
        >
          Asignar precio Cerdo
        </Button>
      </div>
      <div>
        {pageNumbersSell.map((numberSell) => (
          <Button
            key={numberSell}
            onClick={() => paginateSell(numberSell)}
            className="mx-1" // Agrega una pequeña separación horizontal entre los botones
          >
            {numberSell}
          </Button>
        ))}
      </div>
      {/* Agregar el componente CategorySummaryTable aquí */}
      <CategorySummaryTable filteredProducts={products} />
    </Container>
  );
}
