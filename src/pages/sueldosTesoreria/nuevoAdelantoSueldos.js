import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoAdelantoSueldos({ show, onHide, onCreated }) {
  const data = useContext(Contexts.DataContext) || {};
  const {
    empresaSeleccionada,
    cajaAbierta,
    empleados = [],
    formasPagoTesoreria = [],
    bancosTabla = [],
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
  } = data;

  const empresa_id = empresaSeleccionada?.id || null;
  const caja_id = cajaAbierta?.caja?.id || null;

  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [empleado_id, setEmpleadoId] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [formapago_id, setFormapagoId] = useState("");
  const [banco_id, setBancoId] = useState("");
  const [categoriaegreso_id, setCategoriaId] = useState("");
  const [imputacioncontable_id, setImputacionId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState(null);

  // Empleados aplanados
  const listaEmpleados = useMemo(() => {
    return (empleados || [])
      .map((row) => {
        const e = row?.empleado || row;
        const p = row?.clientePersona || null;
        const id = e?.id ?? row?.id ?? null;
        if (!id) return null;
        const apellido = e?.apellido ?? p?.apellido ?? "";
        const nombre = e?.nombre ?? p?.nombre ?? "";
        const label =
          [apellido, nombre].filter(Boolean).join(", ") ||
          e?.razonSocial ||
          `Empleado #${id}`;
        return { id, label };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [empleados]);

  // Categorías (preferir tabla)
  const categoriasAll = useMemo(
    () => (categoriasEgresoTabla?.length ? categoriasEgresoTabla : categoriasEgreso) || [],
    [categoriasEgresoTabla, categoriasEgreso]
  );

  // Pre-seleccionar categoría "Sueldos/Adelantos"
  useEffect(() => {
    if (!show) return;
    if (!categoriaegreso_id && categoriasAll.length) {
      const c = categoriasAll.find((x) => /sueldo|jornal|remuneraci|adelanto/i.test(String(x.nombre || "")));
      if (c?.id) setCategoriaId(String(c.id));
    }
  }, [show, categoriasAll, categoriaegreso_id]);

  // Derivar imputación desde categoría
  useEffect(() => {
    if (!categoriaegreso_id) return setImputacionId("");
    const cat = (categoriasAll || []).find((c) => Number(c.id) === Number(categoriaegreso_id));
    setImputacionId(cat?.imputacioncontable_id ? String(cat.imputacioncontable_id) : "");
  }, [categoriaegreso_id, categoriasAll]);

  // Detectar medio desde forma de pago
  const formaCajaId = useMemo(() => {
    const m = (formasPagoTesoreria || []).find((f) => /(caja|efectivo)/i.test(String(f.descripcion || "")));
    return m?.id || null;
  }, [formasPagoTesoreria]);

  const formaBancoId = useMemo(() => {
    const m = (formasPagoTesoreria || []).find((f) => /(transfer|banco)/i.test(String(f.descripcion || "")));
    return m?.id || null;
  }, [formasPagoTesoreria]);

  // ⬇️ Mostrar solo Efectivo y Transferencias en el combo
  const filteredFormasPago = useMemo(() => {
    return (formasPagoTesoreria || []).filter((f) =>
      /(efectivo|transfer)/i.test(String(f.descripcion || ""))
    );
  }, [formasPagoTesoreria]);



  const medioDetectado = useMemo(() => {
    if (!formapago_id) return "";
    if (Number(formapago_id) === Number(formaCajaId)) return "caja";
    if (Number(formapago_id) === Number(formaBancoId)) return "banco";
    const fp = (formasPagoTesoreria || []).find((f) => Number(f.id) === Number(formapago_id));
    const desc = String(fp?.descripcion || "");
    if (/(caja|efectivo)/i.test(desc)) return "caja";
    if (/(transfer|banco)/i.test(desc)) return "banco";
    return "";
  }, [formapago_id, formaCajaId, formaBancoId, formasPagoTesoreria]);

  // Bancos de la empresa
  const bancosEmpresa = useMemo(() => {
    if (!empresa_id) return [];
    return (bancosTabla || []).filter((b) => Number(b.empresa_id) === Number(empresa_id));
  }, [bancosTabla, empresa_id]);

  // Autoselect banco si hay solo uno
  useEffect(() => {
    if (medioDetectado === "banco" && !banco_id && bancosEmpresa.length === 1) {
      setBancoId(String(bancosEmpresa[0].id));
    }
  }, [medioDetectado, bancosEmpresa, banco_id]);

  // Validaciones
  const puedeGuardar = useMemo(() => {
    if (!show) return false;
    if (!empresa_id) return false;
    if (!fecha) return false;
    if (!empleado_id) return false;
    const n = Number(monto);
    if (!(n > 0)) return false;
    if (!formapago_id) return false;
    if (!categoriaegreso_id) return false; // imputación la deriva backend si faltara

    if (!medioDetectado) return false;
    if (medioDetectado === "caja" && !caja_id) return false;
    if (medioDetectado === "banco" && !banco_id) return false;

    return true;
  }, [show, empresa_id, fecha, empleado_id, monto, formapago_id, categoriaegreso_id, medioDetectado, caja_id, banco_id]);

  const limpiar = () => {
    setFecha(new Date().toISOString().slice(0, 10));
    setEmpleadoId("");
    setMonto("");
    setObservaciones("");
    setFormapagoId("");
    setBancoId("");
    setCategoriaId("");
    setImputacionId("");
    setMsg(null);
  };

  const handleClose = () => { if (!enviando) { limpiar(); onHide?.(); } };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMsg(null);
    if (!puedeGuardar) {
      setMsg({ type: "warning", text: "Completá los campos requeridos." });
      return;
    }
    try {
      setEnviando(true);

      const payload = {
        empresa_id,
        medio: medioDetectado,                              // 'caja' | 'banco'
        ...(medioDetectado === "caja" ? { caja_id: Number(caja_id) } : {}),
        ...(medioDetectado === "banco" ? { banco_id: Number(banco_id) } : {}),
        adelanto: {
          empleado_id: Number(empleado_id),
          fecha,
          monto: Number(monto),
          observaciones: observaciones?.trim() || null,
          formapago_id: Number(formapago_id),
          categoriaegreso_id: Number(categoriaegreso_id),
          imputacioncontable_id: imputacioncontable_id ? Number(imputacioncontable_id) : null,
        },
      };

      const res = await fetch(`${apiUrl}/adelantosempleado/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo registrar el adelanto");

      onCreated?.(json);
      handleClose();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Adelanto de Sueldo</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!empresa_id && (
            <Alert variant="warning" className="py-2">
              Seleccioná una empresa para continuar.
            </Alert>
          )}
          {medioDetectado === "caja" && !caja_id && (
            <Alert variant="warning" className="py-2">
              No hay caja abierta. Abrí una caja para pagar en efectivo.
            </Alert>
          )}
          {msg && (
            <Alert variant={msg.type} className="py-2" onClose={() => setMsg(null)} dismissible>
              {msg.text}
            </Alert>
          )}

          {/* Fecha + Empleado */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </Col>
            <Col md={8}>
              <Form.Label>Empleado</Form.Label>
              <Form.Select
                value={empleado_id}
                onChange={(e) => setEmpleadoId(e.target.value)}
                required
                className="form-control my-input"
              >
                <option value="">Seleccione…</option>
                {listaEmpleados.map((e) => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Monto + Forma de pago (medio detectado) */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Forma de pago</Form.Label>
              <Form.Select
                value={formapago_id}
                onChange={(e) => setFormapagoId(e.target.value)}
                required
                className="form-control my-input"
              >
                <option value="">Seleccione…</option>
                {(filteredFormasPago || []).map((f) => (
                  <option key={f.id} value={f.id}>{f.descripcion}</option>
                ))}

              </Form.Select>
              <small className="text-muted d-block mt-1">
                Medio detectado:{" "}
                {medioDetectado
                  ? (medioDetectado === "caja"
                    ? `Caja/Efectivo${caja_id ? ` · Caja #${caja_id}` : ""}`
                    : "Banco/Transferencia")
                  : "— seleccione forma de pago —"}
              </small>
            </Col>
          </Row>

          {/* Banco (si banco) */}
          {medioDetectado === "banco" && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Banco</Form.Label>
                <Form.Select
                  value={banco_id}
                  onChange={(e) => setBancoId(e.target.value)}
                  required
                  className="form-control my-input"
                  disabled={!empresa_id}
                >
                  <option value="">{empresa_id ? "Seleccione…" : "Seleccione empresa primero"}</option>
                  {(bancosTabla || [])
                    .filter((b) => Number(b.empresa_id) === Number(empresa_id))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Observaciones (opcional)</Form.Label>
                <Form.Control
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: adelanto quincena"
                />
              </Col>
            </Row>
          )}

          {/* Observaciones (si caja) */}
          {medioDetectado === "caja" && (
            <Row className="mb-3">
              <Col md={12}>
                <Form.Label>Observaciones (opcional)</Form.Label>
                <Form.Control
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: adelanto quincena"
                />
              </Col>
            </Row>
          )}

          {/* Categoría + Imputación */}
          <Row className="mb-0">
            <Col md={6}>
              <Form.Label>Categoría de Egreso</Form.Label>
              <Form.Select
                value={categoriaegreso_id}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
                className="form-control my-input"
              >
                <option value="">Seleccione…</option>
                {(categoriasAll || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">La imputación se deriva automáticamente.</Form.Text>
            </Col>
            <Col md={6}>
              <Form.Label>Imputación (derivada)</Form.Label>
              <Form.Control value={imputacioncontable_id || ""} readOnly />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={!puedeGuardar || enviando}>
            {enviando ? (<><Spinner size="sm" animation="border" className="me-2" /> Guardando…</>) : ("Guardar")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
