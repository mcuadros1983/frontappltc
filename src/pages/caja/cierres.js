import React, { useState, useContext, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function Cierres() {
  const [cierres, setCierres] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cierresPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const context = useContext(Contexts.DataContext);
  // const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = useCallback(async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/caja/cierres_filrados`, // Cambia la URL del endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fechaDesde: startDate,
            fechaHasta: endDate,
            sucursalId: searchSucursal,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No hay cierres en la fecha seleccionada");
          return;
        }
        setCierres(data);
        setCurrentPage(1);
      } else {
        throw new Error("Error al obtener los cierres");
      }
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl, startDate, endDate, searchSucursal]);

  const handleSort = (columnName) => {
    const direction = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(direction);
    setSortColumn(columnName);

    const sortedCierres = [...cierres].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === "total") {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setCierres(sortedCierres);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    if (!date.getTime()) return false;
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleEliminarCierre = async (cierreId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este cierre?");
    if (!confirmDelete) {
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/cierres/${cierreId}`, { method: "DELETE" });
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No hay cierres en la fecha y sucursal seleccionada");
          return;
        }
        setCierres(cierres.filter((cierre) => cierre.id !== cierreId));
      } else {
        throw new Error("Error al eliminar el cierre");
      }
    } catch (error) {
      console.error("Error al eliminar el cierre:", error);
    }
  };

  const indexOfLastCierre = currentPage * cierresPerPage;
  const indexOfFirstCierre = indexOfLastCierre - cierresPerPage;
  const currentCierres = cierres.slice(indexOfFirstCierre, indexOfLastCierre);

  const nextPage = () => {
    if (currentPage < Math.ceil(cierres.length / cierresPerPage)) {
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
      <h1 className="my-list-title">Cierres de Ventas</h1>

      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label>DESDE: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA: </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="mb-3">
        <FormControl
          as="select"
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
          className="mr-2 mb-3"
          style={{ width: "25%" }}
        >
          <option value="">Seleccione una sucursal</option>
          {context.sucursales.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="mb-3 d-flex">
        <Button onClick={handleFilter}>Filtrar</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("fecha")}>Fecha</th>
            <th onClick={() => handleSort("total")}>Total</th>
            <th onClick={() => handleSort("sucursal_id")}>Sucursal</th>
            <th onClick={() => handleSort("nro_cierre")}>Número de Cierre</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentCierres.map((cierre) => (
            <tr key={cierre.id}>
              <td>{cierre.fecha}</td>
              <td>${cierre.total.toFixed(2)}</td>
              <td>{context.sucursales.find(s => s.id === parseInt(cierre.sucursal_id))?.nombre || "Desconocido"}</td>
              <td>{cierre.nro_cierre}</td>
              <td>
                <Button variant="danger" onClick={() => handleEliminarCierre(cierre.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(cierres.length / cierresPerPage)}
        </span>
        <Button onClick={nextPage} disabled={currentPage === Math.ceil(cierres.length / cierresPerPage)}>
          <BsChevronRight />
        </Button>
      </div>

      {/* <div className="d-flex justify-content-center align-items-center">
                <Button onClick={paginaAnterior} disabled={paginaActual === 1}>
                    <BsChevronLeft />
                </Button>
                <span className="mx-2">
                    Página {paginaActual} de {Math.ceil([...ventas, ...cobranzas].length / operacionesPorPagina)}
                </span>
                <Button onClick={paginaSiguiente} disabled={paginaActual === Math.ceil([...ventas, ...cobranzas].length / operacionesPorPagina)}>
                    <BsChevronRight />
                </Button>
            </div> */}

    </Container>
  );
}