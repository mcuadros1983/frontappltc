import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { BsTrash, BsPencil, BsPlusLg } from "react-icons/bs";
import ConceptoModal from "./ConceptoModal";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ConceptoManager() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // { id?, nombre, codigo }

  const fetchConceptos = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiUrl}/conceptos?limit=1000&order=id&dir=DESC`, { credentials: "include" });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo obtener el listado de conceptos.");
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setRows(items);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar los conceptos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConceptos(); }, [fetchConceptos]);

  const rowsFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows ?? [];
    return (rows ?? []).filter((it) => {
      const nom = (it?.nombre || "").toLowerCase();
      const cod = (it?.codigo || "").toLowerCase();
      return nom.includes(q) || cod.includes(q);
    });
  }, [rows, query]);

  const abrirNuevo = () => { setEditItem(null); setShowModal(true); };
  const abrirEditar = (row) => {
    setEditItem({ id: row.id, nombre: row.nombre || "", codigo: row.codigo || "" });
    setShowModal(true);
  };
  const cerrarModal = (changed = false) => {
    setShowModal(false);
    setEditItem(null);
    if (changed) fetchConceptos();
  };

  const eliminarConcepto = async (id) => {
    const ok = window.confirm("¿Eliminar este concepto? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      const r = await fetch(`${apiUrl}/conceptos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new Error(data?.error || "No se pudo eliminar el concepto.");
      fetchConceptos();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al eliminar.");
    }
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-2">
        <Col><h4 className="mb-0">Conceptos</h4></Col>
        <Col md="auto" className="d-flex gap-2">
          <Button onClick={abrirNuevo}><BsPlusLg className="me-2" />Nuevo</Button>
          <Button variant="outline-secondary" onClick={fetchConceptos} disabled={loading}>
            {loading ? (<><Spinner size="sm" className="me-2" />Actualizando…</>) : "Actualizar"}
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Form.Label>Buscar por nombre o código</Form.Label>
          <Form.Control
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: Feriado / VAC-2025"
          />
        </Col>
      </Row>

      {err && <Alert variant="danger">{err}</Alert>}

      <div className="table-responsive">
        <Table bordered hover striped size="sm">
          <thead>
            <tr>
              <th style={{ width: 90 }}>ID</th>
              <th>Nombre</th>
              <th style={{ width: 220 }}>Código</th>
              <th style={{ width: 200 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center"><Spinner size="sm" className="me-2" /> Cargando…</td></tr>
            ) : rowsFiltradas.length ? (
              rowsFiltradas.map((it) => (
                <tr key={it.id} onDoubleClick={() => abrirEditar(it)} style={{ cursor: "pointer" }}>
                  <td>{it.id}</td>
                  <td>{it.nombre}</td>
                  <td className="text-monospace">{it.codigo}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(it)}>
                        <BsPencil /> Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" className="mx-2" onClick={() => eliminarConcepto(it.id)}>
                        <BsTrash /> Eliminar
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

      {showModal && (
        <ConceptoModal
          show={showModal}
          onClose={cerrarModal}
          initialData={editItem}
        />
      )}
    </Container>
  );
}
