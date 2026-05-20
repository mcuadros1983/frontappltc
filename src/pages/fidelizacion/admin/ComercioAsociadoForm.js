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
  nombre_fantasia: "",
  razon_social: "",
  documento_tipo: "CUIT",
  documento_numero: "",
  domicilio: "",
  telefono: "",
  email: "",
  lat: "",
  lon: "",
  radio_metros: 80,
  estado: "activo",
  habilitado: true,
  permite_multiples_participaciones: false,
  limite_participaciones_diarias: 1,
  limite_premios_diarios: "",
  observaciones: "",
  generar_qr: true,
};

const ComercioAsociadoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) {
      cargarComercio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarComercio = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/comercios/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "No se pudo cargar el comercio");
        return;
      }

      const comercio = data.data;

      setForm({
        nombre_fantasia: comercio.nombre_fantasia || "",
        razon_social: comercio.razon_social || "",
        documento_tipo: comercio.documento_tipo || "CUIT",
        documento_numero: comercio.documento_numero || "",
        domicilio: comercio.domicilio || "",
        telefono: comercio.telefono || "",
        email: comercio.email || "",
        lat: comercio.lat || "",
        lon: comercio.lon || "",
        radio_metros: comercio.radio_metros || 80,
        estado: comercio.estado || "activo",
        habilitado: comercio.habilitado ?? true,
        permite_multiples_participaciones:
          comercio.permite_multiples_participaciones ?? false,
        limite_participaciones_diarias:
          comercio.limite_participaciones_diarias || 1,
        limite_premios_diarios: comercio.limite_premios_diarios || "",
        observaciones: comercio.observaciones || "",
        generar_qr: false,
      });
    } catch (err) {
      console.error("[ComercioAsociadoForm cargarComercio]", err);
      setError("Error de conexión al cargar comercio");
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

  const obtenerUbicacionActual = () => {
    if (!navigator.geolocation) {
      setError("El navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }));
      },
      () => {
        setError("No se pudo obtener la ubicación actual");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const validar = () => {
    if (!form.nombre_fantasia.trim()) {
      setError("El nombre de fantasía es obligatorio");
      return false;
    }

    if (!form.documento_numero.trim()) {
      setError("El CUIT/DNI es obligatorio");
      return false;
    }

    if (!form.domicilio.trim()) {
      setError("El domicilio es obligatorio");
      return false;
    }

    if (!form.lat || !form.lon) {
      setError("Latitud y longitud son obligatorias");
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    ...form,
    radio_metros: Number(form.radio_metros || 80),
    limite_participaciones_diarias: Number(
      form.limite_participaciones_diarias || 1
    ),
    limite_premios_diarios:
      form.limite_premios_diarios === ""
        ? null
        : Number(form.limite_premios_diarios),
    lat: Number(form.lat),
    lon: Number(form.lon),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = isEdit
        ? `${API_URL}/fidelizacion/admin/comercios/${id}`
        : `${API_URL}/fidelizacion/admin/comercios`;

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
        setError(data.message || "No se pudo guardar el comercio");
        return;
      }

      setSuccess(data.message || "Comercio guardado correctamente");

      const comercioId = data.data?.comercio?.id || data.data?.id || id;

      setTimeout(() => {
        navigate(`/fidelizacion/comercios/${comercioId}/qr`);
      }, 600);
    } catch (err) {
      console.error("[ComercioAsociadoForm handleSubmit]", err);
      setError("Error de conexión al guardar comercio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando comercio...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h3 className="fw-bold mb-1">
        {isEdit ? "Editar Comercio Asociado" : "Nuevo Comercio Asociado"}
      </h3>
      <p className="text-muted">
        Cargá los datos del comercio donde se instalará el QR.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de fantasía *</Form.Label>
                  <Form.Control
                    name="nombre_fantasia"
                    value={form.nombre_fantasia}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Razón social</Form.Label>
                  <Form.Control
                    name="razon_social"
                    value={form.razon_social}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo documento</Form.Label>
                  <Form.Select
                    name="documento_tipo"
                    value={form.documento_tipo}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="CUIT">CUIT</option>
                    <option value="DNI">DNI</option>
                    <option value="OTRO">OTRO</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Número *</Form.Label>
                  <Form.Control
                    name="documento_numero"
                    value={form.documento_numero}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Domicilio *</Form.Label>
                  <Form.Control
                    name="domicilio"
                    value={form.domicilio}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Latitud *</Form.Label>
                  <Form.Control
                    name="lat"
                    value={form.lat}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Longitud *</Form.Label>
                  <Form.Control
                    name="lon"
                    value={form.lon}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Radio GPS metros</Form.Label>
                  <Form.Control
                    type="number"
                    name="radio_metros"
                    value={form.radio_metros}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="d-flex align-items-end mb-3">
                <Button
                  variant="outline-primary"
                  className="w-100"
                  type="button"
                  onClick={obtenerUbicacionActual}
                  disabled={saving}
                >
                  Usar ubicación actual
                </Button>
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
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                    <option value="bloqueado">Bloqueado</option>
                    <option value="pendiente">Pendiente</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Participaciones diarias</Form.Label>
                  <Form.Control
                    type="number"
                    name="limite_participaciones_diarias"
                    value={form.limite_participaciones_diarias}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Premios diarios</Form.Label>
                  <Form.Control
                    type="number"
                    name="limite_premios_diarios"
                    value={form.limite_premios_diarios}
                    onChange={handleChange}
                    placeholder="Ilimitado"
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="pt-md-4">
                <Form.Check
                  className="mt-md-3"
                  name="habilitado"
                  checked={form.habilitado}
                  onChange={handleChange}
                  label="Habilitado"
                  disabled={saving}
                />
              </Col>

              <Col md={6}>
                <Form.Check
                  className="mb-3"
                  name="permite_multiples_participaciones"
                  checked={form.permite_multiples_participaciones}
                  onChange={handleChange}
                  label="Permite múltiples participaciones por día"
                  disabled={saving}
                />
              </Col>

              {!isEdit && (
                <Col md={6}>
                  <Form.Check
                    className="mb-3"
                    name="generar_qr"
                    checked={form.generar_qr}
                    onChange={handleChange}
                    label="Generar QR automáticamente"
                    disabled={saving}
                  />
                </Col>
              )}

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="observaciones"
                    value={form.observaciones}
                    onChange={handleChange}
                    disabled={saving}
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
                onClick={() => navigate("/fidelizacion/comercios")}
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

export default ComercioAsociadoForm;