import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts.js";

export default function Cajas() {
  const [cajas, setCajas] = useState([]);
  const [buscarSucursal, setBuscarSucursal] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cajasPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const context = useContext(Contexts.dataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = async () => {
    try {
      if (!isValidDate(fechaDesde) || !isValidDate(fechaHasta)) {
        alert("Ingrese fechas válidas.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/caja/cajas_filtrados`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fechaDesde,
            fechaHasta,
            sucursalId: buscarSucursal,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No existe informacion para la fecha indicada.");
          ;
          return;
        }
        setCajas(data);
        setCurrentPage(1);
      } else {
        throw new Error("Error al obtener las cajas");
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

    const sortedCajas = [...cajas].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === "importe") {
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

    setCajas(sortedCajas);
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

  const indexOfLastCaja = currentPage * cajasPerPage;
  const indexOfFirstCaja = indexOfLastCaja - cajasPerPage;
  const currentCajas = cajas.slice(indexOfFirstCaja, indexOfLastCaja);

  const nextPage = () => {
    if (currentPage < Math.ceil(cajas.length / cajasPerPage)) {
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
      <h1 className="my-list-title dark-text">Cajas</h1>

      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="form-control rounded-0 border-transparent text-center"
          />
        </div>
      </div>
      <div className="mb-3">
        <FormControl
          as="select"
          value={buscarSucursal}
          onChange={(e) => setBuscarSucursal(e.target.value)}
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
              onClick={() => handleSort("id")}
              style={{ cursor: "pointer" }}
            >
              Numero
            </th>
            <th
              onClick={() => handleSort("fechainicio")}
              style={{ cursor: "pointer" }}
            >
              Fecha Inicio
            </th>
            <th
              onClick={() => handleSort("fechafin")}
              style={{ cursor: "pointer" }}
            >
              Fecha Fin
            </th>
            <th
              onClick={() => handleSort("cajainicial")}
              style={{ cursor: "pointer" }}
            >
              Caja Inicial
            </th>
            <th
              onClick={() => handleSort("cajafinal")}
              style={{ cursor: "pointer" }}
            >
              Caja Final
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
          {currentCajas.map((caja) => {
            // const fechaInicio = new Date(caja.fechainicio);
            // const fechaFin = new Date(caja.fechafin);
            // const fechaInicioFormateada = fechaInicio.toLocaleString();
            // const fechaFinFormateada = fechaFin.toLocaleString();

            return (
              <tr key={caja.id}>
                <td>{caja.id}</td>
                <td>{caja.fechainicio}</td>
                <td>{caja.fechafin}</td>
                <td>{caja.cajainicial}</td>
                <td>{caja.cajafinal}</td>
                <td>
                  {context.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(caja.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(cajas.length / cajasPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(cajas.length / cajasPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}