// KgPorSucursal.jsx
import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import "../../../components/css/KgPorSucursal.css"; // ⬅️ NUEVO

export default function KgPorSucursal() {
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [ventasAgrupadas, setVentasAgrupadas] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSucursal, setSelectedSucursal] = useState("");

  const context = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const body = selectedSucursal
        ? { fechaDesde: startDate, fechaHasta: endDate, sucursalId: selectedSucursal }
        : { fechaDesde: startDate, fechaHasta: endDate };

      const response = await fetch(`${apiUrl}/ventas/kg_por_sucursal_filtradas`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Error al obtener las ventas en kg por sucursal filtradas");

      const data = await response.json();
      if (!data?.ventasFiltradas?.length) {
        alert("No existen ventas para la fecha indicada.");
        setVentasFiltradas([]);
        setVentasAgrupadas([]);
        return;
      }

      setVentasFiltradas(data.ventasFiltradas);
      const grouped = agruparVentasPorSucursal(data.ventasFiltradas);
      setVentasAgrupadas(grouped);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
    }
  };

  const agruparVentasPorSucursal = (ventas) => {
    const acc = ventas.reduce((map, v) => {
      const { sucursal_id, total_cantidadpeso } = v;
      if (!map[sucursal_id]) map[sucursal_id] = { sucursal_id, total_kg: 0 };
      map[sucursal_id].total_kg += parseInt(total_cantidadpeso);
      return map;
    }, {});
    return Object.values(acc);
  };

  const handleSort = (columnName) => {
    const isAsc = columnName === sortColumn && sortDirection === "asc";
    const nextDir = isAsc ? "desc" : "asc";
    setSortDirection(nextDir);
    setSortColumn(columnName);

    setVentasAgrupadas(
      [...ventasAgrupadas].sort((a, b) => {
        const A = a[columnName];
        const B = b[columnName];
        if (A < B) return nextDir === "asc" ? -1 : 1;
        if (A > B) return nextDir === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(s).toISOString().slice(0, 10) === s;

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = ventasAgrupadas.slice(indexOfFirstSell, indexOfLastSell);

  const nextPage = () => {
    if (currentPage < Math.ceil(ventasAgrupadas.length / sellsPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <Container className="kps-page">
      <h1 className="kps-title">Kg por Sucursal</h1>

      {/* Filtros */}
      <div className="kps-toolbar d-flex flex-wrap align-items-end gap-3 mb-3">
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
          <Button onClick={handleFilter} className="kps-btn">Filtrar</Button>
        </div>
      </div>

      <h2 className="kps-subtitle">Total Kg por Sucursal</h2>

      <div className="kps-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th className="kps-th-sort" onClick={() => handleSort("sucursal_id")}>Sucursal</th>
              <th className="kps-th-sort text-end" onClick={() => handleSort("total_kg")}>Total Kg</th>
            </tr>
          </thead>
          <tbody>
            {currentSells.map((venta, index) => (
              <tr key={`${venta.sucursal_id}-${index}`}>
                <td>
                  {context.sucursalesTabla.find(
                    (s) => s.id === parseInt(venta.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
                <td className="text-end">{Number(venta.total_kg || 0).toLocaleString("es-AR")}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center kps-pager">
        <Button onClick={prevPage} disabled={currentPage === 1} variant="light">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(ventasAgrupadas.length / sellsPerPage) || 1}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(ventasAgrupadas.length / sellsPerPage) ||
            ventasAgrupadas.length === 0
          }
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
