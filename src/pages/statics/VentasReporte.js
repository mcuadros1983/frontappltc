import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  ButtonGroup,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import _ from "lodash";
import moment from "moment";
import "moment/locale/es";

moment.updateLocale("es", {
  week: { dow: 1 }, // Define que la semana empieza el lunes
});

const VentasReporte = () => {
  const [ventasTotales, setVentasTotales] = useState([]);
  const [ventasOriginales, setVentasOriginales] = useState([]);
  const [activeSucursales, setActiveSucursales] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [grouping, setGrouping] = useState("day");
  const [sortOrder, setSortOrder] = useState("asc"); // Estado para manejar el orden de la fecha

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (ventasOriginales.length > 0) {
      processVentasTotales(ventasOriginales);
    }
  }, [grouping]);

  const handleSortByDate = () => {
    const sortedVentas = [...ventasTotales].sort((a, b) => {
      return sortOrder === "asc"
        ? moment(a.fecha, "YYYY-MM-DD").unix() -
            moment(b.fecha, "YYYY-MM-DD").unix()
        : moment(b.fecha, "YYYY-MM-DD").unix() -
            moment(a.fecha, "YYYY-MM-DD").unix();
    });

    setVentasTotales(sortedVentas);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleFetchVentasTotales = async () => {
    if (!startDate || !endDate) {
      alert("Por favor, seleccione un rango de fechas válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/statics-ventas-agrupadas`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No existen ventas para la fecha indicada.");
          return;
        }
        setVentasOriginales(data);
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
    let groupedVentas;
    switch (grouping) {
      case "week":
        groupedVentas = _.groupBy(
          ventas,
          (v) => `${moment(v.fecha2).year()}-W${moment(v.fecha2).isoWeek()}`
        );
        break;
      case "month":
        groupedVentas = _.groupBy(
          ventas,
          (v) => `${moment(v.fecha2).year()}-${moment(v.fecha2).format("MM")}`
        );
        break;
      case "year":
        groupedVentas = _.groupBy(ventas, (v) => moment(v.fecha2).year());
        break;
      default:
        groupedVentas = _.groupBy(ventas, "fecha2");
    }

    let sucursales = Array.from(new Set(ventas.map((v) => v.sucursal)));
    let sucursalesActivas = new Set();
    let tabla = Object.keys(groupedVentas).map((fecha) => {
      let fila = { fecha };
      sucursales.forEach((sucursal) => {
        const total = groupedVentas[fecha]
          .filter((v) => v.sucursal === sucursal)
          .reduce((sum, curr) => sum + parseFloat(curr.monto_total), 0);
        fila[sucursal] = parseFloat(total.toFixed(2)) || 0;
        if (total > 0) {
          sucursalesActivas.add(sucursal);
        }
      });
      return fila;
    });
    setVentasTotales(tabla);
    setActiveSucursales(sucursalesActivas);
  };

  const exportarExcel = () => {
    const dataToExport = ventasTotales.map((fila) => {
      let filaExport = { Fecha: fila.fecha };
      Array.from(activeSucursales).forEach((sucursal) => {
        filaExport[sucursal] = fila[sucursal].toLocaleString("es-ES", {
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
    <Container>
      <h1>Comparativo de ventas</h1>
      <div className="mb-3">
        <Form.Group className="d-inline-block w-auto">
          <Form.Label>Desde:</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control text-center"
          />
        </Form.Group>
        <Form.Group className="d-inline-block w-auto ml-2">
          <Form.Label>Hasta:</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control text-center"
          />
        </Form.Group>
      </div>

      <div className="mb-3">
        <Button
          variant="primary"
          onClick={handleFetchVentasTotales}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Buscar"}
        </Button>
        <Button
          variant="success"
          onClick={exportarExcel}
          disabled={ventasTotales.length === 0}
          className="ml-2"
        >
          Exportar a Excel
        </Button>
      </div>

      <ButtonGroup className="mb-3">
        <Button
          onClick={() => setGrouping("day")}
          variant="secondary"
          disabled={ventasTotales.length === 0}
        >
          Día
        </Button>
        <Button
          onClick={() => setGrouping("week")}
          variant="secondary"
          disabled={ventasTotales.length === 0}
        >
          Semana
        </Button>
        <Button
          onClick={() => setGrouping("month")}
          variant="secondary"
          disabled={ventasTotales.length === 0}
        >
          Mes
        </Button>
        <Button
          onClick={() => setGrouping("year")}
          variant="secondary"
          disabled={ventasTotales.length === 0}
        >
          Año
        </Button>
      </ButtonGroup>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={handleSortByDate} style={{ cursor: "pointer" }}>
              Fecha {sortOrder === "asc" ? "▲" : "▼"}
            </th>
            {Array.from(activeSucursales).map((sucursal) => (
              <th key={sucursal}>{sucursal}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ventasTotales.map((fila, index) => (
            <tr key={index}>
              <td>{fila.fecha}</td>
              {Array.from(activeSucursales).map((sucursal) => (
                <td key={sucursal}>{fila[sucursal].toFixed(2)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default VentasReporte;
