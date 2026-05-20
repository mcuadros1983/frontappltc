import { useContext, useEffect, useMemo, useState } from "react";
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
  createBotProductMeta,
  getBotProductMetaById,
  updateBotProductMeta,
} from "../../services/botApi";

const initialForm = {
  articulo_id: "",
  nombre_visible: "",
  descripcion_corta: "",
  platos_recomendados: [],
  metodos_coccion: [],
  terneza: "",
  rendimiento: "",
  precio_nivel: "",
  recomendacion_comercial: "",
  alternativas: [],
  prioridad: 0,
  activo_bot: true,
  tags_busqueda: [],
  aliases: [],
};

const opcionesTerneza = ["muy tierno", "tierno", "intermedio", "firme"];
const opcionesRendimiento = ["alto", "medio", "bajo"];
const opcionesPrecioNivel = ["económico", "intermedio", "premium"];

const BotProductMetaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const dataContext = useContext(Contexts.DataContext);
  const articulosTabla = dataContext?.articulosTabla || [];

  const [form, setForm] = useState(initialForm);
  const [articuloSearch, setArticuloSearch] = useState("");
  const [newPlato, setNewPlato] = useState("");
  const [newCoccion, setNewCoccion] = useState("");
  const [newAlternativa, setNewAlternativa] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const selectedArticulo = useMemo(() => {
    if (!form.articulo_id) return null;

    return articulosTabla.find(
      (art) => String(art.id) === String(form.articulo_id)
    );
  }, [articulosTabla, form.articulo_id]);

  const articulosFiltrados = useMemo(() => {
    const q = articuloSearch.trim().toLowerCase();

    if (!q) {
      return articulosTabla.slice(0, 80);
    }

    return articulosTabla
      .filter((art) => {
        const descripcion = String(art.descripcion || "").toLowerCase();
        const descripcionReducida = String(
          art.descripcionreducida || ""
        ).toLowerCase();
        const codigobarra = String(art.codigobarra || "").toLowerCase();
        const id = String(art.id || "").toLowerCase();

        return (
          descripcion.includes(q) ||
          descripcionReducida.includes(q) ||
          codigobarra.includes(q) ||
          id.includes(q)
        );
      })
      .slice(0, 120);
  }, [articulosTabla, articuloSearch]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!isEdit) return;

      try {
        setLoading(true);
        setError("");

        const res = await getBotProductMetaById(id);

        if (!res.ok) {
          throw new Error(res.error || "No se pudo obtener la metadata");
        }

        const row = res.data;

        if (!ignore) {
          setForm({
            articulo_id: row.articulo_id || "",
            nombre_visible: row.nombre_visible || "",
            descripcion_corta: row.descripcion_corta || "",
            platos_recomendados: Array.isArray(row.platos_recomendados)
              ? row.platos_recomendados
              : [],
            metodos_coccion: Array.isArray(row.metodos_coccion)
              ? row.metodos_coccion
              : [],
            terneza: row.terneza || "",
            rendimiento: row.rendimiento || "",
            precio_nivel: row.precio_nivel || "",
            recomendacion_comercial: row.recomendacion_comercial || "",
            alternativas: Array.isArray(row.alternativas)
              ? row.alternativas
              : [],
            prioridad: row.prioridad ?? 0,
            activo_bot: Boolean(row.activo_bot),
            tags_busqueda: Array.isArray(row.tags_busqueda)
              ? row.tags_busqueda
              : [],
            aliases: Array.isArray(row.aliases) ? row.aliases : [],
          });

          const articulo =
            row.articulo ||
            row.ArticuloTabla ||
            row.Articulotabla ||
            null;

          if (articulo?.descripcion) {
            setArticuloSearch(articulo.descripcion);
          }
        }
      } catch (err) {
        console.error("Error al cargar metadata:", err);
        if (!ignore) {
          setError(err.message || "Error al cargar la metadata");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArticuloSelect = (articuloId) => {
    const articulo = articulosTabla.find(
      (art) => String(art.id) === String(articuloId)
    );

    setForm((prev) => ({
      ...prev,
      articulo_id: articuloId,
      nombre_visible:
        prev.nombre_visible ||
        articulo?.descripcionreducida ||
        articulo?.descripcion ||
        "",
    }));
  };

  const addArrayItem = (field, value, setter) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];

      if (
        current.some(
          (item) => String(item).toLowerCase() === cleanValue.toLowerCase()
        )
      ) {
        return prev;
      }

      return {
        ...prev,
        [field]: [...current, cleanValue],
      };
    });

    setter("");
  };

  const removeArrayItem = (field, itemToRemove) => {
    setForm((prev) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field].filter((item) => item !== itemToRemove)
        : [],
    }));
  };

  const renderArrayEditor = ({
    title,
    description,
    field,
    value,
    setValue,
    placeholder,
    variant,
  }) => {
    const items = Array.isArray(form[field]) ? form[field] : [];

    return (
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">{title}</Form.Label>
        <div className="text-muted small mb-2">{description}</div>

        <InputGroup>
          <Form.Control
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            style={{ borderRadius: "10px 0 0 10px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArrayItem(field, value, setValue);
              }
            }}
          />
          <Button
            variant="outline-dark"
            onClick={() => addArrayItem(field, value, setValue)}
            style={{ borderRadius: "0 10px 10px 0" }}
          >
            Agregar
          </Button>
        </InputGroup>

        <div className="mt-2">
          {items.length === 0 ? (
            <span className="text-muted small">Sin datos cargados.</span>
          ) : (
            items.map((item, index) => (
              <Badge
                key={`${field}-${item}-${index}`}
                bg={variant}
                className="me-2 mb-2"
                style={{
                  fontSize: "13px",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                onClick={() => removeArrayItem(field, item)}
                title="Click para quitar"
              >
                {item} ×
              </Badge>
            ))
          )}
        </div>
      </Form.Group>
    );
  };

  const validar = () => {
    if (!form.articulo_id) {
      return "Debe seleccionar un artículo real de ArticuloTabla.";
    }

    if (!form.nombre_visible.trim()) {
      return "El nombre visible es obligatorio.";
    }

    if (!form.descripcion_corta.trim()) {
      return "La descripción corta es obligatoria.";
    }

    if (!Array.isArray(form.metodos_coccion) || form.metodos_coccion.length === 0) {
      return "Debe cargar al menos un método de cocción.";
    }

    if (
      !Array.isArray(form.platos_recomendados) ||
      form.platos_recomendados.length === 0
    ) {
      return "Debe cargar al menos un plato recomendado.";
    }

    return null;
  };

  const buildPayload = () => ({
    articulo_id: Number(form.articulo_id),
    nombre_visible: form.nombre_visible.trim(),
    descripcion_corta: form.descripcion_corta.trim(),
    platos_recomendados: form.platos_recomendados,
    metodos_coccion: form.metodos_coccion,
    terneza: form.terneza || null,
    rendimiento: form.rendimiento || null,
    precio_nivel: form.precio_nivel || null,
    recomendacion_comercial: form.recomendacion_comercial.trim() || null,
    alternativas: form.alternativas,
    aliases: form.aliases,
    prioridad: Number(form.prioridad || 0),
    activo_bot: Boolean(form.activo_bot),
    tags_busqueda: form.tags_busqueda,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    const validationError = validar();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      const res = isEdit
        ? await updateBotProductMeta(id, payload)
        : await createBotProductMeta(payload);

      if (!res.ok) {
        throw new Error(res.error || "No se pudo guardar la metadata");
      }

      setMensaje("Metadata guardada correctamente.");

      setTimeout(() => {
        navigate("/bot/product-meta");
      }, 600);
    } catch (err) {
      console.error("Error al guardar metadata:", err);
      setError(err.message || "Error al guardar la metadata");
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
            Cargando metadata...
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
                {isEdit ? "Editar metadata del bot" : "Nueva metadata del bot"}
              </h3>
              <p className="text-muted mb-0">
                Vinculá un artículo real del ERP con información comercial para que el bot pueda asesorar mejor.
              </p>
            </div>

            <Button
              variant="outline-secondary"
              onClick={() => navigate("/bot/product-meta")}
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
                <h5 className="mb-3">Artículo vinculado del ERP</h5>

                <Row className="g-3">
                  <Col md={7}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Buscar artículo de ArticuloTabla
                      </Form.Label>
                      <Form.Control
                        value={articuloSearch}
                        onChange={(e) => setArticuloSearch(e.target.value)}
                        placeholder="Buscar por descripción, código de barra o ID..."
                        style={{ borderRadius: "10px" }}
                      />
                      <Form.Text className="text-muted">
                        El bot usará este artículo para consultar precios y promociones reales.
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={5}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Artículo seleccionado
                      </Form.Label>
                      <Form.Select
                        name="articulo_id"
                        value={form.articulo_id}
                        onChange={(e) => handleArticuloSelect(e.target.value)}
                        style={{ borderRadius: "10px" }}
                        required
                      >
                        <option value="">Seleccionar artículo...</option>
                        {articulosFiltrados.map((art) => (
                          <option key={art.id} value={art.id}>
                            {art.descripcion} - ID {art.id}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {selectedArticulo && (
                  <Alert variant="secondary" className="mt-3 mb-0">
                    <strong>Artículo:</strong> {selectedArticulo.descripcion}
                    <br />
                    <strong>ID:</strong> {selectedArticulo.id}{" "}
                    <strong className="ms-2">Código:</strong>{" "}
                    {selectedArticulo.codigobarra || "-"}
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Nombre visible</Form.Label>
                  <Form.Control
                    name="nombre_visible"
                    value={form.nombre_visible}
                    onChange={handleChange}
                    placeholder="Ej: Nalga para milanesas"
                    style={{ borderRadius: "10px" }}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Prioridad</Form.Label>
                  <Form.Control
                    type="number"
                    name="prioridad"
                    value={form.prioridad}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  />
                  <Form.Text className="text-muted">
                    Mayor prioridad = se recomienda antes.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Estado</Form.Label>
                  <div className="border rounded p-2 bg-white">
                    <Form.Check
                      type="switch"
                      id="activo_bot"
                      name="activo_bot"
                      label="Activo en el bot"
                      checked={form.activo_bot}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Descripción corta</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion_corta"
                value={form.descripcion_corta}
                onChange={handleChange}
                placeholder="Ej: Corte tierno, ideal para milanesas, bifes finos o comidas rápidas."
                style={{ borderRadius: "10px" }}
                required
              />
            </Form.Group>

            <Row className="g-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Terneza</Form.Label>
                  <Form.Select
                    name="terneza"
                    value={form.terneza}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="">Seleccionar...</option>
                    {opcionesTerneza.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Rendimiento</Form.Label>
                  <Form.Select
                    name="rendimiento"
                    value={form.rendimiento}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="">Seleccionar...</option>
                    {opcionesRendimiento.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Nivel de precio</Form.Label>
                  <Form.Select
                    name="precio_nivel"
                    value={form.precio_nivel}
                    onChange={handleChange}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="">Seleccionar...</option>
                    {opcionesPrecioNivel.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={6}>
                {renderArrayEditor({
                  title: "Métodos de cocción",
                  description: "Ej: horno, parrilla, plancha, olla, guiso.",
                  field: "metodos_coccion",
                  value: newCoccion,
                  setValue: setNewCoccion,
                  placeholder: "Agregar método de cocción...",
                  variant: "info",
                })}
              </Col>

              <Col md={6}>
                {renderArrayEditor({
                  title: "Platos recomendados",
                  description: "Ej: milanesas, estofado, bifes, empanadas.",
                  field: "platos_recomendados",
                  value: newPlato,
                  setValue: setNewPlato,
                  placeholder: "Agregar plato recomendado...",
                  variant: "success",
                })}
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={12}>
                {renderArrayEditor({
                  title: "Nombres alternativos / cómo lo pide el cliente",
                  description:
                    "Ej: lomo vetado, bife angosto sin hueso, corte para bife premium. Esto ayuda al bot a relacionar nombres populares con el artículo real.",
                  field: "aliases",
                  value: newAlias,
                  setValue: setNewAlias,
                  placeholder: "Agregar alias o nombre popular...",
                  variant: "primary",
                })}
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={6}>
                {renderArrayEditor({
                  title: "Alternativas",
                  description: "Otros cortes que el bot puede sugerir como reemplazo.",
                  field: "alternativas",
                  value: newAlternativa,
                  setValue: setNewAlternativa,
                  placeholder: "Agregar alternativa...",
                  variant: "warning",
                })}
              </Col>

              <Col md={6}>
                {renderArrayEditor({
                  title: "Tags de búsqueda",
                  description: "Palabras que ayudan al bot a encontrar este corte.",
                  field: "tags_busqueda",
                  value: newTag,
                  setValue: setNewTag,
                  placeholder: "Ej: milanesa, económico, tierno...",
                  variant: "secondary",
                })}
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Recomendación comercial
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="recomendacion_comercial"
                value={form.recomendacion_comercial}
                onChange={handleChange}
                placeholder="Ej: Recomendalo cuando el cliente busque algo tierno para milanesas. Si quiere cuidar precio, sugerir cuadrada o bola de lomo como alternativa."
                style={{ borderRadius: "10px" }}
              />
              <Form.Text className="text-muted">
                Esta información la usa el bot para asesorar, no para calcular precios.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate("/bot/product-meta")}
                style={{ borderRadius: "10px" }}
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                style={{ borderRadius: "10px" }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar metadata"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BotProductMetaForm;