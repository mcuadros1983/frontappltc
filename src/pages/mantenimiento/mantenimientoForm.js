import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  InputGroup,
} from "react-bootstrap";
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
  const [items, setItems] = useState([]); // Estado para manejar los ítems del equipo
  const [itemsEvaluacion, setItemsEvaluacion] = useState([]); // Estado para manejar las evaluaciones de los ítems
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMantenimientoRevisiones, setHasMantenimientoRevisiones] =
    useState(false); // Nuevo estado para verificar revisiones de mantenimiento
  const [mantenimientoPreventivoId] = useState(
    location.state?.mantenimientoPreventivoId || null
  );

  const navigate = useNavigate();
  const context = useContext(Contexts.DataContext);
  const userContext = useContext(Contexts.UserContext); // Accedemos al UserContext
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("sucursales from context:", context.sucursalesTabla);
    console.log("sucursales from context:", context.sucursales);
    const fetchMantenimiento = async () => {
      if (id) {
        try {
          const response = await fetch(`${apiUrl}/mantenimientos/${id}`, {
            credentials: "include",
          });
          const data = await response.json();
          const { mantenimiento, revisiones } = data;

          setSucursalId(mantenimiento.Equipo.sucursal_id);
          setEquipoId(mantenimiento.equipo_id);
          setFechaInicio(mantenimiento.fecha_inicio);
          setFechaFin(mantenimiento.fecha_fin);
          setDetalle(mantenimiento.detalle);
          setObservaciones(mantenimiento.observaciones);
          setNombreFirmante(mantenimiento.nombre_firmante);
          setTerminado(mantenimiento.terminado);
          setOrdenId(mantenimiento.orden_mantenimiento_id);
          setPreventivoId(mantenimiento.mantenimiento_preventivo_id);

          // Si existen revisiones, usarlas y marcar que estamos manejando revisiones de mantenimiento
          if (revisiones && revisiones.length > 0) {
            setItems(revisiones);
            setItemsEvaluacion(
              revisiones.map((item) => ({
                item_equipo_id: item.item_equipo_id,
                estado: item.estado,
                comentarios: item.comentarios,
              }))
            );
            setHasMantenimientoRevisiones(true); // Marcar que estamos usando revisiones del mantenimiento
          } else {
            // Si no hay revisiones, obtener los ítems del equipo y usar sus evaluaciones
            setHasMantenimientoRevisiones(false);
            fetchItems(mantenimiento.equipo_id, true);
          }

          // Obtener los equipos asociados a la sucursal del mantenimiento
          await fetchEquipos(mantenimiento.Equipo.sucursal_id);
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

  // Función para obtener los ítems y sus evaluaciones
  const fetchItems = async (equipoId, isEdit = false) => {
    // Si estamos editando y ya se cargaron las revisiones del mantenimiento, no continuar
    if (isEdit && hasMantenimientoRevisiones) return;

    if (!equipoId) return;

    try {
      const response = await fetch(`${apiUrl}/equipos/${equipoId}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && Array.isArray(data.ItemEquipos)) {
        setItems(data.ItemEquipos);

        // Obtener las revisiones de los ítems del equipo
        // const revisionesResponse = await fetch(`${apiUrl}/revisiones?equipo_id=${equipoId}`, { credentials: "include" });
        // const revisionesData = await revisionesResponse.json();

        // const revisionesMap = Array.isArray(revisionesData)
        //   ? revisionesData.reduce((map, revision) => {
        //       // Solo tomar la última revisión por ítem
        //       if (!map[revision.item_equipo_id] || new Date(map[revision.item_equipo_id].fecha_revision) < new Date(revision.fecha_revision)) {
        //         map[revision.item_equipo_id] = revision;
        //       }
        //       return map;
        //     }, {})
        //   : {};

        // Asignar estados a los ítems según las revisiones (última revisión realizada), si existen
        setItemsEvaluacion(
          data.ItemEquipos.map((item) => ({
            item_equipo_id: item.id,
            estado: item.estado || "", // Usa estado de revisión si existe, o el estado del ítem
            comentarios: item.comentarios || "", // Usa comentarios de revisión si existen
          }))
        );
      } else {
        setItems([]);
        setItemsEvaluacion([]);
      }
    } catch (error) {
      console.error("Error al obtener los ítems del equipo:", error);
      setItems([]);
      setItemsEvaluacion([]);
    }
  };

  // Función para obtener los equipos según la sucursal seleccionada
  const fetchEquipos = async (sucursalId) => {
    if (!sucursalId) return;

    try {
      const response = await fetch(`${apiUrl}/equipos/sucursal/${sucursalId}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setEquipos(Array.isArray(data) ? data : []);
      } else {
        setEquipos([]);
      }
    } catch (error) {
      console.error("Error al obtener los equipos:", error);
      setError("Error al cargar los equipos. Por favor, intente nuevamente.");
      setEquipos([]);
    }
  };

  // Hook para obtener los equipos cuando se selecciona una sucursal (solo en creación)
  useEffect(() => {
    if (sucursalId && !id) {
      fetchEquipos(sucursalId);
    }
  }, [sucursalId, id]);

  // Hook para obtener los ítems cuando se selecciona un equipo
  useEffect(() => {
    if (equipoId && !hasMantenimientoRevisiones) {
      fetchItems(equipoId);
    }
  }, [equipoId, hasMantenimientoRevisiones]);

  const isReadOnly = userContext.user.rol_id === 4; // Determinar si los campos deben estar inhabilitados

  const handleEvaluacionChange = (index, field, value) => {
    const newEvaluaciones = [...itemsEvaluacion];
    newEvaluaciones[index][field] = value;
    setItemsEvaluacion(newEvaluaciones);
  };

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
      revisiones: itemsEvaluacion, // Enviar las evaluaciones de los ítems al backend
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
            body: JSON.stringify({ estado: true }), credentials: 'include' // Cambiar el estado a true
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
            body: JSON.stringify({ estado: true }), credentials: 'include' // Cambiar el estado a true
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
        {/* Sección para evaluar los ítems del equipo */}
        {items.length > 0 && (
          <Row className="mt-3">
            <Col xs={12}>
              <h5>Evaluación de Ítems del Equipo</h5>
              {items.map((item, index) => (
                <InputGroup className="mb-2" key={item.id}>
                  <Form.Label className="mr-2">{item.nombre}</Form.Label>
                  <Form.Control
                    as="select"
                    value={itemsEvaluacion[index]?.estado || ""}
                    onChange={(e) =>
                      handleEvaluacionChange(index, "estado", e.target.value)
                    }
                  >
                    <option value="">Seleccione el estado</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Regular">Regular</option>
                    <option value="Malo">Malo</option>
                  </Form.Control>

                  {/* Separador de espacio entre los controles */}
                  <InputGroup.Text
                    style={{ border: "none", background: "transparent" }}
                  >
                    &nbsp;
                  </InputGroup.Text>

                  <Form.Control
                    type="text"
                    placeholder="Comentarios"
                    value={itemsEvaluacion[index]?.comentarios || ""}
                    onChange={(e) =>
                      handleEvaluacionChange(
                        index,
                        "comentarios",
                        e.target.value
                      )
                    }
                    disabled={isReadOnly}
                  />
                </InputGroup>
              ))}
            </Col>
          </Row>
        )}
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
