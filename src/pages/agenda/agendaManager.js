import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    Card, Container, Row, Col, Button, Table, Form, Spinner, Alert,
    Badge, Pagination, InputGroup
} from "react-bootstrap";
import Contexts from "../../context/Contexts";
import AgendaModal from "./agendaModal";

const apiUrl = process.env.REACT_APP_API_URL;

const isNil = (v) => v === null || v === undefined || v === "";

function cmpBase(a, b, type = "string") {
    // nulls/vacíos al final
    const an = isNil(a), bn = isNil(b);
    if (an && bn) return 0;
    if (an) return 1;
    if (bn) return -1;

    if (type === "number") {
        const na = Number(a), nb = Number(b);
        if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
        if (Number.isNaN(na)) return 1;
        if (Number.isNaN(nb)) return -1;
        return na - nb;
    }

    if (type === "date") {
        // yyyy-mm-dd sortable como string; si viniera en otro formato: Date.parse
        return String(a).localeCompare(String(b));
    }

    // string (locale + numeric)
    return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
}

// Pequeño componente para mostrar flechitas en el header
function SortIcon({ active, dir }) {
    if (!active) return <span className="text-muted">↕</span>;
    return dir === "asc" ? <span>▲</span> : <span>▼</span>;
}


/* ==================== Utils ==================== */
const toMoney = (n) =>
    Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const today = () => new Date().toISOString().slice(0, 10);

/* ==================== API helpers ==================== */
function qsFrom(obj = {}) {
    const qs = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    return qs.toString();
}

async function listarAgenda(params = {}) {
    const r = await fetch(`${apiUrl}/agenda?${qsFrom(params)}`, { credentials: "include" });
    if (!r.ok) throw new Error("No se pudo listar la agenda");
    const data = await r.json();
    return Array.isArray(data) ? data : [];
}

async function eliminarAgenda(id) {
    const r = await fetch(`${apiUrl}/agenda/${id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) {
        const msg = await r.text().catch(() => "");
        throw new Error(msg || "No se pudo eliminar el registro");
    }
    return r.json();
}

async function cambiarEstadoAgenda(id, nuevo) {
    const r = await fetch(`${apiUrl}/agenda/${id}/estado`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realizado: nuevo }),
    });
    if (!r.ok) {
        const msg = await r.text().catch(() => "");
        throw new Error(msg || "No se pudo cambiar el estado");
    }
    return r.json();
}

/* ==================== Badges ==================== */
function ImportanciaBadge({ val }) {
    const map = { baja: "secondary", media: "primary", alta: "warning", critica: "danger" };
    return <Badge bg={map[val] || "secondary"} className="text-uppercase">{val || "—"}</Badge>;
}
function EstadoBadge({ val }) {
    const map = { pendiente: "secondary", parcial: "warning", realizado: "success", postergado: "info" };
    return <Badge bg={map[val] || "secondary"} className="text-uppercase">{val || "—"}</Badge>;
}

/* ==================== Componente principal ==================== */
export default function AgendaManager() {
    // Contextos
    const dataCtx = useContext(Contexts.DataContext);
    const userCtx = useContext(Contexts.UserContext);

    const { empresasTabla = [], sucursalesTabla = [] } = dataCtx || {};
    const { user } = userCtx || {};

    // Filtros
    const [empresaId, setEmpresaId] = useState("");
    const [sucursalId, setSucursalId] = useState("");
    const [importancia, setImportancia] = useState("");
    const [realizado, setRealizado] = useState(""); // pendiente/parcial/realizado/postergado
    const [periodicidad, setPeriodicidad] = useState("");
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    const [q, setQ] = useState("");

    // Paginación
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Data UI
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    // Modal crear/editar
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [fechaCampo, setFechaCampo] = useState("fecha_vencimiento"); // "fecha" | "fecha_vencimiento"

    const [sortBy, setSortBy] = useState("fecha_vencimiento"); // col inicial
    const [sortDir, setSortDir] = useState("asc");             // "asc" | "desc"


    // Mapeos ID→Nombre
    const empNameById = useMemo(() => {
        const m = new Map();
        (empresasTabla || []).forEach(e =>
            m.set(Number(e.id), e.nombrecorto || e.descripcion || e.razon_social || `Empresa ${e.id}`)
        );
        return m;
    }, [empresasTabla]);

    const sucNameById = useMemo(() => {
        const m = new Map();
        (sucursalesTabla || []).forEach(s =>
            m.set(Number(s.id), s.nombre || s.descripcion || `Sucursal ${s.id}`)
        );
        return m;
    }, [sucursalesTabla]);

    // Cómo obtener el valor de orden por columna y su tipo
    const columnConfig = useMemo(() => ({
        id: { get: (r) => Number(r.id), type: "number" },
        titulo: { get: (r) => r.titulo || "", type: "string" },
        empresa: { get: (r) => empNameById.get(Number(r.empresa_id)) || "", type: "string" },
        sucursal: { get: (r) => sucNameById.get(Number(r.sucursal_id)) || "", type: "string" },
        importancia: { get: (r) => r.importancia || "", type: "string" },
        realizado: { get: (r) => r.realizado || "", type: "string" },
        fecha: { get: (r) => r.fecha || "", type: "date" },
        fecha_venc: { get: (r) => r.fecha_vencimiento || (r.dia_vencimiento ? `9999-12-${String(r.dia_vencimiento).padStart(2, "0")}` : ""), type: "date" },
        periodicidad: { get: (r) => r.periodicidad || "", type: "string" },
        costo: { get: (r) => r.costo != null ? Number(r.costo) : null, type: "number" },
    }), [empNameById, sucNameById]);


    // Carga
    const cargar = useCallback(async () => {
        console.log("user", user)
        setLoading(true);
        setErr(null);
        try {
            const params = {
                empresa_id: empresaId || undefined,
                sucursal_id: sucursalId || undefined,
                importancia: importancia || undefined,
                realizado: realizado || undefined,
                periodicidad: periodicidad || undefined,
                fecha_desde: desde || undefined,
                fecha_hasta: hasta || undefined,
                fecha_campo: fechaCampo,            // <-- enviar qué campo filtrar
                q: q || undefined,
                limit: 10000,
            };

            const raw = await listarAgenda(params);

            // Orden dinámico por columna elegida
            const cfg = columnConfig[sortBy] || columnConfig["fecha_venc"];
            raw.sort((a, b) => {
                const va = cfg.get(a);
                const vb = cfg.get(b);
                const comp = cmpBase(va, vb, cfg.type);
                return sortDir === "asc" ? comp : -comp;
            });

            setTotal(raw.length);
            const start = (page - 1) * pageSize;
            setItems(raw.slice(start, start + pageSize));
        } catch (e) {
            setErr(e.message || "No se pudo listar la agenda");
            setItems([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [empresaId, sucursalId, importancia, realizado, periodicidad, desde, hasta, q, page, pageSize, sortBy, sortDir, columnConfig]);

    useEffect(() => { setPage(1); }, [empresaId, sucursalId, importancia, realizado, periodicidad, desde, hasta, q, pageSize]);
    useEffect(() => { cargar(); }, [cargar]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Acciones
    const onCrear = () => { setEditId(null); setShowModal(true); };
    const onEditar = (id) => { setEditId(id); setShowModal(true); };
    const onEliminar = async (id) => {
        if (!window.confirm(`¿Eliminar el registro #${id}? Esta acción no se puede deshacer.`)) return;
        try {
            await eliminarAgenda(id);
            await cargar();
        } catch (e) {
            alert(e.message || "No se pudo eliminar");
        }
    };
    const onMarcar = async (id, nuevoEstado) => {
        try {
            await cambiarEstadoAgenda(id, nuevoEstado);
            await cargar();
        } catch (e) {
            alert(e.message || "No se pudo cambiar el estado");
        }
    };

    function toggleSort(colKey) {
        if (sortBy === colKey) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(colKey);
            setSortDir("asc");
        }
    }

    return (
        <Container fluid className="mt-3">
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <strong>Agenda (tareas / vencimientos)</strong>
                            <div>
                                <Button variant="success" onClick={onCrear}>Nueva tarea</Button>
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
                                            {empresasTabla.map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.nombrecorto || emp.descripcion || emp.razon_social || `Empresa ${emp.id}`}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Sucursal</Form.Label>
                                        <Form.Select value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} className="form-control my-input">
                                            <option value="">Todas</option>
                                            {sucursalesTabla.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nombre || s.descripcion || `Sucursal ${s.id}`}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Importancia</Form.Label>
                                        <Form.Select value={importancia} onChange={(e) => setImportancia(e.target.value)} className="form-control my-input">
                                            <option value="">Todas</option>
                                            <option value="baja">Baja</option>
                                            <option value="media">Media</option>
                                            <option value="alta">Alta</option>
                                            <option value="critica">Crítica</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Estado</Form.Label>
                                        <Form.Select value={realizado} onChange={(e) => setRealizado(e.target.value)} className="form-control my-input">
                                            <option value="">Todos</option>
                                            <option value="pendiente">Pendiente</option>
                                            <option value="parcial">Parcial</option>
                                            <option value="realizado">Realizado</option>
                                            <option value="postergado">Postergado</option>
                                        </Form.Select>
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label>Periodicidad</Form.Label>
                                        <Form.Select value={periodicidad} onChange={(e) => setPeriodicidad(e.target.value)} className="form-control my-input">
                                            <option value="">Todas</option>
                                            <option value="unica">Única</option>
                                            <option value="diaria">Diaria</option>
                                            <option value="semanal">Semanal</option>
                                            <option value="mensual">Mensual</option>
                                            <option value="anual">Anual</option>
                                        </Form.Select>
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label>Campo de fecha</Form.Label>
                                        <Form.Select
                                            value={fechaCampo}
                                            onChange={(e) => setFechaCampo(e.target.value)}
                                            className="form-control my-input"
                                        >
                                            <option value="fecha_vencimiento">Vencimiento</option>
                                            <option value="fecha">Fecha (inicio)</option>
                                        </Form.Select>
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label>Desde</Form.Label>
                                        <Form.Control type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label>Hasta</Form.Label>
                                        <Form.Control type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label>Buscar</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                placeholder="Título, descripción u observaciones…"
                                                value={q}
                                                onChange={(e) => setQ(e.target.value)}
                                            />
                                            <Button variant="outline-secondary" onClick={() => cargar()} className="mx-2">
                                                Buscar
                                            </Button>
                                        </InputGroup>
                                    </Col>

                                    <Col md="auto" className="d-flex align-items-end">
                                        <Form.Label className="me-2">Por página</Form.Label>
                                        <Form.Select
                                            value={pageSize}
                                            onChange={(e) => setPageSize(Number(e.target.value))}
                                            style={{ width: 90 }}
                                            className="form-control my-input mx-2"
                                        >
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
                                                    <th role="button" onClick={() => toggleSort("id")}>
                                                        # <SortIcon active={sortBy === "id"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" onClick={() => toggleSort("titulo")}>
                                                        Título <SortIcon active={sortBy === "titulo"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" onClick={() => toggleSort("empresa")}>
                                                        Empresa <SortIcon active={sortBy === "empresa"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" onClick={() => toggleSort("sucursal")}>
                                                        Sucursal <SortIcon active={sortBy === "sucursal"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" onClick={() => toggleSort("importancia")}>
                                                        Importancia <SortIcon active={sortBy === "importancia"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" onClick={() => toggleSort("realizado")}>
                                                        Estado <SortIcon active={sortBy === "realizado"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" onClick={() => toggleSort("fecha")}>
                                                        Fecha <SortIcon active={sortBy === "fecha"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" onClick={() => toggleSort("fecha_venc")}>
                                                        Vencimiento <SortIcon active={sortBy === "fecha_venc"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" onClick={() => toggleSort("periodicidad")}>
                                                        Periodicidad <SortIcon active={sortBy === "periodicidad"} dir={sortDir} />
                                                    </th>
                                                    <th role="button" className="text-end" onClick={() => toggleSort("costo")}>
                                                        Costo <SortIcon active={sortBy === "costo"} dir={sortDir} />
                                                    </th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.length === 0 && (
                                                    <tr><td colSpan={11} className="text-center text-muted">Sin resultados</td></tr>
                                                )}
                                                {items.map(it => (
                                                    <tr key={it.id}>
                                                        <td>{it.id}</td>
                                                        <td>{it.titulo || "-"}</td>
                                                        <td>{empNameById.get(Number(it.empresa_id)) || "-"}</td>
                                                        <td>{sucNameById.get(Number(it.sucursal_id)) || "-"}</td>
                                                        <td><ImportanciaBadge val={it.importancia} /></td>
                                                        <td><EstadoBadge val={it.realizado} /></td>
                                                        <td>{it.fecha || "-"}</td>
                                                        <td>{it.fecha_vencimiento || (it.dia_vencimiento ? `día ${it.dia_vencimiento}` : "-")}</td>
                                                        <td className="text-capitalize">{it.periodicidad}</td>
                                                        <td className="text-end">{it.costo != null ? `$${toMoney(it.costo)}` : "-"}</td>
                                                        <td className="text-nowrap">
                                                            {/* Acciones rápidas de estado */}
                                                            {it.realizado !== "realizado" && (
                                                                <Button size="sm" variant="outline-success" className="mx-2"
                                                                    onClick={() => onMarcar(it.id, "realizado")}>
                                                                    Marcar realizado
                                                                </Button>
                                                            )}
                                                            {it.realizado !== "pendiente" && (
                                                                <Button size="sm" variant="outline-secondary" className="mx-2"
                                                                    onClick={() => onMarcar(it.id, "pendiente")}>
                                                                    Marcar pendiente
                                                                </Button>
                                                            )}
                                                            <Button size="sm" variant="outline-primary" className="mx-2"
                                                                onClick={() => onEditar(it.id)}>
                                                                Editar
                                                            </Button>
                                                            <Button size="sm" variant="outline-danger" className="mx-2" onClick={() => onEliminar(it.id)}>
                                                                Eliminar
                                                            </Button>
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

            {/* Modal Crear/Editar */}
            {showModal && (
                <AgendaModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agendaId={editId}
                    defaultEmpresaId={empresaId ? Number(empresaId) : null}
                    defaultSucursalId={sucursalId ? Number(sucursalId) : null}
                    defaultResponsableId={user?.id || null}
                    onSaved={() => cargar()}
                />
            )}
        </Container>
    );
}
