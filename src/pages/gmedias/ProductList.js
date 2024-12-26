import { useEffect, useState ,useCallback} from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
// import { parse } from "date-fns";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchBarra, setSearchBarra] = useState("");
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchCategoria, setSearchCategoria] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(14);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ordenamiento
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  // Función para cargar sucursales
  const loadBranches = useCallback(async () => {
    const res = await fetch(`${apiUrl}/sucursales/`, {
      credentials: "include",
    });
    const data = await res.json();
    setBranches(data);
  },[apiUrl]);

  // Función para cargar clientes
  const loadCustomers = useCallback(async () => {
    const res = await fetch(`${apiUrl}/clientes/`, {
      credentials: "include",
    });
    const data = await res.json();
    setCustomers(data);
  },[apiUrl]);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/productos/`, {
        credentials: "include",
      });
      const data = await res.json();

      // Mapear los productos y ajustar la fecha de creación según las condiciones
      const modifiedProducts = await Promise.all(
        data.map(async (product, index) => {
          try {
            // Si la propiedad order_id es mayor a 1, obtener la fecha de la orden
            if (product.orden_id !== null) {
              const orderCreatedAtRes = await fetch(
                `${apiUrl}/ordenes/${product.orden_id}/fecha-creacion`,
                {
                  credentials: "include",
                }
              );
              const orderCreatedAtData = await orderCreatedAtRes.json();
              product.fecha = orderCreatedAtData;
            }
            // Si la propiedad venta_id es distinta de null, obtener la fecha de la venta
            if (product.venta_id !== null) {
              const saleCreatedAtRes = await fetch(
                `${apiUrl}/ventas/${product.venta_id}/fecha-creacion`,
                {
                  credentials: "include",
                }
              );
              const saleCreatedAtData = await saleCreatedAtRes.json();
              product.fecha = saleCreatedAtData;
            }

            // En otros casos, mantener la fecha de creación del producto
            return product;
          } catch (error) {
            console.error(`Error al procesar producto ${index + 1}:`, error);
            // Si hay un error, devolver el producto sin modificar
            return product;
          }
        })
      );

      // Ordenar los productos
      const sortedProducts = modifiedProducts.sort((a, b) => a.id - b.id);

      // Establecer los productos y los productos filtrados
      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  },[apiUrl]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/productos/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.mensaje);
      } else {
        setProducts(products.filter((product) => product.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = useCallback(() => {
    const searchTermLower = searchBarra.toLowerCase();
    const startDateFilter = startDate ? new Date(startDate) : null;
    const endDateFilter = endDate ? new Date(endDate) : null;
  
    if (
      searchTermLower === "" &&
      searchMedia === "" &&
      searchPeso === "" &&
      searchTropa === "" &&
      searchCategoria === "" &&
      searchSucursal === "" &&
      !startDate &&
      !endDate
    ) {
      // No hay criterios de búsqueda. Mostrar todos los productos.
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        const codigoMatch = product.codigo_de_barra.toLowerCase().includes(searchTermLower);
        const mediaMatch = product.num_media.toString().includes(searchMedia);
        const pesoMatch = product.kg.toString().includes(searchPeso);
        const tropaMatch = product.tropa.toString().includes(searchTropa);
        const categoriaMatch = product.categoria_producto.toString().includes(searchCategoria);
        const sucursalMatch = branches
          .find((branch) => branch.id === product.sucursal_id)
          ?.nombre.toLowerCase()
          .includes(searchSucursal.toLowerCase());
  
        // Convertir la fecha de creación al formato de objeto Date si es necesario
        const productDate = new Date(product.fecha);
  
        // Verificar si la fecha de creación está dentro del rango especificado
        const startDateMatch = !startDateFilter || productDate >= startDateFilter;
        const endDateMatch = !endDateFilter || productDate <= endDateFilter;
  
        return (
          codigoMatch &&
          mediaMatch &&
          pesoMatch &&
          tropaMatch &&
          categoriaMatch &&
          sucursalMatch &&
          startDateMatch &&
          endDateMatch
        );
      });
  
      setFilteredProducts(filtered);
    }
  }, [
    searchBarra,
    searchMedia,
    searchPeso,
    searchTropa,
    searchCategoria,
    searchSucursal,
    startDate,
    endDate,
    products,
    branches
  ]); // Asegúrate de incluir todas las dependencias relevantes aquí.
  

  const handleSort = (columnName) => {
    // Cambiar la dirección de orden si la columna es la misma que la columna actualmente ordenada
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );

    // Actualizar la columna actualmente ordenada
    setSortColumn(columnName);

    const sortedProducts = [...filteredProducts].sort((a, b) => {
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

    setFilteredProducts(sortedProducts);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredProducts.length / productsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    loadProducts();
    loadBranches();
    loadCustomers();
  }, [loadProducts,loadBranches,loadCustomers]);

  useEffect(() => {
    handleSearch();
  }, [
    searchBarra,
    searchMedia,
    searchPeso,
    searchTropa,
    searchCategoria,
    searchSucursal,
    startDate,
    endDate,
    handleSearch
  ]);

  const categorySummary = filteredProducts.reduce((summary, product) => {
    // console.log("filered",filteredProducts)
    const category = product.categoria_producto;
    const peso = parseFloat(product.kg);
    const costo = parseFloat(product.costo);

    if (!summary[category]) {
      summary[category] = {
        cantidad: 0,
        pesoTotal: 0,
        costoTotal: 0, // Agregamos el costo total inicialmente como cero
      };
    }

    summary[category].cantidad += 1;
    summary[category].pesoTotal += peso;

    // Verificar si el peso y el costo son válidos antes de sumarlos
    if (!isNaN(peso) && !isNaN(costo) && peso !== 0 && costo !== 0) {
      // console.log("sumary", summary[category].pesoTotal, peso)
      summary[category].costoTotal += peso * costo; // Sumamos el costo total
    }

    return summary;
  }, {});


  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos</h1>
      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
      </div>

      <div className="mb-3 d-flex justify-content-center align-items-center">
        <FormControl
          type="text"
          placeholder="Filtrar por código de barras"
          className="mr-2"
          value={searchBarra}
          onChange={(e) => setSearchBarra(e.target.value)}
        />

        <FormControl
          type="text"
          placeholder="Filtrar por número de media"
          className="mr-2"
          value={searchMedia}
          onChange={(e) => setSearchMedia(e.target.value)}
        />

        <FormControl
          type="text"
          placeholder="Filtrar por peso"
          className="mr-2"
          value={searchPeso}
          onChange={(e) => setSearchPeso(e.target.value)}
        />

        <FormControl
          type="text"
          placeholder="Filtrar por tropa"
          className="mr-2"
          value={searchTropa}
          onChange={(e) => setSearchTropa(e.target.value)}
        />

        <FormControl
          type="text"
          placeholder="Filtrar por Sucursal"
          className="mr-2"
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
        />

        <FormControl
          type="text"
          placeholder="Filtrar por Categoria"
          className="mr-2"
          value={searchCategoria}
          onChange={(e) => setSearchCategoria(e.target.value)}
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th
              onClick={() => handleSort("fecha")}
              style={{ cursor: "pointer" }}
            >
              Fecha
            </th>
            <th
              onClick={() => handleSort("categoria_producto")}
              style={{ cursor: "pointer" }}
            >
              Categoria
            </th>
            <th
              onClick={() => handleSort("subcategoria")}
              style={{ cursor: "pointer" }}
            >
              Subcategoria
            </th>
            <th
              onClick={() => handleSort("num_media")}
              style={{ cursor: "pointer" }}
            >
              Numero de Media
            </th>
            <th
              onClick={() => handleSort("garron")}
              style={{ cursor: "pointer" }}
            >
              Garron
            </th>
            <th
              onClick={() => handleSort("precio")}
              style={{ cursor: "pointer" }}
            >
              Precio
            </th>
            <th
              onClick={() => handleSort("costo")}
              style={{ cursor: "pointer" }}
            >
              Costo
            </th>
            <th onClick={() => handleSort("kg")} style={{ cursor: "pointer" }}>
              Peso
            </th>
            <th
              onClick={() => handleSort("tropa")}
              style={{ cursor: "pointer" }}
            >
              Tropa
            </th>
            <th
              onClick={() => handleSort("sucursal")}
              style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
            <th
              onClick={() => handleSort("cliente")}
              style={{ cursor: "pointer" }}
            >
              Cliente
            </th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              {/* <td>{product.fecha}</td> */}
              <td>{product.fecha}</td>
              <td>{product.categoria_producto}</td>
              <td>{product.subcategoria}</td>
              {/* <td>{product.codigo_de_barra}</td> */}
              <td>{product.num_media}</td>
              <td>{product.garron}</td>
              <td>{product.precio}</td>
              <td>{product.costo}</td>
              <td>{product.kg}</td>
              <td>{product.tropa}</td>
              <td>
                {branches.find((branch) => branch.id === product.sucursal_id)
                  ?.nombre || "Sucursal Desconocida"}
              </td>
              <td>
                {customers.find(
                  (customer) => customer.id === product.cliente_id
                )?.nombre || "Cliente Desconocido"}
              </td>
              <td className="text-center">
                <div className="d-flex justify-content-center align-items-center">
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(product.id)}
                    className="mx-2"
                  >
                    Eliminar
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                  >
                    Editar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(filteredProducts.length / productsPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(filteredProducts.length / productsPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
      <div style={{ maxWidth: "25%", marginTop: "20px" }}>
        {/* Añade un estilo inline para limitar el ancho de la tabla */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Kg</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(categorySummary).map((category) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{categorySummary[category].cantidad}</td>
                <td>
                  {categorySummary[category].pesoTotal}
                </td>
                <td>
                  {categorySummary[category].costoTotal !== 0
                    ? categorySummary[category].costoTotal
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
