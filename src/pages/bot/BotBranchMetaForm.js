import { useContext, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Contexts from "../../context/Contexts";
import {
  createBotBranchMeta,
  getBotBranchMetaById,
  updateBotBranchMeta,
} from "../../services/botApi";

const initialForm = {
  sucursal_id: "",
  nombre_visible: "",
  direccion: "",
  google_maps_url: "",
  lat: "",
  lon: "",
  zona: "",
  aliases: [],
  horario_atencion: "",
  telefono: "",
  mensaje_bot: "",
  activo_bot: true,
  prioridad: 0,
};

const BotBranchMetaForm = () => {
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

  const selectedSucursal = useMemo(() => {
    return sucursales.find((s) => String(s.id) === String(form.sucursal_id));
  }, [sucursales, form.sucursal_id]);

  useEffect(() => {
    const loadData = async () => {
      if (!isEdit) return;

      try {
        setLoading(true);
        setError("");

        const res = await getBotBranchMetaById(id);

        if (!res.ok) {
          throw new Error(res.error || "No se pudo obtener la metadata");
        }

        const row = res.data;

        setForm({
          sucursal_id: row.sucursal_id || "",
          nombre_visible: row.nombre_visible || "",
          direccion: row.direccion || "",
          google_maps_url: row.google_maps_url || "",
          lat: row.lat || "",
          lon: row.lon || "",
          zona: row.zona || "",
          aliases: Array.isArray(row.aliases) ? row.aliases : [],
          horario_atencion: row.horario_atencion || "",
          telefono: row.telefono || "",
          mensaje_bot: row.mensaje_bot || "",
          activo_bot: Boolean(row.activo_bot),
          prioridad: row.prioridad ?? 0,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar metadata");
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
    sucursal_id: Number(form.sucursal_id),
    nombre_visible: form.nombre_visible.trim(),
    direccion: form.direccion.trim() || null,
    google_maps_url: form.google_maps_url.trim() || null,
    lat: form.lat || null,
    lon: form.lon || null,
    zona: form.zona.trim() || null,
    aliases: form.aliases,
    horario_atencion: form.horario_atencion.trim() || null,
    telefono: form.telefono.trim() || null,
    mensaje_bot: form.mensaje_bot.trim() || null,
    activo_bot: Boolean(form.activo_bot),
    prioridad: Number(form.prioridad || 0),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!form.sucursal_id) {
      setError("Debe seleccionar una sucursal real del ERP.");
      return;
    }

    if (!form.nombre_visible.trim()) {
      setError("El nombre visible es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      const res = isEdit
        ? await updateBotBranchMeta(id, payload)
        : await createBotBranchMeta(payload);

      if (!res.ok) {
        throw new Error(res.error || "No se pudo guardar");
      }

      setMensaje("Metadata de sucursal guardada correctamente.");

      setTimeout(() => {
        navigate("/bot/branch-meta");
      }, 600);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar metadata");
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
                {isEdit ? "Editar sucursal del bot" : "Nueva sucursal del bot"}
              </h3>
              <p className="text-muted mb-0">
                Información que el bot usa para responder dirección, zona, horarios y ubicación.
              </p>
            </div>

            <Button
              variant="outline-secondary"
              onClick={() => navigate("/bot/branch-meta")}
              style={{ borderRadius: "10px" }}
            >
              Volver
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {mensaje && <Alert variant="success">{mensaje}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Card className="border-0 bg-light mb-4">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Sucursal ERP</Form.Label>
                      <Form.Select
                        name="sucursal_id"
                        value={form.sucursal_id}
                        onChange={handleChange}
                        required
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

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Nombre visible bot</Form.Label>
                      <Form.Control
                        name="nombre_visible"
                        value={form.nombre_visible}
                        onChange={handleChange}
                        placeholder="Ej: Sucursal Virgen del Valle"
                        required
                        style={{ borderRadius: "10px" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {selectedSucursal && (
                  <Alert variant="secondary" className="mt-3 mb-0">
                    <strong>Sucursal vinculada:</strong> {selectedSucursal.nombre}
                    <br />
                    <strong>ID:</strong> {selectedSucursal.id}{" "}
                    <strong className="ms-2">Código:</strong>{" "}
                    {selectedSucursal.codigo || "-"}
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Row className="g-3">
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Dirección exacta</Form.Label>
                  <Form.Control
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Ej: Av. Virgen del Valle Norte 1234"
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Zona</Form.Label>
                  <Form.Control
                    name="zona"
                    value={form.zona}
                    onChange={handleChange}
                    placeholder="Ej: Norte, Centro, Sur"
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Google Maps URL</Form.Label>
                  <Form.Control
                    name="google_maps_url"
                    value={form.google_maps_url}
                    onChange={handleChange}
                    placeholder="Pegá el link de Google Maps"
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Latitud</Form.Label>
                  <Form.Control
                    name="lat"
                    value={form.lat}
                    onChange={handleChange}
                    placeholder="-28.46..."
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Longitud</Form.Label>
                  <Form.Control
                    name="lon"
                    value={form.lon}
                    onChange={handleChange}
                    placeholder="-65.78..."
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Horario de atención</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="horario_atencion"
                    value={form.horario_atencion}
                    onChange={handleChange}
                    placeholder="Ej: Lunes a sábado de 8:30 a 13:30 y de 18:00 a 22:00"
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Teléfono</Form.Label>
                  <Form.Control
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 383..."
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>

                <Form.Group>
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
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Aliases / cómo la pide el cliente</Form.Label>
              <InputGroup>
                <Form.Control
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="Ej: norte, virgen, la de la virgen, sucursal norte..."
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
              <Form.Label className="fw-semibold">Mensaje adicional del bot</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="mensaje_bot"
                value={form.mensaje_bot}
                onChange={handleChange}
                placeholder="Ej: Esta sucursal cuenta con atención rápida para pedidos por WhatsApp."
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="switch"
                id="activo_bot"
                name="activo_bot"
                label="Activa para respuestas del bot"
                checked={form.activo_bot}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate("/bot/branch-meta")}
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
                {saving ? "Guardando..." : "Guardar sucursal"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BotBranchMetaForm;