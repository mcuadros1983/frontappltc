// src/pages/tesoreria/NuevoMovimientoCajaIngreso.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner, Tabs, Tab } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoMovimientoCajaIngreso({ show, onHide, onCreated }) {
  const data = useContext(Contexts.DataContext) || {};
  const {
    empresaSeleccionada,
    cajaAbierta,

    // Datos para Cobranza Clientes
    clientes = [],
    setClientes,

    proyectosTabla = [],
    setProyectosTabla,

    // Categorías de ingreso
    categoriasIngresoTabla = [],
    categoriasIngreso = [],
    setCategoriasIngresoTabla,
    setCategoriasIngreso,

    // Para detectar "Caja / Efectivo"
    formasPagoTesoreria = [],
  } = data;

  const empresa_id = empresaSeleccionada?.id || null;
  const caja_id = cajaAbierta?.caja?.id || null;

  // ====== UI general
  const [activeKey, setActiveKey] = useState("cobranza"); // "varios" | "cobranza"
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState(null);

  // ====== Campos comunes
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Cobranza Clientes / Varios
  const [clienteId, setClienteId] = useState("");
  const [proyecto_id, setProyectoId] = useState(""); // opcional (string vacío = null)
  const [categoriaingreso_id, setCategoriaIngresoId] = useState("");

  // Idempotencia (opcional)
  const [idempotencyKey, setIdempotencyKey] = useState("");

  // ====== REFRESCAR DATOS AL ABRIR MODAL (clientes, proyectos, categorías ingreso)
  useEffect(() => {
    if (!show) return;

    let cancelado = false;

    const refrescarListas = async () => {
      try {
        const [resCli, resProy, resCat] = await Promise.all([
          fetch(`${apiUrl}/clientes`, { credentials: "include" }),
          fetch(`${apiUrl}/proyectos`, { credentials: "include" }),
          fetch(`${apiUrl}/categorias-ingreso`, { credentials: "include" }),
        ]);

        const [dataCli = [], dataProy = [], dataCat = []] = await Promise.all([
          resCli.ok ? resCli.json() : Promise.resolve([]),
          resProy.ok ? resProy.json() : Promise.resolve([]),
          resCat.ok ? resCat.json() : Promise.resolve([]),
        ]);

        if (cancelado) return;

        if (typeof setClientes === "function") {
          setClientes(Array.isArray(dataCli) ? dataCli : []);
        }
        if (typeof setProyectosTabla === "function") {
          setProyectosTabla(Array.isArray(dataProy) ? dataProy : []);
        }
        if (typeof setCategoriasIngresoTabla === "function") {
          setCategoriasIngresoTabla(Array.isArray(dataCat) ? dataCat : []);
        } else if (typeof setCategoriasIngreso === "function") {
          // fallback si usás el otro nombre
          setCategoriasIngreso(Array.isArray(dataCat) ? dataCat : []);
        }
      } catch (err) {
        console.error("Error refrescando clientes/proyectos/categorías ingreso:", err);
      }
    };

    refrescarListas();

    return () => {
      cancelado = true;
    };
  }, [show, setClientes, setProyectosTabla, setCategoriasIngresoTabla, setCategoriasIngreso]);

  // ==== Resolver forma de cobro "Caja / Efectivo"
  const formaCobroCajaId = useMemo(() => {
    const text = (s) => String(s || "").toLowerCase();
    const found =
      (formasPagoTesoreria || []).find((f) => /caja/.test(text(f.descripcion))) ||
      (formasPagoTesoreria || []).find((f) => /efectivo/.test(text(f.descripcion)));
    return found?.id || null;
  }, [formasPagoTesoreria]);

  // ==== categorías ingreso visibles
  const catIngreso =
    Array.isArray(categoriasIngresoTabla) && categoriasIngresoTabla.length
      ? categoriasIngresoTabla
      : Array.isArray(categoriasIngreso)
      ? categoriasIngreso
      : [];

  // ===== Validaciones (Proyecto NO es requerido)
  const puedeGuardarCobranza = useMemo(() => {
    if (!show) return false;
    if (!empresa_id || !caja_id) return false;
    if (!clienteId) return false;
    if (!fecha) return false;
    if (!descripcion?.trim()) return false;
    const n = Number(monto);
    if (!(n > 0)) return false;
    if (!formaCobroCajaId) return false;
    if (!categoriaingreso_id) return false; // ahora requerida
    return true;
  }, [show, empresa_id, caja_id, clienteId, fecha, descripcion, monto, formaCobroCajaId, categoriaingreso_id]);

  const puedeGuardarVarios = useMemo(() => {
    if (!show) return false;
    if (!empresa_id || !caja_id) return false;
    if (!fecha) return false;
    if (!descripcion?.trim()) return false;
    const n = Number(monto);
    if (!(n > 0)) return false;
    if (!categoriaingreso_id) return false; // requerido para “varios”
    if (!formaCobroCajaId) return false;
    return true;
  }, [show, empresa_id, caja_id, fecha, descripcion, monto, categoriaingreso_id, formaCobroCajaId]);

  const handleSubmitVarios = async (e) => {
    e?.preventDefault?.();
    setMsg(null);

    if (!puedeGuardarVarios) {
      setMsg({ type: "warning", text: "Completá los campos requeridos." });
      return;
    }

    try {
      setEnviando(true);

      const payload = {
        empresa_id: Number(empresa_id),
        caja_id: Number(caja_id),
        fecha,
        descripcion: descripcion?.trim(),
        montoTotal: Number(monto),
        proyecto_id: proyecto_id ? Number(proyecto_id) : null,
        categoriaingreso_id: Number(categoriaingreso_id),
        observaciones: observaciones?.trim() || null,
        formacobro_id: Number(formaCobroCajaId),
        idempotencyKey: idempotencyKey?.trim() || null,
      };

      const res = await fetch(`${apiUrl}/movimientos-caja-tesoreria/ingresos/varios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo registrar el ingreso");

      onCreated?.(json);
      handleClose();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  const limpiar = () => {
    setActiveKey("cobranza");
    setFecha(new Date().toISOString().slice(0, 10));
    setDescripcion("");
    setMonto("");
    setObservaciones("");
    setClienteId("");
    setProyectoId("");
    setCategoriaIngresoId("");
    setIdempotencyKey("");
    setMsg(null);
  };

  const handleClose = () => {
    if (!enviando) {
      limpiar();
      onHide?.();
    }
  };

  // ====== SUBMIT COBRANZA CLIENTES
  const handleSubmitCobranza = async (e) => {
    e?.preventDefault?.();
    setMsg(null);

    if (!puedeGuardarCobranza) {
      setMsg({ type: "warning", text: "Completá los campos requeridos." });
      return;
    }

    try {
      setEnviando(true);

      const payload = {
        empresa_id: Number(empresa_id),
        caja_id: Number(caja_id),
        clienteId: Number(clienteId),
        fecha,
        descripcion: descripcion?.trim(),
        montoTotal: Number(monto),
        proyecto_id: proyecto_id ? Number(proyecto_id) : null,
        categoriaingreso_id: categoriaingreso_id ? Number(categoriaingreso_id) : null,
        observaciones: observaciones?.trim() || null,
        formacobro_id: Number(formaCobroCajaId),
        idempotencyKey: idempotencyKey?.trim() || null,
      };

      const res = await fetch(
        `${apiUrl}/movimientos-caja-tesoreria/ingresos/cobranza-clientes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo registrar la cobranza");

      onCreated?.(json);
      handleClose();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  // ====== UI ======
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Form
        noValidate
        onSubmit={
          activeKey === "cobranza"
            ? handleSubmitCobranza
            : activeKey === "varios"
            ? handleSubmitVarios
            : (e) => e.preventDefault()
        }
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Ingreso de Caja</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!empresa_id && (
            <Alert variant="warning" className="py-2">
              Seleccioná una empresa para continuar.
            </Alert>
          )}
          {!caja_id && (
            <Alert variant="warning" className="py-2">
              No hay caja abierta. Abrí una caja para registrar ingresos en efectivo.
            </Alert>
          )}
          {!formaCobroCajaId && (
            <Alert variant="warning" className="py-2">
              No se encontró una forma de pago “Caja” o “Efectivo” en el sistema. Creá/Configura una en Tesorería.
            </Alert>
          )}
          {msg && (
            <Alert
              variant={msg.type}
              dismissible
              onClose={() => setMsg(null)}
              className="py-2"
            >
              {msg.text}
            </Alert>
          )}

          <Tabs
            id="tabs-nuevo-ingreso-caja"
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
            className="mb-3"
            mountOnEnter
            justify
          >
            {/* ======= Ingresos Varios ======= */}
            <Tab eventKey="varios" title="Ingresos Varios">
              {/* Proyecto (opcional) */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Proyecto (opcional)</Form.Label>
                  <Form.Select
                    name="varios_proyecto"
                    value={proyecto_id}
                    onChange={(e) => setProyectoId(e.target.value)}
                    disabled={activeKey !== "varios"}
                    className="form-control my-input"
                  >
                    <option value="">(Opcional) Sin proyecto</option>
                    {(proyectosTabla || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.descripcion || p.nombre || `Proyecto #${p.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {/* Fecha - Descripción - Monto */}
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    name="varios_fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required={activeKey === "varios"}
                    disabled={activeKey !== "varios"}
                  />
                  <small className="text-muted d-block mt-1">
                    Caja #{caja_id ?? "-"} · {formaCobroCajaId ? "Caja/Efectivo" : "—"}
                  </small>
                </Col>
                <Col md={6}>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    name="varios_descripcion"
                    placeholder="Concepto del ingreso"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required={activeKey === "varios"}
                    disabled={activeKey !== "varios"}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Monto</Form.Label>
                  <Form.Control
                    name="varios_monto"
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    required={activeKey === "varios"}
                    disabled={activeKey !== "varios"}
                  />
                </Col>
              </Row>

              {/* Categoría de Ingreso (requerida en varios) */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Categoría de Ingreso</Form.Label>
                  <Form.Select
                    name="varios_categoria"
                    value={categoriaingreso_id}
                    onChange={(e) => setCategoriaIngresoId(e.target.value)}
                    className="form-control my-input"
                    required={activeKey === "varios"}
                    disabled={activeKey !== "varios"}
                  >
                    <option value="">Seleccione…</option>
                    {catIngreso.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {/* Observaciones */}
              <Form.Group className="mb-0">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  name="varios_observaciones"
                  as="textarea"
                  rows={2}
                  placeholder="(Opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={activeKey !== "varios"}
                />
              </Form.Group>
            </Tab>

            {/* ======= Cobranza Clientes ======= */}
            <Tab eventKey="cobranza" title="Cobranza Clientes">
              {/* Cliente + Proyecto */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select
                    name="cobranza_cliente"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required={activeKey === "cobranza"}
                    disabled={activeKey !== "cobranza"}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione…</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonsocial || c.nombre || `Cliente #${c.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Proyecto (opcional)</Form.Label>
                  <Form.Select
                    name="cobranza_proyecto"
                    value={proyecto_id}
                    onChange={(e) => setProyectoId(e.target.value)}
                    disabled={activeKey !== "cobranza"}
                    className="form-control my-input"
                  >
                    <option value="">(Opcional) Sin proyecto</option>
                    {(proyectosTabla || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.descripcion || p.nombre || `Proyecto #${p.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {/* Fecha + Descripción + Monto */}
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    name="cobranza_fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required={activeKey === "cobranza"}
                    disabled={activeKey !== "cobranza"}
                  />
                  <small className="text-muted d-block mt-1">
                    Caja #{caja_id ?? "-"} · {formaCobroCajaId ? "Caja/Efectivo" : "—"}
                  </small>
                </Col>
                <Col md={6}>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    name="cobranza_descripcion"
                    placeholder="Concepto de la cobranza (ej. Cobro factura 0001-000123)"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required={activeKey === "cobranza"}
                    disabled={activeKey !== "cobranza"}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Monto</Form.Label>
                  <Form.Control
                    name="cobranza_monto"
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    required={activeKey === "cobranza"}
                    disabled={activeKey !== "cobranza"}
                  />
                </Col>
              </Row>

              {/* Categoría Ingreso (requerida ahora en cobranza también) */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Categoría de Ingreso</Form.Label>
                  <Form.Select
                    name="cobranza_categoria"
                    value={categoriaingreso_id}
                    onChange={(e) => setCategoriaIngresoId(e.target.value)}
                    className="form-control my-input"
                    disabled={activeKey !== "cobranza"}
                    required={activeKey === "cobranza"}
                  >
                    <option value="">Seleccione…</option>
                    {catIngreso.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {/* Observaciones */}
              <Form.Group className="mb-0">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  name="cobranza_observaciones"
                  as="textarea"
                  rows={2}
                  placeholder="(Opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={activeKey !== "cobranza"}
                />
              </Form.Group>
            </Tab>
          </Tabs>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type={activeKey === "cobranza" || activeKey === "varios" ? "submit" : "button"}
            disabled={
              enviando ||
              (activeKey === "cobranza" && !puedeGuardarCobranza) ||
              (activeKey === "varios" && !puedeGuardarVarios)
            }
          >
            {enviando ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Guardando…
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
