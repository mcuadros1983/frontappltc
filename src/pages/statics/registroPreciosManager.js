// RegistroPrecioManager.jsx
import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  Card, Container, Row, Col, Button, Table, Form, Spinner, Alert,
  Pagination, InputGroup, Badge, FormControl
} from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import RegistroPrecioModal from "./registroPreciosModal";
import Contexts from "../../context/Contexts.js";
import "../../components/css/RegistroPrecioManager.css"; // ⬅️ NUEVO

const apiUrl = process.env.REACT_APP_API_URL;

/* =======================
   API helpers
   ======================= */
async function listarRegistroPrecios(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const r = await fetch(`${apiUrl}/registro-precios?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron listar los precios");
  return r.json(); // { total, page, pageSize, rows }
}

async function fetchArticulosPrecios() {
  const r = await fetch(`${apiUrl}/obtenerarticulosprecios`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener artículos con precios");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

/* =======================
   Componente principal
   ======================= */
export default function RegistroPrecioManager() {
  // catálogo (normalizado)
  const [articulos, setArticulos] = useState([]); // [{articulo_id, codigobarra, descripcion}]
  const [articulosSrc, setArticulosSrc] = useState([]); // crudo de /obtenerarticulosprecios

  // filtros
  const [articuloId, setArticuloId] = useState("");
  const [codigobarra, setCodigobarra] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [q, setQ] = useState("");

  // listado
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // ui
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // paginación (SOLO servidor)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100); // ejemplo
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // orden (client-side solo sobre la página actual)
  const [sortColumn, setSortColumn] = useState("fecha"); // fecha | codigobarra | descripcion | precio
  const [sortDirection, setSortDirection] = useState("desc");

  // modal
  const [showModal, setShowModal] = useState(false);

  const context = useContext(Contexts.DataContext);

  /* ---------- Cargar catálogo ---------- */
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchArticulosPrecios();
        if (cancel) return;
        setArticulosSrc(data);

        const map = new Map();
        data.forEach(item => {
          const a = item.ArticuloTabla || item.Articulotabla || item.articulo || {};
          const key = a.id ?? item.articulo_id;
          if (!key) return;
          if (!map.has(key)) {
            map.set(key, {
              articulo_id: key,
              codigobarra: a.codigobarra || "",
              descripcion: a.descripcion || `Artículo ${key}`,
            });
          }
        });

        const arr = Array.from(map.values());
        arr.sort((x, y) => (x.descripcion || "").localeCompare(y.descripcion || ""));
        setArticulos(arr);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // mapa id → meta
  const articuloById = useMemo(() => {
    const m = new Map();
    articulos.forEach(a => m.set(Number(a.articulo_id), a));
    return m;
  }, [articulos]);

  /* ---------- Cargar registros (paginación de servidor) ---------- */
  const cargar = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const params = {
        page,
        pageSize,
        desde: desde || undefined,
        hasta: hasta || undefined,
        articulo_id: articuloId || undefined,
        codigobarra: codigobarra || undefined,
        orderBy: "fecha",
        orderDir: "DESC",
      };

      const { total, rows } = await listarRegistroPrecios(params);

      // (Opcional) filtro de texto client-side SOLO sobre esta página
      const filtered = q
        ? rows.filter(r => {
            const meta = articuloById.get(Number(r.articulo_id));
            const desc = (meta?.descripcion || "").toLowerCase();
            const code = (r.codigobarra || meta?.codigobarra || "").toLowerCase();
            const text = q.toLowerCase();
            return desc.includes(text) || code.includes(text);
          })
        : rows;

      setRows(filtered);
      setTotal(total); // importante: mantener total del servidor
    } catch (e) {
      setErr(e.message || "Error listando precios");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, desde, hasta, articuloId, codigobarra, q, articuloById]);

  // reset de página ante cambios de filtros
  useEffect(() => { setPage(1); }, [desde, hasta, articuloId, codigobarra, q, pageSize]);

  useEffect(() => { cargar(); }, [cargar]);

  /* ---------- Ordenamiento client-side (solo sobre la página actual) ---------- */
  const sortedRows = useMemo(() => {
    const arr = [...rows];
    const dir = sortDirection === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      let A, B;
      switch (sortColumn) {
        case "codigobarra": {
          const aMeta = articuloById.get(Number(a.articulo_id));
          const bMeta = articuloById.get(Number(b.articulo_id));
          A = (a.codigobarra || aMeta?.codigobarra || "").toLowerCase();
          B = (b.codigobarra || bMeta?.codigobarra || "").toLowerCase();
          break;
        }
        case "descripcion": {
          const aMeta = articuloById.get(Number(a.articulo_id));
          const bMeta = articuloById.get(Number(b.articulo_id));
          A = (aMeta?.descripcion || "").toLowerCase();
          B = (bMeta?.descripcion || "").toLowerCase();
          break;
        }
        case "precio":
          A = Number(a.precio || 0);
          B = Number(b.precio || 0);
          break;
        case "fecha":
        default:
          A = a.fecha || "";
          B = b.fecha || "";
          break;
      }
      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });
    return arr;
  }, [rows, sortColumn, sortDirection, articuloById]);

  const handleSort = (columnName) => {
    if (columnName === sortColumn) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnName);
      setSortDirection(columnName === "precio" ? "desc" : "asc");
    }
  };

  return (
    <Container fluid className="mt-3 rpm-page px-3">
      <Row>
        <Col>
          <Card className="rpm-card">
            <Card.Header className="d-flex justify-content-between align-items-center rpm-header">
              <strong>Registro de precios históricos</strong>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={() => setShowModal(true)} className="rpm-btn">
                  Nuevo registro
                </Button>
              </div>
            </Card.Header>

            <Card.Body className="rpm-body">
              {/* Filtros */}
              <Row className="g-3 mb-3 rpm-toolbar">
                <Col md={3}>
                  <label className="form-label">Artículo</label>
                  <Form.Select
                    value={articuloId}
                    onChange={(e) => setArticuloId(e.target.value)}
                    className="form-control my-input rpm-input"
                  >
                    <option value="">Todos</option>
                    {articulos.map(a => (
                      <option key={a.articulo_id} value={a.articulo_id}>
                        {a.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <label className="form-label">Código de barras</label>
                  <FormControl
                    value={codigobarra}
                    onChange={(e) => setCodigobarra(e.target.value)}
                    placeholder="Filtrar por código"
                    className="form-control my-input rpm-input"
                  />
                </Col>

                <Col md={2}>
                  <label className="form-label">Desde</label>
                  <FormControl
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="form-control my-input rpm-input"
                  />
                </Col>

                <Col md={2}>
                  <label className="form-label">Hasta</label>
                  <FormControl
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="form-control my-input rpm-input"
                  />
                </Col>

                <Col md={2}>
                  <label className="form-label">Buscar</label>
                  <InputGroup>
                    <FormControl
                      placeholder="Descripción / Código"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="form-control my-input rpm-input"
                    />
                    <Button variant="outline-secondary" onClick={() => cargar()} className="mx-2 rpm-btn-outline">
                      Buscar
                    </Button>
                  </InputGroup>
                </Col>

                <Col md="auto" className="d-flex align-items-end">
                  <label className="me-2">Por página</label>
                  <Form.Select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{ width: 90 }}
                    className="form-control my-input mx-2 rpm-input"
                  >
                    {[10, 20, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
                  </Form.Select>
                </Col>
              </Row>

              {err && <Alert variant="danger" className="rpm-alert">{err}</Alert>}

              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <>
                  <div className="table-responsive rpm-tablewrap">
                    <Table bordered hover size="sm" className="mb-2 rpm-table">
                      <thead>
                        <tr>
                          <th style={{ width: 70 }}>#</th>
                          <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                            Fecha {sortColumn === "fecha" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th onClick={() => handleSort("codigobarra")} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                            Código {sortColumn === "codigobarra" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th onClick={() => handleSort("descripcion")} style={{ cursor: "pointer" }}>
                            Descripción {sortColumn === "descripcion" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th className="text-end" onClick={() => handleSort("precio")} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                            Precio {sortColumn === "precio" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th>Artículo ID</th>
                          <th>Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRows.length === 0 && (
                          <tr><td colSpan={7} className="text-center text-muted">Sin resultados</td></tr>
                        )}
                        {sortedRows.map((r) => {
                          const meta = articuloById.get(Number(r.articulo_id));
                          const code = r.codigobarra || meta?.codigobarra || "";
                          const desc = meta?.descripcion || "-";
                          return (
                            <tr key={r.id}>
                              <td>{r.id}</td>
                              <td>{r.fecha}</td>
                              <td>{code}</td>
                              <td>{desc}</td>
                              <td className="text-end">
                                ${Number(r.precio || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td><Badge bg="secondary" className="rpm-badge">{r.articulo_id ?? "-"}</Badge></td>
                              <td className="text-muted">—</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>

                  {/* Paginación (servidor) */}
                  <div className="d-flex justify-content-between align-items-center rpm-pager">
                    <div className="text-muted">
                      Total: {total} ítems • Página {page} de {totalPages}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button size="sm" onClick={() => setPage(1)} disabled={page === 1} className="rpm-btn">
                        «
                      </Button>
                      <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rpm-btn">
                        <BsChevronLeft />
                      </Button>
                      <span className="mx-2">
                        {page} / {totalPages}
                      </span>
                      <Button size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rpm-btn">
                        <BsChevronRight />
                      </Button>
                      <Button size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages} className="rpm-btn">
                        »
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de alta masiva por fecha */}
      {showModal && (
        <RegistroPrecioModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            cargar();
          }}
          articulosConPrecios={articulosSrc}
          articulosTabla={context?.articulosTabla /* si lo tenés en contexto */}
        />
      )}
    </Container>
  );
}
