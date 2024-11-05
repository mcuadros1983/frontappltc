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
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [totalAmount, setTotalAmount] = useState(0);

  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const validateDates = () => {
    if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
      alert("La fecha desde no puede ser mayor que la fecha hasta.");
      return false;
    }
    return true;
  };

  const loadUsuarios = useCallback(async () => {
    if (context.user.rol_id === 1) {
      try {
        const res = await fetch(`${apiUrl}/usuarios`, { credentials: "include" });
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

  const loadCustomers = useCallback(
    async (filters = {}, isFilter = false) => {
      try {
        const res = await fetch(`${apiUrl}/caja/clientesoneshot_filtrados`, {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        const total = data.reduce((sum, customer) => sum + parseFloat(customer.monto || 0), 0);
        setTotalAmount(total);
      } catch (error) {
        console.error("Error al cargar los clientes filtrados:", error);
        setCustomersOneShot([]);
        setTotalAmount(0);
      }
    },
    [apiUrl, context.user.rol_id]
  );

  useEffect(() => {
    if (context.user.rol_id === 1) {
      loadCustomers();
    } else {
      loadCustomers({ usuario_id: context.user.id });
    }
  }, [loadCustomers, context.user.rol_id, context.user.id]);

  const handleFilter = () => {
    if (!validateDates()) return;

    const filters = {};

    if (fechaDesde) filters.fechaDesde = fechaDesde;
    if (fechaHasta) filters.fechaHasta = fechaHasta;

    if (context.user.rol_id === 1) {
      if (usuarioId) filters.usuario_id = usuarioId;
    } else {
      filters.usuario_id = context.user.id;
    }

    if (!fechaDesde && !fechaHasta && !usuarioId) {
      loadCustomers();
    } else {
      loadCustomers(filters, true);
    }
  };

  const handleResetFilters = () => {
    setFechaDesde("");
    setFechaHasta("");
    setUsuarioId("");

    if (context.user.rol_id === 1) {
      loadCustomers();
    } else {
      loadCustomers({ usuario_id: context.user.id });
    }
  };

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customersOneShot.slice(indexOfFirstCustomer, indexOfLastCustomer);

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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este cliente?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${apiUrl}/caja/clientesoneshot/${id}/`, {
        credentials: "include",
        method: "DELETE",
      });

      if (res.ok) {
        setCustomersOneShot(customersOneShot.filter((customer) => customer.id !== id));
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

      <div className="mb-3">
        <strong>Total: ${totalAmount.toFixed(2)}</strong>
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
                <th>Lote/Cupon</th>
                {/* <th>Cupón</th> */}
                {context.user.rol_id === 1 && <th>Usuario</th>}
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
                  <td>{customer.mail || ""}</td> {/* Default to empty string */}
                  <td>{customer.telefono}</td>
                  <td>{customer.domicilio || ""}</td> {/* Default to empty string */}
                  <td>{customer.monto}</td>
                  <td>{customer.lote_cupon || ""}</td> {/* Default to empty string */}
                  {/* <td>{customer.cupon || ""}</td> Default to empty string */}
                  {context.user.rol_id === 1 && (
                    <td>
                      {usuarios.find((usuario) => usuario.id === customer.usuario_id)?.usuario ||
                        "Desconocido"}
                    </td>
                  )}
                  <td>{customer.fecha}</td>
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
                        onClick={() => navigate(`/clientesoneshot/${customer.id}/edit`)}
                      >
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center align-items-center">
            <Button onClick={prevPage} disabled={currentPage === 1}>
              <BsChevronLeft />
            </Button>
            <span className="mx-2">
              Página {currentPage} de {Math.ceil(customersOneShot.length / customersPerPage)}
            </span>
            <Button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(customersOneShot.length / customersPerPage)}
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
