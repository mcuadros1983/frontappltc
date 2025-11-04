import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Container, Row, Col, Table, Button, Form, Spinner, Alert } from "react-bootstrap";
import AsignarTelefonoModal from "./AsignarTelefonoModel";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AsignarTelefonoManager() {
  const dataContext = useContext(Contexts.DataContext);
  const empleadosCtx = dataContext?.empleados || [];

  const [rows, setRows] = useState([]);          // teléfonos con include empleado
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // { id, empleado_id, numero, tipo?, empleado? }

  // Helpers para mostrar el nombre/DNI con la misma lógica que usás en otros módulos
  const nombreEmpleado = (inc) => {
    if (!inc) return "—";
    const ap = inc.apellido || "";
    const no = inc.nombre || "";
    const full = `${ap} ${no}`.trim();
    return full || `Empleado #${inc.id || ""}`;
  };
  const dniEmpleado = (inc) => inc?.cuil || "—"; // ajustá si tu campo DNI es otro

  const fetchTelefonos = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiUrl}/telefonos?limit=500&order=id&dir=DESC`, {
        credentials: "include",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo obtener el listado de teléfonos.");
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar los teléfonos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("empelados", dataContext.empleados)
    fetchTelefonos();
  }, [fetchTelefonos]);

  const rowsFiltradas = useMemo(() => {
    const q = filtroNombre.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((it) => {
      const ap = it?.empleado?.apellido?.toLowerCase() || "";
      const no = it?.empleado?.nombre?.toLowerCase() || "";
      const full = `${ap} ${no}`.trim();
      return ap.includes(q) || no.includes(q) || full.includes(q);
    });
  }, [rows, filtroNombre]);

  const abrirNuevo = () => {
    setEditItem(null);
    setShowModal(true);
  };

  const abrirEditar = (item) => {
    setEditItem({
      id: item.id,
      empleado_id: item.empleado_id,
      numero: item.numero,
      tipo: item.tipo || null,
    });
    setShowModal(true);
  };

  const cerrarModal = (changed = false) => {
    setShowModal(false);
    setEditItem(null);
    if (changed) fetchTelefonos();
  };

  const eliminarTelefono = async (id) => {
    const ok = window.confirm("¿Eliminar este teléfono? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      const r = await fetch(`${apiUrl}/telefonos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok || data?.ok !== true) {
        throw new Error(data?.error || "No se pudo eliminar el teléfono.");
      }
      fetchTelefonos();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-2">
        <Col>
          <h4 className="mb-0">Asignación de Teléfonos</h4>
        </Col>
        <Col md="auto" className="d-flex gap-2">
          <Button onClick={abrirNuevo}>Nueva Asignación</Button>
          <Button variant="outline-secondary" onClick={fetchTelefonos} disabled={loading} className="mx-2">
            {loading ? (<><Spinner size="sm" className="me-2" />Actualizando…</>) : "Actualizar"}
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filtrar por nombre de empleado</Form.Label>
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
              <th style={{ width: 80 }}>ID</th>
              <th style={{ width: 160 }}>DNI/CUIL</th>
              <th>Empleado</th>
              <th style={{ width: 180 }}>Teléfono</th>
              <th style={{ width: 140 }}>Tipo</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">
                  <Spinner size="sm" className="me-2" /> Cargando…
                </td>
              </tr>
            ) : rowsFiltradas.length ? (
              rowsFiltradas.map((it) => (
                <tr key={it.id} onDoubleClick={() => abrirEditar(it)} style={{ cursor: "pointer" }}>
                  <td>{it.id}</td>
                  <td>{dniEmpleado(it.empleado)}</td>
                  <td>{nombreEmpleado(it.empleado)}</td>
                  <td>{it.numero}</td>
                  <td>{it.tipo || "—"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(it)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => eliminarTelefono(it.id)} className="mx-2">
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center">Sin resultados</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {showModal && (
        <AsignarTelefonoModal
          show={showModal}
          onClose={cerrarModal}
          empleados={empleadosCtx}
          initialData={editItem} // null => crear, objeto => editar
        />
      )}
    </Container>
  );
}
