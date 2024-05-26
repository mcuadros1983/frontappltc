import { useEffect, useState } from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import CategorySummaryTable from "../../utils/CategorySummaryTable"; // Importa el componente CategorySummaryTable
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function ReceiptProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // filtros especificos
  const [searchBarra, setSearchBarra] = useState("");
  const [searchMedia, setSearchMedia] = useState("");
  const [searchPeso, setSearchPeso] = useState("");
  const [searchTropa, setSearchTropa] = useState("");
  const [searchCategoria, setSearchCategoria] = useState("");

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const loadProducts = async () => {
    const res = await fetch(`${apiUrl}/productos/`, {
      credentials: "include",
    });
    const data = await res.json();
    const sortedProducts = data.sort((a, b) => a.id - b.id);
    setProducts(sortedProducts);
    setFilteredProducts(sortedProducts);
  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      // Obtener el id del recibo al que pertenece el producto que se va a eliminar

      const product = await fetch(`${apiUrl}/productos/${id}`, {
        credentials: "include",
      });
      const data = await product.json();

      const ingreso_id = data.ingreso_id;


      // Actualizar el peso_total del recibo al que pertenece el producto que se va a eliminar
      const receipt = await fetch(
        `${apiUrl}/ingresos/${ingreso_id}`,
        {
          credentials: "include",
        }
      );
      const dataReceipt = await receipt.json();
      const peso_total = dataReceipt.peso_total;
      const peso_producto = data.kg;
      const peso_total_actualizado = peso_total - peso_producto;

      await fetch(
        `${apiUrl}/ingresos/${ingreso_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            peso_total: peso_total_actualizado,
          }),
        }
      );

      // Eliminar el producto
      await fetch(`${apiUrl}/productos/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      setProducts(products.filter((product) => product.id !== id));
      // loadProducts() ////este metodo funciona pero no es el mas optimo ya que vuelve a cargar todos los productos de la base de datos y no solo el que se elimino;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    const filtered = products.filter((product) => {
      const codigoMatch = product.codigo_de_barra
        .toLowerCase()
        .includes(searchBarra.toLowerCase());
      const mediaMatch = product.num_media.toString().includes(searchMedia);
      const pesoMatch = product.kg.toString().includes(searchPeso);
      const tropaMatch = product.tropa.toString().includes(searchTropa);
      const categoriaMatch = product.categoria_producto
        .toString()
        .includes(searchCategoria);

      return (
        codigoMatch && mediaMatch && pesoMatch && tropaMatch && categoriaMatch
      );
    });

    setFilteredProducts(filtered);
  };

  const handleSort = (columnName) => {
    // Cambiar la dirección de orden si la columna es la misma que la columna actualmente ordenada
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );

    // Actualizar la columna actualmente ordenada
    setSortColumn(columnName);

    // Ordenar los productos
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

  // Cálculo de la paginación para los productos filtrados
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentFilteredProducts = filteredProducts.slice(
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
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, products]);

  useEffect(() => {
    handleSearch();
  }, [searchBarra, searchMedia, searchPeso, searchTropa, searchCategoria]);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos</h1>
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
              Fecha de ingreso
            </th>
            <th
              onClick={() => handleSort("ingreso_id")}
              style={{ cursor: "pointer" }}
            >
              Num Ingreso
            </th>
            <th
              onClick={() => handleSort("codigo_de_barra")}
              style={{ cursor: "pointer" }}
            >
              Codigo de Barra
            </th>
            <th
              onClick={() => handleSort("num_media")}
              style={{ cursor: "pointer" }}
            >
              Numero de Media
            </th>
            <th
              onClick={() => handleSort("precio")}
              style={{ cursor: "pointer" }}
            >
              precio
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
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentFilteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.fecha}</td>
              <td>{product.ingreso_id}</td>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>{product.precio}</td>
              <td>{product.kg}</td>
              <td>{product.tropa}</td>
              <td>{product.categoria_producto}</td>
              <td>{product.subcategoria}</td>
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
          Página {currentPage} de {Math.ceil(filteredProducts.length / productsPerPage)}
        </span>
        <Button onClick={nextPage} disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}>
          <BsChevronRight />
        </Button>
      </div>

      <CategorySummaryTable filteredProducts={filteredProducts} />
    </Container>
  );
}
