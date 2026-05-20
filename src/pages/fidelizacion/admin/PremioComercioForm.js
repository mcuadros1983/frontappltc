import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const initialForm = {
  nombre: "",
  descripcion: "",
  tipo_premio: "producto",
  costo_puntos: 0,
  stock_total: "",
  ilimitado: true,
  estado: "activo",
  imagen_url: "",
};

const PremioComercioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) {
      cargarPremio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarPremio = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/premios-comercios`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo cargar el premio");
        return;
      }

      setPremios(data.data || []);

      const premio = (data.data || []).find((p) => String(p.id) === String(id));

      if (!premio) {
        setError("Premio no encontrado");
        return;
      }

      setForm({
        nombre: premio.nombre || "",
        descripcion: premio.descripcion || "",
        tipo_premio: premio.tipo_premio || "producto",
        costo_puntos: premio.costo_puntos || 0,
        stock_total: premio.stock_total || "",
        ilimitado: premio.ilimitado ?? true,
        estado: premio.estado || "activo",
        imagen_url: premio.imagen_url || "",
      });
    } catch (err) {
      console.error("[PremioComercioForm cargarPremio]", err);
      setError("Error de conexión al cargar premio");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validar = () => {
    if (!form.nombre.trim()) {
      setError("El nombre del premio es obligatorio");
      return false;
    }

    if (Number(form.costo_puntos) <= 0) {
      setError("El costo en puntos debe ser mayor a 0");
      return false;
    }

    if (!form.ilimitado && !form.stock_total) {
      setError("Si no es ilimitado, cargá stock total");
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    nombre: form.nombre,
    descripcion: form.descripcion,
    tipo_premio: form.tipo_premio,
    costo_puntos: Number(form.costo_puntos || 0),
    stock_total: form.ilimitado ? null : Number(form.stock_total || 0),
    ilimitado: Boolean(form.ilimitado),
    estado: form.estado,
    imagen_url: form.imagen_url || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = isEdit
        ? `${API_URL}/fidelizacion/admin/premios-comercios/${id}`
        : `${API_URL}/fidelizacion/admin/premios-comercios`;

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload()),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo guardar el premio");
        return;
      }

      setSuccess(data.message || "Premio guardado correctamente");

      setTimeout(() => {
        navigate("/fidelizacion/premios-comercios");
      }, 600);
    } catch (err) {
      console.error("[PremioComercioForm handleSubmit]", err);
      setError("Error de conexión al guardar premio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando premio...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h3 className="fw-bold mb-1">
        {isEdit ? "Editar Premio Comercio" : "Nuevo Premio Comercio"}
      </h3>
      <p className="text-muted">
        Definí los premios que los comercios podrán solicitar con sus puntos.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    name="tipo_premio"
                    value={form.tipo_premio}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="producto">Producto</option>
                    <option value="combo">Combo</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="orden_compra">Orden de compra</option>
                    <option value="descuento">Descuento</option>
                    <option value="beneficio">Beneficio</option>
                    <option value="publicidad">Publicidad</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Costo en puntos *</Form.Label>
                  <Form.Control
                    type="number"
                    name="costo_puntos"
                    value={form.costo_puntos}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock total</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_total"
                    value={form.stock_total}
                    onChange={handleChange}
                    disabled={saving || form.ilimitado}
                    placeholder="Ilimitado"
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="pt-md-4">
                <Form.Check
                  className="mt-md-3"
                  name="ilimitado"
                  checked={form.ilimitado}
                  onChange={handleChange}
                  label="Ilimitado"
                  disabled={saving}
                />
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="agotado">Agotado</option>
                    <option value="inactivo">Inactivo</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>URL imagen</Form.Label>
                  <Form.Control
                    name="imagen_url"
                    value={form.imagen_url}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Opcional"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>

              <Button
                type="button"
                variant="outline-secondary"
                disabled={saving}
                onClick={() => navigate("/fidelizacion/premios-comercios")}
              >
                Volver
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PremioComercioForm;