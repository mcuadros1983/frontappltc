// src/pages/documentacion/DocumentoFormPage.js
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { documentosApi } from "../../services/documentosApi";
import { categoriasApi } from "../../services/categoriasApi";
import Contexts from "../../context/Contexts";
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Table,
  Pagination,
  Spinner,
  Alert,
} from "react-bootstrap";

export default function DocumentoFormPage() {
  const navigate = useNavigate();
  const { id: editingId } = useParams(); // si existe => modo edición
  const isEdit = Boolean(editingId);

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
    },
  ]);

  // ARCHIVOS
  // Archivos que YA existen en el doc (si estoy editando)
  // cada item: { id?, filename_original, mime_type, url_storage, drive_file_id, orden }
  const [archivosExistentes, setArchivosExistentes] = useState([]);

  // Archivos nuevos pendientes de subir
  // cada item: { file: File }
  const [archivosPendientes, setArchivosPendientes] = useState([]);

  // combos
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [loadingInit, setLoadingInit] = useState(true); // para edición inicial
  const [removingDriveFileId, setRemovingDriveFileId] = useState(null); // spinner al borrar archivo existente

  // chequear acceso
  useEffect(() => {
    if (!esAdmin) {
      navigate("/documentos");
    }
  }, [esAdmin, navigate]);

  // cargar categorías siempre
  useEffect(() => {
    categoriasApi
      .getCategorias()
      .then((cats) => setCategorias(cats || []))
      .catch((e) => console.error("Error cargando categorias:", e));
  }, []);

  // helper para cargar subcategorías dado un categoria_id
  const fetchSubcategorias = useCallback(async (catId) => {
    if (!catId) {
      setSubcategorias([]);
      return [];
    }
    try {
      const subs = await categoriasApi.getSubcategorias(catId);
      setSubcategorias(subs || []);
      return subs || [];
    } catch (e) {
      console.error("Error cargando subcategorias:", e);
      setSubcategorias([]);
      return [];
    }
  }, []);

  // si estoy editando, cargar datos iniciales del documento
  useEffect(() => {
    let cancel = false;

    async function loadForEdit() {
      if (!isEdit) {
        setLoadingInit(false);
        return;
      }

      try {
        setLoadingInit(true);
        const data = await documentosApi.getById(editingId);

        if (cancel) return;

        // set campos principales
        setTitulo(data.titulo || "");
        setTipo(data.tipo || "PROCESO");
        setDescripcionResumen(data.descripcion_resumen || "");
        setContenido(data.contenido || "");
        setVigenteDesde(
          data.vigente_desde ? data.vigente_desde.slice(0, 10) : ""
        );
        setVigenteHasta(
          data.vigente_hasta ? data.vigente_hasta.slice(0, 10) : ""
        );
        setVersion(data.version || "");
        setPublicadoEn(
          data.publicado_en ? data.publicado_en.slice(0, 10) : ""
        );

        // subcategoria/categoria
        const subcatIdFromData =
          data.subcategoria_id ||
          data.subcategoria?.id ||
          "";
        const catIdFromData = data.subcategoria?.categoria_id || "";

        setCategoriaId(catIdFromData ? String(catIdFromData) : "");
        // primero cargo subcats de esa categoría
        const subs = await fetchSubcategorias(catIdFromData);
        // recién entonces seteo subcategoriaId si sigue existiendo
        if (
          subcatIdFromData &&
          subs.find((s) => String(s.id) === String(subcatIdFromData))
        ) {
          setSubcategoriaId(String(subcatIdFromData));
        } else {
          setSubcategoriaId("");
        }

        // pasos
        if (Array.isArray(data.pasos) && data.pasos.length > 0) {
          setPasos(
            data.pasos
              .slice()
              .sort((a, b) => (a.orden || 0) - (b.orden || 0))
              .map((p, idx) => ({
                orden: p.orden ?? idx + 1,
                titulo_paso: p.titulo_paso || "",
                detalle_paso: p.detalle_paso || "",
                responsable: p.responsable || "",
              }))
          );
        } else {
          setPasos([
            {
              orden: 1,
              titulo_paso: "",
              detalle_paso: "",
              responsable: "",
            },
          ]);
        }

        // archivos existentes
        if (Array.isArray(data.archivos) && data.archivos.length > 0) {
          setArchivosExistentes(
            data.archivos
              .slice()
              .sort((a, b) => (a.orden || 0) - (b.orden || 0))
              .map((a, idx) => ({
                id: a.id,
                filename_original: a.filename_original,
                mime_type: a.mime_type,
                url_storage: a.url_storage,
                drive_file_id: a.drive_file_id, // <- importante
                orden: a.orden ?? idx + 1,
              }))
          );
        } else {
          setArchivosExistentes([]);
        }

        setArchivosPendientes([]); // en edición, arrancan vacíos
      } catch (e) {
        console.error("Error cargando documento para editar:", e);
        setErrMsg("Error cargando el documento");
      } finally {
        if (!cancel) setLoadingInit(false);
      }
    }

    loadForEdit();
    return () => {
      cancel = true;
    };
  }, [isEdit, editingId, fetchSubcategorias]);

  // cuando cambia categoriaId manualmente (usuario editando / creando)
  useEffect(() => {
    // si es edición, ya hicimos el fetch inicial arriba.
    // esto es por si el usuario CAMBIA la categoría en el form.
    async function run() {
      if (!categoriaId) {
        setSubcategorias([]);
        setSubcategoriaId("");
        return;
      }
      const subs = await fetchSubcategorias(categoriaId);
      // si la subcat actual ya no está, la limpio
      setSubcategoriaId((prev) => {
        if (!prev) return "";
        const stillThere = subs.find((s) => String(s.id) === String(prev));
        return stillThere ? prev : "";
      });
    }
    run();
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

  // seleccionar archivo nuevo (pendiente)
  function handleSelectArchivoNuevo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setArchivosPendientes((prev) => [
      ...prev,
      {
        file: f,
      },
    ]);
    e.target.value = "";
  }

  // quitar archivo pendiente (aún no subido a Drive)
  function handleRemoveArchivoPendiente(idx) {
    if (saving) return;
    setArchivosPendientes((prev) => prev.filter((_, i) => i !== idx));
  }

  // eliminar archivo EXISTENTE (que ya está en Drive) durante la edición
  async function handleRemoveArchivoExistente(idx) {
    if (saving) return;

    const fileObj = archivosExistentes[idx];
    if (!fileObj) return;

    const ok = window.confirm(
      `¿Querés eliminar el archivo "${fileObj.filename_original}" de Drive y de este documento?`
    );
    if (!ok) return;

    try {
      if (fileObj.drive_file_id) {
        setRemovingDriveFileId(fileObj.drive_file_id);
        await documentosApi.deleteUploadedFile(fileObj.drive_file_id);
      } else {
        console.warn(
          "Este archivo existente no tiene drive_file_id. Sólo lo saco del estado."
        );
      }

      // lo quitamos del estado
      setArchivosExistentes((prev) =>
        prev
          .filter((_, i) => i !== idx)
          .map((a, newI) => ({ ...a, orden: newI + 1 }))
      );
    } catch (err) {
      console.error("Error eliminando archivo existente:", err);
      alert(
        err.message ||
          "No se pudo borrar el archivo en Drive. Intenta de nuevo."
      );
    } finally {
      setRemovingDriveFileId(null);
    }
  }

  // guardar documento (create o update)
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

      // 1) Subir TODOS los archivos pendientes nuevos (si hay)
      const nuevosArchivosMeta = [];
      for (let i = 0; i < archivosPendientes.length; i++) {
        const pendiente = archivosPendientes[i];
        const f = pendiente.file;
        const meta = await documentosApi.uploadFile(f);
        // meta = { fileId, filename_original, mime_type, url_storage }
        nuevosArchivosMeta.push({
          // orden se va a recalcular después
          filename_original: meta.filename_original,
          mime_type: meta.mime_type,
          url_storage: meta.url_storage,
          drive_file_id: meta.fileId,
          
        });
      }

      // 2) Mezclar archivos existentes (los que quedaron) + nuevos
      const archivosFinales = [
        ...archivosExistentes.map((a) => ({
          filename_original: a.filename_original,
          mime_type: a.mime_type,
          url_storage: a.url_storage,
          drive_file_id: a.drive_file_id,
        })),
        ...nuevosArchivosMeta,
      ].map((a, idx) => ({
        ...a,
        orden: idx + 1,
      }));

      // 3) Armar payload
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
        })),
        archivos: archivosFinales,
      };

      // 4) Hacer create o update
      if (isEdit) {
        await documentosApi.update(editingId, payload);
      } else {
        await documentosApi.create(payload);
      }

      // 5) Volver al listado
      navigate("/documentos");
    } catch (err) {
      console.error("error guardando doc:", err);
      setErrMsg(err.message || "Error guardando documento");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  // cancelar
  function handleCancel() {
    if (saving) return;
    navigate("/documentos");
  }

  if (loadingInit) {
    return <div className="p-3">Cargando formulario…</div>;
  }

  return (
  <Container fluid className="mt-3">
    <Row>
      <Col>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-start flex-wrap">
            <div>
              <strong className="d-block">
                {isEdit ? "Editar Documento" : "Nuevo Documento"}
              </strong>
              <small className="text-muted">
                {isEdit
                  ? "Modificación de procedimiento / manual / comunicación"
                  : "Alta de procedimiento / manual / comunicación"}
              </small>
            </div>

            <div className="d-flex gap-2 mt-2 mt-md-0">
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>

              {esAdmin && (
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Guardando...
                    </>
                  ) : isEdit ? (
                    "Guardar Cambios"
                  ) : (
                    "Guardar"
                  )}
                </Button>
              )}
            </div>
          </Card.Header>

          <Card.Body>
            {errMsg && <Alert variant="danger">{errMsg}</Alert>}

            {/* DATOS PRINCIPALES */}
            <Card className="mb-3">
              <Card.Header className="fw-bold">Datos generales</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                      disabled={saving}
                      className="my-input"
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      required
                      disabled={saving}
                      className="form-control my-input"
                    >
                      <option value="PROCESO">Proceso / Procedimiento</option>
                      <option value="MANUAL">Manual / Instructivo</option>
                      <option value="COMUNICACION">Comunicación Interna</option>
                      <option value="CAPACITACION">Capacitación</option>
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Versión</Form.Label>
                    <Form.Control
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      disabled={saving}
                      className="my-input"
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Label>Publicado en (fecha)</Form.Label>
                    <Form.Control
                      type="date"
                      value={publicadoEn}
                      onChange={(e) => setPublicadoEn(e.target.value)}
                      disabled={saving}
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Label>Vigente desde</Form.Label>
                    <Form.Control
                      type="date"
                      value={vigenteDesde}
                      onChange={(e) => setVigenteDesde(e.target.value)}
                      disabled={saving}
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Label>Vigente hasta</Form.Label>
                    <Form.Control
                      type="date"
                      value={vigenteHasta}
                      onChange={(e) => setVigenteHasta(e.target.value)}
                      disabled={saving}
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      required
                      disabled={saving}
                     className="form-control my-input"
                    >
                      <option value="">Seleccionar...</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Subcategoría / Área</Form.Label>
                    <Form.Select
                      value={subcategoriaId}
                      onChange={(e) => setSubcategoriaId(e.target.value)}
                      required
                      disabled={!categoriaId || saving}
                      className="form-control my-input"
                    >
                      <option value="">Seleccionar...</option>
                      {subcategorias.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col xs={12}>
                    <Form.Label>Descripción breve / resumen</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={descripcionResumen}
                      onChange={(e) => setDescripcionResumen(e.target.value)}
                      disabled={saving}
                      className="my-input"
                    />
                  </Col>

                  <Col xs={12}>
                    <Form.Label>Contenido detallado</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                      disabled={saving}
                      className="my-input"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* PASOS */}
            <Card className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">Pasos / Procedimiento</span>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={addPaso}
                  disabled={saving}
                >
                  + Agregar paso
                </Button>
              </Card.Header>

              <Card.Body>
                {pasos.map((p, idx) => (
                  <div key={idx} className="border rounded p-3 mb-3 bg-light">
                    <Row className="g-2">
                      <Col md={2}>
                        <Form.Label># Orden</Form.Label>
                        <Form.Control
                          type="number"
                          value={p.orden}
                          onChange={(e) =>
                            updatePaso(idx, "orden", Number(e.target.value))
                          }
                          disabled={saving}
                          className="my-input"
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label>Título Paso</Form.Label>
                        <Form.Control
                          type="text"
                          value={p.titulo_paso}
                          onChange={(e) =>
                            updatePaso(idx, "titulo_paso", e.target.value)
                          }
                          disabled={saving}
                          className="my-input"
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label>Responsable</Form.Label>
                        <Form.Control
                          type="text"
                          value={p.responsable}
                          onChange={(e) =>
                            updatePaso(idx, "responsable", e.target.value)
                          }
                          disabled={saving}
                          className="my-input"
                        />
                      </Col>

                      <Col xs={12}>
                        <Form.Label>Detalle / Instrucciones</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={p.detalle_paso}
                          onChange={(e) =>
                            updatePaso(idx, "detalle_paso", e.target.value)
                          }
                          disabled={saving}
                          className="my-input"
                        />
                      </Col>
                    </Row>

                    {pasos.length > 1 && (
                      <div className="text-end mt-2">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removePaso(idx)}
                          disabled={saving}
                        >
                          Quitar paso
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* ARCHIVOS EXISTENTES */}
            {isEdit && (
              <Card className="mb-3">
                <Card.Header className="fw-bold">
                  Archivos ya cargados en el documento
                </Card.Header>
                <Card.Body>
                  {archivosExistentes.length === 0 && (
                    <div className="text-muted">
                      No hay archivos actualmente en este documento.
                    </div>
                  )}

                  <ul className="list-group">
                    {archivosExistentes.map((a, idx) => (
                      <li
                        key={a.drive_file_id || a.id || idx}
                        className="list-group-item d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <div className="fw-bold">{a.filename_original}</div>
                          <div className="small text-muted">
                            {a.mime_type || "mime?"}
                          </div>
                          {a.url_storage && (
                            <a
                              href={a.url_storage}
                              target="_blank"
                              rel="noreferrer"
                              className="small"
                            >
                              Ver archivo
                            </a>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={saving || removingDriveFileId === a.drive_file_id}
                          onClick={() => handleRemoveArchivoExistente(idx)}
                        >
                          {removingDriveFileId === a.drive_file_id ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-1" />
                              Quitando...
                            </>
                          ) : (
                            "Quitar"
                          )}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}

            {/* ARCHIVOS NUEVOS */}
            <Card className="mb-4">
              <Card.Header className="fw-bold">Agregar archivos nuevos</Card.Header>
              <Card.Body>
                <Row className="g-2 align-items-end">
                  <Col md={6}>
                    <Form.Label>Seleccionar archivo</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleSelectArchivoNuevo}
                      disabled={saving}
                    />
                  </Col>
                </Row>

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

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleRemoveArchivoPendiente(idx)}
                        disabled={saving}
                      >
                        Quitar
                      </Button>
                    </li>
                  ))}

                  {archivosPendientes.length === 0 && (
                    <li className="list-group-item text-muted">
                      No hay archivos nuevos seleccionados
                    </li>
                  )}
                </ul>
              </Card.Body>
            </Card>

            {/* BOTONES FINALES */}
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>

              {esAdmin && (
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Guardando...
                    </>
                  ) : isEdit ? (
                    "Guardar Cambios"
                  ) : (
                    "Guardar"
                  )}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);
}
