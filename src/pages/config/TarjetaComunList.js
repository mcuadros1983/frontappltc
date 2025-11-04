import React, { useEffect, useState, useMemo, useContext } from "react";
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
import { useNavigate } from "react-router-dom";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function TarjetaComunList() {
  const navigate = useNavigate();
  const dataCtx = useContext(Contexts.DataContext) || {};
  const {
    // selects
    tiposTarjetaTabla = [],
    marcasTarjetaTabla = [],
    empresasTabla = [],
    bancosTabla = [],
    // tabla + setter global
    tarjetasTesoreriaTabla = [],
    setTarjetasTesoreriaTabla,
  } = dataCtx;

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loadingTabla, setLoadingTabla] = useState(false);

  // Modal (crear/editar)
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [terminacion, setTerminacion] = useState("");
  const [tipotarjeta_id, setTipoId] = useState("");
  const [marca_id, setMarcaId] = useState("");
  const [empresa_id, setEmpresaId] = useState("");
  const [banco_id, setBancoId] = useState("");

  const [formError, setFormError] = useState("");
  const [formMsg, setFormMsg] = useState(null);

  // ---- Fetch inicial si el contexto está vacío ----
  const fetchTarjetas = async () => {
    try {
      setLoadingTabla(true);
      setError("");
      const res = await fetch(`${apiUrl}/tarjetas-comunes`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof setTarjetasTesoreriaTabla === "function") {
        const ordenadas = Array.isArray(data)
          ? data.slice().sort((a, b) => String(a.terminacion || "").localeCompare(String(b.terminacion || "")))
          : [];
        setTarjetasTesoreriaTabla(ordenadas);
      }
    } catch {
      setError("Error al cargar tarjetas");
    } finally {
      setLoadingTabla(false);
    }
  };

  useEffect(() => {
    if (!tarjetasTesoreriaTabla?.length) fetchTarjetas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ---- Helpers de nombres para render ----
  const nombreDe = (id, list, keyA = "nombre", keyB = "descripcion") => {
    const it = (list || []).find((x) => Number(x.id) === Number(id));
    return it ? (it[keyA] ?? it[keyB] ?? `#${id}`) : "—";
  };

  // ---- Filtro ----
  const source = Array.isArray(tarjetasTesoreriaTabla) ? tarjetasTesoreriaTabla : [];
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return source;
    return source.filter((t) => {
      const campos = [
        t.terminacion,
        nombreDe(t.tipotarjeta_id, tiposTarjetaTabla),
        nombreDe(t.marca_id, marcasTarjetaTabla),
        nombreDe(t.empresa_id, empresasTabla, "descripcion", "nombre"),
        nombreDe(t.banco_id, bancosTabla, "descripcion", "nombre"),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return campos.includes(q);
    });
  }, [source, busqueda, tiposTarjetaTabla, marcasTarjetaTabla, empresasTabla, bancosTabla]);

  // ---- Modal helpers ----
  const resetForm = () => {
    setTerminacion("");
    setTipoId("");
    setMarcaId("");
    setEmpresaId("");
    setBancoId("");
    setFormError("");
    setFormMsg(null);
  };

  const openModalNew = () => {
    setEditing(false);
    setEditId(null);
    resetForm();
    setShowModal(true);
  };

  const openModalEdit = (t) => {
    setEditing(true);
    setEditId(t.id);
    setTerminacion(t.terminacion || "");
    setTipoId(t.tipotarjeta_id != null ? String(t.tipotarjeta_id) : "");
    setMarcaId(t.marca_id != null ? String(t.marca_id) : "");
    setEmpresaId(t.empresa_id != null ? String(t.empresa_id) : "");
    setBancoId(t.banco_id != null ? String(t.banco_id) : "");
    setFormError("");
    setFormMsg(null);
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

    if (!/^\d{4}$/.test(String(terminacion || ""))) {
      return setFormError("La terminación debe tener 4 dígitos.");
    }
    if (!tipotarjeta_id || !marca_id || !empresa_id || !banco_id) {
      return setFormError("Completá todos los selects requeridos.");
    }

    try {
      setSaving(true);

      const payload = {
        terminacion: String(terminacion).trim(),
        tipotarjeta_id: Number(tipotarjeta_id),
        marca_id: Number(marca_id),
        empresa_id: Number(empresa_id),
        banco_id: Number(banco_id),
      };

      const url = editing
        ? `${apiUrl}/tarjetas-comunes/${editId}`
        : `${apiUrl}/tarjetas-comunes`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      if (!res.ok) {
        let msg = "No se pudo guardar la tarjeta";
        try { msg = JSON.parse(raw)?.error || msg; } catch {}
        throw new Error(msg);
      }

      let saved = null;
      if (raw) {
        try { saved = JSON.parse(raw); } catch {}
      }

      const finalItem = saved || { id: editing ? editId : undefined, ...payload };

      // Update optimista en contexto
      if (typeof setTarjetasTesoreriaTabla === "function") {
        setTarjetasTesoreriaTabla((prev = []) => {
          const arr = Array.isArray(prev) ? [...prev] : [];
          if (editing) {
            const i = arr.findIndex((x) => Number(x.id) === Number(editId));
            if (i >= 0) arr[i] = { ...arr[i], ...finalItem };
          } else {
            const tempId = finalItem.id ?? Date.now();
            arr.push({ ...finalItem, id: tempId });
          }
          arr.sort((a, b) =>
            String(a?.terminacion || "").localeCompare(String(b?.terminacion || ""))
          );
          return arr;
        });
      }

      setFormMsg({ type: "success", text: editing ? "Tarjeta actualizada" : "Tarjeta creada" });
      await fetchTarjetas(); // normaliza IDs/estado real
      closeModal();
    } catch (err) {
      setFormError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ---- Eliminar + actualizar CONTEXTO ----
  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseás eliminar esta tarjeta?")) return;
    try {
      const res = await fetch(`${apiUrl}/tarjetas-comunes/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      if (typeof setTarjetasTesoreriaTabla === "function") {
        setTarjetasTesoreriaTabla((prev = []) => prev.filter((t) => Number(t.id) !== Number(id)));
      }
    } catch {
      alert("No se pudo eliminar la tarjeta");
    }
  };

  return (
    <Container className="mt-4">
      {/* Header / acciones */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <h3 className="m-0">Tarjetas</h3>
          <Badge bg="secondary" className="align-middle">{source.length}</Badge>
        </div>

        <div className="d-flex gap-2">
          <InputGroup>
            <InputGroup.Text className="d-none d-md-flex">Buscar</InputGroup.Text>
            <Form.Control
              placeholder="Terminación, tipo, marca, empresa o banco…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={openModalNew} className="mx-2">
            Nueva
          </Button>
          {/* Si querés mantener la ruta clásica: */}
          {/* <Button variant="outline-secondary" onClick={() => navigate("/tarjetas-comunes/new")} className="mx-2">Ruta</Button> */}
        </div>
      </div>

      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Table striped bordered hover responsive="md">
        <thead>
          <tr>
            <th style={{ width: 80 }}>#</th>
            <th>Terminación</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Empresa</th>
            <th>Banco</th>
            <th style={{ width: 260 }}>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {loadingTabla ? (
            <tr>
              <td colSpan={7} className="text-center">
                <Spinner animation="border" size="sm" className="me-2" />
                Cargando…
              </td>
            </tr>
          ) : (
            <>
              {filtradas.map((tarjeta) => (
                <tr key={tarjeta.id}>
                  <td>{tarjeta.id}</td>
                  <td>{tarjeta.terminacion}</td>
                  <td>{nombreDe(tarjeta.tipotarjeta_id, tiposTarjetaTabla)}</td>
                  <td>{nombreDe(tarjeta.marca_id, marcasTarjetaTabla)}</td>
                  <td>{nombreDe(tarjeta.empresa_id, empresasTabla, "descripcion", "nombre")}</td>
                  <td>{nombreDe(tarjeta.banco_id, bancosTabla, "descripcion", "nombre")}</td>
                  <td className="text-nowrap">
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => openModalEdit(tarjeta)}
                        className="mx-2"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(tarjeta.id)}
                      >
                        Eliminar
                      </Button>
                      {/* mantener edición por ruta si querés */}
                      {/* <Button size="sm" variant="outline-secondary" onClick={() => navigate(`/tarjetas-comunes/${tarjeta.id}/edit`)} className="mx-2">Ruta</Button> */}
                    </div>
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && !loadingTabla && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">Sin resultados</td>
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
              {editing ? "Editar Tarjeta" : "Nueva Tarjeta"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Card className="border-0">
              <Card.Body className="pt-2">
                {formMsg && <Alert variant={formMsg.type} className="py-2">{formMsg.text}</Alert>}
                {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Terminación (4 dígitos)</Form.Label>
                    <Form.Control
                      value={terminacion}
                      onChange={(e) => setTerminacion(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      disabled={saving}
                      required
                      placeholder="1234"
                      maxLength={4}
                      className="my-input"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Label>Tipo de Tarjeta</Form.Label>
                    <Form.Select
                      value={tipotarjeta_id}
                      onChange={(e) => setTipoId(e.target.value)}
                      disabled={saving}
                      required
                      className="form-control my-input"
                    >
                      <option value="">Seleccione…</option>
                      {tiposTarjetaTabla.map((it) => (
                        <option key={it.id} value={it.id}>{it.nombre}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={6}>
                    <Form.Label>Marca</Form.Label>
                    <Form.Select
                      value={marca_id}
                      onChange={(e) => setMarcaId(e.target.value)}
                      disabled={saving}
                      required
                      className="form-control my-input"
                    >
                      <option value="">Seleccione…</option>
                      {marcasTarjetaTabla.map((it) => (
                        <option key={it.id} value={it.id}>{it.nombre}</option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={6}>
                    <Form.Label>Empresa</Form.Label>
                    <Form.Select
                      value={empresa_id}
                      onChange={(e) => setEmpresaId(e.target.value)}
                      disabled={saving}
                      required
                      className="form-control my-input"
                    >
                      <option value="">Seleccione…</option>
                      {empresasTabla.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.descripcion || it.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={12}>
                    <Form.Label>Banco</Form.Label>
                    <Form.Select
                      value={banco_id}
                      onChange={(e) => setBancoId(e.target.value)}
                      disabled={saving}
                      required
                      className="form-control my-input"
                    >
                      <option value="">Seleccione…</option>
                      {bancosTabla.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.descripcion || it.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
            <div className="text-muted small">
              {editing ? `Editando ID #${editId}` : "Creación de nueva tarjeta"}
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
