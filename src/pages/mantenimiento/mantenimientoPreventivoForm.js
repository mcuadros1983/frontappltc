import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Contexts from "../../context/Contexts";

export default function MantenimientoPreventivoForm() {
  const { id } = useParams();
  const [detalle, setDetalle] = useState('');
  const [fecha, setFecha] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [equipoId, setEquipoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch equipos cuando cambia la sucursal seleccionada
  useEffect(() => {
    if (sucursalId) {
      const fetchEquipos = async () => {
        try {
          const response = await fetch(`${apiUrl}/equipos/sucursal/${sucursalId}`, {
            credentials: 'include',
          });
          const data = await response.json();
          setEquipos(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error al obtener los equipos:', error);
          setError('Error al cargar los equipos. Por favor, intente nuevamente.');
          setEquipos([]);
        }
      };

      fetchEquipos();
    } else {
      setEquipos([]);
    }
  }, [sucursalId, apiUrl]);

  // Cargar los datos del mantenimiento preventivo si se está editando
  useEffect(() => {
    const fetchMantenimientoPreventivo = async () => {
      if (id) {
        try {
          const response = await fetch(`${apiUrl}/mantenimientos-preventivos/${id}`, {
            credentials: 'include',
          });
          const data = await response.json();
          setDetalle(data.detalle);
          setFecha(data.fecha);
          setSucursalId(data.sucursal_id);
          setEquipoId(data.equipo_id);
        } catch (error) {
          console.error('Error al cargar el mantenimiento preventivo:', error);
          setError('Error al cargar el mantenimiento preventivo. Por favor, intente nuevamente.');
        }
      }
    };

    fetchMantenimientoPreventivo();
  }, [id, apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!detalle || !fecha || !equipoId || !sucursalId) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const mantenimientoPreventivoData = {
      detalle,
      fecha,
      equipo_id: equipoId,
      sucursal_id: sucursalId,
    };

    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${apiUrl}/mantenimientos-preventivos/${id}` : `${apiUrl}/mantenimientos-preventivos`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mantenimientoPreventivoData),
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/mantenimiento-preventivo');
      } else {
        console.error('Error al guardar el mantenimiento preventivo');
      }
    } catch (error) {
      console.error('Error al guardar el mantenimiento preventivo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>{id ? 'Editar Mantenimiento Preventivo' : 'Crear Mantenimiento Preventivo'}</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="fecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
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
        </Row>
        <Row>
          <Col xs={12}>
            <Form.Group controlId="equipo">
              <Form.Label>Equipo</Form.Label>
              <Form.Control
                as="select"
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
                required
                disabled={equipos.length === 0} // Inhabilitado si no hay equipos
              >
                <option value="">Seleccione un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre} - {equipo.numero_serie}
                  </option>
                ))}
              </Form.Control>
              {equipos.length === 0 && (
                <small className="text-muted">
                  No hay equipos disponibles para la sucursal seleccionada.
                </small>
              )}
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
              />
            </Form.Group>
          </Col>
        </Row>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button variant="primary" type="submit" disabled={loading} className="mt-3">
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </Form>
    </Container>
  );
}
