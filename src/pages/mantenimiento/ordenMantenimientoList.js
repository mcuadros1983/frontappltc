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
  const [filteredOrdenes, setFilteredOrdenes] = useState([]); // Órdenes filtradas por sucursal
  const [sucursalId, setSucursalId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordenesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [error, setError] = useState("");
  const context = useContext(Contexts.DataContext); // Context para datos globales
  const userContext = useContext(Contexts.UserContext); // Context para obtener el usuario actual
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch(`${apiUrl}/ordenes_mantenimiento`);
        const data = await response.json();

        // Si el usuario tiene rol_id 4, filtrar las órdenes por usuario_id
        const filteredData =
          userContext.user.rol_id === 4
            ? data.filter((orden) => orden.usuario_id === userContext.user.id)
            : data;

        setOrdenes(Array.isArray(filteredData) ? filteredData : []);
        setFilteredOrdenes(Array.isArray(filteredData) ? filteredData : []); // Inicialmente, todas las órdenes
      } catch (error) {
        console.error("Error al obtener las órdenes de mantenimiento:", error);
      }
    };

    fetchOrdenes();
  }, [apiUrl, userContext.user.rol_id, userContext.user.id]);

  // Filtrar las órdenes cuando se selecciona una sucursal
  useEffect(() => {
    if (sucursalId) {
      setFilteredOrdenes(
        ordenes.filter((orden) => orden.sucursal_id === parseInt(sucursalId))
      );
    } else {
      setFilteredOrdenes(ordenes); // Mostrar todas si no se selecciona ninguna sucursal
    }
  }, [sucursalId, ordenes]);

  const handleSort = (columnName) => {
    setSortDirection(
      columnName === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(columnName);

    const sortedOrdenes = [...filteredOrdenes].sort((a, b) => {
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

    setFilteredOrdenes(sortedOrdenes);
  };

  const handleDelete = async (id) => {
    try {
      // Verificar si existe un mantenimiento asociado a la orden
      const response = await fetch(`${apiUrl}/mantenimientos/orden/${id}`);
      const mantenimiento = await response.json();

      if (mantenimiento && mantenimiento.id) {
        alert(
          "No se puede eliminar esta orden de mantenimiento porque tiene un mantenimiento asociado."
        );
        return;
      }

      const confirmDelete = window.confirm(
        "¿Está seguro que desea eliminar esta orden de mantenimiento?"
      );
      if (!confirmDelete) return;

      try {
        const deleteResponse = await fetch(
          `${apiUrl}/ordenes_mantenimiento/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (deleteResponse.ok) {
          setOrdenes((prevOrdenes) =>
            prevOrdenes.filter((orden) => orden.id !== id)
          );
        } else {
          throw new Error("Error al eliminar la orden de mantenimiento");
        }
      } catch (error) {
        console.error("Error al eliminar la orden de mantenimiento:", error);
        setError(
          "Hubo un problema al eliminar la orden de mantenimiento. Por favor, intente nuevamente."
        );
      }
    } catch (error) {
      console.error("Error al verificar el mantenimiento asociado:", error);
      setError(
        "Hubo un problema al verificar el mantenimiento asociado. Por favor, intente nuevamente."
      );
    }
  };

  const indexOfLastOrden = currentPage * ordenesPerPage;
  const indexOfFirstOrden = indexOfLastOrden - ordenesPerPage;
  const currentOrdenes = filteredOrdenes.slice(
    indexOfFirstOrden,
    indexOfLastOrden
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredOrdenes.length / ordenesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleExecute = async (orden) => {
    try {
      const response = await fetch(
        `${apiUrl}/mantenimientos/orden/${orden.id}`,
        {
          credentials: "include",
        }
      );
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

  return (
    <Container fluid>
      <h1 className="my-list-title dark-text text-center">
        Órdenes de Mantenimiento
      </h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3 d-flex align-items-center justify-content-start">
        {/* {userContext.user.rol_id !== 4 && ( */}
          <Col xs={12} md={8} className="d-flex align-items-center">
            <FormControl
              as="select"
              value={sucursalId}
              onChange={(e) => setSucursalId(e.target.value)}
              className="mr-2"
              style={{ fontSize: "14px", maxWidth: "200px" }}
              disabled={ordenes.length === 0}
            >
              <option value="">Seleccione una sucursal</option>
              {context.sucursalesTabla.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </FormControl>

            {userContext.user.rol_id !== 5 && (
              <Link
                to="/ordenes-mantenimiento/new"
                className="btn btn-primary"
                style={{
                  fontSize: "14px",
                  maxWidth: "200px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Crear Orden
              </Link>
            )}
          </Col>
        {/* )} */}
      </Row>

      <Table striped bordered hover responsive="sm" className="table-sm">
        <thead>
          <tr>
            <th
              onClick={() => handleSort("nombre_solicitante")}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Solicitante
            </th>
            <th
              onClick={() => handleSort("prioridad")}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Prioridad
            </th>
            <th
              onClick={() => handleSort("fecha_estimacion")}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Fecha Estimada
            </th>
            <th
              onClick={() => handleSort("sucursal_id")}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Sucursal
            </th>
            <th style={{ fontSize: "12px" }}>Estado</th>
            <th style={{ fontSize: "12px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentOrdenes.map((orden) => (
            <tr key={orden.id}>
              <td >{orden.nombre_solicitante}</td>
              <td >{orden.prioridad}</td>
              <td >{orden.fecha_estimacion}</td>
              <td >
                {context.sucursalesTabla.find(
                  (sucursal) => sucursal.id === orden.sucursal_id
                )?.nombre || "Desconocido"}
              </td>
              <td >
                {orden.estado ? "Procesado" : "Pendiente"}
              </td>
              <td
                // className="d-flex justify-content-around"
                
              >
                {userContext.user.rol_id !== 5 && (
                  <>
                    <Link
                      to={`/ordenes-mantenimiento/${orden.id}/edit`}
                className="btn btn-warning mb-2 mb-md-0 mr-md-2 btn-sm"
                    >
                      Editar
                    </Link>
                    <Button
                      variant="danger"
                className="btn btn-warning mb-2 mb-md-0 mr-md-2 btn-sm"
                      onClick={() => handleDelete(orden.id)}
                    >
                      Eliminar
                    </Button>
                  </>
                )}
                {(userContext.user.rol_id !== 4 || orden.estado) && (
                  <Button
                    variant="success"
                  className="btn mb-2 mb-md-0 mr-md-2 btn-sm"
                    onClick={() => handleExecute(orden)}
                  >
                    Ejecutar
                  </Button>
                )}
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
        <span className="mx-2">
          Página {currentPage} de{" "}
          {Math.ceil(filteredOrdenes.length / ordenesPerPage)}
        </span>
        <Button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(filteredOrdenes.length / ordenesPerPage)
          }
          className="btn-sm"
        >
          <BsChevronRight />
        </Button>
      </div>
    </Container>
  );
}
