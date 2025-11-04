import { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Button, Spinner, Alert } from "react-bootstrap";
import { BsTrash, BsPencil, BsPlusLg } from "react-icons/bs";
import HorarioModal from "./HorarioTurnoModal";

const apiUrl = process.env.REACT_APP_API_URL;

const fmt = (v) => (v ? v : "—");

export default function HorarioManager() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // { id, inicio_am, fin_am, inicio_pm, fin_pm }

  const fetchHorarios = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiUrl}/horarioturno?limit=1000`, { credentials: "include" });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo obtener el listado de horarios.");
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setRows(items);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar los horarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHorarios(); }, [fetchHorarios]);

  const abrirNuevo = () => {
    setEditItem(null);
    setShowModal(true);
  };

  const abrirEditar = (row) => {
    setEditItem({
      id: row.id,
      inicio_am: row.inicio_am || "",
      fin_am: row.fin_am || "",
      inicio_pm: row.inicio_pm || "",
      fin_pm: row.fin_pm || "",
    });
    setShowModal(true);
  };

  const cerrarModal = (changed = false) => {
    setShowModal(false);
    setEditItem(null);
    if (changed) fetchHorarios();
  };

  const eliminarHorario = async (id) => {
    const ok = window.confirm("¿Eliminar este horario? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      const r = await fetch(`${apiUrl}/horarioturno/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo eliminar el horario.");
      fetchHorarios();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  const viewRows = useMemo(() => rows ?? [], [rows]);

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-2">
        <Col><h4 className="mb-0">Horarios de Turno</h4></Col>
        <Col md="auto" className="d-flex gap-2">
          <Button onClick={abrirNuevo}><BsPlusLg className="me-2" />Nuevo</Button>
          <Button variant="outline-secondary" onClick={fetchHorarios} disabled={loading}>
            {loading ? (<><Spinner size="sm" className="me-2" />Actualizando…</>) : "Actualizar"}
          </Button>
        </Col>
      </Row>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="table-responsive">
        <Table bordered hover striped size="sm">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th style={{ width: 160 }}>AM Inicio</th>
              <th style={{ width: 160 }}>AM Fin</th>
              <th style={{ width: 160 }}>PM Inicio</th>
              <th style={{ width: 160 }}>PM Fin</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center"><Spinner size="sm" className="me-2" /> Cargando…</td></tr>
            ) : viewRows.length ? (
              viewRows.map((it) => (
                <tr key={it.id} onDoubleClick={() => abrirEditar(it)} style={{ cursor: "pointer" }}>
                  <td>{it.id}</td>
                  <td>{fmt(it.inicio_am)}</td>
                  <td>{fmt(it.fin_am)}</td>
                  <td>{fmt(it.inicio_pm)}</td>
                  <td>{fmt(it.fin_pm)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(it)}>
                        <BsPencil /> Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" className="mx-2" onClick={() => eliminarHorario(it.id)}>
                        <BsTrash /> Eliminar
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
        <HorarioModal
          show={showModal}
          onClose={cerrarModal}
          initialData={editItem} // null => crear, objeto => editar
        />
      )}
    </Container>
  );
}
