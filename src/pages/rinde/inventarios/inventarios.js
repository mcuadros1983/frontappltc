import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";

export default function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inventariosPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const context = useContext(Contexts.DataContext);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/obtenerinventariosfiltrados`,
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
        setInventarios(data);
        setCurrentPage(1);
      } else {
        throw new Error("Error al obtener los inventarios");
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

    const sortedInventarios = [...inventarios].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === "total") {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setInventarios(sortedInventarios);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    if (!date.getTime()) return false;
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleSearchClick = () => {
    handleFilter();
  };

  const handleEliminarInventario = async (inventarioId) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este inventario?"
    );
    if (!confirmDelete) {
      return;
    }
    try {
      const response = await fetch(
        `${apiUrl}/inventario/${inventarioId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        await response.json();
        // console.log(data.message);
        setInventarios(
          inventarios.filter((inventario) => inventario.id !== inventarioId)
        );
      } else {
        throw new Error("Error al eliminar el inventario");
      }
    } catch (error) {
      console.error("Error al eliminar el inventario:", error);
    }
  };

  const indexOfLastInventario = currentPage * inventariosPerPage;
  const indexOfFirstInventario = indexOfLastInventario - inventariosPerPage;
  const currentInventarios = inventarios.slice(
    indexOfFirstInventario,
    indexOfLastInventario
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(inventarios.length / inventariosPerPage)) {
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
      <h1 className="my-list-title dark-text">Inventario</h1>

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
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
        >
          <option value="">Seleccione una sucursal</option>
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
              onClick={() => handleSort("mes")}
              style={{ cursor: "pointer" }}
            >
              Mes
            </th>
            <th
              onClick={() => handleSort("anio")}
              style={{ cursor: "pointer" }}
            >
              Año
            </th>
            <th
              onClick={() => handleSort("total")}
              style={{ cursor: "pointer" }}
            >
              Total
            </th>
            <th
              onClick={() => handleSort("sucursal_id")}
              style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
            <th
              onClick={() => handleSort("usuario_id")}
              style={{ cursor: "pointer" }}
            >
              Usuario ID
            </th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentInventarios.map((inventario) => (
            <tr
              key={inventario.id}
              onDoubleClick={() =>
                navigate(`/inventory/${inventario.id}/articles`)
              }
            >
              <td>{inventario.fecha}</td>
              <td>{inventario.mes}</td>
              <td>{inventario.anio}</td>
              <td>{inventario.total}</td>
              <td>
                {context.sucursalesTabla.find(
                  (sucursal) => sucursal.id === parseInt(inventario.sucursal_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>{inventario.usuario_id}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleEliminarInventario(inventario.id)}
                >
                  Eliminar
                </Button>
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
          Página {currentPage} de{" "}
          {Math.ceil(inventarios.length / inventariosPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(inventarios.length / inventariosPerPage)
          }
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
