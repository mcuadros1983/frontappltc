import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  FormControl,
  Spinner,
  Modal,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Contexts from "../../../context/Contexts";

export default function MovimientosOtros() {
  const [movimientos, setMovimientos] = useState([]);
  const [searchSucursal, setSearchSucursal] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientosPerPage] = useState(100);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fechasUnicas, setFechasUnicas] = useState([]);
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([]);

  // NUEVO: sucursales por fetch (no por context)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const userContext = useContext(Contexts.UserContext);

  useEffect(() => {
    setMovimientos([]);
    setNoResults(false);
    setCurrentPage(1);
  }, [startDate, endDate, searchSucursal, tipoSeleccionado]);

  // ========= Fetch de sucursales =========
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const res = await fetch(`${apiUrl}/sucursales`, { credentials: "include" });
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error obteniendo sucursales:", err);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [apiUrl]);

  const obtenerFechasUnicas = async () => {
    try {
      const res = await fetch(`${apiUrl}/movimientos-otro/fechas-unicas`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setFechasUnicas(data || []);
    } catch (err) {
      console.error("Error obteniendo fechas únicas", err);
    }
  };

  const handleEliminarMasivo = async () => {
    if (fechasSeleccionadas.length === 0) return;
    if (!window.confirm("¿Seguro que deseas eliminar los movimientos seleccionados?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/movimientos-otro/eliminar-por-fechas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fechas: fechasSeleccionadas }),
      });
      const data = await res.json();
      alert(data?.mensaje || "Operación realizada");
      setShowModal(false);
      handleFilter();
    } catch (err) {
      console.error("Error al eliminar masivamente:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      setNoResults(false);

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/movimientos-otro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const handleEliminarMovimiento = async (movimientoId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este movimiento?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/movimientos-otro/${movimientoId}`, {
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

  const nextPage = () => {
    if (currentPage < Math.ceil(movimientosFiltrados.length / movimientosPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const indexOfLastMovimiento = currentPage * movimientosPerPage;
  const indexOfFirstMovimiento = indexOfLastMovimiento - movimientosPerPage;

  const movimientosFiltrados = tipoSeleccionado
    ? movimientos.filter((m) => m.tipo === tipoSeleccionado)
    : movimientos;

  const currentMovimientos = movimientosFiltrados.slice(
    indexOfFirstMovimiento,
    indexOfLastMovimiento
  );

  const tiposDisponibles = [...new Set(movimientos.map((m) => m.tipo))];

  const sucursalNombreById = (id) => {
    const s = branches.find((b) => Number(b.id) === Number(id));
    return s?.nombre || "Desconocido";
    // si usás sucursaldestino_id, asegurate de pasar ese ID aquí
  };

  return (
    <Container className="vt-page">
      <h1 className="my-list-title dark-text vt-title">Movimientos Fábrica, Achuras y otros</h1>

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
            onChange={(e) => { setSearchSucursal(e.target.value); setTipoSeleccionado(""); }}
            className="vt-input"
            style={{ minWidth: 260 }}
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
          <Button onClick={handleFilter} disabled={loading} className="vt-btn">
            Filtrar
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
              style={{ minWidth: 260 }}
              disabled={loading}
            >
              <option value="">Filtrar por tipo</option>
              {tiposDisponibles.map((tipo, i) => (
                <option key={i} value={tipo}>
                  {tipo}
                </option>
              ))}
            </FormControl>
          </div>
        </div>
      )}

      {/* Botón eliminación masiva (condicional) */}
      {userContext.user?.rol_id !== 4 && (
        <div className="mb-3 d-flex gap-2">
          <Button
            variant="danger"
            onClick={() => { obtenerFechasUnicas(); setShowModal(true); }}
            disabled={loading}
            className="vt-btn-danger"
          >
            Eliminación Masiva
          </Button>
        </div>
      )}

      {/* Loading / estados vacíos */}
      {loading && <Spinner animation="border" role="status" />}
      {noResults && <p className="vt-empty">No se encontraron movimientos para las fechas especificadas</p>}
      {movimientos.length === 0 && !loading && (
        <p className="text-muted">Modificaste filtros. Presioná "Filtrar" para ver resultados actualizados.</p>
      )}

      {/* Tabla */}
      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover className="mb-2">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")} className="vt-th-sort">Fecha</th>
              <th onClick={() => handleSort("numerolote")} className="vt-th-sort">Lote</th>
              <th onClick={() => handleSort("articulocodigo")} className="vt-th-sort">Código de Artículo</th>
              <th onClick={() => handleSort("articulodescripcion")} className="vt-th-sort">Descripción de Artículo</th>
              <th onClick={() => handleSort("cantidad")} className="vt-th-sort text-end">Cantidad</th>
              <th onClick={() => handleSort("tipo")} className="vt-th-sort">Tipo</th>
              <th onClick={() => handleSort("sucursaldestino_id")} className="vt-th-sort">Sucursal</th>
              {userContext.user?.rol_id !== 4 && <th className="text-center">Operaciones</th>}
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
                <td>{sucursalNombreById(movimiento.sucursaldestino_id)}</td>
                {userContext.user?.rol_id !== 4 && (
                  <td className="text-center">
                    <div
                      className="d-inline-flex align-items-center justify-content-center"
                      style={{ gap: "10px", flexWrap: "nowrap" }} // 👈 Siempre en una fila y separados
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
        <Button onClick={prevPage} disabled={currentPage === 1 || loading} variant="light">
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de {Math.ceil(movimientosFiltrados.length / movimientosPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(movimientosFiltrados.length / movimientosPerPage) || loading}
          variant="light"
        >
          <BsChevronRight />
        </Button>
      </div>

      {/* Modal eliminación masiva */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="vt-modal">
        <Modal.Header closeButton>
          <Modal.Title>Eliminar movimientos por fecha de carga (createdAt)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormControl
            as="select"
            multiple
            size="10"
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions).map((o) => o.value);
              setFechasSeleccionadas(options);
            }}
            className="vt-input"
            style={{ minHeight: 260 }}
          >
            {fechasUnicas.map((fecha) => (
              <option key={fecha} value={fecha}>
                {new Date(fecha).toLocaleString("es-AR", {
                  timeZone: "America/Argentina/Buenos_Aires",
                })}
              </option>
            ))}
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="vt-btn-secondary">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminarMasivo} className="vt-btn-danger">
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
