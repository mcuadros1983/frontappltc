import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";

export default function VentasPorUsuario() {
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSucursal, setSelectedSucursal] = useState(""); // Estado para la sucursal seleccionada

  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const body = selectedSucursal
        ? {
            fechaDesde: startDate,
            fechaHasta: endDate,
            sucursalId: selectedSucursal,
          }
        : { fechaDesde: startDate, fechaHasta: endDate };

      const response = await fetch(`${apiUrl}/ventas/por_usuario_filtradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("data", data, "sucursales", context.sucursalesTabla)

        if (data.length === 0) {
          alert("No existen ventas para la fecha indicada.");
          return;
        }

        setVentasFiltradas(data);
      } else {
        throw new Error("Error al obtener las ventas por usuario filtradas");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSort = (columnName) => {
    const isAsc = columnName === sortColumn && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(columnName);
    setVentasFiltradas(
      [...ventasFiltradas].sort((a, b) => {
        let valueA = a[columnName];
        let valueB = b[columnName];
        return valueA < valueB
          ? isAsc
            ? 1
            : -1
          : valueA > valueB
          ? isAsc
            ? -1
            : 1
          : 0;
      })
    );
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    return date.getTime() && date.toISOString().slice(0, 10) === dateString;
  };

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

  return (
    <Container>
      <h1 className="my-list-title dark-text">Ventas por Usuario</h1>
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
        <FormControl
          as="select"
          className="mr-2"
          value={selectedSucursal}
          onChange={(e) => setSelectedSucursal(e.target.value)}
          style={{ width: "25%" }}
        >
          <option value="">Seleccionar sucursal</option>
          {context.sucursalesTabla.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>
      <div className="mb-3">
        <Button onClick={handleFilter}>Filtrar</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("fecha")}>Fecha</th>
            <th onClick={() => handleSort("usuario_id")}>Usuario</th>
            <th onClick={() => handleSort("sucursal_id")}>Sucursal</th>
            <th onClick={() => handleSort("total_monto")}>Total Monto</th>
          </tr>
        </thead>
        <tbody>
          {currentSells.map((venta) => (
            <tr key={venta.id}>
              <td>{venta.fecha}</td>
              <td>
                {context.usuariosTabla.find(
                  (usuario) => usuario.id === parseInt(venta.usuario_id)
                )?.nombre_completo || "Desconocido"}
              </td>
              <td>
                {context.sucursalesTabla.find(
                  (sucursal) => sucursal.id === parseInt(venta.sucursal_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>{venta.total_monto}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(ventasFiltradas.length / sellsPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(ventasFiltradas.length / sellsPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
