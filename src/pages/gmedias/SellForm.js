import React, { useEffect, useState, useRef } from "react";
import { Container, Form, Button, Table, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { GenerateReceiptHTML } from "./GenerateReceiptHTML"; // Importa la función de receiptGenerator
import CategorySummaryTable from "../../utils/CategorySummaryTable"; // Importa el componente CategorySummaryTable

export default function SellForm() {
  // const toggleModal = () => setModal(!modal);
  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setFilteredProducts(availableProducts);
      setLoadAllProducts(true);
    }
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
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [waypays, setWaypays] = useState([]);
  const [selectedWaypaysId, setSelectedWaypaysId] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [currentPageSell, setCurrentPageSell] = useState(1);
  const [productsPerPageSell] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchGarron, setSearchGarron] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadAllProducts, setLoadAllProducts] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]); // Fecha actual en formato YYYY-MM-DD

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
        const response = await fetch(`${apiUrl}/clientes/`, {
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
        const filteredProducts = data.filter(
          (producto) => producto.sucursal_id === 18
        );
        setAvailableProducts(filteredProducts);
        setFilteredProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (modal && loadAllProducts) {
      fetchProducts();
    }
  }, [modal, apiUrl, loadAllProducts]);

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

    setIsSubmitting(true); // Desactiva el botón

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
          fecha,
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

      handleVentaExitosa(data.nuevaVenta, data.productosActualizados);
      navigate("/sells");
    } catch (error) {
      console.error("Error al realizar la venta:", error.message);
      alert(
        "Ocurrió un error al realizar la venta. Intente nuevamente más tarde."
      );
    } finally {
      setIsSubmitting(false); // Reactiva el botón
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
  const handleSave = async () => {
    if (!product.codigo_de_barra) {
      alert("El campo código de barra es requerido");
      return;
    }

    const productResponse = await fetch(
      `${apiUrl}/productos/${product.codigo_de_barra}/barra`,
      {
        credentials: "include",
      }
    );
    const productData = await productResponse.json();

    // Validar si el producto existe en la base de datos
    // if (!productData) {
    //   setModal(true); // Mostrar modal si no existe
    //   return;
    // }

    if (!productData || productData.sucursal_id === 32) {
      setModal(true); // Mostrar modal si no existe o si la sucursal es 32
      return;
    }
    

    if (productData.categoria_producto === "bovino") {
      // Validar que el producto pertenezca a la sucursal esperada
      // if (productData.sucursal_id !== 18) {
      //   alert("El producto ya no se encuentra en stock");
      //   return;
      // }

      const excludedSucursales = [18, 32];
      if (!excludedSucursales.includes(productData.sucursal_id)) {
        alert("El producto ya no se encuentra en stock");
        return;
      }

      // Verificar si el producto ya está en la lista
      if (products.some((prod) => prod.id === productData.id)) {
        alert("El producto ya existe en la lista");
        return;
      }

      // Verificar si el producto ya está en la lista
      if (products.some((prod) => prod.num_media == productData.num_media)) {
        alert("El producto ya existe en la lista");
        return;
      }


      // Validar que el código de barras sea numérico
      const barcodePattern = /^\d+$/;
      if (!barcodePattern.test(product.codigo_de_barra)) {
        alert("El código de barras debe contener solo números");
        return;
      }

      // Ajustar precio del producto si no tiene asignado
      const res = await fetch(`${apiUrl}/clientes/${selectedCustomerId}/`, {
        credentials: "include",
      });
      const cliente = await res.json();
      console.log("client", cliente)

      // if (
      //   !productData.precio &&
      //   cliente.margen > 0 &&
      //   productData.costo &&
      //   productData.categoria_producto === "bovino"
      // ) {
      //   productData.precio = (1 + cliente.margen / 100) * productData.costo;
      // }

      if (
        cliente?.margen !== undefined &&
        cliente?.margen !== null &&
        cliente?.margen !== 0 &&
        !isNaN(cliente.margen) &&
        productData?.costo !== undefined &&
        productData?.costo !== null &&
        productData?.costo !== 0 &&
        !isNaN(productData.costo)
      ) {
        productData.precio = parseFloat(
          ((1 + Number(cliente.margen) / 100) * Number(productData.costo)).toFixed(2)
        );
      } else {
        productData.precio = productData.precio || 0; // Mantiene el precio actual si no se puede calcular
      }


      // Agregar producto a la lista y resetear el formulario
      setProducts([...products, productData]);
      setProduct(initialProductState);
    } else if (productData.categoria_producto === "porcino") {
      // Lógica para porcino
      const productsResponse = await fetch(
        `${apiUrl}/productos/${product.codigo_de_barra}/productosbarra`,
        {
          credentials: "include",
        }
      );
      const productsData = await productsResponse.json();

      if (!productsData || productsData.length === 0) {
        setModal(true); // Abre el modal si no se encuentran productos
        return;
      }

      const validProducts = productsData.filter(
        (prod) => prod.sucursal_id === 18
      );

      if (validProducts.length > 1) {
        // Mostrar solo los productos coincidentes en el modal
        setFilteredProducts(validProducts);
        setLoadAllProducts(false); // No cargar todos los productos
        setModal(true);
        return;
      }

      if (!productData) {
        setLoadAllProducts(true); // Cargar todos los productos al abrir el modal
        setModal(true);
        return;
      }

      // Agregar el único producto encontrado
      setProducts([...products, validProducts[0]]);
      setProduct(initialProductState);
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que desea eliminar este producto?"
    );

    if (confirmDelete) {
      const updatedProducts = products.filter((prod) => prod.id !== id);

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
  const handleSaveEdit = async (index) => {
    const res = await fetch(`${apiUrl}/clientes/${selectedCustomerId}/`, {
      credentials: "include",
    });
    const cliente = await res.json();
    console.log("client", cliente);
  
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      const product = updatedProducts[index];
  
      if (
        product?.precio === 0 || product?.precio === null || product?.precio === undefined
      ) {
        if (
          cliente?.margen !== undefined &&
          cliente?.margen !== null &&
          cliente?.margen !== 0 &&
          !isNaN(cliente.margen) &&
          product?.costo !== undefined &&
          product?.costo !== null &&
          product?.costo !== 0 &&
          !isNaN(product.costo)
        ) {
          product.precio = parseFloat(
            ((1 + Number(cliente.margen) / 100) * Number(product.costo)).toFixed(2)
          );
        } else {
          product.precio = product.precio || 0;
        }
      }
  
      return updatedProducts;
    });
  
    setEditingIndex(null);
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
    const productResponse = await fetch(`${apiUrl}/productos/${product.id}`, {
      credentials: "include",
    });
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
      (prod) => prod.id === productData.id
    );

    // Verificar si el código de barras ya existe en la lista
    if (existingProductIndex !== -1) {
      alert("El producto ya existe en la lista");
      return;
    }

    // Verificar si el código de barras solo contiene números
    const barcodePattern = /^\d+$/;
    if (!barcodePattern.test(product.codigo_de_barra)) {
      alert("El código de barras debe contener solo números");
      return;
    }

    const cliente = customers.find((customer) => customer.id == selectedCustomerId);
    // Agregar el producto a la lista de productos y limpiar el formulario
    // Calcular precio si se cumplen las condiciones
    if (
      cliente?.margen !== undefined &&
      cliente?.margen !== null &&
      cliente?.margen !== 0 &&
      !isNaN(cliente.margen) &&
      productData?.costo !== undefined &&
      productData?.costo !== null &&
      productData?.costo !== 0 &&
      !isNaN(productData.costo)
    ) {
      productData.precio = parseFloat(
        ((1 + Number(cliente.margen) / 100) * Number(productData.costo)).toFixed(2)
      );
    }

    console.log("data", productData.costo, cliente, selectedCustomerId, customers);


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

  useEffect(() => {
    // Si hay filtros activos, restablece la página a 1
    if (searchMedia || searchPeso || searchTropa || searchGarron) {
      setCurrentPage(1);
    }
  }, [searchMedia, searchPeso, searchTropa, searchGarron]);

  // Cálculo de la paginación para modal (después de filtrar)
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
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
  const currentProductsSell = products.slice(indexOfFirstProductSell, indexOfLastProductSell);

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
        <Form.Group className="mb-3 justify-content-center">
          <Form.Label>Fecha de la Venta</Form.Label>
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
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevenir el comportamiento predeterminado del Enter
                handleSave(); // Procesar automáticamente al presionar Enter
              }
            }}
          />
        </Form.Group>

        {/* <Button
          variant="primary"
          type="button"
          onClick={handleSave}
          // disabled={loading}
          style={{ position: "relative" }}
        >
          Guardar
        </Button> */}
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
                      onClick={() => handleDelete(product.id)}
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
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting || products.length === 0}
        >
          {isSubmitting ? "Grabando..." : "Grabar"}
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
