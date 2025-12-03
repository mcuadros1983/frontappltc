// src/components/tesoreria/NuevoMovimientoCheques.js
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoMovimientoCheques({ show, onHide, onCreated }) {
  const data = useContext(Contexts.DataContext) || {};
  const {
    empresaSeleccionada,
    bancosTabla = [],
    proveedoresTabla = [],
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
    proyectosTabla = [],

    // 👇 setters para refrescar lookups al abrir el modal
    setBancosTabla,
    setProveedoresTabla,
    setCategoriasEgresoTabla,
    setCategoriasEgreso,
    setProyectosTabla,
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
        proveedoresApi,
        categoriasApi,
        proyectosApi,
      ] = await Promise.all([
        fetchJsonSafe(`${apiUrl}/bancos`),
        fetchJsonSafe(`${apiUrl}/proveedores`),
        fetchJsonSafe(`${apiUrl}/categorias-egreso`),
        fetchJsonSafe(`${apiUrl}/proyectos`),
      ]);

      if (cancelado) return;

      if (typeof setBancosTabla === "function") setBancosTabla(bancosApi);
      if (typeof setProveedoresTabla === "function") setProveedoresTabla(proveedoresApi);

      if (typeof setCategoriasEgresoTabla === "function") {
        setCategoriasEgresoTabla(categoriasApi);
      } else if (typeof setCategoriasEgreso === "function") {
        setCategoriasEgreso(categoriasApi);
      }

      if (typeof setProyectosTabla === "function") setProyectosTabla(proyectosApi);
    };

    cargarLookups();

    return () => {
      cancelado = true;
    };
  }, [
    show,
    setBancosTabla,
    setProveedoresTabla,
    setCategoriasEgresoTabla,
    setCategoriasEgreso,
    setProyectosTabla,
  ]);

  // Listas
  const categorias = useMemo(
    () => (categoriasEgresoTabla?.length ? categoriasEgresoTabla : categoriasEgreso) || [],
    [categoriasEgresoTabla, categoriasEgreso]
  );

  const bancosEmpresa = useMemo(() => {
    if (!empresa_id) return [];
    return (bancosTabla || []).filter((b) => Number(b.empresa_id) === Number(empresa_id));
  }, [bancosTabla, empresa_id]);

  // 👉 Proveedores ordenados alfabéticamente
  const proveedoresOrdenados = useMemo(() => {
    return [...(proveedoresTabla || [])].sort((a, b) => {
      const nA = (a.razonsocial || a.nombre || a.descripcion || "").toLowerCase();
      const nB = (b.razonsocial || b.nombre || b.descripcion || "").toLowerCase();
      return nA.localeCompare(nB);
    });
  }, [proveedoresTabla]);

  // UI
  const [tipo, setTipo] = useState("egresos"); // 'egresos' | 'anticipo'
  const [fecha_emision, setFechaEmision] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [fecha_vencimiento, setFechaVencimiento] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [descripcion, setDescripcion] = useState("");
  const [importe, setImporte] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [proveedor_id, setProveedorId] = useState("");
  const [proyecto_id, setProyectoId] = useState(""); // requerido (alineado con banco/caja/tarjeta)
  const [categoriaegreso_id, setCategoriaId] = useState("");
  const [imputacioncontable_id, setImputacionId] = useState("");
  const [banco_id, setBancoId] = useState("");
  const [numero_echeq, setNumeroEcheq] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState(null);

  // Derivar imputación desde categoría
  useEffect(() => {
    if (!categoriaegreso_id) {
      setImputacionId("");
      return;
    }
    const cat = (categorias || []).find((c) => Number(c.id) === Number(categoriaegreso_id));
    setImputacionId(cat?.imputacioncontable_id ? String(cat.imputacioncontable_id) : "");
  }, [categoriaegreso_id, categorias]);

  // Validaciones
  const vtoAnterior = useMemo(() => {
    if (!fecha_emision || !fecha_vencimiento) return false;
    return new Date(fecha_vencimiento) < new Date(fecha_emision);
  }, [fecha_emision, fecha_vencimiento]);

  const puedeGuardar = useMemo(() => {
    if (!show) return false;
    if (!empresa_id) return false;
    if (!banco_id) return false;
    if (!fecha_emision || !fecha_vencimiento) return false;
    if (vtoAnterior) return false;
    if (!descripcion?.trim()) return false;
    const n = Number(importe);
    if (!(n > 0)) return false;
    if (!proveedor_id) return false;
    if (!categoriaegreso_id) return false;
    if (!proyecto_id) return false;
    return true;
  }, [
    show,
    empresa_id,
    banco_id,
    fecha_emision,
    fecha_vencimiento,
    vtoAnterior,
    descripcion,
    importe,
    proveedor_id,
    categoriaegreso_id,
    proyecto_id,
  ]);

  const limpiar = () => {
    setTipo("egresos");
    const hoy = new Date().toISOString().slice(0, 10);
    setFechaEmision(hoy);
    setFechaVencimiento(hoy);
    setDescripcion("");
    setImporte("");
    setObservaciones("");
    setProveedorId("");
    setProyectoId("");
    setCategoriaId("");
    setImputacionId("");
    setBancoId("");
    setNumeroEcheq("");
    setMsg(null);
  };

  const handleClose = () => {
    if (!enviando) {
      limpiar();
      onHide?.();
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMsg(null);
    if (!puedeGuardar) {
      setMsg({
        type: "warning",
        text: vtoAnterior
          ? "La fecha de vencimiento no puede ser anterior a la emisión."
          : "Completá los campos requeridos.",
      });
      return;
    }

    try {
      setEnviando(true);

      if (tipo === "anticipo") {
        // ANTICIPO A PROVEEDORES (eCheq)
        const payload = {
          empresa_id,
          proveedor_id: Number(proveedor_id),
          fecha: fecha_emision, // fecha de OP = emisión por defecto
          observaciones: observaciones?.trim() || null,
          pago: {
            banco_id: Number(banco_id),
            importe: Number(importe),
            fecha_emision,
            fecha_vencimiento,
            concepto: descripcion?.trim(),
            numero_echeq: numero_echeq || null,
            categoriaegreso_id: Number(categoriaegreso_id),
            imputacioncontable_id: imputacioncontable_id
              ? Number(imputacioncontable_id)
              : null,
            proyecto_id: Number(proyecto_id),
          },
        };

        const res = await fetch(`${apiUrl}/echeqs-emitidos/anticiposaproveedores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "No se pudo registrar el anticipo por eCheq");
        onCreated?.(json);
        handleClose();
        return;
      }

      // EGRESOS VARIOS (eCheq)
      const payload = {
        empresa_id,
        egreso: {
          fecha_emision,
          fecha_vencimiento,
          banco_id: Number(banco_id),
          proveedor_id: Number(proveedor_id),
          importe: Number(importe),
          numero_echeq: numero_echeq || null,
          concepto: descripcion?.trim(),
          observaciones: observaciones?.trim() || null,
          categoriaegreso_id: Number(categoriaegreso_id),
          imputacioncontable_id: imputacioncontable_id
            ? Number(imputacioncontable_id)
            : null,
          proyecto_id: Number(proyecto_id),
        },
      };

      const res = await fetch(`${apiUrl}/echeqs-emitidos/egresos-independientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo registrar el eCheq");
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
          <Modal.Title>Nuevo eCheq Emitido</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!empresa_id && (
            <Alert variant="warning" className="py-2">
              Seleccioná una empresa para continuar.
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

          {/* 1) Tipo + Banco */}
          <Row className="mb-3">
            <Col md={8}>
              <Form.Label>Tipo de movimiento</Form.Label>
              <div className="d-flex flex-wrap align-items-center" style={{ gap: 16 }}>
                <Form.Check
                  inline
                  type="radio"
                  id="tipo-egresos"
                  name="tipo"
                  label="Egresos varios (eCheq)"
                  value="egresos"
                  checked={tipo === "egresos"}
                  onChange={(e) => setTipo(e.target.value)}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="tipo-anticipo"
                  name="tipo"
                  label="Anticipo a Proveedores (eCheq)"
                  value="anticipo"
                  checked={tipo === "anticipo"}
                  onChange={(e) => setTipo(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <Form.Label>Banco</Form.Label>
              <Form.Select
                value={banco_id}
                onChange={(e) => setBancoId(e.target.value)}
                required
                disabled={!empresa_id}
                className="form-control my-input"
              >
                <option value="">
                  {empresa_id ? "Seleccione…" : "Seleccione empresa primero"}
                </option>
                {bancosEmpresa.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* 2) Fechas */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Fecha de emisión</Form.Label>
              <Form.Control
                type="date"
                value={fecha_emision}
                onChange={(e) => setFechaEmision(e.target.value)}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Fecha de vencimiento</Form.Label>
              <Form.Control
                type="date"
                value={fecha_vencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                required
                isInvalid={!!fecha_vencimiento && !!fecha_emision && vtoAnterior}
              />
              {vtoAnterior && (
                <div className="invalid-feedback d-block">
                  La fecha de vencimiento no puede ser anterior a la fecha de emisión.
                </div>
              )}
            </Col>
          </Row>

          {/* 3) Proveedor + Proyecto */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Proveedor</Form.Label>
              {Array.isArray(proveedoresOrdenados) && proveedoresOrdenados.length > 0 ? (
                <Form.Select
                  value={proveedor_id}
                  onChange={(e) => setProveedorId(e.target.value)}
                  required
                  className="form-control my-input"
                >
                  <option value="">Seleccione…</option>
                  {proveedoresOrdenados.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.razonsocial ||
                        p.nombre ||
                        p.descripcion ||
                        `Proveedor #${p.id}`}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="number"
                  placeholder="ID proveedor"
                  value={proveedor_id}
                  onChange={(e) => setProveedorId(e.target.value)}
                  required
                />
              )}
            </Col>
            <Col md={6}>
              <Form.Label>Proyecto</Form.Label>
              {Array.isArray(proyectosTabla) && proyectosTabla.length > 0 ? (
                <Form.Select
                  value={proyecto_id}
                  onChange={(e) => setProyectoId(e.target.value)}
                  required
                  className="form-control my-input"
                >
                  <option value="">Seleccione…</option>
                  {proyectosTabla.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.descripcion || p.nombre || `Proyecto #${p.id}`}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="number"
                  placeholder="ID proyecto"
                  value={proyecto_id}
                  onChange={(e) => setProyectoId(e.target.value)}
                  required
                />
              )}
            </Col>
          </Row>

          {/* 4) Número + Importe */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Número eCheq</Form.Label>
              <Form.Control
                placeholder="(Opcional)"
                value={numero_echeq}
                onChange={(e) => setNumeroEcheq(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Importe</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                required
              />
            </Col>
          </Row>

          {/* 5) Categoría + Descripción */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Categoría de Egreso</Form.Label>
              <Form.Select
                value={categoriaegreso_id}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
                className="form-control my-input"
              >
                <option value="">Seleccione…</option>
                {(categorias || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                La imputación contable se deriva automáticamente de la categoría.
              </Form.Text>
            </Col>
            <Col md={6}>
              <Form.Label>Descripción / Concepto</Form.Label>
              <Form.Control
                placeholder={
                  tipo === "anticipo"
                    ? "Anticipo / concepto"
                    : "Descripción del gasto/servicio"
                }
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </Col>
          </Row>

          {/* 6) Observaciones */}
          <Form.Group className="mb-0">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="(Opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </Form.Group>

          {/* mantener derivación visible */}
          <input type="hidden" value={imputacioncontable_id || ""} readOnly />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={!puedeGuardar || enviando}>
            {enviando ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" /> Guardando…
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
