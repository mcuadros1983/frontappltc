import React, { useEffect, useMemo, useState, useContext } from "react";
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

const TarjetaPlanPagoList = () => {
  const {
    planTarjetaTesoreriaTabla = [],
    setPlanTarjetaTesoreriaTabla,
  } = useContext(Contexts.DataContext) || {};

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
  const [cuotas, setCuotas] = useState(1);
  const [tipoCalculo, setTipoCalculo] = useState("coeficiente"); // 'coeficiente' | 'tasa'
  const [coeficiente, setCoeficiente] = useState("");
  const [tasaMensual, setTasaMensual] = useState("");

  const [formError, setFormError] = useState("");
  const [formMsg, setFormMsg] = useState(null);

  // ---- Fetch inicial si el contexto está vacío ----
  const fetchPlanes = async () => {
    try {
      setLoadingTabla(true);
      setError("");
      const res = await fetch(`${apiUrl}/tarjeta-planes`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof setPlanTarjetaTesoreriaTabla === "function") {
        const ordenados = (Array.isArray(data) ? data : []).slice().sort((a, b) =>
          (a?.nombre || "").localeCompare(b?.nombre || "") ||
          Number(a?.cuotas || 0) - Number(b?.cuotas || 0)
        );
        setPlanTarjetaTesoreriaTabla(ordenados);
      }
    } catch {
      setError("Error al cargar planes");
    } finally {
      setLoadingTabla(false);
    }
  };

  useEffect(() => {
    if (!planTarjetaTesoreriaTabla?.length) fetchPlanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ---- Fuente + filtro ----
  const source = Array.isArray(planTarjetaTesoreriaTabla) ? planTarjetaTesoreriaTabla : [];
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return source;
    return source.filter((p) => {
      const txt = [
        p?.nombre,
        String(p?.cuotas),
        p?.tipo_calculo,
        p?.coeficiente,
        p?.tasa_mensual,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return txt.includes(q);
    });
  }, [source, busqueda]);

  // ---- Modal helpers ----
  const resetForm = () => {
    setNombre("");
    setCuotas(1);
    setTipoCalculo("coeficiente");
    setCoeficiente("");
    setTasaMensual("");
    setFormError("");
    setFormMsg(null);
  };

  const openModalNew = () => {
    setEditing(false);
    setEditId(null);
    resetForm();
    setShowModal(true);
  };

  const openModalEdit = (pl) => {
    setEditing(true);
    setEditId(pl.id);
    setNombre(pl.nombre ?? "");
    setCuotas(Number(pl.cuotas ?? 1));
    setTipoCalculo(pl.tipo_calculo ?? "coeficiente");
    setCoeficiente(pl.coeficiente ?? "");
    setTasaMensual(pl.tasa_mensual ?? "");
    setFormError("");
    setFormMsg(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  // ---- Validar ----
  const validar = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!cuotas || Number(cuotas) < 1) return "Cuotas debe ser >= 1";
    if (tipoCalculo === "coeficiente" && (coeficiente === "" || coeficiente === null)) {
      return "Coeficiente es requerido cuando el cálculo es por coeficiente";
    }
    if (tipoCalculo === "tasa" && (tasaMensual === "" || tasaMensual === null)) {
      return "Tasa mensual es requerida cuando el cálculo es por tasa";
    }
    return null;
  };

  // ---- Guardar (POST/PUT) + update optimista + refetch ----
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
        cuotas: Number(cuotas),
        tipo_calculo: tipoCalculo,
        coeficiente: tipoCalculo === "coeficiente" ? coeficiente : null,
        tasa_mensual: tipoCalculo === "tasa" ? tasaMensual : null,
      };

      const url = editing ? `${apiUrl}/tarjeta-planes/${editId}` : `${apiUrl}/tarjeta-planes`;
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
        try { msg = JSON.parse(raw)?.error || msg; } catch {}
        throw new Error(msg);
      }

      let saved = null;
      if (raw) {
        try { saved = JSON.parse(raw); } catch {}
      }

      const finalItem = saved || { id: editing ? editId : undefined, ...payload };

      // Update optimista en contexto
      if (typeof setPlanTarjetaTesoreriaTabla === "function") {
        setPlanTarjetaTesoreriaTabla((prev = []) => {
          const arr = Array.isArray(prev) ? [...prev] : [];
          if (editing) {
            const i = arr.findIndex((x) => Number(x.id) === Number(editId));
            if (i >= 0) arr[i] = { ...arr[i], ...finalItem };
          } else {
            const tempId = finalItem.id ?? Date.now();
            arr.push({ ...finalItem, id: tempId });
          }
          arr.sort(
            (a, b) =>
              String(a?.nombre || "").localeCompare(String(b?.nombre || "")) ||
              Number(a?.cuotas || 0) - Number(b?.cuotas || 0)
          );
          return arr;
        });
      }

      setFormMsg({ type: "success", text: editing ? "Plan actualizado" : "Plan creado" });
      await fetchPlanes(); // normaliza ids/estado
      closeModal();
    } catch (err2) {
      setFormError(err2.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // ---- Eliminar ----
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este plan?")) return;
    try {
      const res = await fetch(`${apiUrl}/tarjeta-planes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      if (typeof setPlanTarjetaTesoreriaTabla === "function") {
        setPlanTarjetaTesoreriaTabla((prev = []) => prev.filter((p) => Number(p.id) !== Number(id)));
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
          <h3 className="m-0">Planes de Tarjeta</h3>
          <Badge bg="secondary" className="align-middle">
            {source.length}
          </Badge>
        </div>

        <div className="d-flex gap-2">
          <InputGroup>
            <InputGroup.Text className="d-none d-md-flex">Buscar</InputGroup.Text>
            <Form.Control
              placeholder="Nombre, cuotas, tipo…"
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
            <th>Nombre</th>
            <th>Cuotas</th>
            <th>Tipo cálculo</th>
            <th>Coeficiente</th>
            <th>Tasa mensual</th>
            <th style={{ width: 220 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loadingTabla ? (
            <tr>
              <td colSpan={7} className="text-center">
                <Spinner animation="border" size="sm" className="me-2" /> Cargando…
              </td>
            </tr>
          ) : (
            <>
              {filtrados.map((pl) => (
                <tr key={pl.id}>
                  <td>{pl.id}</td>
                  <td>{pl.nombre}</td>
                  <td>{pl.cuotas}</td>
                  <td>{pl.tipo_calculo}</td>
                  <td>{pl.coeficiente ?? "—"}</td>
                  <td>{pl.tasa_mensual ?? "—"}</td>
                  <td className="text-nowrap">
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => openModalEdit(pl)}
                        className="mx-2"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(pl.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && !loadingTabla && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
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
              {editing ? "Editar Plan" : "Nuevo Plan"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Card className="border-0">
              <Card.Body className="pt-2">
                {formMsg && <Alert variant={formMsg.type} className="py-2">{formMsg.text}</Alert>}
                {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}

                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={saving}
                      required
                      placeholder='Ej: "Ahora 12"'
                    />
                  </Col>

                  <Col md={4}>
                    <Form.Label>Cuotas</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      step={1}
                      value={cuotas}
                      onChange={(e) => setCuotas(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={saving}
                      required
                    />
                  </Col>

                  <Col md={4}>
                    <Form.Label>Tipo de cálculo</Form.Label>
                    <Form.Select
                      value={tipoCalculo}
                      onChange={(e) => setTipoCalculo(e.target.value)}
                      disabled={saving}
                      className="form-control my-input"
                    >
                      <option value="coeficiente">Coeficiente</option>
                      <option value="tasa">Tasa mensual</option>
                    </Form.Select>
                  </Col>

                  {tipoCalculo === "coeficiente" && (
                    <Col md={4}>
                      <Form.Label>Coeficiente</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.000001"
                        value={coeficiente}
                        onChange={(e) => setCoeficiente(e.target.value)}
                        disabled={saving}
                        required
                        placeholder="Ej: 1.234567"
                      />
                    </Col>
                  )}

                  {tipoCalculo === "tasa" && (
                    <Col md={4}>
                      <Form.Label>Tasa mensual</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.0001"
                        value={tasaMensual}
                        onChange={(e) => setTasaMensual(e.target.value)}
                        disabled={saving}
                        required
                        placeholder="Ej: 5.2500"
                      />
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
            <div className="text-muted small">
              {editing ? `Editando ID #${editId}` : "Creación de nuevo plan"}
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
    </div>
  );
};

export default TarjetaPlanPagoList;
