// src/pages/documentacion/DocumentoCreatePage.js
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { documentosApi } from "../../services/documentosApi";
import { categoriasApi } from "../../services/categoriasApi";
import Contexts from "../../context/Contexts";

export default function DocumentoCreatePage() {
  const navigate = useNavigate();

  // rol del contexto global
  const UserContext = useContext(Contexts.UserContext);
  const userRolId = UserContext?.user?.rol_id;
  const esAdmin = String(userRolId) === "1";

  // --- campos documento ---
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("PROCESO");
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [descripcionResumen, setDescripcionResumen] = useState("");
  const [contenido, setContenido] = useState("");
  const [vigenteDesde, setVigenteDesde] = useState("");
  const [vigenteHasta, setVigenteHasta] = useState("");
  const [version, setVersion] = useState("");
  const [publicadoEn, setPublicadoEn] = useState("");

  // pasos dinámicos
  const [pasos, setPasos] = useState([
    {
      orden: 1,
      titulo_paso: "",
      detalle_paso: "",
      responsable: "",
      // requiere_foto: false, // <-- quitado
    },
  ]);

  // ARCHIVOS (nuevo flujo):
  // - archivosPendientes: lo que el usuario eligió pero aún NO se subió a Drive
  // cada item: { file: File }
  const [archivosPendientes, setArchivosPendientes] = useState([]);

  // combos
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // si alguien sin rol admin intenta entrar directo por URL
  useEffect(() => {
    if (!esAdmin) {
      navigate("/documentos");
    }
  }, [esAdmin, navigate]);

  // cargar categorías al montar
  useEffect(() => {
    categoriasApi
      .getCategorias()
      .then((cats) => setCategorias(cats || []))
      .catch((e) => console.error("Error cargando categorias:", e));
  }, []);

  // cargar subcategorías cuando cambia categoriaId
  useEffect(() => {
    if (!categoriaId) {
      setSubcategorias([]);
      setSubcategoriaId("");
      return;
    }
    categoriasApi
      .getSubcategorias(categoriaId)
      .then((subs) => {
        setSubcategorias(subs || []);
        if (
          subcategoriaId &&
          !subs.find((s) => String(s.id) === String(subcategoriaId))
        ) {
          setSubcategoriaId("");
        }
      })
      .catch((e) => console.error("Error cargando subcategorias:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId]);

  // --- handlers de pasos ---
  function addPaso() {
    setPasos((prev) => [
      ...prev,
      {
        orden: prev.length + 1,
        titulo_paso: "",
        detalle_paso: "",
        responsable: "",
        // requiere_foto: false,
      },
    ]);
  }

  function updatePaso(idx, field, value) {
    setPasos((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  }

  function removePaso(idx) {
    setPasos((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((p, i) => ({ ...p, orden: i + 1 }))
    );
  }

  // ARCHIVOS: cuando seleccionás un archivo en el input
  function handleSelectArchivo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    // guardamos el File en el array pendiente
    setArchivosPendientes((prev) => [
      ...prev,
      {
        file: f,
      },
    ]);

    // limpiamos el input para poder volver a elegir el mismo nombre después
    e.target.value = "";
  }

  // Quitar archivo pendiente ANTES de guardar doc
  function handleRemoveArchivoPendiente(idx) {
    setArchivosPendientes((prev) =>
      prev.filter((_, i) => i !== idx)
    );
  }

  // guardar documento (sube archivos primero, luego crea documento)
  async function handleSave() {
    if (!esAdmin) {
      alert("No tenés permiso para guardar.");
      return;
    }

    if (!subcategoriaId) {
      setErrMsg("Debés seleccionar subcategoría / área");
      return;
    }

    try {
      setSaving(true);
      setErrMsg("");

      // 1) Subir todos los archivos pendientes (si hay)
      //    y recolectar metadata en archivosSubidosMeta
      const archivosSubidosMeta = [];
      for (let i = 0; i < archivosPendientes.length; i++) {
        const pendiente = archivosPendientes[i];
        const theFile = pendiente.file;
        // llamamos al endpoint de uploadFile UNA SOLA VEZ POR ARCHIVO
        const meta = await documentosApi.uploadFile(theFile);
        // meta = { fileId, filename_original, mime_type, url_storage, ... }
        archivosSubidosMeta.push({
          orden: i + 1,
          filename_original: meta.filename_original,
          mime_type: meta.mime_type,
          url_storage: meta.url_storage,
          // es_obligatorio_leer: false, // lo sacamos
        });
      }

      // 2) Armar payload final del documento
      const payload = {
        titulo,
        tipo,
        subcategoria_id: subcategoriaId,
        descripcion_resumen: descripcionResumen,
        contenido,
        vigente_desde: vigenteDesde || null,
        vigente_hasta: vigenteHasta || null,
        version: version || null,
        publicado_en: publicadoEn || null,
        pasos: pasos.map((p, i) => ({
          orden: i + 1,
          titulo_paso: p.titulo_paso || null,
          detalle_paso: p.detalle_paso || "",
          responsable: p.responsable || null,
          // requiere_foto: false,
        })),
        archivos: archivosSubidosMeta,
      };

      // 3) Crear el documento en el backend
      await documentosApi.create(payload);

      // 4) Navegar al listado
      navigate("/documentos");
    } catch (err) {
      console.error("error guardando doc:", err);
      setErrMsg(err.message || "Error guardando documento");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  // cancelar vuelve al listado
  function handleCancel() {
    if (saving) return;
    navigate("/documentos");
  }

  return (
    <div className="container-fluid p-3">
      {/* HEADER / ACCIONES */}
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-3">
        <div>
          <h2 className="mb-1">Nuevo Documento</h2>
          <div className="text-muted small">
            Alta de procedimiento / manual / comunicación
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </button>

          {esAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </button>
          )}
        </div>
      </div>

      {errMsg && <div className="alert alert-danger">{errMsg}</div>}

      {/* DATOS PRINCIPALES */}
      <div className="card mb-3">
        <div className="card-header fw-bold">Datos generales</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Título</label>
              <input
                type="text"
                className="form-control"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
                disabled={saving}
              >
                <option value="PROCESO">Proceso / Procedimiento</option>
                <option value="MANUAL">Manual / Instructivo</option>
                <option value="COMUNICACION">Comunicación Interna</option>
                <option value="CAPACITACION">Capacitación</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Versión</label>
              <input
                type="text"
                className="form-control"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Publicado en (fecha)</label>
              <input
                type="date"
                className="form-control"
                value={publicadoEn}
                onChange={(e) => setPublicadoEn(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Vigente desde</label>
              <input
                type="date"
                className="form-control"
                value={vigenteDesde}
                onChange={(e) => setVigenteDesde(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Vigente hasta</label>
              <input
                type="date"
                className="form-control"
                value={vigenteHasta}
                onChange={(e) => setVigenteHasta(e.target.value)}
                disabled={saving}
              />
            </div>

            {/* CATEGORIA / SUBCATEGORIA */}
            <div className="col-md-3">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
                disabled={saving}
              >
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Subcategoría / Área</label>
              <select
                className="form-select"
                value={subcategoriaId}
                onChange={(e) => setSubcategoriaId(e.target.value)}
                required
                disabled={!categoriaId || saving}
              >
                <option value="">Seleccionar...</option>
                {subcategorias.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Descripción breve / resumen</label>
              <textarea
                className="form-control"
                rows={2}
                value={descripcionResumen}
                onChange={(e) => setDescripcionResumen(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Contenido detallado</label>
              <textarea
                className="form-control"
                rows={4}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PASOS */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="fw-bold">Pasos / Procedimiento</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addPaso}
            disabled={saving}
          >
            + Agregar paso
          </button>
        </div>

        <div className="card-body">
          {pasos.map((p, idx) => (
            <div
              key={idx}
              className="border rounded p-2 mb-3 bg-light"
            >
              <div className="row g-2">
                <div className="col-md-2">
                  <label className="form-label"># Orden</label>
                  <input
                    type="number"
                    className="form-control"
                    value={p.orden}
                    onChange={(e) =>
                      updatePaso(idx, "orden", Number(e.target.value))
                    }
                    disabled={saving}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Título Paso</label>
                  <input
                    type="text"
                    className="form-control"
                    value={p.titulo_paso}
                    onChange={(e) =>
                      updatePaso(idx, "titulo_paso", e.target.value)
                    }
                    disabled={saving}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Responsable</label>
                  <input
                    type="text"
                    className="form-control"
                    value={p.responsable}
                    onChange={(e) =>
                      updatePaso(idx, "responsable", e.target.value)
                    }
                    disabled={saving}
                  />
                </div>

                {/* SACAMOS requiere_foto */}

                <div className="col-12">
                  <label className="form-label">
                    Detalle / Instrucciones
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={p.detalle_paso}
                    onChange={(e) =>
                      updatePaso(idx, "detalle_paso", e.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              {pasos.length > 1 && (
                <div className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mt-2"
                    onClick={() => removePaso(idx)}
                    disabled={saving}
                  >
                    Quitar paso
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ARCHIVOS (pendientes de subir) */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Archivos adjuntos</div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Agregar archivo</label>
              <input
                type="file"
                className="form-control"
                onChange={handleSelectArchivo}
                disabled={saving}
              />
            </div>
          </div>

          <ul className="list-group mt-3">
            {archivosPendientes.map((item, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <div className="fw-bold">{item.file.name}</div>
                  <div className="small text-muted">
                    {item.file.type || "mime?"} —{" "}
                    {(item.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemoveArchivoPendiente(idx)}
                  disabled={saving}
                >
                  Quitar
                </button>
              </li>
            ))}

            {archivosPendientes.length === 0 && (
              <li className="list-group-item text-muted">
                No hay archivos seleccionados
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* BOTONES ABAJO (extra por UX en pantallas largas) */}
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancelar
        </button>

        {esAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
