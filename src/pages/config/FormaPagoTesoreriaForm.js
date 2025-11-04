import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import Contexts from "../../context/Contexts";


const FormaPagoTesoreriaForm = () => {
  const { formasPagoTesoreria, setFormasPagoTesoreria } = useContext(Contexts.DataContext);

  const [formapago, setFormaPago] = useState({
    descripcion: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => {
    navigate("/formas-pago-tesoreria");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormaPago({ ...formapago, [name]: value });
  };

  const loadFormaPago = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/formas-pago-tesoreria/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setFormaPago(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadFormaPago(params.id);
    } else {
      setEditing(false);
      setFormaPago({ descripcion: "" });
    }
  }, [params.id, loadFormaPago]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/formas-pago-tesoreria/${params.id}`
      : `${apiUrl}/formas-pago-tesoreria`;

    const res = await fetch(url, {
      credentials: "include",
      method,
      body: JSON.stringify(formapago),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const nuevaForma = await res.json();

    if (editing) {
      const actualizadas = formasPagoTesoreria.map((f) =>
        f.id === nuevaForma.id ? nuevaForma : f
      );
      setFormasPagoTesoreria(actualizadas);
    } else {
      setFormasPagoTesoreria([...formasPagoTesoreria, nuevaForma]);
    }

    setLoading(false);
    navigate("/formas-pago-tesoreria");
  };
  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Forma de Pago" : "Agregar Forma de Pago"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={formapago.descripcion}
            onChange={handleChange}
            placeholder="Ej: Transferencia, Efectivo, Cheque..."
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

export default FormaPagoTesoreriaForm;
