import React, { useState, useEffect } from "react";
import { Table, Container, Button } from "react-bootstrap";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const AccountList = () => {
  const [clientesConCuenta, setClientesConCuenta] = useState([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(10);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Lógica para obtener la lista de clientes con cuenta corriente
    obtenerClientesConCuenta();
  }, []);

  const obtenerClientesConCuenta = async () => {
    try {
      // Lógica para obtener clientes con cuenta corriente desde el servidor
      // Puedes ajustar la ruta y la lógica según tu API
      const response = await fetch(`${apiUrl}/clientes`, {
        credentials: "include",
      });
      const data = await response.json();

      // Filtrar solo los clientes que tienen cuenta corriente
      const clientesConCuenta = data.filter(
        (cliente) => cliente.cuentaCorriente !== null
      );

      // Mapear los clientes con cuenta corriente
      const clientes = clientesConCuenta.map((cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        saldo: cliente.cuentaCorriente.saldoActual,
      }));

      setClientesConCuenta(clientes);

      // // Calcular la suma total de los saldos
      const total = clientes.reduce((suma, cliente) => suma + cliente.saldo, 0);
      setTotalSaldo(total);
    } catch (error) {
      console.error("Error al obtener clientes con cuenta corriente", error);
    }
  };

  // Paginación
  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = clientesConCuenta.slice(
    indexOfFirstCliente,
    indexOfLastCliente
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(clientesConCuenta.length / clientesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container>
      <h1>Saldos de Clientes</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {currentClientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>
                {cliente.saldo.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 2,
                })}
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
          {Math.ceil(clientesConCuenta.length / clientesPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage ===
            Math.ceil(clientesConCuenta.length / clientesPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
      <div>
        <strong>
          Total Saldo:{" "}
          {
            <td>
              {totalSaldo.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2,
              })}
            </td>
          }
        </strong>
      </div>
    </Container>
  );
};

export default AccountList;
