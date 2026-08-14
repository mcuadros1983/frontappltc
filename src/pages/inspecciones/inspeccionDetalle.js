import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Spinner,
  Alert,
  Accordion,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useSecurity } from "../../security/SecurityContext";
import { inspeccionesApi } from "../../services/inspeccionesApi";

const estadoVariant = (estado) => {
  if (estado === "APROBADA" || estado === "CERRADA") return "success";
  if (estado === "EN_REVISION") return "info";
  if (estado === "RECHAZADA" || estado === "REABIERTA") return "danger";
  if (estado === "EN_TRABAJO") return "warning";
  return "secondary";
};

const criticidadVariant = (criticidad) => {
  if (criticidad === "CRITICA") return "danger";
  if (criticidad === "ALTA") return "warning";
  if (criticidad === "MEDIA") return "primary";
  return "secondary";
};

const agruparPorCategoria = (respuestas = []) => {
  const mapa = {};

  respuestas.forEach((r) => {
    const categoria = r.categoria_nombre || "Sin categoría";

    if (!mapa[categoria]) {
      mapa[categoria] = [];
    }

    mapa[categoria].push(r);
  });

  return Object.entries(mapa).map(([categoria, items]) => ({
    categoria,
    items,
  }));
};

const InspeccionDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, can } = useSecurity();

  const [inspeccion, setInspeccion] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const esInspector =
    can("inspecciones:edit") ||
    can("inspecciones:admin") ||
    Number(user?.rol_id) === 1;

  const puedeRevisar =
    can("inspecciones:review") ||
    can("inspecciones:admin") ||
    Number(user?.rol_id) === 1;

  const esSucursal =
    !esInspector &&
    Number(user?.sucursal_id) === Number(inspeccion?.sucursal_id);

  const cargar = async () => {

    console.log("CARGANDO");
    try {
      setLoading(true);
      setError("");
      const data = await inspeccionesApi.obtener(id);

      setInspeccion(data);
      setRespuestas(Array.isArray(data.respuestas) ? data.respuestas : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Error cargando inspección."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("USER", user);
    console.log("INSPECCION", inspeccion);
    console.log("USE EFFECT");
    cargar();
  }, [id]);

  const grupos = useMemo(() => agruparPorCategoria(respuestas), [respuestas]);

  // const grupos =
  //   agruparPorCategoria(respuestas);

  const actualizarLocal = (respuestaId, field, value) => {
    console.log(
      "ACTUALIZAR",
      respuestaId,
      field,
      value
    );
    setRespuestas((prev) =>
      prev.map((r) =>
        Number(r.id) === Number(respuestaId)
          ? {
            ...r,
            [field]: value,
          }
          : r
      )
    );
  };

  const guardarChecklist = async () => {
    try {
      setSaving(true);
      setError("");
      setOk("");

      const payload = respuestas.map((r) => ({
        id: r.id,
        resultado: r.resultado,
        comentario_admin: r.comentario_admin || "",
        requiere_accion: !!r.requiere_accion,
        requiere_foto: !!r.requiere_foto,
        criticidad_observacion: r.criticidad_observacion || "MEDIA",
        fecha_limite: r.fecha_limite || null,
      }));

      await inspeccionesApi.guardarChecklist(id, payload);

      setOk("Checklist guardado correctamente.");
      await cargar();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Error guardando checklist."
      );
    } finally {
      setSaving(false);
    }
  };

  const trabajarRespuesta = async (respuesta) => {
    try {
      setError("");
      setOk("");

      await inspeccionesApi.trabajarRespuesta(respuesta.id, {
        comentario_sucursal: respuesta.comentario_sucursal || "",
        fecha_compromiso_sucursal:
          respuesta.fecha_compromiso_sucursal || null,
      });

      setOk("Observación marcada en trabajo.");
      await cargar();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Error iniciando trabajo."
      );
    }
  };

  const enviarRevision = async (respuesta) => {
    try {
      setError("");
      setOk("");

      await inspeccionesApi.enviarRevision(respuesta.id);

      setOk("Observación enviada a revisión.");
      await cargar();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Error enviando a revisión."
      );
    }
  };

  const aprobarRespuesta = async (respuesta) => {
    try {
      setError("");
      setOk("");

      await inspeccionesApi.aprobarRespuesta(respuesta.id);

      setOk("Observación aprobada.");
      await cargar();
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Error aprobando."
      );
    }
  };

  const rechazarRespuesta = async (respuesta) => {
    const comentario = window.prompt("Motivo del rechazo:");

    if (comentario === null) return;

    try {
      setError("");
      setOk("");

      await inspeccionesApi.rechazarRespuesta(respuesta.id, {
        comentario,
      });

      setOk("Observación rechazada.");
      await cargar();
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Error rechazando."
      );
    }
  };

  const reabrirRespuesta = async (respuesta) => {
    const comentario = window.prompt("Motivo de reapertura:");

    if (comentario === null) return;

    try {
      setError("");
      setOk("");

      await inspeccionesApi.reabrirRespuesta(respuesta.id, {
        comentario,
      });

      setOk("Observación reabierta.");
      await cargar();
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Error reabriendo."
      );
    }
  };

  const subirEvidencia = async (respuesta, file, comentario) => {
    if (!file) return;

    try {
      setError("");
      setOk("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("comentario", comentario || "");

      await inspeccionesApi.subirEvidencia(respuesta.id, formData);

      setOk("Evidencia cargada correctamente.");
      await cargar();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Error subiendo evidencia."
      );
    }
  };



  if (loading) {
    return (
      <Container fluid className="mt-3 text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!inspeccion) {
    return (
      <Container fluid className="mt-3 rpm-page px-3">
        <Alert variant="danger">Inspección no encontrada.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-3 rpm-page px-3">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
        <div>
          <h4 className="mb-1">Inspección #{inspeccion.id}</h4>
          <div className="text-muted small">
            {inspeccion.sucursal?.nombre || `Sucursal ${inspeccion.sucursal_id}`} ·{" "}
            {inspeccion.plantilla?.nombre || "Sin plantilla"}
          </div>
          <div className="text-muted small">
            Inspector: {inspeccion.inspector?.usuario || "-"} · Fecha:{" "}
            {inspeccion.fecha_inspeccion || "-"}
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row gap-2">
          <Badge bg={estadoVariant(inspeccion.estado)} className="p-2">
            {inspeccion.estado}
          </Badge>

          <Button variant="outline-secondary" onClick={() => navigate("/inspecciones")}>
            Volver
          </Button>

          {esInspector && inspeccion.estado !== "CERRADA" && (
            <Button disabled={saving} onClick={guardarChecklist}>
              {saving ? "Guardando..." : "Guardar checklist"}
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {ok && <Alert variant="success">{ok}</Alert>}

      {inspeccion.observacion_general && (
        <Alert variant="info">
          <strong>Observación general:</strong> {inspeccion.observacion_general}
        </Alert>
      )}

      {grupos.map((grupo, index) => (
        <Card className="mb-3" key={grupo.categoria}>
          <Card.Header className="rpm-header">
            <strong>{grupo.categoria}</strong>
          </Card.Header>

          <Card.Body>
            <Row>
              {grupo.items.map((r) => (
                <Col
                  xs={12}
                  xl={6}
                  key={r.id}
                >
                  <CardRespuesta
                    r={r}
                    esSucursal={esSucursal}
                    esInspector={esInspector}
                    puedeRevisar={puedeRevisar}
                    inspeccion={inspeccion}
                    actualizarLocal={actualizarLocal}
                    trabajarRespuesta={trabajarRespuesta}
                    enviarRevision={enviarRevision}
                    subirEvidencia={subirEvidencia}
                    aprobarRespuesta={aprobarRespuesta}
                    rechazarRespuesta={rechazarRespuesta}
                    reabrirRespuesta={reabrirRespuesta}
                    cargar={cargar}
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      ))}

      {esInspector && inspeccion.estado !== "CERRADA" && (
        <div className="position-sticky bottom-0 bg-white py-3 border-top">
          <Button
            className="w-100"
            size="lg"
            disabled={saving}
            onClick={guardarChecklist}
          >
            {saving ? "Guardando..." : "Guardar checklist"}
          </Button>
        </div>
      )}
    </Container>
  );
};

const RespuestaInspector = ({
  r,
  actualizarLocal,
}) => {
  const requiereDatosAccion =
    r.resultado === "NO_CUMPLE" && !!r.requiere_accion;

  return (
    <>
      <Form.Group className="mb-2">
        <Form.Label>Resultado</Form.Label>
        <Form.Select
          className="form-control my-input"
          value={r.resultado || ""}
          onChange={(e) => actualizarLocal(r.id, "resultado", e.target.value)}
        >
          <option value="">Pendiente</option>
          <option value="CUMPLE">Cumple</option>
          <option value="NO_CUMPLE">No cumple</option>
          <option value="NO_APLICA">No aplica</option>
        </Form.Select>
      </Form.Group>

      {r.resultado === "NO_CUMPLE" && (
        <>
          <Form.Group className="mb-2">
            <Form.Label>Comentario del inspector</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={r.comentario_admin || ""}
              onChange={(e) =>
                actualizarLocal(r.id, "comentario_admin", e.target.value)
              }
            />
          </Form.Group>

          <Row>
            <Col xs={12} md={6}>
              <Form.Check
                className="mb-2"
                type="checkbox"
                label="Requiere acción de sucursal"
                checked={!!r.requiere_accion}
                onChange={(e) =>
                  actualizarLocal(r.id, "requiere_accion", e.target.checked)
                }
              />
            </Col>

            <Col xs={12} md={6}>
              <Form.Check
                className="mb-2"
                type="checkbox"
                label="Requiere foto"
                checked={!!r.requiere_foto}
                onChange={(e) =>
                  actualizarLocal(r.id, "requiere_foto", e.target.checked)
                }
              />
            </Col>
          </Row>

          {requiereDatosAccion && (
            <Row>
              <Col xs={12} md={6} className="mb-2">
                <Form.Label>Criticidad</Form.Label>
                <Form.Select
                  className="form-control my-input"
                  value={r.criticidad_observacion || "MEDIA"}
                  onChange={(e) =>
                    actualizarLocal(
                      r.id,
                      "criticidad_observacion",
                      e.target.value
                    )
                  }
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica</option>
                </Form.Select>
              </Col>

              <Col xs={12} md={6} className="mb-2">
                <Form.Label>Fecha límite</Form.Label>
                <Form.Control
                  type="date"
                  value={r.fecha_limite || ""}
                  onChange={(e) =>
                    actualizarLocal(r.id, "fecha_limite", e.target.value)
                  }
                />
              </Col>
            </Row>
          )}
        </>
      )}
    </>
  );
};

const RespuestaSucursal = ({
  r,
  actualizarLocal,
  trabajarRespuesta,
  enviarRevision,
  subirEvidencia,
}) => {

  useEffect(() => {

    console.log(
      "MONTA RESPUESTA",
      r.id
    );

    return () => {
      console.log(
        "DESMONTA RESPUESTA",
        r.id
      );
    };

  }, []);


  console.log("RENDER RESPUESTA", r.id);
  console.log(
    "MOUNT RESPUESTA",
    r.id
  );

  const [file, setFile] = useState(null);
  const [comentarioFoto, setComentarioFoto] = useState("");

  console.log(
    "RESPUESTA",
    r.id,
    r.comentario_sucursal,
    r.fecha_compromiso_sucursal
  );

  return (
    <>
      {r.comentario_admin && (
        <Alert variant="warning" className="py-2">
          <strong>Observación:</strong> {r.comentario_admin}
        </Alert>
      )}

      <Form.Group className="mb-2">
        <Form.Label>Comentario de sucursal</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={r.comentario_sucursal ?? ""}
          onChange={(e) =>
            actualizarLocal(
              r.id,
              "comentario_sucursal",
              e.target.value
            )
          }
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Fecha compromiso</Form.Label>
        <Form.Control
          type="date"
          value={r.fecha_compromiso_sucursal || ""}
          onChange={(e) =>
            actualizarLocal(
              r.id,
              "fecha_compromiso_sucursal",
              e.target.value
            )
          }
        />
      </Form.Group>

      <div className="d-grid gap-2 mb-3">
        <Button
          size="sm"
          variant="warning"
          onClick={() => trabajarRespuesta(r)}
        >
          Guardar trabajo
        </Button>
      </div>

      {r.requiere_foto && (
        <Card className="mb-3">
          <Card.Body>
            <Form.Group className="mb-2">
              <Form.Label>Subir evidencia</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Comentario de evidencia</Form.Label>
              <Form.Control
                value={comentarioFoto}
                onChange={(e) => setComentarioFoto(e.target.value)}
              />
            </Form.Group>

            <Button
              size="sm"
              variant="outline-primary"
              disabled={!file}
              onClick={() => subirEvidencia(r, file, comentarioFoto)}
            >
              Subir foto
            </Button>
          </Card.Body>
        </Card>
      )}

      <div className="d-grid">
        <Button
          size="sm"
          variant="info"
          onClick={() => enviarRevision(r)}
        >
          Enviar a revisión
        </Button>
      </div>
    </>
  );
};

const Evidencias = ({
  evidencias = [],
  cargar,
}) => {
  if (!evidencias.length) {
    return <div className="small text-muted">Sin evidencias cargadas.</div>;
  }

  return (
    <div className="mt-2">
      <strong className="small">Evidencias</strong>

      <div className="d-flex flex-column gap-2 mt-2">
        {evidencias.map((ev) => (
          <Card key={ev.id} className="border">
            <Card.Body className="py-2">
              <div className="small mb-2">{ev.comentario || "Archivo"}</div>

              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => window.open(ev.archivo, "_blank")}
                >
                  Ver
                </Button>

                {ev.web_content_link && (
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => window.open(ev.web_content_link, "_blank")}
                  >
                    Descargar
                  </Button>
                )}

                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {

                    if (
                      !window.confirm(
                        "¿Eliminar evidencia?"
                      )
                    ) {
                      return;
                    }

                    await inspeccionesApi.eliminarEvidencia(
                      ev.id
                    );

                    await cargar();
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>


    </div>
  );
};

const Historial = ({ historial = [] }) => {
  if (!historial.length) return null;

  return (
    <Accordion className="mt-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          Historial
        </Accordion.Header>

        <Accordion.Body>
          {historial.map((h) => (
            <div
              key={h.id}
              className="border-bottom pb-2 mb-2 small"
            >
              <div>
                <strong>
                  {h.usuario?.usuario ||
                    `Usuario ${h.usuario_id}`}
                </strong>
              </div>

              <div>
                Acción:
                {" "}
                {h.accion}
              </div>

              <div>
                Estado:
                {" "}
                {h.estado_anterior || "-"}
                {" → "}
                {h.estado_nuevo || "-"}
              </div>

              {h.comentario && (
                <div>
                  Comentario:
                  {" "}
                  {h.comentario}
                </div>
              )}

              <div className="text-muted">
                {h.createdAt
                  ? new Date(
                    h.createdAt
                  ).toLocaleString()
                  : ""}
              </div>
            </div>
          ))}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

const CardRespuesta = ({
  r,
  esSucursal,
  esInspector,
  puedeRevisar,
  inspeccion,
  actualizarLocal,
  trabajarRespuesta,
  enviarRevision,
  subirEvidencia,
  aprobarRespuesta,
  rechazarRespuesta,
  reabrirRespuesta,
  cargar,
}) => {

  console.log({
    esSucursal,
    requiere_accion: r.requiere_accion,
    estado: r.estado
  });

  const mostrarSucursal =
    esSucursal &&
    r.requiere_accion &&
    ["PENDIENTE", "EN_TRABAJO", "RECHAZADA", "REABIERTA"].includes(r.estado);

  const mostrarRevision = puedeRevisar && r.estado === "EN_REVISION";

  const mostrarReabrir =
    puedeRevisar && ["APROBADA", "CERRADA"].includes(r.estado);

  return (
    <Card className="rpm-card mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div>
            <h6 className="mb-1">{r.descripcion_item}</h6>
            <div className="small text-muted">
              Peso: {r.peso_item || 1} · Tipo: {r.tipo_respuesta_item}
            </div>
          </div>

          <Badge bg={estadoVariant(r.estado)}>{r.estado}</Badge>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">

          <div className="small text-muted mb-3">

            {r.fecha_compromiso_sucursal && (
              <div>
                Fecha compromiso:
                {" "}
                {r.fecha_compromiso_sucursal}
              </div>
            )}

            {r.dias_resolucion != null && (
              <div>
                Resolución:
                {" "}
                <strong>
                  {r.dias_resolucion} días
                </strong>
              </div>
            )}

            {r.dias_objetivo != null && (
              <div>
                SLA objetivo:
                {" "}
                <strong>
                  {r.dias_objetivo} días
                </strong>
              </div>
            )}

            {r.vencida != null && (
              <div>
                Estado SLA:
                {" "}

                {r.vencida ? (
                  <Badge bg="danger">
                    VENCIDA
                  </Badge>
                ) : (
                  <Badge bg="success">
                    EN PLAZO
                  </Badge>
                )}
              </div>
            )}

          </div>

          <div className="small text-muted mb-3">

            {r.usuario_inspector?.usuario && (
              <div>
                Inspector:
                {" "}
                {r.usuario_inspector.usuario}
              </div>
            )}

            {r.usuario_corrector?.usuario && (
              <div>
                Corrector:
                {" "}
                {r.usuario_corrector.usuario}
              </div>
            )}

            {r.usuario_revisor?.usuario && (
              <div>
                Revisor:
                {" "}
                {r.usuario_revisor.usuario}
              </div>
            )}

          </div>
          {r.resultado && <Badge bg="dark">{r.resultado}</Badge>}

          <Badge bg={criticidadVariant(r.criticidad_observacion)}>
            {r.criticidad_observacion || r.criticidad_item}

          </Badge>

          {r.requiere_accion && <Badge bg="warning">Requiere acción</Badge>}
          {r.requiere_foto && <Badge bg="info">Requiere foto</Badge>}
          {r.fecha_limite && <Badge bg="secondary">Vence: {r.fecha_limite}</Badge>}
        </div>

        {esInspector && inspeccion?.estado !== "CERRADA" && (
          <RespuestaInspector
            r={r}
            actualizarLocal={actualizarLocal}
          />
        )}

        {/* {mostrarSucursal && <RespuestaSucursal r={r} />} */}

        {mostrarSucursal && (
          <RespuestaSucursal
            r={r}
            actualizarLocal={actualizarLocal}
            trabajarRespuesta={trabajarRespuesta}
            enviarRevision={enviarRevision}
            subirEvidencia={subirEvidencia}
          />
        )}


        <Evidencias
          evidencias={r.evidencias || []}
          cargar={cargar}
        />

        {mostrarRevision && (
          <div className="d-flex flex-column flex-md-row gap-2 mt-3">
            <Button
              variant="success"
              size="sm"
              onClick={() => aprobarRespuesta(r)}
            >
              Aprobar
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => rechazarRespuesta(r)}
            >
              Rechazar
            </Button>
          </div>
        )}

        {mostrarReabrir && (
          <div className="d-grid mt-3">
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => reabrirRespuesta(r)}
            >
              Reabrir observación
            </Button>
          </div>
        )}

        <Historial historial={r.historial || []} />
      </Card.Body>
    </Card>
  );
};

export default InspeccionDetalle;