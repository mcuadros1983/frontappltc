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
  const [filteredMantenimientos, setFilteredMantenimientos] = useState([]); // Filtrados por sucursal y fecha
  const [sucursalId, setSucursalId] = useState(""); // Filtro de sucursal
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mantenimientosPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const context = useContext(Contexts.DataContext);
  const userContext = useContext(Contexts.UserContext); // Obtenemos el rol_id del usuario
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMantenimientos = async () => {
      try {
        const response = await fetch(`${apiUrl}/mantenimientos-preventivos`, {
          credentials: "include",
        });
        const data = await response.json();
        setMantenimientos(Array.isArray(data) ? data : []);
        setFilteredMantenimientos(Array.isArray(data) ? data : []); // Inicialmente, mostrar todos los mantenimientos
      } catch (error) {
        console.error(
          "Error al obtener los mantenimientos preventivos:",
          error
        );
      }
    };

    fetchMantenimientos();
  }, [apiUrl]);

  // Filtrar mantenimientos por sucursal seleccionada
  useEffect(() => {
    let filtered = mantenimientos;

    if (sucursalId) {
      filtered = filtered.filter(
        (mantenimiento) => mantenimiento.sucursal_id === parseInt(sucursalId)
      );
    }

    if (fechaDesde) {
      filtered = filtered.filter(
        (mantenimiento) => new Date(mantenimiento.fecha) >= new Date(fechaDesde)
      );
    }

    if (fechaHasta) {
      filtered = filtered.filter(
        (mantenimiento) => new Date(mantenimiento.fecha) <= new Date(fechaHasta)
      );
    }

    setFilteredMantenimientos(filtered);
  }, [sucursalId, fechaDesde, fechaHasta, mantenimientos]);

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sortedMantenimientos = [...filteredMantenimientos].sort((a, b) => {
      let valueA = a[columnName];
      let valueB = b[columnName];

      if (typeof valueA === "string") {
        valueA = valueA.toUpperCase();
        valueB = valueB.toUpperCase();
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      } else if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      } else {
        return 0;
      }
    });

    setFilteredMantenimientos(sortedMantenimientos);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${apiUrl}/mantenimientos/preventivo/${id}`,
        {
          credentials: "include",
        }
      );
      const mantenimiento = await response.json();

      if (mantenimiento && mantenimiento.id) {
        alert(
          "No se puede eliminar este mantenimiento preventivo porque tiene un mantenimiento asociado."
        );
        return;
      }

      const confirmDelete = window.confirm(
        "¿Está seguro que desea eliminar este mantenimiento preventivo?"
      );
      if (!confirmDelete) return;

      try {
        const deleteResponse = await fetch(
          `${apiUrl}/mantenimientos-preventivos/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (deleteResponse.ok) {
          setMantenimientos((prevMantenimientos) =>
            prevMantenimientos.filter(
              (mantenimiento) => mantenimiento.id !== id
            )
          );
        } else {
          throw new Error("Error al eliminar el mantenimiento preventivo");
        }
      } catch (error) {
        console.error("Error al eliminar el mantenimiento preventivo:", error);
      }
    } catch (error) {
      console.error("Error al verificar el mantenimiento asociado:", error);
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

  const handleExecute = async (preventivo) => {
    try {
      const response = await fetch(
        `${apiUrl}/mantenimientos/preventivo/${preventivo.id}`
      );
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

  return (
    <Container fluid>
      <h1 className="my-list-title dark-text text-center">
        Mantenimientos Preventivos
      </h1>

      {/* Filtro por sucursal y fechas */}
      <Row className="mb-3 d-flex align-items-center justify-content-start">
        <Col xs={12} md={8} className="d-flex align-items-center">
          <FormControl
            as="select"
            value={sucursalId}
            onChange={(e) => setSucursalId(e.target.value)}
            className="mr-2"
            style={{ fontSize: "14px", maxWidth: "200px" }}
            disabled={mantenimientos.length === 0}
          >
            <option value="">Seleccione una sucursal</option>
            {context.sucursalesTabla.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </FormControl>

          {userContext.user.rol_id !== 4 && (
            <Link
              to="/mantenimiento-preventivo/new"
              className="btn btn-primary"
              style={{
                fontSize: "14px",
                maxWidth: "200px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Crear Preventivo
            </Link>
          )}
        </Col>
      </Row>

      {/* Filtros de Fecha */}
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
      </Row>

      <Table striped bordered hover responsive="sm" className="table-sm">
        <thead>
          <tr>
            <th
              onClick={() => handleSort("fecha")}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Fecha
            </th>
            <th style={{ fontSize: "12px" }}>Equipo</th>
            <th
              onClick={() => handleSort("sucursal_id")}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Sucursal
            </th>
            <th
              onClick={() => handleSort("detalle")}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Detalle
            </th>
            <th
              onClick={() => handleSort("estado")}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Estado
            </th>
            <th style={{ fontSize: "12px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentMantenimientos.map((mantenimiento) => (
            <tr key={mantenimiento.id}>
              <td>{mantenimiento.fecha}</td>
              <td>
                {mantenimiento.Equipo?.nombre || "Equipo desconocido"}
              </td>
              <td>
                {context.sucursalesTabla.find(
                  (sucursal) => sucursal.id === mantenimiento.sucursal_id
                )?.nombre || "Desconocido"}
              </td>
              <td>{mantenimiento.detalle}</td>
              <td>
                {mantenimiento.estado ? "Procesado" : "Pendiente"}
              </td>
              <td 
              // className="d-flex justify-content-around"
              >
                {userContext.user.rol_id !== 4 && (
                  <>
                    <Link
                      to={`/mantenimiento-preventivo/${mantenimiento.id}/edit`}
                      className="btn btn-warning mb-2 mb-md-0 mr-md-2 btn-sm"
                    >
                      Editar
                    </Link>
                    <Button
                      variant="danger"
                      className="btn btn-warning mb-2 mb-md-0 mr-md-2 btn-sm"
                      onClick={() => handleDelete(mantenimiento.id)}
                    >
                      Eliminar
                    </Button>
                  </>
                )}
                <Button
                  variant="success"
                  className="btn mb-2 mb-md-0 mr-md-2 btn-sm"
                  onClick={() => handleExecute(mantenimiento)}
                >
                  Ejecutar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="btn-sm"
        >
          <BsChevronLeft />
        </Button>
        <span className="mx-2" style={{ fontSize: "14px" }}>
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
