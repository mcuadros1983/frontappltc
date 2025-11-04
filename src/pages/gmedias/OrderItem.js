import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Table, Container, Button, FormControl } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { GenerateReceiptOrderHTML } from "./GenerateReceiptOrderHTML";

export default function OrderItem() {
  const [productsOrder, setProductsOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const apiUrl = process.env.REACT_APP_API_URL;

  const loadProductsOrder = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/ordenes/${id}/productos`, {
      credentials: "include",
    });
    const data = await res.json();

    const productsWithBranch = await Promise.all(
      data.map(async (product) => {
        const productWithBranch = { ...product };

        if (product.sucursal_id) {
          const branch = await fetch(`${apiUrl}/sucursales/${product.sucursal_id}`, {
            credentials: "include",
          });
          const branchData = await branch.json();
          productWithBranch.sucursal = branchData;
        }

        return productWithBranch;
      })
    );

    setProductsOrder(productsWithBranch);
  }, [apiUrl]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${apiUrl}/ordenes/producto`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({ productId: id }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.mensaje);
      } else {
        setProductsOrder(productsOrder.filter((product) => product.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredProducts = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();

    if (searchTermLower === "") return productsOrder;

    return productsOrder.filter((product) => {
      return (
        product.codigo_de_barra.toLowerCase().includes(searchTermLower) ||
        product.num_media.toString().includes(searchTermLower) ||
        product.tropa.toString().includes(searchTermLower) ||
        (product.sucursal && product.sucursal.nombre.toLowerCase().includes(searchTermLower))
      );
    });
  }, [searchTerm, productsOrder]);

  const sortedProducts = useMemo(() => {
    if (!sortColumn) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });
  }, [filteredProducts, sortColumn, sortDirection]);

  const handleSort = (columnName) => {
    const newSortDirection = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newSortDirection);
  };

  useEffect(() => {
    loadProductsOrder(params.id);
  }, [params.id, loadProductsOrder]);

  const handleReprintOrder = async () => {
    try {
      const orderResponse = await fetch(`${apiUrl}/ordenes/${params.id}`, { credentials: "include" });
      const orderData = await orderResponse.json();

      const branchResponse = await fetch(`${apiUrl}/sucursales/${orderData.sucursal_id}`, { credentials: "include" });
      const branchData = await branchResponse.json();

      const receiptHTML = GenerateReceiptOrderHTML(orderData, productsOrder, branchData.nombre);
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
      setTimeout(() => printWindow.close(), 1000);
    } catch (error) {
      console.error("Error al reimprimir la orden:", error);
      alert("No se pudo reimprimir la orden. Intente nuevamente.");
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const nextPage = () => setCurrentPage((prev) => prev + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos Enviados</h1>
      <div className="mb-3 d-flex justify-content-between">
        <Button variant="primary" onClick={() => navigate("/orders", { state: location.state })}>
          Volver
        </Button>
        <Button variant="success" onClick={handleReprintOrder}>
          Reimprimir Orden
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => handleSort("ingreso_id")} style={{ cursor: "pointer" }}>Num Ingreso</th>
            <th onClick={() => handleSort("codigo_de_barra")} style={{ cursor: "pointer" }}>Codigo de Barra</th>
            <th onClick={() => handleSort("num_media")} style={{ cursor: "pointer" }}>Numero de Media</th>
            <th onClick={() => handleSort("precio")} style={{ cursor: "pointer" }}>Precio</th>
            <th onClick={() => handleSort("kg")} style={{ cursor: "pointer" }}>Peso</th>
            <th onClick={() => handleSort("tropa")} style={{ cursor: "pointer" }}>Tropa</th>
            <th onClick={() => handleSort("categoria_producto")} style={{ cursor: "pointer" }}>Categoria</th>
            <th onClick={() => handleSort("subcategoria")} style={{ cursor: "pointer" }}>Subcategoria</th>
            <th>Sucursal</th>
            {!(context.user && context.user.rol_id === 4) && <th>Operaciones</th>}
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.ingreso_id}</td>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>{product.precio}</td>
              <td>{product.kg}</td>
              <td>{product.tropa}</td>
              <td>{product.categoria_producto}</td>
              <td>{product.subcategoria}</td>
              <td>{product.sucursal ? product.sucursal.nombre : "Sucursal Desconocida"}</td>
              {!(context.user && context.user.rol_id === 4) && (
                <td className="text-center">
                  <div className="d-flex justify-content-center align-items-center">
                    <Button variant="danger" onClick={() => handleDelete(product.id)} className="mx-2">
                      Eliminar
                    </Button>
                    {context.user && context.user.usuario === "admin" && (
                      <Button
                        color="inherit"
                        onClick={() => navigate(`/products/${product.id}/edit`, { state: { product } })}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(sortedProducts.length / productsPerPage)}
        </span>
        <Button onClick={nextPage} disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}>
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}