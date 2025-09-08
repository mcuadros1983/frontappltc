import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";
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

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    if (!date.getTime()) return false;
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const response = await fetch(`${apiUrl}/caja/retiros_filtrados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert("No existe informacion para la fecha indicada.");
          return;
        }
        setRetiros(data);
        setCurrentPage(1);
      } else {
        throw new Error("Error al obtener los retiros");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSort = (columnName) => {
    const newDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    setSortColumn(columnName);

    const sortedRetiros = [...retiros].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === "importe") {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }

      if (valueA < valueB) return newDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return newDirection === "asc" ? 1 : -1;
      return 0;
    });

    setRetiros(sortedRetiros);
  };

  const handleSearchClick = () => {
    handleFilter();
  };

  // Paginación (solo de la vista)
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

  // ===== Exportar a Excel (xlsx) — exporta TODO lo filtrado en `retiros` =====
  const exportarExcel = () => {
    if (!retiros || retiros.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = ["Fecha", "Importe", "Sucursal", "Descripción"];

    const rows = retiros.map((r) => {
      const sucursalNombre =
        (context?.sucursalesTabla || []).find(
          (s) => s.id === parseInt(r.sucursal_id)
        )?.nombre || "Desconocido";

      return [
        r.fecha,
        Number(r.importe) || 0,
        sucursalNombre,
        r.descripcion ?? "",
      ];
    });

    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto-filtro y anchos
    const lastRow = data.length;
    const lastCol = headers.length - 1;
    const colLetter = (n) => {
      let s = "";
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
      }
      return s;
    };
    ws["!autofilter"] = { ref: `A1:${colLetter(lastCol)}${lastRow}` };
    ws["!cols"] = [
      { wch: 12 }, // Fecha
      { wch: 12 }, // Importe
      { wch: 22 }, // Sucursal
      { wch: 40 }, // Descripción
    ];

    // Tipar como número la columna Importe (B)
    for (let r = 2; r <= lastRow; r++) {
      if (ws[`B${r}`]) ws[`B${r}`].t = "n";
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Retiros");

    const rango =
      startDate && endDate
        ? `_${startDate}_a_${endDate}`
        : `_${new Date().toISOString().slice(0, 10)}`;
    XLSX.writeFile(wb, `retiros_filtrados${rango}.xlsx`);
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Retiros</h1>

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
          {(context?.sucursalesTabla || []).map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </FormControl>
      </div>

      <div className="mb-3 d-flex align-items-center gap-2">
        <Button onClick={handleSearchClick} className="me-2">
          Filtrar
        </Button>

        <Button
          variant="success"
          onClick={exportarExcel}
          disabled={retiros.length === 0}
        >
          Exportar a Excel
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>
              Fecha
            </th>
            <th onClick={() => handleSort("importe")} style={{ cursor: "pointer" }}>
              Importe
            </th>
            <th onClick={() => handleSort("sucursal_id")} style={{ cursor: "pointer" }}>
              Sucursal
            </th>
            <th onClick={() => handleSort("descripcion")} style={{ cursor: "pointer" }}>
              Descripción
            </th>
          </tr>
        </thead>
        <tbody>
          {currentRetiros.map((retiro) => (
            <tr key={retiro.id}>
              <td>{retiro.fecha}</td>
              <td>{(Number(retiro.importe) || 0).toFixed(2)}</td>
              <td>
                {(context?.sucursalesTabla || []).find(
                  (s) => s.id === parseInt(retiro.sucursal_id)
                )?.nombre || "Desconocido"}
              </td>
              <td>{retiro.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1}>
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(retiros.length / retirosPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(retiros.length / retirosPerPage)}
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}

