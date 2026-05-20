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

const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const initialForm = {
  nombre: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "borrador",
  prioridad: 1,
  tipo: "general",
};

const CampaniaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) cargarCampania();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarCampania = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/campanias/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo cargar la campaña");
        return;
      }

      const c = data.data;

      setForm({
        nombre: c.nombre || "",
        descripcion: c.descripcion || "",
        fecha_inicio: toInputDateTime(c.fecha_inicio),
        fecha_fin: toInputDateTime(c.fecha_fin),
        estado: c.estado || "borrador",
        prioridad: c.prioridad || 1,
        tipo: c.tipo || "general",
      });
    } catch (err) {
      console.error("[CampaniaForm cargarCampania]", err);
      setError("Error de conexión al cargar campaña");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validar = () => {
    if (!form.nombre.trim()) {
      setError("El nombre de la campaña es obligatorio");
      return false;
    }

    if (!form.fecha_inicio) {
      setError("La fecha de inicio es obligatoria");
      return false;
    }

    if (form.fecha_fin && new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio");
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    nombre: form.nombre,
    descripcion: form.descripcion,
    fecha_inicio: form.fecha_inicio ? new Date(form.fecha_inicio) : null,
    fecha_fin: form.fecha_fin ? new Date(form.fecha_fin) : null,
    estado: form.estado,
    prioridad: Number(form.prioridad || 1),
    tipo: form.tipo,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = isEdit
        ? `${API_URL}/fidelizacion/admin/campanias/${id}`
        : `${API_URL}/fidelizacion/admin/campanias`;

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
        setError(data.message || "No se pudo guardar la campaña");
        return;
      }

      setSuccess(data.message || "Campaña guardada correctamente");

      setTimeout(() => {
        navigate("/fidelizacion/campanias");
      }, 600);
    } catch (err) {
      console.error("[CampaniaForm handleSubmit]", err);
      setError("Error de conexión al guardar campaña");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando campaña...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h3 className="fw-bold mb-1">
        {isEdit ? "Editar Campaña" : "Nueva Campaña"}
      </h3>
      <p className="text-muted">
        Configurá la campaña activa que utilizará la ruleta.
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
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="borrador">Borrador</option>
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                    <option value="finalizada">Finalizada</option>
                    <option value="cancelada">Cancelada</option>
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

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha inicio *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="fecha_inicio"
                    value={form.fecha_inicio}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha fin</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="fecha_fin"
                    value={form.fecha_fin}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Prioridad</Form.Label>
                  <Form.Control
                    type="number"
                    name="prioridad"
                    value={form.prioridad}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="general">General</option>
                    <option value="por_comercio">Por comercio</option>
                    <option value="por_sucursal">Por sucursal</option>
                    <option value="por_zona">Por zona</option>
                    <option value="evento_especial">Evento especial</option>
                  </Form.Select>
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
                onClick={() => navigate("/fidelizacion/campanias")}
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

export default CampaniaForm;