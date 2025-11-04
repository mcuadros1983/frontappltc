// HuellaNavegadorManager.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table, Button, Spinner, Alert, Form } from "react-bootstrap";
import { BsTrash, BsPencil, BsPlusLg } from "react-icons/bs";
import HuellaNavegadorModal from "./HuellaNavegadorModal";

const apiUrl = process.env.REACT_APP_API_URL;

const fmtDateTime = (v) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleString(); } catch { return v; }
};

export default function HuellaNavegadorManager() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // { id?, ip_address?, fingerprint?, sucursal_id? }

  // 🔹 Sucursales
  const [sucs, setSucs] = useState([]);
  const [sucsErr, setSucsErr] = useState(null);
  const sucsMap = useMemo(() => {
    const m = new Map();
    for (const s of sucs) m.set(Number(s.id), s.nombre || s.codigo || `#${s.id}`);
    return m;
  }, [sucs]);

  const fetchHuellas = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiUrl}/huellanavegador?limit=1000`, { credentials: "include" });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo obtener el listado de huellas.");
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setRows(items);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar las huellas.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSucursales = useCallback(async () => {
    try {
      setSucsErr(null);
      const r = await fetch(`${apiUrl}/sucursales?limit=1000`, { credentials: "include" });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo obtener el catálogo de sucursales.");
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setSucs(items);
    } catch (e) {
      console.error(e);
      setSucsErr(e.message || "Error al cargar sucursales.");
    }
  }, []);

  useEffect(() => { fetchSucursales(); }, [fetchSucursales]);
  useEffect(() => { fetchHuellas(); }, [fetchHuellas]);

  const rowsFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows ?? [];
    return (rows ?? []).filter((it) => {
      const ip = (it.ip_address || "").toLowerCase();
      const fp = (it.fingerprint || "").toLowerCase();
      const sucName = (sucsMap.get(Number(it.sucursal_id)) || "").toLowerCase();
      const sucId = String(it.sucursal_id ?? "").toLowerCase();
      return ip.includes(q) || fp.includes(q) || sucName.includes(q) || sucId.includes(q);
    });
  }, [rows, query, sucsMap]);

  const abrirNuevo = () => {
    setEditItem(null);      // modal en modo "crear"
    setShowModal(true);
  };

  const abrirEditar = (row) => {
    setEditItem({
      id: row.id,
      ip_address: row.ip_address || "",
      fingerprint: row.fingerprint || "",
      sucursal_id: row.sucursal_id ?? null,
      accessed_at: row.accessed_at || null,
    });
    setShowModal(true);
  };

  const cerrarModal = (changed = false) => {
    setShowModal(false);
    setEditItem(null);
    if (changed) fetchHuellas();
  };

  const eliminarHuella = async (id) => {
    const ok = window.confirm("¿Eliminar este registro de huella de dispositivo? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      const r = await fetch(`${apiUrl}/huellanavegador/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo eliminar la huella.");
      fetchHuellas();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-2">
        <Col><h4 className="mb-0">Huellas de Dispositivo</h4></Col>
        <Col md="auto" className="d-flex gap-2">
          <Button onClick={abrirNuevo}><BsPlusLg className="me-2" />Nuevo</Button>
          <Button variant="outline-secondary" onClick={fetchHuellas} disabled={loading}>
            {loading ? (<><Spinner size="sm" className="me-2" />Actualizando…</>) : "Actualizar"}
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Form.Label>Buscar (IP / Fingerprint / Sucursal)</Form.Label>
          <Form.Control
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: 200.49.*, 9c3f..., Centro…"
          />
        </Col>
        <Col md="auto" className="d-flex align-items-end">
          {sucsErr && <Alert variant="warning" className="py-1 px-2 mb-0">Sucursales: {sucsErr}</Alert>}
        </Col>
      </Row>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="table-responsive">
        <Table bordered hover striped size="sm">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th style={{ width: 220 }}>IP</th>
              <th>Sucursal</th>
              <th>Fingerprint</th>
              <th style={{ width: 220 }}>Accedido</th>
              <th style={{ width: 180 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center"><Spinner size="sm" className="me-2" /> Cargando…</td></tr>
            ) : rowsFiltradas.length ? (
              rowsFiltradas.map((it) => (
                <tr key={it.id} onDoubleClick={() => abrirEditar(it)} style={{ cursor: "pointer" }}>
                  <td>{it.id}</td>
                  <td>{it.ip_address || "—"}</td>
                  <td>{sucsMap.get(Number(it.sucursal_id)) || (it.sucursal_id ? `#${it.sucursal_id}` : "—")}</td>
                  <td className="text-truncate" style={{ maxWidth: 420 }}>{it.fingerprint || "—"}</td>
                  <td>{fmtDateTime(it.accessed_at)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(it)}>
                        <BsPencil /> Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" className="mx-2" onClick={() => eliminarHuella(it.id)}>
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
        <HuellaNavegadorModal
          show={showModal}
          onClose={cerrarModal}
          initialData={editItem}    // null => crear; objeto => editar
          sucursales={sucs}         // catálogo para seleccionar sucursal
        />
      )}
    </Container>
  );
}
