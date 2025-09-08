import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";
import Contexts from "../../context/Contexts";

const DetalleCtaCte = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [operacionesFiltradas, setOperacionesFiltradas] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [operacionesPorPagina] = useState(2000);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalImporteVentas, setTotalImporteVentas] = useState(0);
  const [totalImporteCobranzas, setTotalImporteCobranzas] = useState(0);

  const contexto = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const esFechaValida = (fecha) =>
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    new Date(fecha).toISOString().slice(0, 10) === fecha;

  const fetchOperaciones = async () => {
    setLoading(true);
    setError("");

    if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
      setError("Las fechas proporcionadas no son válidas.");
      setLoading(false);
      return;
    }

    try {
      const responseVentas = await fetch(`${apiUrl}/caja/vtasctacte_filtrados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaDesde, fechaHasta, sucursalId: buscarSucursal }),
      });
      const responseCobranzas = await fetch(`${apiUrl}/caja/cobranzasctacte_filtrados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaDesde, fechaHasta, sucursalId: buscarSucursal }),
      });

      if (!responseVentas.ok || !responseCobranzas.ok) {
        throw new Error("Failed to fetch data.");
      }

      const ventas = await responseVentas.json();
      const cobranzas = await responseCobranzas.json();
      const combinedOperations = [...ventas, ...cobranzas].sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha)
      );

      setOperaciones(combinedOperations);
      setOperacionesFiltradas(combinedOperations);
      updateClientesFiltrados(combinedOperations);
      setPaginaActual(1);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateClientesFiltrados = (ops) => {
    const uniqueClientIds = [...new Set(ops.map((op) => op.cliente_id))];
    const filteredClients = (contexto?.clientesTabla || []).filter((client) =>
      uniqueClientIds.includes(client.id)
    );
    setClientesFiltrados(
      filteredClients.sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
  };

  useEffect(() => {
    if (clienteSeleccionado) {
      const filtered = operaciones.filter(
        (op) => op.cliente_id?.toString() === clienteSeleccionado
      );
      setOperacionesFiltradas(filtered);
    } else {
      setOperacionesFiltradas(operaciones);
    }
    setPaginaActual(1);
  }, [clienteSeleccionado, operaciones]);

  useEffect(() => {
    const totalVentas = operacionesFiltradas
      .filter((op) => op.vtactacteId)
      .reduce((acc, curr) => acc + (Number(curr.importe) || 0), 0);
    const totalCobranzas = operacionesFiltradas
      .filter((op) => op.cobranzaId)
      .reduce((acc, curr) => acc + (Number(curr.importe) || 0), 0);
    setTotalImporteVentas(totalVentas);
    setTotalImporteCobranzas(totalCobranzas);
  }, [operacionesFiltradas]);

  const currentOperaciones = operacionesFiltradas.slice(
    (paginaActual - 1) * operacionesPorPagina,
    paginaActual * operacionesPorPagina
  );

  // ===== Exportar a Excel (xlsx) — exporta lo filtrado en `operacionesFiltradas` =====
  const exportarExcel = () => {
    if (!operacionesFiltradas || operacionesFiltradas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // Columnas EXACTAS como la tabla
    const headers = [
      "Fecha",
      "Importe",
      "Tipo",
      "Sucursal",
      "Cliente",
      "Observaciones",
    ];

    const rows = operacionesFiltradas.map((op) => {
      const tipo = op.vtactacteId ? "Venta" : op.cobranzaId ? "Cobranza" : "Desconocido";

      const sucursalNombre =
        (contexto?.sucursalesTabla || []).find(
          (s) => s.id === parseInt(op.sucursal_id)
        )?.nombre || "Desconocido";

      // Buscamos el cliente en toda la tabla de clientes (no solo filtrados) para mayor cobertura
      const cliObj =
        (contexto?.clientesTabla || []).find(
          (c) => c.id === parseInt(op.cliente_id)
        ) ||
        (clientesFiltrados || []).find(
          (c) => c.id === parseInt(op.cliente_id)
        );
      const clienteNombre = cliObj
        ? `${cliObj?.nombre || ""} ${cliObj?.apellido || ""}`.trim() || "Desconocido"
        : "Desconocido";

      return [
        op.fecha,
        Number(op.importe) || 0,
        tipo,
        sucursalNombre,
        clienteNombre,
        op.observaciones ?? "",
      ];
    });

    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // AutoFiltro y anchos de columna
    const lastRow = data.length;
    const lastCol = headers.length - 1;
    const colLetter = (n) => {
      let s = "";
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
      }
      return s;
    };
    ws["!autofilter"] = { ref: `A1:${colLetter(lastCol)}${lastRow}` };
    ws["!cols"] = [
      { wch: 12 }, // Fecha
      { wch: 14 }, // Importe
      { wch: 12 }, // Tipo
      { wch: 22 }, // Sucursal
      { wch: 28 }, // Cliente
      { wch: 40 }, // Observaciones
    ];

    // Tipar como número la columna Importe (B)
    for (let r = 2; r <= lastRow; r++) {
      if (ws[`B${r}`]) ws[`B${r}`].t = "n";
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle Cta Cte");

    const rango =
      fechaDesde && fechaHasta
        ? `_${fechaDesde}_a_${fechaHasta}`
        : `_${new Date().toISOString().slice(0, 10)}`;
    XLSX.writeFile(wb, `detalle_ctacte${rango}.xlsx`);
  };

  const saldo = totalImporteVentas - totalImporteCobranzas;

  return (
    <Container>
      <h1 className="my-list-title dark-text">Detalle de Cuenta Corriente</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
      </div>

      <div className="mb-3">
        <FormControl
          as="select"
          value={buscarSucursal}
          onChange={(e) => setBuscarSucursal(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
        >
          <option value="">Seleccione una sucursal</option>
          {(contexto?.sucursalesTabla || []).map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="mb-3 d-flex align-items-center gap-2">
        <Button onClick={fetchOperaciones} disabled={loading} className="me-2">
          {loading ? <Spinner animation="border" size="sm" /> : "Filtrar"}
        </Button>

        <Button
          variant="success"
          onClick={exportarExcel}
          disabled={operacionesFiltradas.length === 0}
        >
          Exportar a Excel
        </Button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>Total Ventas: {totalImporteVentas.toFixed(3)}</div>
        <div>Total Cobranzas: {totalImporteCobranzas.toFixed(3)}</div>
        <div>Saldo: {saldo.toFixed(3)}</div>
      </div>

      <div className="mb-3">
        <FormControl
          as="select"
          value={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado(e.target.value)}
          className="mr-2 mb-3"
          style={{ width: "25%" }}
        >
          <option value="">Seleccione un cliente</option>
          {clientesFiltrados.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} {cliente.apellido}
            </option>
          ))}
        </FormControl>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Importe</th>
            <th>Tipo</th>
            <th>Sucursal</th>
            <th>Cliente</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentOperaciones.map((operacion, index) => (
            <tr key={index}>
              <td>{operacion.fecha}</td>
              <td>{(Number(operacion.importe) || 0).toFixed(3)}</td>
              <td>
                {operacion.vtactacteId
                  ? "Venta"
                  : operacion.cobranzaId
                  ? "Cobranza"
                  : "Desconocido"}
              </td>
              <td>
                {(contexto?.sucursalesTabla || []).find(
                  (sucursal) => sucursal.id === parseInt(operacion.sucursal_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>
                {(contexto?.clientesTabla || []).find(
                  (cliente) => cliente.id === parseInt(operacion.cliente_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>{operacion.observaciones}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center">
        <Button
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {paginaActual} de{" "}
          {Math.ceil(operacionesFiltradas.length / operacionesPorPagina)}
        </span>
        <Button
          onClick={() =>
            setPaginaActual((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(operacionesFiltradas.length / operacionesPorPagina)
              )
            )
          }
          disabled={
            paginaActual ===
            Math.ceil(operacionesFiltradas.length / operacionesPorPagina)
          }
        >
          <BsChevronRight />
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
    </Container>
  );
};

export default DetalleCtaCte;
