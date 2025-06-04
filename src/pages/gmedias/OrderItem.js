import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table, Container, Button, FormControl } from "react-bootstrap";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import Contexts from "../../context/Contexts";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { GenerateReceiptOrderHTML } from "./GenerateReceiptOrderHTML";

export default function OrderItem() {
  const [productsOrder, setProductsOrder] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20); // Puedes ajustar este número según tus necesidades

  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();
  const params = useParams();

  const apiUrl = process.env.REACT_APP_API_URL;

  // loadOrdersProducts

  const loadProductsOrder = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/ordenes/${id}/productos`, {
        credentials: "include",
      });
      const data = await res.json();

      // Mapear cada producto para incluir la información de la sucursal
      const productsWithBranch = await Promise.all(
        data.map(async (product) => {
          const productWithBranch = { ...product };

          if (product.sucursal_id) {
            const branch = await fetch(
              `${apiUrl}/sucursales/${product.sucursal_id}`,
              {
                credentials: "include",
              }
            );
            const branchData = await branch.json();
            productWithBranch.sucursal = branchData;
          }

          return productWithBranch;
        })
      );

      setProductsOrder(productsWithBranch);
    },
    [apiUrl]
  );

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/ordenes/producto`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({ productId: id }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        // Si la respuesta no es exitosa, mostrar mensaje de error
        const errorData = await res.json();
        alert(errorData.mensaje);
      } else {
        // Si la respuesta es exitosa, eliminar el producto del estado local
        setProductsOrder(
          filteredProducts.filter((product) => product.id !== id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();

    if (searchTermLower === "") {
      setFilteredProducts(productsOrder);
    } else {
      const filtered = productsOrder.filter((product) => {
        return (
          product.codigo_de_barra.toLowerCase().includes(searchTermLower) ||
          product.num_media.toString().includes(searchTermLower) ||
          product.tropa.toString().includes(searchTermLower) ||
          (product.sucursal &&
            product.sucursal.nombre.toLowerCase().includes(searchTermLower))
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchTerm, productsOrder]);

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );

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

  useEffect(() => {
    loadProductsOrder(params.id);
  }, [params.id, loadProductsOrder]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, productsOrder, handleSearch]);

  const handleReprintOrder = async () => {
    try {
      // Obtener los detalles de la orden
      const orderResponse = await fetch(`${apiUrl}/ordenes/${params.id}`, {
        credentials: "include",
      });
      const orderData = await orderResponse.json();

      // Obtener el nombre de la sucursal
      const branchResponse = await fetch(
        `${apiUrl}/sucursales/${orderData.sucursal_id}`,
        { credentials: "include" }
      );
      const branchData = await branchResponse.json();

      // Generar el HTML e imprimir
      const receiptHTML = GenerateReceiptOrderHTML(
        orderData,
        productsOrder,
        branchData.nombre
      );
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    } catch (error) {
      console.error("Error al reimprimir la orden:", error);
      alert("No se pudo reimprimir la orden. Intente nuevamente.");
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos Enviados</h1>
      {/* Botón para reimprimir la orden */}
      <div className="mb-3 ">
        <Button variant="success" onClick={handleReprintOrder}>
          Reimprimir Orden
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            {/* <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>Fecha de ingreso</th> */}
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
            <th>Sucursal</th>
            {!(context.user && context.user.rol_id === 4) && <th>Operaciones</th>}
            {/* <th>Operaciones</th> */}
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              {/* <td>{new Date(product.fecha).toLocaleDateString("es-ES")}</td> */}
              <td>{product.ingreso_id}</td>
              <td>{product.codigo_de_barra}</td>
              <td>{product.num_media}</td>
              <td>{product.precio}</td>
              <td>{product.kg}</td>
              <td>{product.tropa}</td>
              <td>{product.categoria_producto}</td>
              <td>{product.subcategoria}</td>
              <td>
                {product.sucursal
                  ? product.sucursal.nombre
                  : "Sucursal Desconocida"}
              </td>
              {!(context.user && context.user.rol_id === 4) && (
                <td className="text-center">
                  <div className="d-flex justify-content-center align-items-center">
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(product.id)}
                      className="mx-2"
                    >
                      Eliminar
                    </Button>
                    {context.user && context.user.usuario === "admin" && (
                      <Button
                        color="inherit"
                        onClick={() =>
                          navigate(`/products/${product.id}/edit`, {
                            state: { product },
                          })
                        }
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
    </Container>
  );
}
