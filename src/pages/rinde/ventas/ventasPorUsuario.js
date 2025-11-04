// VentasPorUsuario.jsx
import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";
import Contexts from "../../../context/Contexts";
import "../../../components/css/VentasPorUsuario.css"; // ⬅️ NUEVO

export default function VentasPorUsuario() {
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
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

      const response = await fetch(`${apiUrl}/ventas/por_usuario_filtradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Error al obtener las ventas por usuario filtradas");

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        alert("No existen ventas para la fecha indicada.");
        return;
      }
      setVentasFiltradas(data);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSort = (columnName) => {
    const isAsc = columnName === sortColumn && sortDirection === "asc";
    const nextDir = isAsc ? "desc" : "asc";
    setSortDirection(nextDir);
    setSortColumn(columnName);

    setVentasFiltradas(
      [...ventasFiltradas].sort((a, b) => {
        let A = a[columnName];
        let B = b[columnName];
        if (columnName === "total_monto") {
          A = Number(A || 0);
          B = Number(B || 0);
        }
        if (A < B) return nextDir === "asc" ? -1 : 1;
        if (A > B) return nextDir === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    return date.getTime() && date.toISOString().slice(0, 10) === dateString;
  };

  const exportarExcel = () => {
    const datos = ventasFiltradas.map((v) => {
      const usuarioNombre =
        context.usuariosTabla.find((u) => u.id === parseInt(v.usuario_id))?.nombre_completo ||
        "Desconocido";
      const sucursalNombre =
        context.sucursalesTabla.find((s) => s.id === parseInt(v.sucursal_id))?.nombre ||
        "Desconocido";

      return {
        Fecha: v.fecha,
        Usuario: usuarioNombre,
        Sucursal: sucursalNombre,
        "Total Monto": Number(v.total_monto || 0).toFixed(2),
      };
    });

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas por Usuario");
    XLSX.writeFile(wb, `ventas_por_usuario_${startDate || "desde"}_${endDate || "hasta"}.xlsx`);
  };

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = ventasFiltradas.slice(indexOfFirstSell, indexOfLastSell);

  const nextPage = () => {
    if (currentPage < Math.ceil(ventasFiltradas.length / sellsPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <Container className="vpu-page">
      <h1 className="vpu-title">Ventas por Usuario</h1>

      {/* Filtros */}
      <div className="vpu-toolbar d-flex flex-wrap align-items-end gap-3 mb-3">
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

        <div className="mx-2 my-2 d-flex gap-2">
          <Button onClick={handleFilter} className="vpu-btn">Filtrar</Button>
          <Button
            className="mx-2"
            variant="success"
            onClick={exportarExcel}
            disabled={ventasFiltradas.length === 0}
          >
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="vpu-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th className="vpu-th-sort" onClick={() => handleSort("fecha")}>Fecha</th>
              <th className="vpu-th-sort" onClick={() => handleSort("usuario_id")}>Usuario</th>
              <th className="vpu-th-sort" onClick={() => handleSort("sucursal_id")}>Sucursal</th>
              <th className="vpu-th-sort text-end" onClick={() => handleSort("total_monto")}>Total Monto</th>
            </tr>
          </thead>
          <tbody>
            {currentSells.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.fecha}</td>
                <td>
                  {context.usuariosTabla.find((u) => u.id === parseInt(venta.usuario_id))
                    ?.nombre_completo || "Desconocido"}
                </td>
                <td>
                  {context.sucursalesTabla.find((s) => s.id === parseInt(venta.sucursal_id))
                    ?.nombre || "Desconocido"}
                </td>
                <td className="text-end">
                  {Number(venta.total_monto || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center vpu-pager">
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
