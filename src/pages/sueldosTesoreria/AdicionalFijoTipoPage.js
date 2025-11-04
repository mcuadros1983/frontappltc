import { useEffect, useState, useContext, useCallback } from "react";
import { Table, Button, Container, Row, Col, Form, Spinner } from "react-bootstrap";
import AdicionalFijoTipoModal from "./AdicionalFijoTipoModal";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdicionalFijoTipoPage() {
  const dataContext = useContext(Contexts.DataContext);
  const empresa_id = dataContext?.empresaSeleccionada?.id ?? null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null => crear, objeto => editar
  const [error, setError] = useState(null);

  const fetchTipos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(`${apiUrl}/adicionalfijotipo`, { credentials: "include" });
      const data = await resp.json();
      // filtro simple por búsqueda local (descripcion)
      const filtered = q
        ? data.filter((x) =>
            (x.descripcion || "").toLowerCase().includes(q.toLowerCase())
          )
        : data;
      // si querés filtrar por empresa_id (si viene en el modelo):
      const byEmpresa = empresa_id
        ? filtered.filter((x) => !x.empresa_id || x.empresa_id === empresa_id)
        : filtered;

      setItems(byEmpresa);
    } catch (e) {
      setError("No se pudo cargar la lista.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, q, empresa_id]);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  const handleCrear = () => {
    setEditItem(null);
    setShowModal(true);
  };

  const handleEditar = (it) => {
    setEditItem(it);
    setShowModal(true);
  };

  const handleEliminar = async (it) => {
    if (!window.confirm(`¿Eliminar el adicional fijo "${it.descripcion}"?`)) return;
    try {
      setLoading(true);
      await fetch(`${apiUrl}/adicionalfijotipo/${it.id}`, { method: "DELETE", credentials: "include" });
      await fetchTipos();
    } catch (e) {
      setError("No se pudo eliminar.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = (didChange) => {
    setShowModal(false);
    setEditItem(null);
    if (didChange) fetchTipos();
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="mb-0">Adicionales Fijos — Tipos</h4>
        </Col>
        <Col md="auto">
          <Button onClick={handleCrear}>Crear nuevo adicional</Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="Buscar por descripción..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Col>
      </Row>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Descripción</th>
  
              <th style={{ width: 200 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Cargando...
                </td>
              </tr>
            ) : items.length ? (
              items.map((it) => (
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.descripcion || "-"}</td>
  
                  <td>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEditar(it)}>
                        Editar
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleEliminar(it)} className="mx-2">
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {showModal && (
        <AdicionalFijoTipoModal
          show={showModal}
          onClose={handleCloseModal}
          editItem={editItem}
          empresa_id={empresa_id}
        />
      )}
    </Container>
  );
}
