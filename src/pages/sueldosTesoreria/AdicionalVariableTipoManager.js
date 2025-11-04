import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Form, Spinner } from "react-bootstrap";
import AdicionalVariableTipoCreateModal from "./AdicionalVariableTipoCreateModal";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdicionalVariableTipoManager() { 
  const [tipos, setTipos] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null); // para edición

  const fetchTipos = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiUrl}/adicionalvariabletipo`, { credentials: "include" });
      const data = await r.json();
      const filtered = (data || []).filter((x) =>
        (x.descripcion || "").toLowerCase().includes(q.toLowerCase())
      );
      // último primero
      const sorted = filtered.sort((a, b) => {
        const ca = a.createdAt ? new Date(a.createdAt).getTime() : null;
        const cb = b.createdAt ? new Date(b.createdAt).getTime() : null;
        if (ca && cb) return cb - ca;
        if (ca && !cb) return -1;
        if (!ca && cb) return 1;
        return Number(b.id) - Number(a.id);
      });
      setTipos(sorted);
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar la lista.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, q]);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  const openCreate = () => {
    setEditItem(null);
    setShowCreate(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setShowCreate(true);
  };

  const closeCreate = (changed) => {
    setShowCreate(false);
    setEditItem(null);
    if (changed) fetchTipos();
  };

  const eliminar = async (item) => {
    if (!window.confirm(`¿Eliminar el tipo "${item.descripcion}"?`)) return;
    try {
      setLoading(true);
      const r = await fetch(`${apiUrl}/adicionalvariabletipo/${item.id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) {
        const x = await r.json().catch(() => ({}));
        throw new Error(x?.error || "No se pudo eliminar.");
      }
      await fetchTipos();
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo eliminar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="mb-0">Items Variables — Tipos</h4></Col>
        <Col md="auto">
          <Button onClick={openCreate}>Crear tipo</Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="Buscar por descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Col>
      </Row>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      <div className="table-responsive">
        <Table bordered hover striped size="sm">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Descripción</th>
              <th style={{ width: 160 }}>Categoría</th>
              <th style={{ width: 200 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  <Spinner size="sm" className="me-2" />
                  Cargando…
                </td>
              </tr>
            ) : tipos.length ? (
              tipos.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.descripcion}</td>
                  <td>{t.categoria ? t.categoria : <span className="text-muted">—</span>}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(t)} >
                        Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => eliminar(t)} className="mx-2">
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="text-center">Sin resultados</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {showCreate && (
        <AdicionalVariableTipoCreateModal
          show={showCreate}
          onClose={closeCreate}
          editItem={editItem}
        />
      )}
    </Container>
  );
}
