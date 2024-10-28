import React, { useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

export default function ScheduleForm() {
  const [schedule, setSchedule] = useState({
    hour: "",
    minute: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false); // Estado para saber si se está editando

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchedule({
      ...schedule,
      [name]: value,
    });
  };

  // Función para cargar el horario si estamos en modo de edición
  const loadSchedule = useCallback(async (id) => {
    const res = await fetch(`${apiUrl}/schedules/${id}/`, {
      credentials: "include",
    });
    const data = await res.json();
    setSchedule(data);
    setEditing(true);
  }, [apiUrl]);

  useEffect(() => {
    if (params.id) {
      loadSchedule(params.id);
    } else {
      setEditing(false);
      setSchedule({
        hour: "",
        minute: "",
      });
    }
  }, [params.id, loadSchedule]);

  // Validación de hora y minutos para que estén en rangos válidos
  const isValidTime = () => {
    const { hour, minute } = schedule;
    const hourInt = parseInt(hour);
    const minuteInt = parseInt(minute);

    if (isNaN(hourInt) || isNaN(minuteInt)) {
      return false;
    }

    return hourInt >= 0 && hourInt < 24 && minuteInt >= 0 && minuteInt < 60;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isValidTime()) {
      alert("Por favor ingresa una hora y minuto válidos.");
      setLoading(false);
      return;
    }

    try {
      if (editing) {
        await fetch(`${apiUrl}/schedules/${params.id}/`, {
          credentials: "include",
          method: "PUT",
          body: JSON.stringify(schedule),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setEditing(false);
      } else {
        const newSchedule = await fetch(`${apiUrl}/schedules/`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify(schedule),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Nuevo horario creado", newSchedule);
      }

      setLoading(false);
      navigate("/schedules");
    } catch (error) {
      console.error("Error al enviar los datos al backend:", error);
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Horario" : "Agregar Horario"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Hora</Form.Label>
          <Form.Control
            type="number"
            name="hour"
            value={schedule.hour}
            onChange={handleChange}
            placeholder="Ingresa la hora (0-23)"
            className="my-input"
            min="0"
            max="23"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Minuto</Form.Label>
          <Form.Control
            type="number"
            name="minute"
            value={schedule.minute}
            onChange={handleChange}
            placeholder="Ingresa el minuto (0-59)"
            className="my-input"
            min="0"
            max="59"
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ position: "relative" }}
        >
          {editing ? (
            "Editar"
          ) : loading ? (
            <Spinner
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            "Guardar"
          )}
        </Button>
      </Form>
    </Container>
  );
}
