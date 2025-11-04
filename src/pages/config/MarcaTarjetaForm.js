import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import Contexts from "../../context/Contexts";


const MarcaTarjetaForm = () => {
  const { marcasTarjetaTabla, setMarcasTarjetaTabla } = useContext(Contexts.DataContext);

  const [marca, setMarca] = useState({ nombre: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => {
    navigate("/marcas-tarjeta");
  };

  const handleChange = (e) => {
    setMarca({ ...marca, [e.target.name]: e.target.value });
  };

  const loadMarca = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/marcas-tarjeta/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setMarca(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadMarca(params.id);
    } else {
      setEditing(false);
      setMarca({ nombre: "" });
    }
  }, [params.id, loadMarca]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editing
      ? `${apiUrl}/marcas-tarjeta/${params.id}`
      : `${apiUrl}/marcas-tarjeta`;

    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      credentials: "include",
      method,
      body: JSON.stringify(marca),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const nuevaMarca = await res.json();

    if (editing) {
      const actualizadas = marcasTarjetaTabla.map((item) =>
        item.id === nuevaMarca.id ? nuevaMarca : item
      );
      setMarcasTarjetaTabla(actualizadas);
    } else {
      setMarcasTarjetaTabla([...marcasTarjetaTabla, nuevaMarca]);
    }

    setLoading(false);
    navigate("/marcas-tarjeta");
  };


  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Marca de Tarjeta" : "Agregar Marca de Tarjeta"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={marca.nombre}
            onChange={handleChange}
            placeholder="Ej: Visa, Mastercard, Naranja..."
            className="my-input"
            required
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ marginRight: "5px" }}
        >
          {loading ? <Spinner animation="border" size="sm" /> : editing ? "Editar" : "Guardar"}
        </Button>
        {editing && (
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default MarcaTarjetaForm;
