// src/components/proveedores/ProveedorForm.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

const ProveedorForm = () => {
  const [proveedor, setProveedor] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  // ⬇️ Contexto global
  const dataCtx = useContext(Contexts.DataContext) || {};
  const { proveedoresTabla = [], setProveedoresTabla } = dataCtx;

  const handleCancel = () => navigate("/proveedores");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProveedor((prev) => ({ ...prev, [name]: value }));
  };

  const loadProveedor = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/proveedores/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setProveedor(data);
      setEditing(true);
    },
    [apiUrl]
  );

  useEffect(() => {
    if (params.id) {
      loadProveedor(params.id);
    } else {
      setEditing(false);
      setProveedor({
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
      });
    }
  }, [params.id, loadProveedor]);

  // ⬇️ Inserta/actualiza en el contexto y ordena por nombre
  const upsertProveedorEnContexto = (guardado) => {
    if (!setProveedoresTabla || !guardado) return;

    setProveedoresTabla((prev) => {
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

      // Ordenar por nombre (fallback a descripcion)
      lista.sort((a, b) =>
        String(a?.nombre || a?.descripcion || "")
          .localeCompare(String(b?.nombre || b?.descripcion || ""))
      );
      return lista;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editing
      ? `${apiUrl}/proveedores/${params.id}`
      : `${apiUrl}/proveedores`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        credentials: "include",
        method,
        body: JSON.stringify(proveedor),
        headers: { "Content-Type": "application/json" },
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "No se pudo guardar el proveedor");

      // Actualiza el contexto con la respuesta del backend (preferida) o con lo editado
      upsertProveedorEnContexto(body || proveedor);

      navigate("/proveedores");
    } catch (err) {
      console.error("❌ Guardando proveedor:", err);
      alert(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Proveedor" : "Agregar Proveedor"}
      </h1>

      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={proveedor.nombre}
            onChange={handleChange}
            placeholder="Nombre del proveedor"
            className="my-input"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            name="direccion"
            value={proveedor.direccion}
            onChange={handleChange}
            placeholder="Dirección del proveedor"
            className="my-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={proveedor.telefono}
            onChange={handleChange}
            placeholder="Teléfono de contacto"
            className="my-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={proveedor.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            className="my-input"
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

export default ProveedorForm;
