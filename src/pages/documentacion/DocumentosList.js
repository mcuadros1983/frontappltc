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

export default function DocumentosList() {
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

  // ✅ Cargar categorías una sola vez (cuando haya sesión lista)
  useEffect(() => {
    if (authLoading) return;
    async function cargarCategorias() {
      try {
        const cats = await categoriasApi.getCategorias();
        setCategorias(cats || []);
      } catch (e) {
        console.error("Error cargando categorias:", e);
      }
    }
    cargarCategorias();
  }, [authLoading]);

  // cuando cambia categoria_id en filtro => cargar subcategorías visibles
  useEffect(() => {
    if (authLoading) return;
    async function cargarSubs() {
      if (!filtro.categoria_id) {
        setSubcategorias([]);
        return;
      }
      try {
        const subs = await categoriasApi.getSubcategorias(filtro.categoria_id);
        setSubcategorias(subs || []);
      } catch (e) {
        console.error("Error cargando subcategorias:", e);
      }
    }
    cargarSubs();
  }, [filtro.categoria_id, authLoading]);

  // editar => navegamos al form unificado en modo edición
  function abrirEdicion(id) {
    navigate(`/documentos/${id}/editar`);
  }

  // eliminar documento (Drive + DB)
  async function eliminar(id) {
    if (!window.confirm("¿Seguro que querés eliminar este documento y su archivo asociado?")) return;

    try {
      setDeletingId(id);
      setErr("");

      // 1) Traer el documento para saber el archivo relacionado
      const fullDoc = await documentosApi.getById(id);

      // si viene como array de archivos, tomamos el primero
      const archivoDrive =
        Array.isArray(fullDoc.archivos) && fullDoc.archivos.length > 0
          ? fullDoc.archivos[0]
          : null;

      // 2) Si hay archivo en Drive, intentar borrarlo por drive_file_id
      if (archivoDrive?.drive_file_id) {
        try {
          await documentosApi.deleteUploadedFile(archivoDrive.drive_file_id);
        } catch (e) {
          console.error("[eliminar] ERROR eliminando archivo en Drive:", e);
          setErr("No se pudo eliminar el archivo en Drive. No se borró el documento.");
          setDeletingId(null);
          return;
        }
      }

      // 3) Borrar el documento en la base
      await documentosApi.remove(id);

      // 4) Refrescar la lista
      await load(page);
    } catch (e) {
      console.error("[eliminar] ERROR general:", e);
      setErr(e?.message || "Error eliminando documento");
    } finally {
      setDeletingId(null);
    }
  }

  // cargar lista con filtros
  const load = useCallback(
    async (p = 1) => {
      if (authLoading) return;
      try {
        setLoading(true);
        setErr("");

        const data = await documentosApi.list({
          page: p,
          limit,
          tipo: filtro.tipo || undefined,
          q: filtro.q || undefined,
          vigentesHoy: filtro.vigentesHoy ? "true" : undefined,
          categoria_id: filtro.categoria_id || undefined,
          subcategoria_id: filtro.subcategoria_id || undefined,
        });

        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || p);
      } catch (e) {
        console.error("[load] ERROR:", e);
        setErr(e?.message || "Error cargando documentos");
      } finally {
        setLoading(false);
      }
    },
    [filtro, limit, authLoading]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  function onChangeFiltro(e) {
    const { name, value, type, checked } = e.target;
    setFiltro((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "categoria_id" ? { subcategoria_id: "" } : {}),
    }));
  }

  function onSubmit(e) {
    e.preventDefault();
    load(1);
  }

  function onLimpiar() {
    setFiltro({
      tipo: "",
      q: "",
      vigentesHoy: "",
      categoria_id: "",
      subcategoria_id: "",
    });
    setTimeout(() => load(1), 0);
  }

  // ⛔️ Mientras validamos sesión, no dispares llamadas con cookies (evita "Unexpected token '<'")
  if (authLoading) {
    return <div className="p-3">Verificando sesión…</div>;
  }

  if (loading && items.length === 0) {
    return <div className="p-3">Cargando documentos…</div>;
  }

  if (err) {
    return <div className="alert alert-danger m-3">{err}</div>;
  }

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
                  onClick={() => navigate("/documentos/nuevo")}
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
                              onClick={() => navigate(`/documentos/${doc.id}`)}
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
