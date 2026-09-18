// src/components/tesoreria/NuevoMovimientoBancoIngreso.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner, Tabs, Tab } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoMovimientoBancoIngreso({ show, onHide, onCreated }) {
  const data = useContext(Contexts.DataContext) || {};
  const {
    empresaSeleccionada,
    // Bancos / cuentas bancarias para elegir destino del dinero
    bancosTabla = [],
    bancos = [],
    // Datos para Cobranza
    clientes = [],
    proyectosTabla = [],
    // Categorías de ingreso
    categoriasIngreso = [],
    // Formas de pago (para banco: transferencia/depósito/cheque, etc.)
    formasPagoTesoreria = [],

    // 👇 setters para refrescar lookups cuando se abre el modal
    setBancosTabla,
    setBancos,
    setClientes,
    setProyectosTabla,
    setCategoriasIngreso,
    setFormasPagoTesoreria,
  } = data;

  const empresa_id = empresaSeleccionada?.id || null;

  // ====== REFRESH DE LOOKUPS AL ABRIR ======
  useEffect(() => {
    if (!show) return;

    let cancelado = false;

    const fetchJsonSafe = async (url, def = []) => {
      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) return def;
        const json = await res.json();
        return Array.isArray(json) ? json : def;
      } catch (err) {
        console.error("Error en fetchJsonSafe:", url, err);
        return def;
      }
    };

    const cargarLookups = async () => {
      // 🔹 Ajustá estas rutas a tu API real
      const [
        bancosApi,
        clientesApi,
        proyectosApi,
        categoriasApi,
        formasApi,
      ] = await Promise.all([
        fetchJsonSafe(`${apiUrl}/bancos`),        // bancos / cuentas bancarias
        fetchJsonSafe(`${apiUrl}/clientes`),                // clientes
        fetchJsonSafe(`${apiUrl}/proyectos`),               // proyectos
        fetchJsonSafe(`${apiUrl}/categorias-ingreso`),      // categorías de ingreso
        fetchJsonSafe(`${apiUrl}/formas-pago-tesoreria`),   // formas de pago tesorería
      ]);

      if (cancelado) return;

      if (typeof setBancosTabla === "function") setBancosTabla(bancosApi);
      else if (typeof setBancos === "function") setBancos(bancosApi);

      if (typeof setClientes === "function") setClientes(clientesApi);
      if (typeof setProyectosTabla === "function") setProyectosTabla(proyectosApi);
      if (typeof setCategoriasIngreso === "function") setCategoriasIngreso(categoriasApi);
      if (typeof setFormasPagoTesoreria === "function") setFormasPagoTesoreria(formasApi);
    };

    cargarLookups();

    return () => {
      cancelado = true;
    };
  }, [
    show,
    setBancosTabla,
    setBancos,
    setClientes,
    setProyectosTabla,
    setCategoriasIngreso,
    setFormasPagoTesoreria,
  ]);

  // ====== UI general
  const [activeKey, setActiveKey] = useState("varios"); // "varios" | "cobranza"
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState(null);

  // ====== Campos comunes
  const [banco_id, setBancoId] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [proyecto_id, setProyectoId] = useState("");
  const [categoriaingreso_id, setCategoriaIngresoId] = useState("");

  // Cobranza Clientes
  const [clienteId, setClienteId] = useState("");

  // Idempotencia (opcional)
  const [idempotencyKey, setIdempotencyKey] = useState("");

  // ==== Resolver forma de cobro "banco" (p.ej. transferencia/depósito)
  const formaCobroBancoId = useMemo(() => {
    const text = (s) => String(s || "").toLowerCase();
    const arr = Array.isArray(formasPagoTesoreria) ? formasPagoTesoreria : [];
    const found =
      arr.find((f) => /transfer/.test(text(f.descripcion))) ||
      arr.find((f) => /dep[óo]sito/.test(text(f.descripcion))) ||
      arr.find((f) => /banco/.test(text(f.descripcion))) ||
      arr.find((f) => /cheque/.test(text(f.descripcion)));
    return found?.id || null;
  }, [formasPagoTesoreria]);

  // Listas normalizadas
  const catIngreso = Array.isArray(categoriasIngreso) ? categoriasIngreso : [];
  const cuentasBancoAll = bancosTabla?.length ? bancosTabla : bancos;

  // 🔎 Filtrar bancos por empresa seleccionada
  const cuentasBanco = useMemo(() => {
    if (!empresa_id) return [];
    const arr = Array.isArray(cuentasBancoAll) ? cuentasBancoAll : [];
    return arr.filter((b) => Number(b?.empresa_id) === Number(empresa_id));
  }, [cuentasBancoAll, empresa_id]);

  // Si cambia la empresa o la lista filtrada, asegurar que banco_id siga siendo válido
  useEffect(() => {
    if (!show) return;
    if (!empresa_id) {
      setBancoId("");
      return;
    }
    if (banco_id && !cuentasBanco.some((b) => String(b.id) === String(banco_id))) {
      setBancoId("");
    }
  }, [show, empresa_id, cuentasBanco, banco_id]);

  // ====== Validaciones
  const puedeGuardarVarios = useMemo(() => {
    if (!show) return false;
    if (!empresa_id || !banco_id) return false;
    if (!fecha) return false;
    if (!descripcion?.trim()) return false;
    const n = Number(monto);
    if (!(n > 0)) return false;
    if (!categoriaingreso_id) return false; // si lo querés opcional, quitá esta línea
    if (!formaCobroBancoId) return false;
    return true;
  }, [show, empresa_id, banco_id, fecha, descripcion, monto, categoriaingreso_id, formaCobroBancoId]);

  const puedeGuardarCobranza = useMemo(() => {
    if (!show) return false;
    if (!empresa_id || !banco_id) return false;
    if (!clienteId) return false;
    if (!fecha) return false;
    if (!descripcion?.trim()) return false;
    const n = Number(monto);
    if (!(n > 0)) return false;
    if (!categoriaingreso_id) return false; // si lo querés opcional, quitá esta línea
    if (!formaCobroBancoId) return false;
    return true;
  }, [show, empresa_id, banco_id, clienteId, fecha, descripcion, monto, categoriaingreso_id, formaCobroBancoId]);

  // ====== Handlers de submit
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
        banco_id: Number(banco_id),
        fecha,
        descripcion: descripcion?.trim(),
        montoTotal: Number(monto),
        proyecto_id: proyecto_id ? Number(proyecto_id) : null,
        categoriaingreso_id: categoriaingreso_id ? Number(categoriaingreso_id) : null,
        observaciones: observaciones?.trim() || null,
        formapago_id: Number(formaCobroBancoId),
        idempotencyKey: idempotencyKey?.trim() || null,
      };

      const res = await fetch(`${apiUrl}/movimientos-banco-tesoreria/ingresos/varios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo registrar el ingreso en banco");

      onCreated?.(json);
      handleClose();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

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
        banco_id: Number(banco_id),
        clienteId: Number(clienteId),
        fecha,
        descripcion: descripcion?.trim(),
        montoTotal: Number(monto),
        proyecto_id: proyecto_id ? Number(proyecto_id) : null,
        categoriaingreso_id: categoriaingreso_id ? Number(categoriaingreso_id) : null,
        observaciones: observaciones?.trim() || null,
        formapago_id: Number(formaCobroBancoId),
        idempotencyKey: idempotencyKey?.trim() || null,
      };

      const res = await fetch(`${apiUrl}/movimientos-banco-tesoreria/ingresos/cobranza-clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo registrar la cobranza en banco");

      onCreated?.(json);
      handleClose();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  // ====== Helpers
  const limpiar = () => {
    setActiveKey("varios");
    setFecha(new Date().toISOString().slice(0, 10));
    setDescripcion("");
    setMonto("");
    setObservaciones("");
    setProyectoId("");
    setCategoriaIngresoId("");
    setClienteId("");
    setBancoId("");
    setIdempotencyKey("");
    setMsg(null);
  };

  const handleClose = () => {
    if (enviando) {
      return;
    }

    onHide?.();
  };

  // ====== UI ======
  const sinEmpresa = !empresa_id;
  const sinBancosEmpresa = empresa_id && cuentasBanco.length === 0;

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
          <Modal.Title>Nuevo Ingreso Bancario</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {sinEmpresa && (
            <Alert variant="warning" className="py-2">
              Seleccioná una empresa para continuar.
            </Alert>
          )}

          {empresa_id && !formaCobroBancoId && (
            <Alert variant="warning" className="py-2">
              No se encontró una forma de pago de banco (Transferencia/Depósito/Cheque) en el sistema.
              Configurá una en Tesorería.
            </Alert>
          )}

          {sinBancosEmpresa && (
            <Alert variant="info" className="py-2">
              No hay bancos/cuentas asociados a la empresa seleccionada.
            </Alert>
          )}

          {msg && (
            <Alert
              variant={msg.type}
              className="py-2"
              onClose={() => setMsg(null)}
              dismissible
            >
              {msg.text}
            </Alert>
          )}

          <Tabs
            id="tabs-nuevo-ingreso-banco"
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
            className="mb-3"
            mountOnEnter
            justify
          >
            {/* ======= Ingresos Varios (Banco) ======= */}
            <Tab eventKey="varios" title="Ingresos Varios">
              {/* Banco */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Banco / Cuenta</Form.Label>
                  <Form.Select
                    value={banco_id}
                    onChange={(e) => setBancoId(e.target.value)}
                    required
                    className="form-control my-input"
                    disabled={sinEmpresa || sinBancosEmpresa}
                  >
                    <option value="">Seleccione…</option>
                    {cuentasBanco.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre || b.descripcion || b.alias || `Banco #${b.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Proyecto (opcional)</Form.Label>
                  {Array.isArray(proyectosTabla) && proyectosTabla.length > 0 ? (
                    <Form.Select
                      value={proyecto_id}
                      onChange={(e) => setProyectoId(e.target.value)}
                      className="form-control my-input"
                      disabled={sinEmpresa}
                    >
                      <option value="">(Ninguno)</option>
                      {proyectosTabla.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.descripcion || p.nombre || `Proyecto #${p.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="text"
                      value=""
                      readOnly
                      placeholder="No hay proyectos cargados"
                    />
                  )}
                </Col>
              </Row>

              {/* Fecha - Descripción - Monto */}
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    disabled={sinEmpresa}
                  />
                  <small className="text-muted d-block mt-1">
                    Forma: {formaCobroBancoId ? "Transferencia/Depósito" : "—"}
                  </small>
                </Col>
                <Col md={6}>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    placeholder="Concepto del ingreso"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    disabled={sinEmpresa}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Monto</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    required
                    disabled={sinEmpresa}
                  />
                </Col>
              </Row>

              {/* Categoría de Ingreso */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Categoría de Ingreso</Form.Label>
                  <Form.Select
                    value={categoriaingreso_id}
                    onChange={(e) => setCategoriaIngresoId(e.target.value)}
                    className="form-control my-input"
                    required
                    disabled={sinEmpresa}
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
                  as="textarea"
                  rows={2}
                  placeholder="(Opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={sinEmpresa}
                />
              </Form.Group>
            </Tab>

            {/* ======= Cobranza Clientes (Banco) ======= */}
            <Tab eventKey="cobranza" title="Cobranza Clientes">
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Cliente</Form.Label>
                  {/* 👇 siempre Form.Select (sin ingreso manual) */}
                  <Form.Select
                    name="cobranza_cliente"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required={activeKey === "cobranza"}
                    disabled={activeKey !== "cobranza" || sinEmpresa}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione…</option>
                    {(Array.isArray(clientes) ? clientes : []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonsocial || c.nombre || `Cliente #${c.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label>Banco / Cuenta</Form.Label>
                  <Form.Select
                    value={banco_id}
                    onChange={(e) => setBancoId(e.target.value)}
                    required
                    className="form-control my-input"
                    disabled={sinEmpresa || sinBancosEmpresa}
                  >
                    <option value="">Seleccione…</option>
                    {cuentasBanco.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre || b.descripcion || b.alias || `Banco #${b.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    disabled={sinEmpresa}
                  />
                  <small className="text-muted d-block mt-1">
                    Forma: {formaCobroBancoId ? "Transferencia/Depósito" : "—"}
                  </small>
                </Col>
                <Col md={6}>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    placeholder="Concepto de la cobranza (ej. Cobro transf 0001)"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    disabled={sinEmpresa}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Monto</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    required
                    disabled={sinEmpresa}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Categoría de Ingreso</Form.Label>
                  <Form.Select
                    value={categoriaingreso_id}
                    onChange={(e) => setCategoriaIngresoId(e.target.value)}
                    className="form-control my-input"
                    required
                    disabled={sinEmpresa}
                  >
                    <option value="">Seleccione…</option>
                    {catIngreso.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Proyecto (opcional)</Form.Label>
                  {Array.isArray(proyectosTabla) && proyectosTabla.length > 0 ? (
                    <Form.Select
                      value={proyecto_id}
                      onChange={(e) => setProyectoId(e.target.value)}
                      className="form-control my-input"
                      disabled={sinEmpresa}
                    >
                      <option value="">(Ninguno)</option>
                      {proyectosTabla.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.descripcion || p.nombre || `Proyecto #${p.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="text"
                      value=""
                      readOnly
                      placeholder="No hay proyectos cargados"
                    />
                  )}
                </Col>
              </Row>

              <Form.Group className="mb-0">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="(Opcional)"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={sinEmpresa}
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
