import React, { useState, useEffect, useContext,useCallback } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../context/Contexts";
import * as XLSX from "xlsx";

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [gastosPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  // const [tipoDeGastoFilter, setTipoDeGastoFilter] = useState("");
  const [selectedTipoGasto, setSelectedTipoGasto] = useState("");

  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const exportarExcel = () => {
  const datosParaExportar = gastos.map((gasto) => {
    const sucursalNombre = context.sucursalesTabla.find(
      (sucursal) => sucursal.id === parseInt(gasto.sucursal_id)
    )?.nombre || "Desconocido";

    const tipoGastoDescripcion = context.tipoDeGastoTabla.find(
      (tipo) => tipo.id === parseInt(gasto.tipodegasto_id)
    )?.descripcion || "Desconocido";

    return {
      Fecha: gasto.fecha,
      Importe: gasto.importe,
      Sucursal: sucursalNombre,
      Descripción: gasto.descripcion,
      "Tipo de Gasto": tipoGastoDescripcion,
    };
  });

  const ws = XLSX.utils.json_to_sheet(datosParaExportar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Gastos");
  XLSX.writeFile(wb, "gastos.xlsx");
};


  const handleTipoGastoFilter = useCallback(() => {
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
  }, [gastos, selectedTipoGasto]); // Include all relevant dependencies

  useEffect(() => {
    handleTipoGastoFilter();
  }, [selectedTipoGasto, handleTipoGastoFilter]); // Include handleTipoGastoFilter in the dependency array


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
          credentials: "include",
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

  // const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
  <Container className="vt-page">
    <h1 className="my-list-title dark-text vt-title">Gastos</h1>

    {/* Filtros */}
    <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
      <div className="d-inline-block w-auto mx-2">
        <label className="mr-2">DESDE:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="form-control rounded-0 text-center vt-input"
        />
      </div>

      <div className="d-inline-block w-auto mx-2">
        <label className="ml-2 mr-2">HASTA:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="form-control rounded-0 text-center vt-input"
        />
      </div>

      <div className="d-inline-block">
        <label className="d-block">Sucursal</label>
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
        <label className="d-block">Tipo de gasto</label>
        <FormControl
          as="select"
          value={selectedTipoGasto}
          onChange={(e) => setSelectedTipoGasto(e.target.value)}
          className="vt-input"
          style={{ minWidth: 240 }}
        >
          <option value="">Seleccione un tipo de gasto</option>
          {context.tipoDeGastoTabla.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.descripcion}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="d-inline-block mx-2">
        <Button onClick={handleSearchClick} className="vt-btn me-2">
          Filtrar
        </Button>
        <Button
          onClick={exportarExcel}
          disabled={gastos.length === 0}
          className="vt-btn-secondary"
        >
          Exportar a Excel
        </Button>
      </div>
    </div>

    {/* Tabla */}
    <div className="vt-tablewrap table-responsive">
      <Table striped bordered hover className="mb-2">
        <thead>
          <tr>
            <th onClick={() => handleSort("fecha")} className="vt-th-sort">
              Fecha
            </th>
            <th onClick={() => handleSort("importe")} className="vt-th-sort text-end">
              Importe
            </th>
            <th onClick={() => handleSort("sucursal_id")} className="vt-th-sort">
              Sucursal
            </th>
            <th onClick={() => handleSort("descripcion")} className="vt-th-sort">
              Descripción
            </th>
            <th onClick={() => handleSort("tipodegasto_id")} className="vt-th-sort">
              Tipo de Gasto
            </th>
          </tr>
        </thead>

        <tbody>
          {currentGastos.map((gasto) => (
            <tr key={gasto.id}>
              <td>{gasto.fecha}</td>
              <td className="text-end">{gasto.importe}</td>
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
        Página {currentPage} de {Math.ceil(gastos.length / gastosPerPage)}
      </span>
      <Button
        onClick={nextPage}
        disabled={currentPage === Math.ceil(gastos.length / gastosPerPage)}
        variant="light"
      >
        <BsChevronRight />
      </Button>
    </div>
  </Container>
);

}