// src/pages/tesoreria/ImputacionContableList.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Table,
  Container,
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

export default function ImputacionContableList() {
  const { imputacionContableTabla = [], setImputacionContableTabla } =
    useContext(Contexts.DataContext) || {};

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loadingTabla, setLoadingTabla] = useState(false);

  // Modal (crear/editar)
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form
  const [descripcion, setDescripcion] = useState("");
  const [formError, setFormError] = useState("");
  const [formMsg, setFormMsg] = useState(null);

  // ===== Fetch inicial si el contexto está vacío =====
  const fetchImputaciones = async () => {
    try {
      setLoadingTabla(true);
      setError("");
      const res = await fetch(`${apiUrl}/imputaciones-contables`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof setImputacionContableTabla === "function") {
        const ordenadas = (Array.isArray(data) ? data : []).slice().sort((a, b) => a.id - b.id);
        setImputacionContableTabla(ordenadas);
      }
    } catch {
      setError("Error al cargar imputaciones");
    } finally {
      setLoadingTabla(false);
    }
  };

  useEffect(() => {
    if (!imputacionContableTabla?.length) fetchImputaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ===== Fuente + filtro =====
  const source = Array.isArray(imputacionContableTabla) ? imputacionContableTabla : [];
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return source;
    return source.filter((i) => (i.descripcion || "").toLowerCase().includes(q));
  }, [source, busqueda]);

  // ===== Modal helpers =====
  const resetForm = () => {
    setDescripcion("");
    setFormError("");
    setFormMsg(null);
  };

  const openModalNew = () => {
    setEditing(false);
    setEditId(null);
    resetForm();
    setShowModal(true);
  };

  const openModalEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setDescripcion(item.descripcion || "");
    setFormError("");
    setFormMsg(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  // ===== Validación =====
  const validar = () => {
    if (!descripcion.trim()) return "La descripción es obligatoria";
    return null;
  };

  // ===== Guardar (POST/PUT) + update optimista + refetch =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormMsg(null);

    const err = validar();
    if (err) return setFormError(err);

    try {
      setSaving(true);
      const payload = { descripcion: descripcion.trim() };
      const url = editing
        ? `${apiUrl}/imputaciones-contables/${editId}`
        : `${apiUrl}/imputaciones-contables`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      if (!res.ok) {
        let msg = "No se pudo guardar";
        try { msg = JSON.parse(raw)?.error || msg; } catch {}
        throw new Error(msg);
      }

      let saved = null;
      if (raw) { try { saved = JSON.parse(raw); } catch {} }

      const finalItem = saved || { id: editing ? editId : undefined, ...payload };

      // Update optimista
      if (typeof setImputacionContableTabla === "function") {
        setImputacionContableTabla((prev = []) => {
          const arr = Array.isArray(prev) ? [...prev] : [];
          if (editing) {
            const i = arr.findIndex((x) => Number(x.id) === Number(editId));
            if (i >= 0) arr[i] = { ...arr[i], ...finalItem };
          } else {
            const tempId = finalItem.id ?? Date.now();
            arr.push({ ...finalItem, id: tempId });
          }
          arr.sort((a, b) => a.id - b.id);
          return arr;
        });
      }

      setFormMsg({ type: "success", text: editing ? "Imputación actualizada" : "Imputación creada" });
      await fetchImputaciones(); // normaliza ids/estado
      closeModal();
    } catch (err2) {
      setFormError(err2.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ===== Eliminar =====
  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseás eliminar esta imputación?")) return;
    try {
      const res = await fetch(`${apiUrl}/imputaciones-contables/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      if (typeof setImputacionContableTabla === "function") {
        setImputacionContableTabla((prev = []) => prev.filter((i) => Number(i.id) !== Number(id)));
      }
    } catch {
      setError("No se pudo eliminar");
    }
  };

  return (
    <Container className="mt-4">
      {/* Header / acciones */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <h3 className="m-0">Imputaciones Contables</h3>
          <Badge bg="secondary" className="align-middle">{source.length}</Badge>
        </div>

        <div className="d-flex gap-2">
          <InputGroup>
            <InputGroup.Text className="d-none d-md-flex">Buscar</InputGroup.Text>
            <Form.Control
              placeholder="Descripción…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={openModalNew} className="mx-2">
            Nueva
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Table striped bordered hover responsive="md">
        <thead>
          <tr>
            <th style={{ width: 80 }}>#</th>
            <th>Descripción</th>
            <th style={{ width: 220 }}>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {loadingTabla ? (
            <tr>
              <td colSpan={3} className="text-center">
                <Spinner animation="border" size="sm" className="me-2" /> Cargando…
              </td>
            </tr>
          ) : (
            <>
              {filtradas.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.descripcion}</td>
                  <td className="text-nowrap">
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => openModalEdit(item)}
                        className="mx-2"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && !loadingTabla && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">Sin resultados</td>
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
              {editing ? "Editar Imputación" : "Nueva Imputación"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Card className="border-0">
              <Card.Body className="pt-2">
                {formMsg && <Alert variant={formMsg.type} className="py-2">{formMsg.text}</Alert>}
                {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}

                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      disabled={saving}
                      required
                      placeholder="Ej: Ingresos Brutos, Caja, Banco…"
                      className="my-input"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
            <div className="text-muted small">
              {editing ? `Editando ID #${editId}` : "Creación de nueva imputación"}
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
    </Container>
  );
}
