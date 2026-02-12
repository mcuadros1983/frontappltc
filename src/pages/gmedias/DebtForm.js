import React, { useContext, useEffect, useState, useCallback } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";

export default function DebtForm() {
  const [debt, setDebt] = useState({
    monto_total: "",
    forma_cobro: "",
    descripcion_cobro: "",
    fecha: "",
    cliente_id: null, // guardamos SIEMPRE el id acá (normalizado)
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const context = useContext(Contexts.UserContext);
  const navigate = useNavigate();
  const params = useParams();

  // ✅ Resuelve cliente id venga como venga (snake, camel o anidado)
  const resolveClientId = (obj) =>
    obj?.cliente_id ??
    obj?.clienteId ??
    obj?.cliente?.id ??
    obj?.Cliente?.id ??
    null;

  // ✅ Normaliza fecha a YYYY-MM-DD para input type="date"
  const toDateInputValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10); // "2026-02-12T..." => "2026-02-12"
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDebt((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadDebt = useCallback(
    async (id) => {
      const res = await fetch(`${apiUrl}/cobranzas/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      setDebt((prev) => ({
        ...prev,
        ...data,
        cliente_id: resolveClientId(data),         // ✅ normalizado
        fecha: toDateInputValue(data?.fecha),      // ✅ normalizado
      }));

      setEditing(true);
    },
    [apiUrl]
  );

  useEffect(() => {
    if (params.id) {
      loadDebt(params.id);
    } else {
      setEditing(false);
      setDebt({
        monto_total: "",
        forma_cobro: "",
        descripcion_cobro: "",
        fecha: "",
        cliente_id: null,
      });
    }
  }, [params.id, loadDebt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Guardar cliente ANTES del update (evita /accounts/new?clienteId=null)
    let targetClientId = resolveClientId(debt);

    let result = null;
    try {
      if (editing) {
        const r = await fetch(`${apiUrl}/cobranzas/${params.id}`, {
          credentials: "include",
          method: "PUT",
          body: JSON.stringify(debt),
          headers: { "Content-Type": "application/json" },
        });
        result = await r.json().catch(() => ({}));
      } else {
        const r = await fetch(`${apiUrl}/cobranzas/`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify(debt),
          headers: { "Content-Type": "application/json" },
        });
        result = await r.json().catch(() => ({}));
      }
    } catch (err) {
      console.error("Error al guardar cobranza:", err);
    } finally {
      setLoading(false);
    }

    // ✅ Fallbacks por si el backend no devuelve cliente_id/clienteId
    if (!targetClientId) targetClientId = resolveClientId(result);

    if (!targetClientId && params.id) {
      try {
        const pre = await fetch(`${apiUrl}/cobranzas/${params.id}`, {
          credentials: "include",
        });
        const pj = await pre.json().catch(() => ({}));
        targetClientId = resolveClientId(pj);
      } catch (err) {
        console.error("No se pudo recuperar el clienteId tras guardar:", err);
      }
    }

    navigate(`/accounts/new?clienteId=${targetClientId}`, {
      state: { preselectedClientId: targetClientId, lockClient: true },
    });
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta cobranza?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);

      // ✅ Asegurar cliente antes de borrar
      let targetClientId = resolveClientId(debt);

      if (!targetClientId && params.id) {
        const pre = await fetch(`${apiUrl}/cobranzas/${params.id}`, {
          credentials: "include",
        });
        const pj = await pre.json().catch(() => ({}));
        targetClientId = resolveClientId(pj);
      }

      await fetch(`${apiUrl}/cobranzas/${params.id}`, {
        credentials: "include",
        method: "DELETE",
      });

      setLoading(false);

      navigate("/accounts/new", {
        state: { preselectedClientId: targetClientId, lockClient: true },
      });
    } catch (error) {
      console.error("Error al eliminar la cobranza:", error);
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <h1 className="my-form-title text-center">
        {context.user && context.user.usuario === "admin"
          ? "Editar Cobranza"
          : "Cobranza"}
      </h1>

      <Form onSubmit={handleSubmit} className="w-50">
        {/* Fecha */}
        <Form.Group className="mb-3">
          <Form.Label>Fecha</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={debt.fecha || ""}
            onChange={handleChange}
            className="my-input"
          />
        </Form.Group>

        {/* Monto */}
        <Form.Group className="mb-3">
          <Form.Label>Monto Total</Form.Label>
          <Form.Control
            type="number"
            name="monto_total"
            value={debt.monto_total ?? ""}
            onChange={handleChange}
            placeholder="Ingresa el monto total"
            className="my-input"
          />
        </Form.Group>

        {/* Forma */}
        <Form.Group className="mb-3">
          <Form.Label>Forma de Cobro</Form.Label>
          <Form.Select
            value={debt.forma_cobro ?? ""}
            onChange={handleChange}
            name="forma_cobro"
            className="form-control"
          >
            <option value="">Seleccionar forma de cobro</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Compensacion">Compensacion</option>
          </Form.Select>
        </Form.Group>

        {/* Descripción */}
        <Form.Group className="mb-3">
          <Form.Label>Descripción del Cobro</Form.Label>
          <Form.Control
            type="text"
            name="descripcion_cobro"
            value={debt.descripcion_cobro ?? ""}
            onChange={handleChange}
            placeholder="Ingresa la descripción del cobro"
            className="my-input"
          />
        </Form.Group>

        {context.user && context.user.usuario === "admin" && (
          <>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              style={{ position: "relative", marginRight: "10px" }}
            >
              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Guardar"
              )}
            </Button>

            <Button
              variant="danger"
              type="button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Eliminar"
              )}
            </Button>
          </>
        )}
      </Form>
    </Container>
  );
}
