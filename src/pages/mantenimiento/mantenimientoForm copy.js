import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Contexts from "../../context/Contexts";

export default function MantenimientoForm() {
  const location = useLocation();
  const { id } = useParams();
  const [sucursalId, setSucursalId] = useState(
    location.state?.sucursalId || ""
  );
  const [equipoId, setEquipoId] = useState(location.state?.equipoId || "");
  const [ordenId, setOrdenId] = useState(
    location.state?.ordenMantenimientoId || ""
  );
  const [preventivoId, setPreventivoId] = useState(
    location.state?.mantenimientoPreventivoId || ""
  );
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [detalle, setDetalle] = useState(location.state?.detalle || "");
  const [observaciones, setObservaciones] = useState("");
  const [nombreFirmante, setNombreFirmante] = useState("");
  const [terminado, setTerminado] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mantenimientoPreventivoId] = useState(
    location.state?.mantenimientoPreventivoId || null
  );

  const navigate = useNavigate();
  const context = useContext(Contexts.DataContext);
  const userContext = useContext(Contexts.UserContext); // Accedemos al UserContext
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMantenimiento = async () => {
      if (id) {
        try {
          const response = await fetch(`${apiUrl}/mantenimientos/${id}`);
          const data = await response.json();

          setSucursalId(data.Equipo.sucursal_id);
          setEquipoId(data.equipo_id);
          setFechaInicio(data.fecha_inicio);
          setFechaFin(data.fecha_fin);
          setDetalle(data.detalle);
          setObservaciones(data.observaciones);
          setNombreFirmante(data.nombre_firmante);
          setTerminado(data.terminado);
          setOrdenId(data.orden_mantenimiento_id);
          setPreventivoId(data.mantenimiento_preventivo_id);

          const equiposResponse = await fetch(
            `${apiUrl}/equipos?sucursal_id=${data.Equipo.sucursal_id}`
          );
          const equiposData = await equiposResponse.json();
          setEquipos(Array.isArray(equiposData) ? equiposData : []);

          setEquipoId(data.equipo_id);
        } catch (error) {
          console.error("Error al cargar el mantenimiento:", error);
          setError(
            "Error al cargar el mantenimiento. Por favor, intente nuevamente."
          );
        }
      }
    };

    fetchMantenimiento();
  }, [id, apiUrl]);

  useEffect(() => {
    if (sucursalId && !id) {
      const fetchEquipos = async () => {
        try {
          const response = await fetch(
            `${apiUrl}/equipos/sucursal/${sucursalId}`
          );
          const data = await response.json();

          if (response.ok) {
            setEquipos(Array.isArray(data) ? data : []);
          } else {
            setEquipos([]);
          }
        } catch (error) {
          console.error("Error al obtener los equipos:", error);
          setError(
            "Error al cargar los equipos. Por favor, intente nuevamente."
          );
          setEquipos([]);
        }
      };

      fetchEquipos();
    } else if (!sucursalId) {
      setEquipos([]);
    }
  }, [sucursalId, apiUrl, id]);

  const isReadOnly = userContext.user.rol_id === 4; // Determinar si los campos deben estar inhabilitados

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validación adicional para verificar que la fecha de fin esté presente si el mantenimiento está terminado
    if (terminado && !fechaFin) {
      setError("Falta la fecha de finalización. Por favor, ingrésela.");
      return;
    }
  
    if (!sucursalId || !equipoId || !fechaInicio) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }
  
    if (terminado && !nombreFirmante) {
      setError("Por favor, ingrese el nombre del firmante.");
      return;
    }
  
    const mantenimientoData = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin || null,
      detalle,
      observaciones,
      nombre_firmante: terminado ? nombreFirmante : null,
      equipo_id: equipoId,
      terminado,
      mantenimiento_preventivo_id: mantenimientoPreventivoId || null,
      orden_mantenimiento_id: ordenId || null,
      sucursal_id: sucursalId || null,
    };
  
    setLoading(true);
  
    try {
      // Verificar y actualizar los campos relacionados si existen antes de guardar el mantenimiento
      if (ordenId) {
        const updateOrdenResponse = await fetch(
          `${apiUrl}/ordenes_mantenimiento/${ordenId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ estado: true }), // Cambiar el estado a true
          }
        );
        if (!updateOrdenResponse.ok) {
          throw new Error("Error al actualizar la orden de mantenimiento");
        }
      }
  
      if (preventivoId) {
        const updatePreventivoResponse = await fetch(
          `${apiUrl}/mantenimientos-preventivos/${preventivoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ estado: true }), // Cambiar el estado a true
          }
        );
        if (!updatePreventivoResponse.ok) {
          throw new Error("Error al actualizar el mantenimiento preventivo");
        }
      }
  
      // Ahora proceder a guardar o actualizar el mantenimiento
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${apiUrl}/mantenimientos/${id}`
        : `${apiUrl}/mantenimientos`;
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mantenimientoData),
        credentials: "include",
      });
  
      if (response.ok) {
        navigate("/mantenimientos");
      } else {
        console.error("Error al guardar el mantenimiento");
      }
    } catch (error) {
      console.error("Error al guardar el mantenimiento:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Container>
      <h2>{id ? "Editar Mantenimiento" : "Crear Mantenimiento"}</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="sucursal">
              <Form.Label>Sucursal</Form.Label>
              <Form.Control
                as="select"
                value={sucursalId}
                onChange={(e) => setSucursalId(e.target.value)}
                required
                disabled={!!id || isReadOnly}
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
            <Form.Group controlId="equipo">
              <Form.Label>Equipo</Form.Label>
              <Form.Control
                as="select"
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
                required
                disabled={
                  !sucursalId || equipos.length === 0 || !!id || isReadOnly
                }
              >
                <option value="">Seleccione un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre} - {equipo.numero_serie}
                  </option>
                ))}
              </Form.Control>
              {!isReadOnly && sucursalId && equipos.length === 0 && (
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
          <Col xs={12} md={6}>
            <Form.Group controlId="fechaInicio">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                disabled={isReadOnly}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="fechaFin">
              <Form.Label>Fecha de Fin</Form.Label>
              <Form.Control
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={isReadOnly}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Form.Group controlId="detalle">
              <Form.Label>Detalle</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                required
                disabled={isReadOnly}
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group controlId="observaciones">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                disabled={isReadOnly}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="nombreFirmante">
              <Form.Label>Nombre del Firmante</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre del firmante"
                value={nombreFirmante}
                onChange={(e) => setNombreFirmante(e.target.value)}
                required={terminado}
                disabled={!terminado || isReadOnly}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="terminado">
              <Form.Check
                type="checkbox"
                label="Mantenimiento Terminado"
                checked={terminado}
                onChange={(e) => setTerminado(e.target.checked)}
                disabled={isReadOnly}
              />
            </Form.Group>
          </Col>
        </Row>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Botón Guardar solo visible si no es readOnly */}
        {!isReadOnly && (
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="mt-3"
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        )}
      </Form>
    </Container>
  );
}
