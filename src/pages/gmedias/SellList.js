// import React, { useContext, useEffect, useState, useCallback } from "react";
// import {
//   Table,
//   Container,
//   Button,
//   FormControl,
//   Dropdown,
// } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import Contexts from "../../context/Contexts";
// import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

// export default function SellList() {
//   const [sells, setSells] = useState([]);
//   const [filteredSells, setFilteredSells] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [editingSellId, setEditingSellId] = useState(null);
//   const [selectedClient, setSelectedClient] = useState("");
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
//   const [clients, setClients] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sellsPerPage] = useState(20);
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortDirection, setSortDirection] = useState("asc");


//   const context = useContext(Contexts.UserContext);
//   const navigate = useNavigate();

//   const apiUrl = process.env.REACT_APP_API_URL;

//   const loadSells = useCallback(async () => {
//     try {
//       const res = await fetch(`${apiUrl}/ventas/`, {
//         credentials: "include",
//         include: [
//           {
//             model: "Cliente",
//             attributes: ["id", "nombre"],
//           },
//           {
//             model: "FormaPago",
//             attributes: ["id", "tipo"],
//           },
//           {
//             model: "Producto",
//             attributes: [
//               "id",
//               "codigo_de_barra",
//               "num_media",
//               "precio",
//               "kg",
//               "tropa",
//               "sucursal_id",
//             ],
//             as: "productos",
//           },
//         ],
//       });

//       const data = await res.json();
//       const sortedSells = data.sort((a, b) => b.id - a.id);
//       setSells(sortedSells);
//     } catch (error) {
//       console.error(error);
//     }
//   }, [apiUrl]);

//   const loadClients = useCallback(async () => {
//     try {
//       const res = await fetch(`${apiUrl}/clientes/`, {
//         credentials: "include",
//       });
//       const data = await res.json();
//       setClients(data);
//     } catch (error) {
//       console.error(error);
//     }
//   }, [apiUrl]);

//   const loadPaymentMethods = useCallback(async () => {
//     try {
//       const res = await fetch(`${apiUrl}/formas-pago`, {
//         credentials: "include",
//       });
//       const data = await res.json();
//       setPaymentMethods(data);
//     } catch (error) {
//       console.error(error);
//     }
//   }, [apiUrl]);

//   const handleSearch = useCallback(() => {
//     const searchTermLower = searchTerm.toLowerCase();
//     const startDateFilter = startDate ? startDate : null;
//     const endDateFilter = endDate ? endDate : null;

//     if (searchTermLower === "" && !startDate && !endDate) {
//       setFilteredSells(sells);
//     } else {
//       const filtered = sells.filter((sell) => {
//         const matchesCustomer =
//           sell.Cliente &&
//           sell.Cliente.nombre.toLowerCase().includes(searchTermLower);
//         const sellDate = sell.fecha;

//         const matchesDate =
//           (!startDateFilter || sellDate >= startDateFilter) &&
//           (!endDateFilter || sellDate <= endDateFilter);

//         return matchesCustomer && matchesDate;
//       });

//       setFilteredSells(filtered);
//     }
//   }, [searchTerm, startDate, endDate, sells]);

//   useEffect(() => {
//     loadSells();
//     loadClients();
//     loadPaymentMethods();
//   }, [loadSells, loadClients, loadPaymentMethods]);

//   useEffect(() => {
//     handleSearch();
//   }, [handleSearch, startDate, endDate]);

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm(
//       "¿Estás seguro de que deseas eliminar esta venta?"
//     );
//     if (!confirmDelete) {
//       return;
//     }
//     try {
//       await fetch(`${apiUrl}/ventas/${id}`, {
//         credentials: "include",
//         method: "DELETE",
//       });
//       setSells(sells.filter((sell) => sell.id !== id));
//     } catch (error) {
//       console.log(error);
//     }
//   };


//   const handleEditClient = (sellId) => {
//     const sell = sells.find((s) => s.id === sellId);
//     if (sell && sell.Cliente) {
//       setSelectedClient(sell.Cliente); // Asigna el cliente, no todo el objeto `sell`.
//     } else {
//       setSelectedClient(null); // Si no hay cliente, reinicia el estado.
//     }
//     setEditingSellId({ id: sellId, type: "client" });
//   };

//   const handleEditPaymentMethod = (sellId) => {
//     console.log("primero", sellId, sells)
//     const sell = sells.find((s) => s.id === sellId);
//     console.log("segundo", sell)
//     if (sell && sell.FormaPago) {
//       setSelectedPaymentMethod(sell.FormaPago); // Establecer la forma de pago actual
//       setSelectedClient(sell.Cliente);
//     }
//     setEditingSellId({ id: sellId, type: "paymentMethod" });
//   };

//   const handleChangeClient = (eventKey) => {
//     const selectedClient = clients.find((client) => client.nombre === eventKey);

//     setSelectedClient(selectedClient);
//   };

//   const handleChangePaymentMethod = (eventKey) => {

//     const selectedPaymentMethod = paymentMethods.find(
//       (method) => method.tipo === eventKey
//     );

//     setSelectedPaymentMethod(selectedPaymentMethod);

//   };

//   const handleCancelEdit = () => {
//     setSelectedClient("");
//     setSelectedPaymentMethod("");
//     setEditingSellId(null);
//   };

//   const handleSaveEdit = async () => {
//     try {
//       let requestBody = {};
//       if (selectedClient !== "") {
//         requestBody.clienteId = selectedClient.id;
//       }
//       if (selectedPaymentMethod !== "") {
//         requestBody.formaPagoId = selectedPaymentMethod.id;
//       }

//       await fetch(`${apiUrl}/ventas/${editingSellId.id}`, {
//         credentials: "include",
//         method: "PUT",
//         body: JSON.stringify(requestBody),
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       setEditingSellId(null);
//       loadSells(); // Recargar ventas después de guardar la edición
//     } catch (error) {
//       console.error("Error al guardar la edición:", error);
//     }
//   };

//   const handleSort = (columnName) => {
//     const newSortDirection = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
//     setSortColumn(columnName);
//     setSortDirection(newSortDirection);

//     const sortedSells = [...filteredSells].sort((a, b) => {
//       const valueA = a[columnName] ?? "";
//       const valueB = b[columnName] ?? "";

//       if (typeof valueA === "number" && typeof valueB === "number") {
//         return newSortDirection === "asc" ? valueA - valueB : valueB - valueA;
//       }

//       return newSortDirection === "asc"
//         ? String(valueA).localeCompare(String(valueB))
//         : String(valueB).localeCompare(String(valueA));
//     });

//     setFilteredSells(sortedSells);
//   };

//   const indexOfLastSell = currentPage * sellsPerPage;
//   const indexOfFirstSell = indexOfLastSell - sellsPerPage;
//   const currentSells = [...filteredSells] // Crea una copia para evitar modificar el original
//     .slice(indexOfFirstSell, indexOfLastSell); // Aplica la paginación

//   const nextPage = () => {
//     setCurrentPage(currentPage + 1);
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   return (
//     <Container>
//       <h1 className="my-list-title dark-text">Lista de Ventas</h1>
//       <div className="mb-3">
//         <div className="d-inline-block w-auto">
//           <label className="mr-2">DESDE: </label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="form-control rounded-0 border-transparent text-center"
//           />
//         </div>
//         <div className="d-inline-block w-auto ml-2">
//           <label className="ml-2 mr-2">HASTA:</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="form-control rounded-0 border-transparent text-center"
//           />
//         </div>
//       </div>
//       <div className="mb-3">
//         <FormControl
//           type="text"
//           placeholder="Buscar por cliente"
//           className="mr-sm-2"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       <Table striped bordered hover>

//         <thead>
//           <tr>
//             <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>#</th>
//             <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>Fecha de venta</th>
//             <th onClick={() => handleSort("Cliente.nombre")} style={{ cursor: "pointer" }}>Cliente</th>
//             <th onClick={() => handleSort("FormaPago.tipo")} style={{ cursor: "pointer" }}>Forma Pago</th>
//             <th onClick={() => handleSort("monto_total")} style={{ cursor: "pointer" }}>Monto</th>
//             <th>Operaciones</th>
//           </tr>
//         </thead>

//         <tbody>
//           {currentSells.map((sell) => (
//             <tr
//               key={sell.id}
//               style={{ cursor: "pointer" }}
//               onDoubleClick={() => navigate(`/sells/${sell.id}/products`)}
//             >
//               <td>{sell.id}</td>
//               <td>{sell.fecha}</td>
//               <td>
//                 {editingSellId &&
//                   editingSellId.id === sell.id &&
//                   editingSellId.type === "client" ? (
//                   <Dropdown onSelect={handleChangeClient}>
//                     <Dropdown.Toggle variant="success" id="dropdown-basic">
//                       {selectedClient && selectedClient.nombre
//                         ? selectedClient.nombre
//                         : "Seleccionar cliente"}
//                     </Dropdown.Toggle>
//                     <Dropdown.Menu>
//                       {clients.map((client) => (
//                         <Dropdown.Item key={client.id} eventKey={client.nombre}>
//                           {client.nombre}
//                         </Dropdown.Item>
//                       ))}
//                     </Dropdown.Menu>
//                   </Dropdown>
//                 ) : sell.Cliente ? (
//                   sell.Cliente.nombre
//                 ) : (
//                   "Cliente Desconocido"
//                 )}
//               </td>
//               <td>
//                 {editingSellId &&
//                   editingSellId.id === sell.id &&
//                   editingSellId.type === "paymentMethod" ? (
//                   <Dropdown onSelect={handleChangePaymentMethod}>
//                     <Dropdown.Toggle variant="success" id="dropdown-basic">
//                       {selectedPaymentMethod
//                         ? selectedPaymentMethod.tipo
//                         : "Seleccionar forma de pago"}
//                     </Dropdown.Toggle>
//                     <Dropdown.Menu>
//                       {paymentMethods.map((method) => (
//                         <Dropdown.Item key={method.id} eventKey={method.tipo}>
//                           {method.tipo}
//                         </Dropdown.Item>
//                       ))}
//                     </Dropdown.Menu>
//                   </Dropdown>
//                 ) : sell.FormaPago ? (
//                   sell.FormaPago.tipo
//                 ) : (
//                   "Forma de pago desconocida"
//                 )}
//               </td>

//               <td>
//                 {sell.productos
//                   .reduce((total, producto) => {
//                     return total + producto.precio * producto.kg;
//                   }, 0)
//                   .toLocaleString("es-AR", {
//                     style: "currency",
//                     currency: "ARS",
//                     minimumFractionDigits: 2,
//                   })}
//               </td>

//               <td className="text-center">
//                 {editingSellId && editingSellId.id === sell.id ? (
//                   <>
//                     <Button
//                       variant="primary"
//                       onClick={handleSaveEdit}
//                       className="mx-2"
//                     >
//                       Guardar
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       onClick={handleCancelEdit}
//                       className="mx-2"
//                     >
//                       Cancelar
//                     </Button>
//                   </>
//                 ) : (
//                   <>
//                     <Button
//                       variant="primary"
//                       onClick={() => handleEditClient(sell.id)}
//                       className="mx-2"
//                     >
//                       Editar Cliente
//                     </Button>
//                     <Button
//                       variant="primary"
//                       onClick={() => handleEditPaymentMethod(sell.id)}
//                       className="mx-2"
//                     >
//                       Editar FPago
//                     </Button>
//                   </>
//                 )}
//                 {context.user && context.user.usuario === "admin" && (
//                   <Button
//                     variant="danger"
//                     onClick={() => handleDelete(sell.id)}
//                     className="mx-2"
//                   >
//                     Eliminar
//                   </Button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//       <div className="d-flex justify-content-between">
//         <Button onClick={prevPage} disabled={currentPage === 1}>
//           <BsChevronLeft />
//         </Button>
//         <span>
//           Página {currentPage} de{" "}
//           {Math.ceil(filteredSells.length / sellsPerPage)}
//         </span>
//         <Button
//           onClick={nextPage}
//           disabled={
//             currentPage === Math.ceil(filteredSells.length / sellsPerPage)
//           }
//         >
//           <BsChevronRight />
//         </Button>
//       </div>
//     </Container>
//   );
// }

import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Table,
  Container,
  Button,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function SellList() {
  const [sells, setSells] = useState([]);
  const [filteredSells, setFilteredSells] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingSellId, setEditingSellId] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [clients, setClients] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const loadSells = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/ventas/`, {
        credentials: "include",
      });
      const data = await res.json();
      const sortedSells = data.sort((a, b) => b.id - a.id);
      setSells(sortedSells);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/clientes/`, {
        credentials: "include",
      });
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  const loadPaymentMethods = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/formas-pago`, {
        credentials: "include",
      });
      const data = await res.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl]);

  const handleSearch = useCallback(() => {
    const startDateFilter = startDate ? startDate : null;
    const endDateFilter = endDate ? endDate : null;

    const filtered = sells.filter((sell) => {
      const matchesCustomer =
        !searchTerm || (sell.Cliente && sell.Cliente.nombre === searchTerm);

      const sellDate = sell.fecha;
      const matchesDate =
        (!startDateFilter || sellDate >= startDateFilter) &&
        (!endDateFilter || sellDate <= endDateFilter);

      return matchesCustomer && matchesDate;
    });

    setFilteredSells(filtered);
  }, [searchTerm, startDate, endDate, sells]);

  useEffect(() => {
    loadSells();
    loadClients();
    loadPaymentMethods();
  }, [loadSells, loadClients, loadPaymentMethods]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch, startDate, endDate]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta venta?");
    if (!confirmDelete) return;

    try {
      await fetch(`${apiUrl}/ventas/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      setSells(sells.filter((sell) => sell.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClient = (sellId) => {
    const sell = sells.find((s) => s.id === sellId);
    if (sell && sell.Cliente) {
      setSelectedClient(sell.Cliente);
    } else {
      setSelectedClient(null);
    }
    setEditingSellId({ id: sellId, type: "client" });
  };

  const handleEditPaymentMethod = (sellId) => {
    const sell = sells.find((s) => s.id === sellId);
    if (sell && sell.FormaPago) {
      setSelectedPaymentMethod(sell.FormaPago);
      setSelectedClient(sell.Cliente);
    }
    setEditingSellId({ id: sellId, type: "paymentMethod" });
  };

  const handleChangeClient = (eventKey) => {
    const selected = clients.find((client) => client.nombre === eventKey);
    setSelectedClient(selected);
  };

  const handleChangePaymentMethod = (eventKey) => {
    const selected = paymentMethods.find((method) => method.tipo === eventKey);
    setSelectedPaymentMethod(selected);
  };

  const handleCancelEdit = () => {
    setSelectedClient("");
    setSelectedPaymentMethod("");
    setEditingSellId(null);
  };

  const handleSaveEdit = async () => {
    try {
      let requestBody = {};
      if (selectedClient !== "") requestBody.clienteId = selectedClient.id;
      if (selectedPaymentMethod !== "") requestBody.formaPagoId = selectedPaymentMethod.id;

      await fetch(`${apiUrl}/ventas/${editingSellId.id}`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setEditingSellId(null);
      loadSells();
    } catch (error) {
      console.error("Error al guardar la edición:", error);
    }
  };

  const handleSort = (columnName) => {
    const newSortDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newSortDirection);

    const sortedSells = [...filteredSells].sort((a, b) => {
      const valueA = a[columnName] ?? "";
      const valueB = b[columnName] ?? "";

      if (typeof valueA === "number" && typeof valueB === "number") {
        return newSortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      return newSortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setFilteredSells(sortedSells);
  };

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = [...filteredSells].slice(indexOfFirstSell, indexOfLastSell);

  const nextPage = () => setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Ventas</h1>

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
      </div>

      <div className="mb-3">
        <label className="mr-2">Cliente:</label>
        <FormControl
          as="select"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-25"
        >
          <option value="">Todos los clientes</option>
          {[...clients]
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((client) => (
              <option key={client.id} value={client.nombre}>
                {client.nombre}
              </option>
            ))}
        </FormControl>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>#</th>
            <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>Fecha</th>
            <th onClick={() => handleSort("Cliente.nombre")} style={{ cursor: "pointer" }}>Cliente</th>
            <th onClick={() => handleSort("FormaPago.tipo")} style={{ cursor: "pointer" }}>Forma de Pago</th>
            <th onClick={() => handleSort("monto_total")} style={{ cursor: "pointer" }}>Monto</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentSells.map((sell) => (
            <tr
              key={sell.id}
              style={{ cursor: "pointer" }}
              onDoubleClick={() => navigate(`/sells/${sell.id}/products`)}
            >
              <td>{sell.id}</td>
              <td>{sell.fecha}</td>
              <td>
                {editingSellId && editingSellId.id === sell.id && editingSellId.type === "client" ? (
                  <Dropdown onSelect={handleChangeClient}>
                    <Dropdown.Toggle variant="success">
                      {selectedClient?.nombre || "Seleccionar cliente"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {[...clients]
                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                        .map((client) => (
                          <Dropdown.Item key={client.id} eventKey={client.nombre}>
                            {client.nombre}
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : sell.Cliente ? (
                  sell.Cliente.nombre
                ) : (
                  "Cliente Desconocido"
                )}
              </td>
              <td>
                {editingSellId && editingSellId.id === sell.id && editingSellId.type === "paymentMethod" ? (
                  <Dropdown onSelect={handleChangePaymentMethod}>
                    <Dropdown.Toggle variant="success">
                      {selectedPaymentMethod?.tipo || "Seleccionar forma de pago"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {[...paymentMethods]
                        .sort((a, b) => a.tipo.localeCompare(b.tipo))
                        .map((method) => (
                          <Dropdown.Item key={method.id} eventKey={method.tipo}>
                            {method.tipo}
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : sell.FormaPago ? (
                  sell.FormaPago.tipo
                ) : (
                  "Forma de pago desconocida"
                )}
              </td>
              <td>
                {sell.productos
                  .reduce((total, p) => total + p.precio * p.kg, 0)
                  .toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumFractionDigits: 2,
                  })}
              </td>
              <td className="text-center">
                {editingSellId && editingSellId.id === sell.id ? (
                  <>
                    <Button variant="primary" onClick={handleSaveEdit} className="mx-2">Guardar</Button>
                    <Button variant="secondary" onClick={handleCancelEdit} className="mx-2">Cancelar</Button>
                  </>
                ) : (
                  <>
                    <Button variant="primary" onClick={() => handleEditClient(sell.id)} className="mx-2">Editar Cliente</Button>
                    <Button variant="primary" onClick={() => handleEditPaymentMethod(sell.id)} className="mx-2">Editar FPago</Button>
                  </>
                )}
                {context.user?.usuario === "admin" && (
                  <Button variant="danger" onClick={() => handleDelete(sell.id)} className="mx-2">Eliminar</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between">
        <Button onClick={prevPage} disabled={currentPage === 1}><BsChevronLeft /></Button>
        <span>Página {currentPage} de {Math.ceil(filteredSells.length / sellsPerPage)}</span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredSells.length / sellsPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
