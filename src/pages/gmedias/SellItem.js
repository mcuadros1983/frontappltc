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
  // Precio único para aplicar a todos los productos de categoría "porcino"
  const [pigPriceInput, setPigPriceInput] = useState("");

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

  // Recalcular precios de lo que "se está mostrando":
  // - Bovino: aplica margen cliente * costo (como en SellForm)
  // - Porcino: usa un único precio ingresado en pigPriceInput
  // Luego persiste cada producto (PUT existente) y fuerza refresco de venta + lista
  const handleRecalcAll = async () => {
    try {
      if (!venta) {
        alert("No hay datos de la venta cargados.");
        return;
      }

      // 1) Traer datos del cliente para margen (para bovino)
      const resCli = await fetch(`${apiUrl}/clientes/${venta.cliente_id}`, { credentials: "include" });
      if (!resCli.ok) {
        alert("No se pudo cargar el cliente para recalcular.");
        return;
      }
      const cliente = await resCli.json();
      const margenNum =
        cliente?.margen !== undefined && cliente?.margen !== null && !isNaN(Number(cliente.margen))
          ? Number(cliente.margen)
          : 0;

      // 2) Validar precio porcino si hay porcinos en lo filtrado
      const hayPorcinos = filteredProducts.some(
        (p) => (p.categoria_producto || "").toLowerCase() === "porcino"
      );
      let pigPriceNum = null;
      if (hayPorcinos) {
        pigPriceNum = Number(pigPriceInput);
        if (!Number.isFinite(pigPriceNum) || pigPriceNum <= 0) {
          alert("Ingrese un precio válido para porcino (mayor que 0).");
          return;
        }
      }

      // 3) Determinar el conjunto a actualizar: TODOS los QUE SE ESTÁN MOSTRANDO (filteredProducts)
      const productosObjetivo = [...filteredProducts];

      // 4) Optimistic UI: clonar arrays locales para mostrar el nuevo precio de inmediato
      const updatedFiltered = [...filteredProducts];
      const updatedAll = [...productsSell];

      // 5) Procesar uno a uno (usando tu endpoint existente de PUT por producto)
      for (const prod of productosObjetivo) {
        const categoria = (prod.categoria_producto || "").toLowerCase();

        // calcular nuevo precio sin tocar kg
        let nuevoPrecio = Number(prod.precio || 0);

        if (categoria === "bovino") {
          const costo = Number(prod?.costo ?? 0);
          if (Number.isFinite(costo) && Number.isFinite(margenNum)) {
            nuevoPrecio = parseFloat(((1 + margenNum / 100) * costo).toFixed(2));
          } else {
            // si no hay costo o margen, dejamos precio tal cual
            nuevoPrecio = Number(prod.precio || 0);
          }
        } else if (categoria === "porcino") {
          // usar un único precio para todos los porcinos mostrados
          nuevoPrecio = pigPriceNum;
        } else {
          // otras categorías: no tocar
          continue;
        }

        // si el precio no cambió y es bovino, IGUAL lo forzamos (según tu requerimiento "si o si recalcula bovino")
        // solo aseguramos no tocar kg
        const payload = {
          precio: nuevoPrecio,
          kg: prod.kg,        // no modificar
          tropa: prod.tropa,  // no modificar
        };

        // persistimos
        const putRes = await fetch(`${apiUrl}/ventas/${params.id}/productos/${prod.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productoId: prod.id,
            nuevoProducto: payload,
          }),
        });

        if (!putRes.ok) {
          console.error(`Error actualizando producto ${prod.id}`);
          continue;
        }

        // actualizar en memoria (filteredProducts)
        const idxF = updatedFiltered.findIndex((p) => p.id === prod.id);
        if (idxF !== -1) updatedFiltered[idxF] = { ...updatedFiltered[idxF], precio: nuevoPrecio };

        // actualizar en memoria (productsSell completo)
        const idxAll = updatedAll.findIndex((p) => p.id === prod.id);
        if (idxAll !== -1) updatedAll[idxAll] = { ...updatedAll[idxAll], precio: nuevoPrecio };
      }

      // 6) Refrescar estados inmediatamente para ver el nuevo precio sin recargar
      setFilteredProducts(updatedFiltered);
      setProductsSell(updatedAll);

      // 7) Disparar la actualización de la venta (para que recalcule monto_total y cta cte si corresponde)
      //    Enviamos al menos un campo (clienteId igual) para que el backend ejecute recalculo/ajuste.
      await fetch(`${apiUrl}/ventas/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clienteId: venta.cliente_id,   // mismo cliente → el backend recalcula totals (ver patch backend)
        }),
      });

      // 8) Volver a cargar venta y productos desde el servidor (fuente de verdad)
      await Promise.all([loadVenta(params.id), loadProductsSell(params.id)]);
    } catch (err) {
      console.error("Error en handleRecalcAll:", err);
      alert("Ocurrió un error al recalcular.");
    }
  };


  const handleRecalculate = async () => {
    try {
      if (!venta) {
        // si por alguna razón no está cargada, la traemos
        await loadVenta(params.id);
      }
      const ventaActual = venta || (await (await fetch(`${apiUrl}/ventas/${params.id}`, { credentials: "include" })).json());

      // Traemos el cliente para obtener el margen (igual que en SellForm)
      const clienteRes = await fetch(`${apiUrl}/clientes/${ventaActual.cliente_id}/`, {
        credentials: "include",
      });
      if (!clienteRes.ok) {
        alert("No se pudo cargar el cliente para calcular el margen.");
        return;
      }
      const cliente = await clienteRes.json();
      const margen = Number(cliente?.margen);

      // Validaciones mínimas
      const margenValido =
        margen !== undefined &&
        margen !== null &&
        !isNaN(margen);

      // Preparamos actualizaciones SOLO para bovino (porcino -> console.log)
      const updates = [];
      const localPriceMap = new Map(); // idProducto -> nuevoPrecio para reflejar en UI

      for (const p of productsSell) {
        if (p?.categoria_producto === "porcino") {
          // En porcino solo log (la lógica se definirá después)
          console.log(`Recalcular (porcino) pendiente de implementar. Producto ID ${p.id}`);
          continue;
        }

        if (p?.categoria_producto === "bovino") {
          const costo = Number(p?.costo);
          const costoValido = !isNaN(costo) && costo > 0;

          // ✔ Siempre recalculamos si es bovino (aunque ya tenga precio)
          let nuevoPrecio = Number(p?.precio) || 0;

          if (margenValido && costoValido) {
            nuevoPrecio = Number((((1 + margen / 100) * costo)).toFixed(2));
          } else {
            // si no tenemos datos suficientes, mantenemos el precio actual
            // podrías poner 0 si preferís forzar la corrección
            nuevoPrecio = Number(p?.precio) || 0;
          }

          // Enviamos precio + kg + tropa para evitar NaN en backend
          updates.push({
            id: p.id,
            req: fetch(
              `${apiUrl}/ventas/${params.id}/productos/${p.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  productoId: p.id,
                  nuevoProducto: {
                    precio: nuevoPrecio,
                    kg: p.kg,
                    tropa: p.tropa,
                    // si tu backend necesita estos para el update, podés “congelarlos” también:
                    // codigo_de_barra: p.codigo_de_barra,
                    // num_media: p.num_media,
                    // categoria_producto: p.categoria_producto,
                  },
                }),
              }
            ),
          });

          localPriceMap.set(p.id, nuevoPrecio); // guardamos para refresco instantáneo en UI
        }
      }

      if (updates.length === 0) {
        alert("No hay productos bovinos para recalcular.");
        return;
      }

      // Ejecutamos todas las actualizaciones
      const results = await Promise.allSettled(updates.map(u => u.req));
      const errores = results.filter(r => r.status === "rejected" || (r.value && !r.value.ok));
      if (errores.length > 0) {
        console.warn("Algunas actualizaciones fallaron:", errores.length);
      }

      // ✅ Refrescamos la UI SIN recargar la página:
      // 1) Actualizamos productsSell en memoria
      setProductsSell(prev =>
        prev.map(p =>
          localPriceMap.has(p.id)
            ? { ...p, precio: localPriceMap.get(p.id) }
            : p
        )
      );

      // 2) Actualizamos filteredProducts (si hay filtro activo, mantenemos la selección actual)
      setFilteredProducts(prev =>
        prev.map(p =>
          localPriceMap.has(p.id)
            ? { ...p, precio: localPriceMap.get(p.id) }
            : p
        )
      );

      // 3) (Opcional) Volver a cargar desde backend por consistencia absoluta.
      //    Si tu backend recalcula montos totales de venta, esto asegura sincronización:
      // await loadProductsSell(params.id);
      // await loadVenta(params.id);

      alert("Recalculo aplicado a productos bovinos.");
    } catch (err) {
      console.error("Error en handleRecalculate:", err);
      alert("Ocurrió un error al recalcular los precios.");
    }
  };


  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos Vendidos</h1>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* IZQUIERDA: controles de recálculo */}
        <div className="d-flex align-items-center gap-2">
          {/* Input para precio porcino solo si hay algún porcino en lo filtrado */}
          {filteredProducts.some(p => (p.categoria_producto || "").toLowerCase() === "porcino") && (
            <>
              <FormControl
                type="number"
                step="0.01"
                value={pigPriceInput}
                onChange={(e) => setPigPriceInput(e.target.value)}
                placeholder="Precio único porcino"
                style={{ width: 180 }}
              />
            </>
          )}
          <Button variant="warning" onClick={handleRecalcAll}>
            Recalcular
          </Button>
        </div>

        {/* DERECHA: reimprimir */}
        <div>
          <Button variant="primary" onClick={handleReprint}>
            Reimprimir Venta
          </Button>
        </div>
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
