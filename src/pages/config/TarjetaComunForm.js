// src/components/tesoreria/TarjetaComunForm.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

const TarjetaComunForm = () => {
  const dataCtx = useContext(Contexts.DataContext) || {};
  const {
    // ⬇️ tablas para selects
    tiposTarjetaTabla = [],
    marcasTarjetaTabla = [],
    empresasTabla = [],
    bancosTabla = [],
    // ⬇️ tabla y setter global que debemos actualizar
    tarjetasTesoreriaTabla = [],
    setTarjetasTesoreriaTabla,
  } = dataCtx;

  const navigate = useNavigate();
  const params = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [tarjeta, setTarjeta] = useState({
    terminacion: "",
    tipotarjeta_id: "",
    marca_id: "",
    empresa_id: "",
    banco_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleCancel = () => navigate("/tarjetas-comunes");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTarjeta((prev) => ({ ...prev, [name]: value }));
  };

  const loadTarjeta = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/tarjetas-comunes/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setTarjeta(data);
      setEditing(true);
    },
    [apiUrl]
  );

  useEffect(() => {
    if (params.id) {
      loadTarjeta(params.id);
    } else {
      setEditing(false);
      setTarjeta({
        terminacion: "",
        tipotarjeta_id: "",
        marca_id: "",
        empresa_id: "",
        banco_id: "",
      });
    }
  }, [params.id, loadTarjeta]);

  // ⬇️ Inserta/actualiza en el contexto y ordena por terminación (string)
  const upsertTarjetaEnContexto = (guardado) => {
    if (!setTarjetasTesoreriaTabla || !guardado) return;

    setTarjetasTesoreriaTabla((prev) => {
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
        String(a?.terminacion || "").localeCompare(String(b?.terminacion || ""))
      );
      return lista;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${apiUrl}/tarjetas-comunes/${params.id}`
      : `${apiUrl}/tarjetas-comunes`;

    try {
      const res = await fetch(url, {
        credentials: "include",
        method,
        body: JSON.stringify(tarjeta),
        headers: { "Content-Type": "application/json" },
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || "No se pudo guardar la tarjeta");
      }

      // ⬇️ Actualiza el contexto global (alta/edición)
      upsertTarjetaEnContexto(body || tarjeta);

      navigate("/tarjetas-comunes");
    } catch (err) {
      console.error("❌ Guardando tarjeta:", err);
      alert(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Tarjeta" : "Agregar Tarjeta"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Terminación (4 dígitos)</Form.Label>
          <Form.Control
            type="text"
            name="terminacion"
            value={tarjeta.terminacion}
            onChange={handleChange}
            placeholder="1234"
            className="my-input"
            maxLength={4}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tipo de Tarjeta</Form.Label>
          <Form.Select
            name="tipotarjeta_id"
            value={tarjeta.tipotarjeta_id}
            onChange={handleChange}
            className="form-control my-input"
            required
          >
            <option value="">Seleccione...</option>
            {tiposTarjetaTabla.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Marca</Form.Label>
          <Form.Select
            name="marca_id"
            value={tarjeta.marca_id}
            onChange={handleChange}
            className="form-control my-input"
            required
          >
            <option value="">Seleccione...</option>
            {marcasTarjetaTabla.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Empresa</Form.Label>
          <Form.Select
            name="empresa_id"
            value={tarjeta.empresa_id}
            onChange={handleChange}
            className="form-control my-input"
            required
          >
            <option value="">Seleccione...</option>
            {empresasTabla.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.descripcion}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Banco</Form.Label>
          <Form.Select
            name="banco_id"
            value={tarjeta.banco_id}
            onChange={handleChange}
            className="form-control my-input"
            required
          >
            <option value="">Seleccione...</option>
            {bancosTabla.map((banco) => (
              <option key={banco.id} value={banco.id}>
                {banco.descripcion}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            style={{ marginRight: "8px" }}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : editing ? (
              "Editar"
            ) : (
              "Guardar"
            )}
          </Button>
          {editing && (
            <Button variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </Form>
    </Container>
  );
};

export default TarjetaComunForm;
