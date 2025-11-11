// import React, { useEffect, useState, useContext, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import { Table, Container, Button, FormControl, Form } from "react-bootstrap";
// import Contexts from "../../context/Contexts";
// import CategorySummaryTable from "../../utils/CategorySummaryTable";
// import { GenerateReceiptHTML } from "./GenerateReceiptHTML";

// export default function SellItem() {
//   const [productsSell, setProductsSell] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortDirection, setSortDirection] = useState("asc");

//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editedProducts, setEditedProducts] = useState([]);
//   const [editedPrice, setEditedPrice] = useState("");
//   const [editedWeight, setEditedWeight] = useState("");
//   const [editedTropa, setEditedTropa] = useState("");

//   const [venta, setVenta] = useState(null);
//   const [pigPriceInput, setPigPriceInput] = useState("");

//   // Paginación
//   const [currentPage, setCurrentPage] = useState(1);
//   const [productsPerPage] = useState(20);

//   const context = useContext(Contexts.UserContext);
//   const apiUrl = process.env.REACT_APP_API_URL;
//   const params = useParams();

//   // ===== Helpers =====
//   const parseARNumber = (v) => {
//     if (v == null) return NaN;
//     if (typeof v === "number") return v;
//     if (typeof v === "string") {
//       const s = v.trim().replace(/\./g, "").replace(",", ".");
//       return Number(s);
//     }
//     return Number(v);
//   };

//   const cmp = (a, b, dir = "asc") => {
//     // convierte a números si ambos parecen numéricos
//     const na = Number(a);
//     const nb = Number(b);
//     const bothNumeric = Number.isFinite(na) && Number.isFinite(nb);

//     let res = 0;
//     if (bothNumeric) {
//       res = na === nb ? 0 : na < nb ? -1 : 1;
//     } else {
//       const sa = String(a ?? "");
//       const sb = String(b ?? "");
//       res = sa.localeCompare(sb, "es", { sensitivity: "base", numeric: true });
//     }
//     return dir === "asc" ? res : -res;
//   };

//   // ===== Cargas =====
//   const loadProductsSell = useCallback(
//     async (id) => {
//       const res = await fetch(`${apiUrl}/ventas/${id}/productos/`, { credentials: "include" });
//       const data = await res.json();
//       setProductsSell(data);
//     },
//     [apiUrl]
//   );

//   const loadVenta = useCallback(
//     async (id) => {
//       try {
//         const res = await fetch(`${apiUrl}/ventas/${id}`, { credentials: "include" });
//         const data = await res.json();
//         setVenta(data);
//       } catch (err) {
//         console.error("Error al cargar la venta:", err);
//       }
//     },
//     [apiUrl]
//   );

//   // ===== Filtrado / Búsqueda =====
//   const handleSearch = useCallback(() => {
//     const q = searchTerm.trim().toLowerCase();
//     if (!q) {
//       setFilteredProducts(productsSell);
//       return;
//     }
//     const filtered = productsSell.filter((p) => {
//       const cb = (p.codigo_de_barra || "").toLowerCase().includes(q);
//       const nm = String(p.num_media ?? "").toLowerCase().includes(q);
//       const tr = String(p.tropa ?? "").toLowerCase().includes(q);
//       const suc = (p.sucursal?.nombre || "").toLowerCase().includes(q);
//       return cb || nm || tr || suc;
//     });
//     setFilteredProducts(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, productsSell]);

//   // Carga inicial
//   useEffect(() => {
//     loadVenta(params.id);
//     loadProductsSell(params.id);
//   }, [params.id, loadVenta, loadProductsSell]);

//   // Refiltrar ante cambios
//   useEffect(() => {
//     handleSearch();
//   }, [searchTerm, productsSell, handleSearch]);

//   // ===== Eliminar item =====
//   const handleDelete = async (id) => {
//     const ok = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
//     if (!ok) return;

//     try {
//       const res = await fetch(`${apiUrl}/ventas/producto`, {
//         credentials: "include",
//         method: "POST",
//         body: JSON.stringify({ productId: id }),
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!res.ok) {
//         const errorData = await res.json().catch(() => ({}));
//         alert(errorData.mensaje || "No se pudo eliminar el producto.");
//       } else {
//         // optimista: quito del listado actual (de lo filtrado)
//         setProductsSell((prev) => prev.filter((p) => p.id !== id));
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // ===== Orden =====
//   const handleSort = (columnName) => {
//     const newDir = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
//     setSortColumn(columnName);
//     setSortDirection(newDir);

//     setFilteredProducts((prev) => {
//       const arr = [...prev];
//       arr.sort((a, b) => cmp(a[columnName], b[columnName], newDir));
//       return arr;
//     });
//   };

//   // ===== Edición en línea =====
//   const handleEdit = (rowIndex) => {
//     const product = filteredProducts[rowIndex];
//     setEditingIndex(rowIndex);
//     setEditedProducts([...productsSell]); // snapshot original
//     setEditedPrice(product.precio);
//     setEditedWeight(product.kg);
//     setEditedTropa(product.tropa);
//   };

//   const handleCancelEdit = () => {
//     setEditingIndex(null);
//     // restaurar vista con snapshot
//     setFilteredProducts([...editedProducts]);
//   };

//   const handlePriceChange = (e) => {
//     const v = e.target.value;
//     const regex = /^\d*(\.\d{0,2})?$/;
//     if (regex.test(v)) setEditedPrice(v);
//   };

//   const handleSaveChanges = async (rowIndex, productId, updatedProduct) => {
//     try {
//       const res = await fetch(`${apiUrl}/ventas/${params.id}/productos/${productId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           productoId: productId,
//           nuevoProducto: updatedProduct,
//         }),
//       });
//       if (res.ok) {
//         await loadProductsSell(params.id);
//         setEditingIndex(null);
//       } else {
//         console.error("Error al actualizar el producto");
//       }
//     } catch (error) {
//       console.error("Error de red al actualizar el producto", error);
//     }
//   };

//   // ===== Reimpresión =====
//   const handleReprint = () => {
//     if (!venta || !productsSell.length) {
//       alert("No se puede reimprimir la venta porque no hay datos cargados.");
//       return;
//     }
//     const receiptHTML = GenerateReceiptHTML(
//       venta,
//       productsSell,
//       venta.Cliente ? venta.Cliente.nombre : "Cliente Desconocido",
//       venta.FormaPago ? venta.FormaPago.tipo : "Forma de Pago Desconocida"
//     );
//     const win = window.open("", "_blank");
//     win.document.open();
//     win.document.write(receiptHTML);
//     win.document.close();
//     win.print();
//     setTimeout(() => win.close(), 1000);
//   };

//   // ===== Recalcular precios (con validaciones) =====
//   const handleRecalcAll = async () => {
//     try {
//       if (!venta) {
//         alert("No hay datos de la venta cargados.");
//         return;
//       }

//       // 1) Margen del cliente
//       const resCli = await fetch(`${apiUrl}/clientes/${venta.cliente_id}`, { credentials: "include" });
//       if (!resCli.ok) {
//         alert("No se pudo cargar el cliente para recalcular.");
//         return;
//       }
//       const cliente = await resCli.json();
//       const margenNum = parseARNumber(cliente?.margen);

//       if (!Number.isFinite(margenNum) || margenNum <= 0) {
//         alert("El cliente no tiene margen definido.");
//         return;
//       }

//       // 2) Precio porcino (si corresponde)
//       const hayPorcinos = filteredProducts.some(
//         (p) => (p.categoria_producto || "").toLowerCase() === "porcino"
//       );
//       let pigPriceNum = null;
//       if (hayPorcinos) {
//         pigPriceNum = parseARNumber(pigPriceInput);
//         if (!Number.isFinite(pigPriceNum) || pigPriceNum <= 0) {
//           alert("Ingrese un precio válido para porcino (mayor que 0).");
//           return;
//         }
//       }

//       // 3) Validar costos bovinos de lo que estás viendo
//       const productosObjetivo = [...filteredProducts];
//       const bovinosSinCosto = productosObjetivo
//         .filter((p) => (p.categoria_producto || "").toLowerCase() === "bovino")
//         .filter((p) => {
//           const c = parseARNumber(p?.costo ?? 0);
//           return !Number.isFinite(c) || c <= 0;
//         });

//       if (bovinosSinCosto.length > 0) {
//         const ids = bovinosSinCosto.map((p) => p.id).join(", ");
//         alert(
//           `No hay costo cargado para el recalculo en ${bovinosSinCosto.length} producto(s) bovino(s): ${ids}.\n` +
//             `Cargá el costo antes de recalcular.`
//         );
//         return;
//       }

//       // 4) Optimistic UI
//       const updatedFiltered = [...filteredProducts];
//       const updatedAll = [...productsSell];

//       // 5) Recalcular y persistir
//       for (const prod of productosObjetivo) {
//         const categoria = (prod.categoria_producto || "").toLowerCase();
//         let nuevoPrecio = Number(prod.precio || 0);

//         if (categoria === "bovino") {
//           const costo = parseARNumber(prod?.costo ?? 0); // validado arriba
//           nuevoPrecio = parseFloat(((1 + margenNum / 100) * costo).toFixed(2));
//         } else if (categoria === "porcino") {
//           nuevoPrecio = pigPriceNum; // validado
//         } else {
//           continue; // otras categorías: no tocar
//         }

//         const payload = { precio: nuevoPrecio, kg: prod.kg, tropa: prod.tropa };

//         const putRes = await fetch(`${apiUrl}/ventas/${params.id}/productos/${prod.id}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({ productoId: prod.id, nuevoProducto: payload }),
//         });

//         if (!putRes.ok) {
//           console.error(`Error actualizando producto ${prod.id}`);
//           continue;
//         }

//         const iF = updatedFiltered.findIndex((p) => p.id === prod.id);
//         if (iF !== -1) updatedFiltered[iF] = { ...updatedFiltered[iF], precio: nuevoPrecio };

//         const iA = updatedAll.findIndex((p) => p.id === prod.id);
//         if (iA !== -1) updatedAll[iA] = { ...updatedAll[iA], precio: nuevoPrecio };
//       }

//       setFilteredProducts(updatedFiltered);
//       setProductsSell(updatedAll);

//       // 6) Recalcular totales de la venta en backend (si tu endpoint lo hace)
//       await fetch(`${apiUrl}/ventas/${params.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ clienteId: venta.cliente_id }),
//       });

//       // 7) Refrescar datos
//       await Promise.all([loadVenta(params.id), loadProductsSell(params.id)]);
//     } catch (err) {
//       console.error("Error en handleRecalcAll:", err);
//       alert("Ocurrió un error al recalcular.");
//     }
//   };

//   // ===== Paginación sobre lo filtrado =====
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentFilteredProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
//   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
//   const paginate = (n) => setCurrentPage(n);

//   return (
//     <Container>
//       <h1 className="my-list-title dark-text">Lista de Productos Vendidos</h1>

//       {/* Barra superior: recálculo + reimpresión */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center gap-2">
//           {/* Buscar */}
//           <FormControl
//             placeholder="Buscar por código, media, tropa o sucursal"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{ maxWidth: 360 }}
//           />

//           {/* Porcino: precio único si hay porcinos visibles */}
//           {filteredProducts.some((p) => (p.categoria_producto || "").toLowerCase() === "porcino") && (
//             <FormControl
//               type="number"
//               step="0.01"
//               value={pigPriceInput}
//               onChange={(e) => setPigPriceInput(e.target.value)}
//               placeholder="Precio único porcino"
//               style={{ width: 180 }}
//             />
//           )}
//           <Button variant="warning" onClick={handleRecalcAll}>
//             Recalcular
//           </Button>
//         </div>

//         <div>
//           <Button variant="primary" onClick={handleReprint}>
//             Reimprimir Venta
//           </Button>
//         </div>
//       </div>

//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>#</th>
//             <th onClick={() => handleSort("ingreso_id")} style={{ cursor: "pointer" }}>
//               Num Ingreso
//             </th>
//             <th onClick={() => handleSort("codigo_de_barra")} style={{ cursor: "pointer" }}>
//               Código de Barra
//             </th>
//             <th onClick={() => handleSort("num_media")} style={{ cursor: "pointer" }}>
//               Número de Media
//             </th>
//             <th onClick={() => handleSort("precio")} style={{ cursor: "pointer" }}>
//               Precio
//             </th>
//             <th onClick={() => handleSort("kg")} style={{ cursor: "pointer" }}>
//               Peso
//             </th>
//             <th onClick={() => handleSort("tropa")} style={{ cursor: "pointer" }}>
//               Tropa
//             </th>
//             <th onClick={() => handleSort("categoria_producto")} style={{ cursor: "pointer" }}>
//               Categoría
//             </th>
//             {context.user.usuario === "admin" && <th>Operaciones</th>}
//           </tr>
//         </thead>
//         <tbody>
//           {currentFilteredProducts.map((product, index) => (
//             <tr key={product.id}>
//               <td>{product.id}</td>
//               <td>{product.ingreso_id || ""}</td>
//               <td>{product.codigo_de_barra || ""}</td>
//               <td>{product.num_media || ""}</td>
//               <td>
//                 {editingIndex === index ? (
//                   <Form.Control
//                     type="text"
//                     inputMode="decimal"
//                     value={editedPrice}
//                     onChange={handlePriceChange}
//                     placeholder="0.00"
//                   />
//                 ) : product.precio ? (
//                   Number(product.precio).toLocaleString("es-AR", { style: "currency", currency: "ARS" })
//                 ) : (
//                   ""
//                 )}
//               </td>
//               <td>
//                 {editingIndex === index ? (
//                   <Form.Control
//                     type="text"
//                     inputMode="numeric"
//                     value={editedWeight}
//                     onChange={(e) => setEditedWeight(e.target.value)}
//                     min="0"
//                   />
//                 ) : (
//                   product.kg || ""
//                 )}
//               </td>
//               <td>
//                 {editingIndex === index ? (
//                   <Form.Control
//                     type="text"
//                     value={editedTropa}
//                     onChange={(e) => setEditedTropa(e.target.value)}
//                   />
//                 ) : (
//                   product.tropa || ""
//                 )}
//               </td>
//               <td>{product.categoria_producto || ""}</td>

//               {context.user.usuario === "admin" && (
//                 <td className="text-center">
//                   {editingIndex === index ? (
//                     <div className="d-flex justify-content-center align-items-center">
//                       <Button
//                         variant="success"
//                         onClick={() =>
//                           handleSaveChanges(index, product.id, {
//                             precio: editedPrice,
//                             kg: editedWeight,
//                             tropa: editedTropa,
//                           })
//                         }
//                         className="me-2 mx-2"
//                         style={{ width: "100px" }}
//                       >
//                         Guardar
//                       </Button>
//                       <Button
//                         variant="danger"
//                         onClick={handleCancelEdit}
//                         className="me-2"
//                         style={{ width: "100px" }}
//                       >
//                         Cancelar
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="d-flex justify-content-center align-items-center">
//                       <Button
//                         variant="danger"
//                         onClick={() => handleDelete(product.id)}
//                         className="mx-2"
//                       >
//                         Eliminar
//                       </Button>
//                       <Button color="inherit" onClick={() => handleEdit(index)}>
//                         Editar
//                       </Button>
//                     </div>
//                   )}
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       {/* Paginación */}
//       <div>
//         {pageNumbers.map((n) => (
//           <Button key={n} onClick={() => paginate(n)} className="mx-1">
//             {n}
//           </Button>
//         ))}
//       </div>

//       {/* Resumen por categoría */}
//       <CategorySummaryTable filteredProducts={filteredProducts} />
//     </Container>
//   );
// }

import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Table, Container, Button, FormControl, Form, Spinner } from "react-bootstrap"; // ⬅️ Spinner
import Contexts from "../../context/Contexts";
import CategorySummaryTable from "../../utils/CategorySummaryTable";
import { GenerateReceiptHTML } from "./GenerateReceiptHTML";

export default function SellItem() {
  const [productsSell, setProductsSell] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedProducts, setEditedProducts] = useState([]);
  const [editedPrice, setEditedPrice] = useState("");
  const [editedWeight, setEditedWeight] = useState("");
  const [editedTropa, setEditedTropa] = useState("");

  const [venta, setVenta] = useState(null);
  const [pigPriceInput, setPigPriceInput] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  // Carga / UI
  const [loading, setLoading] = useState(true);            // ⬅️ spinner inicial
  const [recalcLoading, setRecalcLoading] = useState(false); // ⬅️ spinner botón Recalcular

  const context = useContext(Contexts.UserContext);
  const apiUrl = process.env.REACT_APP_API_URL;
  const params = useParams();

  // ===== Helpers =====
  const parseARNumber = (v) => {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const s = v.trim().replace(/\./g, "").replace(",", ".");
      return Number(s);
    }
    return Number(v);
  };

  const cmp = (a, b, dir = "asc") => {
    const na = Number(a);
    const nb = Number(b);
    const bothNumeric = Number.isFinite(na) && Number.isFinite(nb);

    let res = 0;
    if (bothNumeric) {
      res = na === nb ? 0 : na < nb ? -1 : 1;
    } else {
      const sa = String(a ?? "");
      const sb = String(b ?? "");
      res = sa.localeCompare(sb, "es", { sensitivity: "base", numeric: true });
    }
    return dir === "asc" ? res : -res;
  };

  // ===== Cargas =====
  const loadProductsSell = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/ventas/${id}/productos/`, { credentials: "include" });
      const data = await res.json();
      setProductsSell(data);
    },
    [apiUrl]
  );

  const loadVenta = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${apiUrl}/ventas/${id}`, { credentials: "include" });
        const data = await res.json();
        setVenta(data);
      } catch (err) {
        console.error("Error al cargar la venta:", err);
      }
    },
    [apiUrl]
  );

  // ===== Filtrado / Búsqueda =====
  const handleSearch = useCallback(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setFilteredProducts(productsSell);
      return;
    }
    const filtered = productsSell.filter((p) => {
      const cb = (p.codigo_de_barra || "").toLowerCase().includes(q);
      const nm = String(p.num_media ?? "").toLowerCase().includes(q);
      const tr = String(p.tropa ?? "").toLowerCase().includes(q);
      const suc = (p.sucursal?.nombre || "").toLowerCase().includes(q);
      return cb || nm || tr || suc;
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, productsSell]);

  // Carga inicial
  useEffect(() => {
    (async () => {
      try {
        setLoading(true); // ⬅️ mostrar spinner
        await Promise.all([loadVenta(params.id), loadProductsSell(params.id)]);
      } finally {
        setLoading(false); // ⬅️ ocultar spinner
      }
    })();
  }, [params.id, loadVenta, loadProductsSell]);

  // Refiltrar ante cambios
  useEffect(() => {
    handleSearch();
  }, [searchTerm, productsSell, handleSearch]);

  // ===== Eliminar item =====
  const handleDelete = async (id) => {
    const ok = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (!ok) return;

    try {
      const res = await fetch(`${apiUrl}/ventas/producto`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({ productId: id }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.mensaje || "No se pudo eliminar el producto.");
      } else {
        setProductsSell((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ===== Orden =====
  const handleSort = (columnName) => {
    const newDir = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newDir);

    setFilteredProducts((prev) => {
      const arr = [...prev];
      arr.sort((a, b) => cmp(a[columnName], b[columnName], newDir));
      return arr;
    });
  };

  // ===== Edición en línea =====
  const handleEdit = (rowIndex) => {
    const product = filteredProducts[rowIndex];
    setEditingIndex(rowIndex);
    setEditedProducts([...productsSell]);
    setEditedPrice(product.precio);
    setEditedWeight(product.kg);
    setEditedTropa(product.tropa);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setFilteredProducts([...editedProducts]);
  };

  const handlePriceChange = (e) => {
    const v = e.target.value;
    const regex = /^\d*(\.\d{0,2})?$/;
    if (regex.test(v)) setEditedPrice(v);
  };

  const handleSaveChanges = async (rowIndex, productId, updatedProduct) => {
    try {
      const res = await fetch(`${apiUrl}/ventas/${params.id}/productos/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productoId: productId,
          nuevoProducto: updatedProduct,
        }),
      });
      if (res.ok) {
        await loadProductsSell(params.id);
        setEditingIndex(null);
      } else {
        console.error("Error al actualizar el producto");
      }
    } catch (error) {
      console.error("Error de red al actualizar el producto", error);
    }
  };

  // ===== Reimpresión =====
  const handleReprint = () => {
    if (!venta || !productsSell.length) {
      alert("No se puede reimprimir la venta porque no hay datos cargados.");
      return;
    }
    const receiptHTML = GenerateReceiptHTML(
      venta,
      productsSell,
      venta.Cliente ? venta.Cliente.nombre : "Cliente Desconocido",
      venta.FormaPago ? venta.FormaPago.tipo : "Forma de Pago Desconocida"
    );
    const win = window.open("", "_blank");
    win.document.open();
    win.document.write(receiptHTML);
    win.document.close();
    win.print();
    setTimeout(() => win.close(), 1000);
  };

  // ===== Recalcular precios (margen solo si hay bovinos) =====
  const handleRecalcAll = async () => {
    try {
      setRecalcLoading(true); // ⬅️ spinner botón
      if (!venta) {
        alert("No hay datos de la venta cargados.");
        return;
      }

      const productosObjetivo = [...filteredProducts];
      if (productosObjetivo.length === 0) {
        alert("No hay productos visibles para recalcular.");
        return;
      }

      const hayBovinos = productosObjetivo.some(
        (p) => (p.categoria_producto || "").toLowerCase() === "bovino"
      );
      const hayPorcinos = productosObjetivo.some(
        (p) => (p.categoria_producto || "").toLowerCase() === "porcino"
      );

      // 1) Solo si hay bovinos: obtener margen del cliente
      let margenNum = null;
      if (hayBovinos) {
        const resCli = await fetch(`${apiUrl}/clientes/${venta.cliente_id}`, { credentials: "include" });
        if (!resCli.ok) {
          alert("No se pudo cargar el cliente para recalcular.");
          return;
        }
        const cliente = await resCli.json();
        margenNum = parseARNumber(cliente?.margen);

        if (!Number.isFinite(margenNum) || margenNum <= 0) {
          // ANTES esto frenaba siempre. Ahora solo frena si hay bovinos.
          alert("El cliente no tiene margen definido.");
          return;
        }
      }

      // 2) Para porcinos: exigir precio manual válido
      let pigPriceNum = null;
      if (hayPorcinos) {
        pigPriceNum = parseARNumber(pigPriceInput);
        if (!Number.isFinite(pigPriceNum) || pigPriceNum <= 0) {
          alert("Ingrese un precio válido para porcino (mayor que 0).");
          return;
        }
      }

      // 3) Validar costos de bovinos si corresponde
      if (hayBovinos) {
        const bovinosSinCosto = productosObjetivo
          .filter((p) => (p.categoria_producto || "").toLowerCase() === "bovino")
          .filter((p) => {
            const c = parseARNumber(p?.costo ?? 0);
            return !Number.isFinite(c) || c <= 0;
          });

        if (bovinosSinCosto.length > 0) {
          const ids = bovinosSinCosto.map((p) => p.id).join(", ");
          alert(
            `No hay costo cargado para el recalculo en ${bovinosSinCosto.length} producto(s) bovino(s): ${ids}.\n` +
              `Cargá el costo antes de recalcular.`
          );
          return;
        }
      }

      // 4) Optimistic UI (opcional)
      const updatedFiltered = [...filteredProducts];
      const updatedAll = [...productsSell];

      // 5) Recalcular y persistir
      for (const prod of productosObjetivo) {
        const categoria = (prod.categoria_producto || "").toLowerCase();
        let nuevoPrecio = Number(prod.precio || 0);

        if (categoria === "bovino" && hayBovinos) {
          const costo = parseARNumber(prod?.costo ?? 0);
          nuevoPrecio = parseFloat(((1 + margenNum / 100) * costo).toFixed(2));
        } else if (categoria === "porcino" && hayPorcinos) {
          nuevoPrecio = pigPriceNum; // precio manual para porcino
        } else {
          // otras categorías: no tocar
          continue;
        }

        const payload = { precio: nuevoPrecio, kg: prod.kg, tropa: prod.tropa };

        const putRes = await fetch(`${apiUrl}/ventas/${params.id}/productos/${prod.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productoId: prod.id, nuevoProducto: payload }),
        });

        if (!putRes.ok) {
          console.error(`Error actualizando producto ${prod.id}`);
          continue;
        }

        const iF = updatedFiltered.findIndex((p) => p.id === prod.id);
        if (iF !== -1) updatedFiltered[iF] = { ...updatedFiltered[iF], precio: nuevoPrecio };

        const iA = updatedAll.findIndex((p) => p.id === prod.id);
        if (iA !== -1) updatedAll[iA] = { ...updatedAll[iA], precio: nuevoPrecio };
      }

      setFilteredProducts(updatedFiltered);
      setProductsSell(updatedAll);

      // 6) Recalcular totales de la venta en backend
      await fetch(`${apiUrl}/ventas/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ clienteId: venta.cliente_id }),
      });

      // 7) Refrescar datos
      await Promise.all([loadVenta(params.id), loadProductsSell(params.id)]);
    } catch (err) {
      console.error("Error en handleRecalcAll:", err);
      alert("Ocurrió un error al recalcular.");
    } finally {
      setRecalcLoading(false); // ⬅️ fin spinner botón
    }
  };

  // ===== Paginación sobre lo filtrado =====
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentFilteredProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const paginate = (n) => setCurrentPage(n);

  // ===== Spinner inicial de carga =====
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <div className="d-flex align-items-center">
          <Spinner animation="border" role="status" />
          <span className="ms-2">Cargando venta y productos...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Productos Vendidos</h1>

      {/* Barra superior: recálculo + reimpresión */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          {/* Buscar */}
          <FormControl
            placeholder="Buscar por código, media, tropa o sucursal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 360 }}
          />

          {/* Porcino: precio único si hay porcinos visibles */}
          {filteredProducts.some((p) => (p.categoria_producto || "").toLowerCase() === "porcino") && (
            <FormControl
              type="number"
              step="0.01"
              value={pigPriceInput}
              onChange={(e) => setPigPriceInput(e.target.value)}
              placeholder="Precio único porcino"
              style={{ width: 180 }}
              className="ml-2"
            />
          )}

          <Button variant="warning" onClick={handleRecalcAll} disabled={recalcLoading} className="ml-2">
            {recalcLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Recalculando...
              </>
            ) : (
              "Recalcular"
            )}
          </Button>
        </div>

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
            <th onClick={() => handleSort("ingreso_id")} style={{ cursor: "pointer" }}>
              Num Ingreso
            </th>
            <th onClick={() => handleSort("codigo_de_barra")} style={{ cursor: "pointer" }}>
              Código de Barra
            </th>
            <th onClick={() => handleSort("num_media")} style={{ cursor: "pointer" }}>
              Número de Media
            </th>
            <th onClick={() => handleSort("precio")} style={{ cursor: "pointer" }}>
              Precio
            </th>
            <th onClick={() => handleSort("kg")} style={{ cursor: "pointer" }}>
              Peso
            </th>
            <th onClick={() => handleSort("tropa")} style={{ cursor: "pointer" }}>
              Tropa
            </th>
            <th onClick={() => handleSort("categoria_producto")} style={{ cursor: "pointer" }}>
              Categoría
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
                ) : product.precio ? (
                  Number(product.precio).toLocaleString("es-AR", { style: "currency", currency: "ARS" })
                ) : (
                  ""
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
                      <Button variant="danger" onClick={() => handleDelete(product.id)} className="mx-2">
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

      {/* Paginación */}
      <div>
        {pageNumbers.map((n) => (
          <Button key={n} onClick={() => paginate(n)} className="mx-1">
            {n}
          </Button>
        ))}
      </div>

      {/* Resumen por categoría */}
      <CategorySummaryTable filteredProducts={filteredProducts} />
    </Container>
  );
}
