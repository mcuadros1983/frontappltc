import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Table, Container, Button } from "react-bootstrap";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function ReceiptItem() {
  const [productsReceipt, setProductsReceipt] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // Puedes ajustar este número según tus necesidades

  const apiUrl = process.env.REACT_APP_API_URL;
  const params = useParams();

  const loadReceiptsProducts = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/ingresos/${id}/productos`, {
      credentials: "include",
    });
    const data = await res.json();
    setProductsReceipt(data);
  },[apiUrl]);

  useEffect(() => {
    loadReceiptsProducts(params.id);
  }, [params.id,loadReceiptsProducts]);

  // Paginación lógica
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productsReceipt.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(productsReceipt.length / productsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
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
            {/* <th>Operaciones</th> */}
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
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(productsReceipt.length / productsPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(productsReceipt.length / productsPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
