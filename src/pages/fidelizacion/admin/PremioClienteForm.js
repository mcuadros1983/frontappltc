import React, { useEffect, useMemo, useState } from "react";
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
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const initialForm = {
  campania_id: "",
  articulo_id: "",
  nombre: "",
  descripcion: "",
  tipo_premio: "siga_participando",
  valor: "",
  probabilidad: 0,
  prioridad: 1,
  stock_total: "",
  stock_diario: "",
  ilimitado: true,
  vence_cupon: false,
  dias_vencimiento_cupon: 7,
  puntos_otorga_comercio: 0,
  estado: "activo",
};

const PremioClienteForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const queryCampaniaId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("campania_id") || "";
  }, [location.search]);

  const [form, setForm] = useState({
    ...initialForm,
    campania_id: queryCampaniaId,
  });

  const [campanias, setCampanias] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    cargarCampanias();

    if (isEdit) {
      cargarPremio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarCampanias = async () => {
    try {
      const response = await fetch(`${API_URL}/fidelizacion/admin/campanias`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setCampanias(data.data || []);
      }
    } catch (err) {
      console.error("[PremioClienteForm cargarCampanias]", err);
    }
  };

  const cargarPremio = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/fidelizacion/admin/premios-clientes/${id}`,
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

      const p = data.data;

      setForm({
        campania_id: p.campania_id || "",
        articulo_id: p.articulo_id || "",
        nombre: p.nombre || "",
        descripcion: p.descripcion || "",
        tipo_premio: p.tipo_premio || "siga_participando",
        valor: p.valor || "",
        probabilidad: p.probabilidad || 0,
        prioridad: p.prioridad || 1,
        stock_total: p.stock_total || "",
        stock_diario: p.stock_diario || "",
        ilimitado: p.ilimitado ?? false,
        vence_cupon: p.vence_cupon ?? true,
        dias_vencimiento_cupon: p.dias_vencimiento_cupon || 7,
        puntos_otorga_comercio: p.puntos_otorga_comercio || 0,
        estado: p.estado || "activo",
      });
    } catch (err) {
      console.error("[PremioClienteForm cargarPremio]", err);
      setError("Error de conexión al cargar premio");
    } finally {
      setLoading(false);
    }
  };

  const aplicarDefaultsPorTipo = (tipo) => {
    if (tipo === "siga_participando") {
      return {
        valor: "",
        ilimitado: true,
        vence_cupon: false,
        puntos_otorga_comercio: 0,
        stock_total: "",
        stock_diario: "",
      };
    }

    return {
      ilimitado: false,
      vence_cupon: true,
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "tipo_premio") {
      setForm((prev) => ({
        ...prev,
        tipo_premio: value,
        ...aplicarDefaultsPorTipo(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validar = () => {
    if (!form.campania_id) {
      setError("Seleccioná una campaña");
      return false;
    }

    if (!form.nombre.trim()) {
      setError("El nombre del premio es obligatorio");
      return false;
    }

    const prob = Number(form.probabilidad);

    if (Number.isNaN(prob) || prob < 0 || prob > 100) {
      setError("La probabilidad debe estar entre 0 y 100");
      return false;
    }

    if (form.tipo_premio !== "siga_participando" && !form.ilimitado) {
      if (!form.stock_total && !form.stock_diario) {
        setError(
          "Para premios limitados, cargá stock total, stock diario o marcá ilimitado"
        );
        return false;
      }
    }

    return true;
  };

  const buildPayload = () => ({
    campania_id: Number(form.campania_id),
    articulo_id: form.articulo_id ? Number(form.articulo_id) : null,
    nombre: form.nombre,
    descripcion: form.descripcion,
    tipo_premio: form.tipo_premio,
    valor: form.valor === "" ? null : Number(form.valor),
    probabilidad: Number(form.probabilidad || 0),
    prioridad: Number(form.prioridad || 1),
    stock_total: form.stock_total === "" ? null : Number(form.stock_total),
    stock_diario: form.stock_diario === "" ? null : Number(form.stock_diario),
    ilimitado: Boolean(form.ilimitado),
    vence_cupon: Boolean(form.vence_cupon),
    dias_vencimiento_cupon: Number(form.dias_vencimiento_cupon || 7),
    puntos_otorga_comercio: Number(form.puntos_otorga_comercio || 0),
    estado: form.estado,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = isEdit
        ? `${API_URL}/fidelizacion/admin/premios-clientes/${id}`
        : `${API_URL}/fidelizacion/admin/premios-clientes`;

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
        navigate(
          form.campania_id
            ? `/fidelizacion/premios-clientes?campania_id=${form.campania_id}`
            : "/fidelizacion/premios-clientes"
        );
      }, 600);
    } catch (err) {
      console.error("[PremioClienteForm handleSubmit]", err);
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

  const esSigaParticipando = form.tipo_premio === "siga_participando";

  return (
    <Container fluid className="py-4">
      <h3 className="fw-bold mb-1">
        {isEdit ? "Editar Premio" : "Nuevo Premio"}
      </h3>
      <p className="text-muted">
        Definí probabilidad, stock, vencimiento y puntos que otorga al comercio.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Campaña *</Form.Label>
                  <Form.Select
                    name="campania_id"
                    value={form.campania_id}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">Seleccionar campaña</option>
                    {campanias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de premio</Form.Label>
                  <Form.Select
                    name="tipo_premio"
                    value={form.tipo_premio}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="siga_participando">Siga participando</option>
                    <option value="producto">Producto</option>
                    <option value="descuento_porcentaje">
                      Descuento porcentaje
                    </option>
                    <option value="descuento_monto">Descuento monto</option>
                    <option value="combo">Combo</option>
                    <option value="beneficio">Beneficio</option>
                  </Form.Select>
                </Form.Group>
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
                    <option value="finalizado">Finalizado</option>
                  </Form.Select>
                </Form.Group>
              </Col>

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
                  <Form.Label>ID artículo ERP</Form.Label>
                  <Form.Control
                    type="number"
                    name="articulo_id"
                    value={form.articulo_id}
                    onChange={handleChange}
                    disabled={saving || esSigaParticipando}
                    placeholder="Opcional"
                  />
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
                  <Form.Label>Valor</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="valor"
                    value={form.valor}
                    onChange={handleChange}
                    disabled={saving || esSigaParticipando}
                    placeholder="5, 10, 1000..."
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Probabilidad %</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="probabilidad"
                    value={form.probabilidad}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
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

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Puntos comercio</Form.Label>
                  <Form.Control
                    type="number"
                    name="puntos_otorga_comercio"
                    value={form.puntos_otorga_comercio}
                    onChange={handleChange}
                    disabled={saving || esSigaParticipando}
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

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock diario</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_diario"
                    value={form.stock_diario}
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
                  label="Premio ilimitado"
                  disabled={saving || esSigaParticipando}
                />
              </Col>

              <Col md={3} className="pt-md-4">
                <Form.Check
                  className="mt-md-3"
                  name="vence_cupon"
                  checked={form.vence_cupon}
                  onChange={handleChange}
                  label="Cupón vence"
                  disabled={saving || esSigaParticipando}
                />
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Días vencimiento cupón</Form.Label>
                  <Form.Control
                    type="number"
                    name="dias_vencimiento_cupon"
                    value={form.dias_vencimiento_cupon}
                    onChange={handleChange}
                    disabled={saving || !form.vence_cupon || esSigaParticipando}
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
                onClick={() =>
                  navigate(
                    form.campania_id
                      ? `/fidelizacion/premios-clientes?campania_id=${form.campania_id}`
                      : "/fidelizacion/premios-clientes"
                  )
                }
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

export default PremioClienteForm;