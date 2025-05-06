import { useEffect, useState, useCallback } from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx"; // Importar la biblioteca xlsx

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchBarra, setSearchBarra] = useState("");
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchCategoria, setSearchCategoria] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  // ordenamiento
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  // Función para cargar sucursales
  const loadBranches = useCallback(async () => {
    const res = await fetch(`${apiUrl}/sucursales/`, {
      credentials: "include",
    });
    const data = await res.json();
    setBranches(data);
  }, [apiUrl]);

  // Función para cargar clientes
  const loadCustomers = useCallback(async () => {
    const res = await fetch(`${apiUrl}/clientes/`, {
      credentials: "include",
    });
    const data = await res.json();
    setCustomers(data);
  }, [apiUrl]);

  // Función para cargar todos los productos
  const loadAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/productos/`, {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []); // Establece los productos
      setFilteredProducts(Array.isArray(data) ? data : []); // También los productos filtrados
    } catch (error) {
      console.error("Error al cargar todos los productos:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const loadProductsByDate = useCallback(async () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecciona ambas fechas antes de buscar.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/productos/fecha`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate }),
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setFilteredProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar productos por fecha:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, startDate, endDate]);

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
      selectedBranches.length === 0 &&
      !startDate &&
      !endDate
    ) {
      // No hay criterios de búsqueda. Mostrar todos los productos.
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        const codigoMatch = product.codigo_de_barra
          ? product.codigo_de_barra.toLowerCase().includes(searchTermLower)
          : true; // Si es null, lo consideramos como coincidencia

        const mediaMatch = product.num_media
          ? product.num_media.toString().includes(searchMedia)
          : true;

        const pesoMatch = product.kg
          ? product.kg.toString().includes(searchPeso)
          : true;

        const tropaMatch = product.tropa
          ? product.tropa.toString().includes(searchTropa)
          : true;

        const categoriaMatch = product.categoria_producto
          ? product.categoria_producto.toString().includes(searchCategoria)
          : true;

        const branchMatch =
          selectedBranches.length === 0 ||
          selectedBranches.includes(String(product.sucursal_id));

        const productDate = product.fecha ? new Date(product.fecha) : null;
        const startDateMatch =
          !startDateFilter || (productDate && productDate >= startDateFilter);
        const endDateMatch =
          !endDateFilter || (productDate && productDate <= endDateFilter);

        return (
          codigoMatch &&
          mediaMatch &&
          pesoMatch &&
          tropaMatch &&
          categoriaMatch &&
          branchMatch &&
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
    selectedBranches,
    startDate,
    endDate,
    products,
  ]);

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
    loadBranches();
    loadCustomers();
  }, [loadBranches, loadCustomers]);

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
    handleSearch,
  ]);

  const categorySummary = filteredProducts.reduce((summary, product) => {
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
    summary[category].pesoTotal += Number(peso);

    // Verificar si el peso y el costo son válidos antes de sumarlos
    if (!isNaN(peso) && !isNaN(costo) && peso !== 0 && costo !== 0) {
      summary[category].costoTotal += Number(peso) * Number(costo); // Sumamos el costo total
    }

    return summary;
  }, {});

  // Función para exportar los productos filtrados a Excel
  const handleExportToExcel = () => {
    const dataToExport = filteredProducts.map((product) => ({
      ID: product.id,
      Fecha: product.fecha,
      Categoría: product.categoria_producto,
      Subcategoría: product.subcategoria,
      "Número de Media": product.num_media,
      Garrón: product.garron,
      Precio: product.precio,
      Costo: product.costo,
      Peso: product.kg,
      Tropa: product.tropa,
      Sucursal:
        branches.find((branch) => branch.id === product.sucursal_id)?.nombre ||
        "Sucursal Desconocida",
      Cliente:
        customers.find((customer) => customer.id === product.cliente_id)
          ?.nombre || "Cliente Desconocido",
      Orden: product.orden_id || "",
      Venta: product.venta_id || "",
      Ingreso: product.ingreso_id || "",
      Mov: product.createdAt
        ? new Date(product.createdAt).toISOString().split("T")[0]
        : "", // Convertir a YYYY-MM-DD
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    // Descargar el archivo Excel
    XLSX.writeFile(workbook, "productos_filtrados.xlsx");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos</h1>
      {/* Botón para exportar a Excel */}
      <div className="mb-3">
        <Button onClick={handleExportToExcel} variant="success">
          Exportar a Excel
        </Button>
      </div>
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

        <Button onClick={loadProductsByDate} variant="primary" className="ml-3">
          Buscar
        </Button>

        <Button onClick={loadAllProducts} variant="secondary" className="ml-2">
          Listar
        </Button>
      </div>
      <div className="mb-3 d-flex justify-content-center align-items-center">
        <FormControl
          type="text"
          placeholder="Código de barras"
          className="mr-2"
          value={searchBarra}
          onChange={(e) => setSearchBarra(e.target.value)}
        />

        <FormControl
          type="text"
          placeholder="Número de media"
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
          placeholder="Categoria"
          className="mr-2"
          value={searchCategoria}
          onChange={(e) => setSearchCategoria(e.target.value)}
        />
      </div>
      <div className="mb-3 d-flex align-items-center">
        <div
          style={{
            minWidth: "200px",
            maxWidth: "300px",
            overflowY: "auto",
            maxHeight: "150px",
          }}
        >
          <FormControl
            as="select"
            multiple
            value={selectedBranches}
            onChange={(e) => {
              const options = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              setSelectedBranches(options);
            }}
            className="form-control"
            style={{
              width: "100%",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflowX: "hidden",
            }}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.nombre}
              </option>
            ))}
          </FormControl>
        </div>
        <Button
          variant="secondary"
          onClick={() => setSelectedBranches([])} // Limpiar la selección
          className="ml-2"
        >
          Limpiar Selección
        </Button>
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
            <th
              onClick={() => handleSort("ingreso_id")}
              style={{ cursor: "pointer" }}
            >
              Ingreso ID
            </th>
            <th>Orden</th>
            <th>Venta</th>
            {/* <th>Mov</th> */}
            <th>ID</th> {/* Nueva columna */}
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product, index) => {
            // Evaluar si el número de media es correlativo
            const previousMedia =
              index > 0
                ? parseInt(currentProducts[index - 1].num_media, 10)
                : null;
            const currentMedia = parseInt(product.num_media, 10);
            const isCorrelative =
              previousMedia !== null &&
              !isNaN(previousMedia) &&
              !isNaN(currentMedia) &&
              currentMedia === previousMedia + 1;

            return (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.fecha}</td>
                
                <td>{product.categoria_producto}</td>
                <td>{product.subcategoria}</td> 
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
                <td>{product.ingreso_id || ""}</td>
                <td>{product.orden_id || ""}</td>
                <td>{product.venta_id || ""}</td>
                {/* <td>{formatDate(product.createdAt)}</td> */}
                <td>{isCorrelative ? "" : "X"}</td> {/* Columna ID */}
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
            )
          })}
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
                <td>{categorySummary[category].pesoTotal}</td>
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
  )
}