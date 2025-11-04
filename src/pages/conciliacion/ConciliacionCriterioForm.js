import React, { useState, useEffect, useContext } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

export default function ConciliacionCriterioForm() {
  const context = useContext(Contexts.DataContext);
  const [criterio, setCriterio] = useState({
    operacion: "",
    criterio: "",
    rubro_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCriterio({ ...criterio, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/conciliacion-criterios/${params.id}`
      : `${apiUrl}/conciliacion-criterios`;

    await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(criterio),
    });

    setLoading(false);
    navigate("/conciliacion-criterios");
  };

  const handleCancel = () => navigate("/conciliacion-criterios");

  const loadCriterio = async (id) => {
    const res = await fetch(`${apiUrl}/conciliacion-criterios/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setCriterio(data);
    setEditing(true);
  };

  useEffect(() => {
    if (params.id) loadCriterio(params.id);
    else setEditing(false);
  }, [params.id]);

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar" : "Nuevo"} Criterio de Conciliación
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Operación</Form.Label>
          <Form.Control
            name="operacion"
            value={criterio.operacion}
            onChange={handleChange}
            required
            className="my-input"
            placeholder="Ej. DEBITO, CREDITO"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Criterio</Form.Label>
          <Form.Control
            name="criterio"
            value={criterio.criterio}
            onChange={handleChange}
            required
            className="my-input"
            placeholder="Texto o expresión"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Rubro Asociado</Form.Label>
          <Form.Select
            name="rubro_id"
            value={criterio.rubro_id}
            onChange={handleChange}
            className="form-control my-input"
            required
          >
            <option value="">Seleccione un rubro</option>
            {context.rubrosTabla.map((rubro) => (
              <option key={rubro.id} value={rubro.id}>
                {rubro.descripcion}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ marginRight: "5px" }}
        >
          {loading ? <Spinner size="sm" animation="border" /> : editing ? "Editar" : "Guardar"}
        </Button>
        {editing && (
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
        )}
      </Form>
    </Container>
  );
}
