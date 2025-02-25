import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Table, Container, Button, FormControl, Form } from "react-bootstrap";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import Contexts from "../../context/Contexts";
import CategorySummaryTable from "../../utils/CategorySummaryTable"; // Importa el componente CategorySummaryTable 
import { GenerateReceiptHTML } from "./GenerateReceiptHTML"; // Importa la función de generación de recibos


export default function SellItem() {
  const [productsSell, setProductsSell] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [editingIndex, setEditingIndex] = useState(null); // Nuevo estado para rastrear la fila en edición
  const [editedProducts, setEditedProducts] = useState([]); // Nuevo estado para almacenar los productos editados
  const [editedPrice, setEditedPrice] = useState(""); // Estado para el precio editado
  const [editedWeight, setEditedWeight] = useState(""); // Estado para el peso editado
  const [editedTropa, setEditedTropa] = useState(""); // Estado para la tropa editada
  const [venta, setVenta] = useState(null); // Nuevo estado para almacenar la información de la venta

  const context = useContext(Contexts.UserContext);

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  const apiUrl = process.env.REACT_APP_API_URL;
  const params = useParams();

  const loadProductsSell = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/ventas/${id}/productos/`, {
      credentials: "include",
    });
    const data = await res.json();
    setProductsSell(data);
  }, [apiUrl]);

  const loadVenta = useCallback(async (id) => {
    try {
      const res = await fetch(`${apiUrl}/ventas/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setVenta(data);
    } catch (error) {
      console.error("Error al cargar la venta:", error);
    }
  }, [apiUrl]);

  const handleSearch = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();
    if (searchTermLower === "") {
      setFilteredProducts(productsSell);
    } else {
      const filtered = productsSell.filter((product) =>
        product.codigo_de_barra.toLowerCase().includes(searchTermLower) ||
        product.num_media.toString().includes(searchTermLower) ||
        product.tropa.toString().includes(searchTermLower) ||
        (product.sucursal && product.sucursal.nombre.toLowerCase().includes(searchTermLower))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, productsSell]);

  useEffect(() => {
    loadVenta(params.id);
    loadProductsSell(params.id);
  }, [params.id, loadProductsSell]);  // include loadProductsSell as a dependency

  useEffect(() => {
    handleSearch();
  }, [searchTerm, productsSell, handleSearch]);  // include handleSearch as a dependency

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/ventas/producto`, {
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
        setProductsSell(
          filteredProducts.filter((product) => product.id !== id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

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
    loadProductsSell(params.id);
  }, [params.id, loadProductsSell]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, productsSell, handleSearch]);

  // Función para manejar la edición de una fila
  const handleEdit = (index) => {
    const product = filteredProducts[index]; // Obtener el producto correspondiente al índice
    setEditingIndex(index); // Establecer la fila actual en edición
    // Guardar una copia del producto original antes de la edición
    setEditedProducts([...productsSell]);
    // Establecer los valores de los campos editables
    setEditedPrice(product.precio);
    setEditedWeight(product.kg);
    setEditedTropa(product.tropa);
  };

  // Función para cancelar la edición de una fila
  const handleCancelEdit = () => {
    setEditingIndex(null); // Restablecer la edición
    // Restaurar los productos originales
    setFilteredProducts([...editedProducts]);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const regex = /^\d*(\.\d{0,2})?$/; // Acepta números con hasta dos decimales separados por punto
    if (regex.test(value)) {
      setEditedPrice(value);
    }
  };


  // Función para guardar los cambios de la fila editada
  const handleSaveChanges = async (index, productId, updatedProduct) => {
    try {
      const res = await fetch(
        `${apiUrl}/ventas/${params.id}/productos/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Aquí puedes incluir cualquier otro encabezado necesario
          },
          body: JSON.stringify({
            productoId: productId, // Asegúrate de enviar el ID del producto
            nuevoProducto: updatedProduct, // Envía el objeto updatedProduct como nuevoProducto
          }),
          credentials: "include",
        }
      );
      if (res.ok) {
        // Actualizar productos vendidos después de la edición
        loadProductsSell(params.id);
        setEditingIndex(null); // Restablecer la edición
      } else {
        // Manejar errores de respuesta
        console.error("Error al actualizar el producto");
      }
    } catch (error) {
      // Manejar errores de red
      console.error("Error de red al actualizar el producto", error);
    }
  };

  // Cálculo de la paginación para los productos filtrados
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentFilteredProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
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

  const handleReprint = () => {
    if (!venta || !productsSell.length) {
      alert("No se puede reimprimir la venta porque no hay datos cargados.");
      return;
    }

    // Generar el recibo HTML
    const receiptHTML = GenerateReceiptHTML(
      venta,
      productsSell,
      venta.Cliente ? venta.Cliente.nombre : "Cliente Desconocido",
      venta.FormaPago ? venta.FormaPago.tipo : "Forma de Pago Desconocida"
    );

    // Abrir una nueva ventana para la impresión
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };


  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos Vendidos</h1>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={handleReprint}>
          Reimprimir Venta
        </Button>
      </div>


      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
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
            {context.user.usuario === "admin" && <th>Operaciones</th>}
          </tr>
        </thead>
        <tbody>
          {currentFilteredProducts.map((product, index) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.ingreso_id || ""}</td>
              <td>{product.codigo_de_barra || ""}</td>
              <td>{product.num_media || ""}</td>
              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="text"
                    inputMode="decimal"
                    value={editedPrice}
                    onChange={handlePriceChange}
                    placeholder="0.00"
                  />
                ) : (
                  product.precio
                    ? product.precio.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })
                    : ""
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    value={editedWeight}
                    onChange={(e) => setEditedWeight(e.target.value)}
                    min="0"
                  />
                ) : (
                  product.kg || ""
                )}
              </td>
              <td>
                {editingIndex === index ? (
                  <Form.Control
                    type="text"
                    value={editedTropa}
                    onChange={(e) => setEditedTropa(e.target.value)}
                  />
                ) : (
                  product.tropa || ""
                )}
              </td>
              <td>{product.categoria_producto || ""}</td>
              {context.user.usuario === "admin" && (
                <td className="text-center">
                  {editingIndex === index ? (
                    <div className="d-flex justify-content-center align-items-center">
                      <Button
                        variant="success"
                        onClick={() =>
                          handleSaveChanges(index, product.id, {
                            precio: editedPrice,
                            kg: editedWeight,
                            tropa: editedTropa,
                          })
                        }
                        className="me-2 mx-2"
                        style={{ width: "100px" }}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleCancelEdit}
                        className="me-2"
                        style={{ width: "100px" }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center align-items-center">
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(product.id)}
                        className="mx-2"
                      >
                        Eliminar
                      </Button>
                      <Button color="inherit" onClick={() => handleEdit(index)}>
                        Editar
                      </Button>
                    </div>
                  )}
                </td>
              )}
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
      {/* Agregar el componente CategorySummaryTable aquí */}
      <CategorySummaryTable filteredProducts={filteredProducts} />
    </Container>
  );
}
