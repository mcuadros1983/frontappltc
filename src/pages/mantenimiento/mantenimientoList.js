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
  const context = useContext(Contexts.DataContext);
  const userContext = useContext(Contexts.UserContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMantenimientos = async () => {
      try {
        const response = await fetch(`${apiUrl}/mantenimientos`);
        if (!response.ok) {
          throw new Error("Error al obtener los mantenimientos");
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Los datos obtenidos no son un array");
        }

        setMantenimientos(data);
        setFilteredMantenimientos(data); // Filtrado inicial
      } catch (error) {
        console.error("Error al obtener los mantenimientos:", error);
        setError(
          "Hubo un problema al cargar los mantenimientos. Por favor, intente nuevamente."
        );
      }
    };

    fetchMantenimientos();
  }, [apiUrl]);

  const handleSucursalChange = (e) => {
    const sucursalSeleccionada = e.target.value;
    setSucursalId(sucursalSeleccionada);
    setFechaDesde(""); // Reiniciar los filtros de fecha
    setFechaHasta(""); // Reiniciar los filtros de fecha

    // Filtrar por sucursal seleccionada
    const mantenimientosFiltrados = mantenimientos.filter((mantenimiento) => {
      return sucursalSeleccionada
        ? mantenimiento.Equipo.sucursal_id === parseInt(sucursalSeleccionada)
        : true;
    });
    setFilteredMantenimientos(mantenimientosFiltrados);
    setCurrentPage(1); // Resetear la paginación
  };

  const handleFilterByDate = () => {
    const filtered = mantenimientos.filter((mantenimiento) => {
      const fechaInicio = new Date(mantenimiento.fecha_inicio);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      const sucursalFiltrada = sucursalId
        ? mantenimiento.Equipo.sucursal_id === parseInt(sucursalId)
        : true;

      if (desde && fechaInicio < desde) return false;
      if (hasta && fechaInicio > hasta) return false;
      return sucursalFiltrada;
    });

    setFilteredMantenimientos(filtered);
    setCurrentPage(1); // Resetear la paginación al aplicar filtros
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ estado: false }),
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ estado: false }),
          }
        );
        if (!updatePreventivoResponse.ok) {
          throw new Error("Error al actualizar el mantenimiento preventivo");
        }
      }

      const response = await fetch(`${apiUrl}/mantenimientos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMantenimientos(
          mantenimientos.filter((mantenimiento) => mantenimiento.id !== id)
        );
        setFilteredMantenimientos(
          filteredMantenimientos.filter(
            (mantenimiento) => mantenimiento.id !== id
          )
        );
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
    <Container fluid>
      <h1 className="my-list-title dark-text text-center">
        Lista de Mantenimientos
      </h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3 d-flex align-items-center justify-content-start">
        <Col xs={12} md={8} className="d-flex align-items-center">
          <FormControl
            as="select"
            value={sucursalId}
            onChange={handleSucursalChange}
            className="mr-2"
            style={{ fontSize: "14px", maxWidth: "200px" }} // Ajuste para pantallas pequeñas y grandes
            disabled={mantenimientos.length === 0}
          >
            <option value="">Seleccione una sucursal</option>
            {context.sucursalesTabla.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>

          {userContext.user && userContext.user.rol_id !== 4 && (
            <Button
              as={Link}
              to="/mantenimientos/new"
              variant="primary"
              style={{
                fontSize: "14px",
                maxWidth: "200px", // Ajuste para pantallas pequeñas y grandes
                whiteSpace: "nowrap", // Evitar que el texto se rompa en varias líneas
                overflow: "hidden", // Ocultar el texto desbordado
                textOverflow: "ellipsis", // Agregar "..." al final si el texto es muy largo
              }}
            >
              Crear Mantenimiento
            </Button>
          )}
        </Col>
      </Row>

      {/* Segunda fila: Filtros de Fecha */}
      <Row className="mb-3 d-flex align-items-end justify-content-start">
        <Col xs={12} md={3}>
          <Form.Group controlId="fechaDesde">
            <Form.Label>Desde</Form.Label>
            <Form.Control
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="mb-2"
              style={{ fontSize: "14px" }}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={3}>
          <Form.Group controlId="fechaHasta">
            <Form.Label>Hasta</Form.Label>
            <Form.Control
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="mb-2"
              style={{ fontSize: "14px" }}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={3} className="d-flex align-items-end">
          <Button
            onClick={handleFilterByDate}
            className="w-100 w-md-auto"
            variant="info"
          >
            Filtrar por Fecha
          </Button>
        </Col>
      </Row>

      {filteredMantenimientos.length > 0 ? (
        <Table striped bordered hover responsive="sm" className="table-sm">
          <thead>
            <tr>
              <th style={{ fontSize: "12px" }}>Inicio</th>
              <th style={{ fontSize: "12px" }}>Fin</th>
              <th style={{ fontSize: "12px" }}>Detalle</th>
              <th style={{ fontSize: "12px" }}>Obs.</th>
              <th style={{ fontSize: "12px" }}>Sucursal</th>
              <th style={{ fontSize: "12px" }}>Equipo</th>
              <th style={{ fontSize: "12px" }}>Estado</th>
              <th style={{ fontSize: "12px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentMantenimientos.map((mantenimiento) => (
              <tr key={mantenimiento.id}>
                <td>{mantenimiento.fecha_inicio}</td>
                <td>{mantenimiento.fecha_fin}</td>
                <td>{mantenimiento.detalle}</td>
                <td>{mantenimiento.observaciones}</td>
                <td>
                  {context.sucursalesTabla.find(
                    (sucursal) =>
                      sucursal.id === mantenimiento.Equipo.sucursal_id
                  )?.nombre || "Desconocido"}
                </td>
                <td>{mantenimiento.Equipo?.nombre}</td>
                <td>{mantenimiento.terminado ? "Terminado" : "Pendiente"}</td>
                <td>
                  <div className="d-flex flex-column flex-md-row">
                    <Link
                      to={`/mantenimientos/${mantenimiento.id}/edit`}
                      className="btn btn-warning mb-2 mb-md-0 mr-md-2 btn-sm"
                    >
                      Editar
                    </Link>
                    {userContext.user && userContext.user.rol_id !== 4 && (
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() =>
                          handleDelete(
                            mantenimiento.id,
                            mantenimiento.orden_mantenimiento_id,
                            mantenimiento.mantenimiento_preventivo_id
                          )
                        }
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No se encontraron mantenimientos.</p>
      )}

      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="btn-sm"
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
          className="btn-sm"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}

