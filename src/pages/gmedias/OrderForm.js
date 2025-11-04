import React, { useContext, useEffect, useState, useRef } from "react";
import { Container, Form, Button, Table, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { GenerateReceiptOrderHTML } from "./GenerateReceiptOrderHTML";
import CategorySummaryTable from "../../utils/CategorySummaryTable";
import Contexts from "../../context/Contexts";

export default function OrderForm() {
  const context = useContext(Contexts.UserContext);

  // "vacuno" = comportamiento original
  // "cerdo"  = nueva lógica de carga manual porcino
  const [orderMode, setOrderMode] = useState("vacuno");

  const codigoDeBarraRef = useRef(null);

  const initialProductState = {
    codigo_de_barra: "",
    num_media: "",
    kg: "",
    tropa: "",
    garron: "",
    categoria_producto: "",
    subcategoria: "",
  };

  const [product, setProduct] = useState(initialProductState);
  const [products, setProducts] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modal, setModal] = useState(false);

  // paginación (modal de selección de producto existente)
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  // paginación (tabla de productos ya agregados a la orden)
  const [currentPageOrder, setCurrentPageOrder] = useState(1);
  const [productsPerPageOrder] = useState(10);

  // ordenamiento (modal)
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // filtros en modal
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchGarron, setSearchGarron] = useState("");

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]); // YYYY-MM-DD
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadAllProducts, setLoadAllProducts] = useState(true);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Helper: reinicia todo cada vez que cambiás de modo (vacuno <-> cerdo)
  const resetForMode = (mode) => {
    // limpia lista que se va a enviar al backend
    setProducts([]);
    // resetea la paginación visual de la tabla
    setCurrentPageOrder(1);

    // resetea el form de carga rápida
    if (mode === "cerdo") {
      setProduct({
        ...initialProductState,
        categoria_producto: "porcino",
        subcategoria: "cerdo",
      });
    } else {
      setProduct(initialProductState);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      // al cerrar el modal se restauran las listas
      setFilteredProducts(availableProducts);
      setLoadAllProducts(true);
    }
    setSearchMedia("");
    setSearchPeso("");
    setSearchTropa("");
    setSearchGarron("");
    setCurrentPage(1); // Reiniciar a la primera página
  };

  // ==========================
  // FETCH SUCURSALES
  // ==========================
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
  

  // ==========================
  // FETCH PRODUCTOS (solo modo vacuno)
  // ==========================
  useEffect(() => {
    if (orderMode === "cerdo") return; // en cerdo no traemos catálogo de stock existente

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/productos`, {
          credentials: "include",
        });
        const data = await response.json();
        // Sólo productos con sucursal_id === 18 (stock disponible)
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
  }, [modal, apiUrl, loadAllProducts, orderMode]);

  // ==========================
  // FILTROS DEL MODAL
  // ==========================
  useEffect(() => {
    const filtered = availableProducts.filter((p) => {
      const numMedia = p.num_media ?? "";
      const kg = p.kg ?? "";
      const tropa = p.tropa ?? "";
      const garron = p.garron ?? "";

      const mediaMatch = numMedia.toString().includes(searchMedia);
      const pesoMatch = kg.toString().includes(searchPeso);
      const tropaMatch = tropa.toString().includes(searchTropa);
      const garronMatch = garron.toString().includes(searchGarron);

      return mediaMatch && pesoMatch && tropaMatch && garronMatch;
    });

    setFilteredProducts(filtered);
  }, [searchMedia, searchPeso, searchTropa, searchGarron, availableProducts]);

  // ==========================
  // IMPRESIÓN / COMPROBANTE
  // ==========================
  const handleOrderExitosa = async (orden, productosRespuesta) => {
    try {
      const sucursal = branches.find(
        (branch) => branch.id === orden.sucursal_id
      );
      const nombreSucursal = sucursal
        ? sucursal.nombre
        : "Sucursal Desconocida";

      const receiptHTML = GenerateReceiptOrderHTML(
        orden,
        productosRespuesta,
        nombreSucursal
      );

      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();

      printWindow.print();
      printWindow.close();
    } catch (error) {
      console.error("Error al imprimir el recibo:", error);
      alert(
        "Ocurrió un error al imprimir el recibo. Intente nuevamente más tarde."
      );
    }
  };

  // ==========================
  // SUBMIT ORDEN
  // ==========================
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

    // validación de kg > 0 sólo aplica para vacuno
    if (
      orderMode === "vacuno" &&
      products.some((p) => Number(p.kg) <= 0)
    ) {
      alert("Debe ingresar el peso para todos los productos.");
      return;
    }

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas grabar esta orden?"
    );
    if (!confirmDelete) return;

    const cantidad_total = products.length;
    const peso_total = products.reduce(
      (acum, p) => acum + Number(p.kg || 0),
      0
    );

    setIsSubmitting(true);

    try {
      const endpoint =
        orderMode === "cerdo"
          ? `${apiUrl}/ordenes/cerdo`
          : `${apiUrl}/ordenes`;

      const res = await fetch(endpoint, {
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

      // backend vacuno devuelve { nuevaOrden, productosActualizados }
      // backend cerdo devuelve   { nuevaOrden, productosCreados }
      const productosRespuesta =
        data.productosActualizados || data.productosCreados || [];

      handleOrderExitosa(data.nuevaOrden, productosRespuesta);

      navigate("/orders");
    } catch (error) {
      console.error("Error al guardar la orden:", error);
      alert("No se pudo guardar la orden");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================
  // CAMBIOS EN INPUTS
  // ==========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sucursal_destino") {
      const numericValue = Number(value);
      setSelectedBranchId(numericValue);

      if (codigoDeBarraRef.current) {
        codigoDeBarraRef.current.focus();
      }
      return;
    }

    // modo cerdo: sincronizamos num_media y codigo_de_barra
    if (orderMode === "cerdo") {
      if (name === "num_media") {
        setProduct((prev) => ({
          ...prev,
          num_media: value,
          codigo_de_barra: value,
          categoria_producto: "porcino",
          subcategoria: "cerdo",
        }));
        return;
      }

      if (name === "codigo_de_barra") {
        setProduct((prev) => ({
          ...prev,
          num_media: value,
          codigo_de_barra: value,
          categoria_producto: "porcino",
          subcategoria: "cerdo",
        }));
        return;
      }
    }

    // default
    setProduct({
      ...product,
      [name]: value,
    });
  };

  // ==========================
  // AGREGAR PRODUCTO A LA LISTA (ENTER / botón agregar)
  // ==========================
  const handleSave = async () => {
    // ----- MODO CERDO: creación manual directa -----
    if (orderMode === "cerdo") {
      const porcinoItem = {
        codigo_de_barra:
          product.codigo_de_barra || product.num_media || "",
        num_media: product.num_media || product.codigo_de_barra || "",
        kg: product.kg || 0,
        tropa: product.tropa || "",
        garron: product.garron || "",
        categoria_producto: "porcino",
        subcategoria: "cerdo",
        precio: 0, // siempre 0
        costo: 0, // siempre 0
        sucursal_id: selectedBranchId
          ? Number(selectedBranchId)
          : undefined,
        fecha,
      };

      // agregamos el producto a la lista local que va a enviarse
      setProducts((prev) => [...prev, porcinoItem]);

      // reseteamos el form con defaults porcino
      setProduct({
        ...initialProductState,
        categoria_producto: "porcino",
        subcategoria: "cerdo",
      });

      return;
    }

    // ----- MODO VACUNO: flujo original -----
    if (!product.codigo_de_barra) {
      alert("El campo código de barra es requerido");
      return;
    }

    // evitar duplicados sólo en vacuno
    if (
      products.some(
        (prod) => prod.codigo_de_barra === product.codigo_de_barra
      )
    ) {
      alert("El código de barras ya existe en la lista");
      return;
    }

    // buscar producto en backend
    const productResponse = await fetch(
      `${apiUrl}/productos/${product.codigo_de_barra}/barra`,
      {
        credentials: "include",
      }
    );
    const productData = await productResponse.json();

    if (!productData) {
      setModal(true); // no existe -> mostrar modal de búsqueda
      return;
    }

    // validar formato numérico del código de barras
    const barcodePattern = /^\d+$/;
    if (!barcodePattern.test(product.codigo_de_barra)) {
      alert("El código de barras debe contener solo números");
      return;
    }

    if (productData.categoria_producto === "bovino") {
      // flujo bovino
      const productResponse2 = await fetch(
        `${apiUrl}/productos/${product.codigo_de_barra}/barra`,
        {
          credentials: "include",
        }
      );
      const productData2 = await productResponse2.json();

      if (!productData2) {
        setModal(true);
        return;
      }

      // validar stock sucursal (solo permitido si está en 18 o 32)
      const excludedSucursales = [18, 32];
      if (!excludedSucursales.includes(productData2.sucursal_id)) {
        alert("El producto ya no se encuentra en stock");
        return;
      }

      setProducts((prev) => [...prev, productData2]);
      setProduct(initialProductState);
    } else if (productData.categoria_producto === "porcino") {
      // flujo porcino *existente* en stock (modo vacuno original)
      // carga múltiple / modal si hay varias coincidencias
      const productsResponse = await fetch(
        `${apiUrl}/productos/${product.codigo_de_barra}/productosbarra`,
        {
          credentials: "include",
        }
      );
      const productsData = await productsResponse.json();

      if (!productsData || productsData.length === 0) {
        setModal(true);
        return;
      }

      // filtrar solo sucursal 18
      const validProducts = productsData.filter(
        (prod) => prod.sucursal_id === 18
      );

      if (validProducts.length > 1) {
        // mostrar modal con sólo esos productos
        setFilteredProducts(validProducts);
        setLoadAllProducts(false);
        setModal(true);
        return;
      }

      if (!productData) {
        setLoadAllProducts(true);
        setModal(true);
        return;
      }

      setProducts((prev) => [...prev, validProducts[0]]);
      setProduct(initialProductState);
    }
  };

  // ==========================
  // ELIMINAR PRODUCTO DE LA LISTA
  // ==========================
  const handleDelete = (idOrIndex) => {
    const confirmDelete = window.confirm(
      "¿Seguro que desea eliminar este producto?"
    );
    if (!confirmDelete) return;

    // En vacuno usamos prod.id.
    // En cerdo (producto recién creado localmente) quizá no hay id → usamos índice.
    setProducts((prev) =>
      prev.filter((prod, idx) => {
        if (prod.id !== undefined) {
          return prod.id !== idOrIndex;
        }
        return idx !== idOrIndex;
      })
    );
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
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
    setEditingIndex(null);
  };

  // ==========================
  // DOUBLE CLICK EN MODAL (solo vacuno)
  // ==========================
  const handleProductDoubleClick = async (rowProduct) => {
    const productResponse = await fetch(
      `${apiUrl}/productos/${rowProduct.id}`,
      {
        credentials: "include",
      }
    );
    const productData = await productResponse.json();

    if (!productData) {
      setModal(true);
      return;
    }

    // validaciones mínimas
    const formFields = ["codigo_de_barra"];
    if (formFields.some((field) => !rowProduct[field])) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // validar stock sucursal (18 o 32)
    const excludedSucursales = [18, 32];
    if (!excludedSucursales.includes(productData.sucursal_id)) {
      alert("El producto ya no se encuentra en stock");
      return;
    }

    // evitar duplicado en la lista vacuno
    const existingProductIndex = products.findIndex(
      (prod) => prod.id === productData.id
    );
    if (existingProductIndex !== -1) {
      alert("El producto ya existe en la lista");
      return;
    }

    const barcodePattern = /^\d+$/;
    if (!barcodePattern.test(rowProduct.codigo_de_barra)) {
      alert("El código de barras debe contener solo números");
      return;
    }

    // agregar producto desde el modal
    setProducts((prev) => [...prev, productData]);
    setProduct(initialProductState);
    toggleModal();
  };

  // ==========================
  // ORDENAMIENTO (modal)
  // ==========================
  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

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

  // ==========================
  // PAGINACIÓN MODAL
  // ==========================
  useEffect(() => {
    if (searchMedia || searchPeso || searchTropa || searchGarron) {
      setCurrentPage(1);
    }
  }, [searchMedia, searchPeso, searchTropa, searchGarron]);

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

  // ==========================
  // PAGINACIÓN LISTA ORDEN (productos cargados)
  // ==========================
  const indexOfLastProductOrder = currentPageOrder * productsPerPageOrder;
  const indexOfFirstProductOrder =
    indexOfLastProductOrder - productsPerPageOrder;
  const currentProductsOrder = [...products]
    .reverse()
    .slice(indexOfFirstProductOrder, indexOfLastProductOrder);

  const pageNumbersOrder = [];
  for (
    let i = 1;
    i <= Math.ceil(products.length / productsPerPageOrder);
    i++
  ) {
    pageNumbersOrder.push(i);
  }

  const paginateOrder = (pageNumberOrder) =>
    setCurrentPageOrder(pageNumberOrder);

  // ==========================
  // RENDER
  // ==========================
  return (
    <Container className="d-flex flex-column align-items-center">
      {/* MODAL BUSCAR PRODUCTO (solo tiene sentido en modo vacuno) */}
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
              {currentProducts.map((p) => (
                <tr
                  key={p.id}
                  onDoubleClick={() => handleProductDoubleClick(p)}
                >
                  <td>{p.categoria_producto}</td>
                  <td>{p.subcategoria}</td>
                  <td>{p.num_media}</td>
                  <td>{p.kg}</td>
                  <td>{p.tropa}</td>
                  <td>{p.garron}</td>
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
                className="mx-1 btn btn-primary"
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

      <h1 className="my-form-title text-center">Agregar Orden</h1>

      {/* Selector de modo de carga */}
      <div className="mb-3 d-flex gap-2">
        <Button
          variant={orderMode === "vacuno" ? "primary" : "outline-primary"}
          onClick={() => {
            setOrderMode("vacuno");
            resetForMode("vacuno");
          }}
        >
          Enviar Vacuno
        </Button>

        <Button
          variant={orderMode === "cerdo" ? "primary" : "outline-primary"}
          onClick={() => {
            setOrderMode("cerdo");
            resetForMode("cerdo");
          }}
        >
          Enviar Cerdo
        </Button>
      </div>

      <Form
        className="w-50"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // evita submit del form
            handleSave(); // agrega producto
          }
        }}
      >
        <Form.Group
          controlId="formSucursalDestino"
          className="mb-3 text-center"
        >
          <Form.Select
            name="sucursal_destino"
            value={selectedBranchId}
            onChange={handleChange}
            className="my-input form-control"
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
            className="my-input form-control"
          />
        </Form.Group>

        {/* Formulario de carga rápida según el modo */}
        {orderMode === "cerdo" ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Número de Media / Código</Form.Label>
              <Form.Control
                type="text"
                name="num_media"
                value={product.num_media}
                onChange={handleChange}
                placeholder="num_media (también será el código de barra)"
                className="my-input"
                ref={codigoDeBarraRef}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Peso (kg)</Form.Label>
              <Form.Control
                type="number"
                name="kg"
                value={product.kg}
                onChange={handleChange}
                className="my-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tropa</Form.Label>
              <Form.Control
                type="text"
                name="tropa"
                value={product.tropa}
                onChange={handleChange}
                className="my-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Garrón</Form.Label>
              <Form.Control
                type="text"
                name="garron"
                value={product.garron}
                onChange={handleChange}
                className="my-input"
              />
            </Form.Group>

            <div className="text-muted small mb-3">
              categoria_producto: porcino / subcategoria: cerdo (automático).
              precio: 0 · costo: 0
            </div>

            <div className="mb-3">
              <Button variant="success" onClick={handleSave}>
                Agregar a la Orden (Cerdo)
              </Button>
            </div>
          </>
        ) : (
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
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </Form.Group>
        )}
      </Form>

      <h1 className="my-list-title dark-text">Productos a agregar</h1>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Codigo de Barra</th>
            <th>Numero de Media</th>

            {orderMode === "vacuno" && <th>Precio</th>}

            <th>Peso</th>
            <th>Numero de Tropa</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProductsOrder.map((p, index) => (
            <tr key={p.codigo_de_barra || p.num_media || index}>
              <td>{p.codigo_de_barra}</td>
              <td>{p.num_media}</td>

              {orderMode === "vacuno" && <td>{p.precio}</td>}

              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="number"
                    value={p.kg}
                    onChange={(e) => handleWeightChange(e, index)}
                    min="0"
                  />
                ) : (
                  p.kg
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="text"
                    value={p.tropa}
                    onChange={(e) => handleTropaChange(e, index)}
                  />
                ) : (
                  p.tropa
                )}
              </td>
              <td className="text-center">
                {editingIndex === index ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <Button
                      variant="primary"
                      onClick={() => handleSaveChanges(index)}
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
                      onClick={() =>
                        handleDelete(
                          p.id !== undefined ? p.id : index
                        )
                      }
                      className="mx-2"
                    >
                      Eliminar
                    </Button>
                    {context.user &&
                      context.user.usuario === "admin" && (
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
          {isSubmitting
            ? "Grabando..."
            : orderMode === "cerdo"
            ? "Grabar (Cerdo)"
            : "Grabar"}
        </Button>
      </div>

      <div>
        {pageNumbersOrder.map((numberOrder) => (
          <Button
            key={numberOrder}
            onClick={() => paginateOrder(numberOrder)}
            className="mx-1"
          >
            {numberOrder}
          </Button>
        ))}
      </div>

      <CategorySummaryTable filteredProducts={products} />
    </Container>
  );
}
