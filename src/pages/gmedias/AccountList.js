import React, { useState, useEffect, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const AccountList = () => {
  const [clientesConCuenta, setClientesConCuenta] = useState([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");


  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerClientesConCuenta = useCallback(async () => {
    try {
      // Lógica para obtener clientes con cuenta corriente desde el servidor
      // Puedes ajustar la ruta y la lógica según tu API
      const response = await fetch(`${apiUrl}/clientes/`, {
        credentials: "include",
      });
      const data = await response.json();

      // Filtrar solo los clientes que tienen cuenta corriente
      const clientesConCuenta = data.filter(
        (cliente) => cliente.cuentaCorriente !== null
      );


      // Mapear los clientes con cuenta corriente
      // const clientes = clientesConCuenta.map((cliente) => ({
      //   id: cliente.id,
      //   nombre: cliente.nombre,
      //   saldo: cliente.cuentaCorriente.saldoActual,
      // }));

      // setClientesConCuenta(clientes);

      // Mapear los clientes con cuenta corriente
      const clientes = clientesConCuenta.map((cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        saldo: cliente.cuentaCorriente.saldoActual,
      }));

      // Ordenar alfabéticamente por el nombre (de A a Z)
      const sortedClientes = [...clientes].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );

      setClientesConCuenta(sortedClientes);

      // // Calcular la suma total de los saldos
      const total = clientes.reduce((suma, cliente) => suma + cliente.saldo, 0);
      setTotalSaldo(total);
    } catch (error) {
      console.error("Error al obtener clientes con cuenta corriente", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Lógica para obtener la lista de clientes con cuenta corriente
    obtenerClientesConCuenta();
  }, [obtenerClientesConCuenta]);

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

  const handleSort = (columnName) => {
    const newSortDirection = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newSortDirection);

    const sortedClientes = [...clientesConCuenta].sort((a, b) => {
      const valueA = a[columnName] ?? "";
      const valueB = b[columnName] ?? "";

      if (typeof valueA === "number" && typeof valueB === "number") {
        return newSortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      return newSortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setClientesConCuenta(sortedClientes);
  };


  return (
    <Container>
      <h1>Saldos de Clientes</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("nombre")} style={{ cursor: "pointer" }}>Nombre</th>
            <th onClick={() => handleSort("saldo")} style={{ cursor: "pointer" }}>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {currentClientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>
                {cliente.saldo != null
                  ? cliente.saldo.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumFractionDigits: 2,
                  })
                  : "$0,00"}
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
              {totalSaldo != null
                ? totalSaldo.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 2,
                }) : "$0,00"}
            </td>
          }
        </strong>
      </div>
    </Container>
  );
};

export default AccountList;
