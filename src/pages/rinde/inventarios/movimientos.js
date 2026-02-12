import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Spinner,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export default function MovimientosInternos() {
  const [movimientos, setMovimientos] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientosPerPage] = useState(100);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");

  // NUEVO: sucursales por fetch (no por context)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const userContext = useContext(Contexts.UserContext);

  // ========= Fetch de sucursales =========
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await fetch(`${apiUrl}/sucursales`, {
          credentials: "include",
        });
        const data = await response.json();
        setBranches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [apiUrl]);

  const handleFilter = async () => {
    try {
      setLoading(true);
      setNoResults(false);
      setTipoSeleccionado("");

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/obtenermovimientosfiltrados`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaDesde: startDate,
          fechaHasta: endDate,
          sucursalId: searchSucursal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data || data.length === 0) {
          setNoResults(true);
          setMovimientos([]);
        } else {
          setMovimientos(data);
          setCurrentPage(1);
        }
      } else {
        throw new Error("Error al obtener los movimientos internos");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sortedMovimientos = [...movimientos].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (columnName === "fecha") {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setMovimientos(sortedMovimientos);
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const date = new Date(dateString);
    if (!date.getTime()) return false;
    return date.toISOString().slice(0, 10) === dateString;
  };

  const handleSearchClick = () => handleFilter();

  const handleEliminarMovimiento = async (movimientoId) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este movimiento?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/eliminarmovimientos/${movimientoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        await response.json();
        setMovimientos((prev) => prev.filter((m) => m.id !== movimientoId));
      } else {
        throw new Error("Error al eliminar el movimiento interno");
      }
    } catch (error) {
      console.error("Error al eliminar el movimiento interno:", error);
    }
  };

  const movimientosFiltradosPorTipo = tipoSeleccionado
    ? movimientos.filter((m) => m.tipo === tipoSeleccionado)
    : movimientos;

  const nextPage = () => {
    if (
      currentPage <
      Math.ceil(movimientosFiltradosPorTipo.length / movimientosPerPage)
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const indexOfLastMovimiento = currentPage * movimientosPerPage;
  const indexOfFirstMovimiento = indexOfLastMovimiento - movimientosPerPage;
  const currentMovimientos = movimientosFiltradosPorTipo.slice(
    indexOfFirstMovimiento,
    indexOfLastMovimiento
  );

  const sucursalNombreById = (id) => {
    const s = branches.find((b) => Number(b.id) === Number(id));
    return s?.nombre || "Desconocido";
  };

  const exportarExcel = () => {
    if (!movimientosFiltradosPorTipo || movimientosFiltradosPorTipo.length === 0) {
      alert("No hay datos para exportar. Filtrá primero.");
      return;
    }

    const toNumber = (v) => {
      if (v === null || v === undefined) return 0;
      if (typeof v === "number") return Number.isFinite(v) ? v : 0;
      const cleaned = String(v).replace(/[^\d.-]/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    };

    const data = movimientosFiltradosPorTipo.map((m) => ({
      "Fecha": m.fecha,
      "Lote": m.numerolote,
      "Código Artículo": m.articulocodigo,
      "Descripción": m.articulodescripcion,
      "Cantidad": toNumber(m.cantidad),
      "Tipo": m.tipo,
      "Sucursal": sucursalNombreById(m.sucursal_id),
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [
      { wch: 12 }, // Fecha
      { wch: 12 }, // Lote
      { wch: 16 }, // Código
      { wch: 45 }, // Descripción
      { wch: 12 }, // Cantidad
      { wch: 18 }, // Tipo
      { wch: 22 }, // Sucursal
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombreArchivo =
      `movimientos_internos_${startDate || "desde"}_${endDate || "hasta"}` +
      (searchSucursal ? `_sucursal_${searchSucursal}` : "") +
      (tipoSeleccionado ? `_tipo_${tipoSeleccionado}` : "") +
      ".xlsx";

    saveAs(blob, nombreArchivo);
  };


  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">Movimientos Internos</h1>

      {/* Filtros principales */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">DESDE</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control vt-input text-center"
            disabled={loading}
          />
        </div>

        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">HASTA</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control vt-input text-center"
            disabled={loading}
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
            disabled={loading || loadingBranches}
          >
            <option value="">
              {loadingBranches ? "Cargando sucursales..." : "Seleccione una sucursal"}
            </option>
            {branches.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        <div className="d-inline-block">
          <Button onClick={handleSearchClick} disabled={loading} className="vt-btn">
            Filtrar
          </Button>

          <Button
            variant="success"
            onClick={exportarExcel}
            disabled={loading || movimientosFiltradosPorTipo.length === 0}
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtro por tipo (condicional) */}
      {searchSucursal && movimientos.length > 0 && (
        <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
          <div className="d-inline-block w-auto">
            <label className="vt-label d-block">Tipo</label>
            <FormControl
              as="select"
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
              className="vt-input"
              style={{ minWidth: 240 }}
              disabled={loading}
            >
              <option value="">Todos los tipos</option>
              {[...new Set(movimientos.map((m) => m.tipo))].map((tipo, idx) => (
                <option key={idx} value={tipo}>
                  {tipo}
                </option>
              ))}
            </FormControl>
          </div>
        </div>
      )}

      {/* Loading / vacío */}
      {loading && <Spinner animation="border" role="status"></Spinner>}
      {noResults && <p>No se encontraron movimientos para las fechas especificadas</p>}

      {/* Tabla */}
      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")} className="vt-th-sort">
                Fecha
              </th>
              <th onClick={() => handleSort("numerolote")} className="vt-th-sort">
                Lote
              </th>
              <th
                onClick={() => handleSort("articulocodigo")}
                className="vt-th-sort"
              >
                Código de Artículo
              </th>
              <th
                onClick={() => handleSort("articulodescripcion")}
                className="vt-th-sort"
              >
                Descripción de Artículo
              </th>
              <th
                onClick={() => handleSort("cantidad")}
                className="vt-th-sort text-end"
              >
                Cantidad
              </th>
              <th onClick={() => handleSort("tipo")} className="vt-th-sort">
                Tipo
              </th>
              <th
                onClick={() => handleSort("sucursal_id")}
                className="vt-th-sort"
              >
                Sucursal
              </th>
              {userContext.user?.rol_id !== 4 && (
                <th className="text-center">Operaciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentMovimientos.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>{movimiento.fecha}</td>
                <td>{movimiento.numerolote}</td>
                <td>{movimiento.articulocodigo}</td>
                <td>{movimiento.articulodescripcion}</td>
                <td className="text-end">{movimiento.cantidad}</td>
                <td>{movimiento.tipo}</td>
                <td>{sucursalNombreById(movimiento.sucursal_id)}</td>
                {userContext.user?.rol_id !== 4 && (
                  <td className="text-center">
                    <div
                      className="d-inline-flex align-items-center justify-content-center"
                      style={{ gap: "10px", flexWrap: "nowrap" }}
                    >
                      <Button
                        variant="danger"
                        onClick={() => handleEliminarMovimiento(movimiento.id)}
                        disabled={loading}
                        size="sm"
                        className="vt-btn-danger d-inline-flex align-items-center justify-content-center"
                        style={{
                          height: "34px",
                          padding: "4px 12px",
                          borderRadius: "8px",
                          fontWeight: 500,
                          lineHeight: 1.5,
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center vt-pager">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1 || loading}
          variant="light"
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(movimientosFiltradosPorTipo.length / movimientosPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage ===
            Math.ceil(movimientosFiltradosPorTipo.length / movimientosPerPage) ||
            loading
          }
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
