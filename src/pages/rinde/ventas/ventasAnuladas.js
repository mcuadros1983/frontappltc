// VentasAnuladas.jsx
import React, { useContext, useState, useEffect } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import "../../../components/css/VentasAnuladas.css"; // ⬅️ NUEVO

export default function VentasTotales() {
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSucursal, setSelectedSucursal] = useState("");

  const context = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {}, [selectedSucursal]);

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }
      const response = await fetch(`${apiUrl}/ventas/anuladasfiltradas`, {
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
        throw new Error("Error al obtener las ventas anuladas filtradas");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSort = (columnName) => {
    const nextDir =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(nextDir);
    setSortColumn(columnName);

    const sortedSells = [...ventasFiltradas].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];
      if (columnName === "numeroticket") {
        valueA = parseInt(valueA, 10);
        valueB = parseInt(valueB, 10);
      }
      if (valueA < valueB) return nextDir === "asc" ? -1 : 1;
      if (valueA > valueB) return nextDir === "asc" ? 1 : -1;
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
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <Container className="va-page">
      <h1 className="va-title">Ventas Anuladas</h1>

      {/* Filtros */}
      <div className="va-toolbar d-flex flex-wrap align-items-end gap-3 mb-3">
        <div className="mx-2 my-2">
          <label className="d-block">DESDE</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control my-input text-center"
          />
        </div>

        <div className="mx-2 my-2">
          <label className="d-block">HASTA</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control my-input text-center"
          />
        </div>

        <div className="mx-2 my-2">
          <label className="d-block">Sucursal</label>
          <FormControl
            as="select"
            className="form-control my-input"
            value={selectedSucursal}
            onChange={(e) => setSelectedSucursal(e.target.value)}
            style={{ minWidth: 260 }}
          >
            <option value="">Seleccionar sucursal</option>
            {context.sucursalesTabla.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="mx-2 my-2">
          <Button onClick={handleSearchClick} className="va-btn">
            Filtrar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="va-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")} className="va-th-sort">
                Fecha {sortColumn === "fecha" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("monto")} className="va-th-sort text-end">
                Monto {sortColumn === "monto" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("numeroticket")} className="va-th-sort">
                Número de Ticket {sortColumn === "numeroticket" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("sucursal_id")} className="va-th-sort">
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
                <td>{venta.numeroticket}</td>
                <td>{venta.sucursalNombre}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center va-pager">
        <Button onClick={prevPage} disabled={currentPage === 1} variant="light">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(ventasFiltradas.length / sellsPerPage) || 1}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(ventasFiltradas.length / sellsPerPage) ||
            ventasFiltradas.length === 0
          }
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
