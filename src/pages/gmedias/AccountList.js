// AccountList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const AccountList = () => {
  const [clientesConCuenta, setClientesConCuenta] = useState([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const obtenerClientesConCuenta = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/clientes/`, { credentials: "include" });
      const data = await response.json();

      const soloConCuenta = data.filter((c) => c.cuentaCorriente !== null);
      const clientes = soloConCuenta.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        saldo: c.cuentaCorriente.saldoActual,
      }));

      const sorted = [...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
      setClientesConCuenta(sorted);

      const total = clientes.reduce((acc, c) => acc + (Number(c.saldo) || 0), 0);
      setTotalSaldo(total);
    } catch (error) {
      console.error("Error al obtener clientes con cuenta corriente", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    obtenerClientesConCuenta();
  }, [obtenerClientesConCuenta]);

  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = clientesConCuenta.slice(indexOfFirstCliente, indexOfLastCliente);

  const nextPage = () => {
    if (currentPage < Math.ceil(clientesConCuenta.length / clientesPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleSort = (columnName) => {
    const newDir = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newDir);

    const sorted = [...clientesConCuenta].sort((a, b) => {
      const A = a[columnName] ?? "";
      const B = b[columnName] ?? "";
      if (typeof A === "number" && typeof B === "number") {
        return newDir === "asc" ? A - B : B - A;
      }
      return newDir === "asc" ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
    });

    setClientesConCuenta(sorted);
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
            <tr
              key={cliente.id}
              onDoubleClick={() =>
                navigate("/accounts/new", {
                  state: { preselectedClientId: cliente.id, lockClient: true }, // 👈 NUEVO
                })
              }
              style={{ cursor: "pointer" }}
              title="Doble clic para abrir movimientos"
            >
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
          Página {currentPage} de {Math.ceil(clientesConCuenta.length / clientesPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(clientesConCuenta.length / clientesPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>

      <div>
        <strong>
          Total Saldo:{" "}
          {totalSaldo != null
            ? totalSaldo.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2,
              })
            : "$0,00"}
        </strong>
      </div>
    </Container>
  );
};

export default AccountList;
