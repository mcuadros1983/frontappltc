import React, { useEffect, useState, useRef } from "react";
import { Container, Form, Button, Table, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { GenerateReceiptHTML } from "./GenerateReceiptHTML";
import CategorySummaryTable from "../../utils/CategorySummaryTable";

export default function SellForm() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const codigoDeBarraRef = useRef(null);

  // "bovino" => lógica actual
  // "cerdo"  => carga manual de productos nuevos porcinos
  const [saleMode, setSaleMode] = useState("bovino");

  const initialProductState = {
    codigo_de_barra: "",
    num_media: "",
    precio: "",
    kg: "",
    tropa: "",
    garron: "",
    categoria_producto: "",
    subcategoria: "",
  };

  const [product, setProduct] = useState(initialProductState);
  const [products, setProducts] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [waypays, setWaypays] = useState([]);
  const [selectedWaypaysId, setSelectedWaypaysId] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);

  const [availableProducts, setAvailableProducts] = useState([]); // catálogo stock (solo bovino)
  const [modal, setModal] = useState(false);

  // paginación modal
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  // paginación tabla productos en la venta
  const [currentPageSell, setCurrentPageSell] = useState(1);
  const [productsPerPageSell] = useState(10);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // filtros modal
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchGarron, setSearchGarron] = useState("");

  const [filteredProducts, setFilteredProducts] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadAllProducts, setLoadAllProducts] = useState(true);

  // --- cache de num_media de porcino ya existentes en la BD ---
  const [existingPorcinoNumMedias, setExistingPorcinoNumMedias] = useState(new Set());

  // helper para saber si ya lo tenemos en la lista parcial actual
  const localPorcinoNumMedias = new Set(
    products
      .filter((p) => p?.categoria_producto === "porcino" && p?.num_media)
      .map((p) => String(p.num_media))
  );


  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  /**
 * Genera un num_media único considerando:
 * - existentes en DB (existingSet)
 * - existentes en la lista parcial (localSet)
 * Reglas:
 *  - si base no existe -> devuelve base
 *  - si existe -> prueba base+"1"
 *  - si también existe -> base+"2", etc.
 */
  const generateUniqueNumMedia = (base, existingSet, localSet) => {
    if (!base) return "";
    let candidate = String(base);
    let sufijo = 0;

    const taken = (v) =>
      existingSet.has(String(v)) || localSet.has(String(v));

    if (!taken(candidate)) return candidate;

    while (true) {
      sufijo += 1; // 1, 2, 3...
      candidate = `${base}${sufijo}`;
      if (!taken(candidate)) return candidate;
      // seguridad ante loops raros
      if (sufijo > 9999) break;
    }
    return ""; // si no encontró (muy improbable), devolvemos vacío (forzará validación).
  };

  // --- helpers de modo ---
  // const resetForMode = (mode) => {
  //   // limpiar la lista ya armada
  //   setProducts([]);
  //   setCurrentPageSell(1);

  //   if (mode === "cerdo") {
  //     setProduct({
  //       ...initialProductState,
  //       categoria_producto: "porcino",
  //       subcategoria: "cerdo",
  //     });
  //   } else {
  //     setProduct(initialProductState);
  //   }
  // };
  const resetForMode = (mode) => {
    // limpiar la lista ya armada
    setProducts([]);
    setCurrentPageSell(1);

    if (mode === "cerdo") {
      setProduct({
        ...initialProductState,
        categoria_producto: "porcino",
        subcategoria: "cerdo",
      });
      // opcional: no vaciamos existingPorcinoNumMedias (viene de la BD)
    } else {
      setProduct(initialProductState);
    }
  };


  // --- modal toggle ---
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
    setCurrentPage(1);
  };

  // evitar que el usuario salga sin querer (lo dejo igual que tu código original)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const confirmationMessage = "¿Estás seguro de que deseas salir?";
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // clientes y formas de pago
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

  // stock disponible (solo se usa en bovino)
  useEffect(() => {
    if (saleMode === "cerdo") return; // en cerdo no buscamos stock existente
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/productos`, {
          credentials: "include",
        });
        const data = await response.json();

        // stock disponible sucursal 18 PERO solo bovino
        const filtered = data.filter(
          (producto) =>
            producto.sucursal_id === 18 &&
            producto.categoria_producto === "bovino"
        );
        setAvailableProducts(filtered);
        setFilteredProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (modal && loadAllProducts) {
      fetchProducts();
    }
  }, [modal, apiUrl, loadAllProducts, saleMode]);

  // Cargar num_media existentes de porcino desde la BD cuando entro al modo "cerdo"
  useEffect(() => {
    const fetchPorcinoNumMedias = async () => {
      try {
        // Opción A (recomendada): endpoint dedicado super liviano
        // GET /productos/num_media/porcino  ->  ["1001","1002","10021",...]
        let res = await fetch(`${apiUrl}/productos/num_media/porcino`, {
          credentials: "include",
        });

        // Si no existe ese endpoint en tu backend, probamos un fallback genérico
        if (!res.ok) {
          res = await fetch(`${apiUrl}/productos?categoria=porcino`, {
            credentials: "include",
          });
        }

        if (!res.ok) throw new Error("No se pudo obtener num_media porcino");

        const data = await res.json();
        // normalizo a Set de strings
        const nums = new Set(
          (Array.isArray(data) ? data : [])
            .map((x) => (typeof x === "string" ? x : x?.num_media))
            .filter(Boolean)
            .map(String)
        );
        setExistingPorcinoNumMedias(nums);
      } catch (err) {
        console.error("fetchPorcinoNumMedias error:", err);
        setExistingPorcinoNumMedias(new Set()); // fallback vacío
      }
    };

    if (saleMode === "cerdo") {
      fetchPorcinoNumMedias();
    }
  }, [saleMode, apiUrl]);



  // filtros del modal
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

  // impresión
  const handleVentaExitosa = async (venta, productos) => {
    try {
      const cliente = customers.find(
        (customer) => customer.id === venta.cliente_id
      );
      const nombreCliente = cliente
        ? cliente.nombre
        : "Cliente Desconocido";

      const formaPago = waypays.find(
        (waypay) => waypay.id === venta.formaPago_id
      );
      const nombreFormaPago = formaPago
        ? formaPago.tipo
        : "Forma de Pago Desconocida";

      const receiptHTML = GenerateReceiptHTML(
        venta,
        productos,
        nombreCliente,
        nombreFormaPago
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

  // submit venta
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

    if (selectedCustomerId === "1" || selectedCustomerId === 1) {
      alert("No se pueden hacer ventas a la central, cambie de cliente.");
      return;
    }

    if (products.some((p) => Number(p.kg) <= 0)) {
      alert("Debe ingresar el peso para todos los productos.");
      return;
    }

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas grabar esta venta?"
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
        saleMode === "cerdo"
          ? `${apiUrl}/ventas/cerdo`
          : `${apiUrl}/ventas`;

      const response = await fetch(endpoint, {
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
        throw new Error("Error al realizar la venta.");
      }

      const data = await response.json();
      const productosRespuesta =
        data.productosActualizados || data.productosCreados || [];

      handleVentaExitosa(data.nuevaVenta, productosRespuesta);
      navigate("/sells");
    } catch (error) {
      console.error("Error al realizar la venta:", error.message);
      alert(
        "Ocurrió un error al realizar la venta. Intente nuevamente más tarde."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    // selección de cliente => guardo cliente y hago focus al código
    if (name === "cliente_destino") {
      setSelectedCustomerId(value);
      if (codigoDeBarraRef.current) {
        codigoDeBarraRef.current.focus();
      }
      return;
    }

    // selección de forma de pago
    if (name === "tipo") {
      setSelectedWaypaysId(value);
      return;
    }

    // modo cerdo: num_media y codigo_de_barra son el mismo campo espejo
    if (saleMode === "cerdo") {
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
      [name]: name === "kg" ? Number(value) : value,
    });
  };

  // agregar producto a la lista
  const handleSave = async () => {
    if (saleMode === "cerdo") {
      // Validación de campos obligatorios
      if (
        !product.num_media ||
        !product.kg ||
        !product.tropa ||
        !product.garron ||
        Number(product.kg) <= 0
      ) {
        alert("Todos los campos son obligatorios y el peso debe ser mayor a 0.");
        return;
      }

      // BASE: el que ingresó el usuario (también espeja código de barra)
      const baseNum = String(product.num_media).trim();

      // 1) Generar candidato único considerando BD + lista parcial actual
      let candidate = generateUniqueNumMedia(
        baseNum,
        existingPorcinoNumMedias,
        localPorcinoNumMedias
      );

      if (!candidate) {
        alert("No fue posible generar un num_media único. Reintente con otro número.");
        return;
      }

      // 2) Armamos el item con el candidate
      const porcinoItem = {
        codigo_de_barra: candidate,
        num_media: candidate,
        kg: Number(product.kg) || 0,
        tropa: product.tropa || "",
        garron: product.garron || "",
        categoria_producto: "porcino",
        subcategoria: "cerdo",
        precio: 0, // precio inicial 0; luego se puede asignar masivamente
        costo: 0,
        fecha,
      };

      // 3) Evitar duplicados exactos en la lista parcial (por si el usuario cargó igual)
      const alreadyInList = products.some(
        (p) =>
          p?.categoria_producto === "porcino" &&
          String(p?.num_media) === candidate
      );
      if (alreadyInList) {
        // Si justo chocó con otro que acaban de agregar en la UI,
        // intentamos una vuelta más de sufijo para lista local (no toca BD).
        const localOnlySet = new Set([...localPorcinoNumMedias, candidate]);
        const nextCandidate = generateUniqueNumMedia(candidate, new Set(), localOnlySet);
        if (!nextCandidate) {
          alert("El num_media ya está en la lista. Intente con otro.");
          return;
        }
        porcinoItem.codigo_de_barra = nextCandidate;
        porcinoItem.num_media = nextCandidate;
      }

      // 4) Actualizamos lista parcial
      setProducts((prev) => [...prev, porcinoItem]);

      // 5) (Opcional) Actualizamos el Set de BD en memoria con el nuevo candidate,
      //     para minimizar re-consultas al backend en esta misma sesión de carga.
      setExistingPorcinoNumMedias((prev) => {
        const clone = new Set(prev);
        clone.add(porcinoItem.num_media);
        return clone;
      });

      // 6) Reset del form porcino (manteniendo modo y categoría)
      setProduct({
        ...initialProductState,
        categoria_producto: "porcino",
        subcategoria: "cerdo",
      });

      return;
    }


    // saleMode === "bovino": lógica actual
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

    // si no existe o está en sucursal 32 => abrir modal
    if (!productData || productData.sucursal_id === 32) {
      setModal(true);
      return;
    }

    if (productData.categoria_producto === "bovino") {
      // validar sucursal (stock habilitado)
      const excludedSucursales = [18, 32];
      if (!excludedSucursales.includes(productData.sucursal_id)) {
        alert("El producto ya no se encuentra en stock");
        return;
      }

      // evitar duplicados por id / num_media
      if (products.some((prod) => prod.id === productData.id)) {
        alert("El producto ya existe en la lista");
        return;
      }
      if (
        products.some(
          (prod) => prod.num_media == productData.num_media
        )
      ) {
        alert("El producto ya existe en la lista");
        return;
      }

      // validar código de barra numérico
      const barcodePattern = /^\d+$/;
      if (!barcodePattern.test(product.codigo_de_barra)) {
        alert("El código de barras debe contener solo números");
        return;
      }

      // calcular precio según margen del cliente
      const res = await fetch(
        `${apiUrl}/clientes/${selectedCustomerId}/`,
        { credentials: "include" }
      );
      const cliente = await res.json();

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
          (
            (1 + Number(cliente.margen) / 100) *
            Number(productData.costo)
          ).toFixed(2)
        );
      } else {
        productData.precio = productData.precio || 0;
      }

      setProducts((prev) => [...prev, productData]);
      setProduct(initialProductState);
    } else if (productData.categoria_producto === "porcino") {
      // porcino "de stock" cuando estás en modo bovino (puede pasar)
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

      const validProducts = productsData.filter(
        (prod) => prod.sucursal_id === 18
      );

      if (validProducts.length > 1) {
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

  // delete producto de la lista
  const handleDelete = (idOrIndex) => {
    const confirmDelete = window.confirm(
      "¿Seguro que desea eliminar este producto?"
    );
    if (!confirmDelete) return;

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

  const handlePriceChange = (e, index) => {
    const newPrice = e.target.value;
    setProducts((prev) => {
      const updated = [...prev];
      updated[index].precio = newPrice;
      return updated;
    });
  };

  const handleWeightChange = (e, index) => {
    const newWeight = e.target.value;
    setProducts((prev) => {
      const updated = [...prev];
      updated[index].kg = newWeight;
      return updated;
    });
  };

  const handleSaveEdit = async (index) => {
    // recalcular precio si estaba en 0
    const res = await fetch(`${apiUrl}/clientes/${selectedCustomerId}/`, {
      credentials: "include",
    });
    const cliente = await res.json();

    setProducts((prev) => {
      const updated = [...prev];
      const p = updated[index];

      if (
        p?.precio === 0 ||
        p?.precio === null ||
        p?.precio === undefined
      ) {
        if (
          cliente?.margen !== undefined &&
          cliente?.margen !== null &&
          cliente?.margen !== 0 &&
          !isNaN(cliente.margen) &&
          p?.costo !== undefined &&
          p?.costo !== null &&
          p?.costo !== 0 &&
          !isNaN(p.costo)
        ) {
          p.precio = parseFloat(
            (
              (1 + Number(cliente.margen) / 100) * Number(p.costo)
            ).toFixed(2)
          );
        } else {
          p.precio = p.precio || 0;
        }
      }

      return updated;
    });

    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  // asignar precio masivo a todos los porcinos cargados en modo cerdo
  const handleSetPigPrice = () => {
    const pigPrice = prompt("Ingrese el precio del cerdo:");
    if (pigPrice === null) return;
    const numericPigPrice = parseFloat(pigPrice);
    if (!isNaN(numericPigPrice)) {
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

  // doble click desde el modal (solo bovino usa el modal)
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

    const formFields = ["codigo_de_barra"];
    if (formFields.some((field) => !rowProduct[field])) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const excludedSucursales = [18, 32];
    if (!excludedSucursales.includes(productData.sucursal_id)) {
      alert("El producto ya no se encuentra en stock");
      return;
    }

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

    // calcular precio con margen del cliente
    const cliente = customers.find(
      (customer) => customer.id == selectedCustomerId
    );
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
        (
          (1 + Number(cliente.margen) / 100) *
          Number(productData.costo)
        ).toFixed(2)
      );
    }

    setProducts((prev) => [...prev, productData]);
    setProduct(initialProductState);
    toggleModal();
  };

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc"
        ? "desc"
        : "asc"
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

  // paginación modal
  useEffect(() => {
    if (searchMedia || searchPeso || searchTropa || searchGarron) {
      setCurrentPage(1);
    }
  }, [searchMedia, searchPeso, searchTropa, searchGarron]);

  const currentProductsModal = filteredProducts.slice(
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

  // paginación tabla de venta
  const indexOfLastProductSell =
    currentPageSell * productsPerPageSell;
  const indexOfFirstProductSell =
    indexOfLastProductSell - productsPerPageSell;
  const currentProductsSell = products.slice(
    indexOfFirstProductSell,
    indexOfLastProductSell
  );

  const pageNumbersSell = [];
  for (
    let i = 1;
    i <= Math.ceil(products.length / productsPerPageSell);
    i++
  ) {
    pageNumbersSell.push(i);
  }

  const paginateSell = (pageNumberSell) =>
    setCurrentPageSell(pageNumberSell);

  return (
    <Container className="d-flex flex-column align-items-center">
      {/* MODAL solo útil en bovino */}
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
              {currentProductsModal.map((p) => (
                <tr
                  key={p.id}
                  onDoubleClick={() => handleProductDoubleClick(p)}
                >
                  <td>{p.categoria_producto}</td>
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

      <h1 className="my-form-title text-center">Ventas</h1>

      {/* Selector de categoría/mode */}
      <div className="mb-3 d-flex gap-2">
        <Button
          variant={saleMode === "bovino" ? "primary" : "outline-primary"}
          onClick={() => {
            setSaleMode("bovino");
            resetForMode("bovino");
          }}
        >
          Venta Bovino
        </Button>

        <Button
          variant={saleMode === "cerdo" ? "primary" : "outline-primary"}
          onClick={() => {
            setSaleMode("cerdo");
            resetForMode("cerdo");
          }}
        >
          Venta Cerdo
        </Button>
      </div>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="w-50"
      >
        {/* Cliente */}
        <Form.Group className="mb-3 text-center">
          <Form.Select
            name="cliente_destino"
            value={selectedCustomerId}
            onChange={handleChange}
            className="my-input form-control"
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

        {/* Forma de pago */}
        <Form.Group className="mb-3 text-center">
          <Form.Select
            name="tipo"
            value={selectedWaypaysId}
            onChange={handleChange}
            className="my-input form-control"
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

        {/* Fecha */}
        <Form.Group className="mb-3 justify-content-center">
          <Form.Label>Fecha de la Venta</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="my-input form-control"
          />
        </Form.Group>

        {/* Captura del producto */}
        {saleMode === "cerdo" ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Número de Media / Código</Form.Label>
              <Form.Control
                type="text"
                name="num_media"
                value={product.num_media}
                onChange={handleChange}
                placeholder="num_media (también será código de barra)"
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
              Precio inicial: 0
            </div>

            <div className="mb-3">
              <Button variant="success" type="submit">
                Agregar Cerdo
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
            <th>Precio</th>
            <th>Peso</th>
            <th>Tropa</th>
            <th>Categoria</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProductsSell.map((p, index) => (
            <tr
              key={
                p.codigo_de_barra ||
                p.num_media ||
                p.id ||
                `${index}-temp`
              }
            >
              <td>{p.codigo_de_barra}</td>
              <td>{p.num_media}</td>
              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="number"
                    value={p.precio}
                    onChange={(e) => handlePriceChange(e, index)}
                    min="0"
                  />
                ) : (
                  p.precio
                )}
              </td>
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
              <td>{p.tropa}</td>
              <td>{p.categoria_producto}</td>
              <td className="text-center">
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
                      onClick={() =>
                        handleDelete(
                          p.id !== undefined ? p.id : index
                        )
                      }
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
          {isSubmitting
            ? "Grabando..."
            : saleMode === "cerdo"
              ? "Grabar Venta Cerdo"
              : "Grabar Venta"}
        </Button>

        <Button
          variant="secondary"
          onClick={handleSetPigPrice}
          className="mx-2"
          disabled={
            !products.some(
              (prod) => prod.categoria_producto === "porcino"
            )
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
            className="mx-1"
          >
            {numberSell}
          </Button>
        ))}
      </div>

      <CategorySummaryTable filteredProducts={products} />
    </Container>
  );
}
