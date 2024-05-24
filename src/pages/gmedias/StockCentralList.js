import { useEffect, useState } from "react";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import CategorySummaryTable from "../../utils/CategorySummaryTable"; // Importa el componente CategorySummaryTable
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function StockCentralList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const loadProducts = async () => {
    try {
      // Realiza la solicitud de productos específicos del branch con ID
      const res = await fetch(`${apiUrl}/sucursales/18/productos`, {
        credentials: "include",
      });
      const data = await res.json();
      const sortedProducts = data.sort((a, b) => a.id - b.id);
      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    const searchTermLower = searchTerm.toLowerCase();

    if (searchTermLower === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        return (
          product.codigo_de_barra.toLowerCase() === searchTermLower ||
          product.num_media.toString() === searchTermLower ||
          product.tropa.toString() === searchTermLower ||
          product.ingreso_id.toString() === searchTermLower
        );
      });
      setFilteredProducts(filtered);
    }
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

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, products]);

  // Cálculo de la paginación
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

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos</h1>
      <div className="mb-3">
        <FormControl
          type="text"
          placeholder="Buscar por código de barras, numero de ingreso, número de media o tropa"
          className="mr-sm-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              Precio
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
            {/* <th>Operaciones</th> */}
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{new Date(product.fecha).toLocaleDateString("es-ES")}</td>
              <td>{product.ingreso_id}</td>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>{product.precio}</td>
              <td>{product.kg}</td>
              <td>{product.tropa}</td>
              <td>{product.categoria_producto}</td>
              <td>{product.subcategoria}</td>
              {/* <td className="text-center">
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
              </td> */}
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
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
      {/* Agregar el componente CategorySummaryTable aquí */}
      <CategorySummaryTable filteredProducts={filteredProducts} />
    </Container>
  );
}
