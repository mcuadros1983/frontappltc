import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Container, Row, Col, Table, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import DatosEmpleadoModal from "./AsignarDatosEmpleadoModal";

const apiUrl = process.env.REACT_APP_API_URL;

const DIAS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const diaLabel = (n) => (n >= 1 && n <= 7 ? DIAS[n] : "—");

export default function DatosEmpleadoManager() {
  const dataContext = useContext(Contexts.DataContext);

  // Fuentes maestras desde el contexto (caen en muchos módulos de tu app)
  const empleadosCtx = dataContext?.empleados || [];      // lista de empleados
  const sucursalesCtx = dataContext?.sucursales || [];    // lista de sucursales

  const [rows, setRows] = useState([]);         // registros de datosempleado
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // { empleado_id, telefono, sucursal_id, franco_am, franco_pm }

  const findEmpleado = useCallback((id) => {
    const eid = Number(id);
    return empleadosCtx.find((e) => Number(e?.empleado?.id ?? e?.id) === eid) || null;
  }, [empleadosCtx]);

  const findSucursal = useCallback((id) => {
    if (id == null) return null;
    const sid = Number(id);
    return sucursalesCtx.find((s) => Number(s?.id) === sid) || null;
  }, [sucursalesCtx]);

  const nombreEmpleado = (item) => {
    const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || item?.apellido || "";
    const no = item?.clientePersona?.nombre || item?.empleado?.nombre || item?.nombre || "";
    const full = `${ap} ${no}`.trim();
    return full || `Empleado #${item?.empleado?.id ?? item?.id ?? ""}`;
  };
  const dniEmpleado = (item) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("[dniEmpleado] item:", item.empleado.numero);
  }
  return  item?.empleado.numero || "—";
};

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // listado básico con paginación “grande” (ajustable)
      const r = await fetch(`${apiUrl}/datosempleado?limit=1000`, { credentials: "include" });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo obtener el listado.");
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setRows(items);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);

  // Enriquecemos cada row con info de contexto (empleado/sucursal) para mostrar
  const viewRows = useMemo(() => {
    return (rows || []).map((r) => {
      const empleado = findEmpleado(r.empleado_id);
      const sucursal = findSucursal(r.sucursal_id);
      return { ...r, _empleado: empleado, _sucursal: sucursal };
    });
  }, [rows, findEmpleado, findSucursal]);

  const rowsFiltradas = useMemo(() => {
    const q = filtroNombre.trim().toLowerCase();
    if (!q) return viewRows;
    return viewRows.filter((it) => {
      const e = it._empleado;
      const ap = (e?.clientePersona?.apellido || e?.empleado?.apellido || e?.apellido || "").toLowerCase();
      const no = (e?.clientePersona?.nombre || e?.empleado?.nombre || e?.nombre || "").toLowerCase();
      const full = `${ap} ${no}`.trim();
      return ap.includes(q) || no.includes(q) || full.includes(q);
    });
  }, [viewRows, filtroNombre]);

  const abrirNuevo = () => {
    setEditItem(null);
    setShowModal(true);
  };
  const abrirEditar = (row) => {
    setEditItem({
      empleado_id: row.empleado_id,
      telefono: row.telefono ?? "",
      sucursal_id: row.sucursal_id ?? null,
      franco_am: row.franco_am ?? null,
      franco_pm: row.franco_pm ?? null,
    });
    setShowModal(true);
  };
  const cerrarModal = (changed = false) => {
    setShowModal(false);
    setEditItem(null);
    if (changed) fetchDatos();
  };

  const eliminar = async (empleado_id) => {
    const ok = window.confirm("¿Eliminar los datos de este empleado? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      const r = await fetch(`${apiUrl}/empleados/${empleado_id}/datos`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo eliminar.");
      fetchDatos();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-2">
        <Col><h4 className="mb-0">Datos del Empleado</h4></Col>
        <Col md="auto" className="d-flex gap-2">
          <Button onClick={abrirNuevo}>Nuevo</Button>
          <Button variant="outline-secondary" onClick={fetchDatos} disabled={loading} className="mx-2">
            {loading ? (<><Spinner size="sm" className="me-2" />Actualizando…</>) : "Actualizar"}
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filtrar por nombre</Form.Label>
            <Form.Control
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              placeholder="Ej: García"
            />
          </Form.Group>
        </Col>
      </Row>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="table-responsive">
        <Table bordered hover striped size="sm">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Empleado ID</th>
              <th style={{ width: 160 }}>DNI/CUIL</th>
              <th>Empleado</th>
              <th style={{ width: 180 }}>Teléfono</th>
              <th style={{ width: 200 }}>Sucursal</th>
              <th style={{ width: 140 }}>Franco AM</th>
              <th style={{ width: 140 }}>Franco PM</th>
              <th style={{ width: 180 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center"><Spinner size="sm" className="me-2" /> Cargando…</td></tr>
            ) : rowsFiltradas.length ? (
              rowsFiltradas.map((it) => {
                console.log("it", it)
                const e = it._empleado;
                const s = it._sucursal;
                return (
                  <tr key={it.empleado_id} onDoubleClick={() => abrirEditar(it)} style={{ cursor: "pointer" }}>
                    <td>{it.empleado_id}</td>
                    <td>{dniEmpleado(e)}</td>
                    <td>{nombreEmpleado(e)}</td>
                    <td>{it.telefono || "—"}</td>
                    <td>{s?.nombre || s?.descripcion || s?.denominacion || "—"}</td>
                    <td>
                      {it.franco_am ? <Badge bg="secondary">{diaLabel(it.franco_am)}</Badge> : "—"}
                    </td>
                    <td>
                      {it.franco_pm ? <Badge bg="secondary">{diaLabel(it.franco_pm)}</Badge> : "—"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(it)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" className="mx-2"
                                onClick={() => eliminar(it.empleado_id)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={8} className="text-center">Sin resultados</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {showModal && (
        <DatosEmpleadoModal
          show={showModal}
          onClose={cerrarModal}
          empleados={empleadosCtx}
          sucursales={sucursalesCtx}
          initialData={editItem} // null => crear, objeto => editar
        />
      )}
    </Container>
  );
}
