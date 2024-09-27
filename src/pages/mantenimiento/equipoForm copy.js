// pages/mantenimiento/EquipoForm.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Contexts from "../../context/Contexts";

export default function EquipoForm() {
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [ultimoMantenimiento, setUltimoMantenimiento] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(Contexts.DataContext);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${apiUrl}/categorias-equipos`);
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
        setError('Error al cargar las categorías. Por favor, intente nuevamente.');
      }
    };

    fetchCategorias();
  }, [apiUrl]);

  useEffect(() => {
    if (id) {
      const fetchEquipo = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${apiUrl}/equipos/${id}`);
          const data = await response.json();
          setNombre(data.nombre);
          setMarca(data.marca);
          setNumeroSerie(data.numero_serie);
          setFechaCompra(data.fecha_compra);
          setUltimoMantenimiento(data.ultimo_mantenimiento || '');
          setCategoriaId(data.categoria_equipo_id || '');
          setSucursalId(data.sucursal_id || '');
        } catch (error) {
          console.error('Error al obtener el equipo:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchEquipo();
    }
  }, [id, apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoriaId || !sucursalId) {
      setError('Por favor, seleccione una categoría y una sucursal.');
      return;
    }

    const equipoData = {
      nombre,
      marca,
      numero_serie: numeroSerie,
      fecha_compra: fechaCompra,
      ultimo_mantenimiento: ultimoMantenimiento || null,
      sucursal_id: sucursalId,
      categoria_equipo_id: categoriaId,
    };

    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id 
        ? `${apiUrl}/equipos/${id}` 
        : `${apiUrl}/equipos`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipoData),
      });

      if (response.ok) {
        navigate('/equipos'); // Redirigir a la lista de equipos después de guardar
      } else {
        console.error('Error al guardar el equipo');
      }
    } catch (error) {
      console.error('Error al guardar el equipo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>{id ? 'Editar Equipo' : 'Crear Equipo'}</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre del equipo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="marca">
              <Form.Label>Marca</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la marca del equipo"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="numeroSerie">
              <Form.Label>Número de Serie</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el número de serie del equipo"
                value={numeroSerie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="fechaCompra">
              <Form.Label>Fecha de Compra</Form.Label>
              <Form.Control
                type="date"
                value={fechaCompra}
                onChange={(e) => setFechaCompra(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="categoria">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                as="select"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </Form.Control>
              <Button
                as={Link}
                to="/categorias-equipos/new"
                variant="link"
                className="p-0 mt-2"
              >
                Crear nueva categoría
              </Button>
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
            <Form.Group controlId="ultimoMantenimiento">
              <Form.Label>Último Mantenimiento</Form.Label>
              <Form.Control
                type="date"
                value={ultimoMantenimiento}
                onChange={(e) => setUltimoMantenimiento(e.target.value)}
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
