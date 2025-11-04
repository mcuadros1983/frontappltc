import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import Contexts from "../../context/Contexts";


const FrigorificoForm = () => {
  const { frigorificoTabla, setFrigorificoTabla } = useContext(Contexts.DataContext);

  const [frigorifico, setFrigorifico] = useState({
    descripcion: "",
    cuit: "",
    domicilio: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => {
    navigate("/frigorificos");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFrigorifico({ ...frigorifico, [name]: value });
  };

  const loadFrigorifico = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/frigorificos/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setFrigorifico(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadFrigorifico(params.id);
    } else {
      setEditing(false);
      setFrigorifico({
        descripcion: "",
        cuit: "",
        domicilio: "",
      });
    }
  }, [params.id, loadFrigorifico]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/frigorificos/${params.id}`
      : `${apiUrl}/frigorificos`;

    const res = await fetch(url, {
      credentials: "include",
      method,
      body: JSON.stringify(frigorifico),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const nuevoFrigorifico = await res.json();

    if (editing) {
      const actualizados = frigorificoTabla.map((f) =>
        f.id === nuevoFrigorifico.id ? nuevoFrigorifico : f
      );
      setFrigorificoTabla(actualizados);
    } else {
      setFrigorificoTabla([...frigorificoTabla, nuevoFrigorifico]);
    }

    setLoading(false);
    navigate("/frigorificos");
  };


  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Frigorífico" : "Agregar Frigorífico"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={frigorifico.descripcion}
            onChange={handleChange}
            placeholder="Nombre del frigorífico"
            className="my-input"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>CUIT</Form.Label>
          <Form.Control
            type="text"
            name="cuit"
            value={frigorifico.cuit}
            onChange={handleChange}
            placeholder="Ej: 30-XXXXXXXX-X"
            className="my-input"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Domicilio</Form.Label>
          <Form.Control
            type="text"
            name="domicilio"
            value={frigorifico.domicilio}
            onChange={handleChange}
            placeholder="Domicilio del frigorífico"
            className="my-input"
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

export default FrigorificoForm;
