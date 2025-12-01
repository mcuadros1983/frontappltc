import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  Table,
  Button,
  Form,
  Alert,
  Modal,
  Card,
  Spinner,
  Row,
  Col,
  Badge,
  InputGroup,
} from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

const CategoriaIngresoList = () => {
  const {
    categoriasIngreso = [],
    setCategoriasIngreso,
  } = useContext(Contexts.DataContext) || {};

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loadingTabla, setLoadingTabla] = useState(false);

  // Modal (crear/editar)
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [nombre, setNombre] = useState("");
  const [formError, setFormError] = useState("");
  const [formMsg, setFormMsg] = useState(null);

  // ---- Fetch inicial si el contexto está vacío ----
  const fetchCategorias = async () => {
    try {
      setLoadingTabla(true);
      setError("");
      const res = await fetch(`${apiUrl}/categorias-ingreso`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof setCategoriasIngreso === "function") {
        setCategoriasIngreso(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Error al cargar categorías");
    } finally {
      setLoadingTabla(false);
    }
  };

  useEffect(() => {
    if (!categoriasIngreso?.length) fetchCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ---- Filtro ----
  const source = Array.isArray(categoriasIngreso) ? categoriasIngreso : [];
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return source;
    return source.filter((c) => (c.nombre || "").toLowerCase().includes(q));
  }, [source, busqueda]);

  // ---- Modal helpers ----
  const openModalNew = () => {
    setFormError("");
    setFormMsg(null);
    setEditing(false);
    setEditId(null);
    setNombre("");
    setShowModal(true);
  };

  const openModalEdit = (cat) => {
    setFormError("");
    setFormMsg(null);
    setEditing(true);
    setEditId(cat.id);
    setNombre(cat.nombre || "");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  // ---- Guardar (POST/PUT) + update optimista + refetch ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormMsg(null);

    if (!nombre.trim()) return setFormError("El nombre es requerido.");

    try {
      setSaving(true);
      const payload = { nombre: nombre.trim() };

      const url = editing
        ? `${apiUrl}/categorias-ingreso/${editId}`
        : `${apiUrl}/categorias-ingreso`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      if (!res.ok) {
        let msg = "Error al guardar";
        try {
          msg = JSON.parse(raw)?.error || msg;
        } catch { }
        throw new Error(msg);
      }

      let saved = null;
      if (raw) {
        try {
          saved = JSON.parse(raw);
        } catch {
          saved = null;
        }
      }

      const finalItem = saved || {
        id: editing ? editId : undefined,
        ...payload,
      };

      if (typeof setCategoriasIngreso === "function") {
        setCategoriasIngreso((prev = []) => {
          const arr = Array.isArray(prev) ? [...prev] : [];
          if (editing) {
            const idx = arr.findIndex(
              (c) => Number(c.id) === Number(finalItem.id ?? editId)
            );
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...finalItem };
            }
          } else {
            const tempId = finalItem.id ?? Date.now();
            arr.push({ ...finalItem, id: tempId });
          }
          return arr.sort((a, b) => Number(a.id) - Number(b.id));
        });
      }

      setFormMsg({
        type: "success",
        text: editing ? "Categoría actualizada" : "Categoría creada",
      });

      // Normalizar contra backend (ids reales, etc.)
      await fetchCategorias();

      closeModal();
    } catch (err) {
      setFormError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ---- Eliminar + actualizar CONTEXTO ----
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try {
      setError("");
      const res = await fetch(`${apiUrl}/categorias-ingreso/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      if (typeof setCategoriasIngreso === "function") {
        setCategoriasIngreso((prev = []) => prev.filter((c) => Number(c.id) !== Number(id)));
      }
    } catch {
      setError("No se pudo eliminar");
    }
  };

  return (
    <div className="container mt-4">
      {/* Header / acciones */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <h3 className="m-0">Categorías de Ingreso</h3>
          <Badge bg="secondary" className="align-middle">
            {source.length}
          </Badge>
        </div>

        <div className="d-flex gap-2">
          <InputGroup>
            <InputGroup.Text className="d-none d-md-flex">Buscar</InputGroup.Text>
            <Form.Control
              placeholder="Nombre…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={openModalNew} className="mx-2">
            Nueva
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="py-2">
          {error}
        </Alert>
      )}

      <Table striped bordered hover responsive="md">
        <thead>
          <tr>
            <th style={{ width: 80 }}>#</th>
            <th>Nombre</th>
            <th style={{ width: 220 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loadingTabla ? (
            <tr>
              <td colSpan={3} className="text-center">
                <Spinner animation="border" size="sm" className="me-2" />
                Cargando…
              </td>
            </tr>
          ) : (
            <>
              {filtradas.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.nombre}</td>
                  <td className="text-nowrap">
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => openModalEdit(cat)}
                        className="mx-2"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && !loadingTabla && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    Sin resultados
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </Table>

      {/* Modal Crear/Editar */}
      <Modal
        show={showModal}
        onHide={closeModal}
        backdrop={saving ? "static" : true}
        centered
        size="md"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton={!saving}>
            <Modal.Title className="fw-semibold">
              {editing ? "Editar" : "Nueva"} Categoría de Ingreso
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Card className="border-0">
              <Card.Body className="pt-2">
                {formMsg && (
                  <Alert variant={formMsg.type} className="py-2">
                    {formMsg.text}
                  </Alert>
                )}
                {formError && (
                  <Alert variant="danger" className="py-2">
                    {formError}
                  </Alert>
                )}

                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={saving}
                      required
                    />
                    <Form.Text className="text-muted">
                      Nombre visible de la categoría de ingreso.
                    </Form.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
            <div className="text-muted small">
              {editing ? `Editando ID #${editId}` : "Creación de nueva categoría"}
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={closeModal} disabled={saving} className="mx-2">
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" /> Guardando…
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriaIngresoList;
