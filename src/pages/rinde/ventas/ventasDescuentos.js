// VentasConDescuento.jsx
import React, { useState, useContext, useEffect } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import "../../../components/css/VentasConDescuentos.css"; // ⬅️ NUEVO

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
      const response = await fetch(`${apiUrl}/ventas/con_descuento_filtradas`, {
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
              (s) => s.id === parseInt(venta.sucursal_id)
            )?.nombre || "Desconocido",
        }));
        setVentasFiltradas(ventasMapped);
        setCurrentPage(1);
      } else {
        throw new Error("Error al obtener las ventas con descuento filtradas");
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

    const sorted = [...ventasFiltradas].sort((a, b) => {
      let A = a[columnName];
      let B = b[columnName];

      if (columnName === "numeroticket") {
        A = parseInt(A, 10);
        B = parseInt(B, 10);
      } else if (columnName === "monto" || columnName === "descuento") {
        A = parseFloat(A);
        B = parseFloat(B);
      }
      if (A < B) return nextDir === "asc" ? -1 : 1;
      if (A > B) return nextDir === "asc" ? 1 : -1;
      return 0;
    });

    setVentasFiltradas(sorted);
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
    <Container className="vcd-page">
      <h1 className="vcd-title">Ventas con Descuento</h1>

      {/* Filtros */}
      <div className="vcd-toolbar d-flex flex-wrap align-items-end gap-3 mb-3">
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
            {context.sucursalesTabla.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="mx-2 my-2">
          <Button onClick={handleSearchClick} className="vcd-btn">
            Filtrar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="vcd-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")} className="vcd-th-sort">
                Fecha {sortColumn === "fecha" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                onClick={() => handleSort("monto")}
                className="vcd-th-sort text-end"
              >
                Monto {sortColumn === "monto" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                onClick={() => handleSort("descuento")}
                className="vcd-th-sort text-end"
              >
                Descuento {sortColumn === "descuento" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("numeroticket")} className="vcd-th-sort">
                Número de Ticket {sortColumn === "numeroticket" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>Sucursal</th>
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
                <td className="text-end">
                  {Number(venta.descuento).toLocaleString("es-ES", {
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
      <div className="d-flex justify-content-center align-items-center vcd-pager">
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
