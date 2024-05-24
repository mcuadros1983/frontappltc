import React, { useState, useContext, useEffect } from "react";
import { Container, Table, Button, FormControl, Form } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";

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

  const context = useContext(Contexts.dataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!context.sucursalesTabla.length) {
      fetchSucursales();
    }
  }, []);

  const fetchSucursales = async () => {
    const response = await fetch(`${apiUrl}/sucursales`);
    if (response.ok) {
      const sucursales = await response.json();
      context.setSucursalesTabla(sucursales);
    }
  };

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }
      const response = await fetch(
        `${apiUrl}/ventas/por_cliente_filtradas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fechaDesde: startDate,
            fechaHasta: endDate,
            sucursalId: selectedSucursal,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No existen ventas para la fecha indicada.");
          // setVentasFiltradas([]);
          return;
        }


        setVentasFiltradas(data);
        setClientes([...new Set(data.map(venta => venta.cliente))]); // Extract unique clients
        setSelectedCliente(""); // Reset selected client
      } else {
        throw new Error("Error al obtener las ventas por cliente filtradas");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchClick = () => {
    handleFilter();
  };

  const handleSort = (columnName) => {
    const isAsc = columnName === sortColumn && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(columnName);
    setVentasFiltradas([...ventasFiltradas].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];
      if (columnName === "monto") {
        valueA = parseFloat(valueA.replace(/[^0-9.-]+/g, ""));
        valueB = parseFloat(valueB.replace(/[^0-9.-]+/g, ""));
      }
      return valueA < valueB ? (isAsc ? 1 : -1) : valueA > valueB ? (isAsc ? -1 : 1) : 0;
    }));
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
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = ventasFiltradas.filter(venta => selectedCliente === "" || venta.cliente === selectedCliente).slice(indexOfFirstSell, indexOfLastSell);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Ventas Por Cliente</h1>
      <div className="mb-3">
        {/* Date selectors */}
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control rounded-0 border-transparent text-center" />
        </div>
        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control rounded-0 border-transparent text-center" />
        </div>
      </div>
      <div className="mb-3">
        {/* Sucursal selector */}
        <Form.Control as="select" className="mr-2" value={selectedSucursal} onChange={(e) => setSelectedSucursal(e.target.value)} style={{ width: "25%" }}>
          <option value="">Seleccionar sucursal</option>
          {context.sucursalesTabla.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
          ))}
        </Form.Control>
      </div>
      <div className="mb-3">

        {/* Client selector */}
        <Form.Control as="select" className="mr-2" value={selectedCliente} onChange={(e) => setSelectedCliente(e.target.value)} style={{ width: "25%" }} disabled={clientes.length === 0}>
          <option value="">Seleccionar Cliente</option>
          {clientes.map((cliente, index) => (
            <option key={index} value={cliente}>{cliente}</option>
          ))}
        </Form.Control>
      </div>
      <Button onClick={handleSearchClick}>Filtrar</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>Fecha</th>
            <th onClick={() => handleSort("cliente")} style={{ cursor: "pointer" }}>Cliente</th>
            <th onClick={() => handleSort("monto")} style={{ cursor: "pointer" }}>Monto</th>
            <th onClick={() => handleSort("sucursal_id")} style={{ cursor: "pointer" }}>Sucursal</th>
          </tr>
        </thead>
        <tbody>
          {currentSells.map((venta) => (
            <tr key={venta.id}>
              <td>{venta.fecha}</td>
              <td>{venta.cliente}</td>
              <td>{venta.monto}</td>
              <td>{context.sucursalesTabla.find(sucursal => sucursal.id === parseInt(venta.sucursal_id))?.nombre || "Desconocido"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}><BsChevronLeft /></Button>
        <span className="mx-2">Página {currentPage} de {Math.ceil(ventasFiltradas.length / sellsPerPage)}</span>
        <Button onClick={nextPage} disabled={currentPage === Math.ceil(ventasFiltradas.length / sellsPerPage)}><BsChevronRight /></Button>
      </div>
    </Container>
  );
}