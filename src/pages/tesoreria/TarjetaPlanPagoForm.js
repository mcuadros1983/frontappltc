// src/components/tesoreria/TarjetaPlanPagoForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const TarjetaPlanPagoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // ⬇️ Contexto: actualizar lista global de planes
  const dataCtx = useContext(Contexts.DataContext) || {};
  const {
    planTarjetaTesoreriaTabla = [],
    setPlanTarjetaTesoreriaTabla,
  } = dataCtx;

  const [form, setForm] = useState({
    nombre: "",
    cuotas: 1,
    tipo_calculo: "coeficiente",
    coeficiente: "",
    tasa_mensual: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`${apiUrl}/tarjeta-planes/${id}`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setForm({
            nombre: data.nombre ?? "",
            cuotas: Number(data.cuotas ?? 1),
            tipo_calculo: data.tipo_calculo ?? "coeficiente",
            coeficiente: data.coeficiente ?? "",
            tasa_mensual: data.tasa_mensual ?? "",
          });
        })
        .catch(() => setError("Error al obtener el plan"));
    }
  }, [id, apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // convertir numéricos donde corresponde
    if (name === "cuotas") {
      setForm((f) => ({ ...f, [name]: value === "" ? "" : Number(value) }));
    } else if (name === "coeficiente" || name === "tasa_mensual") {
      setForm((f) => ({ ...f, [name]: value })); // el backend lo castea
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const validar = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (!form.cuotas || Number(form.cuotas) < 1) return "Cuotas debe ser >= 1";
    if (
      form.tipo_calculo === "coeficiente" &&
      (form.coeficiente === "" || form.coeficiente === null)
    )
      return "Coeficiente es requerido cuando el cálculo es por coeficiente";
    if (
      form.tipo_calculo === "tasa" &&
      (form.tasa_mensual === "" || form.tasa_mensual === null)
    )
      return "Tasa mensual es requerida cuando el cálculo es por tasa";
    return null;
  };

  // ⬇️ Upsert en contexto y ordenar por nombre (y cuotas)
  const upsertPlanEnContexto = (guardado) => {
    if (!setPlanTarjetaTesoreriaTabla || !guardado) return;

    setPlanTarjetaTesoreriaTabla((prev) => {
      const lista = Array.isArray(prev) ? [...prev] : [];
      const idNuevo = Number(guardado.id ?? id);
      const idx = lista.findIndex((p) => Number(p.id) === idNuevo);

      const merged = {
        ...(idx >= 0 ? lista[idx] : {}),
        ...guardado,
        id: idNuevo,
      };

      if (idx >= 0) lista[idx] = merged;
      else lista.push(merged);

      lista.sort(
        (a, b) =>
          String(a?.nombre || "").localeCompare(String(b?.nombre || "")) ||
          Number(a?.cuotas || 0) - Number(b?.cuotas || 0)
      );
      return lista;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validar();
    if (err) return setError(err);

    const payload = {
      ...form,
      // limpiar el campo no usado según tipo_calculo (opcional pero prolijo)
      coeficiente: form.tipo_calculo === "coeficiente" ? form.coeficiente : null,
      tasa_mensual: form.tipo_calculo === "tasa" ? form.tasa_mensual : null,
    };

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${apiUrl}/tarjeta-planes/${id}` : `${apiUrl}/tarjeta-planes`;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || "Error al guardar");
      }

      // ⬇️ Actualiza el contexto con el plan guardado
      upsertPlanEnContexto(body || payload);

      navigate("/tarjeta-planes");
    } catch (err2) {
      setError(err2.message);
    }
  };

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <Card.Title>{id ? "Editar" : "Nuevo"} Plan de Tarjeta</Card.Title>
          {mensaje && <Alert variant="success">{mensaje}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder='Ej: "Ahora 12"'
                required
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Cuotas</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  step={1}
                  name="cuotas"
                  value={form.cuotas}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Tipo de cálculo</Form.Label>
                <Form.Select
                  name="tipo_calculo"
                  value={form.tipo_calculo}
                  onChange={handleChange}
                  className="form-control my-input"
                >
                  <option value="coeficiente">Coeficiente</option>
                  <option value="tasa">Tasa mensual</option>
                </Form.Select>
              </Form.Group>

              {form.tipo_calculo === "coeficiente" && (
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Coeficiente</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.000001"
                    name="coeficiente"
                    value={form.coeficiente}
                    onChange={handleChange}
                    placeholder="Ej: 1.234567"
                    required
                  />
                </Form.Group>
              )}

              {form.tipo_calculo === "tasa" && (
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Tasa mensual</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.0001"
                    name="tasa_mensual"
                    value={form.tasa_mensual}
                    onChange={handleChange}
                    placeholder="Ej: 5.2500"
                    required
                  />
                </Form.Group>
              )}
            </div>

            <Button className="mt-2" type="submit" variant="primary">
              Guardar
            </Button>
            <Button
              className="mt-2 ms-2"
              variant="secondary"
              onClick={() => navigate("/tarjeta-planes")}
            >
              Cancelar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TarjetaPlanPagoForm;
