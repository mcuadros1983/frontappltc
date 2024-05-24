import React, { useContext, useState, useEffect } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";

export default function VentasTotales() {
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(10); // Cambia el número de ventas por página según tus preferencias
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSucursal, setSelectedSucursal] = useState(""); // Estado para la sucursal seleccionada

  const context = useContext(Contexts.dataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Aquí puedes realizar alguna acción cuando cambie la sucursal seleccionada,
    // como cargar datos relacionados con esa sucursal.
    // console.log("Sucursal seleccionada:", selectedSucursal);
  }, [selectedSucursal]);

  const handleFilter = async () => {
    try {
      // Validación de fechas
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/ventas/anuladasfiltradas`,
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
        setCurrentPage(1); // Reiniciar a la primera página después de cada búsqueda
      } else {
        throw new Error("Error al obtener las ventas anuladas filtradas");
      }
    } catch (error) {
      console.error(error);
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

      // Convertir a número si el nombre de la columna es "numeroticket"
      if (columnName === "numeroticket") {
        valueA = parseInt(valueA, 10);
        valueB = parseInt(valueB, 10);
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setVentasFiltradas(sortedSells);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false; // Formato incorrecto
    const date = new Date(dateString);
    if (!date.getTime()) return false; // Fecha inválida (por ejemplo, 31/04/2024)
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleSearchClick = () => {
    handleFilter();
  };

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = ventasFiltradas.slice(indexOfFirstSell, indexOfLastSell);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <h1 className="my-list-title dark-text">Ventas Anuladas</h1>

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
        <Button onClick={handleSearchClick}>Filtrar</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("fecha")}
              style={{ cursor: "pointer" }}
            >
              Fecha
            </th>
            <th
              onClick={() => handleSort("monto")}
              style={{ cursor: "pointer" }}
            >
              Monto
            </th>
            <th
              onClick={() => handleSort("numeroticket")}
              style={{ cursor: "pointer" }}
            >
              Número de Ticket
            </th>
            <th
              onClick={() => handleSort("sucursal_id")}
              style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
          </tr>
        </thead>
        <tbody>
          {currentSells.map((venta) => (
            <tr key={venta.id}>
              <td>{venta.fecha}</td>
              <td>{venta.monto}</td>
              <td>{venta.numeroticket}</td>
              <td>{venta.sucursalNombre}</td>
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
