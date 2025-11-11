import React, { useState, useContext } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Contexts from "../../context/Contexts";

export default function DetalleDeCaja() {
  const [detalles, setDetalles] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detallesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ventas, setVentas] = useState([]);

  const context = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!regEx.test(dateString)) return false;
    const d = new Date(dateString);
    if (!d.getTime()) return false;
    return d.toISOString().slice(0, 10) === dateString;
  };

  const handleFilter = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }
      if (searchSucursal === "") {
        alert("Debe seleccionar una sucursal.");
        return;
      }

      setLoading(true);
      setError("");

      const responseDetalles = await fetch(`${apiUrl}/caja/detalledecaja`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
        credentials: "include",
      });

      const responseVentas = await fetch(`${apiUrl}/ventas/filtradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
        credentials: "include",
      });

      const dataDetalles = await responseDetalles.json();
      const dataVentas = await responseVentas.json();

      if (Array.isArray(dataDetalles) && dataDetalles.length === 0) {
        alert("No existe informacion de caja para la fecha seleccionada.");
      }

      setDetalles(Array.isArray(dataDetalles) ? dataDetalles : []);
      setVentas(Array.isArray(dataVentas) ? dataVentas : []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError("No existe información para la sucursal en la fecha seleccionada.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnName, nested = false) => {
    const newSortDirection =
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(newSortDirection);

    const sorted = [...detalles].sort((a, b) => {
      let valueA = nested ? a?.caja?.[columnName] : a?.[columnName];
      let valueB = nested ? b?.caja?.[columnName] : b?.[columnName];

      if (columnName === "importe") {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      } else if (columnName === "fechainicio") {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      } else {
        const na = Number(valueA);
        const nb = Number(valueB);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) {
          valueA = na;
          valueB = nb;
        }
      }

      if (valueA < valueB) return newSortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return newSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setDetalles(sorted);
  };

  const calcularDiferenciaCaja = (detalle, ventasArr) => {
    const totalRetiros = parseFloat(detalle.totalRetiros) || 0;
    const totalGastos = parseFloat(detalle.totalGastos) || 0;
    const totalSueldos = parseFloat(detalle.totalSueldos) || 0;
    const totalVales = parseFloat(detalle.totalVales) || 0;
    const totalVtactactes = parseFloat(detalle.totalVtactactes) || 0;
    const cajaFinal = parseFloat(detalle?.caja?.cajafinal) || 0;
    const totalCupones = parseFloat(detalle.totalCupones) || 0;

    const totalIngresos =
      (parseFloat(detalle.totalIngresos) || 0) +
      (parseFloat(detalle?.caja?.cajainicial) || 0) +
      (parseFloat(detalle.totalCobranzas) || 0);

    const fechaBase = (detalle?.caja?.fechainicio || "").split("T")[0];
    const totalVentasDia =
      parseFloat(
        ventasArr.find((v) => v.fecha === fechaBase)?.monto || 0
      ) || 0;

    const egresos =
      totalRetiros +
      totalGastos +
      totalSueldos +
      totalVales +
      totalVtactactes +
      cajaFinal +
      totalCupones;

    return egresos - totalIngresos - totalVentasDia;
  };

  const handleSearchClick = () => handleFilter();

  const indexOfLastDetalle = currentPage * detallesPerPage;
  const indexOfFirstDetalle = indexOfLastDetalle - detallesPerPage;
  const currentDetalles = detalles.slice(indexOfFirstDetalle, indexOfLastDetalle);

  const nextPage = () => {
    if (currentPage < Math.ceil(detalles.length / detallesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // ---------- Exportación a Excel (TODO lo filtrado en `detalles`) ----------
  const handleExportExcel = () => {
    if (!detalles || detalles.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const filas = detalles.map((detalle) => {
      const fechaCompleta = detalle?.caja?.fechainicio || "";
      const fecha = (fechaCompleta || "").split("T")[0];

      const ventasDia =
        ventas.find((v) => v.fecha === fecha)?.monto || 0;

      const difCaja = calcularDiferenciaCaja(detalle, ventas);

      return {
        Fecha: fechaCompleta,
        "Caja Inicial": Number((parseFloat(detalle?.caja?.cajainicial) || 0).toFixed(2)),
        "Caja Final": Number((parseFloat(detalle?.caja?.cajafinal) || 0).toFixed(2)),
        Retiros: Number((parseFloat(detalle.totalRetiros) || 0).toFixed(2)),
        Cobranzas: Number((parseFloat(detalle.totalCobranzas) || 0).toFixed(2)),
        Tarjetas: Number((parseFloat(detalle.totalCupones) || 0).toFixed(2)),
        Gastos: Number((parseFloat(detalle.totalGastos) || 0).toFixed(2)),
        Ingresos: Number((parseFloat(detalle.totalIngresos) || 0).toFixed(2)),
        Sueldos: Number((parseFloat(detalle.totalSueldos) || 0).toFixed(2)),
        Vales: Number((parseFloat(detalle.totalVales) || 0).toFixed(2)),
        "Vta Cta Cte": Number((parseFloat(detalle.totalVtactactes) || 0).toFixed(2)),
        Ventas: Number((parseFloat(ventasDia) || 0).toFixed(2)),
        "Dif Caja": Number((parseFloat(difCaja) || 0).toFixed(2)),
      };
    });

    const ws = XLSX.utils.json_to_sheet(filas);

    // auto ancho de columnas
    const colWidths = Object.keys(filas[0]).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...filas.map((row) => (row[key] ? String(row[key]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
    });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle de Caja");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombre = `detalle_caja_${startDate || "sin-desde"}_a_${endDate || "sin-hasta"}.xlsx`
      .replaceAll("/", "-");
    saveAs(fileData, nombre);
  };

  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">Detalles de Caja</h1>

      {/* Filtros */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto mx-2">
          <label className="mr-2">DESDE: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control rounded-0 text-center vt-input"
            disabled={loading}
          />
        </div>

        <div className="d-inline-block w-auto mx-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control rounded-0 text-center vt-input"
            disabled={loading}
          />
        </div>

        <div className="d-inline-block w-auto mx-2">
          <label className="d-block">Sucursal</label>
          <FormControl
            as="select"
            value={searchSucursal}
            onChange={(e) => setSearchSucursal(e.target.value)}
            className="vt-input"
            style={{ minWidth: 280 }}
            disabled={loading}
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
          <Button onClick={handleSearchClick} disabled={loading} className="vt-btn">
            {loading ? <Spinner animation="border" size="sm" /> : "Filtrar"}
          </Button>
        </div>

        {/* Botón Exportar (verde) */}
        <div className="d-inline-block mx-2">
          <Button
            onClick={handleExportExcel}
            className="vt-btn"
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
            disabled={loading || detalles.length === 0}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="alert alert-danger my-2">{error}</div>}

      {/* Tabla */}
      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("fechainicio", true)} className="vt-th-sort">
                Fecha
              </th>
              <th onClick={() => handleSort("cajainicial")} className="vt-th-sort text-end">
                Caja Inicial
              </th>
              <th onClick={() => handleSort("cajafinal")} className="vt-th-sort text-end">
                Caja Final
              </th>
              <th onClick={() => handleSort("totalRetiros")} className="vt-th-sort text-end">
                Retiros
              </th>
              <th onClick={() => handleSort("totalCobranzas")} className="vt-th-sort text-end">
                Cobranzas
              </th>
              <th onClick={() => handleSort("totalCupones")} className="vt-th-sort text-end">
                Tarjetas
              </th>
              <th onClick={() => handleSort("totalGastos")} className="vt-th-sort text-end">
                Gastos
              </th>
              <th onClick={() => handleSort("totalIngresos")} className="vt-th-sort text-end">
                Ingresos
              </th>
              <th onClick={() => handleSort("totalSueldos")} className="vt-th-sort text-end">
                Sueldos
              </th>
              <th onClick={() => handleSort("totalVales")} className="vt-th-sort text-end">
                Vales
              </th>
              <th onClick={() => handleSort("totalVtactactes")} className="vt-th-sort text-end">
                Vta Cta Cte
              </th>
              <th onClick={() => handleSort("ventas")} className="vt-th-sort text-end">
                Ventas
              </th>
              <th onClick={() => handleSort("difcaja")} className="vt-th-sort text-end">
                Dif Caja
              </th>
            </tr>
          </thead>
          <tbody>
            {currentDetalles.map((detalle, index) => {
              const fechaCompleta = detalle?.caja?.fechainicio || "";
              const fecha = (fechaCompleta || "").split("T")[0];

              const ventasDia =
                ventas.find((v) => v.fecha === fecha)?.monto || 0;

              const difCaja = calcularDiferenciaCaja(detalle, ventas);

              return (
                <tr key={index}>
                  <td>{fechaCompleta || "0"}</td>
                  <td className="text-end">{(parseFloat(detalle?.caja?.cajainicial) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle?.caja?.cajafinal) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle.totalRetiros) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle.totalCobranzas) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle.totalCupones) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle.totalGastos) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle.totalIngresos) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle.totalSueldos) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle.totalVales) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(detalle.totalVtactactes) || 0).toFixed(2)}</td>
                  <td className="text-end">{(parseFloat(ventasDia) || 0).toFixed(2)}</td>
                  <td className="text-end">{parseFloat(difCaja.toFixed(2))}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center vt-pager">
        <Button onClick={prevPage} disabled={currentPage === 1 || loading} variant="light">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(detalles.length / detallesPerPage) || 1}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(detalles.length / detallesPerPage) || loading}
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
