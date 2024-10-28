// import React, { useEffect, useState, useCallback, useContext } from "react";
// import { Table, Container, Button, Form } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { BsChevronLeft, BsChevronRight } from "react-icons/bs"; // Importar íconos para la paginación
// import Contexts from "../../context/Contexts"; // Importar el contexto

// export default function CustomerOneShotList() {
//   const [customersOneShot, setCustomersOneShot] = useState([]);
//   const [fechaDesde, setFechaDesde] = useState("");
//   const [fechaHasta, setFechaHasta] = useState("");
//   const [usuarioId, setUsuarioId] = useState("");
//   const [usuarios, setUsuarios] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
//   const [customersPerPage] = useState(10); // Número de clientes por página
//   const [totalAmount, setTotalAmount] = useState(0); // Estado para almacenar la suma total

//   const context = useContext(Contexts.UserContext); // Obtener el usuario del contexto
//   const navigate = useNavigate();
//   const apiUrl = process.env.REACT_APP_API_URL;

//   // Validar fechas
//   const validateDates = () => {
//     if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
//       alert("La fecha desde no puede ser mayor que la fecha hasta.");
//       return false;
//     }
//     return true;
//   };

//   // Cargar la lista de usuarios (solo si rol_id = 1)
//   const loadUsuarios = useCallback(async () => {
//     if (context.user.rol_id === 1) {
//       try {
//         const res = await fetch(`${apiUrl}/usuarios`, { credentials: "include" });
//         const data = await res.json();
//         setUsuarios(data);
//       } catch (error) {
//         console.error("Error al cargar los usuarios:", error);
//       }
//     }
//   }, [apiUrl, context.user.rol_id]);

//   useEffect(() => {
//     loadUsuarios();
//   }, [loadUsuarios]);

//   // Cargar los clientes y calcular la suma total
//   const loadCustomers = useCallback(async (filters = {}) => {
//     try {
//       const res = await fetch(`${apiUrl}/caja/clientesoneshot_filtrados`, {
//         credentials: "include",
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(filters),
//       });
//       const data = await res.json();
//       if (data.length === 0) {
//         alert(context.user.rol_id === 1 ? "No existen clientes para el periodo o usuario seleccionado." : "No hay clientes para la fecha seleccionada.");
//       }

//       setCustomersOneShot(data);

//       // Calcular la suma total de los montos
//       const total = data.reduce((sum, customer) => sum + parseFloat(customer.monto || 0), 0);
//       setTotalAmount(total);
//     } catch (error) {
//       console.error("Error al cargar los clientes filtrados:", error);
//       setCustomersOneShot([]);
//       setTotalAmount(0); // Reiniciar la suma si hay error
//     }
//   }, [apiUrl, context.user.rol_id]);

//   useEffect(() => {
//     // Cargar todos los clientes al inicio según el rol
//     if (context.user.rol_id === 1) {
//       loadCustomers(); // Cargar todos los clientes
//     } else {
//       loadCustomers({ usuario_id: context.user.id }); // Cargar clientes solo del usuario actual
//     }
//   }, [loadCustomers, context.user.rol_id, context.user.id]);

//   const handleFilter = () => {
//     if (!validateDates()) return; // Validar las fechas antes de aplicar el filtro

//     const filters = {};

//     // Aplicar filtro por fecha
//     if (fechaDesde) filters.fechaDesde = fechaDesde;
//     if (fechaHasta) filters.fechaHasta = fechaHasta;

//     // Aplicar filtro por usuario solo si el rol es 1
//     if (context.user.rol_id === 1) {
//       if (usuarioId) {
//         filters.usuario_id = usuarioId;
//       }
//     } else {
//       filters.usuario_id = context.user.id; // Filtrar solo por el usuario actual si el rol no es 1
//     }

//     // Si no hay filtros aplicados, volver a mostrar todo
//     if (!fechaDesde && !fechaHasta && !usuarioId) {
//       loadCustomers();
//     } else {
//       loadCustomers(filters);
//     }
//   };

//   // Función para limpiar los filtros
//   const handleResetFilters = () => {
//     setFechaDesde("");
//     setFechaHasta("");
//     setUsuarioId("");

//     // Mostrar todos los clientes según el rol
//     if (context.user.rol_id === 1) {
//       loadCustomers(); // Mostrar todos los clientes para rol_id = 1
//     } else {
//       loadCustomers({ usuario_id: context.user.id }); // Mostrar clientes del usuario actual si rol_id !== 1
//     }
//   };

//   // Lógica de paginación
//   const indexOfLastCustomer = currentPage * customersPerPage;
//   const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
//   const currentCustomers = customersOneShot.slice(indexOfFirstCustomer, indexOfLastCustomer);

//   const nextPage = () => {
//     if (currentPage < Math.ceil(customersOneShot.length / customersPerPage)) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // Función para eliminar un cliente
//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este cliente?");
//     if (!confirmDelete) return;

//     try {
//       const res = await fetch(`${apiUrl}/caja/clientesoneshot/${id}/`, {
//         credentials: "include",
//         method: "DELETE",
//       });

//       if (res.ok) {
//         setCustomersOneShot(customersOneShot.filter((customer) => customer.id !== id));
//         alert("Cliente eliminado con éxito.");
//       } else {
//         alert("Error al eliminar el cliente.");
//       }
//     } catch (error) {
//       console.error("Error al eliminar el cliente:", error);
//       alert("Error desconocido al eliminar el cliente.");
//     }
//   };

//   return (
//     <Container>
//       <h1 className="my-list-title dark-text">Lista de Clientes OneShot</h1>

//       {/* Filtros */}
//       <Form className="mb-3">
//         <Form.Group className="mb-3">
//           <Form.Label>Fecha Desde</Form.Label>
//           <Form.Control
//             type="date"
//             value={fechaDesde}
//             onChange={(e) => setFechaDesde(e.target.value)}
//           />
//         </Form.Group>
//         <Form.Group className="mb-3">
//           <Form.Label>Fecha Hasta</Form.Label>
//           <Form.Control
//             type="date"
//             value={fechaHasta}
//             onChange={(e) => setFechaHasta(e.target.value)}
//           />
//         </Form.Group>

//         {/* Mostrar filtro por usuario solo si el rol es 1 */}
//         {context.user.rol_id === 1 && (
//           <Form.Group className="mb-3">
//             <Form.Label>Usuario</Form.Label>
//             <Form.Control
//               as="select"
//               value={usuarioId}
//               onChange={(e) => setUsuarioId(e.target.value)}
//             >
//               <option value="">Seleccione un usuario</option>
//               {usuarios.map((usuario) => (
//                 <option key={usuario.id} value={usuario.id}>
//                   {usuario.usuario}
//                 </option>
//               ))}
//             </Form.Control>
//           </Form.Group>
//         )}

//         <div className="d-flex justify-content-start">
//           <Button onClick={handleFilter} className="me-2 mx-md-2">
//             Filtrar
//           </Button>
//           <Button variant="secondary" onClick={handleResetFilters}>
//             Limpiar Filtros
//           </Button>
//         </div>
//       </Form>

//       {/* Mostrar el total del monto */}
//       <div className="mb-3">
//         <strong>Total: ${totalAmount.toFixed(2)}</strong> {/* Mostrar la suma total de los montos */}
//       </div>

//       {customersOneShot.length > 0 ? (
//         <>
//           <Table striped bordered hover>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Apellido</th>
//                 <th>Nombre</th>
//                 <th>DNI</th>
//                 <th>Correo</th>
//                 <th>Teléfono</th>
//                 <th>Domicilio</th>
//                 <th>Monto</th>
//                 {context.user.rol_id === 1 && <th>Usuario</th>} {/* Mostrar Usuario si rol_id es 1 */}
//                 <th>Fecha</th>
//                 <th>Operaciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentCustomers.map((customer) => (
//                 <tr key={customer.id}>
//                   <td>{customer.id}</td>
//                   <td>{customer.apellido}</td>
//                   <td>{customer.nombre}</td>
//                   <td>{customer.dni}</td>
//                   <td>{customer.mail}</td>
//                   <td>{customer.telefono}</td>
//                   <td>{customer.domicilio}</td>
//                   <td>{customer.monto}</td>
//                   {context.user.rol_id === 1 && (
//                     <td>
//                       {
//                         usuarios.find((usuario) => usuario.id === customer.usuario_id)
//                           ?.usuario || "Desconocido"
//                       }
//                     </td>
//                   )}
//                   <td>{customer.fecha}</td> {/* Columna de Fecha */}
//                   <td className="text-center">
//                     <div className="d-flex flex-column flex-md-row justify-content-around">
//                       <Button
//                         variant="danger"
//                         className="mb-2 mb-md-0 mx-md-2"
//                         onClick={() => handleDelete(customer.id)}
//                       >
//                         Eliminar
//                       </Button>
//                       <Button
//                         className="btn-warning mx-md-2"
//                         onClick={() => navigate(`/clientesoneshot/${customer.id}/edit`)}
//                       >
//                         Editar
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>

//           {/* Paginación */}
//           <div className="d-flex justify-content-center align-items-center">
//             <Button onClick={prevPage} disabled={currentPage === 1}>
//               <BsChevronLeft />
//             </Button>
//             <span className="mx-2">
//               Página {currentPage} de {Math.ceil(customersOneShot.length / customersPerPage)}
//             </span>
//             <Button
//               onClick={nextPage}
//               disabled={currentPage === Math.ceil(customersOneShot.length / customersPerPage)}
//             >
//               <BsChevronRight />
//             </Button>
//           </div>
//         </>
//       ) : (
//         <p>No hay clientes disponibles.</p>
//       )}
//     </Container>
//   );
// }

import React, { useEffect, useState, useCallback, useContext } from "react";
import { Table, Container, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"; // Importar íconos para la paginación
import Contexts from "../../context/Contexts"; // Importar el contexto

export default function CustomerOneShotList() {
  const [customersOneShot, setCustomersOneShot] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [customersPerPage] = useState(10); // Número de clientes por página
  const [totalAmount, setTotalAmount] = useState(0); // Estado para almacenar la suma total

  const context = useContext(Contexts.UserContext); // Obtener el usuario del contexto
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Validar fechas
  const validateDates = () => {
    if (
      fechaDesde &&
      fechaHasta &&
      new Date(fechaDesde) > new Date(fechaHasta)
    ) {
      alert("La fecha desde no puede ser mayor que la fecha hasta.");
      return false;
    }
    return true;
  };

  // Cargar la lista de usuarios (solo si rol_id = 1)
  const loadUsuarios = useCallback(async () => {
    if (context.user.rol_id === 1) {
      try {
        const res = await fetch(`${apiUrl}/usuarios`, {
          credentials: "include",
        });
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al cargar los usuarios:", error);
      }
    }
  }, [apiUrl, context.user.rol_id]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  // Cargar los clientes y calcular la suma total
  const loadCustomers = useCallback(
    async (filters = {}, isFilter = false) => {
      try {
        const res = await fetch(`${apiUrl}/caja/clientesoneshot_filtrados`, {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filters),
        });
        const data = await res.json();
        if (isFilter && data.length === 0) {
          alert(
            context.user.rol_id === 1
              ? "No existen clientes para el periodo o usuario seleccionado."
              : "No hay clientes para la fecha seleccionada."
          );
        }

        setCustomersOneShot(data);

        // Calcular la suma total de los montos
        const total = data.reduce(
          (sum, customer) => sum + parseFloat(customer.monto || 0),
          0
        );
        setTotalAmount(total);
      } catch (error) {
        console.error("Error al cargar los clientes filtrados:", error);
        setCustomersOneShot([]);
        setTotalAmount(0); // Reiniciar la suma si hay error
      }
    },
    [apiUrl, context.user.rol_id]
  );

  useEffect(() => {
    // Cargar todos los clientes al inicio según el rol
    if (context.user.rol_id === 1) {
      loadCustomers(); // Cargar todos los clientes
    } else {
      loadCustomers({ usuario_id: context.user.id }); // Cargar clientes solo del usuario actual
    }
  }, [loadCustomers, context.user.rol_id, context.user.id]);

  const handleFilter = () => {
    if (!validateDates()) return; // Validar las fechas antes de aplicar el filtro

    const filters = {};

    // Aplicar filtro por fecha
    if (fechaDesde) filters.fechaDesde = fechaDesde;
    if (fechaHasta) filters.fechaHasta = fechaHasta;

    // Aplicar filtro por usuario solo si el rol es 1
    if (context.user.rol_id === 1) {
      if (usuarioId) {
        filters.usuario_id = usuarioId;
      }
    } else {
      filters.usuario_id = context.user.id; // Filtrar solo por el usuario actual si el rol no es 1
    }

    // Si no hay filtros aplicados, volver a mostrar todo sin activar la alerta
    if (!fechaDesde && !fechaHasta && !usuarioId) {
      loadCustomers();
    } else {
      loadCustomers(filters, true); // Pasar isFilter como true para mostrar la alerta si no hay resultados
    }
  };

  // Función para limpiar los filtros
  const handleResetFilters = () => {
    setFechaDesde("");
    setFechaHasta("");
    setUsuarioId("");

    // Mostrar todos los clientes según el rol
    if (context.user.rol_id === 1) {
      loadCustomers(); // Mostrar todos los clientes para rol_id = 1
    } else {
      loadCustomers({ usuario_id: context.user.id }); // Mostrar clientes del usuario actual si rol_id !== 1
    }
  };

  // Lógica de paginación
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customersOneShot.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(customersOneShot.length / customersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Función para eliminar un cliente
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este cliente?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${apiUrl}/caja/clientesoneshot/${id}/`, {
        credentials: "include",
        method: "DELETE",
      });

      if (res.ok) {
        setCustomersOneShot(
          customersOneShot.filter((customer) => customer.id !== id)
        );
        alert("Cliente eliminado con éxito.");
      } else {
        alert("Error al eliminar el cliente.");
      }
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      alert("Error desconocido al eliminar el cliente.");
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Clientes OneShot</h1>

      {/* Filtros */}
      <Form className="mb-3">
        <Form.Group className="mb-3">
          <Form.Label>Fecha Desde</Form.Label>
          <Form.Control
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Fecha Hasta</Form.Label>
          <Form.Control
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </Form.Group>

        {/* Mostrar filtro por usuario solo si el rol es 1 */}
        {context.user.rol_id === 1 && (
          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              as="select"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
            >
              <option value="">Seleccione un usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.usuario}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        )}

        <div className="d-flex justify-content-start">
          <Button onClick={handleFilter} className="me-2 mx-md-2">
            Filtrar
          </Button>
          <Button variant="secondary" onClick={handleResetFilters}>
            Limpiar Filtros
          </Button>
        </div>
      </Form>

      {/* Mostrar el total del monto */}
      <div className="mb-3">
        <strong>Total: ${totalAmount.toFixed(2)}</strong>{" "}
        {/* Mostrar la suma total de los montos */}
      </div>

      {customersOneShot.length > 0 ? (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Domicilio</th>
                <th>Monto</th>
                {context.user.rol_id === 1 && <th>Usuario</th>}{" "}
                {/* Mostrar Usuario si rol_id es 1 */}
                <th>Fecha</th>
                <th>Operaciones</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.apellido}</td>
                  <td>{customer.nombre}</td>
                  <td>{customer.dni}</td>
                  <td>{customer.mail}</td>
                  <td>{customer.telefono}</td>
                  <td>{customer.domicilio}</td>
                  <td>{customer.monto}</td>
                  {context.user.rol_id === 1 && (
                    <td>
                      {usuarios.find(
                        (usuario) => usuario.id === customer.usuario_id
                      )?.usuario || "Desconocido"}
                    </td>
                  )}
                  <td>{customer.fecha}</td> {/* Columna de Fecha */}
                  <td className="text-center">
                    <div className="d-flex flex-column flex-md-row justify-content-around">
                      <Button
                        variant="danger"
                        className="mb-2 mb-md-0 mx-md-2"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Eliminar
                      </Button>
                      <Button
                        className="btn-warning mx-md-2"
                        onClick={() =>
                          navigate(`/clientesoneshot/${customer.id}/edit`)
                        }
                      >
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Paginación */}
          <div className="d-flex justify-content-center align-items-center">
            <Button onClick={prevPage} disabled={currentPage === 1}>
              <BsChevronLeft />
            </Button>
            <span className="mx-2">
              Página {currentPage} de{" "}
              {Math.ceil(customersOneShot.length / customersPerPage)}
            </span>
            <Button
              onClick={nextPage}
              disabled={
                currentPage ===
                Math.ceil(customersOneShot.length / customersPerPage)
              }
            >
              <BsChevronRight />
            </Button>
          </div>
        </>
      ) : (
        <p>No hay clientes disponibles.</p>
      )}
    </Container>
  );
}
