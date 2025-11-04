// CantidadTicketPorUsuario.jsx
import React, { useState, useContext } from "react";
import { Container, Table, Button, FormControl } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";
import "../../../components/css/CantidadTicketPorUsuario.css"; // ⬅️ NUEVO

export default function CantidadTicketPorUsuario() {
  const [cantidadesTicketFiltrados, setCantidadesTicketFiltrados] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellsPerPage] = useState(20);
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [filterBy, setFilterBy] = useState("sucursal");

  // Orden
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const context = useContext(Contexts.DataContext);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFilter = async () => {
    try {
      setCurrentPage(1);
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        return;
      }

      const body = { fechaDesde: startDate, fechaHasta: endDate };

      const resp = await fetch(`${apiUrl}/ventas/cantidad_ticket_por_usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error("Error al obtener la cantidad de tickets");

      const data = await resp.json();
      const agrupados =
        filterBy === "sucursal" ? agruparPorSucursal(data) : agruparPorUsuario(data);
      setCantidadesTicketFiltrados(agrupados);
    } catch (e) {
      console.error(e);
    }
  };

  const agruparPorSucursal = (data) => {
    const acc = data.reduce((map, v) => {
      const k = v.sucursal_id;
      if (!map[k]) map[k] = { sucursal_id: v.sucursal_id, cantidad: 0, total_monto: 0 };
      map[k].cantidad += Number(v.cantidad);
      map[k].total_monto += Number(v.total_monto);
      return map;
    }, {});
    return Object.values(acc);
  };

  const agruparPorUsuario = (data) => {
    const acc = data.reduce((map, v) => {
      const k = v.usuario_id;
      if (!map[k]) map[k] = { usuario_id: v.usuario_id, cantidad: 0, total_monto: 0 };
      map[k].cantidad += Number(v.cantidad);
      map[k].total_monto += Number(v.total_monto);
      return map;
    }, {});
    return Object.values(acc);
  };

  const isValidDate = (s) =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(s).toISOString().slice(0, 10) === s;

  const getNombreClave = (row) => {
    if (filterBy === "sucursal") {
      return (
        context.sucursalesTabla.find((s) => s.id === parseInt(row.sucursal_id))?.nombre ||
        ""
      );
    }
    return (
      context.usuariosTabla.find((u) => u.id === parseInt(row.usuario_id))?.nombre_completo ||
      ""
    );
  };

  const handleSort = (col) => {
    setCurrentPage(1);
    setSortDir((prev) => (sortCol === col && prev === "asc" ? "desc" : "asc"));
    setSortCol(col);
  };

  const handleFilterByChange = (e) => {
    setFilterBy(e.target.value);
    setSelectedSucursal("");
    setSelectedUsuario("");
    setCantidadesTicketFiltrados([]);
    setCurrentPage(1);
  };

  const sortedSells = React.useMemo(() => {
    const arr = [...cantidadesTicketFiltrados];
    if (!sortCol) return arr;

    return arr.sort((a, b) => {
      let va, vb;
      if (sortCol === "clave") {
        va = getNombreClave(a).toLowerCase();
        vb = getNombreClave(b).toLowerCase();
      } else if (sortCol === "cantidad") {
        va = Number(a.cantidad || 0);
        vb = Number(b.cantidad || 0);
      } else if (sortCol === "total_monto") {
        va = Number(a.total_monto || 0);
        vb = Number(b.total_monto || 0);
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [cantidadesTicketFiltrados, sortCol, sortDir, filterBy, context]);

  const indexOfLastSell = currentPage * sellsPerPage;
  const indexOfFirstSell = indexOfLastSell - sellsPerPage;
  const currentSells = sortedSells.slice(indexOfFirstSell, indexOfLastSell);

  const nextPage = () => {
    if (currentPage < Math.ceil(cantidadesTicketFiltrados.length / sellsPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <Container className="ctu-page">
      <h1 className="ctu-title">Cantidad de Tickets</h1>

      {/* Filtros */}
      <div className="ctu-toolbar d-flex flex-wrap align-items-end gap-3 mb-3">
        <div className="mx-2 my-2">
          <label className="d-block">DESDE</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control my-input text-center"
          />
        </div>
        <div className="mx-2 my-2">
          <label className="d-block">HASTA</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control my-input text-center"
          />
        </div>

        <div className="mx-2 my-2">
          <label className="d-block">Agrupar por</label>
          <FormControl
            as="select"
            className="form-control my-input"
            value={filterBy}
            onChange={handleFilterByChange}
            style={{ minWidth: 260 }}
          >
            <option value="sucursal">Sucursal</option>
            <option value="usuario">Usuario</option>
          </FormControl>
        </div>

        <div className="mx-2 my-2">
          <Button onClick={handleFilter} className="ctu-btn">
            Filtrar
          </Button>
        </div>
      </div>

      <h2 className="ctu-subtitle">Resultados de la búsqueda</h2>

      <div className="ctu-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th
                className="ctu-th-sort"
                onClick={() => handleSort("clave")}
                title="Ordenar"
              >
                {filterBy === "sucursal" ? "Sucursal" : "Usuario"}
                {sortCol === "clave" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
              <th
                className="ctu-th-sort text-end"
                onClick={() => handleSort("cantidad")}
                title="Ordenar"
              >
                Cantidad de Tickets
                {sortCol === "cantidad" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
              <th
                className="ctu-th-sort text-end"
                onClick={() => handleSort("total_monto")}
                title="Ordenar"
              >
                Monto Total
                {sortCol === "total_monto" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSells.map((venta, idx) => (
              <tr
                key={`${filterBy === "sucursal" ? venta.sucursal_id : venta.usuario_id}-${idx}`}
              >
                <td>
                  {filterBy === "sucursal"
                    ? context.sucursalesTabla.find(
                        (s) => s.id === parseInt(venta.sucursal_id)
                      )?.nombre || "Desconocido"
                    : context.usuariosTabla.find(
                        (u) => u.id === parseInt(venta.usuario_id)
                      )?.nombre_completo || "Desconocido"}
                </td>
                <td className="text-end">{Number(venta.cantidad || 0).toLocaleString("es-AR")}</td>
                <td className="text-end">
                  {Number(venta.total_monto || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center ctu-pager">
        <Button onClick={prevPage} disabled={currentPage === 1} variant="light">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(cantidadesTicketFiltrados.length / sellsPerPage) || 1}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(cantidadesTicketFiltrados.length / sellsPerPage) ||
            cantidadesTicketFiltrados.length === 0
          }
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
