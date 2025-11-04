import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Card, Row, Col, Form, Button, Table, Spinner, Alert, Badge, Pagination, InputGroup } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

// -------- Utils ----------
const toMoney = (n) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseDate = (s) => (s ? new Date(s + "T00:00:00") : null);
const daysDiffFromToday = (dateStr) => {
  const d = parseDate(dateStr);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ms = d.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};
const iso = (d) => d.toISOString().slice(0, 10);

// -------- Presentación ----------
function EstadoBadge({ estado, diasRest }) {
  const map = { pendiente: "secondary", parcial: "warning", vencido: "danger", pagado: "success", anulado: "secondary" };
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

// -------- API helpers (reportes / ctacte / echeqs) ----------
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

async function listarCargosAbiertos(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const r = await fetch(`${apiUrl}/movimientos-cta-cte-proveedor/cargos-abiertos?${qs.toString()}`, {
    credentials: "include",
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json?.error || "No se pudieron obtener cargos abiertos");
  return Array.isArray(json?.rows) ? json.rows : Array.isArray(json) ? json : [];
}

async function listarEcheqsPendientes(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const r = await fetch(`${apiUrl}/echeqs-emitidos?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.error || "No se pudieron obtener eCheqs");
  }
  const data = await r.json();

  console.log("echeq", data)
  const list = Array.isArray(data) ? data : [];
  const PEND = new Set(["emitido", "entregado", "presentado"]);
  return list.filter((e) => PEND.has(String(e.estado || "").toLowerCase()));
}

// -------- Helper nrocomprobante por id --------
async function fetchComprobanteNro(id) {
  // 1) intento con /detalle
  try {
    const r1 = await fetch(`${apiUrl}/comprobantes-egreso/${id}/detalle`, { credentials: "include" });
    if (r1.ok) {
      const j1 = await r1.json();
      if (j1?.nrocomprobante) return j1.nrocomprobante;
      if (j1?.comprobante?.nrocomprobante) return j1.comprobante.nrocomprobante; // posible payload
    }
  } catch (_) {}

  // 2) fallback a /:id
  try {
    const r2 = await fetch(`${apiUrl}/comprobantes-egreso/${id}`, { credentials: "include" });
    if (r2.ok) {
      const j2 = await r2.json();
      if (j2?.nrocomprobante) return j2.nrocomprobante;
    }
  } catch (_) {}

  return null;
}

// -------- Componente principal unificado ----------
export default function SitFinanciera() {
  const dataContext = useContext(Contexts.DataContext);
  const {
    empresaSeleccionada,
    empresasTabla = [],
    proveedoresTabla = [],
    categoriasEgreso = [],
    sucursalesTabla = [],
    formasPagoTesoreria = [],
    bancosTabla = [],
  } = dataContext || {};

  // -------- Filtros --------
  const [empresaId, setEmpresaId] = useState(empresaSeleccionada?.id || "");
  const [proveedorId, setProveedorId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [modoRango, setModoRango] = useState("prox"); // prox | rango
  const [dias, setDias] = useState(7);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [q, setQ] = useState("");

  // -------- Data combinada --------
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]); // normalizados combinados

  // -------- Paginación --------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // -------- Orden --------
  const [sortKey, setSortKey] = useState("fecha_vencimiento"); // por defecto
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  // -------- Cache nrocomprobante por id --------
  const [compNroById, setCompNroById] = useState(() => new Map());
  const setCompNro = useCallback((id, nro) => {
    setCompNroById((prev) => {
      if (prev.get(id) === nro) return prev;
      const m = new Map(prev);
      m.set(id, nro);
      return m;
    });
  }, []);

  // Si cambia empresa en el contexto, reflejar en filtro
  useEffect(() => {
    setEmpresaId(empresaSeleccionada?.id || "");
  }, [empresaSeleccionada?.id]);

  // -------- Mapas auxiliares (nombres) --------
  const empNameById = useMemo(() => {
    const m = new Map();
    (empresasTabla || []).forEach((e) =>
      m.set(Number(e.id), e.nombrecorto || e.descripcion || e.nombre || `Empresa ${e.id}`)
    );
    return m;
  }, [empresasTabla]);

  const bancoById = useMemo(() => {
    const m = new Map();
    (bancosTabla || []).forEach((b) => m.set(Number(b.id), b));
    return m;
  }, [bancosTabla]);

  const provNameById = useMemo(() => {
    const m = new Map();
    (proveedoresTabla || []).forEach((p) => m.set(Number(p.id), p.nombre || `Prov. ${p.id}`));
    return m;
  }, [proveedoresTabla]);

  const catNameById = useMemo(() => {
    const m = new Map();
    (categoriasEgreso || []).forEach((c) => m.set(Number(c.id), c.nombre || `Cat. ${c.id}`));
    return m;
  }, [categoriasEgreso]);

  const sucNameById = useMemo(() => {
    const m = new Map();
    (sucursalesTabla || []).forEach((s) =>
      m.set(Number(s.id), s.nombre || s.descripcion || `Sucursal ${s.id}`)
    );
    return m;
  }, [sucursalesTabla]);

  const fpById = useMemo(() => {
    const m = new Map();
    (formasPagoTesoreria || []).forEach((fp) => m.set(Number(fp.id), fp));
    return m;
  }, [formasPagoTesoreria]);

  const fpDesc = (id) => (id ? (fpById.get(Number(id))?.descripcion || `FP #${id}`) : "");

  // -------- Normalizadores --------
  const normalizeInstancias = (arr = []) =>
    arr.map((it) => ({
      tipo: "instancia",
      id: it.id,
      empresa_id: it.empresa_id ?? null,
      empresa_nombre: empNameById.get(Number(it.empresa_id)) || "",
      proveedor_id: it.proveedor_id ?? null,
      proveedor_nombre: it.proveedor_nombre || provNameById.get(Number(it.proveedor_id)) || "",
      categoria_id: it.categoriaegreso_id ?? null,
      categoria_nombre: it.categoria_nombre || catNameById.get(Number(it.categoriaegreso_id)) || "",
      sucursal_id: it.sucursal_id ?? null,
      sucursal_nombre: sucNameById.get(Number(it.sucursal_id)) || "",
      fecha_vencimiento: it.fecha_vencimiento || "",
      monto_base: Number(it.monto_base ?? it.monto_real ?? it.monto_estimado ?? 0),
      estado: it.estado || "pendiente",
      dias_restantes: typeof it.dias_restantes === "number" ? it.dias_restantes : daysDiffFromToday(it.fecha_vencimiento),
      descripcion: it.descripcion || "-",
      formapago_futuro_desc: "",
      comprobanteegreso_id: it.comprobanteegreso_id ?? null, // <-- clave
      comprobante_nro: null, // lo resolvemos por id
      key: `inst-${it.id}`,
    }));

  const normalizeCargos = (arr = []) =>
    arr.map((c) => {
      const saldo = Number(c.saldo ?? c.importe ?? 0);
      const fechaVenc = c.fecha_pago || c.fecha || "";
      const diasRest = daysDiffFromToday(fechaVenc);
      const estado = saldo <= 0 ? "pagado" : diasRest < 0 ? "vencido" : "pendiente";
      const proveedor_nombre =
        provNameById.get(Number(c.proveedor_id)) || `Prov. ${c.proveedor_id || "-"}`;
      const categoria_nombre = "";
      const sucursal_nombre = "";
      const descripcion =
        c.descripcion || (c.comprobante_nro ? `Comp. ${c.comprobante_nro}` : `Cargo #${c.id}`);

      return {
        tipo: "ctacte",
        id: c.id,
        empresa_id: c.empresa_id ?? null,
        empresa_nombre: empNameById.get(Number(c.empresa_id)) || "",
        proveedor_id: c.proveedor_id ?? null,
        proveedor_nombre,
        categoria_id: null,
        categoria_nombre,
        sucursal_id: null,
        sucursal_nombre,
        fecha_vencimiento: fechaVenc,
        monto_base: saldo,
        estado,
        dias_restantes: diasRest,
        descripcion,
        formapago_futuro_desc: c.formapago_id ? fpDesc(c.formapago_id) : "",
        comprobanteegreso_id: c.comprobanteegreso_id ?? null, // <-- clave
        comprobante_nro: null, // preferimos resolver por id
        key: `cta-${c.id}`,
      };
    });

const normalizeEcheqs = (arr = []) =>
  arr.map((e) => {
    const bank = bancoById.get(Number(e.banco_id));
    const empresa_id = e.empresa_id ?? bank?.empresa_id ?? null;
    const empresa_nombre = empNameById.get(Number(empresa_id)) || "";
    const proveedor_nombre =
      provNameById.get(Number(e.proveedor_id)) || (e.proveedor_id ? `Prov. ${e.proveedor_id}` : "");
    const categoria_nombre = catNameById.get(Number(e.categoriaegreso_id)) || "";
    const fecha_venc = e.fecha_vencimiento || "";
    const diasRest = daysDiffFromToday(fecha_venc);

    // si tu backend manda el link al comprobante, lo tomamos
    const compId =
      e.comprobanteegreso_id ??
      e.comprobanteEgresoId ?? // por si viene en camellCase
      e.comprobante_id ??      // por si usaste otro nombre
      null;

    return {
      tipo: "echeq",
      id: e.id,
      empresa_id,
      empresa_nombre,
      proveedor_id: e.proveedor_id ?? null,
      proveedor_nombre,
      categoria_id: e.categoriaegreso_id ?? null,
      categoria_nombre,
      sucursal_id: null,
      sucursal_nombre: "",
      fecha_vencimiento: fecha_venc,
      monto_base: Number(e.importe || 0),
      estado: e.estado || "emitido",
      dias_restantes: diasRest,
      descripcion: `eCheq ${e.numero_echeq || `#${e.id}`}`,
      formapago_futuro_desc: "eCheq",

      // ⬅️ ahora sí propagamos el id del comprobante si viene
      comprobanteegreso_id: compId,

      // Lo resolvemos por ID (fetch on-demand). Si tu backend YA manda el nro, podés setearlo acá:
      comprobante_nro: e.nrocomprobante ?? null,

      key: `echeq-${e.id}`,
    };
  });

  // -------- Carga combinada --------
  const cargar = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const pCta = {
        empresa_id: empresaId || undefined,
        proveedor_id: proveedorId || undefined,
      };

      const pInst = {
        empresa_id: empresaId || undefined,
        proveedor_id: proveedorId || undefined,
        categoria_id: categoriaId || undefined,
        sucursal_id: sucursalId || undefined,
      };
      if (modoRango === "prox") {
        pInst.dias = dias || 7;
      } else {
        if (desde) pInst.desde = desde;
        if (hasta) pInst.hasta = hasta;
      }

      const pEch = {
        empresa_id: empresaId || undefined,
        por: "vencimiento",
      };
      if (modoRango === "prox") {
        const today = new Date();
        const to = new Date(today);
        to.setDate(today.getDate() + (dias || 0));
        pEch.fecha_desde = iso(today);
        pEch.fecha_hasta = iso(to);
      } else {
        if (desde) pEch.fecha_desde = desde;
        if (hasta) pEch.fecha_hasta = hasta;
      }
      if (proveedorId) pEch.proveedor_id = proveedorId;

      const [rawInst, rawCta, rawEch] = await Promise.all([
        listarVencimientos(pInst),
        listarCargosAbiertos(pCta),
        listarEcheqsPendientes(pEch),
      ]);

      const instancias = normalizeInstancias(rawInst);
      const cargos = normalizeCargos(rawCta);
      const echeqs = normalizeEcheqs(rawEch);

      let merged = [...instancias, ...cargos, ...echeqs];

      if (q && q.trim() !== "") {
        const s = q.trim().toLowerCase();
        merged = merged.filter(
          (it) =>
            (it.descripcion || "").toLowerCase().includes(s) ||
            (it.proveedor_nombre || "").toLowerCase().includes(s) ||
            (it.categoria_nombre || "").toLowerCase().includes(s)
        );
      }

      // Orden default por fecha asc
      merged.sort((a, b) => String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento)));

      setItems(merged);
      setPage(1);
    } catch (e) {
      setErr(e.message || "Error cargando situación financiera");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [empresaId, proveedorId, categoriaId, sucursalId, modoRango, dias, desde, hasta, q, empNameById, provNameById, catNameById, sucNameById, fpById, bancoById]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // -------- Fetch on-demand de nrocomprobante para filas con comprobanteegreso_id (batched) --------
  useEffect(() => {
    const faltantes = Array.from(
      new Set(
        items
          .map((r) => r.comprobanteegreso_id)
          .filter((id) => !!id && !compNroById.has(id))
      )
    );
    if (faltantes.length === 0) return;

    const BATCH_SIZE = 10;
    (async () => {
      for (let i = 0; i < faltantes.length; i += BATCH_SIZE) {
        const slice = faltantes.slice(i, i + BATCH_SIZE);
        const resultados = await Promise.all(
          slice.map(async (id) => {
            try {
              const nro = await fetchComprobanteNro(id);
              return { id, nro };
            } catch {
              return { id, nro: null };
            }
          })
        );
        resultados.forEach(({ id, nro }) => {
          if (nro) setCompNro(id, nro);
        });
      }
    })();
  }, [items, compNroById, setCompNro]);

  // -------- Derivados / orden / paginación --------
  const getSortableValue = useCallback((row, key) => {
    switch (key) {
      case "id":
        return Number(row.id) || 0;
      case "tipo":
        return row.tipo || "";
      case "empresa_nombre":
        return row.empresa_nombre || "";
      case "comprobante_nro":
        return (
          row.comprobante_nro ||
          (row.comprobanteegreso_id ? (compNroById.get(row.comprobanteegreso_id) || "") : "")
        );
      case "descripcion":
        return row.descripcion || "";
      case "proveedor_nombre":
        return row.proveedor_nombre || "";
      case "categoria_nombre":
        return row.categoria_nombre || "";
      case "sucursal_nombre":
        return row.sucursal_nombre || "";
      case "fecha_vencimiento":
        return row.fecha_vencimiento || "";
      case "monto_base":
        return Number(row.monto_base) || 0;
      case "estado":
        return row.estado || "";
      case "formapago_futuro_desc":
        return row.formapago_futuro_desc || "";
      default:
        return "";
    }
  }, [compNroById]);

  const sortedItems = useMemo(() => {
    const arr = [...items];
    if (!sortKey) return arr;
    arr.sort((a, b) => {
      const va = getSortableValue(a, sortKey);
      const vb = getSortableValue(b, sortKey);

      if (sortKey === "monto_base" || sortKey === "id") {
        const na = Number(va) || 0;
        const nb = Number(vb) || 0;
        return sortDir === "asc" ? na - nb : nb - na;
      }
      if (sortKey === "fecha_vencimiento") {
        const sa = String(va || "");
        const sb = String(vb || "");
        return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
      }
      const sa = String(va || "");
      const sb = String(vb || "");
      return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return arr;
  }, [items, sortKey, sortDir, getSortableValue]);

  const total = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = sortedItems.slice(start, start + pageSize);

  const totalPendiente = useMemo(
    () => sortedItems.reduce((acc, it) => acc + (Number(it.monto_base) || 0), 0),
    [sortedItems]
  );

  // -------- Helpers UI de orden --------
  const toggleSort = (key) => {
    setPage(1);
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir("asc");
        return key;
      }
      setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      return key;
    });
  };

  const SortableTh = ({ colKey, children, center }) => {
    const active = sortKey === colKey;
    const arrow = !active ? "↕" : sortDir === "asc" ? "▲" : "▼";
    return (
      <th
        role="button"
        onClick={() => toggleSort(colKey)}
        className={`user-select-none ${center ? "text-center" : ""}`}
        title="Ordenar"
      >
        <div className="d-flex align-items-center justify-content-between gap-2">
          <span>{children}</span>
          <small className={`text-muted ${active ? "" : "opacity-75"}`}>{arrow}</small>
        </div>
      </th>
    );
  };

  const compNroView = (row) =>
    row.comprobante_nro ||
    (row.comprobanteegreso_id ? (compNroById.get(row.comprobanteegreso_id) || "-") : "-");

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <Row className="g-2 align-items-end">
          <Col sm={12} md={3}>
            <Form.Group>
              <Form.Label>Empresa</Form.Label>
              <Form.Select
                value={empresaId || ""}
                onChange={(e) => setEmpresaId(e.target.value)}
                className="form-control form-control-sm my-input"
              >
                <option value="">Todas</option>
                {(empresasTabla || []).map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombrecorto || emp.descripcion || emp.nombre || `Empresa ${emp.id}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col sm={6} md={3}>
            <Form.Group>
              <Form.Label>Proveedor</Form.Label>
              <Form.Select
                value={proveedorId || ""}
                onChange={(e) => setProveedorId(e.target.value)}
                className="form-control form-control-sm my-input"
              >
                <option value="">Todos</option>
                {(proveedoresTabla || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col sm={6} md={3}>
            <Form.Group>
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={categoriaId || ""}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="form-control form-control-sm my-input"
              >
                <option value="">Todas</option>
                {(categoriasEgreso || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col sm={6} md={3}>
            <Form.Group>
              <Form.Label>Sucursal</Form.Label>
              <Form.Select
                value={sucursalId || ""}
                onChange={(e) => setSucursalId(e.target.value)}
                className="form-control form-control-sm my-input"
              >
                <option value="">Todas</option>
                {(sucursalesTabla || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre || s.descripcion || `Sucursal ${s.id}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col sm={12}>
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
              id="rango-fechas"
              name="rangoOpt"
              label="Entre fechas"
              checked={modoRango === "rango"}
              onChange={() => setModoRango("rango")}
            />
          </Col>

          {modoRango === "prox" ? (
            <Col sm={6} md={2}>
              <Form.Group>
                <Form.Label>Días</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={dias}
                  onChange={(e) => setDias(Number(e.target.value || 0))}
                />
              </Form.Group>
            </Col>
          ) : (
            <>
              <Col sm={6} md={2}>
                <Form.Group>
                  <Form.Label>Desde</Form.Label>
                  <Form.Control type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                </Form.Group>
              </Col>
              <Col sm={6} md={2}>
                <Form.Group>
                  <Form.Label>Hasta</Form.Label>
                  <Form.Control type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                </Form.Group>
              </Col>
            </>
          )}

          <Col sm={12} md={4}>
            <Form.Label>Buscar</Form.Label>
            <InputGroup>
              <Form.Control
                placeholder="Descripción, proveedor, categoría…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button variant="outline-primary" onClick={cargar} className="mx-2">
                Buscar
              </Button>
            </InputGroup>
          </Col>

          <Col sm={12} md="auto" className="d-flex align-items-end">
            <Form.Label className="me-2">Por página</Form.Label>
            <Form.Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              style={{ width: 90 }}
              className="form-control form-control-sm my-input mx-2"
            >
              {[10, 20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col sm={12} md="auto" className="text-end">
            <Button variant="outline-secondary" onClick={cargar} disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : "Actualizar"}
            </Button>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {err && <Alert variant="danger" className="mb-3">{err}</Alert>}

        <div className="table-responsive">
          <Table hover bordered size="sm" className="align-middle">
            <thead>
              <tr>
                <SortableTh colKey="id">#</SortableTh>
                <SortableTh colKey="tipo">Tipo</SortableTh>
                <SortableTh colKey="empresa_nombre">Empresa</SortableTh>
                <SortableTh colKey="comprobante_nro">Comprobante</SortableTh>
                <SortableTh colKey="descripcion">Descripción</SortableTh>
                <SortableTh colKey="proveedor_nombre">Proveedor</SortableTh>
                <SortableTh colKey="categoria_nombre">Categoría</SortableTh>
                <SortableTh colKey="sucursal_nombre">Sucursal</SortableTh>
                <SortableTh colKey="fecha_vencimiento">Vencimiento</SortableTh>
                <SortableTh colKey="monto_base" center>Monto</SortableTh>
                <SortableTh colKey="estado">Estado</SortableTh>
                <SortableTh colKey="formapago_futuro_desc">FP Acordada</SortableTh>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={12} className="text-center text-muted">
                    <Spinner size="sm" animation="border" className="me-2" />
                    Cargando…
                  </td>
                </tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center text-muted">Sin resultados</td>
                </tr>
              )}
              {!loading &&
                pageItems.map((row) => (
                  <tr key={row.key}>
                    <td>{row.id}</td>
                    <td>{row.tipo === "ctacte" ? "Cta Cte" : row.tipo === "echeq" ? "eCheq" : "Instancia"}</td>
                    <td>{row.empresa_nombre || "-"}</td>
                    <td>{compNroView(row)}</td>
                    <td>{row.descripcion || "-"}</td>
                    <td>{row.proveedor_nombre || "-"}</td>
                    <td>{row.categoria_nombre || "-"}</td>
                    <td>{row.sucursal_nombre || "-"}</td>
                    <td>{row.fecha_vencimiento || "-"}</td>
                    <td className="text-end">${toMoney(row.monto_base)}</td>
                    <td><EstadoBadge estado={row.estado} diasRest={row.dias_restantes} /></td>
                    <td>{row.formapago_futuro_desc || "-"}</td>
                  </tr>
                ))}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={9}><strong>Total (filtrado)</strong></td>
                  <td className="text-end"><strong>${toMoney(totalPendiente)}</strong></td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </Table>
        </div>

        {/* Paginación */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="text-muted" style={{ fontSize: 13 }}>
            {items.length > 0
              ? (
                <>
                  Mostrando <strong>{start + 1}</strong>–<strong>{Math.min(start + pageSize, items.length)}</strong> de <strong>{items.length}</strong>
                </>
              )
              : "Sin resultados"}
          </div>

        <Pagination className="mb-0">
          <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
          <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          <Pagination.Item active>{page}</Pagination.Item>
          <Pagination.Next
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
          <Pagination.Last disabled={page === totalPages} onClick={() => setPage(totalPages)} />
        </Pagination>
        </div>
      </Card.Body>
    </Card>
  );
}
