import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  FormControl,
  Alert,
  Form,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import Contexts from "../../context/Contexts";

export default function MantenimientoList() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [filteredMantenimientos, setFilteredMantenimientos] = useState([]);
  const [sucursalId, setSucursalId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mantenimientosPerPage] = useState(10);
  const [error, setError] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // NUEVO: sucursales por fetch (no context)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const userContext = useContext(Contexts.UserContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch mantenimientos
  useEffect(() => {
    const fetchMantenimientos = async () => {
      try {
        const response = await fetch(`${apiUrl}/mantenimientos`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Error al obtener los mantenimientos");
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Los datos obtenidos no son un array");
        }

        setMantenimientos(data);
        setFilteredMantenimientos(data);
      } catch (error) {
        console.error("Error al obtener los mantenimientos:", error);
        setError(
          "Hubo un problema al cargar los mantenimientos. Por favor, intente nuevamente."
        );
      }
    };

    fetchMantenimientos();
  }, [apiUrl]);

  // Fetch sucursales
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const res = await fetch(`${apiUrl}/sucursales`, {
          credentials: "include",
        });
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

  const handleSucursalChange = (e) => {
    const sucursalSeleccionada = e.target.value;
    setSucursalId(sucursalSeleccionada);
    setFechaDesde("");
    setFechaHasta("");

    const filtrados = mantenimientos.filter((m) => {
      return sucursalSeleccionada
        ? Number(m.Equipo?.sucursal_id) === Number(sucursalSeleccionada)
        : true;
    });
    setFilteredMantenimientos(filtrados);
    setCurrentPage(1);
  };

  const handleFilterByDate = () => {
    const filtered = mantenimientos.filter((m) => {
      const fechaInicio = new Date(m.fecha_inicio);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      const sucursalOk = sucursalId
        ? Number(m.Equipo?.sucursal_id) === Number(sucursalId)
        : true;

      if (desde && fechaInicio < desde) return false;
      if (hasta && fechaInicio > hasta) return false;
      return sucursalOk;
    });

    setFilteredMantenimientos(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (
    id,
    ordenMantenimientoId,
    mantenimientoPreventivoId
  ) => {
    const confirmDelete = window.confirm(
      "¿Está seguro que desea eliminar este mantenimiento?"
    );
    if (!confirmDelete) return;

    try {
      if (ordenMantenimientoId) {
        const updateOrdenResponse = await fetch(
          `${apiUrl}/ordenes_mantenimiento/${ordenMantenimientoId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: false }),
            credentials: "include",
          }
        );
        if (!updateOrdenResponse.ok) {
          throw new Error("Error al actualizar la orden de mantenimiento");
        }
      }

      if (mantenimientoPreventivoId) {
        const updatePreventivoResponse = await fetch(
          `${apiUrl}/mantenimientos-preventivos/${mantenimientoPreventivoId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: false }),
            credentials: "include",
          }
        );
        if (!updatePreventivoResponse.ok) {
          throw new Error("Error al actualizar el mantenimiento preventivo");
        }
      }

      const response = await fetch(`${apiUrl}/mantenimientos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setMantenimientos((prev) => prev.filter((x) => x.id !== id));
        setFilteredMantenimientos((prev) => prev.filter((x) => x.id !== id));
      } else {
        throw new Error("Error al eliminar el mantenimiento");
      }
    } catch (error) {
      console.error("Error al eliminar el mantenimiento:", error);
      setError(
        "Hubo un problema al eliminar el mantenimiento. Por favor, intente nuevamente."
      );
    }
  };

  const indexOfLastMantenimiento = currentPage * mantenimientosPerPage;
  const indexOfFirstMantenimiento =
    indexOfLastMantenimiento - mantenimientosPerPage;
  const currentMantenimientos = filteredMantenimientos.slice(
    indexOfFirstMantenimiento,
    indexOfLastMantenimiento
  );

  const nextPage = () => {
    if (
      currentPage <
      Math.ceil(filteredMantenimientos.length / mantenimientosPerPage)
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container fluid className="vt-page">
      <h1 className="my-list-title dark-text vt-title text-center">
        Lista de Mantenimientos
      </h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Toolbar superior - EXACTO como Inventario */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">Sucursal</label>
          <FormControl
            as="select"
            value={sucursalId}
            onChange={handleSucursalChange}
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

        {userContext.user && userContext.user.rol_id !== 4 && (
          <div className="d-inline-block">
            <Link
              to="/mantenimientos/new"
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
              <i className="bi bi-plus-lg me-2"></i>
              Crear Mantenimiento
            </Link>
          </div>
        )}
      </div>

      {/* Filtros de fecha - EXACTO como Inventario */}
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

        <div className="d-inline-block">
          <Button onClick={handleFilterByDate} className="vt-btn">
            Filtrar por Fecha
          </Button>
        </div>
      </div>

      {/* Tabla */}
      {filteredMantenimientos.length > 0 ? (
        <div className="vt-tablewrap table-responsive">
          <Table striped bordered hover responsive="sm" className="mb-2 table-sm">
            <thead>
              <tr>
                <th className="vt-th-sort">Inicio</th>
                <th className="vt-th-sort">Fin</th>
                <th className="vt-th-sort">Detalle</th>
                <th className="vt-th-sort">Obs.</th>
                <th className="vt-th-sort">Sucursal</th>
                <th className="vt-th-sort">Equipo</th>
                <th className="vt-th-sort">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentMantenimientos.map((mantenimiento) => (
                <tr key={mantenimiento.id}>
                  <td>{mantenimiento.fecha_inicio}</td>
                  <td>{mantenimiento.fecha_fin}</td>
                  <td>{mantenimiento.detalle}</td>
                  <td>{mantenimiento.observaciones}</td>
                  <td>{sucursalNombreById(mantenimiento.Equipo?.sucursal_id)}</td>
                  <td>{mantenimiento.Equipo?.nombre}</td>
                  <td>{mantenimiento.terminado ? "Terminado" : "Pendiente"}</td>
                  <td className="text-center">
                    <div className="d-inline-flex gap-2">
                      <Link
                        to={`/mantenimientos/${mantenimiento.id}/edit`}
                        className="btn btn-warning vt-btn-sm"
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Editar
                      </Link>

                      {userContext.user && userContext.user.rol_id !== 4 && (
                        <Button
                          variant="danger"
                          size="sm"
                          className="vt-btn-danger"
                          onClick={() =>
                            handleDelete(
                              mantenimiento.id,
                              mantenimiento.orden_mantenimiento_id,
                              mantenimiento.mantenimiento_preventivo_id
                            )
                          }
                        >
                          <i className="bi bi-trash me-1"></i>
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <p className="text-muted text-center">No se encontraron mantenimientos.</p>
      )}

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
