import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card, Container, Row, Col, Button, Table, Form, Spinner, Alert,
  Badge, Pagination, InputGroup, Modal
} from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

// -------- Utils ----------
const toMoney = (n) => Number(n || 0).toLocaleString("es-AR", {
  minimumFractionDigits: 2, maximumFractionDigits: 2
});

// -------- API helpers (catálogos) ----------
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

// -------- API helpers (reportes + pagos) ----------
async function listarVencimientos(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const r = await fetch(`${apiUrl}/gastos-estimados/reportes/vencen-en?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron listar los vencimientos");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

// >>> Cambiado a INSTANCIAS y campos nuevos
async function listarPagosDeInstancia(id) {
  const r = await fetch(`${apiUrl}/gasto-estimado/instancias/${id}/pagos`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener los pagos de la instancia");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function crearPagoDeInstancia(id, payload) {
  const r = await fetch(`${apiUrl}/gasto-estimado/instancias/${id}/pagos`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || "No se pudo registrar el pago/conciliación");
  }
  return r.json();
}

// -------- API helpers (instancias: editar/eliminar) ----------
async function obtenerInstancia(id) {
  const r = await fetch(`${apiUrl}/gasto-estimado/instancias/${id}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudo obtener la instancia");
  return r.json();
}

async function actualizarInstancia(id, payload) {
  const r = await fetch(`${apiUrl}/gasto-estimado/instancias/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || "No se pudo actualizar la instancia");
  }
  return r.json();
}

async function eliminarInstancia(id) {
  const r = await fetch(`${apiUrl}/gasto-estimado/instancias/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || "No se pudo eliminar la instancia");
  }
  return r.json();
}

// -------- Presentación ----------
function EstadoBadge({ estado, diasRest }) {
  const map = {
    pendiente: "secondary",
    parcial: "warning",
    vencido: "danger",
    pagado: "success",
    anulado: "secondary",
  };
  const variant = map[estado] || "secondary";
  return (
    <div className="d-flex align-items-center gap-2">
      <Badge bg={variant} className="text-uppercase">{estado || "—"}</Badge>
      {typeof diasRest === "number" && (
        <small className={diasRest < 0 ? "text-danger" : diasRest === 0 ? "text-warning" : "text-muted"}>
          {diasRest < 0 ? `${Math.abs(diasRest)} d. vencidos` : diasRest === 0 ? "vence hoy" : `faltan ${diasRest} d.`}
        </small>
      )}
    </div>
  );
}

// -------- Modal de Conciliación (pago) ----------
function ConciliarGastoModal({ show, onHide, gasto, onSaved }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [modo, setModo] = useState("manual"); // manual | referencia
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState("");
  const [referenciaTipo, setReferenciaTipo] = useState("MovimientoBancoTesoreria");
  const [referenciaId, setReferenciaId] = useState("");
  const [cancelarRenovacion, setCancelarRenovacion] = useState(false); // <--- NUEVO

  // >>> usa monto_aplicado
  const totalPagado = useMemo(
    () => (pagos || []).reduce((acc, p) => acc + Number(p.monto_aplicado || 0), 0),
    [pagos]
  );

  const base = Number(gasto?.monto_base || 0);
  const saldo = base - totalPagado;

  useEffect(() => {
    if (!show || !gasto?.id) return;
    let cancel = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const arr = await listarPagosDeInstancia(gasto.id);
        if (!cancel) setPagos(arr);
      } catch (e) {
        if (!cancel) setErr(e.message || "Error cargando pagos");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [show, gasto?.id]);

  const registrar = async () => {
    try {
      setErr(null); setLoading(true);
      const payload = {
        referencia_tipo: modo === "referencia" ? referenciaTipo : "Manual",
        referencia_id: modo === "referencia" ? (referenciaId ? Number(referenciaId) : null) : 0,
        fecha_aplicacion: fecha,
        monto_aplicado: Number(monto || 0),
        observaciones,
        cancelar_renovacion: Boolean(cancelarRenovacion), // <--- NUEVO
      };
      await crearPagoDeInstancia(gasto.id, payload);
      const arr = await listarPagosDeInstancia(gasto.id);
      setPagos(arr);
      setMonto("");
      setObservaciones("");
      setCancelarRenovacion(false);
      if (onSaved) onSaved();
    } catch (e) {
      setErr(e.message || "No se pudo registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Conciliar / Registrar pago — {gasto?.descripcion || `#${gasto?.id}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Row className="mb-3">
          <Col md={4}>
            <div className="text-muted">Monto base</div>
            <div className="fw-bold">${toMoney(base)}</div>
          </Col>
          <Col md={4}>
            <div className="text-muted">Pagado</div>
            <div className="fw-bold text-success">${toMoney(totalPagado)}</div>
          </Col>
          <Col md={4}>
            <div className="text-muted">Saldo</div>
            <div className="fw-bold">
              {saldo >= 0 ? `$${toMoney(saldo)}` : <span className="text-danger">-$ {toMoney(-saldo)}</span>}
            </div>
          </Col>
        </Row>

        <h6 className="mb-2">Pagos existentes</h6>
        <div className="table-responsive mb-3">
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th className="text-end">Monto</th>
                <th>Referencia</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {pagos.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted">Sin pagos registrados aún</td></tr>
              )}
              {pagos.map(p => (
                <tr key={p.id}>
                  <td>{p.fecha_aplicacion || "-"}</td>
                  <td className="text-end">${toMoney(p.monto_aplicado)}</td>
                  <td>{p.referencia_tipo}{p.referencia_id ? ` #${p.referencia_id}` : ""}</td>
                  <td>{p.observaciones || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <h6 className="mb-2">Agregar pago</h6>
        <Row className="g-3">
          <Col md={3}>
            <Form.Label>Fecha</Form.Label>
            <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Label>Monto</Form.Label>
            <Form.Control type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} />
          </Col>
          <Col md={12}>
            <Form.Check
              inline
              type="radio"
              id="pago-modo-manual"
              name="modoPago"
              label="Registrar pago manual"
              checked={modo === "manual"}
              onChange={() => setModo("manual")}
            />
            <Form.Check
              inline
              type="radio"
              id="pago-modo-ref"
              name="modoPago"
              label="Vincular con movimiento existente"
              checked={modo === "referencia"}
              onChange={() => setModo("referencia")}
            />
          </Col>

          {modo === "referencia" && (
            <>
              <Col md={4}>
                <Form.Label>Referencia tipo</Form.Label>
                <Form.Select value={referenciaTipo} onChange={(e) => setReferenciaTipo(e.target.value)} className="form-control my-input">
                  <option value="MovimientoBancoTesoreria">MovimientoBancoTesoreria</option>
                  <option value="MovimientoCajaTesoreria">MovimientoCajaTesoreria</option>
                  <option value="PagoTarjetaCredito">PagoTarjetaCredito</option>
                  <option value="PagoTransferenciaBancaria">PagoTransferenciaBancaria</option>
                  <option value="Manual">Manual</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Referencia ID</Form.Label>
                <Form.Control value={referenciaId} onChange={(e) => setReferenciaId(e.target.value)} placeholder="ID del movimiento" />
              </Col>
            </>
          )}

          <Col md={12}>
            <Form.Label>Observaciones</Form.Label>
            <Form.Control as="textarea" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </Col>

          <Col md={12}>
            <Form.Check
              type="switch"
              id="cancelar-renovacion"
              label="Cancelar renovación futura (última factura)"
              checked={cancelarRenovacion}
              onChange={(e) => setCancelarRenovacion(e.target.checked)}
            />
            <small className="text-muted">Si la plantilla es mensual, no se generará la instancia del próximo mes.</small>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
        <Button variant="primary" onClick={registrar} disabled={loading || !monto || Number(monto) <= 0}>
          {loading ? <Spinner size="sm" animation="border" /> : "Guardar pago"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// -------- Modal de Edición de Instancia ----------
function EditarInstanciaModal({ show, onHide, instanciaId, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Campos editables
  const [descripcion, setDescripcion] = useState("");
  const [fechaVenc, setFechaVenc] = useState("");
  const [montoEstimado, setMontoEstimado] = useState("");
  const [montoReal, setMontoReal] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    let cancel = false;
    if (!show || !instanciaId) return;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const inst = await obtenerInstancia(instanciaId);
        if (cancel) return;
        setDescripcion(inst.descripcion || "");
        setFechaVenc(inst.fecha_vencimiento || "");
        setMontoEstimado(inst.monto_estimado != null ? String(inst.monto_estimado) : "");
        setMontoReal(inst.monto_real != null ? String(inst.monto_real) : "");
        setObservaciones(inst.observaciones || "");
      } catch (e) {
        if (!cancel) setErr(e.message || "Error cargando instancia");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [show, instanciaId]);

  const guardar = async () => {
    try {
      setSaving(true); setErr(null);
      const payload = {
        descripcion: descripcion?.trim() || null,
        fecha_vencimiento: fechaVenc || null,
        // Enviamos ambos; backend actualiza y recomputa estado
        monto_estimado: montoEstimado !== "" ? Number(montoEstimado) : null,
        monto_real: montoReal !== "" ? Number(montoReal) : null,
        observaciones: observaciones?.trim() || null,
      };
      await actualizarInstancia(instanciaId, payload);
      if (onSaved) onSaved();
      onHide?.();
    } catch (e) {
      setErr(e.message || "No se pudo guardar la instancia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar instancia #{instanciaId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" /></div>
        ) : (
          <Row className="g-3">
            <Col md={7}>
              <Form.Label>Descripción</Form.Label>
              <Form.Control value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </Col>
            <Col md={5}>
              <Form.Label>Vencimiento</Form.Label>
              <Form.Control type="date" value={fechaVenc} onChange={(e) => setFechaVenc(e.target.value)} />
            </Col>
            <Col md={6}>
              <Form.Label>Monto estimado</Form.Label>
              <Form.Control
                type="number" step="0.01"
                value={montoEstimado}
                onChange={(e) => setMontoEstimado(e.target.value)}
              />
              <Form.Text className="text-muted">Se usa si no hay monto real.</Form.Text>
            </Col>
            <Col md={6}>
              <Form.Label>Monto real</Form.Label>
              <Form.Control
                type="number" step="0.01"
                value={montoReal}
                onChange={(e) => setMontoReal(e.target.value)}
              />
              <Form.Text className="text-muted">Tiene prioridad para el cálculo del estado.</Form.Text>
            </Col>
            <Col md={12}>
              <Form.Label>Observaciones</Form.Label>
              <Form.Control as="textarea" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
        <Button variant="primary" onClick={guardar} disabled={saving || loading}>
          {saving ? <Spinner size="sm" animation="border" /> : "Guardar cambios"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// -------- Componente principal ----------
export default function VencimientosManager() {
  // filtros
  const [empresaId, setEmpresaId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [modoRango, setModoRango] = useState("prox"); // prox | rango
  const [dias, setDias] = useState(7);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [q, setQ] = useState("");

  // catálogos
  const [empresas, setEmpresas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  // data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // conciliación
  const [showConciliar, setShowConciliar] = useState(false);
  const [itemConciliar, setItemConciliar] = useState(null);

  // edición/eliminación
  const [showEditar, setShowEditar] = useState(false);
  const [instanciaEditarId, setInstanciaEditarId] = useState(null);

  // catálogos
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [emps, prov, cat, sucs] = await Promise.all([
          fetchEmpresas(), fetchProveedores(), fetchCategoriasEgreso(), fetchSucursales()
        ]);
        if (!cancel) {
          setEmpresas(emps);
          setProveedores(prov);
          setCategorias(cat);
          setSucursales(sucs);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const cargar = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const params = {
        empresa_id: empresaId || undefined,
        proveedor_id: proveedorId || undefined,
        categoria_id: categoriaId || undefined,
        sucursal_id: sucursalId || undefined,
      };

      if (modoRango === "prox") {
        params.dias = dias || 7;
      } else {
        if (desde) params.desde = desde;
        if (hasta) params.hasta = hasta;
      }

      const raw = await listarVencimientos(params);

      // Búsqueda client-side (descripcion / proveedor / categoría)
      const filtered = q
        ? raw.filter(it =>
          (it.descripcion || "").toLowerCase().includes(q.toLowerCase()) ||
          String(it.proveedor_nombre || "").toLowerCase().includes(q.toLowerCase()) ||
          String(it.categoria_nombre || "").toLowerCase().includes(q.toLowerCase()))
        : raw;

      setTotal(filtered.length);

      const start = (page - 1) * pageSize;
      const end = Math.min(start + pageSize, filtered.length);
      setItems(filtered.slice(start, end));
    } catch (e) {
      setErr(e.message || "Error listando vencimientos");
    } finally {
      setLoading(false);
    }
  }, [empresaId, proveedorId, categoriaId, sucursalId, modoRango, dias, desde, hasta, q, page, pageSize]);

  useEffect(() => {
    setPage(1); // reset al cambiar filtros
  }, [empresaId, proveedorId, categoriaId, sucursalId, modoRango, dias, desde, hasta, q, pageSize]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const empNameById = useMemo(() => {
    const m = new Map();
    empresas.forEach(e => m.set(Number(e.id), e.nombrecorto || e.descripcion || `Empresa ${e.id}`));
    return m;
  }, [empresas]);

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

  const onConciliar = (it) => { setItemConciliar(it); setShowConciliar(true); };
  const onEditar = (it) => { setInstanciaEditarId(it.id); setShowEditar(true); };
  const onEliminar = async (it) => {
    if (!window.confirm(`¿Eliminar/anular la instancia #${it.id} (${it.descripcion || "-"})?`)) return;
    try {
      await eliminarInstancia(it.id);
      await cargar();
    } catch (e) {
      alert(e.message || "No se pudo eliminar la instancia");
    }
  };

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Vencimientos (pendientes / parciales / vencidos)</strong>
            </Card.Header>
            <Card.Body>
              {/* Filtros (restaurados) */}
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

                  <Col md={12}>
                    <Form.Check
                      inline
                      type="radio"
                      id="rango-prox"
                      name="rangoOpt"
                      label="Próximos X días"
                      checked={modoRango === "prox"}
                      onChange={() => setModoRango("prox")}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="rango-exp"
                      name="rangoOpt"
                      label="Entre fechas"
                      checked={modoRango === "rango"}
                      onChange={() => setModoRango("rango")}
                    />
                  </Col>

                  {modoRango === "prox" ? (
                    <Col md={2}>
                      <Form.Label>Días</Form.Label>
                      <Form.Control type="number" min={0} value={dias} onChange={(e) => setDias(Number(e.target.value || 0))} />
                    </Col>
                  ) : (
                    <>
                      <Col md={2}>
                        <Form.Label>Desde</Form.Label>
                        <Form.Control type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                      </Col>
                      <Col md={2}>
                        <Form.Label>Hasta</Form.Label>
                        <Form.Control type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                      </Col>
                    </>
                  )}

                  <Col md={4}>
                    <Form.Label>Buscar</Form.Label>
                    <InputGroup>
                      <Form.Control placeholder="Descripcion, proveedor, categoría…" value={q} onChange={(e) => setQ(e.target.value)} />
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
                          <th>Empresa</th>
                          <th>Descripcion</th>
                          <th>Proveedor</th>
                          <th>Categoría</th>
                          <th>Sucursal</th>
                          <th>Vencimiento</th>
                          <th className="text-end">Monto base</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.length === 0 && (
                          <tr><td colSpan={10} className="text-center text-muted">Sin resultados</td></tr>
                        )}
                        {items.map((it) => (
                          <tr key={it.id}>
                            <td>{it.id}</td>
                            <td>{empNameById.get(Number(it.empresa_id)) || "-"}</td>
                            <td>{it.descripcion || "-"}</td>
                            <td>{it.proveedor_nombre || "-"}</td>
                            <td>{it.categoria_nombre || catNameById.get(Number(it.categoriaegreso_id)) || "-"}</td>
                            <td>{sucNameById.get(Number(it.sucursal_id)) || "-"}</td>
                            <td>{it.fecha_vencimiento}</td>
                            <td className="text-end">${toMoney(it.monto_base)}</td>
                            <td><EstadoBadge estado={it.estado} diasRest={it.dias_restantes} /></td>
                            <td className="text-nowrap">
                             {/* <Button size="sm" variant="outline-success" onClick={() => onConciliar(it)} className="me-1">Conciliar</Button>*/}
                              <Button size="sm" variant="outline-primary" onClick={() => onEditar(it)} className="me-1 mx-2">Editar</Button>
                              <Button size="sm" variant="outline-danger" onClick={() => onEliminar(it)}>Eliminar</Button>
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

      {/* Conciliar */}
      {showConciliar && itemConciliar && (
        <ConciliarGastoModal
          show={showConciliar}
          onHide={() => setShowConciliar(false)}
          gasto={itemConciliar}
          onSaved={() => cargar()}
        />
      )}

      {/* Editar instancia */}
      {showEditar && instanciaEditarId != null && (
        <EditarInstanciaModal
          show={showEditar}
          onHide={() => setShowEditar(false)}
          instanciaId={instanciaEditarId}
          onSaved={() => cargar()}
        />
      )}
    </Container>
  );
}
