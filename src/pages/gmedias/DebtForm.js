import React, { useContext, useEffect, useState } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { createAuthenticatedRequest } from "../../utils/createAuthenticatedRequest";
import Contexts from "../../context/Contexts";

export default function DebtForm() {
  const location = useLocation();

  const [debt, setDebt] = useState({
    monto_total: "",
    forma_cobro: "",
    descripcion_cobro: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDebt({
      ...debt,
      [name]: value,
    });
  };

  const context = useContext(Contexts.userContext);
  const navigate = useNavigate();
  const params = useParams();

  const loadDebt = async (id) => {
    const res = await fetch(`${apiUrl}/cobranzas/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setDebt(data);
    setEditing(true);
  };

  useEffect(() => {
    if (params.id) {
      loadDebt(params.id);
    } else {
      setEditing(false);
      setDebt({
        monto_total: "",
        forma_cobro: "",
        descripcion_cobro: "",
      });
    }
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editing) {
      await fetch(`${apiUrl}/cobranzas/${params.id}`, {
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(debt),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setEditing(false);
    } else {
      await fetch(`${apiUrl}/cobranzas/`, {
        credentials: "include",
        method: "POST",
        body: JSON.stringify(debt),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    setLoading(false);
    navigate("/accounts/new"); // Redirige a la lista de cobranzas después de guardar o editar
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta cobranza?"
    );
    if (!confirmDelete) {
      return;
    }
    try {
      setLoading(true);
      // Realiza la solicitud para eliminar la cobranza
      await fetch(`${apiUrl}/cobranzas/${params.id}`, {
        credentials: "include",
        method: "DELETE",
      });
      setLoading(false);
      navigate("/accounts/new"); // Redirige a la lista de cobranzas después de eliminar
    } catch (error) {
      console.error("Error al eliminar la cobranza:", error);
      setLoading(false);
      // Maneja el error aquí
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {context.user && context.user.usuario === "admin"
          ? "Editar Cobranza"
          : "Cobranza"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Monto Total</Form.Label>
          <Form.Control
            type="number"
            name="monto_total"
            value={debt.monto_total}
            onChange={handleChange}
            placeholder="Ingresa el monto total"
            className="my-input"
            min="0" // Establecer el valor mínimo como 0
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Forma de Cobro</Form.Label>
          <Form.Select
            value={debt.forma_cobro}
            onChange={handleChange}
            name="forma_cobro"
            className="form-control" // Agrega la clase form-control de Bootstrap
          >
            <option value="">Seleccionar forma de cobro</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción del Cobro</Form.Label>
          <Form.Control
            type="text"
            name="descripcion_cobro"
            value={debt.descripcion_cobro}
            onChange={handleChange}
            placeholder="Ingresa la descripción del cobro"
            className="my-input"
          />
        </Form.Group>
        {context.user && context.user.usuario === "admin" && (
          <>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              style={{ position: "relative", marginRight: "10px" }} // Añade margen derecho
            >
              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Editar"
              )}
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Eliminar"
              )}
            </Button>
          </>
        )}
      </Form>
    </Container>
  );
}
