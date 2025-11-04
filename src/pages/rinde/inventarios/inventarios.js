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
          }), credentials: "include"
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
          method: "DELETE", credentials: "include"
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
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Inventario</h1>

    {/* Filtros */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto">
        <label className="vt-label d-block">DESDE</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="form-control vt-input text-center"
        />
      </div>

      <div className="d-inline-block w-auto">
        <label className="vt-label d-block">HASTA</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="form-control vt-input text-center"
        />
      </div>

      <div className="d-inline-block w-auto">
        <label className="vt-label d-block">Sucursal</label>
        <FormControl
          as="select"
          value={searchSucursal}
          onChange={(e) => setSearchSucursal(e.target.value)}
          className="vt-input"
          style={{ minWidth: 240 }}
        >
          <option value="">Seleccione una sucursal</option>
          {context.sucursalesTabla.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="d-inline-block">
        <Button onClick={handleSearchClick} className="vt-btn">
          Filtrar
        </Button>
      </div>
    </div>

    {/* Tabla */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th onClick={() => handleSort("fecha")} className="vt-th-sort">Fecha</th>
            <th onClick={() => handleSort("mes")} className="vt-th-sort">Mes</th>
            <th onClick={() => handleSort("anio")} className="vt-th-sort">Año</th>
            <th onClick={() => handleSort("total")} className="vt-th-sort text-end">Total</th>
            <th onClick={() => handleSort("sucursal_id")} className="vt-th-sort">Sucursal</th>
            <th onClick={() => handleSort("usuario_id")} className="vt-th-sort">Usuario ID</th>
            <th className="text-center">Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {currentInventarios.map((inventario) => (
            <tr
              key={inventario.id}
              onDoubleClick={() => navigate(`/inventory/${inventario.id}/articles`)}
            >
              <td>{inventario.fecha}</td>
              <td>{inventario.mes}</td>
              <td>{inventario.anio}</td>
              <td className="text-end">{inventario.total}</td>
              <td>
                {context.sucursalesTabla.find(
                  (s) => s.id === parseInt(inventario.sucursal_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>{inventario.usuario_id}</td>
              <td className="text-center">
                <Button
                  variant="danger"
                  onClick={() => handleEliminarInventario(inventario.id)}
                  size="sm"
                  className="vt-btn-danger"
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    {/* Paginación */}
    <div className="d-flex justify-content-center align-items-center vt-pager">
      <Button onClick={prevPage} disabled={currentPage === 1} variant="light">
        <BsChevronLeft />
      </Button>
      <span className="mx-2">
        Página {currentPage} de {Math.ceil(inventarios.length / inventariosPerPage)}
      </span>
      <Button
        onClick={nextPage}
        disabled={currentPage === Math.ceil(inventarios.length / inventariosPerPage)}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

}
