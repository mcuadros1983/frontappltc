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

  const apiUrl = process.env.REACT_APP_API_URL;
  const context = useContext(Contexts.DataContext);
  const userContext = useContext(Contexts.UserContext);

  const obtenerFechasUnicas = async () => {
    try {
      const res = await fetch(`${apiUrl}/movimientos-otro/fechas-unicas`, {
        method: "POST",
      });
      const data = await res.json();
      setFechasUnicas(data);
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
        body: JSON.stringify({ fechas: fechasSeleccionadas }),
      });
      const data = await res.json();
      alert(data.mensaje);
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
      setTipoSeleccionado("");
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        alert("Ingrese una fecha válida.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/movimientos-otro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaDesde: startDate, fechaHasta: endDate, sucursalId: searchSucursal }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
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
      });
      if (response.ok) {
        await response.json();
        setMovimientos(movimientos.filter((movimiento) => movimiento.id !== movimientoId));
      } else {
        throw new Error("Error al eliminar el movimiento interno");
      }
    } catch (error) {
      console.error("Error al eliminar el movimiento interno:", error);
    }
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(movimientos.length / movimientosPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const indexOfLastMovimiento = currentPage * movimientosPerPage;
  const indexOfFirstMovimiento = indexOfLastMovimiento - movimientosPerPage;
  const movimientosFiltrados = tipoSeleccionado
    ? movimientos.filter((m) => m.tipo === tipoSeleccionado)
    : movimientos;
  const currentMovimientos = movimientosFiltrados.slice(indexOfFirstMovimiento, indexOfLastMovimiento);

  const tiposDisponibles = [...new Set(movimientos.map((m) => m.tipo))];

  return (
    <Container>
      <h1 className="my-list-title dark-text">Movimientos Fabrica, Achuras y otros</h1>

      <div className="mb-3">
        <div className="d-inline-block w-auto">
          <label className="mr-2">DESDE: </label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control rounded-0 border-transparent text-center" disabled={loading} />
        </div>

        <div className="d-inline-block w-auto ml-2">
          <label className="ml-2 mr-2">HASTA:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control rounded-0 border-transparent text-center" disabled={loading} />
        </div>
      </div>

      <div className="mb-3">
        <FormControl as="select" value={searchSucursal} onChange={(e) => setSearchSucursal(e.target.value)} className="mr-2" style={{ width: "25%" }} disabled={loading}>
          <option value="">Seleccione una sucursal</option>
          {context.sucursalesTabla.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</option>
          ))}
        </FormControl>
      </div>

      {searchSucursal && movimientos.length > 0 && (
        <div className="mb-3">
          <FormControl as="select" value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)} className="mr-2" style={{ width: "25%" }} disabled={loading}>
            <option value="">Filtrar por tipo</option>
            {tiposDisponibles.map((tipo, i) => (
              <option key={i} value={tipo}>{tipo}</option>
            ))}
          </FormControl>
        </div>
      )}

      <div className="mb-3 d-flex gap-2">
        <Button onClick={handleFilter} disabled={loading}>Filtrar</Button>   </div>
        {userContext.user?.rol_id !== 4 && (
                <div className="mb-3 d-flex gap-2"><Button variant="danger" onClick={() => { obtenerFechasUnicas(); setShowModal(true); }} disabled={loading}>Eliminación Masiva</Button>    </div>
        )}
  

      {loading && <Spinner animation="border" role="status"></Spinner>}
      {noResults && <p>No se encontraron movimientos para las fechas especificadas</p>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>Fecha</th>
            <th onClick={() => handleSort("numerolote")} style={{ cursor: "pointer" }}>Lote</th>
            <th onClick={() => handleSort("articulocodigo")} style={{ cursor: "pointer" }}>Código de Artículo</th>
            <th onClick={() => handleSort("articulodescripcion")} style={{ cursor: "pointer" }}>Descripción de Artículo</th>
            <th onClick={() => handleSort("cantidad")} style={{ cursor: "pointer" }}>Cantidad</th>
            <th onClick={() => handleSort("tipo")} style={{ cursor: "pointer" }}>Tipo</th>
            <th onClick={() => handleSort("sucursal_id")} style={{ cursor: "pointer" }}>Sucursal</th>
            {userContext.user?.rol_id !== 4 && <th>Operaciones</th>}
          </tr>
        </thead>
        <tbody>
          {currentMovimientos.map((movimiento) => (
            <tr key={movimiento.id}>
              <td>{movimiento.fecha}</td>
              <td>{movimiento.numerolote}</td>
              <td>{movimiento.articulocodigo}</td>
              <td>{movimiento.articulodescripcion}</td>
              <td>{movimiento.cantidad}</td>
              <td>{movimiento.tipo}</td>
              <td>{context.sucursalesTabla.find((s) => s.id === parseInt(movimiento.sucursal_id))?.nombre || "Desconocido"}</td>
              {userContext.user?.rol_id !== 4 && (
                <td>
                  <Button variant="danger" onClick={() => handleEliminarMovimiento(movimiento.id)} disabled={loading}>Eliminar</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center">
        <Button onClick={prevPage} disabled={currentPage === 1 || loading}><BsChevronLeft /></Button>
        <span className="mx-2">Página {currentPage} de {Math.ceil(movimientosFiltrados.length / movimientosPerPage)}</span>
        <Button onClick={nextPage} disabled={currentPage === Math.ceil(movimientosFiltrados.length / movimientosPerPage) || loading}><BsChevronRight /></Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Eliminar movimientos por fecha de carga (createdAt)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormControl as="select" multiple size="10" onChange={(e) => {
            const options = Array.from(e.target.selectedOptions).map((o) => o.value);
            setFechasSeleccionadas(options);
          }}>
            {fechasUnicas.map((fecha) => (
              <option key={fecha} value={fecha}>{new Date(fecha).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}</option>
            ))}
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleEliminarMasivo}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
