// src/components/proyectos/ProyectoForm.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

const ProyectoForm = () => {
  const [proyecto, setProyecto] = useState({ descripcion: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  // ⬇️ Contexto global de proyectos
  const dataCtx = useContext(Contexts.DataContext) || {};
  const { proyectosTabla = [], setProyectosTabla } = dataCtx;

  const handleCancel = () => navigate("/proyectos");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProyecto((prev) => ({ ...prev, [name]: value }));
  };

  const loadProyecto = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/proyectos/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setProyecto(data);
      setEditing(true);
    },
    [apiUrl]
  );

  useEffect(() => {
    if (params.id) {
      loadProyecto(params.id);
    } else {
      setEditing(false);
      setProyecto({ descripcion: "" });
    }
  }, [params.id, loadProyecto]);

  // ⬇️ Inserta/actualiza en el contexto y ordena por descripción
  const upsertProyectoEnContexto = (guardado) => {
    if (!setProyectosTabla || !guardado) return;

    setProyectosTabla((prev) => {
      const lista = Array.isArray(prev) ? [...prev] : [];
      const idNuevo = Number(guardado.id ?? params.id);
      const idx = lista.findIndex((p) => Number(p.id) === idNuevo);

      const merged = {
        ...(idx >= 0 ? lista[idx] : {}),
        ...guardado,
        id: idNuevo,
      };

      if (idx >= 0) lista[idx] = merged;
      else lista.push(merged);

      lista.sort((a, b) =>
        String(a?.descripcion || "").localeCompare(String(b?.descripcion || ""))
      );
      return lista;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editing
      ? `${apiUrl}/proyectos/${params.id}`
      : `${apiUrl}/proyectos`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        body: JSON.stringify(proyecto),
        headers: { "Content-Type": "application/json" },
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "No se pudo guardar el proyecto");

      // Actualiza contexto con lo devuelto (o con el estado local si no hay body)
      upsertProyectoEnContexto(body || proyecto);

      navigate("/proyectos");
    } catch (err) {
      console.error("❌ Guardando proyecto:", err);
      alert(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Proyecto" : "Agregar Proyecto"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={proyecto.descripcion}
            onChange={handleChange}
            placeholder="Descripción del proyecto"
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

export default ProyectoForm;
