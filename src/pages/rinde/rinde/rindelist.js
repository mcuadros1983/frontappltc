import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export default function ListaRindes() {
  // Datos
  const [rindesRaw, setRindesRaw] = useState([]);     // fuente original (no se toca)
  const [searchSucursal, setSearchSucursal] = useState("");
  const [searchMes, setSearchMes] = useState("");
  const [searchAnio, setSearchAnio] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rindesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const context = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  // -------- Fetch inicial (carga todo y no se vuelve a pedir) ----------
  const obtenerRindes = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/obtenerrindes`, { credentials: "include" });
      if (!response.ok) throw new Error("Error al obtener los rindes");
      const data = await response.json();
      setRindesRaw(Array.isArray(data?.rindes) ? data.rindes : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error al obtener los rindes:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    obtenerRindes();
  }, [obtenerRindes]);

  // -------- Helpers de ordenamiento ----------
  const numericCols = new Set([
    "mes", "anio", "totalVentas", "rinde", "ingresoEsperadoCerdo", "ingresoEsperadoNovillo",
    "ingresoEsperadoVaca", "totalInventarioFinal", "totalInventarioInicial",
    "totalKgCerdo", "totalKgNovillo", "totalKgVaca",
    "totalMovimientos", "totalventa", "costovacuno", "costoporcino", "gastos", "difInventario",
    "sucursal_id"
  ]);

  const getComparable = (row, col) => {
    const v = row?.[col];
    if (v === null || v === undefined) return -Infinity;
    if (numericCols.has(col)) {
      const n = Number(String(v).toString().replace(/[^\d.-]/g, ""));
      return isNaN(n) ? -Infinity : n;
    }
    return String(v).toLowerCase();
  };

  const handleSort = (columnName) => {
    const nextDir = columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortDirection(nextDir);
    setCurrentPage(1);
  };

  // -------- Filtros en frontend ----------
  const matchesFilters = (r) => {
    // mes/anio: si están, deben coincidir exactamente (permitimos strings o números)
    if (String(searchMes || "").trim() !== "") {
      if (String(r.mes ?? "").padStart(2, "0") !== String(searchMes).padStart(2, "0")) return false;
    }
    if (String(searchAnio || "").trim() !== "") {
      if (String(r.anio ?? "") !== String(searchAnio)) return false;
    }
    if (String(searchSucursal || "").trim() !== "") {
      const sucuId = Number(searchSucursal);
      if (Number(r.sucursal_id) !== sucuId) return false;
    }
    return true;
  };

  // Botón Filtrar → solo resetea página (el filtrado es reactivo)
  const handleSearchClick = () => setCurrentPage(1);

  // -------- Derivar vista: filtrar + ordenar ----------
  const rindesFiltradosYOrdenados = useMemo(() => {
    let rows = rindesRaw.filter(matchesFilters);

    if (sortColumn) {
      const dir = sortDirection === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const A = getComparable(a, sortColumn);
        const B = getComparable(b, sortColumn);
        if (A < B) return -1 * dir;
        if (A > B) return 1 * dir;
        return 0;
      });
    }

    return rows;
  }, [rindesRaw, searchMes, searchAnio, searchSucursal, sortColumn, sortDirection]);

  // -------- Paginación sobre la vista derivada ----------
  const totalPages = Math.max(1, Math.ceil(rindesFiltradosYOrdenados.length / rindesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [safePage, currentPage]);

  const indexOfLast = safePage * rindesPerPage;
  const indexOfFirst = indexOfLast - rindesPerPage;
  const currentRindes = rindesFiltradosYOrdenados.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (safePage < totalPages) setCurrentPage(safePage + 1);
  };
  const prevPage = () => {
    if (safePage > 1) setCurrentPage(safePage - 1);
  };

  // -------- Eliminar ----------
  const handleEliminarRinde = async (rindeId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este rinde?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`${apiUrl}/eliminarrinde/${rindeId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al eliminar el rinde");
      // Remover de la fuente original
      setRindesRaw((prev) => prev.filter((r) => r.id !== rindeId));
    } catch (error) {
      console.error("Error al eliminar el rinde:", error);
    }
  };



  // -------- UI ----------
  const exportarExcel = () => {
    if (!rindesFiltradosYOrdenados || rindesFiltradosYOrdenados.length === 0) {
      alert("No hay datos para exportar (revisá filtros).");
      return;
    }

    const toNumber = (v) => {
      if (v === null || v === undefined) return 0;
      if (typeof v === "number") return Number.isFinite(v) ? v : 0;
      // por si viene con separadores o símbolos
      const cleaned = String(v).replace(/[^\d.-]/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    };

    const getSucursalNombre = (sucursalId) =>
      context.sucursalesTabla.find((s) => s.id === parseInt(sucursalId))?.nombre ||
      "Desconocido";

    const data = rindesFiltradosYOrdenados.map((r) => ({
      "Mes": toNumber(r.mes),
      "Año": toNumber(r.anio),
      "Ventas": toNumber(r.totalVentas),
      "Rinde (%)": toNumber(r.rinde),
      "Sucursal": getSucursalNombre(r.sucursal_id),
      "IE CE": toNumber(r.ingresoEsperadoCerdo),
      "IE NT": toNumber(r.ingresoEsperadoNovillo),
      "IE EX": toNumber(r.ingresoEsperadoVaca),
      "Inv. Final": toNumber(r.totalInventarioFinal),
      "Inv. Inicial": toNumber(r.totalInventarioInicial),
      "KG CE": toNumber(r.totalKgCerdo),
      "KG NT": toNumber(r.totalKgNovillo),
      "KG EX": toNumber(r.totalKgVaca),
      "Mov.": toNumber(r.totalMovimientos),
      "Total Venta": toNumber(r.totalventa),
      "Costo Vacuno": toNumber(r.costovacuno),
      "Costo Porcino": toNumber(r.costoporcino),
      "Gastos": toNumber(r.gastos),
      "Dif. Inventario": toNumber(r.difInventario),
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [
      { wch: 6 },  // Mes
      { wch: 6 },  // Año
      { wch: 14 }, // Ventas
      { wch: 10 }, // Rinde
      { wch: 22 }, // Sucursal
      { wch: 10 }, // IE CE
      { wch: 10 }, // IE NT
      { wch: 10 }, // IE EX
      { wch: 12 }, // Inv Final
      { wch: 12 }, // Inv Inicial
      { wch: 10 }, // KG CE
      { wch: 10 }, // KG NT
      { wch: 10 }, // KG EX
      { wch: 10 }, // Mov
      { wch: 12 }, // Total Venta
      { wch: 12 }, // Costo Vacuno
      { wch: 12 }, // Costo Porcino
      { wch: 10 }, // Gastos
      { wch: 14 }, // Dif Inv
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rindes");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const nombreArchivo =
      `rindes_${searchMes || "mes"}_${searchAnio || "anio"}` +
      (searchSucursal ? `_sucursal_${searchSucursal}` : "") +
      ".xlsx";

    saveAs(blob, nombreArchivo);
  };


  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">Rindes</h1>

      {/* Filtros (frontend) */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">Mes</label>
          <FormControl
            type="number"
            placeholder="Mes"
            value={searchMes}
            onChange={(e) => setSearchMes(e.target.value)}
            className="vt-input"
            style={{ minWidth: 160 }}
          />
        </div>

        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">Año</label>
          <FormControl
            type="number"
            placeholder="Año"
            value={searchAnio}
            onChange={(e) => setSearchAnio(e.target.value)}
            className="vt-input"
            style={{ minWidth: 160 }}
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

          <Button
            variant="success"
            onClick={exportarExcel}
            disabled={!rindesFiltradosYOrdenados.length}
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("mes")} className="vt-th-sort">Mes</th>
              <th onClick={() => handleSort("anio")} className="vt-th-sort">Año</th>
              <th onClick={() => handleSort("totalVentas")} className="vt-th-sort text-end">Ventas</th>
              <th onClick={() => handleSort("rinde")} className="vt-th-sort text-end">Rinde</th>
              <th onClick={() => handleSort("sucursal_id")} className="vt-th-sort">Sucursal</th>
              <th onClick={() => handleSort("ingresoEsperadoCerdo")} className="vt-th-sort text-end">IE CE</th>
              <th onClick={() => handleSort("ingresoEsperadoNovillo")} className="vt-th-sort text-end">IE NT</th>
              <th onClick={() => handleSort("ingresoEsperadoVaca")} className="vt-th-sort text-end">IE EX</th>
              <th onClick={() => handleSort("totalInventarioFinal")} className="vt-th-sort text-end">Inv. Final</th>
              <th onClick={() => handleSort("totalInventarioInicial")} className="vt-th-sort text-end">Inv. Inicial</th>
              <th onClick={() => handleSort("totalKgCerdo")} className="vt-th-sort text-end">KG CE</th>
              <th onClick={() => handleSort("totalKgNovillo")} className="vt-th-sort text-end">KG NT</th>
              <th onClick={() => handleSort("totalKgVaca")} className="vt-th-sort text-end">KG EX</th>
              <th onClick={() => handleSort("totalMovimientos")} className="vt-th-sort text-end">Mov.</th>
              <th onClick={() => handleSort("totalventa")} className="vt-th-sort text-end">Total Venta</th>
              <th onClick={() => handleSort("costovacuno")} className="vt-th-sort text-end">Costo Vacuno</th>
              <th onClick={() => handleSort("costoporcino")} className="vt-th-sort text-end">Costo Porcino</th>
              <th onClick={() => handleSort("gastos")} className="vt-th-sort text-end">Gastos</th>
              <th onClick={() => handleSort("difInventario")} className="vt-th-sort text-end">Dif. Inventario</th>
              <th className="text-center">Operaciones</th>
            </tr>
          </thead>
          <tbody>
            {currentRindes.map((rinde) => (
              <tr key={rinde.id}>
                <td>{rinde.mes}</td>
                <td>{rinde.anio}</td>
                <td className="text-end">{rinde.totalVentas}</td>
                <td className="text-end">{rinde.rinde}%</td>
                <td>
                  {context.sucursalesTabla.find(
                    (sucursal) => sucursal.id === parseInt(rinde.sucursal_id)
                  )?.nombre || "Desconocido"}
                </td>
                <td className="text-end">{rinde.ingresoEsperadoCerdo}</td>
                <td className="text-end">{rinde.ingresoEsperadoNovillo}</td>
                <td className="text-end">{rinde.ingresoEsperadoVaca}</td>
                <td className="text-end">{rinde.totalInventarioFinal}</td>
                <td className="text-end">{rinde.totalInventarioInicial}</td>
                <td className="text-end">{rinde.totalKgCerdo}</td>
                <td className="text-end">{rinde.totalKgNovillo}</td>
                <td className="text-end">{rinde.totalKgVaca}</td>
                <td className="text-end">{rinde.totalMovimientos}</td>
                <td className="text-end">{rinde.totalventa}</td>
                <td className="text-end">{rinde.costovacuno}</td>
                <td className="text-end">{rinde.costoporcino}</td>
                <td className="text-end">{rinde.gastos}</td>
                <td className="text-end">{rinde.difInventario}</td>
                <td className="text-center">
                  <Button
                    variant="danger"
                    onClick={() => handleEliminarRinde(rinde.id)}
                    size="sm"
                    className="vt-btn-danger"
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
            {currentRindes.length === 0 && (
              <tr>
                <td colSpan={19} className="text-center text-muted">
                  Sin resultados para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center vt-pager">
        <Button onClick={prevPage} disabled={safePage === 1} variant="light">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {safePage} de {totalPages}
        </span>
        <Button
          onClick={nextPage}
          disabled={safePage === totalPages}
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
