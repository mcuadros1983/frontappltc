// src/pages/proveedores/ProveedorList.jsx
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

export default function ProveedorList() {
  const { proveedoresTabla = [], setProveedoresTabla } =
    useContext(Contexts.DataContext) || {};

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loadingTabla, setLoadingTabla] = useState(false);

  // Modal (crear/editar)
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [formMsg, setFormMsg] = useState(null);

  // ===== Fetch inicial si el contexto está vacío =====
  const fetchProveedores = async () => {
    try {
      setLoadingTabla(true);
      setError("");
      const res = await fetch(`${apiUrl}/proveedores`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof setProveedoresTabla === "function") {
        const ordenados = (Array.isArray(data) ? data : [])
          .slice()
          .sort((a, b) => a.id - b.id);
        setProveedoresTabla(ordenados);
      }
    } catch {
      setError("Error al cargar proveedores");
    } finally {
      setLoadingTabla(false);
    }
  };

  useEffect(() => {
    if (!proveedoresTabla?.length) fetchProveedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ===== Fuente + filtro =====
  const source = Array.isArray(proveedoresTabla) ? proveedoresTabla : [];
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return source;
    return source.filter((p) => {
      const n = (p.nombre || "").toLowerCase().includes(q);
      const d = (p.direccion || "").toLowerCase().includes(q);
      const t = (p.telefono || "").toLowerCase().includes(q);
      const e = (p.email || "").toLowerCase().includes(q);
      return n || d || t || e;
    });
  }, [source, busqueda]);

  // ===== Modal helpers =====
  const resetForm = () => {
    setNombre("");
    setDireccion("");
    setTelefono("");
    setEmail("");
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
    setNombre(item.nombre || "");
    setDireccion(item.direccion || "");
    setTelefono(item.telefono || "");
    setEmail(item.email || "");
    setFormError("");
    setFormMsg(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  // ===== Validación mínima =====
  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) return "Email inválido";
    return null;
    // Podés agregar más reglas si querés (teléfono, etc.)
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
        nombre: nombre.trim(),
        direccion: direccion?.trim() || "",
        telefono: telefono?.trim() || "",
        email: email?.trim() || "",
      };

      const url = editing
        ? `${apiUrl}/proveedores/${editId}`
        : `${apiUrl}/proveedores`;
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
      if (typeof setProveedoresTabla === "function") {
        setProveedoresTabla((prev = []) => {
          const arr = Array.isArray(prev) ? [...prev] : [];
          if (editing) {
            const i = arr.findIndex((x) => Number(x.id) === Number(editId));
            if (i >= 0) arr[i] = { ...arr[i], ...finalItem };
          } else {
            const tempId = finalItem.id ?? Date.now();
            arr.push({ ...finalItem, id: tempId });
          }
          arr.sort((a, b) =>
            String(a?.nombre || a?.descripcion || "").localeCompare(
              String(b?.nombre || b?.descripcion || "")
            )
          );
          return arr;
        });
      }

      setFormMsg({
        type: "success",
        text: editing ? "Proveedor actualizado" : "Proveedor creado",
      });

      // Refetch para normalizar IDs/estado real
      await fetchProveedores();
      closeModal();
    } catch (err2) {
      setFormError(err2.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ===== Eliminar =====
  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseás eliminar este proveedor?")) return;
    try {
      const res = await fetch(`${apiUrl}/proveedores/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      if (typeof setProveedoresTabla === "function") {
        setProveedoresTabla((prev = []) =>
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
          <h3 className="m-0">Proveedores</h3>
          <Badge bg="secondary" className="align-middle">
            {source.length}
          </Badge>
        </div>

        <div className="d-flex gap-2">
          <InputGroup>
            <InputGroup.Text className="d-none d-md-flex">Buscar</InputGroup.Text>
            <Form.Control
              placeholder="Nombre, dirección, teléfono o email…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={openModalNew} className="mx-2">
            Nuevo
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
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th style={{ width: 240 }}>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {loadingTabla ? (
            <tr>
              <td colSpan={6} className="text-center">
                <Spinner animation="border" size="sm" className="me-2" /> Cargando…
              </td>
            </tr>
          ) : (
            <>
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.direccion || "—"}</td>
                  <td>{p.telefono || "—"}</td>
                  <td>{p.email || "—"}</td>
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
                  <td colSpan={6} className="text-center text-muted">
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
              {editing ? "Editar Proveedor" : "Nuevo Proveedor"}
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
                      placeholder="Nombre del proveedor"
                      className="my-input"
                    />
                  </Col>

                  <Col md={12}>
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      disabled={saving}
                      placeholder="Dirección del proveedor"
                      className="my-input"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      disabled={saving}
                      placeholder="Teléfono de contacto"
                      className="my-input"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={saving}
                      placeholder="correo@ejemplo.com"
                      className="my-input"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
            <div className="text-muted small">
              {editing ? `Editando ID #${editId}` : "Creación de proveedor"}
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
