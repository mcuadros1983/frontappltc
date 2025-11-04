// src/pages/tesoreria/PtoVentaList.jsx
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

export default function PtoVentaList() {
  const {
    // data de empresas para mostrar nombres en la tabla y en el select
    empresasTabla = [],
    // puntos de venta en contexto + setter (para mantener todo sincronizado)
    ptosVentaTabla = [],
    setPtosVentaTabla,
  } = useContext(Contexts.DataContext) || {};

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loadingTabla, setLoadingTabla] = useState(false);

  // ===== Modal (crear/editar) =====
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form del modal
  const [descripcion, setDescripcion] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [formError, setFormError] = useState("");
  const [formMsg, setFormMsg] = useState(null);

  // ===== helpers =====
  const empresasById = useMemo(() => {
    const m = new Map();
    for (const e of empresasTabla) {
      m.set(
        Number(e.id),
        e.nombre || e.razon_social || e.descripcion || `Empresa ${e.id}`
      );
    }
    return m;
  }, [empresasTabla]);

  // ===== Fetch inicial si el contexto está vacío =====
  const fetchPtosVenta = async () => {
    try {
      setLoadingTabla(true);
      setError("");
      const res = await fetch(`${apiUrl}/ptos-venta`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof setPtosVentaTabla === "function") {
        const ordenados = (Array.isArray(data) ? data : [])
          .slice()
          .sort((a, b) => a.id - b.id);
        setPtosVentaTabla(ordenados);
      }
    } catch {
      setError("Error al cargar Puntos de Venta");
    } finally {
      setLoadingTabla(false);
    }
  };

  useEffect(() => {
    if (!ptosVentaTabla?.length) fetchPtosVenta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ===== Fuente + filtro =====
  const source = Array.isArray(ptosVentaTabla) ? ptosVentaTabla : [];
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return source;
    return source.filter((p) => {
      const descOk = (p.descripcion || "").toLowerCase().includes(q);
      const empNom = empresasById.get(Number(p.empresa_id)) || "";
      const empOk = String(empNom).toLowerCase().includes(q);
      return descOk || empOk;
    });
  }, [source, busqueda, empresasById]);

  // ===== Modal helpers =====
  const resetForm = () => {
    setDescripcion("");
    setEmpresaId("");
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
    setEmpresaId(item.empresa_id == null ? "" : String(item.empresa_id));
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
    // empresa es opcional: "" => null
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
      const payload = {
        descripcion: descripcion.trim(),
        empresa_id: empresaId === "" ? null : Number(empresaId),
      };

      const url = editing
        ? `${apiUrl}/ptos-venta/${editId}`
        : `${apiUrl}/ptos-venta`;
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
        try {
          msg = JSON.parse(raw)?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      let saved = null;
      if (raw) {
        try {
          saved = JSON.parse(raw);
        } catch {}
      }

      const finalItem = saved || { id: editing ? editId : undefined, ...payload };

      // Update optimista
      if (typeof setPtosVentaTabla === "function") {
        setPtosVentaTabla((prev = []) => {
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

      setFormMsg({
        type: "success",
        text: editing ? "Punto de Venta actualizado" : "Punto de Venta creado",
      });

      // Refetch para normalizar ids/estado
      await fetchPtosVenta();
      closeModal();
    } catch (err2) {
      setFormError(err2.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ===== Eliminar =====
  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseás eliminar este punto de venta?")) return;
    try {
      const res = await fetch(`${apiUrl}/ptos-venta/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      if (typeof setPtosVentaTabla === "function") {
        setPtosVentaTabla((prev = []) =>
          prev.filter((p) => Number(p.id) !== Number(id))
        );
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
          <h3 className="m-0">Puntos de Venta</h3>
          <Badge bg="secondary" className="align-middle">{source.length}</Badge>
        </div>

        <div className="d-flex gap-2">
          <InputGroup>
            <InputGroup.Text className="d-none d-md-flex">Buscar</InputGroup.Text>
            <Form.Control
              placeholder="Descripción o Empresa…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={openModalNew} className="mx-2">
            Nuevo
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Table striped bordered hover responsive="md">
        <thead>
          <tr>
            <th style={{ width: 80 }}>#</th>
            <th>Descripción</th>
            <th>Empresa</th>
            <th style={{ width: 240 }}>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {loadingTabla ? (
            <tr>
              <td colSpan={4} className="text-center">
                <Spinner animation="border" size="sm" className="me-2" /> Cargando…
              </td>
            </tr>
          ) : (
            <>
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.descripcion}</td>
                  <td>
                    {p.empresa_id == null || p.empresa_id === ""
                      ? "—"
                      : empresasById.get(Number(p.empresa_id)) || `ID ${p.empresa_id}`}
                  </td>
                  <td className="text-nowrap">
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => openModalEdit(p)}
                        className="mx-2"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && !loadingTabla && (
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
              {editing ? "Editar Punto de Venta" : "Nuevo Punto de Venta"}
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
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      disabled={saving}
                      required
                      placeholder="Nombre o número del punto de venta"
                      className="my-input"
                    />
                  </Col>

                  <Col md={12}>
                    <Form.Label>Empresa</Form.Label>
                    <Form.Select
                      value={empresaId}
                      onChange={(e) => setEmpresaId(e.target.value)}
                      disabled={saving}
                      className="form-control my-input"
                    >
                      <option value="">(Sin empresa)</option>
                      {empresasTabla.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombre || e.razon_social || e.descripcion || `Empresa ${e.id}`}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Opcional. Dejar vacío para no asociar empresa.
                    </Form.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
            <div className="text-muted small">
              {editing ? `Editando ID #${editId}` : "Creación de nuevo punto de venta"}
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={closeModal}
                disabled={saving}
                className="mx-2"
              >
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
