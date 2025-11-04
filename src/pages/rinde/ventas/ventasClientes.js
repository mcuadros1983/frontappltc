// VentasClientes.jsx
import React, { useState, useContext, useEffect, useCallback } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import * as XLSX from "xlsx";
import "../../../components/css/VentasClientes.css"; // ⬅️ NUEVO

export default function VentasClientes() {
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSucursal, setSelectedSucursal] = useState("");

  const context = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchSucursales = useCallback(async () => {
    const response = await fetch(`${apiUrl}/sucursales`);
    if (response.ok) {
      const sucursales = await response.json();
      context.setSucursalesTabla(sucursales);
    }
  }, [apiUrl, context]);

  useEffect(() => {
    if (!context.sucursalesTabla.length) fetchSucursales();
  }, [context.sucursalesTabla.length, fetchSucursales]);

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }
      const response = await fetch(`${apiUrl}/ventas/por_cliente_filtradas`, {
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
          setClientes([]);
          setSelectedCliente("");
          return;
        }
        setVentasFiltradas(data);
        setClientes([...new Set(data.map((venta) => venta.cliente))]);
        setSelectedCliente("");
        setCurrentPage(1);
      } else {
        throw new Error("Error al obtener las ventas por cliente filtradas");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchClick = () => handleFilter();

  const handleExport = () => {
    if (ventasFiltradas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const dataToExport = ventasFiltradas.map((venta) => ({
      Fecha: venta.fecha,
      Cliente: venta.cliente,
      Monto: parseFloat(venta.monto).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      Sucursal:
        context.sucursalesTabla.find(
          (sucursal) => sucursal.id === parseInt(venta.sucursal_id)
        )?.nombre || "Desconocido",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas Por Cliente");
    XLSX.writeFile(workbook, "VentasPorCliente.xlsx");
  };

  const handleSort = (columnName) => {
    const isAsc = columnName === sortColumn && sortDirection === "asc";
    const nextDir = isAsc ? "desc" : "asc";
    setSortDirection(nextDir);
    setSortColumn(columnName);
    setVentasFiltradas(
      [...ventasFiltradas].sort((a, b) => {
        let valueA = a[columnName];
        let valueB = b[columnName];
        if (columnName === "monto") {
          valueA = parseFloat(String(valueA).replace(/[^0-9.-]+/g, ""));
          valueB = parseFloat(String(valueB).replace(/[^0-9.-]+/g, ""));
        }
        if (valueA < valueB) return nextDir === "asc" ? -1 : 1;
        if (valueA > valueB) return nextDir === "asc" ? 1 : -1;
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

  const nextPage = () => {
    if (currentPage < Math.ceil(ventasFiltradas.length / sellsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = ventasFiltradas
    .filter((venta) => selectedCliente === "" || venta.cliente === selectedCliente)
    .slice(indexOfFirstSell, indexOfLastSell);

  return (
    <Container className="vc-page">
      <h1 className="vc-title">Ventas Por Cliente</h1>

      {/* Barra de filtros */}
      <div className="vc-toolbar d-flex flex-wrap align-items-end gap-3 mb-3">
        <div className="mx-2"> 
          <label className="d-block">DESDE</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control text-center vc-input"
          />
        </div>
        <div className="mx-2">
          <label className="d-block">HASTA</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control text-center vc-input"
          />
        </div>

        <div className="mx-2">
          <label className="d-block">Sucursal</label>
          <Form.Select
            className="vc-input form-control my-input"
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
          </Form.Select>
        </div>

        <div className="mx-2"> 
          <label className="d-block">Cliente</label>
          <Form.Select
            className="vc-input form-control my-input"
            value={selectedCliente}
            onChange={(e) => setSelectedCliente(e.target.value)}
            style={{ minWidth: 240 }}
            disabled={clientes.length === 0}
          >
            <option value="">Seleccionar Cliente</option>
            {clientes.map((cliente, index) => (
              <option key={index} value={cliente}>
                {cliente}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="d-flex gap-2 my-2">
          <Button onClick={handleSearchClick} className="vc-btn mx-2">
            Filtrar
          </Button>
          <Button onClick={handleExport} variant="success" className="vc-btn mx-2">
            Exportar a Excel
          </Button>
        </div>
      </div>

      <div className="vc-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")} className="vc-th-sort">
                Fecha {sortColumn === "fecha" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("cliente")} className="vc-th-sort">
                Cliente {sortColumn === "cliente" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("monto")} className="vc-th-sort text-end">
                Monto {sortColumn === "monto" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("sucursal_id")} className="vc-th-sort">
                Sucursal {sortColumn === "sucursal_id" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSells.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.fecha}</td>
                <td>{venta.cliente}</td>
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

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center vc-pager">
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
