// AccountList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Table, Container, Button } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


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

  const exportarExcel = () => {
    if (!clientesConCuenta || clientesConCuenta.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const data = clientesConCuenta.map((c) => ({
      "ID": c.id,
      "Nombre": c.nombre,
      "Saldo": Number(c.saldo) || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [{ wch: 10 }, { wch: 40 }, { wch: 18 }];

    // (Opcional) fila total al final
    const lastRow = data.length + 2;
    XLSX.utils.sheet_add_aoa(ws, [["", "TOTAL SALDO", Number(totalSaldo) || 0]], {
      origin: `A${lastRow}`,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Saldos");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombreArchivo = `saldos_clientes_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, nombreArchivo);
  };


  return (
    <Container>
      <h1>Saldos de Clientes</h1>

      <Button variant="success" onClick={exportarExcel} disabled={!clientesConCuenta.length}>
        Exportar Excel
      </Button>


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
