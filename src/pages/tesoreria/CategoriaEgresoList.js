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
  InputGroup
} from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

const CategoriaEgresoList = () => {
  const {
    imputacionContableTabla = [],
    categoriasEgreso = [],
    setCategoriasEgreso,
  } = useContext(Contexts.DataContext) || {};

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loadingTabla, setLoadingTabla] = useState(false);

  // Modal (crear/editar reutilizando el mismo formulario)
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [nombre, setNombre] = useState("");
  const [imputacionContableId, setImputacionContableId] = useState("");
  const [formError, setFormError] = useState("");
  const [formMsg, setFormMsg] = useState(null);

  // Mapa id → descripcion
  const imputacionMap = useMemo(() => {
    const m = new Map();
    for (const imp of imputacionContableTabla) {
      m.set(Number(imp.id), imp.descripcion);
    }
    return m;
  }, [imputacionContableTabla]);

  // Carga inicial → si el contexto está vacío, lo poblamos
  const fetchCategorias = async () => {
    try {
      setLoadingTabla(true);
      setError("");
      const res = await fetch(`${apiUrl}/categorias-egreso`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof setCategoriasEgreso === "function") {
        setCategoriasEgreso(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Error al cargar categorías");
    } finally {
      setLoadingTabla(false);
    }
  };

  useEffect(() => {
    if (!categoriasEgreso?.length) fetchCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // Filtro
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const source = Array.isArray(categoriasEgreso) ? categoriasEgreso : [];
    if (!q) return source;
    return source.filter((c) => {
      const nombreOk = (c.nombre || "").toLowerCase().includes(q);
      const impDesc = imputacionMap.get(Number(c.imputacioncontable_id)) || "";
      const impOk = impDesc.toLowerCase().includes(q);
      return nombreOk || impOk;
    });
  }, [categoriasEgreso, busqueda, imputacionMap]);

  // ---- Modal helpers ----
  const openModalNew = () => {
    setFormError("");
    setFormMsg(null);
    setEditing(false);
    setEditId(null);
    setNombre("");
    setImputacionContableId("");
    setShowModal(true);
  };

  const openModalEdit = (cat) => {
    setFormError("");
    setFormMsg(null);
    setEditing(true);
    setEditId(cat.id);
    setNombre(cat.nombre || "");
    setImputacionContableId(
      cat.imputacioncontable_id ? String(cat.imputacioncontable_id) : ""
    );
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  // ---- Guardar (POST/PUT) + actualizar CONTEXTO ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormMsg(null);

    if (!nombre.trim()) return setFormError("El nombre es requerido.");
    if (!imputacionContableId)
      return setFormError("La imputación contable es requerida.");

    try {
      setSaving(true);
      const payload = {
        nombre: nombre.trim(),
        imputacioncontable_id: Number(imputacionContableId),
      };

      const url = editing
        ? `${apiUrl}/categorias-egreso/${editId}`
        : `${apiUrl}/categorias-egreso`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const maybeJson = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(maybeJson?.error || "Error al guardar");
      }

      const finalItem = maybeJson || {
        id: editing ? editId : Date.now(), // fallback si el backend no devuelve objeto
        ...payload,
      };

      // Actualizar contexto sin refetch
      if (typeof setCategoriasEgreso === "function") {
        setCategoriasEgreso((prev = []) => {
          if (editing) {
            return prev.map((c) =>
              Number(c.id) === Number(editId) ? { ...c, ...finalItem } : c
            );
          }
          const exists = prev.some((c) => Number(c.id) === Number(finalItem.id));
          return exists ? prev : [...prev, finalItem];
        });
      }

      setFormMsg({ type: "success", text: editing ? "Categoría actualizada" : "Categoría creada" });
      // Cierro con leve delay para que se vea el mensaje (opcional)
      setTimeout(() => closeModal(), 350);
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
      const res = await fetch(`${apiUrl}/categorias-egreso/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      if (typeof setCategoriasEgreso === "function") {
        setCategoriasEgreso((prev = []) => prev.filter((c) => Number(c.id) !== Number(id)));
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
          <h3 className="m-0">Categorías de Egreso</h3>
          <Badge bg="secondary" className="align-middle">
            {categoriasEgreso?.length || 0}
          </Badge>
        </div>

        <div className="d-flex gap-2">
          <InputGroup className="mx-2">
            <InputGroup.Text className="d-none d-md-flex">Buscar</InputGroup.Text>
            <Form.Control
              placeholder="Nombre o imputación contable…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={openModalNew}>
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
            <th>Imputación Contable</th>
            <th style={{ width: 240 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loadingTabla ? (
            <tr>
              <td colSpan={4} className="text-center">
                <Spinner animation="border" size="sm" className="me-2" />
                Cargando…
              </td>
            </tr>
          ) : (
            <>
              {filtradas.map((cat) => {
                const impDesc = imputacionMap.get(Number(cat.imputacioncontable_id)) || "—";
                return (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>{cat.nombre}</td>
                    <td>{impDesc}</td>
                    <td className="text-nowrap">
                      <Button
                        size="sm"
                        variant="outline-warning"
                        className="mx-2"
                        onClick={() => openModalEdit(cat)}
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
                    </td>
                  </tr>
                );
              })}
              {filtradas.length === 0 && !loadingTabla && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    Sin resultados
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </Table>

      {/* Modal Crear/Editar con estilos consistentes */}
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
              {editing ? "Editar" : "Nueva"} Categoría de Egreso
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
                  <Col md={6}>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={saving}
                      required
                    />
                    <Form.Text className="text-muted">Nombre visible de la categoría.</Form.Text>
                  </Col>

                  <Col md={6}>
                    <Form.Label>Imputación Contable</Form.Label>
                    <Form.Select
                      value={imputacionContableId || ""}
                      onChange={(e) => setImputacionContableId(e.target.value)}
                      disabled={saving}
                      required
                      className="form-control my-input"
                    >
                      <option value="">Seleccione…</option>
                      {imputacionContableTabla.map((imp) => (
                        <option key={imp.id} value={imp.id}>
                          {imp.descripcion}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Se usará para la imputación automática de egresos.
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

export default CategoriaEgresoList;
