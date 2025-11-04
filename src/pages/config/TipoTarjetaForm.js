import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import Contexts from "../../context/Contexts";


const TipoTarjetaForm = () => {
  const { tiposTarjetaTabla, setTiposTarjetaTabla } = useContext(Contexts.DataContext);

  const [tipo, setTipo] = useState({ nombre: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => navigate("/tipos-tarjeta");

  const handleChange = (e) => {
    setTipo({ ...tipo, [e.target.name]: e.target.value });
  };

  const loadTipo = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/tipos-tarjeta/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setTipo(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadTipo(params.id);
    } else {
      setEditing(false);
      setTipo({ nombre: "" });
    }
  }, [params.id, loadTipo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editing
      ? `${apiUrl}/tipos-tarjeta/${params.id}`
      : `${apiUrl}/tipos-tarjeta`;

    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      credentials: "include",
      body: JSON.stringify(tipo),
      headers: { "Content-Type": "application/json" },
    });

    const nuevoTipo = await res.json();

    if (editing) {
      const actualizados = tiposTarjetaTabla.map((item) =>
        item.id === nuevoTipo.id ? nuevoTipo : item
      );
      setTiposTarjetaTabla(actualizados);
    } else {
      setTiposTarjetaTabla([...tiposTarjetaTabla, nuevoTipo]);
    }

    setLoading(false);
    navigate("/tipos-tarjeta");
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Tipo de Tarjeta" : "Agregar Tipo de Tarjeta"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={tipo.nombre}
            onChange={handleChange}
            placeholder="Ej: Crédito, Débito, Prepaga"
            className="my-input"
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading} style={{ marginRight: "5px" }}>
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

export default TipoTarjetaForm;
