import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Contexts from "../../context/Contexts";

export default function Retiros() {
  const [retiros, setRetiros] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [retirosPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = async () => {
    try {
      // Validación de fechas
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const response = await fetch(`${apiUrl}/caja/retiros_filtrados`, {
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
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No existe información para la fecha indicada.");
          return;
        }
        setRetiros(data);
        setCurrentPage(1); // Reiniciar a la primera página después de cada búsqueda
      } else {
        throw new Error("Error al obtener los retiros");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSort = (columnName) => {
    const nextDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(nextDirection);
    setSortColumn(columnName);

    const sortedRetiros = [...retiros].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      // Si la columna es "importe", convierte a número
      if (columnName === "importe") {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }

      if (valueA < valueB) return nextDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return nextDirection === "asc" ? 1 : -1;
      return 0;
    });

    setRetiros(sortedRetiros);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!regEx.test(dateString)) return false; // Formato incorrecto
    const date = new Date(dateString);
    if (!date.getTime()) return false; // Fecha inválida
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleSearchClick = () => {
    handleFilter();
  };

  // 🔽 NUEVO: Exportar todo lo cargado en `retiros` a Excel
  const handleExportExcel = () => {
    if (!retiros || retiros.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const exportData = retiros.map((r) => {
      const sucursalNombre =
        context.sucursalesTabla.find(
          (s) => s.id === parseInt(r.sucursal_id, 10)
        )?.nombre || "Desconocido";

      return {
        Fecha: r.fecha,
        Importe: Number.isNaN(parseFloat(r.importe))
          ? r.importe
          : parseFloat(r.importe),
        Sucursal: sucursalNombre,
        Descripción: r.descripcion,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Opcional: ajustar ancho de columnas automáticamente
    const colWidths = Object.keys(exportData[0]).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...exportData.map((row) => (row[key] ? String(row[key]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Retiros");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const fileData = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName =
      `retiros_${startDate || "sin-desde"}_a_${endDate || "sin-hasta"}.xlsx`.replaceAll(
        "/",
        "-"
      );

    saveAs(fileData, fileName);
  };

  const indexOfLastRetiro = currentPage * retirosPerPage;
  const indexOfFirstRetiro = indexOfLastRetiro - retirosPerPage;
  const currentRetiros = retiros.slice(indexOfFirstRetiro, indexOfLastRetiro);

  const nextPage = () => {
    if (currentPage < Math.ceil(retiros.length / retirosPerPage)) {
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
      <h1 className="my-list-title dark-text vt-title">Retiros</h1>

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

        <div className="d-inline-block mx-2">
          <Button onClick={handleSearchClick} className="vt-btn">
            Filtrar
          </Button>
        </div>

        {/* 🔽 NUEVO: Botón Exportar (verde) */}
        <div className="d-inline-block mx-2">
          <Button
            onClick={handleExportExcel}
            className="vt-btn"
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
          >
            Exportar
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
              <th
                onClick={() => handleSort("importe")}
                className="vt-th-sort text-end"
              >
                Importe
              </th>
              <th
                onClick={() => handleSort("sucursal_id")}
                className="vt-th-sort"
              >
                Sucursal
              </th>
              <th
                onClick={() => handleSort("descripcion")}
                className="vt-th-sort"
              >
                Descripción
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRetiros.map((retiro) => (
              <tr key={retiro.id}>
                <td>{retiro.fecha}</td>
                <td className="text-end">{retiro.importe}</td>
                <td>
                  {context.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(retiro.sucursal_id, 10)
                  )?.nombre || "Desconocido"}
                </td>
                <td>{retiro.descripcion}</td>
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
          Página {currentPage} de {Math.ceil(retiros.length / retirosPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(retiros.length / retirosPerPage)}
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
