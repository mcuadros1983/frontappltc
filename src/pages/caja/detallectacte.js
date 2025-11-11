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
import { saveAs } from "file-saver";
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
        credentials: "include",
      });
      const responseCobranzas = await fetch(`${apiUrl}/caja/cobranzasctacte_filtrados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaDesde, fechaHasta, sucursalId: buscarSucursal }),
        credentials: "include",
      });

      if (!responseVentas.ok || !responseCobranzas.ok) {
        throw new Error("Failed to fetch data.");
      }

      const ventas = await responseVentas.json();
      const cobranzas = await responseCobranzas.json();

      // Orden por fecha ascendente
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
    const filteredClients = contexto.clientesTabla.filter((client) =>
      uniqueClientIds.includes(client.id)
    );
    setClientesFiltrados(
      filteredClients.sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
  };

  // Filtrado por cliente
  useEffect(() => {
    if (clienteSeleccionado) {
      const filtered = operaciones.filter(
        (op) => op.cliente_id.toString() === clienteSeleccionado
      );
      setOperacionesFiltradas(filtered);
    } else {
      setOperacionesFiltradas(operaciones);
    }
    setPaginaActual(1);
  }, [clienteSeleccionado, operaciones]);

  // Totales (sobre lo filtrado)
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

  const saldo = totalImporteVentas - totalImporteCobranzas;

  // Exportación a Excel (exporta TODO lo filtrado en operacionesFiltradas)
  const handleExportExcel = () => {
    if (!operacionesFiltradas || operacionesFiltradas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const detalle = operacionesFiltradas.map((op) => {
      const sucursalNombre =
        contexto.sucursalesTabla.find(
          (s) => s.id === parseInt(op.sucursal_id, 10)
        )?.nombre || "Desconocido";

      const clienteObj = contexto.clientesTabla.find(
        (c) => c.id === parseInt(op.cliente_id, 10)
      );
      const clienteNombre = clienteObj
        ? `${clienteObj.nombre || ""} ${clienteObj.apellido || ""}`.trim()
        : "Desconocido";

      const tipo = op.vtactacteId ? "Venta" : op.cobranzaId ? "Cobranza" : "Desconocido";

      return {
        Fecha: op.fecha,
        Importe: Number((Number(op.importe) || 0).toFixed(3)),
        Tipo: tipo,
        Sucursal: sucursalNombre,
        Cliente: clienteNombre,
        Observaciones: op.observaciones || "",
      };
    });

    const wsDetalle = XLSX.utils.json_to_sheet(detalle);

    // Ancho de columnas auto-ajustado
    const colWidths = Object.keys(detalle[0]).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...detalle.map((row) => (row[key] ? String(row[key]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
    });
    wsDetalle["!cols"] = colWidths;

    // Hoja Totales
    const wsTotales = XLSX.utils.json_to_sheet([
      { Métrica: "Total Ventas", Valor: Number(totalImporteVentas.toFixed(3)) },
      { Métrica: "Total Cobranzas", Valor: Number(totalImporteCobranzas.toFixed(3)) },
      { Métrica: "Saldo", Valor: Number(saldo.toFixed(3)) },
      { Métrica: "Cantidad de operaciones", Valor: operacionesFiltradas.length },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle");
    XLSX.utils.book_append_sheet(wb, wsTotales, "Totales");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `detalle_ctacte_${fechaDesde || "sin-desde"}_a_${fechaHasta || "sin-hasta"}.xlsx`
      .replaceAll("/", "-");
    saveAs(fileData, fileName);
  };

  const currentOperaciones = operacionesFiltradas.slice(
    (paginaActual - 1) * operacionesPorPagina,
    paginaActual * operacionesPorPagina
  );

  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">Detalle de Cuenta Corriente</h1>

      {/* Errores */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filtros de fecha/sucursal */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto mx-2">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="form-control rounded-0 text-center vt-input"
          />
        </div>

        <div className="d-inline-block w-auto mx-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="form-control rounded-0 text-center vt-input"
          />
        </div>

        <div className="d-inline-block w-auto mx-2">
          <label className="d-block">Sucursal</label>
          <FormControl
            as="select"
            value={buscarSucursal}
            onChange={(e) => setBuscarSucursal(e.target.value)}
            className="vt-input"
            style={{ minWidth: 280 }}
          >
            <option value="">Seleccione una sucursal</option>
            {contexto.sucursalesTabla.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="d-inline-block mx-2">
          <Button onClick={fetchOperaciones} disabled={loading} className="vt-btn">
            {loading ? (
              <span>
                Cargando… <Spinner as="span" animation="border" size="sm" />
              </span>
            ) : (
              "Filtrar"
            )}
          </Button>
        </div>

        {/* Botón Exportar (verde) */}
        <div className="d-inline-block mx-2">
          <Button
            onClick={handleExportExcel}
            className="vt-btn"
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
            disabled={loading || operacionesFiltradas.length === 0}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtro de cliente */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto mx-2">
          <label className="d-block">Cliente</label>
          <FormControl
            as="select"
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
            className="vt-input"
            style={{ minWidth: 320 }}
          >
            <option value="">Seleccione un cliente</option>
            {clientesFiltrados.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellido}
              </option>
            ))}
          </FormControl>
        </div>
      </div>

      {/* Totales */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <div className="vt-total mx-2">
          <strong>Total Ventas:</strong>{" "}
          <span>{(totalImporteVentas || 0).toFixed(3)}</span>
        </div>
        <div className="vt-total mx-2">
          <strong>Total Cobranzas:</strong>{" "}
          <span>{(totalImporteCobranzas || 0).toFixed(3)}</span>
        </div>
        <div className="vt-total mx-2">
          <strong>Saldo:</strong>{" "}
          <span>{(saldo || 0).toFixed(3)}</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th className="vt-th-sort">Fecha</th>
              <th className="vt-th-sort text-end">Importe</th>
              <th className="vt-th-sort">Tipo</th>
              <th className="vt-th-sort">Sucursal</th>
              <th className="vt-th-sort">Cliente</th>
              <th className="vt-th-sort">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOperaciones.map((operacion, index) => {
              const sucursalNombre =
                contexto.sucursalesTabla.find(
                  (s) => s.id === parseInt(operacion.sucursal_id, 10)
                )?.nombre || "Desconocido";

              const clienteObj = contexto.clientesTabla.find(
                (c) => c.id === parseInt(operacion.cliente_id, 10)
              );
              const clienteNombre = clienteObj
                ? `${clienteObj.nombre || ""} ${clienteObj.apellido || ""}`.trim()
                : "Desconocido";

              const tipo = operacion.vtactacteId
                ? "Venta"
                : operacion.cobranzaId
                ? "Cobranza"
                : "Desconocido";

              return (
                <tr key={index}>
                  <td>{operacion.fecha}</td>
                  <td className="text-end">
                    {(Number(operacion.importe) || 0).toFixed(3)}
                  </td>
                  <td>{tipo}</td>
                  <td>{sucursalNombre}</td>
                  <td>{clienteNombre}</td>
                  <td>{operacion.observaciones}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center vt-pager">
        <Button
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
          variant="light"
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {paginaActual} de{" "}
          {Math.ceil(operacionesFiltradas.length / operacionesPorPagina) || 1}
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
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </Container>
  );
};

export default DetalleCtaCte;
