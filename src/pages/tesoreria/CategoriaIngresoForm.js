import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";

const CategoriaIngresoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (id) {
      fetch(`${apiUrl}/categorias-ingreso/${id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setNombre(data.nombre))
        .catch(() => setError("Error al obtener la categoría"));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const metodo = id ? "PUT" : "POST";
    const url = id ? `${apiUrl}/categorias-ingreso/${id}` : `${apiUrl}/categorias-ingreso`;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) throw new Error("Error al guardar");
      navigate("/categorias-ingreso");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <Card.Title>{id ? "Editar" : "Nueva"} Categoría de Ingreso</Card.Title>
          {mensaje && <Alert variant="success">{mensaje}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </Form.Group>
            <Button className="mt-3" type="submit" variant="primary">Guardar</Button>
            <Button className="mt-3 ms-2" variant="secondary" onClick={() => navigate("/categorias-ingreso")}>Cancelar</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CategoriaIngresoForm;
