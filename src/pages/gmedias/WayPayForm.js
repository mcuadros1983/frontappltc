import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
// import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";

export default function WayPayForm() {
  const [waypay, setWaypay] = useState({
    tipo: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false); //estado para saber si se esta editando o no

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWaypay({
      ...waypay,
      [name]: value,
    });
  };

  const navigate = useNavigate();
  const params = useParams();

  const loadWayPay = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/formas-pago/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setWaypay(data);
    setEditing(true);
  }, [apiUrl]); // Añade solo apiUrl porque params.id se maneja a nivel de useEffect

  useEffect(() => {
    if (params.id) {
      loadWayPay(params.id);
    } else {
      setEditing(false);
      setWaypay({ tipo: "" });
    }
  }, [params.id, loadWayPay]); // Añade loadWayPay a las dependencias

  const handleSubmit = async (e) => {
    e.preventDefault(); //cancela el comportamiento por defecto
    // Aquí puedes manejar la lógica de envío del formulario
    setLoading(true);

    if (editing) {
      //si esta editando
      await fetch(`${apiUrl}/formas-pago/${params.id}`, {
        credentials:"include",
        method: "PUT",
        body: JSON.stringify(waypay),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEditing(false);
    } else {
      //si no esta editando
      await fetch(`${apiUrl}/formas-pago/`, {
        credentials:"include",
        method: "POST",
        body: JSON.stringify(waypay),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    setLoading(false);
    navigate("/waypays");
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Forma de Pago" : "Agregar Forma de Pago"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Tipo</Form.Label>
          <Form.Control
            type="text"
            name="tipo"
            value={waypay.tipo}
            onChange={handleChange}
            placeholder="Ingresa el tipo de pago"
            className="my-input"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loading} // Desactiva el botón mientras se carga
          style={{ position: "relative" }} // Añade una posición relativa al botón
        >
          {
            editing ? (
              "Editar"
            ) : loading ? (
              <Spinner
                animation="border"
                size="sm" // Ajusta el tamaño del Spinner a "sm" (pequeño)
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Guardar"
            )
            //"Guardar" // Si está editando muestra "Editar", si no "Guardar"
          }
        </Button>
      </Form>
    </Container>
  );
}
