// LibroIVAForm.jsx
import React, { useEffect, useState, useContext } from "react";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";
import "../../components/css/LibroIVAForm.css"; // ⬅️ nuevo

const LibroIVAForm = () => {
  const { empresasTabla, setLibrosIvaTabla, librosIvaTabla } = useContext(Contexts.DataContext);

  const [libro, setLibro] = useState({ mes: "", anio: "", empresa_id: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (params.id) {
      fetch(`${apiUrl}/librosiva/${params.id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setLibro(data);
          setEditing(true);
        });
    }
  }, [params.id, apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLibro((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const endpoint = editing ? `${apiUrl}/librosiva/${params.id}` : `${apiUrl}/librosiva`;

    try {
      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(libro),
      });

      const nuevoLibro = await res.json();

      if (editing) {
        setLibrosIvaTabla(librosIvaTabla.map((l) => (l.id === nuevoLibro.id ? nuevoLibro : l)));
      } else {
        setLibrosIvaTabla([...librosIvaTabla, nuevoLibro]);
      }

      navigate("/librosiva");
    } catch (error) {
      console.error("Error al guardar libro IVA:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="ivaform-page d-flex flex-column align-items-center">
      <h1 className="my-4 ivaform-title">
        {editing ? "Editar Libro IVA" : "Agregar Libro IVA"}
      </h1>

      <div className="ivaform-card w-50">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Mes</Form.Label>
            <Form.Control
              type="number"
              name="mes"
              value={libro.mes}
              onChange={handleChange}
              min="1"
              max="12"
              placeholder="Ej: 7"
              className="my-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              name="anio"
              value={libro.anio}
              onChange={handleChange}
              placeholder="Ej: 2025"
              className="my-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Empresa</Form.Label>
            <select
              name="empresa_id"
              value={libro.empresa_id}
              onChange={handleChange}
              className="form-control my-input"
            >
              <option value="">Seleccione una empresa</option>
              {empresasTabla.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.descripcion}
                </option>
              ))}
            </select>
          </Form.Group>

          <div className="d-flex align-items-center gap-2">
            <Button type="submit" variant="primary" disabled={loading} className="ivaform-btn">
              {loading ? <Spinner size="sm" animation="border" /> : editing ? "Guardar cambios" : "Crear"}
            </Button>
            {editing && (
              <Button variant="outline-secondary" onClick={() => navigate("/librosiva")} className="ivaform-btn-secondary">
                Cancelar
              </Button>
            )}
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default LibroIVAForm;
