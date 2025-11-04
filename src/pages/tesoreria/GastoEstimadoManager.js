import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Card, Container, Row, Col, Button, Table, Form, Spinner, Alert, Badge, Pagination, InputGroup } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import GastoEstimadoModal from "./GastoEstimadoModal";

const apiUrl = process.env.REACT_APP_API_URL;

// ---- Utils ----
const toMoney = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---- API helpers ----
async function fetchEmpresas() {
  const r = await fetch(`${apiUrl}/empresas`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener empresas");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchProveedores() {
  const r = await fetch(`${apiUrl}/proveedores`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener proveedores");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchCategoriasEgreso() {
  const r = await fetch(`${apiUrl}/categorias-egreso`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener categorías");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchSucursales() {
  const r = await fetch(`${apiUrl}/sucursales`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener sucursales");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function listarPlantillas(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const r = await fetch(`${apiUrl}/gasto-estimado?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron listar las plantillas de gasto");
  const data = await r.json();
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  return { items: data.items || [], total: Number(data.total || (data.items || []).length) };
}

async function borrarPlantilla(id) {
  const r = await fetch(`${apiUrl}/gasto-estimado/${id}`, { method: "DELETE", credentials: "include" });
  if (!r.ok) throw new Error("No se pudo eliminar la plantilla");
}

function ActivoBadge({ activo }) {
  const variant = activo ? "success" : "secondary";
  return <Badge bg={variant}>{activo ? "Activo" : "Inactivo"}</Badge>;
}

function RequiereFacturaBadge({ requiere }) {
  const variant = requiere ? "info" : "secondary";
  return <Badge bg={variant}>{requiere ? "Sí" : "No"}</Badge>;
}

// ---- Manager principal ----
export default function GastoEstimadoManager() {
  const dataContext = useContext(Contexts?.DataContext || null);
  const empresaCtx = dataContext?.empresaSeleccionada || null;

  // filtros
  const [empresaId, setEmpresaId] = useState(""); // NUEVO filtro por empresa (opcional)
  const [proveedorId, setProveedorId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [periodicidad, setPeriodicidad] = useState("");
  const [activo, setActivo] = useState(""); // "", "true", "false"
  const [q, setQ] = useState("");

  // data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // catálogos
  const [empresas, setEmpresas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // modal alta/edición
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // carga catálogos
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [emps, prov, cat, sucs] = await Promise.all([
          fetchEmpresas(),
          fetchProveedores(),
          fetchCategoriasEgreso(),
          fetchSucursales(),
        ]);
        if (!cancel) {
          setEmpresas(emps);
          setProveedores(prov);
          setCategorias(cat);
          setSucursales(sucs);
          // Por UX, si hay una empresa en contexto, la preseleccionamos como filtro (pero NO obligatorio)
          if (empresaCtx?.id && !empresaId) setEmpresaId(String(empresaCtx.id));
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancel = true; };
  }, [empresaCtx?.id, empresaId]);

  const cargar = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const params = {
        empresa_id: empresaId || undefined,
        proveedor_id: proveedorId || undefined,
        categoria_id: categoriaId || undefined,
        sucursal_id: sucursalId || undefined,
        periodicidad: periodicidad || undefined,
        activo: activo || undefined, // "true" | "false"
        q: q || undefined,
      };
      const { items, total } = await listarPlantillas(params);

      // Filtro client-side adicional por q si backend no lo soporta
      const filtered = q
        ? items.filter(it =>
            (it.descripcion || "").toLowerCase().includes(q.toLowerCase()) ||
            String(it.proveedor_nombre || it.Proveedor?.nombre || "").toLowerCase().includes(q.toLowerCase()))
        : items;

      setTotal(filtered.length);

      // Paginación client-side si backend no la hace
      const start = (page - 1) * pageSize;
      const end = Math.min(start + pageSize, filtered.length);
      setItems(filtered.slice(start, end));
    } catch (e) {
      setErr(e.message || "Error listando plantillas");
    } finally {
      setLoading(false);
    }
  }, [empresaId, proveedorId, categoriaId, sucursalId, periodicidad, activo, q, page, pageSize]);

  useEffect(() => {
    setPage(1); // reset al cambiar filtros
  }, [empresaId, proveedorId, categoriaId, sucursalId, periodicidad, activo, q, pageSize]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onNew = () => { setEditItem(null); setShowModal(true); };
  const onEdit = (it) => { setEditItem(it); setShowModal(true); };
  const onDelete = async (it) => {
    if (!window.confirm(`¿Eliminar la plantilla "${it.descripcion}"?`)) return;
    try {
      await borrarPlantilla(it.id);
      cargar();
    } catch (e) {
      alert(e.message || "No se pudo eliminar");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Mapeos auxiliares para mostrar nombres si no vienen “join”
  const empNameById = useMemo(() => {
    const m = new Map();
    empresas.forEach(e => m.set(Number(e.id), e.nombrecorto || e.descripcion || `Empresa ${e.id}`));
    return m;
  }, [empresas]);

  const provNameById = useMemo(() => {
    const m = new Map();
    proveedores.forEach(p => m.set(Number(p.id), p.nombre));
    return m;
  }, [proveedores]);

  const catNameById = useMemo(() => {
    const m = new Map();
    categorias.forEach(c => m.set(Number(c.id), c.nombre));
    return m;
  }, [categorias]);

  const sucNameById = useMemo(() => {
    const m = new Map();
    sucursales.forEach(s => m.set(Number(s.id), s.nombre || s.descripcion || `Sucursal ${s.id}`));
    return m;
  }, [sucursales]);

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Gastos Estimados — Plantillas</strong>
              <div className="d-flex gap-2">
                <Button onClick={onNew}>Nueva estimación</Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Filtros */}
              <Form className="mb-3">
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Label>Empresa</Form.Label>
                    <Form.Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="form-control my-input">
                      <option value="">Todas</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombrecorto || emp.descripcion || `Empresa ${emp.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Proveedor</Form.Label>
                    <Form.Select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="form-control my-input">
                      <option value="">Todos</option>
                      {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="form-control my-input">
                      <option value="">Todas</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Sucursal</Form.Label>
                    <Form.Select value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} className="form-control my-input">
                      <option value="">Todas</option>
                      {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre || s.descripcion || `Sucursal ${s.id}`}</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Periodicidad</Form.Label>
                    <Form.Select value={periodicidad} onChange={(e) => setPeriodicidad(e.target.value)} className="form-control my-input">
                      <option value="">Todas</option>
                      <option value="unico">Único</option>
                      <option value="mensual">Mensual</option>
                      <option value="bimestral">Bimestral</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="anual">Anual</option>
                    </Form.Select>
                  </Col>

                  <Col md={2}>
                    <Form.Label>Activo</Form.Label>
                    <Form.Select value={activo} onChange={(e) => setActivo(e.target.value)} className="form-control my-input">
                      <option value="">Todos</option>
                      <option value="true">Activos</option>
                      <option value="false">Inactivos</option>
                    </Form.Select>
                  </Col>

                  <Col md={4}>
                    <Form.Label>Buscar</Form.Label>
                    <InputGroup>
                      <Form.Control placeholder="Descripción, proveedor…" value={q} onChange={(e) => setQ(e.target.value)} />
                      <Button variant="outline-secondary" onClick={() => cargar()} className="mx-2">Buscar</Button>
                    </InputGroup>
                  </Col>

                  <Col md="auto" className="d-flex align-items-end">
                    <Form.Label className="me-2">Por página</Form.Label>
                    <Form.Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ width: 90 }} className="form-control my-input mx-2">
                      {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </Form.Select>
                  </Col>
                </Row>
              </Form>

              {err && <Alert variant="danger">{err}</Alert>}

              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table bordered hover size="sm" className="mb-2">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Descripción</th>
                          <th>Empresa</th>
                          <th>Proveedor</th>
                          <th>Categoría</th>
                          <th>Sucursal</th>
                          <th>Periodicidad</th>
                          <th>Día venc.</th>
                          <th className="text-end">Monto estimado</th>
                          <th>Req. factura</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 && (
                          <tr><td colSpan={12} className="text-center text-muted">Sin resultados</td></tr>
                        )}
                        {items.map((it) => (
                          <tr key={it.id}>
                            <td>{it.id}</td>
                            <td>{it.descripcion || "-"}</td>
                            <td>{it.empresa_nombre || empNameById.get(Number(it.empresa_id)) || "-"}</td>
                            <td>{it.proveedor_nombre || it.Proveedor?.nombre || provNameById.get(Number(it.proveedor_id)) || "-"}</td>
                            <td>{it.categoria_nombre || it.CategoriaEgreso?.nombre || catNameById.get(Number(it.categoriaegreso_id)) || "-"}</td>
                            <td>{it.sucursal_nombre || sucNameById.get(Number(it.sucursal_id)) || "-"}</td>
                            <td>{it.periodicidad}</td>
                            <td>{it.dia_vencimiento_default ?? "-"}</td>
                            <td className="text-end">${toMoney(it.monto_estimado_default)}</td>
                            <td><RequiereFacturaBadge requiere={Boolean(it.requiere_factura)} /></td>
                            <td><ActivoBadge activo={it.activo !== false} /></td>
                            <td className="text-nowrap">
                              <Button size="sm" variant="outline-primary" className="me-1" onClick={() => onEdit(it)}>Editar</Button>
                              <Button size="sm" variant="outline-danger" onClick={() => onDelete(it)} className="mx-2">Eliminar</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">Total: {total} ítems</div>
                    <Pagination className="mb-0">
                      <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
                      <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} />
                      <Pagination.Item active>{page}</Pagination.Item>
                      <Pagination.Next disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
                      <Pagination.Last disabled={page === totalPages} onClick={() => setPage(totalPages)} />
                    </Pagination>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alta/Edición */}
      <GastoEstimadoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        // Si querés, preseleccionamos la empresa del filtro o la del contexto, pero NO es obligatorio:
        empresaId={empresaId || empresaCtx?.id || null}
        initialData={editItem}
        onSaved={() => { setShowModal(false); cargar(); }}
      />
    </Container>
  );
}
