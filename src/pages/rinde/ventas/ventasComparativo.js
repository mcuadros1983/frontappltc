import React, { useState, useContext, useMemo } from "react";
import { Container, Table, Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import Contexts from "../../../context/Contexts";
import "../../../components/css/styles.css";
import "../../../components/css/ventasTotales.css"; // ⬅️ NUEVO

export default function VentasTotalesPorFecha() {
  const [ventasTotales, setVentasTotales] = useState([]);
  const [activeSucursales, setActiveSucursales] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const sucursalesTabla = context?.sucursalesTabla ?? [];

  const sucursalesActivasLista = useMemo(
    () => sucursalesTabla.filter((s) => activeSucursales.has(s.id)),
    [sucursalesTabla, activeSucursales]
  );

  const handleFetchVentasTotales = async () => {
    if (!startDate || !endDate) {
      alert("Por favor, seleccione un rango de fechas válido.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/ventas/filtradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate }),
      });

      if (!response.ok) throw new Error("Error al obtener las ventas totales");

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        alert("No existen ventas para la fecha indicada.");
        setVentasTotales([]);
        setActiveSucursales(new Set());
        return;
      }
      processVentasTotales(data);
    } catch (err) {
      setError("No se pudieron obtener las ventas: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processVentasTotales = (ventas) => {
    const fechas = Array.from(new Set(ventas.map((v) => v.fecha))).sort();
    const sucursalesIds = sucursalesTabla.map((s) => s.id);
    const sucursalesActivas = new Set();

    const tabla = fechas.map((fecha) => {
      const fila = { fecha };
      sucursalesIds.forEach((sucursalId) => {
        const total = ventas
          .filter(
            (v) => v.fecha === fecha && Number(v.sucursal_id) === Number(sucursalId)
          )
          .reduce((sum, curr) => sum + Number(curr.monto || 0), 0);
        fila[sucursalId] = total || 0;
        if (total > 0) sucursalesActivas.add(sucursalId);
      });
      return fila;
    });

    setVentasTotales(tabla);
    setActiveSucursales(sucursalesActivas);
  };

  const exportarExcel = () => {
    const dataToExport = ventasTotales.map((fila) => {
      const filaExport = { Fecha: fila.fecha };
      sucursalesActivasLista.forEach((sucursal) => {
        const val = Number(fila[sucursal.id] || 0);
        filaExport[sucursal.nombre] = val.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      });
      return filaExport;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas Totales");
    XLSX.writeFile(wb, "ventas_totales.xlsx");
  };

  return (
    <Container fluid className="px-3 vtp-page">
      <h1 className="mb-3 vtp-title">Comparativo de ventas</h1>

      <div className="mb-3 d-flex flex-wrap gap-3 vtp-toolbar">
        <div style={{ minWidth: 220 }}>
          <label className="mr-2">DESDE:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 text-center"
          />
        </div>
        <div style={{ minWidth: 220 }}>
          <label className="mr-2 mx-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 text-center mx-2"
          />
        </div>
      </div>

      <div className="mb-3 d-flex gap-2 vtp-actions">
        <Button
          variant="primary"
          onClick={handleFetchVentasTotales}
          disabled={loading}
          className="vtp-btn"
        >
          {loading ? "Cargando..." : "Buscar"}
        </Button>
        <Button
          variant="success"
          onClick={exportarExcel}
          disabled={ventasTotales.length === 0}
          className="mx-2 vtp-btn"
        >
          Exportar a Excel
        </Button>
      </div>

      {error && <div className="alert alert-danger shadow-sm vtp-alert">{error}</div>}

      <div className="fixed-table-container vtp-tablewrap">
        <Table striped bordered hover className="mb-0 ventas-table vtp-table">
          <thead>
            <tr>
              <th className="sticky-col shadow-right">Fecha</th>
              {sucursalesActivasLista.map((sucursal) => (
                <th key={sucursal.id}>{sucursal.nombre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventasTotales.map((fila, idx) => (
              <tr key={idx}>
                <td className="sticky-col shadow-right">{fila.fecha}</td>
                {sucursalesActivasLista.map((sucursal) => (
                  <td key={sucursal.id}>
                    {Number(fila[sucursal.id] || 0).toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {/* Fila de totales */}
          <tr className="vtp-total-row">
            <td className="sticky-col shadow-right fw-bold">TOTAL</td>
            {sucursalesActivasLista.map((sucursal) => {
              const totalCol = ventasTotales.reduce(
                (sum, fila) => sum + Number(fila[sucursal.id] || 0),
                0
              );
              return (
                <td key={sucursal.id} className="fw-bold">
                  {totalCol.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              );
            })}
          </tr>
        </Table>
      </div>
    </Container>
  );
}
