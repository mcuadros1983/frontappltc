import React, { useState, useContext } from "react";
import { Container, Table, Button,  } from "react-bootstrap";
// import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import '../../../components/css/styles.css'

export default function VentasTotalesPorFecha() {
  const [ventasTotales, setVentasTotales] = useState([]);
  const [activeSucursales, setActiveSucursales] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFetchVentasTotales = async () => {
    if (!startDate || !endDate) {
      alert("Por favor, seleccione un rango de fechas válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/ventas/filtradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No existen ventas para la fecha indicada.");
          ;
          return;
        }
        processVentasTotales(data);
      } else {
        throw new Error("Error al obtener las ventas totales");
      }
    } catch (error) {
      setError("No se pudieron obtener las ventas: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const processVentasTotales = (ventas) => {
    let fechas = new Set(ventas.map(v => v.fecha));
    let sucursales = context.sucursalesTabla.map(s => s.id);
    let sucursalesActivas = new Set();
    let tabla = Array.from(fechas).sort().map(fecha => {
      let fila = { fecha };
      sucursales.forEach(sucursalId => {
        const total = ventas.filter(v => v.fecha === fecha && parseInt(v.sucursal_id) === sucursalId)
          .reduce((sum, curr) => sum + parseFloat(curr.monto), 0);
        fila[sucursalId] = total || 0;
        if (total > 0) {
          sucursalesActivas.add(sucursalId);
        }
      });
      return fila;
    });
    setVentasTotales(tabla);
    setActiveSucursales(sucursalesActivas);
  };

  return (
    <Container>
      <h1>Comparativo de ventas</h1>
      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
      </div>

      <div className="mb-3">
        <Button variant="primary" onClick={handleFetchVentasTotales} disabled={loading}>
          {loading ? 'Cargando...' : 'Buscar'}
        </Button>
      </div>


      {error && <div className="alert alert-danger">{error}</div>}
      <div className="fixed-table-container">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="fixed-first-column">Fecha</th>
              {context.sucursalesTabla.filter(sucursal => activeSucursales.has(sucursal.id)).map(sucursal => (
                <th key={sucursal.id}>{sucursal.nombre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventasTotales.map((fila, index) => (
              <tr key={index}>
                <td className="fixed-first-column">{fila.fecha}</td>
                {context.sucursalesTabla.filter(sucursal => activeSucursales.has(sucursal.id)).map(sucursal => (
                  <td key={sucursal.id}>{fila[sucursal.id].toFixed(2)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
