import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, Container, Button } from "react-bootstrap";
import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import CategorySummaryTable from "../../utils/CategorySummaryTable"; // Importa el componente CategorySummaryTable

export default function StockProductsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  const apiUrl = process.env.REACT_APP_API_URL;

  const location = useLocation();
  const { state } = location;

  // Verifica si hay productos en el estado de la ubicación
  const products = state?.products || [];

  // Cálculo de la paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(products.length / productsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos</h1>
      {/* <Table striped bordered hover variant="dark"> */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Codigo de Barra</th>
            <th>Numero de Media</th>
            <th>precio</th>
            <th>Peso</th>
            <th>Tropa</th>
            <th>Categoria</th>
            <th>Subcategoria</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>{product.precio}</td>
              <td>{product.kg}</td>
              <td>{product.tropa}</td>
              <td>{product.categoria_producto}</td>
              <td>{product.subcategoria}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div>
        {pageNumbers.map((number) => (
          <Button
            key={number}
            onClick={() => paginate(number)}
            className="mx-1" // Agrega una pequeña separación horizontal entre los botones
          >
            {number}
          </Button>
        ))}
      </div>
      <CategorySummaryTable filteredProducts={products} />
    </Container>
  );
}
