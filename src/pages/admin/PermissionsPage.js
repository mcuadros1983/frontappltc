import React, { useEffect, useMemo, useState } from "react";
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert,
} from "react-bootstrap";
import { FiCheckSquare, FiSquare } from "react-icons/fi";
import CategoryBlock from "./CategoryBlock";
import { PERMISSION_CATEGORIES, FLAT_PERMISSIONS } from "./PermissionsCatalog";

export default function PermissionsPage() {
  const API = process.env.REACT_APP_API_URL;

  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // permisos seleccionados del usuario activo
  const [perms, setPerms] = useState([]);

  // UI state
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  // Estado de expansión por categoría (id -> boolean). Por defecto: todo expandido.
  const initialExpanded = Object.fromEntries(
    PERMISSION_CATEGORIES.map((c) => [c.id, false])
  );
  const [expandedMap, setExpandedMap] = useState(initialExpanded);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Cargar usuarios
  useEffect(() => {
    (async () => {
      setLoadingUsers(true);
      clearMessages();
      try {
        const res = await fetch(`${API}/usuarios`, { credentials: "include" });
        if (!res.ok) throw new Error("No se pudo cargar usuarios");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data?.rows ?? []);
      } catch (e) {
        setError(e.message || "Error cargando usuarios");
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [API]);

  const filteredUsers = useMemo(() => {
    const term = q.trim().toLowerCase();
    return !term
      ? users
      : users.filter((u) =>
          String(u.usuario || "").toLowerCase().includes(term)
        );
  }, [users, q]);

  // Cargar permisos del usuario
  const loadUserPerms = async (userId) => {
    setSelectedUserId(userId);
    setPerms([]);
    clearMessages();
    if (!userId) return;

    setLoadingPerms(true);
    try {
      const res = await fetch(`${API}/usuarios/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("No se pudo obtener el usuario");
      const data = await res.json();
      const p = Array.isArray(data?.permissions) ? data.permissions : [];
      const normalized = p.filter((k) => FLAT_PERMISSIONS.includes(k));
      setPerms(normalized);
      setSelectAll(normalized.length === FLAT_PERMISSIONS.length);
      // mantener el estado de expansión actual (no se toca)
    } catch (e) {
      setError(e.message || "Error cargando permisos del usuario");
    } finally {
      setLoadingPerms(false);
    }
  };

  // Alternar un permiso individual
  const toggle = (p) => {
    clearMessages();
    setPerms((prev) => {
      const updated = prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p];
      setSelectAll(updated.length === FLAT_PERMISSIONS.length);
      return updated;
    });
  };

  // Alternar todos los permisos de una categoría
  const toggleCategory = (categoryPerms, checked) => {
    clearMessages();
    setPerms((prev) => {
      const current = new Set(prev);
      if (checked) {
        categoryPerms.forEach((p) => current.add(p));
      } else {
        categoryPerms.forEach((p) => current.delete(p));
      }
      const updated = Array.from(current);
      setSelectAll(updated.length === FLAT_PERMISSIONS.length);
      return updated;
    });
  };

  // Alternar expand/contraer una categoría (solo UI)
  const toggleCategoryExpand = (catId) => {
    setExpandedMap((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Alternar todos (global)
  const toggleAll = () => {
    clearMessages();
    if (selectAll) {
      setPerms([]);
      setSelectAll(false);
    } else {
      setPerms([...FLAT_PERMISSIONS]);
      setSelectAll(true);
    }
  };

  // Guardar
  const save = async () => {
    if (!selectedUserId) return;
    clearMessages();
    setSaving(true);
    try {
      const res = await fetch(`${API}/usuarios/${selectedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permissions: perms }),
      });

      if (!res.ok) {
        let errMsg = "No se pudo guardar permisos";
        try {
          const err = await res.json();
          if (err?.message) errMsg = err.message;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }

      setSuccess("✅ Permisos guardados correctamente.");
    } catch (e) {
      setError(e.message || "Error al guardar permisos");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="mt-3 cpm-page">
      <Row>
        <Col>
          <Card className="cpm-card">
            <Card.Header className="cpm-header d-flex justify-content-between align-items-center">
              <strong>Administrar Permisos</strong>

              {/* Checkbox global seleccionar todos (además del botón) */}
              {selectedUserId && (
                <div className="d-flex align-items-center gap-2">
                  <Form.Check
                    type="checkbox"
                    id="perm-select-all"
                    label="Seleccionar todo"
                    checked={selectAll}
                    onChange={toggleAll}
                  />
                  <Button
                    variant={selectAll ? "secondary" : "outline-primary"}
                    size="sm"
                    onClick={toggleAll}
                    className="d-flex align-items-center gap-2"
                  >
                    {selectAll ? <FiSquare /> : <FiCheckSquare />}
                    {selectAll ? "Deseleccionar todos" : "Seleccionar todos"}
                  </Button>
                </div>
              )}
            </Card.Header>

            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  onClose={() => setError("")}
                  dismissible
                  className="mb-3"
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  variant="success"
                  onClose={() => setSuccess("")}
                  dismissible
                  className="mb-3"
                >
                  {success}
                </Alert>
              )}

              {/* Filtros */}
              <Form className="mb-3">
                <Row className="g-2">
                  <Col xs={12} md={6}>
                    <Form.Label>Buscar usuario</Form.Label>
                    <Form.Control
                      placeholder="Filtrar por nombre de usuario"
                      value={q}
                      onChange={(e) => {
                        clearMessages();
                        setQ(e.target.value);
                      }}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Seleccionar usuario</Form.Label>
                    <Form.Select
                      value={selectedUserId}
                      onChange={(e) => loadUserPerms(e.target.value)}
                      disabled={loadingUsers}
                      className="my-input form-control"
                    >
                      <option value="">— Elegí un usuario —</option>
                      {filteredUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.usuario}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Form>

              {loadingPerms && (
                <div className="text-center my-4">
                  <Spinner animation="border" />
                </div>
              )}

              {!loadingPerms && selectedUserId && (
                <>
                  {/* Render de categorías colapsables */}
                  <Row>
                    <Col>
                      {PERMISSION_CATEGORIES.map((cat) => (
                        <CategoryBlock
                          key={cat.id}
                          title={cat.title}
                          perms={cat.perms}
                          selected={perms}
                          expanded={!!expandedMap[cat.id]}
                          onToggleExpand={() => toggleCategoryExpand(cat.id)}
                          onToggleCategory={(checked) =>
                            toggleCategory(cat.perms, checked)
                          }
                          onTogglePerm={(permKey) => toggle(permKey)}
                        />
                      ))}
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      variant="primary"
                      onClick={save}
                      disabled={saving}
                      className="cpm-btn"
                    >
                      {saving ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Guardando…
                        </>
                      ) : (
                        "Guardar"
                      )}
                    </Button>
                  </div>
                </>
              )}

              {!selectedUserId && !loadingUsers && (
                <div className="text-muted mt-3">
                  Elegí un usuario para ver y editar sus permisos.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
