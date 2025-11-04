import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import Contexts from "../../context/Contexts";


const ImputacionContableForm = () => {
  const { imputacionContableTabla, setImputacionContableTabla } = useContext(Contexts.DataContext);

  const [imputacion, setImputacion] = useState({ descripcion: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => {
    navigate("/imputaciones-contables");
  };

  const handleChange = (e) => {
    setImputacion({ ...imputacion, [e.target.name]: e.target.value });
  };

  const loadImputacionContable = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/imputaciones-contables/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setImputacion(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadImputacionContable(params.id);
    } else {
      setEditing(false);
      setImputacion({ descripcion: "" });
    }
  }, [params.id, loadImputacionContable]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editing
      ? `${apiUrl}/imputaciones-contables/${params.id}`
      : `${apiUrl}/imputaciones-contables`;

    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      credentials: "include",
      method,
      body: JSON.stringify(imputacion),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const nuevaImputacion = await res.json();

    if (editing) {
      const actualizadas = imputacionContableTabla.map((item) =>
        item.id === nuevaImputacion.id ? nuevaImputacion : item
      );
      setImputacionContableTabla(actualizadas);
    } else {
      setImputacionContableTabla([...imputacionContableTabla, nuevaImputacion]);
    }

    setLoading(false);
    navigate("/imputaciones-contables");
  };


  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Imputación" : "Agregar Imputación Contable"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={imputacion.descripcion}
            onChange={handleChange}
            placeholder="Ej: Ingresos Brutos, Caja, Banco..."
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

export default ImputacionContableForm;
