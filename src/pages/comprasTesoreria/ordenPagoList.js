// src/components/tesoreria/OrdenPagoList.js
import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Modal, Form, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";
//import OrdenPagoNuevoModal from "./OrdenPagoNuevoModal"; // 👈 vuelve el modal de Nuevo Pago
import AbonoCtaCteModal from "./abonoCtaCteModal";

const apiUrl = process.env.REACT_APP_API_URL;

export default function OrdenPagoList() {
  // Ahora muestra ABONOS de Cta Cte (no órdenes)
  const dataContext = useContext(Contexts.DataContext);
  const {
    proveedoresTabla = [],
    empresasTabla = [],
    empresaSeleccionada,
    formasPagoTesoreria,
  } = dataContext || {};

  const [abonos, setAbonos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comprobantes, setComprobantes] = useState([]);
  // Filtros
  const [filtros, setFiltros] = useState({
    proveedor_id: "",
    fecha_desde: "",
    fecha_hasta: "",
  });
  const onFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((p) => ({ ...p, [name]: value }));
  };
  const limpiarFiltros = () => setFiltros({ proveedor_id: "", fecha_desde: "", fecha_hasta: "" });

  // Detalle
  const [showDetalle, setShowDetalle] = useState(false);
  const [sel, setSel] = useState(null);

  // NUEVO PAGO
  const [showNuevo, setShowNuevo] = useState(false); // 👈 como antes

  // Map empresaId -> nombre
  const empresasById = useMemo(() => {
    const map = {};
    for (const e of empresasTabla) {
      map[e.id] = e.nombre || e.razon_social || e.descripcion || `Empresa ${e.id}`;
    }
    return map;
  }, [empresasTabla]);

  const findProveedorNombre = (id) =>
    proveedoresTabla.find((p) => Number(p.id) === Number(id))?.nombre || id;

  const findEmpresaNombre = (id) =>
    empresaSeleccionada?.id
      ? (empresaSeleccionada.descripcion ||
        empresaSeleccionada.razon_social ||
        empresaSeleccionada.nombre ||
        `Empresa ${empresaSeleccionada.id}`)
      : (empresasById[id] || id);

  const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

  const buildQS = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, v);
    });
    return qs.toString();
  };

  const loadAbonos = useCallback(async () => {
    try {
      setLoading(true);
      const qs = buildQS({
        empresa_id: empresaSeleccionada?.id || "",
        proveedor_id: filtros.proveedor_id || "",
        fecha_desde: filtros.fecha_desde || "",
        fecha_hasta: filtros.fecha_hasta || "",
      });

      const res = await fetch(`${apiUrl}/movimientos-cta-cte-proveedor?${qs}`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log("data", data)
      const movimientos = Array.isArray(data) ? data : Array.isArray(data?.movimientos) ? data.movimientos : [];

      // Solo ABONOS (excluye anulados)
      const soloAbonos = movimientos
        .filter(m => (m.tipo || "").toLowerCase() === "abono" && !Boolean(m.anulado))
        .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")) || Number(b.id) - Number(a.id));

      setAbonos(soloAbonos);
    } catch (e) {
      console.error("❌ Error al cargar abonos de Cta Cte:", e);
      setAbonos([]);
    } finally {
      setLoading(false);
    }
  }, [empresaSeleccionada?.id, filtros.proveedor_id, filtros.fecha_desde, filtros.fecha_hasta]);

  useEffect(() => {
    console.log("formasdepago", formasPagoTesoreria)
    loadAbonos();
  }, [loadAbonos]);

  // 🔹 Map id -> nrocomprobante
  const compById = useMemo(() => {
    const map = {};
    (comprobantes || []).forEach(c => {
      map[c.id] = c.nrocomprobante || c.id;
    });
    return map;
  }, [comprobantes]);

  // 🔹 Cargar comprobantes al inicio
  useEffect(() => {
    async function loadComprobantes() {
      try {
        const res = await fetch(`${apiUrl}/comprobantes-egreso`, { credentials: "include" });
        const data = await res.json();
        setComprobantes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("❌ Error al cargar comprobantes de egreso:", e);
      }
    }
    loadComprobantes();
  }, []);
  // 🔹 Map de Formas de Pago por id desde el contexto
  const fpById = useMemo(() => {
    const map = {};
    (formasPagoTesoreria || []).forEach(fp => {
      const id = Number(fp.id);
      if (!id) return;
      map[id] = fp;
    });
    return map;
  }, [formasPagoTesoreria]);

  const getFormaPagoDesc = (id) => {
    if (!id) return "";
    const f = fpById[Number(id)];
    if (!f) return `#${id}`;
    return f.descripcion || f.nombre || f.codigo || `#${id}`;
  };

  const handleDoubleClick = (mov) => {
    setSel(mov);
    setShowDetalle(true);
  };
  const closeDetalle = () => {
    setShowDetalle(false);
    setSel(null);
  };

  // NUEVO PAGO
  const handleNuevaOP = () => {
    if (!empresaSeleccionada?.id) return;
    setShowNuevo(true);
  };

  const totalAbonos = useMemo(
    () => abonos.reduce((acc, it) => acc + Number(it.importe || 0), 0),
    [abonos]
  );

  return (
    <Container>
      <h1 className="my-list-title dark-text">Cta Cte — Pagos a Proveedores</h1>

      {/* Barra de acciones y filtros */}
      <div className="mb-3 d-flex align-items-end" style={{ gap: 12, flexWrap: "wrap" }}>
        {/* Botón Nuevo Pago (misma lógica que antes) */}
        <Button
          className="mx-2"
          variant="success"
          disabled={!empresaSeleccionada?.id}
          onClick={handleNuevaOP}
        >
          Nuevo Pago
        </Button>

        <Form.Group>
          <Form.Label>Proveedor</Form.Label>
          <Form.Select
            name="proveedor_id"
            value={filtros.proveedor_id}
            onChange={onFiltroChange}
            style={{ minWidth: 240 }}
            className="form-control my-input"

          >
            <option value="">Todos</option>
            {proveedoresTabla.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Desde</Form.Label>
          <Form.Control
            type="date"
            name="fecha_desde"
            value={filtros.fecha_desde}
            onChange={onFiltroChange}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Hasta</Form.Label>
          <Form.Control
            type="date"
            name="fecha_hasta"
            value={filtros.fecha_hasta}
            onChange={onFiltroChange}
          />
        </Form.Group>

        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline-secondary" onClick={loadAbonos} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Aplicar"}
          </Button>
          <Button variant="outline-secondary" onClick={limpiarFiltros} disabled={loading}>
            Limpiar
          </Button>
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Importe</th>
            <th>Proveedor</th>
            <th>Empresa</th>
            <th>Comp.</th>
            <th>Forma pago</th> {/* ⬅️ nueva columna */}
            <th>O/Pago</th>
          </tr>
        </thead>
        <tbody>
          {!loading &&
            abonos.map((m) => (
              <tr
                key={m.id}
                style={{ cursor: "pointer" }}
                onDoubleClick={() => handleDoubleClick(m)}
                title="Doble click para ver detalle"
              >
                <td>{m.id}</td>
                <td>{m.fecha || ""}</td>
                <td>{fmtMoney(m.importe)}</td>
                <td>{findProveedorNombre(m.proveedor_id)}</td>
                <td>{findEmpresaNombre(m.empresa_id)}</td>
                <td>{m.comprobanteegreso_id ? compById[m.comprobanteegreso_id] || m.comprobanteegreso_id : ""}</td>

                <td>{getFormaPagoDesc(m.formapago_id)}</td> {/* ⬅️ descripción desde contexto */}
                <td>{m.ordenpago_id || ""}</td>
              </tr>
            ))}

          {loading && (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                Cargando…
              </td>
            </tr>
          )}

          {!loading && abonos.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                No hay abonos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="text-end"><strong>Total</strong></td>
            <td><strong>{fmtMoney(totalAbonos)}</strong></td>
            <td colSpan={6}></td>
          </tr>
        </tfoot>
      </Table>

      {/* ===== Modal Detalle Movimiento ===== */}
      <Modal show={showDetalle} onHide={closeDetalle} backdrop="static" centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle del abono</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {sel ? (
            <Table bordered size="sm">
              <tbody>
                <tr><th>ID</th><td>{sel.id}</td></tr>
                <tr><th>Fecha</th><td>{sel.fecha || ""}</td></tr>
                <tr><th>Fecha Pago</th><td>{sel.fecha_pago || ""}</td></tr>
                <tr><th>Importe</th><td>{fmtMoney(sel.importe)}</td></tr>
                <tr><th>Proveedor</th><td>{findProveedorNombre(sel.proveedor_id)}</td></tr>
                <tr><th>Empresa</th><td>{findEmpresaNombre(sel.empresa_id)}</td></tr>
                <tr><th>Descripción</th><td>{sel.descripcion || ""}</td></tr>
                <tr><th>Origen</th><td>{sel.origen_tipo ? `${sel.origen_tipo} #${sel.origen_id}` : ""}</td></tr>
                <tr><th>Comprobante</th><td>{sel.comprobanteegreso_id || ""}</td></tr>
                <tr><th>Forma de pago</th><td>{getFormaPagoDesc(sel.formapago_id)}</td></tr> {/* ⬅️ aquí también */}
                <tr><th>Orden de Pago</th><td>{sel.ordenpago_id || ""}</td></tr>
                <tr><th>Anulado</th><td>{sel.anulado ? "Sí" : "No"}</td></tr>
              </tbody>
            </Table>
          ) : (
            <div className="text-muted">Sin datos.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetalle}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Modal NUEVO PAGO ===== */}
      <AbonoCtaCteModal
        show={showNuevo}
        onClose={() => setShowNuevo(false)}
        onCreated={async () => {
          setShowNuevo(false);
          await loadAbonos(); // 👈 refrescar la lista de abonos luego de registrar el pago
        }}
      />
    </Container>
  );
}
