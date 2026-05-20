import { useContext, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";
import {
  createBotBenefitMeta,
  getBotBenefitMetaById,
  updateBotBenefitMeta,
} from "../../services/botApi";

const initialForm = {
  tipo_beneficio: "cliente",
  titulo: "",
  descripcion: "",
  porcentaje_descuento: "",
  condiciones: "",
  dias_aplica: [],
  horario_aplica: "",
  sucursal_id: "",
  aplica_todas_sucursales: true,
  medio_pago: "",
  entidad: "",
  mensaje_bot: "",
  aliases: [],
  activo_bot: true,
  prioridad: 0,
};

const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const BotBenefitMetaForm = () => {
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

        const res = await getBotBenefitMetaById(id);

        if (!res.ok) {
          throw new Error(res.error || "No se pudo obtener el beneficio");
        }

        const row = res.data;

        setForm({
          tipo_beneficio: row.tipo_beneficio || "cliente",
          titulo: row.titulo || "",
          descripcion: row.descripcion || "",
          porcentaje_descuento: row.porcentaje_descuento || "",
          condiciones: row.condiciones || "",
          dias_aplica: Array.isArray(row.dias_aplica) ? row.dias_aplica : [],
          horario_aplica: row.horario_aplica || "",
          sucursal_id: row.sucursal_id || "",
          aplica_todas_sucursales: Boolean(row.aplica_todas_sucursales),
          medio_pago: row.medio_pago || "",
          entidad: row.entidad || "",
          mensaje_bot: row.mensaje_bot || "",
          aliases: Array.isArray(row.aliases) ? row.aliases : [],
          activo_bot: Boolean(row.activo_bot),
          prioridad: row.prioridad ?? 0,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar beneficio");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleDia = (dia) => {
    setForm((prev) => ({
      ...prev,
      dias_aplica: prev.dias_aplica.includes(dia)
        ? prev.dias_aplica.filter((d) => d !== dia)
        : [...prev.dias_aplica, dia],
    }));
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
    tipo_beneficio: form.tipo_beneficio,
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim() || null,
    porcentaje_descuento: form.porcentaje_descuento || null,
    condiciones: form.condiciones.trim() || null,
    dias_aplica: form.dias_aplica,
    horario_aplica: form.horario_aplica.trim() || null,
    sucursal_id: form.aplica_todas_sucursales ? null : form.sucursal_id || null,
    aplica_todas_sucursales: Boolean(form.aplica_todas_sucursales),
    medio_pago: form.medio_pago.trim() || null,
    entidad: form.entidad.trim() || null,
    mensaje_bot: form.mensaje_bot.trim() || null,
    aliases: form.aliases,
    activo_bot: Boolean(form.activo_bot),
    prioridad: Number(form.prioridad || 0),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!form.tipo_beneficio) {
      setError("El tipo de beneficio es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      const res = isEdit
        ? await updateBotBenefitMeta(id, payload)
        : await createBotBenefitMeta(payload);

      if (!res.ok) {
        throw new Error(res.error || "No se pudo guardar");
      }

      setMensaje("Beneficio guardado correctamente.");

      setTimeout(() => {
        navigate("/bot/benefit-meta");
      }, 600);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar beneficio");
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
                {isEdit ? "Editar beneficio del bot" : "Nuevo beneficio del bot"}
              </h3>
              <p className="text-muted mb-0">
                Descuentos, convenios, jubilados, tarjetas y reintegros informativos.
              </p>
            </div>

            <Button
              variant="outline-secondary"
              onClick={() => navigate("/bot/benefit-meta")}
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
                  <Form.Label className="fw-semibold">Tipo de beneficio</Form.Label>
                  <Form.Select
                    name="tipo_beneficio"
                    value={form.tipo_beneficio}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="medio_pago">Medio de pago</option>
                    <option value="convenio">Convenio</option>
                    <option value="reintegro">Reintegro</option>
                    <option value="otro">Otro</option>
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
                    placeholder="Ej: Descuento jubilados"
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Porcentaje descuento</Form.Label>
                  <Form.Control
                    type="number"
                    name="porcentaje_descuento"
                    value={form.porcentaje_descuento}
                    onChange={handleChange}
                    placeholder="Ej: 15"
                    style={{ borderRadius: "10px" }}
                  />
                  <Form.Text className="text-muted">
                    Dejalo vacío si es reintegro externo o informativo.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Medio de pago</Form.Label>
                  <Form.Control
                    name="medio_pago"
                    value={form.medio_pago}
                    onChange={handleChange}
                    placeholder="Ej: Tarjeta Naranja"
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Entidad</Form.Label>
                  <Form.Control
                    name="entidad"
                    value={form.entidad}
                    onChange={handleChange}
                    placeholder="Ej: Naranja, sindicato, banco"
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción interna del beneficio..."
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Condiciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="condiciones"
                value={form.condiciones}
                onChange={handleChange}
                placeholder="Ej: Presentar carnet, aplica sobre precio de lista, reintegro en resumen..."
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Días que aplica</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {diasSemana.map((dia) => (
                  <Button
                    key={dia}
                    type="button"
                    size="sm"
                    variant={form.dias_aplica.includes(dia) ? "primary" : "outline-secondary"}
                    onClick={() => toggleDia(dia)}
                    style={{ borderRadius: "10px" }}
                  >
                    {dia}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Horario que aplica</Form.Label>
                  <Form.Control
                    name="horario_aplica"
                    value={form.horario_aplica}
                    onChange={handleChange}
                    placeholder="Ej: Todo el día / de 9 a 13"
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Sucursal</Form.Label>
                  <Form.Check
                    type="switch"
                    id="aplica_todas_sucursales"
                    name="aplica_todas_sucursales"
                    label="Aplica a todas las sucursales"
                    checked={form.aplica_todas_sucursales}
                    onChange={handleChange}
                    className="mb-2"
                  />

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

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Aliases / cómo pregunta el cliente</Form.Label>
              <InputGroup>
                <Form.Control
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="Ej: jubilados, naranja, reintegro, sindicato..."
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
                      style={{ cursor: "pointer", padding: "8px 10px", borderRadius: "10px" }}
                      onClick={() => removeAlias(alias)}
                    >
                      {alias} ×
                    </Badge>
                  ))
                )}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mensaje que responderá el bot</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="mensaje_bot"
                value={form.mensaje_bot}
                onChange={handleChange}
                placeholder="Ej: Los martes tenemos 15% de descuento para jubilados sobre precio de lista."
                style={{ borderRadius: "10px" }}
              />
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
                  id="activo_bot"
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
                onClick={() => navigate("/bot/benefit-meta")}
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
                {saving ? "Guardando..." : "Guardar beneficio"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BotBenefitMetaForm;