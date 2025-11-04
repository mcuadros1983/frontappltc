import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const CategoriaEgresoForm = () => {
  const dataContext = useContext(Contexts.DataContext);
  const {
    setCategoriasEgreso,
    imputacionContableTabla = [],
  } = dataContext || {};

  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [imputacionContableId, setImputacionContableId] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const isEdit = Boolean(id);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!isEdit) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/categorias-egreso/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al obtener la categoría");
        const data = await res.json();
        if (!ignore) {
          setNombre(data?.nombre ?? "");
          setImputacionContableId(data?.imputacioncontable_id ?? "");
        }
      } catch (e) {
        if (!ignore) setError(e.message || "Error al obtener la categoría");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [id, apiUrl, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);

    const metodo = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `${apiUrl}/categorias-egreso/${id}`
      : `${apiUrl}/categorias-egreso`;

    try {
      const payload = {
        nombre,
        imputacioncontable_id: imputacionContableId || null,
      };

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload?.error || "Error al guardar");
      }

      const saved = await res.json().catch(() => null);

      const finalItem = saved || {
        id: isEdit ? Number(id) : undefined,
        nombre,
        imputacioncontable_id: imputacionContableId || null,
      };

      if (typeof setCategoriasEgreso === "function") {
        setCategoriasEgreso((prev = []) => {
          if (isEdit) {
            const targetId = finalItem.id ?? Number(id);
            const exists = prev.some(
              (c) => Number(c.id) === Number(targetId)
            );
            if (!exists) return [...prev, { ...finalItem, id: targetId }];
            return prev.map((c) =>
              Number(c.id) === Number(targetId) ? { ...c, ...finalItem } : c
            );
          } else {
            if (finalItem.id == null) {
              const tempId = Date.now();
              return [...prev, { ...finalItem, id: tempId }];
            }
            const exists = prev.some(
              (c) => Number(c.id) === Number(finalItem.id)
            );
            return exists
              ? prev.map((c) =>
                  Number(c.id) === Number(finalItem.id)
                    ? { ...c, ...finalItem }
                    : c
                )
              : [...prev, finalItem];
          }
        });
      }

      setMensaje(isEdit ? "Categoría actualizada" : "Categoría creada");
      navigate("/categoriaegreso");
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <Card.Title>
            {isEdit ? "Editar" : "Nueva"} Categoría de Egreso
          </Card.Title>
          {mensaje && <Alert variant="success">{mensaje}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imputación Contable</Form.Label>
              <Form.Select
                value={imputacionContableId || ""}
                onChange={(e) => setImputacionContableId(e.target.value)}
                required
                disabled={loading}
                    className="form-control my-input"
              >
                <option value="">Seleccione...</option>
                {imputacionContableTabla.map((imp) => (
                  <option key={imp.id} value={imp.id}>
                    {imp.descripcion}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button
              className="mt-2"
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              className="mt-2 ms-2"
              variant="secondary"
              onClick={() => navigate("/categoriaegreso")}
              disabled={loading}
            >
              Cancelar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CategoriaEgresoForm;
