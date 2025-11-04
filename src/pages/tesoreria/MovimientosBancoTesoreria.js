// src/components/tesoreria/BancoTesoreriaList.jsx
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import NuevoMovimientoBanco from "./NuevoMovimientoBanco";
import NuevoMovimientoBancoIngreso from "./NuevoMovimientoBancoIngreso.js";
import OrdenPagoDetalleModal from "../comprasTesoreria/OrdenPagoDetalleModal.js";

const apiUrl = process.env.REACT_APP_API_URL;

export default function BancoTesoreriaList() {
  const dataContext = useContext(Contexts.DataContext);
  const {
    proveedoresTabla = [],
    bancosTabla = [],
    bancos = [],
    empresaSeleccionada,
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
    proyectosTabla = [],
  } = dataContext || {};

  // categorías desde contexto (nombre por id)
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

  // Proyectos (mostrar nombre)
  const projById = useMemo(() => {
    const m = new Map();
    (proyectosTabla || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [proyectosTabla]);
  const nombreProyecto = (m) =>
    m?.proyecto?.descripcion ||
    projById.get(Number(m.proyecto_id))?.descripcion ||
    "";

  // cache local de órdenes (por id)
  const [ordenesCache, setOrdenesCache] = useState({}); // { [ordenId]: orden }

  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(false);

  // eliminación
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // filtros
  const [bancoIdFiltro, setBancoIdFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // modales
  const [showNuevo, setShowNuevo] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [movSeleccionado, setMovSeleccionado] = useState(null);
  const [showNuevoIngreso, setShowNuevoIngreso] = useState(false);
  const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

  const buildQS = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v) !== "") qs.set(k, v);
    });
    return qs.toString();
  };

  // 🔁 Lista base de bancos: preferí bancosTabla; si está vacía, usá bancos
  const bancosAll = useMemo(
    () => (bancosTabla?.length ? bancosTabla : bancos) || [],
    [bancosTabla, bancos]
  );

  // 🔎 Si hay empresa -> bancos de esa empresa; si no, mostrar TODOS los bancos
  const bancosParaCombo = useMemo(() => {
    const eid = empresaSeleccionada?.id;
    if (!eid) return bancosAll;
    return bancosAll.filter((b) => Number(b.empresa_id) === Number(eid));
  }, [bancosAll, empresaSeleccionada?.id]);

  const loadMovs = useCallback(async (overrides = {}) => {
    try {
      setLoading(true);
      const desde = overrides.fechaDesde ?? fechaDesde;
      const hasta = overrides.fechaHasta ?? fechaHasta;
      const bancoFilt = overrides.bancoIdFiltro ?? bancoIdFiltro;

      // 👉 Si no hay empresa seleccionada, NO enviar empresa_id
      const qs = buildQS({
        empresa_id: empresaSeleccionada?.id || "",
        banco_id: bancoFilt || "",
        fecha_desde: desde || "",
        fecha_hasta: hasta || "",
        includeAnulados: "0",
      });

      const res = await fetch(`${apiUrl}/movimientos-banco-tesoreria?${qs}`, {
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
      console.error("❌ Error al cargar movimientos de banco:", err);
      setMovs([]);
    } finally {
      setLoading(false);
    }
  }, [empresaSeleccionada?.id, fechaDesde, fechaHasta, bancoIdFiltro, ordenesCache]);

  useEffect(() => {
    loadMovs();
  }, [loadMovs]);

  const onAplicarFiltro = () => loadMovs();
  const onLimpiarFiltro = () => {
    setBancoIdFiltro("");
    setFechaDesde("");
    setFechaHasta("");
    loadMovs({ bancoIdFiltro: "", fechaDesde: "", fechaHasta: "" });
  };

  // Totales del listado (período filtrado)
  const { ingresosTotal, egresosTotal, saldoPeriodo } = useMemo(() => {
    const ingresos = movs
      .filter((m) => String(m.tipo).toLowerCase() === "ingreso" && !m.anulado)
      .reduce((a, b) => a + Number(b.monto || 0), 0);
    const egresos = movs
      .filter((m) => String(m.tipo).toLowerCase() === "egreso" && !m.anulado)
      .reduce((a, b) => a + Number(b.monto || 0), 0);
    return {
      ingresosTotal: ingresos,
      egresosTotal: egresos,
      saldoPeriodo: ingresos - egresos,
    };
  }, [movs]);

  const nombreProveedorDeMovimiento = (m) => {
    const ordenId = m?.ordenpago_id || m?.ordenpago?.id;
    const orden = (ordenId && ordenesCache[ordenId]) || m?.ordenpago || null;

    const emb = orden?.proveedor?.razonsocial || orden?.proveedor?.nombre || null;
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
    setShowDetalle(true);
  };

  const onNuevoCreated = () => {
    loadMovs();
    setShowNuevo(false);
  };

  // === Eliminar movimiento ===
  const eliminarMovimiento = async (e, mov) => {
    e.stopPropagation();
    if (!mov?.id) return;

    const isIngreso = String(mov.tipo).toLowerCase() === "ingreso";
    const msg = isIngreso
      ? `¿Eliminar el INGRESO #${mov.id} (${mov.fecha}) por ${fmtMoney(mov.monto)}?`
      : `¿Eliminar el EGRESO #${mov.id} (${mov.fecha}) por ${fmtMoney(mov.monto)}?`;

    if (!window.confirm(msg)) return;

    try {
      setDeleteError(null);
      setDeletingId(mov.id);

      const res = await fetch(`${apiUrl}/movimientos-banco-tesoreria/${mov.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo eliminar el movimiento");

      await loadMovs();
    } catch (err) {
      setDeleteError(err.message || "Error eliminando el movimiento");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">Movimientos Bancarios</h1>

      {deleteError && (
        <Alert variant="danger" className="py-2">
          {deleteError}
        </Alert>
      )}

      <div className="mb-3">
        <Button className="mx-2" variant="success" onClick={() => setShowNuevo(true)}>
          Nuevo Egreso
        </Button>

        <Button className="mx-2" variant="success" onClick={() => setShowNuevoIngreso(true)}>
          Nuevo Ingreso
        </Button>
      </div>

      {/* Filtros */}
      <Form className="mb-3">
        <Row className="g-2">
          <Col md={3}>
            <Form.Label>Banco</Form.Label>
            <Form.Select
              value={bancoIdFiltro}
              onChange={(e) => setBancoIdFiltro(e.target.value)}
              className="form-control my-input"
            >
              <option value="">Todos</option>
              {bancosParaCombo.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Fecha desde</Form.Label>
            <Form.Control
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Fecha hasta</Form.Label>
            <Form.Control
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </Col>

          <Col md="auto" className="d-flex align-items-end">
            <Button
              className="mx-1"
              variant="outline-secondary"
              onClick={onAplicarFiltro}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Aplicar filtro"}
            </Button>
            <Button
              className="mx-1"
              variant="outline-dark"
              onClick={onLimpiarFiltro}
              disabled={loading}
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
            <th>Descripción</th>
            <th>Proyecto</th>
            <th>Categoría</th>
            <th>Entidad / Proveedor</th>
            <th className="text-end">Ingreso</th>
            <th className="text-end">Egreso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                Cargando movimientos...
              </td>
            </tr>
          )}

          {!loading &&
            movs.map((m) => {
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
                  <td>{nombreCategoria(m)}</td>
                  <td>{nombreProveedorDeMovimiento(m)}</td>
                  <td className="text-end">{isIngreso ? fmtMoney(m.monto) : ""}</td>
                  <td className="text-end">{!isIngreso ? fmtMoney(m.monto) : ""}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={(e) => eliminarMovimiento(e, m)}
                      disabled={deletingId === m.id}
                      title="Eliminar movimiento"
                    >
                      {deletingId === m.id ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        "Eliminar"
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}

          {!loading && movs.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                No hay movimientos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={7} className="text-end">
              <strong>Totales del período</strong>
            </td>
            <td className="text-end">
              <strong>{fmtMoney(ingresosTotal)}</strong>
            </td>
            <td className="text-end">
              <strong>{fmtMoney(egresosTotal)}</strong>
            </td>
          </tr>
          <tr>
            <td colSpan={7} className="text-end">
              <strong>Saldo (Ingresos − Egresos)</strong>
            </td>
            <td colSpan={2} className="text-end">
              <strong>{fmtMoney(saldoPeriodo)}</strong>
            </td>
          </tr>
        </tfoot>
      </Table>

      {/* Modal: Nuevo Movimiento (Banco) */}
      <NuevoMovimientoBanco
        show={showNuevo}
        onHide={() => setShowNuevo(false)}
        onCreated={onNuevoCreated}
      />

      {/* Modal: Detalle de OP */}
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

      <NuevoMovimientoBancoIngreso
        show={showNuevoIngreso}
        onHide={() => setShowNuevoIngreso(false)}
        onCreated={() => {
          loadMovs();
          setShowNuevoIngreso(false);
        }}
      />
    </Container>
  );
}
