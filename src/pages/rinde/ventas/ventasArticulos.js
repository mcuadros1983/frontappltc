// VentasArticulos.jsx
import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import * as XLSX from "xlsx";
import "../../../components/css/VentasArticulos.css"; // ⬅️ NUEVO

export default function VentasArticulos() {
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [selectedArticulo, setSelectedArticulo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSucursal, setSelectedSucursal] = useState("");

  const context = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleExportExcel = () => {
    const exportData = ventasFiltradas
      .filter((v) => selectedArticulo === "" || v.articuloCodigo === selectedArticulo)
      .map((venta) => ({
        Fecha: venta.fecha,
        Código: venta.articuloCodigo,
        Descripción: venta.articuloDescripcion,
        Cantidad: venta.cantidad,
        Sucursal:
          context.sucursalesTabla.find((s) => s.id === parseInt(venta.sucursal_id))?.nombre ||
          "Desconocido",
      }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, "ventas_articulos.xlsx");
  };

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }
      const body = selectedSucursal
        ? { fechaDesde: startDate, fechaHasta: endDate, sucursalId: selectedSucursal }
        : { fechaDesde: startDate, fechaHasta: endDate };

      const response = await fetch(`${apiUrl}/ventas/con_articulo_filtradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Error al obtener las ventas con artículos filtradas");
      const data = await response.json();

      if (data.length === 0) {
        alert("No existen ventas para la fecha indicada.");
        return;
      }

      const uniqueArticulosSet = new Set(
        data.map((venta) =>
          JSON.stringify({ codigo: venta.articuloCodigo, descripcion: venta.articuloDescripcion })
        )
      );
      const uniqueArticulos = Array.from(uniqueArticulosSet).map((str) => JSON.parse(str));
      const validArticulos = uniqueArticulos.filter((a) => a.descripcion);
      validArticulos.sort((a, b) => a.descripcion.localeCompare(b.descripcion));

      setVentasFiltradas(data);
      setArticulos(validArticulos);
      setSelectedArticulo("");
    } catch (e) {
      console.error(e);
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
        if (columnName === "cantidad") {
          A = parseFloat(A);
          B = parseFloat(B);
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
    const d = new Date(dateString);
    return d.getTime() && d.toISOString().slice(0, 10) === dateString;
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
    <Container className="va-page">
      <h1 className="va-title">Ventas Por Artículo</h1>

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
            {context.sucursalesTabla.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="mx-2 my-2">
          <label className="d-block">Artículo</label>
          <FormControl
            as="select"
            className="form-control my-input"
            value={selectedArticulo}
            onChange={(e) => setSelectedArticulo(e.target.value)}
            style={{ minWidth: 320 }}
            disabled={articulos.length === 0}
          >
            <option value="">Seleccionar Artículo</option>
            {articulos.map((art, idx) => (
              <option key={idx} value={art.codigo}>
                {art.descripcion}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="mx-2 my-2 d-flex gap-2">
          <Button onClick={handleFilter} className="va-btn">Filtrar</Button>
          <Button
            variant="success"
            onClick={handleExportExcel}
            disabled={ventasFiltradas.length === 0}
            className="mx-2"
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="va-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")} className="va-th-sort">Fecha</th>
              <th onClick={() => handleSort("articuloCodigo")} className="va-th-sort">Código</th>
              <th onClick={() => handleSort("articuloDescripcion")} className="va-th-sort">Descripción</th>
              <th onClick={() => handleSort("cantidad")} className="va-th-sort text-end">Cantidad</th>
              <th onClick={() => handleSort("sucursal_id")} className="va-th-sort">Sucursal</th>
            </tr>
          </thead>
          <tbody>
            {currentSells
              .filter((v) => selectedArticulo === "" || v.articuloCodigo === selectedArticulo)
              .map((venta) => (
                <tr key={venta.id}>
                  <td>{venta.fecha}</td>
                  <td>{venta.articuloCodigo}</td>
                  <td>{venta.articuloDescripcion}</td>
                  <td className="text-end">{venta.cantidad}</td>
                  <td>
                    {context.sucursalesTabla.find(
                      (s) => s.id === parseInt(venta.sucursal_id)
                    )?.nombre || "Desconocido"}
                  </td>
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
