import React, { useState, useEffect, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [gastosPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [tipoDeGastoFilter, setTipoDeGastoFilter] = useState("");
  const [selectedTipoGasto, setSelectedTipoGasto] = useState("");

  const context = useContext(Contexts.dataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    handleTipoGastoFilter();
  }, [selectedTipoGasto]);

  const handleTipoGastoFilter = () => {
    // Filter gastos based on selectedTipoGasto
    if (gastos.length > 0) {
      let filteredGastos = gastos;

      if (selectedTipoGasto) {
        filteredGastos = filteredGastos.filter(
          (gasto) => gasto.tipodegasto_id === parseInt(selectedTipoGasto)
        );
      }

      setGastos(filteredGastos);
      setCurrentPage(1);
    }
  };

  // useEffect(() => {
  //   handleFilter();
  // }, []); // Load data on component mount

  const handleFilter = async () => {
    try {
      // Validación de fechas
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const response = await fetch(
        `${apiUrl}/caja/gastos_filtrados`,
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
          alert("No existe informacion para la fecha indicada.");
          ;
          return;
        }
        // console.log("data", data);
        setGastos(data);
        setCurrentPage(1); // Reiniciar a la primera página después de cada búsqueda
        setSelectedTipoGasto("");
      } else {
        throw new Error("Error al obtener los gastos");
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

    const sortedGastos = [...gastos].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      // Si la columna es "importe", convierte las cadenas de texto en números antes de compararlas
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

    setGastos(sortedGastos);
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

  const indexOfLastGasto = currentPage * gastosPerPage;
  const indexOfFirstGasto = indexOfLastGasto - gastosPerPage;
  const currentGastos = gastos.slice(indexOfFirstGasto, indexOfLastGasto);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < Math.ceil(gastos.length / gastosPerPage)) {
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
      <h1 className="my-list-title dark-text">Gastos</h1>

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
        <FormControl
          as="select"
          value={selectedTipoGasto}
          onChange={(e) => setSelectedTipoGasto(e.target.value)}
          className="mr-2"
          style={{ width: "25%" }}
        >
          <option value="">Seleccione un tipo de gasto</option>
          {context.tipoDeGastoTabla.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.descripcion}
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
              onClick={() => handleSort("importe")}
              style={{ cursor: "pointer" }}
            >
              Importe
            </th>
            <th
              onClick={() => handleSort("sucursal_id")}
              style={{ cursor: "pointer" }}
            >
              Sucursal
            </th>
            <th
              onClick={() => handleSort("descripcion")}
              style={{ cursor: "pointer" }}
            >
              Descripción
            </th>
            <th
              onClick={() => handleSort("tipodegasto_id")}
              style={{ cursor: "pointer" }}
            >
              Tipo de Gasto
            </th>
          </tr>
        </thead>
        <tbody>
          {currentGastos.map((gasto) => {
            // // Convertir la fecha a un objeto Date
            // const fecha = new Date(gasto.fecha);
            // // Obtener los componentes de la fecha
            // const dia = fecha.getDate();
            // const mes = fecha.getMonth() + 1; // Los meses comienzan desde 0
            // const anio = fecha.getFullYear();
            // // Formatear la fecha en el formato DD/MM/AAAA
            // const fechaFormateada = `${dia}/${mes}/${anio}`;

            return (
              <tr key={gasto.id}>
                <td>{gasto.fecha}</td>
                <td>{gasto.importe}</td>
                <td>
                  {context.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(gasto.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
                <td>{gasto.descripcion}</td>
                <td>
                  {context.tipoDeGastoTabla.find(
                    (tipo) => tipo.id === parseInt(gasto.tipodegasto_id)
                  )?.descripcion || "Desconocido"}
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
          Página {currentPage} de {Math.ceil(gastos.length / gastosPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(gastos.length / gastosPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
