import { useState, useEffect, useContext, useMemo } from "react";
import { Table, Container, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import NuevoAdelantoSueldos from "./nuevoAdelantoSueldos";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdelantoSueldosTesoreria() {
  const data = useContext(Contexts.DataContext) || {};
  const { empleados = [], formasPagoTesoreria = [] } = data;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [empleadoFiltro, setEmpleadoFiltro] = useState("");

  const [showNuevo, setShowNuevo] = useState(false);

  const [deletingId, setDeletingId] = useState(null); // ⬅️ NUEVO


  // Aplana empleados (id = empleado.id; label = "Apellido, Nombre")
  const listaEmpleados = useMemo(() => {
    return (empleados || [])
      .map((row) => {
        const e = row?.empleado || row;
        const p = row?.clientePersona || null;
        const id = e?.id ?? row?.id ?? null;
        if (!id) return null;
        const apellido = e?.apellido ?? p?.apellido ?? "";
        const nombre = e?.nombre ?? p?.nombre ?? "";
        const label =
          [apellido, nombre].filter(Boolean).join(", ") ||
          e?.razonSocial ||
          `Empleado #${id}`;
        return { id, label };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [empleados]);

  const empLabelById = useMemo(() => {
    const m = new Map();
    listaEmpleados.forEach((e) => m.set(Number(e.id), e.label));
    return m;
  }, [listaEmpleados]);

  const formaById = useMemo(() => {
    const m = new Map();
    (formasPagoTesoreria || []).forEach((f) => m.set(Number(f.id), f.descripcion || `FP #${f.id}`));
    return m;
  }, [formasPagoTesoreria]);

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const load = async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      if (fechaDesde) qs.set("fecha_desde", fechaDesde);
      if (fechaHasta) qs.set("fecha_hasta", fechaHasta);
      if (empleadoFiltro) qs.set("empleado_id", empleadoFiltro);
      const res = await fetch(`${apiUrl}/adelantosempleado?${qs.toString()}`, { credentials: "include" });
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error("❌ cargar adelantos sueldo:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // inicial

  const eliminarAdelanto = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm(
      `¿Eliminar el adelanto #${row.id} por ${fmtMoney(row.monto)}?\n` +
      `Se eliminarán también los movimientos de caja/banco vinculados.\n\n¿Confirmás?`
    );
    if (!ok) return;

    try {
      setDeletingId(row.id);
      const res = await fetch(`${apiUrl}/adelantosempleado/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "No se pudo eliminar el adelanto");
      }
      await load(); // recargar la lista
    } catch (e) {
      console.error("❌ eliminarAdelanto:", e);
      alert(e.message || "Error al eliminar el adelanto");
    } finally {
      setDeletingId(null);
    }
  };



  const total = useMemo(() => items.reduce((a, b) => a + Number(b.monto || 0), 0), [items]);

  return (
    <Container>
      <h1 className="my-list-title dark-text">Adelantos de Sueldos</h1>

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
          <Col md={4}>
            <Form.Label>Empleado</Form.Label>
            <Form.Select
              value={empleadoFiltro}
              onChange={(e) => setEmpleadoFiltro(e.target.value)}
              className="form-control my-input"
            >
              <option value="">Todos</option>
              {listaEmpleados.map((e) => (
                <option key={e.id} value={e.id}>{e.label}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md="auto" className="d-flex align-items-end">
            <Button className="mx-1 my-2" variant="outline-secondary" onClick={load} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Aplicar filtro"}
            </Button>
            <Button className="mx-1 my-2" variant="success" onClick={() => setShowNuevo(true)}>
              Nuevo Adelanto
            </Button>
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Empleado</th>
            <th>Observaciones</th>
            <th>Forma de pago</th>
            <th className="text-end">Monto</th>
            <th>Acciones</th> {/* ⬅️ NUEVO */}

          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={7} className="text-center text-muted">Cargando…</td></tr>
          )}
          {!loading && items.map((p) => {
            const nom = empLabelById.get(Number(p.empleado_id)) || `Empleado #${p.empleado_id}`;
            const fpDesc = formaById.get(Number(p.formapago_id)) || (p.formapago_id ? `FP #${p.formapago_id}` : "");
            return (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.fecha}</td>
                <td>{nom}</td>
                <td>{p.observaciones || ""}</td>
                <td>{fpDesc}</td>
                <td className="text-end">{fmtMoney(p.monto)}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarAdelanto(p)}
                    disabled={deletingId === p.id || loading}
                  >
                    {deletingId === p.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </td>

              </tr>
            );
          })}
          {!loading && items.length === 0 && (
            <tr><td colSpan={7} className="text-center text-muted">Sin adelantos para mostrar.</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} className="text-end"><strong>Total</strong></td>
            <td className="text-end"><strong>{fmtMoney(total)}</strong></td>
          </tr>
        </tfoot>
      </Table>

      <NuevoAdelantoSueldos
        show={showNuevo}
        onHide={() => setShowNuevo(false)}
        onCreated={() => { setShowNuevo(false); load(); }}
      />
    </Container>
  );
}
