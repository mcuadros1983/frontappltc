// pages/mantenimiento/CategoriaEquipoForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

export default function CategoriaEquipoForm() {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchCategoria = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/categorias-equipos/${id}`, {credentials: 'include'});
          const data = await response.json();
          setNombre(data.nombre);
        } catch (error) {
          console.error('Error al obtener la categoría:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCategoria();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoriaData = { nombre };

    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id 
        ? `${process.env.REACT_APP_API_URL}/categorias-equipos/${id}` 
        : `${process.env.REACT_APP_API_URL}/categorias-equipos`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoriaData),credentials: 'include'
      });

      if (response.ok) {
        navigate('/categorias-equipos'); // Redirigir a la lista de categorías después de guardar
      } else {
        console.error('Error al guardar la categoría');
      }
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>{id ? 'Editar Categoría de Equipo' : 'Crear Categoría de Equipo'}</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre de la categoría"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" disabled={loading} className="mt-3">
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </Form>
    </Container>
  );
}
