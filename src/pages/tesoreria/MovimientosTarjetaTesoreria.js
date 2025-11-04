// src/components/tesoreria/MovimentosTarjetaTesoreria.js
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import NuevoMovimientoTarjeta from "./NuevoMovimientoTarjeta";
import OrdenPagoDetalleModal from "../comprasTesoreria/OrdenPagoDetalleModal.js";
import { FaTrash } from "react-icons/fa";

const apiUrl = process.env.REACT_APP_API_URL;

export default function MovimentosTarjetaTesoreria() {
  const dataContext = useContext(Contexts.DataContext);
  const {
    empresaSeleccionada,
    proveedoresTabla = [],
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
    proyectosTabla = [],
    bancosTabla = [],
    planTarjetaTesoreriaTabla = [],
  } = dataContext || {};

  const empresa_id = empresaSeleccionada?.id || null;




  const planById = useMemo(() => {
    const m = new Map();
    (planTarjetaTesoreriaTabla || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [planTarjetaTesoreriaTabla]);

  const nombrePlan = (id) => {
    const p = planById.get(Number(id));
    if (!p) return "";
    const base = p.descripcion || p.nombre || `Plan #${p.id}`;
    return p.cuotas ? `${base} · ${p.cuotas} cuotas` : base;
  };


  const categorias = useMemo(
    () => (categoriasEgresoTabla?.length ? categoriasEgresoTabla : categoriasEgreso) || [],
    [categoriasEgresoTabla, categoriasEgreso]
  );
  const catById = useMemo(() => {
    const m = new Map();
    categorias.forEach((c) => m.set(Number(c.id), c));
    return m;
  }, [categorias]);

  const provById = useMemo(() => {
    const m = new Map();
    (proveedoresTabla || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [proveedoresTabla]);

  const proyById = useMemo(() => {
    const m = new Map();
    (proyectosTabla || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [proyectosTabla]);

  const bancoById = useMemo(() => {
    const m = new Map();
    (bancosTabla || []).forEach((b) => m.set(Number(b.id), b));
    return m;
  }, [bancosTabla]);

  // Tarjetas
  const [tarjetas, setTarjetas] = useState([]);
  const tarjetasById = useMemo(() => {
    const m = new Map();
    (tarjetas || []).forEach((t) => m.set(Number(t.id), t));
    return m;
  }, [tarjetas]);

  const loadTarjetas = useCallback(async () => {
    try {
      // ⬅️ cambio: si hay empresa -> solo tarjetas de esa empresa; si no, todas
      const url = empresa_id
        ? `${apiUrl}/tarjetas-comunes?empresa_id=${empresa_id}`
        : `${apiUrl}/tarjetas-comunes`;
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      setTarjetas(Array.isArray(json) ? json : []);
    } catch (e) {
      console.warn("⚠️ No se pudieron cargar tarjetas:", e.message);
      setTarjetas([]);
    }
  }, [empresa_id]);

  // Opciones de tarjeta para el filtro: una por terminación (evita duplicados)
  const tarjetasFiltro = useMemo(() => {
    const seen = new Set();
    const arr = [];
    for (const t of (tarjetas || [])) {
      const term = String(t.terminacion || "").padStart(4, "0");
      if (!seen.has(term)) {
        seen.add(term);
        arr.push(t);
      }
    }
    return arr;
  }, [tarjetas]);

  // Listado
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [terminacion, setTerminacion] = useState("");

  // Modal
  const [showNuevo, setShowNuevo] = useState(false);
  const [ordenesCache, setOrdenesCache] = useState({}); // { [ordenId]: orden }
  const [showDetalle, setShowDetalle] = useState(false);
  const [movSeleccionado, setMovSeleccionado] = useState(null);

  const [eliminandoId, setEliminandoId] = useState(null);

  const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

  const buildQS = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v) !== "") qs.set(k, v);
    });
    return qs.toString();
  };

  const loadMovs = useCallback(async (overrides = {}) => {
    try {
      setLoading(true);
      const desde = overrides.fechaDesde ?? fechaDesde;
      const hasta = overrides.fechaHasta ?? fechaHasta;
      const term = overrides.terminacion ?? terminacion;

      // ⬅️ cambio: empresa_id solo si está seleccionada; si no, se listan TODAS
      const baseParams = {
        fecha_desde: desde || "",
        fecha_hasta: hasta || "",
        terminacion: term || "",
        includeAnulados: "0",
      };
      if (empresa_id) baseParams.empresa_id = empresa_id;

      const qs = buildQS(baseParams);
      const res = await fetch(`${apiUrl}/pagos-tarjeta?${qs}`, { credentials: "include" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => {
        if (a.fecha === b.fecha) return a.id - b.id;
        return (a.fecha || "").localeCompare(b.fecha || "");
      });
      setMovs(list);

      // Prefetch de órdenes relacionadas
      const ordenIds = [...new Set(list.map((m) => m.ordenpago_id).filter(Boolean))];
      const faltantes = ordenIds.filter((id) => !ordenesCache[id]);
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
        if (Object.keys(asObj).length) setOrdenesCache((prev) => ({ ...prev, ...asObj }));
      }


    } catch (err) {
      console.error("❌ Error al cargar pagos tarjeta:", err);
      setMovs([]);
    } finally {
      setLoading(false);
    }
  }, [empresa_id, fechaDesde, fechaHasta, terminacion, ordenesCache]);

  useEffect(() => { loadTarjetas(); }, [loadTarjetas]);
  useEffect(() => { loadMovs(); }, [loadMovs]);

  const onAplicarFiltro = () => loadMovs();
  const onLimpiarFiltro = () => {
    setFechaDesde("");
    setFechaHasta("");
    setTerminacion("");
    loadMovs({ fechaDesde: "", fechaHasta: "", terminacion: "" });
  };

  const { egresosTotal } = useMemo(() => {
    const egresos = movs.reduce((a, b) => a + Number(b.importe || 0), 0);
    return { egresosTotal: egresos };
  }, [movs]);

  const mostrarTerminacion = (m) => {
    const tInc = m?.tarjeta?.terminacion;
    if (tInc) return tInc;
    const t = tarjetasById.get(Number(m.tarjetacomun_id));
    return t?.terminacion || "";
  };
  const mostrarMarcaTipo = (m) => {
    const t = tarjetasById.get(Number(m.tarjetacomun_id));
    const marca = t?.marca_id ? `Marca #${t.marca_id}` : "";
    const tipo = t?.tipotarjeta_id ? `Tipo #${t.tipotarjeta_id}` : "";
    return [marca, tipo].filter(Boolean).join(" · ");
  };
  const mostrarBanco = (m) => {
    const t = tarjetasById.get(Number(m.tarjetacomun_id));
    const b = t ? bancoById.get(Number(t.banco_id)) : null;
    return b?.nombre || b?.descripcion || b?.alias || (t?.banco_id ? `Banco #${t.banco_id}` : "");
  };
  const nombreProveedor = (id) => {
    const p = provById.get(Number(id));
    return p?.razonsocial || p?.nombre || p?.descripcion || (id ? `Proveedor #${id}` : "");
  };
  const nombreCategoria = (id) => catById.get(Number(id))?.nombre || "";
  const nombreProyecto = (id) => {
    const p = proyById.get(Number(id));
    return p?.descripcion || p?.nombre || (id ? `Proyecto #${id}` : "");
  };

  const onNuevoCreated = () => {
    loadMovs();
    setShowNuevo(false);
  };

  async function handleEliminar(mov) {
    if (!mov?.id) return;
    const confirmar = window.confirm(
      `¿Eliminar el pago con tarjeta #${mov.id}?\n` +
      `Esto revertirá aplicaciones/OP/abono y recalculará comprobantes si corresponde.`
    );
    if (!confirmar) return;

    try {
      setEliminandoId(mov.id);
      const res = await fetch(`${apiUrl}/pagos-tarjeta/${mov.id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo eliminar el pago");
      // refresca listado
      await loadMovs();
    } catch (e) {
      alert(e.message || "Error eliminando el pago");
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <Container>
      <h1 className="my-list-title dark-text">Movimientos con Tarjeta</h1>

      <div className="mb-3">
        <Button
          className="mx-2"
          variant="success"
          onClick={() => setShowNuevo(true)}
          disabled={!empresa_id}    // ⬅️ cambio: sin empresa, no se puede crear
        >
          Nuevo Movimiento
        </Button>
      </div>

      {!empresa_id && (
        <Alert variant="info" className="py-2">
          No hay empresa seleccionada: se muestran <strong>todos</strong> los movimientos. Para registrar uno nuevo,
          seleccioná una empresa (solo se podrán cargar movimientos con tarjetas de esa empresa).
        </Alert>
      )}

      {/* Filtros (habilitados aun sin empresa) */}
      <Form className="mb-3">
        <Row className="g-2">
          <Col md={3}>
            <Form.Label>Fecha desde</Form.Label>
            <Form.Control
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              disabled={loading}   // ⬅️ cambio: quitar condición empresa
            />
          </Col>
          <Col md={3}>
            <Form.Label>Fecha hasta</Form.Label>
            <Form.Control
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              disabled={loading}   // ⬅️ cambio
            />
          </Col>


          <Col md={3}>
            <Form.Label>Tarjeta / terminación</Form.Label>
            <Form.Select
              value={terminacion}
              onChange={(e) => setTerminacion(e.target.value)}
              disabled={loading || (tarjetasFiltro.length === 0)}
              className="form-control my-input"
            >
              <option value="">Todas</option>
              {tarjetasFiltro.map((t) => {
                const b = bancoById.get(Number(t.banco_id));
                const bancoTxt = b?.nombre || b?.descripcion || b?.alias || "";
                const label =
                  `****${String(t.terminacion || "").padStart(4, "0")}` +
                  (bancoTxt ? ` · ${bancoTxt}` : "") +
                  (t.marca_id ? ` · Marca #${t.marca_id}` : "") +
                  (t.tipotarjeta_id ? ` · Tipo #${t.tipotarjeta_id}` : "");
                return (
                  <option key={t.id} value={String(t.terminacion || "").padStart(4, "0")}>
                    {label}
                  </option>
                );
              })}
            </Form.Select>
          </Col>


          <Col md="auto" className="d-flex align-items-end">
            <Button
              className="mx-1"
              variant="outline-secondary"
              onClick={onAplicarFiltro}
              disabled={loading}   // ⬅️ cambio
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Aplicar filtro"}
            </Button>
            <Button
              className="mx-1"
              variant="outline-dark"
              onClick={onLimpiarFiltro}
              disabled={loading}   // ⬅️ cambio
            >
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
            <th>Tarjeta</th>
            <th>Banco</th>
            <th>Proveedor</th>
            <th>Categoría</th>
            <th>Proyecto</th>
            <th>Concepto</th>
            <th>Cupón</th>
            <th>Plan</th>
            <th>Estado</th>
            <th className="text-end">Egreso</th>
            <th>Acciones</th> {/* NUEVA */}
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={12} className="text-center text-muted">Cargando...</td>
            </tr>
          )}

          {!loading && movs.map((m) => (
            <tr
              key={m.id}
              onDoubleClick={() => { setMovSeleccionado(m); setShowDetalle(true); }}
              onClick={() => setMovSeleccionado(m)}
              style={{ cursor: "pointer" }}
              title="Doble click para ver detalle de la Orden de Pago"
            >
              <td>{m.id}</td>
              <td>{m.fecha || ""}</td>
              <td>
                ****{mostrarTerminacion(m)}
                {mostrarMarcaTipo(m) ? <div className="text-muted small">{mostrarMarcaTipo(m)}</div> : null}
              </td>
              <td>{mostrarBanco(m)}</td>
              <td>{nombreProveedor(m.proveedor_id)}</td>
              <td>{nombreCategoria(m.categoriaegreso_id)}</td>
              <td>{nombreProyecto(m.proyecto_id)}</td>
              <td>{m.concepto || ""}</td>
              <td>{m.cupon_numero || ""}</td>                {/* 👈 NUEVA */}
              <td>{nombrePlan(m.planpago_id)}</td>           {/* 👈 NUEVA */}
              <td>{m.estado || ""}</td>
              <td className="text-end">{fmtMoney(m.importe)}</td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleEliminar(m); }}
                  disabled={eliminandoId === m.id}
                  title="Eliminar (reversa completa)"
                >
                  {eliminandoId === m.id ? <Spinner animation="border" size="sm" /> : <FaTrash />}
                </Button>
              </td>
            </tr>
          ))}

          {!loading && movs.length === 0 && (
            <tr>
              <td colSpan={12} className="text-center text-muted">No hay movimientos para mostrar.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={11} className="text-end"><strong>Total egresos</strong></td>
            <td className="text-end"><strong>{fmtMoney(egresosTotal)}</strong></td>
          </tr>
        </tfoot>
      </Table>

      {/* Modal: solo crea con tarjetas de la empresa seleccionada (lo maneja internamente por empresa_id) */}
      <NuevoMovimientoTarjeta
        show={showNuevo}
        onHide={() => setShowNuevo(false)}
        onCreated={onNuevoCreated}
      />

      {/* Modal: Detalle de OP */}
      <OrdenPagoDetalleModal
        show={showDetalle}
        onHide={() => setShowDetalle(false)}
        movimiento={movSeleccionado}
        ordenId={movSeleccionado?.ordenpago_id}
        orden={(() => {
          const oid = movSeleccionado?.ordenpago_id;
          return oid ? ordenesCache[oid] : null;
        })()}
      />

    </Container>
  );
}
