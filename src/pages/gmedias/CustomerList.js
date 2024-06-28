import { useEffect, useState, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10); // Número de clientes por página

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // const loadCustomers = useCallback(async () => {
  //   const res = await fetch(`${apiUrl}/clientes/`, {
  //     credentials: "include",
  //   });
  //   const data = await res.json();
  //   console.log("data", data)
  //   // const sortedCustomers = data.sort((a, b) => a.id - b.id);
  //   const sortedCustomers = data.sort((a, b) => {
  //     if (a.nombre === "CENTRAL") return -1;
  //     if (b.nombre === "CENTRAL") return 1;
  //     return a.nombre.localeCompare(b.nombre);
  //   });
  //   setCustomers(sortedCustomers);
  // },[apiUrl]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/clientes/`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sortedCustomers = data.sort((a, b) => {
          if (a.nombre === "CENTRAL") return -1;
          if (b.nombre === "CENTRAL") return 1;
          return a.nombre.localeCompare(b.nombre);
        });
        setCustomers(sortedCustomers);
      } else {
        setCustomers([]); // Set to empty array if data is empty or not an array
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]); // Handle error by setting customers to empty array
    }
  }, [apiUrl]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este cliente?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/clientes/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (res.status === 204) {
        // Eliminación exitosa, actualiza el estado del cliente eliminado
        setCustomers(customers.filter((customer) => customer.id !== id));
      } else {
        // Si hay un error, intenta extraer el mensaje del cuerpo de la respuesta
        const data = await res.json();
        const errorMessage =
          data && data.message ? data.message : "Error desconocido";
        alert(errorMessage);
      }
    } catch (error) {
      console.log(error);
      alert("Error desconocido al eliminar el cliente");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Lista de Clientes</h1>
      {/* <Table striped bordered hover variant="dark"> */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre Cliente</th>
            <th>Margen %</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.nombre}</td>
              <td>{customer.margen}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(customer.id)}
                  className="mx-2"
                >
                  Eliminar
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate(`/customers/${customer.id}/edit`)}
                >
                  Editar
                </Button>
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
          Página {currentPage} de{" "}
          {Math.ceil(customers.length / customersPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(customers.length / customersPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
