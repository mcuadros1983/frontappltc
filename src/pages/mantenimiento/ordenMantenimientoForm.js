import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Contexts from "../../context/Contexts";

export default function OrdenMantenimientoForm() {
  const { id } = useParams(); // Obtener el ID de la orden si se está editando
  const [detalleTrabajo, setDetalleTrabajo] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [fechaEstimacion, setFechaEstimacion] = useState("");
  const [sucursalId, setSucursalId] = useState(""); // Estado para la sucursal
  const [equipos, setEquipos] = useState([]);
  const [equipoId, setEquipoId] = useState("");
  const [nombreSolicitante, setNombreSolicitante] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const context = useContext(Contexts.DataContext);
  const contextUser = useContext(Contexts.UserContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch equipos cuando sucursalId cambia
  useEffect(() => {
    console.log("sucursales", context.sucursales);
    if (sucursalId) {
      const fetchEquipos = async () => {
        try {
          // Cambia la URL para obtener equipos según la sucursal seleccionada
          const response = await fetch(
            `${apiUrl}/equipos/sucursal/${sucursalId}`, {credentials:"include"}
          );
          const data = await response.json();
          setEquipos(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error al obtener los equipos:", error);
          setError(
            "Error al cargar los equipos. Por favor, intente nuevamente."
          );
          setEquipos([]);
        }
      };

      fetchEquipos();
    } else {
      setEquipos([]); // Si no hay sucursal seleccionada, vacía la lista de equipos
    }
  }, [sucursalId, apiUrl]);

  // Fetch datos de la orden existente si se está editando
  useEffect(() => {
    const fetchOrdenMantenimiento = async () => {
      if (id) {
        try {
          const response = await fetch(
            `${apiUrl}/ordenes_mantenimiento/${id}`,
            {
              credentials: "include",
            }
          );
          const data = await response.json();
          setDetalleTrabajo(data.detalle_trabajo);
          setPrioridad(data.prioridad);
          setFechaEstimacion(data.fecha_estimacion);
          setSucursalId(data.sucursal_id);
          setEquipoId(data.equipo_id);
          setNombreSolicitante(data.nombre_solicitante);
        } catch (error) {
          console.error("Error al cargar la orden de mantenimiento:", error);
          setError(
            "Error al cargar la orden de mantenimiento. Por favor, intente nuevamente."
          );
        }
      }
    };

    fetchOrdenMantenimiento();
  }, [id, apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!detalleTrabajo || !prioridad || !nombreSolicitante || !equipoId || !sucursalId) {
    if (!detalleTrabajo || !prioridad || !nombreSolicitante || !sucursalId) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }

    const ordenMantenimientoData = {
      detalle_trabajo: detalleTrabajo,
      prioridad,
      fecha_estimacion: fechaEstimacion || null,
      estado: false, // Valor por defecto
      nombre_solicitante: nombreSolicitante,
      equipo_id: equipoId || null,
      sucursal_id: sucursalId, // ID de la sucursal seleccionada
      usuario_id: contextUser.user.id, // ID del usuario desde el contexto
    };

    setLoading(true);

    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${apiUrl}/ordenes_mantenimiento/${id}`
        : `${apiUrl}/ordenes_mantenimiento`;

      const response = await fetch(url, {
        credentials: "include",
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ordenMantenimientoData),
      });

      if (response.ok) {
        navigate("/ordenes-mantenimiento"); // Redirigir a la lista de órdenes de mantenimiento después de guardar
      } else {
        console.error("Error al guardar la orden de mantenimiento");
      }
    } catch (error) {
      console.error("Error al guardar la orden de mantenimiento:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>
        {id ? "Editar Orden de Mantenimiento" : "Crear Orden de Mantenimiento"}
      </h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <Form.Group controlId="nombreSolicitante">
              <Form.Label>Nombre del Solicitante</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre del solicitante"
                value={nombreSolicitante}
                onChange={(e) => setNombreSolicitante(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="sucursal">
              <Form.Label>Sucursal</Form.Label>
              <Form.Control
                as="select"
                value={sucursalId}
                onChange={(e) => setSucursalId(e.target.value)}
                required
              >
                <option value="">Seleccione una sucursal</option>
                {context.sucursalesTabla.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="prioridad">
              <Form.Label>Prioridad</Form.Label>
              <Form.Control
                as="select"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                required
              >
                <option value="">Seleccione la prioridad</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Row>
                
          {/* <Col xs={12} md={6} disabled={contextUser.user.rol_id !== 4 }>
            <Form.Group controlId="fechaEstimacion" >
              <Form.Label>Fecha Estimada de Reparación</Form.Label>
              <Form.Control
                type="date"
                value={fechaEstimacion}
                onChange={(e) => setFechaEstimacion(e.target.value)}
              />
            </Form.Group>
          </Col> */}

          <Col xs={12} md={6}>
            <Form.Group controlId="equipo">
              <Form.Label>Equipo</Form.Label>
              <Form.Control
                as="select"
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
                required
                disabled={equipos.length === 0}
              >
                <option value="">Seleccione un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre} - {equipo.numero_serie}
                  </option>
                ))}
              </Form.Control>
              {sucursalId &&
                equipos.length === 0 &&
                contextUser.user.rol_id !== 4 && (
                  <Button
                    as={Link}
                    to={`/equipos/new?sucursal_id=${sucursalId}`}
                    variant="link"
                    className="p-0 mt-2"
                  >
                    Crear nuevo equipo
                  </Button>
                )}
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Form.Group controlId="detalleTrabajo">
              <Form.Label>Detalle del Trabajo</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={detalleTrabajo}
                onChange={(e) => setDetalleTrabajo(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          className="mt-3"
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </Form>
    </Container>
  );
}
