// src/components/tesoreria/CajaTesoreriaList.js
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Form, Row, Col, Alert, Spinner, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";
import NuevoMovimientoCaja from "./NuevoMovimientoCaja";
import NuevoMovimientoCajaIngreso from "./NuevoMovimientoCajaIngreso.js";
import OrdenPagoDetalleModal from "../comprasTesoreria/OrdenPagoDetalleModal.js";
import MovimientoCajaIngresoDetalleModal from "./MovimientoCajaIngresoDetalleModal.js"

const apiUrl = process.env.REACT_APP_API_URL;

export default function CajaTesoreriaList() {
  const navigate = useNavigate();
  const dataContext = useContext(Contexts.DataContext);
  const {
    cajaAbierta,
    proveedoresTabla = [],
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
    proyectosTabla = [],
    categoriasIngreso = [],             // 👈 NUEVO
  } = dataContext || {};

  const [ordenesCache, setOrdenesCache] = useState({});
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [descFiltro, setDescFiltro] = useState("");        // 👈 filtro por descripción
  const [catFiltro, setCatFiltro] = useState("");

  const [totalesCajaAbierta, setTotalesCajaAbierta] = useState({ ingresos: 0, egresos: 0 });

  const [showNuevo, setShowNuevo] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [movSeleccionado, setMovSeleccionado] = useState(null);
  const [showNuevoIngreso, setShowNuevoIngreso] = useState(false);
  const [showDetalleIngreso, setShowDetalleIngreso] = useState(false); // 👈 NUEVO
  const [deletingId, setDeletingId] = useState(null);

  const eliminarMovimiento = async (mov) => {
    if (!mov?.id) return;
    const ok = window.confirm(
      `Vas a eliminar el Movimiento de Caja #${mov.id} por $${Number(mov.monto || 0).toFixed(2)}.\n\n` +
      `Esta acción revertirá referencias (OP, banco, cta cte, gastos mensuales, etc.) según las reglas.\n\n¿Confirmás?`
    );
    if (!ok) return;

    try {
      setDeletingId(mov.id);
      const res = await fetch(`${apiUrl}/movimientos-caja-tesoreria/${mov.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: cajaAbierta?.caja?.empresa_id || undefined,
          hard: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "No se pudo eliminar el movimiento");
      }
      await loadMovs();
      await loadTotalesCajaAbierta();
    } catch (e) {
      console.error("❌ eliminarMovimiento:", e);
      alert(e.message || "Error eliminando el movimiento");
    } finally {
      setDeletingId(null);
    }
  };

  // ===== Categorías
  const categorias = useMemo(
    () => (categoriasEgresoTabla?.length ? categoriasEgresoTabla : categoriasEgreso) || [],
    [categoriasEgresoTabla, categoriasEgreso]
  );
  const catById = useMemo(() => {
    const m = new Map();
    categorias.forEach((c) => m.set(Number(c.id), c));
    return m;
  }, [categorias]);
  const nombreCategoria = (m) =>
    m?.categoriaegreso?.nombre ||
    catById.get(Number(m.categoriaegreso_id))?.nombre ||
    "";

  const categoriasCombo = useMemo(() => {
    const ing = (categoriasIngreso || []).map(c => ({ ...c, _tipo: "ingreso" }));
    const egr = (categorias || []).map(c => ({ ...c, _tipo: "egreso" }));
    return [...ing, ...egr];
  }, [categoriasIngreso, categorias]);

  // ===== Categorías de INGRESO (mostrar nombre)
  const catIngById = useMemo(() => {
    const m = new Map();
    (categoriasIngreso || []).forEach((c) => m.set(Number(c.id), c));
    return m;
  }, [categoriasIngreso]);
  const nombreCategoriaIngreso = (m) =>
    m?.categoriaingreso?.nombre ||
    catIngById.get(Number(m.categoriaingreso_id))?.nombre ||
    "";

  const nombreCategoriaMovimiento = (m) => {
    const isIngreso = String(m?.tipo || "").toLowerCase() === "ingreso";
    return isIngreso ? nombreCategoriaIngreso(m) : nombreCategoria(m);
  };

  // ===== Proyectos (mostrar nombre)
  const projById = useMemo(() => {
    const m = new Map();
    (proyectosTabla || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [proyectosTabla]);
  const nombreProyecto = (m) =>
    m?.proyecto?.descripcion ||
    projById.get(Number(m.proyecto_id))?.descripcion ||
    "";

  const movsFiltrados = useMemo(() => {
    let out = movs;
    // Filtro por descripción (case-insensitive)
    if (descFiltro.trim()) {
      const q = descFiltro.trim().toLowerCase();
      out = out.filter(m => String(m.descripcion || "").toLowerCase().includes(q));
    }
    // Filtro por categoría
    if (catFiltro) {
      const [tipo, idStr] = catFiltro.split(":");
      const id = Number(idStr);
      if (tipo === "ingreso") out = out.filter(m => Number(m.categoriaingreso_id) === id || Number(m?.categoriaingreso?.id) === id);
      if (tipo === "egreso") out = out.filter(m => Number(m.categoriaegreso_id) === id || Number(m?.categoriaegreso?.id) === id);
    }
    return out;
  }, [movs, descFiltro, catFiltro]);


  // Totales del listado
  const { ingresosTotal, egresosTotal, saldoPeriodo } = useMemo(() => {
    const ingresos = movsFiltrados
      .filter((m) => String(m.tipo).toLowerCase() === "ingreso" && !m.anulado)
      .reduce((a, b) => a + Number(b.monto || 0), 0);

    const egresos = movsFiltrados
      .filter((m) => String(m.tipo).toLowerCase() === "egreso" && !m.anulado)
      .reduce((a, b) => a + Number(b.monto || 0), 0);
    return {
      ingresosTotal: ingresos,
      egresosTotal: egresos,
      saldoPeriodo: ingresos - egresos,
    };
  }, [movsFiltrados]);

  const saldoActual = useMemo(() => {
    const inicial = Number(cajaAbierta?.caja?.caja_inicial || 0);
    const { ingresos, egresos } = totalesCajaAbierta;
    return inicial + Number(ingresos || 0) - Number(egresos || 0);
  }, [cajaAbierta?.caja?.caja_inicial, totalesCajaAbierta]);

  const loadTotalesCajaAbierta = useCallback(async () => {
    if (!cajaAbierta?.caja?.id) {
      setTotalesCajaAbierta({ ingresos: 0, egresos: 0 });
      return;
    }
    try {
      let url = `${apiUrl}/movimientos-caja-tesoreria?caja_id=${cajaAbierta.caja.id}`;
      let res = await fetch(url, { credentials: "include" });
      let data = await res.json();
      let lista = Array.isArray(data) ? data : [];
      if (!lista.length) {
        res = await fetch(`${apiUrl}/movimientos-caja-tesoreria`, { credentials: "include" });
        data = await res.json();
        lista = Array.isArray(data) ? data : [];
      }
      const deEstaCaja = lista.filter(
        (m) => Number(m.caja_id) === Number(cajaAbierta.caja.id) && !m.anulado
      );
      const ingresos = deEstaCaja
        .filter((m) => (m.tipo || "").toLowerCase() === "ingreso")
        .reduce((acc, it) => acc + Number(it.monto || 0), 0);
      const egresos = deEstaCaja
        .filter((m) => (m.tipo || "").toLowerCase() === "egreso")
        .reduce((acc, it) => acc + Number(it.monto || 0), 0);
      setTotalesCajaAbierta({ ingresos, egresos });
    } catch (err) {
      console.error("❌ Error al cargar totales de la caja abierta:", err);
      setTotalesCajaAbierta({ ingresos: 0, egresos: 0 });
    }
  }, [apiUrl, cajaAbierta?.caja?.id]);


  useEffect(() => {
    loadTotalesCajaAbierta();
  }, [loadTotalesCajaAbierta]);

  const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

  const buildQS = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v) !== "") qs.set(k, v);
    });
    return qs.toString();
  };

  const loadMovs = useCallback(async (overrides = {}) => {
    if (!cajaAbierta?.abierta) return;
    try {
      setLoading(true);
      const desde = overrides.fechaDesde ?? fechaDesde;
      const hasta = overrides.fechaHasta ?? fechaHasta;
      const qs = buildQS({
        caja_id: cajaAbierta?.caja?.id,
        fecha_desde: desde || "",
        fecha_hasta: hasta || "",
        includeAnulados: "0",
      });
      const res = await fetch(`${apiUrl}/movimientos-caja-tesoreria?${qs}`, {
        credentials: "include",
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => {
        if (a.fecha === b.fecha) return a.id - b.id;
        return (a.fecha || "").localeCompare(b.fecha || "");
      });
      setMovs(list);

      // prefetch de órdenes relacionadas
      const ordenIds = [...new Set(list.map(m => m.ordenpago_id).filter(Boolean))];
      if (ordenIds.length) {
        const faltantes = ordenIds.filter(id => !ordenesCache[id]);
        if (faltantes.length) {
          const fetched = await Promise.all(
            faltantes.map(async (id) => {
              try {
                const r = await fetch(`${apiUrl}/ordenes-pago/${id}`, { credentials: "include" });
                const j = await r.json();
                if (!r.ok) throw new Error(j?.error || `No se pudo obtener orden #${id}`);
                return [id, j];
              } catch (e) {
                console.warn("⚠️ fetch orden", id, e.message);
                return [id, null];
              }
            })
          );
          const asObj = Object.fromEntries(fetched.filter(([_, v]) => !!v));
          if (Object.keys(asObj).length) {
            setOrdenesCache(prev => ({ ...prev, ...asObj }));
          }
        }
      }

    } catch (err) {
      console.error("❌ Error al cargar movimientos de caja:", err);
      setMovs([]);
    } finally {
      setLoading(false);
    }
  }, [cajaAbierta?.abierta, cajaAbierta?.caja?.id, fechaDesde, fechaHasta, ordenesCache]);

  useEffect(() => {
    loadMovs();
  }, [loadMovs]);

  const onAplicarFiltro = () => loadMovs();
  const onLimpiarFiltro = () => {
    setFechaDesde("");
    setFechaHasta("");
    setDescFiltro("");
    setCatFiltro("");
    loadMovs({ fechaDesde: "", fechaHasta: "" });
  };

  const nuevoMovimiento = () => setShowNuevo(true);
  const onNuevoCreated = () => {
    loadMovs();
    loadTotalesCajaAbierta();
    setShowNuevo(false);
  };

  // Nombre del proveedor desde la ORDEN (cache) o fallback por id
  const nombreProveedorDeMovimiento = (m) => {
    const ordenId = m?.ordenpago_id || m?.ordenpago?.id;
    const orden = (ordenId && ordenesCache[ordenId]) || m?.ordenpago || null;

    const emb =
      orden?.proveedor?.razonsocial ||
      orden?.proveedor?.nombre ||
      null;
    if (emb) return emb;

    const provId = orden?.proveedor_id ?? m?.proveedor_id ?? null;
    if (provId) {
      const p = proveedoresTabla.find((x) => Number(x.id) === Number(provId));
      if (p) return p.razonsocial || p.nombre || `Proveedor #${p.id}`;
      return `Proveedor #${provId}`;
    }
    return "";
  };

  const abrirDetalle = (mov) => {
    setMovSeleccionado(mov);

    const isIngreso = String(mov?.tipo || "").toLowerCase() === "ingreso";
    if (isIngreso) setShowDetalleIngreso(true);
    else setShowDetalle(true);
  };



  if (!cajaAbierta?.abierta) {
    return (
      <Container>
        <h1 className="my-list-title dark-text">Movimientos de Caja</h1>
        <div className="mb-3">
          <Button className="mx-2" variant="success" disabled>Nuevo Egreso</Button>
          {/* <Button className="mx-2" variant="success" disabled>Ver Movimiento</Button> */}
          {/*<Button className="mx-2" variant="success" disabled>Borrar Movimiento</Button>*/}
        </div>
        <Alert variant="warning" className="d-flex justify-content-between align-items-center">
          <div><strong>No hay caja abierta.</strong> Para ver y registrar movimientos, primero abrí una caja.</div>
          <div><Button variant="primary" onClick={() => navigate("/tesoreria/abrir-caja")}>Abrir Caja</Button></div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-list-title dark-text">Movimientos de Caja</h1>

      <div className="mb-3">
        <Button className="mx-2" variant="success" onClick={nuevoMovimiento}>Nuevo Egreso</Button>
        <Button className="mx-2" variant="success" onClick={() => setShowNuevoIngreso(true)}>
          Nuevo Ingreso
        </Button>
        {/* <Button className="mx-2" variant="success" onClick={() => movSeleccionado && setShowDetalle(true)}>Ver Movimiento</Button> */}
        {/*<Button className="mx-2" variant="success" onClick={() => console.log("Borrar Movimiento - próximamente")}>Borrar Movimiento</Button>*/}
      </div>

      <Alert variant="light" className="mb-3">
        <div className="d-flex flex-wrap" style={{ gap: 16 }}>
          <div><strong>Caja #</strong>{cajaAbierta?.caja?.id ?? "-"}</div>
          <div><strong>Inicial:</strong> {fmtMoney(cajaAbierta?.caja?.caja_inicial ?? 0)}</div>
          <div><strong>Ingresos (TODOS):</strong> {fmtMoney(totalesCajaAbierta.ingresos)}</div>
          <div><strong>Egresos (TODOS):</strong> {fmtMoney(totalesCajaAbierta.egresos)}</div>
          <div><strong>Saldo actual:</strong> {fmtMoney(saldoActual)}</div>
        </div>
        {(fechaDesde || fechaHasta) && (
          <div className="mt-2 text-muted">* La tabla está filtrada por fecha; el saldo actual ignora esos filtros.</div>
        )}
      </Alert>

      {/* Filtros */}
      <Form className="mb-3">
        <Row className="g-2">
          <Col md={3}>
            <Form.Label>Fecha desde</Form.Label>
            <Form.Control type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Label>Fecha hasta</Form.Label>
            <Form.Control type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </Col>

          <Col md={3}>
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              placeholder="Buscar descripción…"
              value={descFiltro}
              onChange={(e) => setDescFiltro(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Categoría (ingreso/egreso)</Form.Label>
            <Form.Select
              value={catFiltro}
              onChange={(e) => setCatFiltro(e.target.value)}
              className="form-control my-input"
            >
              <option value="">Todas</option>
              {categoriasCombo.map(c => (
                <option key={`${c._tipo}:${c.id}`} value={`${c._tipo}:${c.id}`}>
                  {c.nombre} {c._tipo === "ingreso" ? "(Ingreso)" : "(Egreso)"}
                </option>
              ))}
            </Form.Select>
          </Col>



          <Col md="auto" className="d-flex align-items-end">
            <Button className="mx-1" variant="outline-secondary" onClick={onAplicarFiltro} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Aplicar filtro"}
            </Button>
            <Button className="mx-1" variant="outline-dark" onClick={onLimpiarFiltro} disabled={loading}>
              Limpiar
            </Button>
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Proyecto</th>    {/* 👈 NUEVA */}
            <th>Categoría</th>
            <th>Entidad / Proveedor</th>
            <th className="text-end">Ingreso</th>
            <th className="text-end">Egreso</th>
            <th>Acciones</th> {/* 👈 NUEVA */}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={9} className="text-center text-muted">Cargando movimientos...</td>
            </tr>
          )}

          {!loading && movsFiltrados.map((m) => {
            const isIngreso = String(m.tipo).toLowerCase() === "ingreso";
            return (
              <tr
                key={m.id}
                onDoubleClick={() => abrirDetalle(m)}
                style={{ cursor: "pointer" }}
                title="Doble click para ver detalle de la Orden de Pago"
                onClick={() => setMovSeleccionado(m)}
              >
                <td>{m.id}</td>
                <td>{m.fecha || ""}</td>
                <td>{m.descripcion || ""}</td>
                <td>{nombreProyecto(m)}</td>
                <td>{nombreCategoriaMovimiento(m)}</td>
                <td>{nombreProveedorDeMovimiento(m)}</td>
                <td className="text-end">{isIngreso ? fmtMoney(m.monto) : ""}</td>
                <td className="text-end">{!isIngreso ? fmtMoney(m.monto) : ""}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); eliminarMovimiento(m); }}
                    disabled={deletingId === m.id || loading}
                  >
                    {deletingId === m.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </td>

              </tr>
            );
          })}

          {!loading && movs.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center text-muted">No hay movimientos para mostrar.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={7} className="text-end"><strong>Totales del período</strong></td>
            <td className="text-end"><strong>{fmtMoney(ingresosTotal)}</strong></td>
            <td className="text-end"><strong>{fmtMoney(egresosTotal)}</strong></td>
          </tr>
          <tr>
            <td colSpan={7} className="text-end"><strong>Saldo (Ingresos − Egresos)</strong></td>
            <td colSpan={2} className="text-end"><strong>{fmtMoney(saldoPeriodo)}</strong></td>
          </tr>
        </tfoot>
      </Table>

      <NuevoMovimientoCaja
        show={showNuevo}
        onHide={() => setShowNuevo(false)}
        onCreated={onNuevoCreated}
      />

      <OrdenPagoDetalleModal
        show={showDetalle}
        onHide={() => setShowDetalle(false)}
        movimiento={movSeleccionado}
        ordenId={movSeleccionado?.ordenpago_id || movSeleccionado?.ordenpago?.id}
        orden={(() => {
          const oid = movSeleccionado?.ordenpago_id || movSeleccionado?.ordenpago?.id;
          return oid ? ordenesCache[oid] : null;
        })()}
      />

      <NuevoMovimientoCajaIngreso
        show={showNuevoIngreso}
        onHide={() => setShowNuevoIngreso(false)}
        onCreated={() => {
          loadMovs();
          loadTotalesCajaAbierta();
          setShowNuevoIngreso(false);
        }}
      />

      <MovimientoCajaIngresoDetalleModal
        show={showDetalleIngreso}
        onHide={() => setShowDetalleIngreso(false)}
        movimiento={movSeleccionado}
        proyectosTabla={proyectosTabla}
        categoriasIngreso={dataContext?.categoriasIngreso || []}
      />
    </Container>
  );
}
