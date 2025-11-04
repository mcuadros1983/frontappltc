import { useState, useEffect } from "react";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

export default function ConciliacionCuentaForm() {
  const [cuenta, setCuenta] = useState({ descripcion: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleChange = (e) => {
    setCuenta({ ...cuenta, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/conciliacion-cuentas/${params.id}`
      : `${apiUrl}/conciliacion-cuentas`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(cuenta),
    });

    setLoading(false);
    navigate("/conciliacion-cuentas");
  };

  const loadCuenta = async () => {
    const res = await fetch(`${apiUrl}/conciliacion-cuentas/${params.id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setCuenta(data);
    setEditing(true);
  };

  useEffect(() => {
    if (params.id) loadCuenta();
  }, [params.id]);

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Cuenta de Conciliación" : "Nueva Cuenta de Conciliación"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={cuenta.descripcion}
            onChange={handleChange}
            className="my-input"
            placeholder="Ingrese la descripción"
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : editing ? "Editar" : "Guardar"}
        </Button>
        {editing && (
          <Button
            variant="secondary"
            onClick={() => navigate("/conciliacion-cuentas")}
            className="ms-2"
          >
            Cancelar
          </Button>
        )}
      </Form>
    </Container>
  );
}
