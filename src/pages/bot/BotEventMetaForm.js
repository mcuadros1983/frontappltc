import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";
import {
  createBotEventMeta,
  getBotEventMetaById,
  updateBotEventMeta,
} from "../../services/botApi";

const initialForm = {
  tipo_evento: "comunicado",
  titulo: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  hora_inicio: "",
  hora_fin: "",
  sucursal_id: "",
  aplica_todas_sucursales: true,
  condiciones: "",
  mensaje_bot: "",
  aliases: [],
  activo_bot: true,
  prioridad: 0,
  impacto: "normal",
};

const tiposEvento = [
  { value: "degustacion", label: "Degustación" },
  { value: "sorteo", label: "Sorteo" },
  { value: "feriado_abierto", label: "Feriado abierto" },
  { value: "feriado_cerrado", label: "Feriado cerrado" },
  { value: "cierre_sucursal", label: "Cierre sucursal" },
  { value: "cierre_general", label: "Cierre general" },
  { value: "horario_especial", label: "Horario especial" },
  { value: "evento_infantil", label: "Evento infantil" },
  { value: "capacitacion", label: "Capacitación" },
  { value: "comunicado", label: "Comunicado" },
  { value: "otro", label: "Otro" },
];

const BotEventMetaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const dataContext = useContext(Contexts.DataContext);
  const sucursales = dataContext?.sucursales || [];

  const [form, setForm] = useState(initialForm);
  const [newAlias, setNewAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!isEdit) return;

      try {
        setLoading(true);
        setError("");

        const res = await getBotEventMetaById(id);

        if (!res.ok) {
          throw new Error(res.error || "No se pudo obtener el evento");
        }

        const row = res.data;

        setForm({
          tipo_evento: row.tipo_evento || "comunicado",
          titulo: row.titulo || "",
          descripcion: row.descripcion || "",
          fecha_inicio: row.fecha_inicio || "",
          fecha_fin: row.fecha_fin || "",
          hora_inicio: row.hora_inicio || "",
          hora_fin: row.hora_fin || "",
          sucursal_id: row.sucursal_id || "",
          aplica_todas_sucursales: Boolean(row.aplica_todas_sucursales),
          condiciones: row.condiciones || "",
          mensaje_bot: row.mensaje_bot || "",
          aliases: Array.isArray(row.aliases) ? row.aliases : [],
          activo_bot: Boolean(row.activo_bot),
          prioridad: row.prioridad ?? 0,
          impacto: row.impacto || "normal",
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar evento");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "tipo_evento" && value === "cierre_general") {
        next.aplica_todas_sucursales = true;
        next.sucursal_id = "";
      }

      return next;
    });
  };

  const addAlias = () => {
    const clean = newAlias.trim();
    if (!clean) return;

    setForm((prev) => ({
      ...prev,
      aliases: prev.aliases.some(
        (a) => a.toLowerCase() === clean.toLowerCase()
      )
        ? prev.aliases
        : [...prev.aliases, clean],
    }));

    setNewAlias("");
  };

  const removeAlias = (alias) => {
    setForm((prev) => ({
      ...prev,
      aliases: prev.aliases.filter((a) => a !== alias),
    }));
  };

  const buildPayload = () => ({
    tipo_evento: form.tipo_evento,
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim() || null,
    fecha_inicio: form.fecha_inicio,
    fecha_fin: form.fecha_fin || form.fecha_inicio,
    hora_inicio: form.hora_inicio || null,
    hora_fin: form.hora_fin || null,
    sucursal_id: form.aplica_todas_sucursales ? null : form.sucursal_id || null,
    aplica_todas_sucursales: Boolean(form.aplica_todas_sucursales),
    condiciones: form.condiciones.trim() || null,
    mensaje_bot: form.mensaje_bot.trim() || null,
    aliases: form.aliases,
    activo_bot: Boolean(form.activo_bot),
    prioridad: Number(form.prioridad || 0),
    impacto: form.impacto || "normal",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!form.tipo_evento) {
      setError("El tipo de evento es obligatorio.");
      return;
    }

    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!form.fecha_inicio) {
      setError("La fecha de inicio es obligatoria.");
      return;
    }

    if (!form.aplica_todas_sucursales && !form.sucursal_id) {
      setError("Debe seleccionar una sucursal o marcar que aplica a todas.");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      const res = isEdit
        ? await updateBotEventMeta(id, payload)
        : await createBotEventMeta(payload);

      if (!res.ok) {
        throw new Error(res.error || "No se pudo guardar");
      }

      setMensaje("Evento guardado correctamente.");

      setTimeout(() => {
        navigate("/bot/event-meta");
      }, 600);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar evento");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4 text-center">
            <Spinner animation="border" size="sm" className="me-2" />
            Cargando...
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 className="mb-1">
                {isEdit ? "Editar evento del bot" : "Nuevo evento del bot"}
              </h3>
              <p className="text-muted mb-0">
                Cargá sorteos, degustaciones, feriados, cierres, capacitaciones y horarios especiales.
              </p>
            </div>

            <Button
              variant="outline-secondary"
              onClick={() => navigate("/bot/event-meta")}
              style={{ borderRadius: "10px" }}
            >
              Volver
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {mensaje && <Alert variant="success">{mensaje}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tipo de evento</Form.Label>
                  <Form.Select
                    name="tipo_evento"
                    value={form.tipo_evento}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  >
                    {tiposEvento.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Título</Form.Label>
                  <Form.Control
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Sorteo Día del Trabajador"
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Descripción interna</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción para uso interno..."
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Row className="g-3">
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Fecha inicio</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_inicio"
                    value={form.fecha_inicio}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Fecha fin</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_fin"
                    value={form.fecha_fin}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Hora inicio</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_inicio"
                    value={form.hora_inicio}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Hora fin</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_fin"
                    value={form.hora_fin}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Impacto</Form.Label>

                  <Form.Select
                    name="impacto"
                    value={form.impacto}
                    onChange={handleChange}
                  >
                    <option value="normal">Normal</option>
                    <option value="horario_reducido">Horario reducido</option>
                    <option value="cerrado">Cerrado</option>
                  </Form.Select>

                  <Form.Text muted>
                    Define cómo afecta este evento a la atención de la sucursal.
                  </Form.Text>
                </Form.Group>

              </Col>
            </Row>

            <Card className="border-0 bg-light mb-3">
              <Card.Body>
                <Row className="g-3 align-items-end">
                  <Col md={5}>
                    <Form.Check
                      type="switch"
                      id="aplica_todas_sucursales_event"
                      name="aplica_todas_sucursales"
                      label="Aplica a todas las sucursales"
                      checked={form.aplica_todas_sucursales}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col md={7}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Sucursal específica</Form.Label>
                      <Form.Select
                        name="sucursal_id"
                        value={form.sucursal_id}
                        onChange={handleChange}
                        disabled={form.aplica_todas_sucursales}
                        style={{ borderRadius: "10px" }}
                      >
                        <option value="">Seleccionar sucursal...</option>
                        {sucursales.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre || s.descripcion || `Sucursal ${s.id}`}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Condiciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="condiciones"
                value={form.condiciones}
                onChange={handleChange}
                placeholder="Ej: Participan compras superiores a $10.000 / solo ese día / hasta agotar stock..."
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mensaje que responderá el bot</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="mensaje_bot"
                value={form.mensaje_bot}
                onChange={handleChange}
                placeholder="Ej: Este sábado tendremos degustación de productos elaborados en la sucursal..."
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Aliases / cómo pregunta el cliente</Form.Label>
              <InputGroup>
                <Form.Control
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="Ej: feriado, abren hoy, sorteo, degustación, día del niño..."
                  style={{ borderRadius: "10px 0 0 10px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAlias();
                    }
                  }}
                />
                <Button
                  variant="outline-dark"
                  onClick={addAlias}
                  style={{ borderRadius: "0 10px 10px 0" }}
                >
                  Agregar
                </Button>
              </InputGroup>

              <div className="mt-2">
                {form.aliases.length === 0 ? (
                  <span className="text-muted small">Sin aliases cargados.</span>
                ) : (
                  form.aliases.map((alias, index) => (
                    <Badge
                      key={`${alias}-${index}`}
                      bg="primary"
                      className="me-2 mb-2"
                      style={{
                        cursor: "pointer",
                        padding: "8px 10px",
                        borderRadius: "10px",
                      }}
                      onClick={() => removeAlias(alias)}
                    >
                      {alias} ×
                    </Badge>
                  ))
                )}
              </div>
            </Form.Group>

            <Row className="g-3">
              <Col md={4}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Prioridad</Form.Label>
                  <Form.Control
                    type="number"
                    name="prioridad"
                    value={form.prioridad}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={8} className="d-flex align-items-center">
                <Form.Check
                  type="switch"
                  id="activo_bot_event"
                  name="activo_bot"
                  label="Activo para respuestas del bot"
                  checked={form.activo_bot}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate("/bot/event-meta")}
                disabled={saving}
                style={{ borderRadius: "10px" }}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                style={{ borderRadius: "10px" }}
              >
                {saving ? "Guardando..." : "Guardar evento"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BotEventMetaForm;