import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SaldosCtaCte = () => {
  const [saldos, setSaldos] = useState([]);
  const [saldosFiltrados, setSaldosFiltrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [saldosPorPagina] = useState(10);
  const [orden, setOrden] = useState({ columna: "", direccion: "asc" });
  const contexto = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const obtenerSaldosCtaCte = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/caja/saldosctacte`, { credentials: "include" });
      const data = await response.json();
      if (data.length === 0) {
        alert("No existen cuentas corrientes activas.");
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

      setSaldos(saldosConNombreApellido);
      setSaldosFiltrados(saldosConNombreApellido);

      const clientesUnicos = saldosConNombreApellido.reduce((clientes, saldo) => {
        if (!clientes.some((cliente) => cliente.id === saldo.cliente_id)) {
          clientes.push({ id: saldo.cliente_id, nombre: saldo.nombre, apellido: saldo.apellido });
        }
        return clientes;
      }, []);

      clientesUnicos.sort((a, b) => {
        const nombreCompletoA = `${a.nombre} ${a.apellido}`.toLowerCase();
        const nombreCompletoB = `${b.nombre} ${b.apellido}`.toLowerCase();
        if (nombreCompletoA < nombreCompletoB) return -1;
        if (nombreCompletoA > nombreCompletoB) return 1;
        return 0;
      });

      setClientesFiltrados(clientesUnicos);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl, contexto.clientesTabla]);

  useEffect(() => {
    obtenerSaldosCtaCte();
  }, [obtenerSaldosCtaCte]);

  const manejadorFiltroClienteSeleccionado = useCallback(() => {
    const filtrados = clienteSeleccionado ? saldos.filter(
      (saldo) => parseInt(saldo.cliente_id) === parseInt(clienteSeleccionado)
    ) : saldos;

    setSaldosFiltrados(filtrados);
    setPaginaActual(1);
  }, [clienteSeleccionado, saldos]);

  useEffect(() => {
    manejadorFiltroClienteSeleccionado();
  }, [clienteSeleccionado, manejadorFiltroClienteSeleccionado]);
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

  const indiceUltimoSaldo = paginaActual * saldosPorPagina;
  const indicePrimerSaldo = indiceUltimoSaldo - saldosPorPagina;
  const saldosActuales = saldosFiltrados.slice(indicePrimerSaldo, indiceUltimoSaldo);

  const totalSaldoFiltrado = saldosFiltrados.reduce((acc, saldo) => acc + parseFloat(saldo.saldo), 0);

  const exportarExcel = () => {
    // Exporta TODO lo filtrado (no paginado)
    const data = saldosFiltrados.map((s) => ({
      "Cliente": confirmClienteNombre(s),
      "Total Ventas": toNumber(s.ventas),
      "Total Cobranzas": toNumber(s.cobranzas),
      "Saldo Cuenta Corriente": toNumber(s.saldo),
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Formato opcional: anchos de columnas
    ws["!cols"] = [
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    // (Opcional) Agregar una fila final con el total de saldo filtrado
    const lastRow = data.length + 2;
    XLSX.utils.sheet_add_aoa(
      ws,
      [["", "", "Saldo Total:", toNumber(totalSaldoFiltrado)]],
      { origin: `A${lastRow}` }
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Saldos");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombreArchivo = `saldos_cuenta_corriente_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    saveAs(blob, nombreArchivo);
  };

  // Helpers
  const toNumber = (v) => {
    if (v === null || v === undefined) return 0;

    // si viene como string con miles/decimal AR (1.234,56)
    if (typeof v === "string") {
      const cleaned = v.replace(/\./g, "").replace(",", ".");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }

    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const confirmClienteNombre = (s) => `${s?.nombre ?? ""} ${s?.apellido ?? ""}`.trim();


  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">Saldos de Cuenta Corriente</h1>

      {/* Filtros + total */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto mx-2">
          <label className="d-block">Cliente</label>
          <FormControl
            as="select"
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
            className="vt-input"
            style={{ minWidth: 260 }}
          >
            <option value="">Seleccione un cliente</option>
            {clientesFiltrados.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellido}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="ms-auto d-inline-block mx-2">
          <div className="vt-total">
            <strong>Saldo Total:</strong>{" "}
            <span>{Number(totalSaldoFiltrado).toFixed(2)}</span>
          </div>

          <Button variant="success" onClick={exportarExcel}>
            Exportar Excel
          </Button>

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
        <Button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} variant="light">
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

export default SaldosCtaCte;
