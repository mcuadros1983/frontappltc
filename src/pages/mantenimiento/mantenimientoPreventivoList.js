import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  FormControl,
  Form,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";

export default function MantenimientoPreventivoList() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [filteredMantenimientos, setFilteredMantenimientos] = useState([]);
  const [sucursalId, setSucursalId] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mantenimientosPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Sucursales por fetch (no context)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const userContext = useContext(Contexts.UserContext);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch mantenimientos preventivos
  useEffect(() => {
    const fetchMantenimientos = async () => {
      try {
        const response = await fetch(`${apiUrl}/mantenimientos-preventivos`, {
          credentials: "include",
        });
        const data = await response.json();
        const arr = Array.isArray(data) ? data : [];
        setMantenimientos(arr);
        setFilteredMantenimientos(arr);
      } catch (error) {
        console.error("Error al obtener los mantenimientos preventivos:", error);
        setMantenimientos([]);
        setFilteredMantenimientos([]);
      }
    };
    fetchMantenimientos();
  }, [apiUrl]);

  // Fetch sucursales
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const res = await fetch(`${apiUrl}/sucursales`, { credentials: "include" });
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener sucursales:", err);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [apiUrl]);

  const sucursalNombreById = (id) => {
    const s = branches.find((b) => Number(b.id) === Number(id));
    return s?.nombre || "Desconocido";
  };

  // Filtrar por sucursal y fechas
  useEffect(() => {
    let filtered = [...mantenimientos];

    if (sucursalId) {
      filtered = filtered.filter(
        (m) => Number(m.sucursal_id) === Number(sucursalId)
      );
    }
    if (fechaDesde) {
      filtered = filtered.filter(
        (m) => new Date(m.fecha) >= new Date(fechaDesde)
      );
    }
    if (fechaHasta) {
      filtered = filtered.filter(
        (m) => new Date(m.fecha) <= new Date(fechaHasta)
      );
    }

    setFilteredMantenimientos(filtered);
    setCurrentPage(1);
  }, [sucursalId, fechaDesde, fechaHasta, mantenimientos]);

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sorted = [...filteredMantenimientos].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (typeof valueA === "string") {
        valueA = (valueA ?? "").toString().toUpperCase();
        valueB = (valueB ?? "").toString().toUpperCase();
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredMantenimientos(sorted);
  };

  const handleDelete = async (id) => {
    try {
      // Chequear si tiene mantenimiento asociado
      const response = await fetch(`${apiUrl}/mantenimientos/preventivo/${id}`, {
        credentials: "include",
      });
      const mantenimiento = await response.json();

      if (mantenimiento && mantenimiento.id) {
        alert("No se puede eliminar este preventivo porque tiene un mantenimiento asociado.");
        return;
      }

      const confirmDelete = window.confirm("¿Está seguro que desea eliminar este mantenimiento preventivo?");
      if (!confirmDelete) return;

      const deleteResponse = await fetch(`${apiUrl}/mantenimientos-preventivos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (deleteResponse.ok) {
        setMantenimientos((prev) => prev.filter((m) => m.id !== id));
        setFilteredMantenimientos((prev) => prev.filter((m) => m.id !== id));
      } else {
        throw new Error("Error al eliminar el mantenimiento preventivo");
      }
    } catch (error) {
      console.error("Error al eliminar/verificar preventivo:", error);
    }
  };

  const indexOfLastMantenimiento = currentPage * mantenimientosPerPage;
  const indexOfFirstMantenimiento = indexOfLastMantenimiento - mantenimientosPerPage;
  const currentMantenimientos = filteredMantenimientos.slice(
    indexOfFirstMantenimiento,
    indexOfLastMantenimiento
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredMantenimientos.length / mantenimientosPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleExecute = async (preventivo) => {
    try {
      const response = await fetch(`${apiUrl}/mantenimientos/preventivo/${preventivo.id}`, {
        credentials: "include",
      });
      const mantenimiento = await response.json();

      if (mantenimiento && mantenimiento.id) {
        navigate(`/mantenimientos/${mantenimiento.id}/edit`);
      } else {
        navigate(`/mantenimientos/new`, {
          state: {
            detalle: preventivo.detalle,
            sucursalId: preventivo.sucursal_id,
            equipoId: preventivo.equipo_id,
            mantenimientoPreventivoId: preventivo.id,
          },
        });
      }
    } catch (error) {
      console.error("Error al buscar el mantenimiento relacionado:", error);
    }
  };

  const canCreate = userContext?.user?.rol_id !== 4;
  const canEditDelete = userContext?.user?.rol_id !== 4;

  return (
    <Container fluid className="vt-page">
      <h1 className="my-list-title dark-text vt-title text-center">
        Mantenimientos Preventivos
      </h1>

      {/* Toolbar superior */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">Sucursal</label>
          <FormControl
            as="select"
            value={sucursalId}
            onChange={(e) => setSucursalId(e.target.value)}
            className="vt-input"
            style={{ minWidth: 240 }}
            disabled={loadingBranches || mantenimientos.length === 0}
          >
            <option value="">
              {loadingBranches ? "Cargando sucursales..." : "Seleccione una sucursal"}
            </option>
            {branches.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </FormControl>
        </div>

        {canCreate && (
          <div className="d-inline-block">
            <Link
              to="/mantenimiento-preventivo/new"
              className="btn btn-primary shadow-sm d-inline-flex align-items-center justify-content-center"
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease-in-out',
                height: '40px', // altura consistente
                whiteSpace: 'nowrap',
                marginLeft: "12px", // 👈 fuerza el espacio
              }}
            >
              Crear Preventivo
            </Link>
          </div>
        )}
      </div>

      {/* Filtros de fecha */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">Desde</label>
          <Form.Control
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="vt-input text-center"
            style={{ minWidth: 180 }}
          />
        </div>

        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">Hasta</label>
          <Form.Control
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="vt-input text-center"
            style={{ minWidth: 180 }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover responsive="sm" className="mb-2 table-sm">
          <thead>
            <tr>
              <th onClick={() => handleSort("fecha")} className="vt-th-sort">
                Fecha
              </th>
              <th className="vt-th-sort">Equipo</th>
              <th onClick={() => handleSort("sucursal_id")} className="vt-th-sort">
                Sucursal
              </th>
              <th onClick={() => handleSort("detalle")} className="vt-th-sort">
                Detalle
              </th>
              <th onClick={() => handleSort("estado")} className="vt-th-sort">
                Estado
              </th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentMantenimientos.map((m) => (
              <tr key={m.id}>
                <td>{m.fecha}</td>
                <td>{m.Equipo?.nombre || "Equipo desconocido"}</td>
                <td>{sucursalNombreById(m.sucursal_id)}</td>
                <td>{m.detalle}</td>
                <td>{m.estado ? "Procesado" : "Pendiente"}</td>
                <td className="text-center">
                  <div className="d-inline-flex gap-2">
                    {canEditDelete && (
                      <>
                        <Link
                          to={`/mantenimiento-preventivo/${m.id}/edit`}
                          className="btn btn-warning vt-btn-sm"
                        >
                          <i className="bi bi-pencil-square me-1"></i> Editar
                        </Link>

                        <Button
                          variant="danger"
                          size="sm"
                          className="vt-btn-danger"
                          onClick={() => handleDelete(m.id)}
                        >
                          <i className="bi bi-trash me-1"></i> Eliminar
                        </Button>
                      </>
                    )}

                    <Button
                      variant="success"
                      size="sm"
                      className="vt-btn-success"
                      onClick={() => handleExecute(m)}
                    >
                      <i className="bi bi-play-fill me-1"></i> Ejecutar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center vt-pager">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
          variant="light"
          className="vt-btn-sm"
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(filteredMantenimientos.length / mantenimientosPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage ===
            Math.ceil(filteredMantenimientos.length / mantenimientosPerPage)
          }
          variant="light"
          className="vt-btn-sm"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
