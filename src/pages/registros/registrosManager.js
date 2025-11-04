import React, { useEffect, useMemo, useState } from "react";
import {
  Card, Container, Row, Col, Button, Table, Form, Spinner, Alert,
  Pagination, InputGroup, Modal, Badge
} from "react-bootstrap";

const API = process.env.REACT_APP_API_URL;

const initialFilters = {
  q: "",
  usuario: "",
  usuario_id: "",
  entidad: "",
  entidad_id: "",
  accion: "",
  resultado: "",
  empresa_id: "",
  sucursal_id: "",
  critico: "",
  fecha_desde: "",
  fecha_hasta: "",
  order_by: "fecha",
  order_dir: "DESC",
  limit: 50,
  offset: 0,
};

const acciones = [
  "", "create","update","delete","delete_soft","delete_hard","state_change","postpone",
  "read","read_one","read_upcoming","link","unlink","login","logout","error","other",
];

const resultados = ["", "success", "fail"];

export default function RegistroManager() {
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ items: [], total: 0, limit: 50, offset: 0 });
  const [error, setError] = useState("");

  // Modal purge
  const [showPurge, setShowPurge] = useState(false);
  const [purge, setPurge] = useState({
    fecha_desde: "",
    fecha_hasta: "",
    dry_run: true,
  });
  const [purgeResult, setPurgeResult] = useState(null);
  const [purging, setPurging] = useState(false);

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) params.set(k, v);
    });
    return params.toString();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auditoria?${queryString}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setError("No se pudieron obtener los registros de auditoría");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [queryString]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value, offset: name === "limit" ? 0 : f.offset }));
  };

  const toggleCritico = () => {
    setFilters((f) => ({
      ...f,
      critico: f.critico === "true" ? "" : "true",
      offset: 0,
    }));
  };

  const handlePage = (dir) => {
    setFilters((f) => {
      const next = { ...f };
      const delta = Number(f.limit) || 50;
      if (dir === "prev") {
        next.offset = Math.max(0, Number(f.offset) - delta);
      } else {
        next.offset = Number(f.offset) + delta;
      }
      return next;
    });
  };

  const canPrev = Number(filters.offset) > 0;
  const canNext = Number(filters.offset) + Number(filters.limit) < Number(data.total || 0);
  const resetFilters = () => setFilters(initialFilters);

  // ===== PURGE =====
  const doDryRun = async () => {
    setPurging(true);
    setPurgeResult(null);
    try {
      const res = await fetch(`${API}/auditoria/purge`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...purge, dry_run: "1" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setPurgeResult(json);
    } catch (e) {
      setPurgeResult({ error: e.message });
    } finally {
      setPurging(false);
    }
  };

  const doPurge = async () => {
    if (!purge.fecha_desde || !purge.fecha_hasta) {
      setPurgeResult({ error: "Debes indicar fecha_desde y fecha_hasta" });
      return;
    }
    setPurging(true);
    setPurgeResult(null);
    try {
      const res = await fetch(`${API}/auditoria/purge`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...purge, dry_run: "0" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setPurgeResult(json);
      fetchData();
    } catch (e) {
      setPurgeResult({ error: e.message });
    } finally {
      setPurging(false);
    }
  };

  return (
    <Container fluid className="mt-3">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <strong>Auditoría — Registros</strong>
            {loading && <Spinner animation="border" size="sm" />}
            {!loading && (
              <Badge bg="light" text="dark">
                Total: {data.total ?? 0}
              </Badge>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
            <Button variant="outline-danger" size="sm" onClick={() => setShowPurge(true)} className="mx-2"> 
              Purgar por rango…
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {/* FILTROS */}
          <div className="filter-bar mb-3">
            <Row className="g-2 align-items-end">
              <Col xxl={3} lg={4}>
                <Form.Label className="mb-1">Buscar</Form.Label>
                <InputGroup>
                  <Form.Control
                    className="my-input"
                    placeholder="Detalle, ruta, UA, usuario, entidad…"
                    name="q"
                    value={filters.q}
                    onChange={onChange}
                  />
                  <Button variant="outline-secondary" onClick={fetchData} className="mx-2">Buscar</Button>
                </InputGroup>
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Usuario</Form.Label>
                <Form.Control
                  className="my-input"
                  placeholder="Texto"
                  name="usuario"
                  value={filters.usuario}
                  onChange={onChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Usuario ID</Form.Label>
                <Form.Control
                  className="my-input"
                  placeholder="ID"
                  name="usuario_id"
                  value={filters.usuario_id}
                  onChange={onChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Entidad</Form.Label>
                <Form.Control
                  className="my-input"
                  placeholder="Modelo"
                  name="entidad"
                  value={filters.entidad}
                  onChange={onChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Entidad ID</Form.Label>
                <Form.Control
                  className="my-input"
                  placeholder="ID"
                  name="entidad_id"
                  value={filters.entidad_id}
                  onChange={onChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Acción</Form.Label>
                <Form.Select name="accion" value={filters.accion} onChange={onChange} className="form-control my-input">
                  {acciones.map(a => <option key={a} value={a}>{a || "Todas"}</option>)}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Resultado</Form.Label>
                <Form.Select name="resultado" value={filters.resultado} onChange={onChange} className="form-control my-input">
                  {resultados.map(r => <option key={r} value={r}>{r || "Todos"}</option>)}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Empresa ID</Form.Label>
                <Form.Control
                  className="my-input"
                  name="empresa_id"
                  value={filters.empresa_id}
                  onChange={onChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Sucursal ID</Form.Label>
                <Form.Control
                  className="my-input"
                  name="sucursal_id"
                  value={filters.sucursal_id}
                  onChange={onChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Crítico</Form.Label>
                <div>
                  <Button
                    variant={filters.critico === "true" ? "danger" : "outline-secondary"}
                    className="my-input w-100"
                    onClick={toggleCritico}
                  >
                    {filters.critico === "true" ? "Solo críticos" : "Todos"}
                  </Button>
                </div>
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Desde</Form.Label>
                <Form.Control
                  type="date"
                  className="my-input"
                  name="fecha_desde"
                  value={filters.fecha_desde}
                  onChange={onChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Hasta</Form.Label>
                <Form.Control
                  type="date"
                  className="my-input"
                  name="fecha_hasta"
                  value={filters.fecha_hasta}
                  onChange={onChange}
                />
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Ordenar por</Form.Label>
                <Form.Select name="order_by" value={filters.order_by} onChange={onChange} className="form-control my-input">
                  {["fecha","id","usuario_id","usuario","entidad","entidad_id","accion","resultado","empresa_id","sucursal_id","critico"].map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Dirección</Form.Label>
                <Form.Select name="order_dir" value={filters.order_dir} onChange={onChange} className="form-control my-input">
                  <option value="DESC">DESC</option>
                  <option value="ASC">ASC</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Label className="mb-1">Por página</Form.Label>
                <Form.Select name="limit" value={filters.limit} onChange={onChange} className="form-control my-input">
                  {[20,50,100,200,500].map(n => <option key={n} value={n}>{n}</option>)}
                </Form.Select>
              </Col>
            </Row>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* TABLA */}
          <div className="table-responsive table-wrapper">
            <Table hover size="sm" className="mb-2 table-audit">
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>Fecha</th>
                  <th>ID</th>
                  <th>Usuario ID</th>
                  <th>Usuario</th>
                  <th>Entidad</th>
                  <th>Entidad ID</th>
                  <th>Acción</th>
                  <th>Resultado</th>
                  <th>Empresa</th>
                  <th>Sucursal</th>
                  <th>Crítico</th>
                  <th>Ruta</th>
                  <th>Método</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={14} className="text-center py-4"><Spinner animation="border" /></td></tr>
                )}
                {!loading && (data.items || []).length === 0 && (
                  <tr><td colSpan={14} className="text-center text-muted py-3">Sin resultados</td></tr>
                )}
                {(data.items || []).map(row => (
                  <tr key={row.id}>
                    <td>{new Date(row.fecha).toLocaleString()}</td>
                    <td>{row.id}</td>
                    <td>{row.usuario_id ?? ""}</td>
                    <td>{row.usuario ?? ""}</td>
                    <td>{row.entidad}</td>
                    <td>{row.entidad_id ?? ""}</td>
                    <td>{row.accion}</td>
                    <td>
                      <Badge bg={row.resultado === "success" ? "success" : "danger"}>
                        {row.resultado}
                      </Badge>
                    </td>
                    <td>{row.empresa_id ?? ""}</td>
                    <td>{row.sucursal_id ?? ""}</td>
                    <td>{row.critico ? "✔" : ""}</td>
                    <td className="cell-ellipsis" title={row.ruta || ""}>{row.ruta || ""}</td>
                    <td>{row.metodo || ""}</td>
                    <td className="cell-ellipsis" title={row.detalle || ""}>{row.detalle || ""}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* PAGINACIÓN */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="text-muted small">
              Mostrando {Math.min(Number(filters.limit), data.items?.length || 0)} de {data.total ?? 0}
              {" "}· Offset: {filters.offset}
            </div>
            <Pagination className="mb-0">
              <Pagination.Prev disabled={!canPrev} onClick={() => handlePage("prev")} />
              <Pagination.Item active>{Math.floor(Number(filters.offset)/Number(filters.limit))+1}</Pagination.Item>
              <Pagination.Next disabled={!canNext} onClick={() => handlePage("next")} />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      {/* MODAL PURGE */}
      <Modal show={showPurge} onHide={() => { setShowPurge(false); setPurgeResult(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Purgar logs por rango</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Desde</Form.Label>
              <Form.Control
                type="date"
                className="my-input"
                value={purge.fecha_desde}
                onChange={(e) => setPurge((p) => ({ ...p, fecha_desde: e.target.value }))}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Hasta</Form.Label>
              <Form.Control
                type="date"
                className="my-input"
                value={purge.fecha_hasta}
                onChange={(e) => setPurge((p) => ({ ...p, fecha_hasta: e.target.value }))}
              />
            </Col>
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="dry-run"
                label="Simular sin eliminar (dry-run)"
                checked={!!purge.dry_run}
                onChange={(e) => setPurge((p) => ({ ...p, dry_run: e.target.checked }))}
              />
              <Form.Text className="text-muted">
                Recomendado: primero simulá para ver cuántos registros eliminarías.
              </Form.Text>
            </Col>
          </Row>

          {purging && <div className="mt-3"><Spinner animation="border" size="sm" /> Procesando…</div>}
          {purgeResult && (
            <Alert variant={purgeResult.error ? "danger" : "light"} className="mt-3 mb-0">
              {"error" in purgeResult
                ? <>Error: {purgeResult.error}</>
                : purgeResult.dry_run
                  ? <>Dry-run: se eliminarían <b>{purgeResult.would_delete}</b> registros.</>
                  : <>Eliminados: <b>{purgeResult.deleted}</b> registros.</>
              }
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowPurge(false); setPurgeResult(null); }}>
            Cerrar
          </Button>
          <Button variant="outline-primary" onClick={doDryRun} disabled={purging}>
            Simular
          </Button>
          <Button variant="danger" onClick={doPurge} disabled={purging}>
            Eliminar definitivamente
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
