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
      }, {credentials: "include"} );

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
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Saldos de Cuenta Corriente</h1>

    {/* Filtros + acciones + total */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto mx-2">
        <label className="d-block">Sucursal</label>
        <FormControl
          as="select"
          value={sucursalSeleccionada}
          onChange={(e) => setSucursalSeleccionada(e.target.value)}
          className="vt-input"
          style={{ minWidth: 250 }}
        >
          <option value="">Seleccione una sucursal</option>
          {contexto.sucursales.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="d-inline-block mx-2">
        <Button onClick={handleExport} className="vt-btn">Exportar</Button>
      </div>

      <div className="ms-auto d-inline-block mx-2">
        <div className="vt-total">
          <strong>Saldo Total:</strong>{" "}
          <span>{Number(totalSaldoFiltrado).toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Tabla */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th className="vt-th-sort" onClick={() => manejarOrden("nombre")}>
              Cliente
            </th>
            <th className="vt-th-sort text-end" onClick={() => manejarOrden("ventas")}>
              Total Ventas
            </th>
            <th className="vt-th-sort text-end" onClick={() => manejarOrden("cobranzas")}>
              Total Cobranzas
            </th>
            <th className="vt-th-sort text-end" onClick={() => manejarOrden("saldo")}>
              Saldo Cuenta Corriente
            </th>
          </tr>
        </thead>
        <tbody>
          {saldosActuales.map((saldo) => (
            <tr key={saldo.cliente_id}>
              <td>{saldo.nombre} {saldo.apellido}</td>
              <td className="text-end">{saldo.ventas}</td>
              <td className="text-end">{saldo.cobranzas}</td>
              <td className="text-end">{saldo.saldo}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    {/* Paginación */}
    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        variant="light"
      >
        <BsChevronLeft />
      </Button>
      <span className="mx-2">
        Página {paginaActual} de {Math.ceil(saldosFiltrados.length / saldosPorPagina) || 1}
      </span>
      <Button
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === Math.ceil(saldosFiltrados.length / saldosPorPagina)}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

};

export default SaldosCtaCteSucursal;
