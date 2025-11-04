import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  FormControl,
  Alert,
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";

export default function OrdenMantenimientoList() {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState([]);
  const [sucursalId, setSucursalId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordenesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [error, setError] = useState("");

  // NUEVO: sucursales por fetch
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const userContext = useContext(Contexts.UserContext); // puede ser null al inicio
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch órdenes (con filtro por rol 4: solo propias)
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch(`${apiUrl}/ordenes_mantenimiento`, { credentials: "include" });
        const data = await response.json();

        const isRol4 = userContext?.user?.rol_id === 4;
        const userId = userContext?.user?.id;
        const filteredData = isRol4 ? data.filter((o) => o.usuario_id === userId) : data;

        setOrdenes(Array.isArray(filteredData) ? filteredData : []);
        setFilteredOrdenes(Array.isArray(filteredData) ? filteredData : []);
      } catch (err) {
        console.error("Error al obtener las órdenes de mantenimiento:", err);
        setOrdenes([]);
        setFilteredOrdenes([]);
      }
    };
    fetchOrdenes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, userContext?.user?.rol_id, userContext?.user?.id]);

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

  // Filtrar por sucursal
  useEffect(() => {
    if (sucursalId) {
      setFilteredOrdenes(ordenes.filter((o) => Number(o.sucursal_id) === Number(sucursalId)));
    } else {
      setFilteredOrdenes(ordenes);
    }
    setCurrentPage(1);
  }, [sucursalId, ordenes]);

  const handleSort = (columnName) => {
    setSortDirection(columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc");
    setSortColumn(columnName);

    const sorted = [...filteredOrdenes].sort((a, b) => {
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

    setFilteredOrdenes(sorted);
  };

  const handleDelete = async (id) => {
    try {
      // Verificar mantenimiento asociado
      const response = await fetch(`${apiUrl}/mantenimientos/orden/${id}`, { credentials: "include" });
      const mantenimiento = await response.json();
      if (mantenimiento && mantenimiento.id) {
        alert("No se puede eliminar esta orden porque tiene un mantenimiento asociado.");
        return;
      }

      const confirmDelete = window.confirm("¿Está seguro que desea eliminar esta orden de mantenimiento?");
      if (!confirmDelete) return;

      const deleteResponse = await fetch(`${apiUrl}/ordenes_mantenimiento/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (deleteResponse.ok) {
        setOrdenes((prev) => prev.filter((o) => o.id !== id));
        setFilteredOrdenes((prev) => prev.filter((o) => o.id !== id));
      } else {
        throw new Error("Error al eliminar la orden de mantenimiento");
      }
    } catch (err) {
      console.error("Error al eliminar/verificar:", err);
      setError("Hubo un problema al eliminar/verificar la orden. Intente nuevamente.");
    }
  };

  const indexOfLastOrden = currentPage * ordenesPerPage;
  const indexOfFirstOrden = indexOfLastOrden - ordenesPerPage;
  const currentOrdenes = filteredOrdenes.slice(indexOfFirstOrden, indexOfLastOrden);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredOrdenes.length / ordenesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleExecute = async (orden) => {
    try {
      const response = await fetch(`${apiUrl}/mantenimientos/orden/${orden.id}`, { credentials: "include" });
      const mantenimiento = await response.json();

      if (mantenimiento && mantenimiento.id) {
        navigate(`/mantenimientos/${mantenimiento.id}/edit`);
      } else {
        navigate(`/mantenimientos/new`, {
          state: {
            detalle: orden.detalle_trabajo,
            sucursalId: orden.sucursal_id,
            equipoId: orden.equipo_id,
            ordenMantenimientoId: orden.id,
          },
        });
      }
    } catch (error) {
      console.error("Error al buscar el mantenimiento relacionado:", error);
    }
  };

  const canCreate = userContext?.user?.rol_id !== 5;
  const canEditDelete = userContext?.user?.rol_id !== 5;
  const canExecute = (orden) => userContext?.user?.rol_id !== 4 || orden.estado;

  return (
    <Container fluid className="vt-page">
      <h1 className="my-list-title dark-text vt-title text-center">
        Órdenes de Mantenimiento
      </h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Toolbar superior - EXACTO como Inventario */}
      <div className="vt-toolbar mb-3 d-flex flex-wrap align-items-end gap-3">
        <div className="d-inline-block w-auto">
          <label className="vt-label d-block">Sucursal</label>
          <FormControl
            as="select"
            value={sucursalId}
            onChange={(e) => setSucursalId(e.target.value)}
            className="vt-input"
            style={{ minWidth: 240 }}
            disabled={loadingBranches || ordenes.length === 0}
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
              to="/ordenes-mantenimiento/new"
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
              Crear Orden
            </Link>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="vt-tablewrap table-responsive">
        <Table striped bordered hover responsive="sm" className="mb-2 table-sm">
          <thead>
            <tr>
              <th onClick={() => handleSort("nombre_solicitante")} className="vt-th-sort">
                Solicitante
              </th>
              <th onClick={() => handleSort("prioridad")} className="vt-th-sort">
                Prioridad
              </th>
              <th onClick={() => handleSort("fecha_estimacion")} className="vt-th-sort">
                Fecha Estimada
              </th>
              <th onClick={() => handleSort("sucursal_id")} className="vt-th-sort">
                Sucursal
              </th>
              <th className="vt-th-sort">Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOrdenes.map((orden) => (
              <tr key={orden.id}>
                <td>{orden.nombre_solicitante}</td>
                <td>{orden.prioridad}</td>
                <td>{orden.fecha_estimacion}</td>
                <td>{sucursalNombreById(orden.sucursal_id)}</td>
                <td>{orden.estado ? "Procesado" : "Pendiente"}</td>
                <td className="text-center">
                  <div className="d-inline-flex gap-2">
                    {canEditDelete && (
                      <>
                        <Link
                          to={`/ordenes-mantenimiento/${orden.id}/edit`}
                          className="btn btn-warning vt-btn-sm"
                        >
                          <i className="bi bi-pencil-square me-1"></i>
                          Editar
                        </Link>

                        <Button
                          variant="danger"
                          size="sm"
                          className="vt-btn-danger"
                          onClick={() => handleDelete(orden.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Eliminar
                        </Button>
                      </>
                    )}

                    {canExecute(orden) && (
                      <Button
                        variant="success"
                        size="sm"
                        className="vt-btn-success"
                        onClick={() => handleExecute(orden)}
                      >
                        <i className="bi bi-play me-1"></i>
                        Ejecutar
                      </Button>
                    )}
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
          Página {currentPage} de {Math.ceil(filteredOrdenes.length / ordenesPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredOrdenes.length / ordenesPerPage)}
          variant="light"
          className="vt-btn-sm"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
