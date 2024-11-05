import React, { useState } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function SyncForm() {
  const [message, setMessage] = useState(""); // Estado para el mensaje
  const [loadingSync, setLoadingSync] = useState(false); // Estado para el botón de sincronización de datos
  const [loadingMessage, setLoadingMessage] = useState(false); // Estado para el botón de enviar mensaje
  const [loadingPromociones, setLoadingPromociones] = useState(false); // Estado para el botón de sincronizar promociones
  const [loadingPrecios, setLoadingPrecios] = useState(false); // Estado para el botón de sincronizar precios
  const [loadingTablas, setLoadingTablas] = useState(false); // Estado para el botón de sincronizar tablas

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // Función para manejar la sincronización de datos
  const handleSync = async () => {
    setLoadingSync(true);
    try {
      await fetch(`${apiUrl}/sync`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Sincronización de datos completada con éxito.");
    } catch (error) {
      console.error("Error al sincronizar datos:", error);
      alert("Error durante la sincronización de datos.");
    } finally {
      setLoadingSync(false);
    }
  };

  // Función para manejar la sincronización de promociones
  const handleSyncPromociones = async () => {
    setLoadingPromociones(true);
    try {
      await fetch(`${apiUrl}/syncpromociones`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Sincronización de promociones completada con éxito.");
    } catch (error) {
      console.error("Error al sincronizar promociones:", error);
      alert("Error durante la sincronización de promociones.");
    } finally {
      setLoadingPromociones(false);
    }
  };

  // Función para manejar la sincronización de precios
  const handleSyncPrecios = async () => {
    setLoadingPrecios(true);
    try {
      await fetch(`${apiUrl}/syncprecios`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Sincronización de precios completada con éxito.");
    } catch (error) {
      console.error("Error al sincronizar precios:", error);
      alert("Error durante la sincronización de precios.");
    } finally {
      setLoadingPrecios(false);
    }
  };

  // Función para manejar la sincronización de tablas
  const handleSyncTablas = async () => {
    setLoadingTablas(true);
    try {
      await fetch(`${apiUrl}/synctablas`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Sincronización de tablas completada con éxito.");
    } catch (error) {
      console.error("Error al sincronizar tablas:", error);
      alert("Error durante la sincronización de tablas.");
    } finally {
      setLoadingTablas(false);
    }
  };

  // Función para manejar el envío de mensajes
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("El mensaje no puede estar vacío.");
      return;
    }
    setLoadingMessage(true);
    try {
      await fetch(`${apiUrl}/notification`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ message }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Mensaje enviado con éxito.");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert("Error al enviar el mensaje.");
    } finally {
      setLoadingMessage(false);
      setMessage(""); // Limpiar el campo del mensaje
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">Sincronización y Mensajes</h1>

      <div className="mb-4 w-50 d-flex flex-column align-items-center">
        {/* Botón para Sincronización de Datos */}
        <Button
          variant="primary"
          onClick={handleSync}
          disabled={loadingSync}
          className="mb-3 w-100"
          style={{ height: "50px", fontSize: "18px" }}
        >
          {loadingSync ? (
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            "Ventas y Caja"
          )}
        </Button>

        {/* Botón para Sincronización de Promociones */}
        <Button
          variant="primary"
          onClick={handleSyncPromociones}
          disabled={loadingPromociones}
          className="mb-3 w-100"
          style={{ height: "50px", fontSize: "18px" }}
        >
          {loadingPromociones ? (
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            "Promociones"
          )}
        </Button>

        {/* Botón para Sincronización de Precios */}
        <Button
          variant="primary"
          onClick={handleSyncPrecios}
          disabled={loadingPrecios}
          className="mb-3 w-100"
          style={{ height: "50px", fontSize: "18px" }}
        >
          {loadingPrecios ? (
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            "Precios"
          )}
        </Button>

        {/* Botón para Sincronización de Tablas */}
        <Button
          variant="primary"
          onClick={handleSyncTablas}
          disabled={loadingTablas}
          className="mb-3 w-100"
          style={{ height: "50px", fontSize: "18px" }}
        >
          {loadingTablas ? (
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            "Tablas"
          )}
        </Button>
      </div>

      {/* Formulario para enviar mensajes */}
      <Form onSubmit={handleSendMessage} className="w-75">
        <Form.Group className="mb-3">
          <Form.Label>Mensaje</Form.Label>
          <Form.Control
            as="textarea"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje"
            className="my-input"
            rows={4} // Hacer el campo más grande
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loadingMessage}
          style={{ width: "100%", height: "50px", fontSize: "18px" }}
        >
          {loadingMessage ? (
            <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            "Enviar Mensaje"
          )}
        </Button>
      </Form>
    </Container>
  );
}
