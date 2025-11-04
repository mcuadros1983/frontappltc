// src/pages/documentacion/DocumentosList.js
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { documentosApi } from "../../services/documentosApi";
import { categoriasApi } from "../../services/categoriasApi";
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
} from "react-bootstrap";
import { useSecurity } from "../../security/SecurityContext"; // ✅ usar SecurityContext

// Util para timestamp en logs
const ts = () => new Date().toISOString().split("T")[1].replace("Z","");

export default function DocumentosList() {
  console.groupCollapsed(`[DocumentosList 🌐 mount @ ${ts()}]`);
  console.log("process.env.REACT_APP_API_URL =", process.env.REACT_APP_API_URL);
  console.groupEnd();

  // ✅ usuario y loading vienen del SecurityContext
  const { user, loading: authLoading } = useSecurity();
  const userRolId = user?.rol_id;
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // para spinner de eliminar en una fila específica
  const [deletingId, setDeletingId] = useState(null);

  // combos de categoría / subcategoría
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  const [filtro, setFiltro] = useState({
    tipo: "",
    q: "",
    vigentesHoy: "",
    categoria_id: "",
    subcategoria_id: "",
  });

  // 🔎 Log de auth y user
  useEffect(() => {
    console.groupCollapsed(`[Auth 📛 estado @ ${ts()}]`);
    console.log("authLoading =", authLoading);
    console.log("user =", user);
    console.log("userRolId =", userRolId);
    console.groupEnd();
  }, [authLoading, user, userRolId]);

  // ✅ Cargar categorías una sola vez (cuando haya sesión lista)
  useEffect(() => {
    if (authLoading) {
      console.log(`[Cats ⏳ skip @ ${ts()}] Aún authLoading=true, no cargo categorías`);
      return;
    }

    (async function cargarCategorias() {
      console.groupCollapsed(`[Cats ▶ fetch @ ${ts()}] categoriasApi.getCategorias`);
      try {
        const cats = await categoriasApi.getCategorias();
        console.log("✔️ categoriasApi.getCategorias OK. length =", cats?.length);
        setCategorias(cats || []);
      } catch (e) {
        console.error("❌ Error cargando categorias:", e);
      } finally {
        console.groupEnd();
      }
    })();
  }, [authLoading]);

  // cuando cambia categoria_id en filtro => cargar subcategorías visibles
  useEffect(() => {
    if (authLoading) {
      console.log(`[Subs ⏳ skip @ ${ts()}] Aún authLoading=true, no cargo subcategorías`);
      return;
    }
    (async function cargarSubs() {
      console.groupCollapsed(`[Subs ▶ fetch @ ${ts()}] categoria_id=`, filtro.categoria_id);
      if (!filtro.categoria_id) {
        console.log("↪️ categoria_id vacío: limpio subcategorias");
        setSubcategorias([]);
        console.groupEnd();
        return;
      }
      try {
        const subs = await categoriasApi.getSubcategorias(filtro.categoria_id);
        console.log("✔️ categoriasApi.getSubcategorias OK. length =", subs?.length);
        setSubcategorias(subs || []);
      } catch (e) {
        console.error("❌ Error cargando subcategorias:", e);
      } finally {
        console.groupEnd();
      }
    })();
  }, [filtro.categoria_id, authLoading]);

  // editar => navegamos al form unificado en modo edición
  function abrirEdicion(id) {
    console.log(`[UI ✏️ editar @ ${ts()}] id=`, id);
    navigate(`/documentos/${id}/editar`);
  }

  // eliminar documento (Drive + DB)
  async function eliminar(id) {
    console.groupCollapsed(`[Eliminar 🗑️ @ ${ts()}] id=${id}`);
    if (!window.confirm("¿Seguro que querés eliminar este documento y su archivo asociado?")) {
      console.log("↪️ cancelado por usuario");
      console.groupEnd();
      return;
    }

    try {
      setDeletingId(id);
      setErr("");

      // 1) Traer el documento para saber el archivo relacionado
      console.log("1) documentosApi.getById:", id);
      const fullDoc = await documentosApi.getById(id);
      console.log("✔️ getById OK:", fullDoc);

      // si viene como array de archivos, tomamos el primero
      const archivoDrive =
        Array.isArray(fullDoc?.archivos) && fullDoc.archivos.length > 0
          ? fullDoc.archivos[0]
          : null;

      console.log("archivoDrive =", archivoDrive);

      // 2) Si hay archivo en Drive, intentar borrarlo por drive_file_id
      if (archivoDrive?.drive_file_id) {
        console.log("2) documentosApi.deleteUploadedFile:", archivoDrive.drive_file_id);
        try {
          await documentosApi.deleteUploadedFile(archivoDrive.drive_file_id);
          console.log("✔️ Archivo de Drive eliminado");
        } catch (e) {
          console.error("❌ Error eliminando en Drive:", e);
          setErr("No se pudo eliminar el archivo en Drive. No se borró el documento.");
          setDeletingId(null);
          console.groupEnd();
          return;
        }
      } else {
        console.log("↪️ No hay drive_file_id: paso directo a borrar doc en BD");
      }

      // 3) Borrar el documento en la base
      console.log("3) documentosApi.remove:", id);
      await documentosApi.remove(id);
      console.log("✔️ Documento borrado en BD");

      // 4) Refrescar la lista
      console.log("4) Refresco lista (load)", page);
      await load(page);
      console.log("✔️ Lista refrescada");
    } catch (e) {
      console.error("❌ ERROR general eliminar:", e);
      setErr(e?.message || "Error eliminando documento");
    } finally {
      setDeletingId(null);
      console.groupEnd();
    }
  }

  // cargar lista con filtros
  const load = useCallback(
    async (p = 1) => {
      if (authLoading) {
        console.log(`[Load ⏳ skip @ ${ts()}] authLoading=true, no llamo a documentosApi.list`);
        return;
      }
      console.groupCollapsed(`[Load ▶ @ ${ts()}] page=${p}`);
      try {
        setLoading(true);
        setErr("");

        const payload = {
          page: p,
          limit,
          tipo: filtro.tipo || undefined,
          q: filtro.q || undefined,
          vigentesHoy: filtro.vigentesHoy ? "true" : undefined,
          categoria_id: filtro.categoria_id || undefined,
          subcategoria_id: filtro.subcategoria_id || undefined,
        };
        console.log("→ documentosApi.list payload:", payload);

        const data = await documentosApi.list(payload);

        // 🔎 chequeo defensivo típico cuando la API devolvió HTML (index.html)
        if (typeof data === "string") {
          console.warn("⚠️ documentosApi.list devolvió STRING (posible HTML). Longitud:", data.length);
        }

        console.log("✔️ documentosApi.list OK:", {
          itemsLen: data?.items?.length,
          total: data?.total,
          page: data?.page,
          sampleItem: data?.items?.[0],
        });

        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || p);
      } catch (e) {
        console.error("❌ [load] ERROR:", e);
        // Log extendido por si viene un Response en e.response (algunos wrappers lo guardan)
        if (e?.response) {
          console.error("e.response.status =", e.response.status);
          console.error("e.response.url =", e.response.url);
        }
        setErr(e?.message || "Error cargando documentos");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    },
    [filtro, limit, authLoading]
  );

  useEffect(() => {
    console.log(`[Effect ▶ load(1) @ ${ts()}]`);
    load(1);
  }, [load]);

  const totalPages = useMemo(() => {
    const tp = Math.max(1, Math.ceil(total / limit));
    console.log(`[Memo ℹ️ totalPages @ ${ts()}] total=${total} limit=${limit} => ${tp}`);
    return tp;
  }, [total, limit]);

  function onChangeFiltro(e) {
    const { name, value, type, checked } = e.target;
    const next = {
      ...filtro,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "categoria_id" ? { subcategoria_id: "" } : {}),
    };
    console.log(`[Filtro ✏️ @ ${ts()}] name=${name}`, next);
    setFiltro(next);
  }

  function onSubmit(e) {
    e.preventDefault();
    console.log(`[Filtro ▶ Buscar @ ${ts()}]`, filtro);
    load(1);
  }

  function onLimpiar() {
    console.log(`[Filtro ♻️ Limpiar @ ${ts()}]`);
    const clean = {
      tipo: "",
      q: "",
      vigentesHoy: "",
      categoria_id: "",
      subcategoria_id: "",
    };
    setFiltro(clean);
    setTimeout(() => load(1), 0);
  }

  // ⛔️ Mientras validamos sesión, no dispares llamadas con cookies (evita "Unexpected token '<'")
  if (authLoading) {
    console.log(`[Render ⏳ authLoading @ ${ts()}]`);
    return <div className="p-3">Verificando sesión…</div>;
  }

  if (loading && items.length === 0) {
    console.log(`[Render ⏳ cargando… @ ${ts()}]`);
    return <div className="p-3">Cargando documentos…</div>;
  }

  if (err) {
    console.log(`[Render ❗ err @ ${ts()}]`, err);
    return <div className="alert alert-danger m-3">{err}</div>;
  }

  console.log(`[Render ✅ tabla @ ${ts()}] rows=`, items.length);

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Procedimientos / Manuales / Comunicaciones</strong>
              {String(userRolId) === "1" && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    console.log(`[UI ➕ Nuevo Documento @ ${ts()}]`);
                    navigate("/documentos/nuevo");
                  }}
                >
                  Nuevo Documento
                </Button>
              )}
            </Card.Header>

            <Card.Body>
              {/* Filtros */}
              <Form className="mb-3" onSubmit={onSubmit}>
                <Row className="g-3">
                  {/* Tipo */}
                  <Col md={3}>
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                      name="tipo"
                      value={filtro.tipo}
                      onChange={onChangeFiltro}
                      className="form-control my-input"
                    >
                      <option value="">Todos</option>
                      <option value="PROCESO">Proceso / Procedimiento</option>
                      <option value="MANUAL">Manual / Instructivo</option>
                      <option value="COMUNICACION">Comunicación Interna</option>
                      <option value="CAPACITACION">Capacitación</option>
                    </Form.Select>
                  </Col>

                  {/* Categoría */}
                  <Col md={3}>
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select
                      name="categoria_id"
                      value={filtro.categoria_id}
                      onChange={onChangeFiltro}
                      className="form-control my-input"
                    >
                      <option value="">Todas</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Subcategoría */}
                  <Col md={3}>
                    <Form.Label>Subcategoría / Área</Form.Label>
                    <Form.Select
                      name="subcategoria_id"
                      value={filtro.subcategoria_id}
                      onChange={onChangeFiltro}
                      className="form-control my-input"
                      disabled={!filtro.categoria_id}
                    >
                      <option value="">Todas</option>
                      {subcategorias.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  {/* Búsqueda */}
                  <Col md={3}>
                    <Form.Label>Buscar texto</Form.Label>
                    <Form.Control
                      type="text"
                      name="q"
                      value={filtro.q}
                      onChange={onChangeFiltro}
                      placeholder="Ej: picadora, rendición..."
                    />
                  </Col>

                  {/* Vigentes Hoy */}
                  <Col md={3} className="d-flex align-items-end">
                    <Form.Check
                      type="checkbox"
                      id="vigChk"
                      label="Sólo comunicaciones vigentes hoy"
                      name="vigentesHoy"
                      checked={!!filtro.vigentesHoy}
                      onChange={onChangeFiltro}
                    />
                  </Col>

                  {/* Botones */}
                  <Col md={3} className="d-flex gap-2 align-items-end">
                    <Button type="submit" variant="primary" className="w-100">
                      Buscar
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="w-100"
                      onClick={onLimpiar}
                    >
                      Limpiar
                    </Button>
                  </Col>
                </Row>
              </Form>

              {/* Tabla */}
              <div className="table-responsive">
                <Table bordered hover size="sm" className="mb-2">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Tipo</th>
                      <th>Versión</th>
                      <th>Vigencia</th>
                      <th>Subcategoría</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((doc) => {
                      const vigenciaStr = (() => {
                        const d1 = doc.vigente_desde
                          ? new Date(doc.vigente_desde).toLocaleDateString("es-AR")
                          : "";
                        const d2 = doc.vigente_hasta
                          ? new Date(doc.vigente_hasta).toLocaleDateString("es-AR")
                          : "";
                        if (!d1 && !d2) return "—";
                        return `${d1 || "—"} / ${d2 || "—"}`;
                      })();

                      const isDeletingThis = deletingId === doc.id;

                      return (
                        <tr key={doc.id}>
                          <td>
                            <div className="fw-bold">{doc.titulo}</div>
                            <div className="text-muted small">
                              {doc.descripcion_resumen || "—"}
                            </div>
                          </td>
                          <td>{doc.tipo}</td>
                          <td>{doc.version || "—"}</td>
                          <td>{vigenciaStr}</td>
                          <td>{doc.subcategoria?.nombre || "—"}</td>
                          <td className="text-nowrap">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => {
                                console.log(`[UI 👀 Ver @ ${ts()}] id=${doc.id}`);
                                navigate(`/documentos/${doc.id}`);
                              }}
                              disabled={isDeletingThis}
                            >
                              Ver
                            </Button>

                            {String(userRolId) === "1" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  className="me-2"
                                  onClick={() => abrirEdicion(doc.id)}
                                  disabled={isDeletingThis}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => eliminar(doc.id)}
                                  disabled={isDeletingThis}
                                >
                                  {isDeletingThis ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-1" />
                                      Eliminando...
                                    </>
                                  ) : (
                                    "Eliminar"
                                  )}
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {items.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          Sin resultados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Paginación */}
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Total: {total} documentos — Página {page} de {totalPages}
                </div>
                <Pagination className="mb-0">
                  <Pagination.First disabled={page <= 1} onClick={() => load(1)} />
                  <Pagination.Prev disabled={page <= 1} onClick={() => load(page - 1)} />
                  <Pagination.Item active>{page}</Pagination.Item>
                  <Pagination.Next
                    disabled={page >= totalPages}
                    onClick={() => load(page + 1)}
                  />
                  <Pagination.Last
                    disabled={page >= totalPages}
                    onClick={() => load(totalPages)}
                  />
                </Pagination>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
