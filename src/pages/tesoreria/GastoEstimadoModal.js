import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

async function fetchEmpresas() {
  const r = await fetch(`${apiUrl}/empresas`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener empresas");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchProveedores() {
  const r = await fetch(`${apiUrl}/proveedores`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener proveedores");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchCategoriasEgreso() {
  const r = await fetch(`${apiUrl}/categorias-egreso`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener categorías");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchSucursales() {
  const r = await fetch(`${apiUrl}/sucursales`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener sucursales");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchTiposComprobante() {
  const r = await fetch(`${apiUrl}/tipos-comprobantes`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener tipos de comprobante");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchFormasPago() {
  const r = await fetch(`${apiUrl}/formas-pago-tesoreria`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener formas de pago");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function crearGastoEstimado(payload) {
  const r = await fetch(`${apiUrl}/gasto-estimado`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || "No se pudo crear la estimación");
  }
  return r.json();
}

async function actualizarGastoEstimado(id, payload) {
  const r = await fetch(`${apiUrl}/gasto-estimado/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || "No se pudo actualizar la estimación");
  }
  return r.json();
}

export default function GastoEstimadoModal({ show, onHide, initialData, onSaved, empresaId }) {
  const isEdit = Boolean(initialData?.id);

  const [empresas, setEmpresas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [formasPago, setFormasPago] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // form state (modelo Plantilla)
  const [empresaSel, setEmpresaSel] = useState("");                 // NUEVO
  const [descripcion, setDescripcion] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [tipoComprobanteId, setTipoComprobanteId] = useState("");
  const [formaPagoId, setFormaPagoId] = useState("");

  const [periodicidad, setPeriodicidad] = useState("mensual");
  const [diaVencDef, setDiaVencDef] = useState("");
  const [montoEstimadoDef, setMontoEstimadoDef] = useState("");

  const [requiereFactura, setRequiereFactura] = useState(false);
  const [activo, setActivo] = useState(true);
  const [observaciones, setObservaciones] = useState("");

  // cargar catálogos
  useEffect(() => {
    if (!show) return;
    let cancel = false;
    (async () => {
      try {
        const [emps, prov, cat, sucs, tc, fp] = await Promise.all([
          fetchEmpresas(),
          fetchProveedores(),
          fetchCategoriasEgreso(),
          fetchSucursales(),
          fetchTiposComprobante(),
          fetchFormasPago(),
        ]);
        if (!cancel) {
          setEmpresas(emps);
          setProveedores(prov);
          setCategorias(cat);
          setSucursales(sucs);
          setTipos(tc);
          setFormasPago(fp);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancel = true; };
  }, [show]);

  // inicializar/limpiar formulario
  useEffect(() => {
    if (!show) return;
    if (isEdit) {
      setEmpresaSel(initialData.empresa_id ? String(initialData.empresa_id) : "");
      setDescripcion(initialData.descripcion || "");
      setProveedorId(initialData.proveedor_id || "");
      setCategoriaId(initialData.categoriaegreso_id || "");
      setSucursalId(initialData.sucursal_id || "");
      setTipoComprobanteId(initialData.tipocomprobante_id || "");
      setFormaPagoId(initialData.formapago_id || "");
      setPeriodicidad(initialData.periodicidad || "mensual");
      setDiaVencDef(initialData.dia_vencimiento_default ?? "");
      setMontoEstimadoDef(String(initialData.monto_estimado_default ?? ""));
      setRequiereFactura(Boolean(initialData.requiere_factura));
      setActivo(initialData.activo !== false);
      setObservaciones(initialData.observaciones || "");
    } else {
      setEmpresaSel(empresaId ? String(empresaId) : ""); // preselección opcional
      setDescripcion("");
      setProveedorId("");
      setCategoriaId("");
      setSucursalId("");
      setTipoComprobanteId("");
      setFormaPagoId("");
      setPeriodicidad("mensual");
      setDiaVencDef("");
      setMontoEstimadoDef("");
      setRequiereFactura(false);
      setActivo(true);
      setObservaciones("");
    }
    setErr(null);
  }, [show, isEdit, initialData, empresaId]);

  const guardar = async () => {
    try {
      setErr(null); setLoading(true);
      if (!descripcion) throw new Error("Completá la descripción");
      if (!periodicidad) throw new Error("Indicá la periodicidad");
      // empresaSel es OPCIONAL: si no se elige, va null
      const payload = {
        empresa_id: empresaSel ? Number(empresaSel) : null,
        proveedor_id: proveedorId ? Number(proveedorId) : null,
        categoriaegreso_id: categoriaId ? Number(categoriaId) : null,
        descripcion: descripcion || null,
        periodicidad,
        dia_vencimiento_default: diaVencDef ? Number(diaVencDef) : null,
        monto_estimado_default: montoEstimadoDef ? Number(montoEstimadoDef) : null,
        sucursal_id: sucursalId ? Number(sucursalId) : null,
        tipocomprobante_id: tipoComprobanteId ? Number(tipoComprobanteId) : null,
        formapago_id: formaPagoId ? Number(formaPagoId) : null,
        requiere_factura: Boolean(requiereFactura),
        activo: Boolean(activo),
        observaciones: observaciones || null,
      };

      if (isEdit) {
        await actualizarGastoEstimado(initialData.id, payload);
      } else {
        await crearGastoEstimado(payload);
      }
      if (onSaved) onSaved();
    } catch (e) {
      setErr(e.message || "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar estimación" : "Nueva estimación"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        <Form>
          <Row className="g-3">
            {/* Empresa (opcional) */}
            <Col md={6}>
              <Form.Label>Empresa</Form.Label>
              <Form.Select value={empresaSel} onChange={(e)=>setEmpresaSel(e.target.value)} className="form-control my-input">
                <option value="">Sin empresa</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombrecorto || emp.descripcion || `Empresa ${emp.id}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Descripción</Form.Label>
              <Form.Control value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} placeholder="Ej: Telefonía móvil sucursales" />
            </Col>

            <Col md={6}>
              <Form.Label>Proveedor</Form.Label>
              <Form.Select value={proveedorId} onChange={(e)=>setProveedorId(e.target.value)} className="form-control my-input">
                <option value="">Sin proveedor</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Categoría</Form.Label>
              <Form.Select value={categoriaId} onChange={(e)=>setCategoriaId(e.target.value)} className="form-control my-input">
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Sucursal</Form.Label>
              <Form.Select value={sucursalId} onChange={(e)=>setSucursalId(e.target.value)} className="form-control my-input">
                <option value="">Sin sucursal</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre || s.descripcion || `Sucursal ${s.id}`}</option>)}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Tipo de comprobante (opcional)</Form.Label>
              <Form.Select value={tipoComprobanteId} onChange={(e)=>setTipoComprobanteId(e.target.value)} className="form-control my-input">
                <option value="">—</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Forma de pago (opcional)</Form.Label>
              <Form.Select value={formaPagoId} onChange={(e)=>setFormaPagoId(e.target.value)} className="form-control my-input">
                <option value="">—</option>
                {formasPago.map(f => <option key={f.id} value={f.id}>{f.descripcion || f.nombre || `#${f.id}`}</option>)}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Periodicidad</Form.Label>
              <Form.Select value={periodicidad} onChange={(e)=>setPeriodicidad(e.target.value)} className="form-control my-input">
                <option value="unico">Único</option>
                <option value="mensual">Mensual</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label>Día de vencimiento</Form.Label>
              <Form.Control type="number" min={1} max={31} value={diaVencDef} onChange={(e)=>setDiaVencDef(e.target.value)} />
            </Col>

            <Col md={3}>
              <Form.Label>Monto estimado</Form.Label>
              <Form.Control type="number" step="0.01" value={montoEstimadoDef} onChange={(e)=>setMontoEstimadoDef(e.target.value)} />
            </Col>

            <Col md={3} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                id="req-factura"
                label="Requiere factura"
                checked={requiereFactura}
                onChange={(e) => setRequiereFactura(e.target.checked)}
              />
            </Col>

            <Col md={3} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                id="activo"
                label="Activo"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
              />
            </Col>

            <Col md={12}>
              <Form.Label>Observaciones</Form.Label>
              <Form.Control as="textarea" rows={2} value={observaciones} onChange={(e)=>setObservaciones(e.target.value)} />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={guardar} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
