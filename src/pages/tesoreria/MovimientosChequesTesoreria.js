// src/components/tesoreria/MovimientosChequesTesoreria.js
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Form, Row, Col, Alert, Spinner, Badge } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import NuevoMovimientoCheques from "./NuevoMovimientoCheques";
import OrdenPagoDetalleModal from "../comprasTesoreria/OrdenPagoDetalleModal.js";

const apiUrl = process.env.REACT_APP_API_URL;

export default function MovimientosChequesTesoreria() {
  const dataContext = useContext(Contexts.DataContext);
  const {
    empresaSeleccionada,
    bancosTabla = [],
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
    proyectosTabla = [],
    proveedoresTabla = [],
  } = dataContext || {};

  // Proveedores (fallback si el contexto no los trae)
  const [proveedoresLocal, setProveedoresLocal] = useState([]);
  useEffect(() => {
    if ((proveedoresTabla || []).length > 0) return;
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`${apiUrl}/proveedores`, { credentials: "include" });
        const data = await r.json();
        if (!cancel && Array.isArray(data)) setProveedoresLocal(data);
      } catch (e) {
        console.warn("No se pudo cargar proveedores:", e?.message);
      }
    })();
    return () => { cancel = true; };
  }, [proveedoresTabla]);

  const empresa_id = empresaSeleccionada?.id || null;

  // cache de OP (por id)
  const [ordenesCache, setOrdenesCache] = useState({}); // { [id]: orden }

  // Listado
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [bancoIdFiltro, setBancoIdFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState(""); // emitido|entregado|presentado|acreditado|rechazado|anulado
  const [porFecha, setPorFecha] = useState("emision");  // emision|vencimiento
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [numeroFiltro, setNumeroFiltro] = useState("");

  // Modales
  const [showNuevo, setShowNuevo] = useState(false);
  const [showDetalleOP, setShowDetalleOP] = useState(false);
  const [movSeleccionado, setMovSeleccionado] = useState(null);

  // Cat/Proy helpers
  const categorias = useMemo(
    () => (categoriasEgresoTabla?.length ? categoriasEgresoTabla : categoriasEgreso) || [],
    [categoriasEgresoTabla, categoriasEgreso]
  );
  const catById = useMemo(() => {
    const m = new Map();
    categorias.forEach((c) => m.set(Number(c.id), c));
    return m;
  }, [categorias]);
  const proyById = useMemo(() => {
    const m = new Map();
    (proyectosTabla || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [proyectosTabla]);

  // Proveedores
  const provById = useMemo(() => {
    const m = new Map();
    const fuente = (proveedoresTabla && proveedoresTabla.length > 0) ? proveedoresTabla : proveedoresLocal;
    (fuente || []).forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [proveedoresTabla, proveedoresLocal]);

  const nombreProveedor = (id) => {
    const p = provById.get(Number(id));
    return p?.nombre || p?.razonsocial || (id ? `Proveedor #${id}` : "");
  };
  const nombreCategoria = (id) => catById.get(Number(id))?.nombre || "";
  const nombreProyecto = (id) => {
    const p = proyById.get(Number(id));
    return p?.descripcion || p?.nombre || "";
  };

  const bancosEmpresa = useMemo(() => {
    if (!empresa_id) return bancosTabla;
    return (bancosTabla || []).filter((b) => Number(b.empresa_id) === Number(empresa_id));
  }, [bancosTabla, empresa_id]);

  const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

  const buildQS = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v) !== "") qs.set(k, v);
    });
    return qs.toString();
  };

  const loadItems = useCallback(async (overrides = {}) => {
    try {
      setLoading(true);
      const qs = buildQS({
        empresa_id: empresa_id || "",
        banco_id: (overrides.bancoIdFiltro ?? bancoIdFiltro) || "",
        estado: (overrides.estadoFiltro ?? estadoFiltro) || "",
        por: (overrides.porFecha ?? porFecha) || "emision",
        fecha_desde: (overrides.fechaDesde ?? fechaDesde) || "",
        fecha_hasta: (overrides.fechaHasta ?? fechaHasta) || "",
        numero_echeq: (overrides.numeroFiltro ?? numeroFiltro) || "",
        includeAnulados: "0",
      });
      const url = `${apiUrl}/echeqs-emitidos?${qs}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => {
        const fa = (porFecha === "vencimiento" ? a.fecha_vencimiento : a.fecha_emision) || "";
        const fb = (porFecha === "vencimiento" ? b.fecha_vencimiento : b.fecha_emision) || "";
        if (fa === fb) return a.id - b.id;
        return fa.localeCompare(fb);
      });
      setItems(list);

      // Prefetch OP
      const ordenIds = [...new Set(list.map((m) => m.ordenpago_id).filter(Boolean))];
      const faltantes = ordenIds.filter((id) => !ordenesCache[id]);
      if (faltantes.length) {
        const fetched = await Promise.all(
          faltantes.map(async (id) => {
            try {
              const r = await fetch(`${apiUrl}/ordenes-pago/${id}`, { credentials: "include" });
              const j = await r.json();
              if (!r.ok) throw new Error(j?.error || `No se pudo obtener OP #${id}`);
              return [id, j];
            } catch (e) {
              console.warn("⚠️ fetch OP", id, e.message);
              return [id, null];
            }
          })
        );
        const asObj = Object.fromEntries(fetched.filter(([_, v]) => !!v));
        if (Object.keys(asObj).length) setOrdenesCache((prev) => ({ ...prev, ...asObj }));
      }
    } catch (err) {
      console.error("❌ Error al cargar eCheqs emitidos:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [empresa_id, bancoIdFiltro, estadoFiltro, porFecha, fechaDesde, fechaHasta, numeroFiltro, ordenesCache]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const onAplicarFiltro = () => loadItems();
  const onLimpiarFiltro = () => {
    setBancoIdFiltro("");
    setEstadoFiltro("");
    setPorFecha("emision");
    setFechaDesde("");
    setFechaHasta("");
    setNumeroFiltro("");
    loadItems({
      bancoIdFiltro: "",
      estadoFiltro: "",
      porFecha: "emision",
      fechaDesde: "",
      fechaHasta: "",
      numeroFiltro: "",
    });
  };

  const bancoNombre = (id) => {
    const b = (bancosTabla || []).find((x) => Number(x.id) === Number(id));
    return b?.nombre || b?.descripcion || b?.alias || (id ? `Banco #${id}` : "");
  };

  const colorEstado = (estado) => {
    switch ((estado || "").toLowerCase()) {
      case "emitido": return "secondary";
      case "entregado": return "info";
      case "presentado": return "warning";
      case "acreditado": return "success";
      case "rechazado": return "danger";
      case "anulado": return "dark";
      default: return "secondary";
    }
  };

  // Acciones
  const doAccion = async (id, accion, body = {}) => {
    try {
      const res = await fetch(`${apiUrl}/echeqs-emitidos/${id}/${accion}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body || {}),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || `No se pudo ${accion} eCheq`);
      loadItems();
    } catch (e) {
      alert(e.message);
    }
  };

  const doEliminar = async (id) => {
    if (!window.confirm("¿Eliminar definitivamente este eCheq? Se revertirán abonos/aplicaciones y OP vinculada.")) return;
    try {
      const res = await fetch(`${apiUrl}/echeqs-emitidos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "No se pudo eliminar el eCheq");
      loadItems();
    } catch (e) {
      alert(e.message);
    }
  };

  const onRowDblClick = (m) => {
    if (!m?.ordenpago_id) return;
    setMovSeleccionado(m);
    setShowDetalleOP(true);

    if (!ordenesCache[m.ordenpago_id]) {
      (async () => {
        try {
          const r = await fetch(`${apiUrl}/ordenes-pago/${m.ordenpago_id}`, { credentials: "include" });
          const j = await r.json();
          if (r.ok) setOrdenesCache(prev => ({ ...prev, [m.ordenpago_id]: j }));
        } catch (e) {
          console.warn("⚠️ No se pudo pre-cargar OP:", e?.message);
        }
      })();
    }
  };

  const { totalImporte } = useMemo(() => {
    const total = items.reduce((a, b) => a + Number(b.importe || 0), 0);
    return { totalImporte: total };
  }, [items]);

  const onNuevoCreated = () => {
    loadItems();
    setShowNuevo(false);
  };

  return (
    <Container>
      <h1 className="my-list-title dark-text">eCheqs Emitidos</h1>

      <div className="mb-3">
        <Button
          className="mx-2"
          variant="success"
          onClick={() => setShowNuevo(true)}
          disabled={!empresa_id}
        >
          Nuevo eCheq
        </Button>
      </div>

      {!empresa_id && (
        <Alert variant="info" className="py-2">
          No hay empresa seleccionada: se listan <strong>todos</strong> los eCheqs. Para emitir uno nuevo,
          seleccioná una empresa (solo se podrán usar bancos de esa empresa).
        </Alert>
      )}

      {/* Filtros */}
      <Form className="mb-3">
        <Row className="g-2">
          <Col md={3}>
            <Form.Label>Banco</Form.Label>
            <Form.Select
              value={bancoIdFiltro}
              onChange={(e) => setBancoIdFiltro(e.target.value)}
              disabled={loading}
              className="form-control my-input"
            >
              <option value="">Todos</option>
              {(bancosEmpresa || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              disabled={loading}
              className="form-control my-input"
            >
              <option value="">Todos</option>
              <option value="emitido">Emitido</option>
              <option value="entregado">Entregado</option>
              <option value="presentado">Presentado</option>
              <option value="acreditado">Acreditado</option>
              <option value="rechazado">Rechazado</option>
              <option value="anulado">Anulado</option>
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Fecha por</Form.Label>
            <Form.Select
              value={porFecha}
              onChange={(e) => setPorFecha(e.target.value)}
              disabled={loading}
              className="form-control my-input"
            >
              <option value="emision">Emisión</option>
              <option value="vencimiento">Vencimiento</option>
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Número eCheq</Form.Label>
            <Form.Control
              placeholder="(contiene)"
              value={numeroFiltro}
              onChange={(e) => setNumeroFiltro(e.target.value)}
              disabled={loading}
            />
          </Col>
        </Row>

        <Row className="g-2 mt-1">
          <Col md={3}>
            <Form.Label>Fecha desde</Form.Label>
            <Form.Control
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              disabled={loading}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Fecha hasta</Form.Label>
            <Form.Control
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              disabled={loading}
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
            <th>Emisión</th>
            <th>Vencimiento</th>
            <th>Banco</th>
            <th>Número</th>
            <th>Proveedor</th>
            <th>Proyecto</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th className="text-end">Importe</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={11} className="text-center text-muted">
                Cargando…
              </td>
            </tr>
          )}

          {!loading && items.map((m) => (
            <tr
              key={m.id}
              onDoubleClick={() => onRowDblClick(m)}
              onClick={() => setMovSeleccionado(m)}
              style={{ cursor: m.ordenpago_id ? "pointer" : "default" }}
              title={m.ordenpago_id ? "Doble click para ver detalle de la Orden de Pago" : ""}
            >
              <td>{m.id}</td>
              <td>{m.fecha_emision || ""}</td>
              <td>{m.fecha_vencimiento || ""}</td>
              <td>{bancoNombre(m.banco_id)}</td>
              <td>{m.numero_echeq || ""}</td>
              <td>{nombreProveedor(m.proveedor_id)}</td>
              <td>{nombreProyecto(m.proyecto_id)}</td>
              <td>{nombreCategoria(m.categoriaegreso_id)}</td>
              <td>
                <Badge bg={colorEstado(m.estado)}>{m.estado}</Badge>
                {m.anulado ? <span className="ms-1 badge bg-dark">anulado</span> : null}
              </td>
              <td className="text-end">{fmtMoney(m.importe)}</td>
              <td className="text-nowrap">
                {/* Acciones según estado */}
                {!m.anulado && m.estado !== "acreditado" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline-success"
                      className="mx-1"
                      onClick={() => {
                        const def = new Date().toISOString().slice(0, 10);
                        const fecha_acreditacion = prompt("Fecha de acreditación (YYYY-MM-DD):", def) || "";
                        if (!fecha_acreditacion) return;
                        doAccion(m.id, "acreditar", { fecha_acreditacion });
                      }}
                    >
                      Acreditar
                    </Button>

                    {/* 
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="mx-1"
                      onClick={() => {
                        const motivo = prompt("Motivo del rechazo (opcional):") || "";
                        doAccion(m.id, "rechazar", { motivo });
                      }}
                    >
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-dark"
                      className="mx-1"
                      onClick={() => doAccion(m.id, "anular")}
                    >
                      Anular
                    </Button>*/}
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="mx-1"
                      onClick={() => doEliminar(m.id)}
                    >
                      Eliminar
                    </Button>
                  </>
                )}
                {(m.anulado || m.estado === "acreditado") && (
                  <span className="text-muted small">Sin acciones</span>
                )}
              </td>
            </tr>
          ))}

          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={11} className="text-center text-muted">
                No hay eCheqs para mostrar.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={9} className="text-end"><strong>Total</strong></td>
            <td className="text-end"><strong>{fmtMoney(totalImporte)}</strong></td>
            <td />
          </tr>
        </tfoot>
      </Table>

      {/* Alta */}
      <NuevoMovimientoCheques
        show={showNuevo}
        onHide={() => setShowNuevo(false)}
        onCreated={onNuevoCreated}
      />

      {/* Detalle OP (si existe) */}
      <OrdenPagoDetalleModal
        show={showDetalleOP}
        onHide={() => setShowDetalleOP(false)}
        movimiento={movSeleccionado}
        ordenId={movSeleccionado?.ordenpago_id ? Number(movSeleccionado.ordenpago_id) : undefined}
        orden={movSeleccionado?.ordenpago_id ? ordenesCache[movSeleccionado.ordenpago_id] : null}
      />
    </Container>
  );
}
