// VentasTotales.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import "../../../components/css/VentasTotalesSuc.css"; // ⬅️ NUEVO

export default function VentasTotales() {
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {}, [selectedSucursal]);

  const handleFilter = async () => {
    try {
      setLoading(true);
      setError("");

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/ventas/filtradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: selectedSucursal,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.length === 0) {
          alert("No existen ventas para la fecha indicada.");
          setVentasFiltradas([]);
          return;
        }

        const ventasMapped = data.map((venta) => ({
          ...venta,
          sucursalNombre:
            context.sucursalesTabla.find(
              (sucursal) => sucursal.id === parseInt(venta.sucursal_id)
            )?.nombre || "Desconocido",
        }));
        setVentasFiltradas(ventasMapped);
        setCurrentPage(1);
      } else {
        throw new Error("Error al obtener las ventas filtradas");
      }
    } catch (error) {
      console.error(error);
      setError("Error al obtener las ventas filtradas");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sortedSells = [...ventasFiltradas].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === "monto") {
        valueA = parseFloat(String(valueA).replace(/[^0-9.-]+/g, ""));
        valueB = parseFloat(String(valueB).replace(/[^0-9.-]+/g, ""));
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setVentasFiltradas(sortedSells);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    if (!date.getTime()) return false;
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleSearchClick = () => handleFilter();

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = ventasFiltradas.slice(indexOfFirstSell, indexOfLastSell);

  const nextPage = () => {
    if (currentPage < Math.ceil(ventasFiltradas.length / sellsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalMonto = ventasFiltradas.reduce(
    (acc, curr) => acc + parseFloat(curr.monto),
    0
  );

  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">Ventas Totales</h1>

      {/* Filtros */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto mx-2">
          <label className="mr-2">DESDE:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 text-center vt-input"
          />
        </div>

        <div className="d-inline-block w-auto mx-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 text-center vt-input"
          />
        </div>

        <div className="d-inline-block">
          <label className="d-block">Sucursal</label>
          <FormControl
            as="select"
            className="vt-input"
            value={selectedSucursal}
            onChange={(e) => setSelectedSucursal(e.target.value)}
            style={{ minWidth: 240 }}
          >
            <option value="">Seleccionar sucursal</option>
            {context.sucursalesTabla.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="d-inline-block mx-2">
          <Button onClick={handleSearchClick} className="vt-btn">
            Filtrar
          </Button>
        </div>
      </div>

      {loading && <Spinner animation="border" />}
      {error && <div className="alert alert-danger my-2">{error}</div>}
      {ventasFiltradas.length === 0 && !loading && (
        <div className="text-muted">No se encontraron ventas para la fecha indicada.</div>
      )}

      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")} className="vt-th-sort">
                Fecha {sortColumn === "fecha" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("monto")} className="vt-th-sort text-end">
                Monto {sortColumn === "monto" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("sucursal_id")} className="vt-th-sort">
                Sucursal {sortColumn === "sucursal_id" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSells.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.fecha}</td>
                <td className="text-end">
                  {parseFloat(venta.monto).toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>
                  {context.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(venta.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Total */}
      <div className="total-sales-display vt-total">
        <strong>Total:</strong>{" "}
        <span>
          $
          {totalMonto.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center vt-pager">
        <Button onClick={prevPage} disabled={currentPage === 1} variant="light">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(ventasFiltradas.length / sellsPerPage) || 1}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(ventasFiltradas.length / sellsPerPage) || ventasFiltradas.length === 0}
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
