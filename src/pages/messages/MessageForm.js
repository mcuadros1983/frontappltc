import React, { useState, useEffect, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

export default function MessageForm() {
  const [message, setMessage] = useState({
    text: "",
    scheduleTime: "", // Esto se almacena como string para el campo de tiempo
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false); // Estado para saber si se está editando
  const [error, setError] = useState(""); // Para manejar errores en validaciones

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams(); // Obtener los parámetros de la URL

  // Función para manejar los cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage({
      ...message,
      [name]: value,
    });
  };

  // Función para formatear la fecha y hora correctamente en local sin ajustar a UTC
  const formatLocalDateTime = (dateString) => {
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  // Función para cargar un mensaje existente para editar
  const loadMessage = useCallback(async (id) => {
    try {
      const res = await fetch(`${apiUrl}/messages/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setMessage({
        text: data.text,
        scheduleTime: formatLocalDateTime(data.scheduleTime), // Ajustar a la hora local
      });
      setEditing(true);
    } catch (error) {
      console.error("Error al cargar el mensaje:", error);
    }
  }, [apiUrl]);

  // Cargar el mensaje si el parámetro de la URL tiene un ID
  useEffect(() => {
    if (params.id) {
      loadMessage(params.id);
    } else {
      setEditing(false);
      setMessage({
        text: "",
        scheduleTime: "",
      });
    }
  }, [params.id, loadMessage]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar que el campo de texto no esté vacío
    if (!message.text.trim()) {
      setError("El texto del mensaje no puede estar vacío.");
      setLoading(false);
      return;
    }

    // Validar que el campo de fecha y hora esté completo
    if (!message.scheduleTime) {
      setError("Debes seleccionar una hora y fecha válidas.");
      setLoading(false);
      return;
    }

    setError(""); // Limpiar cualquier error previo

    try {
      if (editing) {
        // Si estamos editando, actualiza el mensaje
        await fetch(`${apiUrl}/messages/${params.id}`, {
          credentials: "include",
          method: "PUT",
          body: JSON.stringify({
            ...message,
            scheduleTime: new Date(message.scheduleTime).toISOString(), // Convertir a formato ISO
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        // Crear un nuevo mensaje
        await fetch(`${apiUrl}/messages`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify({
            ...message,
            scheduleTime: new Date(message.scheduleTime).toISOString(), // Convertir a formato ISO
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      setLoading(false);
      navigate("/messages"); // Redirigir a la lista de mensajes
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
      setLoading(false);
      setError("Ocurrió un error al guardar el mensaje.");
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Mensaje" : "Crear Mensaje"}
      </h1>
      {error && <p className="text-danger">{error}</p>}
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            name="text"
            value={message.text}
            onChange={handleChange}
            placeholder="Ingresa el mensaje"
            className="my-input"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Fecha y Hora Programada</Form.Label>
          <Form.Control
            type="datetime-local"
            name="scheduleTime"
            value={message.scheduleTime}
            onChange={handleChange}
            className="my-input"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ position: "relative" }}
        >
          {loading ? (
            <Spinner
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : editing ? (
            "Actualizar"
          ) : (
            "Guardar"
          )}
        </Button>
      </Form>
    </Container>
  );
}
