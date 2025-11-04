import { useState, useEffect } from "react";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

export default function ConciliacionRubroForm() {
  const [rubro, setRubro] = useState({ descripcion: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleChange = (e) => {
    setRubro({ ...rubro, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/conciliacion-rubros/${params.id}`
      : `${apiUrl}/conciliacion-rubros`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(rubro),
    });

    setLoading(false);
    navigate("/conciliacion-rubros");
  };

  const loadRubro = async () => {
    const res = await fetch(`${apiUrl}/conciliacion-rubros/${params.id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setRubro(data);
    setEditing(true);
  };

  useEffect(() => {
    if (params.id) loadRubro();
  }, [params.id]);

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Rubro de Conciliación" : "Nuevo Rubro de Conciliación"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={rubro.descripcion}
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
          <Button variant="secondary" onClick={() => navigate("/conciliacion-rubros")} className="ms-2">
            Cancelar
          </Button>
        )}
      </Form>
    </Container>
  );
}
