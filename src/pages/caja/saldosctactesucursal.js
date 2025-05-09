import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";
import Contexts from "../../context/Contexts";

const SaldosCtaCteSucursal = () => {
  const [saldosFiltrados, setSaldosFiltrados] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [saldosPorPagina] = useState(10);
  const [orden, setOrden] = useState({ columna: "", direccion: "asc" });
  const contexto = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerSaldosCtaCte = useCallback(async () => {
    if (!sucursalSeleccionada) return;

    try {
      const response = await fetch(`${apiUrl}/caja/saldosctacte_filtrados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sucursalId: sucursalSeleccionada }),
      });

      const data = await response.json();
      if (data.length === 0) {
        alert("No existen cuentas corrientes para esta sucursal.");
        setSaldosFiltrados([]);
        return;
      }

      const saldosConNombreApellido = data.map((saldo) => {
        const cliente = contexto.clientesTabla.find(
          (cliente) => cliente.id === saldo.cliente_id
        );
        return {
          ...saldo,
          nombre: cliente ? cliente.nombre : "",
          apellido: cliente ? cliente.apellido : "",
        };
      });

      setSaldosFiltrados(saldosConNombreApellido);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl, contexto.clientesTabla, sucursalSeleccionada]);

  useEffect(() => {
    obtenerSaldosCtaCte();
  }, [obtenerSaldosCtaCte]);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const manejarOrden = (columna) => {
    const direccion = orden.columna === columna && orden.direccion === "asc" ? "desc" : "asc";
    setOrden({ columna, direccion });
    ordenarSaldos(columna, direccion);
  };

  const ordenarSaldos = (columna, direccion) => {
    const saldosOrdenados = [...saldosFiltrados].sort((a, b) => {
      const comparadorA = a[columna];
      const comparadorB = b[columna];
      if (comparadorA < comparadorB) return direccion === "asc" ? -1 : 1;
      if (comparadorA > comparadorB) return direccion === "asc" ? 1 : -1;
      return 0;
    });
    setSaldosFiltrados(saldosOrdenados);
  };

  const handleExport = () => {
    if (saldosFiltrados.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const dataToExport = saldosFiltrados.map((saldo) => ({
      Cliente: `${saldo.nombre} ${saldo.apellido}`,
      "Total Ventas": saldo.ventas,
      "Total Cobranzas": saldo.cobranzas,
      "Saldo Cuenta Corriente": saldo.saldo,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Saldos Cta Cte");

    XLSX.writeFile(workbook, "SaldosCtaCte.xlsx");
  };

  const indiceUltimoSaldo = paginaActual * saldosPorPagina;
  const indicePrimerSaldo = indiceUltimoSaldo - saldosPorPagina;
  const saldosActuales = saldosFiltrados.slice(indicePrimerSaldo, indiceUltimoSaldo);

  const totalSaldoFiltrado = saldosFiltrados.reduce((acc, saldo) => acc + parseFloat(saldo.saldo), 0);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Saldos de Cuenta Corriente</h1>

      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex">
          <FormControl
            as="select"
            value={sucursalSeleccionada}
            onChange={(e) => setSucursalSeleccionada(e.target.value)}
            className="mr-2"
            style={{ width: "250px" }}
          >
            <option value="">Seleccione una sucursal</option>
            {contexto.sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>
          <Button onClick={handleExport} className="ml-2">Exportar</Button>
        </div>
        <div className="ml-auto">
          <strong>Saldo Total: </strong>{totalSaldoFiltrado.toFixed(2)}
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => manejarOrden("nombre")} style={{ cursor: "pointer" }}>Cliente</th>
            <th onClick={() => manejarOrden("ventas")} style={{ cursor: "pointer" }}>Total Ventas</th>
            <th onClick={() => manejarOrden("cobranzas")} style={{ cursor: "pointer" }}>Total Cobranzas</th>
            <th onClick={() => manejarOrden("saldo")} style={{ cursor: "pointer" }}>Saldo Cuenta Corriente</th>
          </tr>
        </thead>
        <tbody>
          {saldosActuales.map((saldo) => (
            <tr key={saldo.cliente_id}>
              <td>
                {saldo.nombre} {saldo.apellido}
              </td>
              <td>{saldo.ventas}</td>
              <td>{saldo.cobranzas}</td>
              <td>{saldo.saldo}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center">
        <Button
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {paginaActual} de {Math.ceil(saldosFiltrados.length / saldosPorPagina)}
        </span>
        <Button
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === Math.ceil(saldosFiltrados.length / saldosPorPagina)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
};

export default SaldosCtaCteSucursal;
