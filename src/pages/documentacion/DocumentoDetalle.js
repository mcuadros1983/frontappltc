// src/pages/documentacion/DocumentoDetalle.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // si estás en v5, esto cambia
import { documentosApi } from "../../services/documentosApi";
import { useNavigate } from "react-router-dom";

export default function DocumentoDetalle() {
  // si usás react-router v5 y recibís props.match, reemplazá esto por:
  // const docId = props.match?.params?.id;
  const { id: docId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoc() {
      try {
        setLoading(true);
        setErr("");
        const data = await documentosApi.getById(docId);
        setDoc(data);
      } catch (e) {
        setErr(e?.message || "Error cargando documento");
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [docId]);

  if (loading) {
    return <div className="p-3">Cargando…</div>;
  }

  if (err) {
    return <div className="alert alert-danger m-3">{err}</div>;
  }

  if (!doc) {
    return (
      <div className="p-3">
        <div className="alert alert-warning">Documento no encontrado</div>
        <a className="btn btn-outline-secondary btn-sm mt-3" onClick={() => navigate("/documentos")}>
          ← Volver
        </a>
      </div>
    );
  }

  const {
    titulo,
    tipo,
    version,
    descripcion_resumen,
    contenido,
    pasos = [],
    archivos = [],
    vigente_desde,
    vigente_hasta,
    publicado_en,
    subcategoria,
  } = doc;

  const publicadoStr = publicado_en
    ? new Date(publicado_en).toLocaleString("es-AR")
    : "—";

  const vigenciaStr = (() => {
    const d1 = vigente_desde
      ? new Date(vigente_desde).toLocaleDateString("es-AR")
      : "";
    const d2 = vigente_hasta
      ? new Date(vigente_hasta).toLocaleDateString("es-AR")
      : "";
    if (!d1 && !d2) return "—";
    return `${d1 || "—"} / ${d2 || "—"}`;
  })();

  return (
    <div className="container py-3">
      <div className="mb-3">
        <a className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/documentos")}>
          ← Volver
        </a>
      </div>

      <h2 className="mb-1">{titulo}</h2>

      <div className="text-muted small mb-2">
        <strong>Tipo:</strong> {tipo} &nbsp;|&nbsp;{" "}
        <strong>Versión:</strong> {version || "—"} &nbsp;|&nbsp;{" "}
        <strong>Publicado:</strong> {publicadoStr} &nbsp;|&nbsp;{" "}
        <strong>Vigencia:</strong> {vigenciaStr} &nbsp;|&nbsp;{" "}
        <strong>Área:</strong>{" "}
        {subcategoria?.nombre ? subcategoria.nombre : "—"}
      </div>

      {descripcion_resumen && (
        <p className="lead">{descripcion_resumen}</p>
      )}

      {/* Contenido principal */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Detalle</div>
        <div className="card-body">
          {/* seguimos mostrando texto plano.
             si guardás markdown/html podrías renderizarlo distinto */}
          <pre
            className="mb-0"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "inherit",
            }}
          >
            {contenido || "—"}
          </pre>
        </div>
      </div>

      {/* Pasos */}
      {pasos.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-bold">
            Pasos del procedimiento
          </div>
          <div className="card-body">
            {pasos
              .slice()
              .sort((a, b) => (a.orden || 0) - (b.orden || 0))
              .map((p) => (
                <div
                  key={p.id || `${p.orden}-${p.titulo_paso}`}
                  className="mb-3 border rounded p-2 bg-light"
                >
                  <div className="d-flex justify-content-between">
                    <div className="fw-bold">
                      Paso {p.orden ?? "?"}{" "}
                      {p.titulo_paso ? `- ${p.titulo_paso}` : ""}
                    </div>
                    {p.responsable && (
                      <div className="text-muted small">
                        Responsable: {p.responsable}
                      </div>
                    )}
                  </div>
                  <div className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
                    {p.detalle_paso}
                  </div>
                  {p.requiere_foto && (
                    <div className="mt-1 badge bg-warning text-dark">
                      Requiere foto / evidencia
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Archivos adjuntos */}
      <div className="card mb-4">
        <div className="card-header fw-bold">
          Archivos / Adjuntos
        </div>
        <div className="card-body">
          {archivos.length === 0 && (
            <div className="text-muted">No hay adjuntos</div>
          )}

          {archivos
            .slice()
            .sort((a, b) => (a.orden || 0) - (b.orden || 0))
            .map((f) => (
              <div
                key={f.id || `${f.filename_original}-${f.url_storage}`}
                className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
              >
                <div>
                  <div className="fw-bold">
                    {f.filename_original}
                    {f.es_obligatorio_leer && (
                      <span className="badge bg-danger ms-2">
                        Obligatorio leer
                      </span>
                    )}
                  </div>
                  <div className="text-muted small">
                    {f.mime_type || "archivo"}
                  </div>
                </div>
                <div>
                  {/* url_storage ahora puede ser:
                      - un link público de Drive (si le diste permiso "anyone with the link")
                      - o un link interno que luego resolvemos.
                  */}
                  <a
                    href={f.url_storage}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Ver / Descargar
                  </a>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
