import React, { useEffect, useState, useCallback, useContext, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Form,
  InputGroup,
  Modal,
  Spinner,
} from "react-bootstrap";
import Contexts from "../../context/Contexts";
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

export default function BancoList() {
  const navigate = useNavigate();
  const {
    bancosTabla = [],
    setBancosTabla,
    empresasTabla = [],
  } = useContext(Contexts.DataContext) || {};

  // Fallback local si no hay setter o contexto vacío
  const [rows, setRows] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loadingTabla, setLoadingTabla] = useState(false);

  // Modal (crear/editar)
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [descripcion, setDescripcion] = useState("");
  const [cuenta, setCuenta] = useState("");
  const [alias, setAlias] = useState("");
  const [empresaId, setEmpresaId] = useState(""); // string controlado
  const [formError, setFormError] = useState("");
  const [formMsg, setFormMsg] = useState(null);

  // ---------- Fuente efectiva ----------
  const source = useMemo(() => {
    if (Array.isArray(bancosTabla) && bancosTabla.length) return bancosTabla;
    return rows;
  }, [bancosTabla, rows]);

  const nombreEmpresa = (id) => {
    if (!id) return "(Sin empresa)";
    const e = empresasTabla.find((x) => Number(x.id) === Number(id));
    return e?.nombre || e?.razon_social || e?.descripcion || `Empresa ${id}`;
  };

  // ---------- Fetch ----------
  const fetchBancos = useCallback(async () => {
    try {
      setLoadingTabla(true);
      setError("");
      const res = await fetch(`${apiUrl}/bancos`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) throw new Error();
      const ordenados = data.slice().sort((a, b) => a.id - b.id);
      if (typeof setBancosTabla === "function") setBancosTabla(ordenados);
      else setRows(ordenados);
    } catch {
      setError("Error al cargar bancos");
    } finally {
      setLoadingTabla(false);
    }
  }, [apiUrl, setBancosTabla]);

  useEffect(() => {
    // Cargar si no hay datos en ninguna fuente
    if (!(bancosTabla?.length || rows?.length)) fetchBancos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ---------- Filtro ----------
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return source;
    return source.filter((b) => {
      const desc = (b.descripcion || "").toLowerCase();
      const alia = (b.alias || "").toLowerCase();
      const cta = (b.cuenta || "").toLowerCase();
      const emp = nombreEmpresa(b.empresa_id).toLowerCase();
      return desc.includes(q) || alia.includes(q) || cta.includes(q) || emp.includes(q);
    });
  }, [source, busqueda, empresasTabla]);

  // ---------- Modal helpers ----------
  const resetForm = () => {
    setDescripcion("");
    setCuenta("");
    setAlias("");
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

  const openModalEdit = (b) => {
    setEditing(true);
    setEditId(b.id);
    setDescripcion(b.descripcion || "");
    setCuenta(b.cuenta || "");
    setAlias(b.alias || "");
    setEmpresaId(b.empresa_id != null ? String(b.empresa_id) : "");
    setFormError("");
    setFormMsg(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  // ---------- Guardar (POST/PUT) + optimista + refetch ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormMsg(null);

    if (!descripcion.trim()) return setFormError("La descripción es requerida.");

    try {
      setSaving(true);

      const payload = {
        descripcion: descripcion.trim(),
        cuenta: cuenta?.trim() || "",
        alias: alias?.trim() || "",
        empresa_id: empresaId === "" ? null : Number(empresaId),
      };

      const url = editing ? `${apiUrl}/bancos/${editId}` : `${apiUrl}/bancos`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      if (!res.ok) {
        let msg = "No se pudo guardar el banco";
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

      const finalItem = saved || {
        id: editing ? editId : undefined, // se corrige con refetch
        ...payload,
      };

      const applyOptimistic = (prev = []) => {
        if (editing) {
          return prev.map((b) => (Number(b.id) === Number(editId) ? { ...b, ...finalItem } : b));
        }
        const tempId = finalItem.id ?? Date.now();
        return [...prev, { ...finalItem, id: tempId }];
      };

      if (typeof setBancosTabla === "function") {
        setBancosTabla(applyOptimistic);
      } else {
        setRows((prev) => applyOptimistic(prev));
      }

      setFormMsg({ type: "success", text: editing ? "Banco actualizado" : "Banco creado" });

      // Refetch para normalizar ids/estado
      await fetchBancos();

      closeModal();
    } catch (err) {
      setFormError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Eliminar ----------
  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseás eliminar este banco?")) return;
    try {
      const res = await fetch(`${apiUrl}/bancos/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      if (typeof setBancosTabla === "function") {
        setBancosTabla((prev = []) => prev.filter((b) => Number(b.id) !== Number(id)));
      } else {
        setRows((prev) => prev.filter((b) => Number(b.id) !== Number(id)));
      }
    } catch {
      alert("No se pudo eliminar el banco");
    }
  };

  return (
  <Container fluid className="mt-3 rpm-page px-3">
    <Row>
      <Col>
        <Card className="rpm-card">
          <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-2 rpm-header">
            <div className="d-flex align-items-center gap-2">
              <strong>Bancos</strong>
              <Badge bg="secondary" className="rpm-badge">
                {source.length}
              </Badge>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <InputGroup className="rpm-input-group">
                <InputGroup.Text className="d-none d-md-flex">Buscar</InputGroup.Text>
                <Form.Control
                  placeholder="Descripción, alias, cuenta o empresa…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="form-control my-input rpm-input"
                />
              </InputGroup>
              <Button variant="primary" onClick={openModalNew} className="rpm-btn">
                Nuevo
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="rpm-body">
            {error && (
              <Alert variant="danger" className="rpm-alert py-2">
                {error}
              </Alert>
            )}

            <div className="table-responsive rpm-tablewrap">
              <Table bordered hover size="sm" className="rpm-table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}># ID</th>
                    <th>Descripción</th>
                    <th>Cuenta</th>
                    <th>Alias</th>
                    <th>Empresa</th>
                    <th style={{ width: 240 }}>Operaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTabla ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Cargando…
                      </td>
                    </tr>
                  ) : filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((banco) => (
                      <tr key={banco.id}>
                        <td>{banco.id}</td>
                        <td className="fw-medium">{banco.descripcion}</td>
                        <td>{banco.cuenta || "—"}</td>
                        <td>{banco.alias || "—"}</td>
                        <td>{nombreEmpresa(banco.empresa_id)}</td>
                        <td className="text-center text-nowrap">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => openModalEdit(banco)}
                              className="rpm-btn-outline"
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(banco.id)}
                              className="rpm-btn-outline"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Modal Crear/Editar */}
    <Modal
      show={showModal}
      onHide={closeModal}
      backdrop={saving ? "static" : true}
      centered
      size="md"
      className="rpm-modal"
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!saving} className="rpm-modal-header">
          <Modal.Title className="fw-semibold">
            {editing ? "Editar Banco" : "Nuevo Banco"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="rpm-modal-body">
          {formMsg && (
            <Alert variant={formMsg.type} className="rpm-alert py-2">
              {formMsg.text}
            </Alert>
          )}
          {formError && (
            <Alert variant="danger" className="rpm-alert py-2">
              {formError}
            </Alert>
          )}

          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={saving}
                required
                placeholder="Ej: Banco Nación"
                className="form-control my-input rpm-input"
              />
            </Col>
            <Col md={6}>
              <Form.Label>Cuenta</Form.Label>
              <Form.Control
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
                disabled={saving}
                placeholder="CBU o Nº de cuenta"
                className="form-control my-input rpm-input"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Alias</Form.Label>
              <Form.Control
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                disabled={saving}
                placeholder="Alias del banco"
                className="form-control my-input rpm-input"
              />
            </Col>

            <Col md={6}>
              <Form.Label>Empresa</Form.Label>
              <Form.Select
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                disabled={saving}
                className="form-control my-input rpm-input"
              >
                <option value="">(Sin empresa)</option>
                {empresasTabla.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre || e.razon_social || e.descripcion || `Empresa ${e.id}`}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between rpm-modal-footer">
          <div className="text-muted small">
            {editing ? `Editando ID #${editId}` : "Creación de nuevo banco"}
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={closeModal}
              disabled={saving}
              className="rpm-btn-outline"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={saving}
              className="rpm-btn"
            >
              {saving ? (
                <>
                  <Spinner size="sm" animation="border" className="me-1" />
                  Guardando…
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
