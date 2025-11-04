// src/components/tesoreria/TipoComprobanteForm.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

const TipoComprobanteForm = () => {
  const [tipo, setTipo] = useState({ descripcion: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  // ⬇️ Contexto: lista global y setter
  const dataCtx = useContext(Contexts.DataContext) || {};
  const { tiposComprobanteTabla = [], setTiposComprobanteTabla } = dataCtx;

  const handleCancel = () => navigate("/tipos-comprobantes");

  const handleChange = (e) => {
    setTipo({ ...tipo, [e.target.name]: e.target.value });
  };

  const loadTipo = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/tipos-comprobantes/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setTipo(data);
      setEditing(true);
    },
    [apiUrl]
  );

  useEffect(() => {
    if (params.id) {
      loadTipo(params.id);
    } else {
      setEditing(false);
      setTipo({ descripcion: "" });
    }
  }, [params.id, loadTipo]);

  // ⬇️ Upsert + ordenar por descripción
  const upsertTipoEnContexto = (guardado) => {
    if (!setTiposComprobanteTabla || !guardado) return;

    setTiposComprobanteTabla((prev) => {
      const lista = Array.isArray(prev) ? [...prev] : [];
      const idNuevo = Number(guardado.id ?? params.id);
      const idx = lista.findIndex((t) => Number(t.id) === idNuevo);

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
      ? `${apiUrl}/tipos-comprobantes/${params.id}`
      : `${apiUrl}/tipos-comprobantes`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        body: JSON.stringify(tipo),
        headers: { "Content-Type": "application/json" },
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || "No se pudo guardar el tipo de comprobante");
      }

      // ⬇️ Actualiza contexto
      upsertTipoEnContexto(body || tipo);

      navigate("/tipos-comprobantes");
    } catch (err) {
      alert(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Tipo de Comprobante" : "Agregar Tipo de Comprobante"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={tipo.descripcion}
            onChange={handleChange}
            placeholder="Ej: Factura, Recibo, Nota de Crédito"
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

export default TipoComprobanteForm;
