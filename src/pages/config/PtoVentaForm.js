// src/components/tesoreria/PtoVentaForm.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

const PtoVentaForm = () => {
  const [ptoVenta, setPtoVenta] = useState({ descripcion: "", empresa_id: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const { empresasTabla = [], ptosVentaTabla = [], setPtosVentaTabla } =
    useContext(Contexts.DataContext) || {};

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const params = useParams();

  const handleCancel = () => navigate("/ptos-venta");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPtoVenta((prev) => ({ ...prev, [name]: value }));
  };

  const loadPtoVenta = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/ptos-venta/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setPtoVenta({
        descripcion: data.descripcion || "",
        empresa_id: data.empresa_id ?? "",
      });
      setEditing(true);
    },
    [apiUrl]
  );

  useEffect(() => {
    if (params.id) {
      loadPtoVenta(params.id);
    } else {
      setEditing(false);
      setPtoVenta({ descripcion: "", empresa_id: "" });
    }
  }, [params.id, loadPtoVenta]);

  // ⬇️ Upsert en contexto + ordenar por descripción (y por id como desempate)
  const upsertPtoVentaEnContexto = (guardado) => {
    if (!setPtosVentaTabla || !guardado) return;

    setPtosVentaTabla((prev) => {
      const list = Array.isArray(prev) ? [...prev] : [];
      const idNuevo = Number(guardado.id ?? params.id);
      const idx = list.findIndex((p) => Number(p.id) === idNuevo);

      const merged = {
        ...(idx >= 0 ? list[idx] : {}),
        ...guardado,
        id: idNuevo,
      };

      if (idx >= 0) list[idx] = merged;
      else list.push(merged);

      list.sort(
        (a, b) =>
          String(a?.descripcion || "").localeCompare(String(b?.descripcion || "")) ||
          Number(a.id) - Number(b.id)
      );
      return list;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editing
      ? `${apiUrl}/ptos-venta/${params.id}`
      : `${apiUrl}/ptos-venta`;
    const method = editing ? "PUT" : "POST";

    const payload = {
      ...ptoVenta,
      empresa_id:
        ptoVenta.empresa_id === "" || ptoVenta.empresa_id == null
          ? null
          : Number(ptoVenta.empresa_id),
    };

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const saved = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (saved && (saved.error || saved.message)) ||
          "No se pudo guardar el Punto de Venta";
        throw new Error(msg);
      }

      // 🔄 Actualizar contexto inmediatamente
      upsertPtoVentaEnContexto(saved || payload);

      navigate("/ptos-venta");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {editing ? "Editar Punto de Venta" : "Agregar Punto de Venta"}
      </h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={ptoVenta.descripcion}
            onChange={handleChange}
            placeholder="Nombre o número del punto de venta"
            className="my-input"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Empresa</Form.Label>
          <Form.Select
            name="empresa_id"
            value={ptoVenta.empresa_id ?? ""}
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

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          style={{ marginRight: "5px" }}
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
      </Form>
    </Container>
  );
};

export default PtoVentaForm;
