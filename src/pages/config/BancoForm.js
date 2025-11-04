import React, { useEffect, useState, useCallback, useContext } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

const BancoForm = () => {
  const [banco, setBanco] = useState({
    descripcion: "",
    cuenta: "",
    alias: "",
    empresa_id: "",      // 👈 nuevo en el estado
  });

  const { bancosTabla = [], setBancosTabla, empresasTabla = [] } =
    useContext(Contexts.DataContext) || {};

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => navigate("/banks");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBanco((prev) => ({ ...prev, [name]: value }));
  };

  const loadBanco = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/bancos/${id}`, { credentials: "include" });
      const data = await res.json();
      setBanco({
        descripcion: data.descripcion || "",
        cuenta: data.cuenta || "",
        alias: data.alias || "",
        empresa_id: data.empresa_id ?? "", // 👈 mantener controlado
      });
      setEditing(true);
    },
    [apiUrl]
  );

  useEffect(() => {
    if (params.id) {
      loadBanco(params.id);
    } else {
      setEditing(false);
      setBanco({ descripcion: "", cuenta: "", alias: "", empresa_id: "" });
    }
  }, [params.id, loadBanco]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const url = editing ? `${apiUrl}/bancos/${params.id}` : `${apiUrl}/bancos`;

    // 👇 normalizar empresa_id
    const payload = {
      ...banco,
      empresa_id:
        banco.empresa_id === "" || banco.empresa_id == null
          ? null
          : Number(banco.empresa_id),
    };

    try {
      const res = await fetch(url, {
        credentials: "include",
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const saved = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (saved && (saved.error || saved.message)) || "No se pudo guardar el banco";
        throw new Error(msg);
      }

      // 🔄 Sincronizar contexto inmediatamente
      if (typeof setBancosTabla === "function" && saved) {
        setBancosTabla((prev) => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const idx = list.findIndex((b) => b.id === saved.id);
          if (idx >= 0) list[idx] = saved;
          else list.push(saved);
          list.sort((a, b) => a.id - b.id);
          return list;
        });
      }

      navigate("/banks");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Banco" : "Agregar Banco"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={banco.descripcion}
            onChange={handleChange}
            placeholder="Ej: Banco Nación"
            className="my-input"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cuenta</Form.Label>
          <Form.Control
            type="text"
            name="cuenta"
            value={banco.cuenta}
            onChange={handleChange}
            placeholder="CBU o Nro. de cuenta"
            className="my-input"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Alias</Form.Label>
          <Form.Control
            type="text"
            name="alias"
            value={banco.alias}
            onChange={handleChange}
            placeholder="Alias del banco"
            className="my-input"
          />
        </Form.Group>

        {/* 👇 Nuevo: selección de empresa */}
        <Form.Group className="mb-3">
          <Form.Label>Empresa</Form.Label>
          <Form.Select
            name="empresa_id"
            value={banco.empresa_id ?? ""}
            onChange={handleChange}
            className="form-control my-input"
          >
            <option value="">(Sin empresa)</option>
            {empresasTabla.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre || e.razon_social || e.descripcion || `Empresa ${e.id}`}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading} style={{ marginRight: "5px" }}>
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

export default BancoForm;
