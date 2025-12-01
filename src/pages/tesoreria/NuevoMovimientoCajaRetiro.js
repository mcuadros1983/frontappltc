// src/components/tesoreria/NuevoMovimientoCajaRetiro.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Spinner, ListGroup } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoMovimientoCajaRetiro({
  show,
  onHide,
  onSaved,
  presetFecha,    // "YYYY-MM-DD" (fecha origen)
  presetSucursal, // { id, nombre?/descripcion? } o id
  caja_id,        // viene del padre
  fechaRecepcion, // ← OPCIONAL: cuando estás en “Modo Recepción”
}) {
  const dataContext = useContext(Contexts.DataContext) || {};
  const {
    formasPagoTesoreria = [],
    categoriasIngreso = [],
    // 👇 setters opcionales para refrescar listas
    setCategoriasIngresoTabla,
    setCategoriasIngreso,
  } = dataContext;

  // ==== Helpers
  const fmt = (n) =>
    typeof n === "number" || typeof n === "string"
      ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
      : "";

  // 👉 REFRESCAR categorías de ingreso al abrir el modal
  useEffect(() => {
    if (!show) return;

    let cancelado = false;

    const refrescarCategoriasIngreso = async () => {
      try {
        const res = await fetch(`${apiUrl}/categorias-ingreso`, {
          credentials: "include",
        });
        const json = res.ok ? await res.json() : [];
        const lista = Array.isArray(json) ? json : [];

        if (cancelado) return;

        if (typeof setCategoriasIngresoTabla === "function") {
          setCategoriasIngresoTabla(lista);
        } else if (typeof setCategoriasIngreso === "function") {
          setCategoriasIngreso(lista);
        }
      } catch (err) {
        console.error("Error refrescando categorías de ingreso (retiros):", err);
      }
    };

    refrescarCategoriasIngreso();

    return () => {
      cancelado = true;
    };
  }, [show, setCategoriasIngresoTabla, setCategoriasIngreso]);

  // Resolver formacobro "Caja/Efectivo" desde el contexto
  const formaCobroCajaId = useMemo(() => {
    const t = (s) => String(s || "").toLowerCase();
    const found =
      (formasPagoTesoreria || []).find((f) => /caja/.test(t(f.descripcion))) ||
      (formasPagoTesoreria || []).find((f) => /efectivo/.test(t(f.descripcion)));
    return found?.id || null;
  }, [formasPagoTesoreria]);

  // UI State
  const [fecha, setFecha] = useState(presetFecha || "");
  const [sucursalId, setSucursalId] = useState(
    typeof presetSucursal === "object" ? presetSucursal?.id : presetSucursal
  );
  const [categoriaingreso_id, setCategoriaIngresoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState(null);

  // Lista de sobres (retiros) – en edición guardamos { id?, importe }
  const [sobres, setSobres] = useState([{ importe: "" }]);

  // Modo edición
  const [movimientoId, setMovimientoId] = useState(null);

  // ==== Sub-modal: “Retiros informados” (modelo Retiro)
  const [showInf, setShowInf] = useState(false);
  const [infLoading, setInfLoading] = useState(false);
  const [infError, setInfError] = useState(null);
  const [infItems, setInfItems] = useState([]); // [{id, descripcion, importe, fecha, ...}]
  const [infTotal, setInfTotal] = useState(0);

  // Reset base al abrir
  useEffect(() => {
    if (show) {
      setFecha(presetFecha || "");
      setSucursalId(typeof presetSucursal === "object" ? presetSucursal?.id : presetSucursal);
      setCategoriaIngresoId("");
      setDescripcion("");
      setObservaciones("");
      setSobres([{ importe: "" }]);
      setMsg(null);
      setMovimientoId(null);

      // cerrar submodal por si quedó abierto
      setShowInf(false);
      setInfItems([]);
      setInfError(null);
      setInfTotal(0);
    }
  }, [show, presetFecha, presetSucursal]);

  // Precargar si ya existen retiros para la celda actual (usa SIEMPRE los props)
  useEffect(() => {
    const cargarExistente = async () => {
      if (!show || !presetFecha || !presetSucursal || !caja_id) return;

      const targetFecha = String(presetFecha).slice(0, 10);
      const targetSucursalId =
        typeof presetSucursal === "object" ? presetSucursal.id : presetSucursal;

      try {
        setCargando(true);

        const qs = new URLSearchParams({
          fecha: targetFecha,
          sucursal_id: String(targetSucursalId),
          caja_id: String(caja_id),
        }).toString();

        const res = await fetch(`${apiUrl}/retiros-tesoreria/retiros?${qs}`, {
          credentials: "include",
        });
        const raw = await res.json();
        const listaAll = Array.isArray(raw) ? raw : Array.isArray(raw?.retiros) ? raw.retiros : [];

        const iso = (d) => String(d || "").slice(0, 10);
        // FILTRO ESTRICTO por fecha y sucursal usando los props (no el estado)
        const lista = listaAll.filter(
          (r) => iso(r?.fecha) === targetFecha && Number(r?.sucursal_id) === Number(targetSucursalId)
        );

        if (lista.length > 0) {
          const movId = lista[0]?.movimiento_id || null;
          setMovimientoId(movId);

          const sobresExistentes = lista
            .map((r) => ({
              id: r.id,
              importe: String(Number(r.importe || 0)),
            }))
            .filter((r) => Number(r.importe) > 0);
          setSobres(sobresExistentes.length ? sobresExistentes : [{ importe: "" }]);

          // Traer movimiento para completar encabezado
          if (movId) {
            const r2 = await fetch(`${apiUrl}/movimientos-caja-tesoreria/${movId}`, {
              credentials: "include",
            });
            const mov = await r2.json();
            if (r2.ok && mov) {
              setDescripcion(mov.descripcion || "");
              setObservaciones(mov.observaciones || "");
              setCategoriaIngresoId(mov.categoriaingreso_id ? String(mov.categoriaingreso_id) : "");
              setFecha(mov.fecha || targetFecha); // asegura fecha correcta en el form
            } else {
              setFecha(targetFecha);
            }
          } else {
            setFecha(targetFecha);
          }
          setSucursalId(targetSucursalId);
        } else {
          // No hay datos -> modo crear
          setMovimientoId(null);
          setSobres([{ importe: "" }]);
          setFecha(targetFecha);
          setSucursalId(targetSucursalId);
          setDescripcion("");
          setObservaciones("");
          setCategoriaIngresoId("");
        }
      } catch (e) {
        console.warn("Precarga edición retiros:", e);
      } finally {
        setCargando(false);
      }
    };

    cargarExistente();
    // 👉 Dependencias: props en lugar de los estados derivados
  }, [show, presetFecha, presetSucursal, caja_id]);

  // Validación mínima
  const totalSobres = useMemo(
    () => (sobres || []).reduce((a, r) => a + Number(r.importe || 0), 0),
    [sobres]
  );

  const puedeGuardar = useMemo(() => {
    if (!show) return false;
    if (!caja_id) return false;
    if (!sucursalId) return false;
    if (!fecha) return false;
    if (!formaCobroCajaId) return false;
    if (!categoriaingreso_id) return false; // si querés opcional, quita esta línea

    // Crear: total > 0
    if (!movimientoId && !(totalSobres > 0)) return false;

    // Editar: total > 0 (si queda 0, usar "Eliminar todos")
    if (movimientoId && !(totalSobres > 0)) return false;

    return true;
  }, [show, caja_id, sucursalId, fecha, formaCobroCajaId, totalSobres, movimientoId, categoriaingreso_id]);

  const addSobre = () => setSobres((prev) => [...prev, { importe: "" }]);
  const removeSobre = (idx) =>
    setSobres((prev) => prev.filter((_, i) => i !== idx));
  const updateSobre = (idx, value) =>
    setSobres((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, importe: value } : s))
    );

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMsg(null);
    if (!puedeGuardar) {
      setMsg({ type: "warning", text: "Completá los campos requeridos y al menos un sobre con importe." });
      return;
    }

    try {
      setEnviando(true);

      if (!movimientoId) {
        // CREAR
        const retiros = (sobres || [])
          .map((s) => ({ importe: Number(s.importe || 0) }))
          .filter((r) => r.importe > 0);

        const body = {
          caja_id: Number(caja_id),
          sucursal_id: Number(sucursalId),
          fecha, // fecha ORIGEN
          formacobro_id: Number(formaCobroCajaId),
          categoriaingreso_id: categoriaingreso_id ? Number(categoriaingreso_id) : null,
          descripcion: descripcion?.trim() || null,
          observaciones: observaciones?.trim() || null,
          retiros,
          // ← enviar fecha de recepción sólo si viene
          ...(fechaRecepcion ? { fecha_recepcion: fechaRecepcion } : {}),
        };

        const res = await fetch(`${apiUrl}/retiros-tesoreria/retiros-sucursal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo registrar el/los retiro(s)");
      } else {
        // EDITAR (sync completo por movimiento):
        const retiros = (sobres || [])
          .map((s) => ({
            ...(s.id ? { id: Number(s.id) } : {}),
            importe: Number(s.importe || 0),
          }))
          .filter((r) => r.importe > 0);

        const body = {
          fecha,
          categoriaingreso_id: categoriaingreso_id ? Number(categoriaingreso_id) : null,
          descripcion: descripcion?.trim() || null,
          observaciones: observaciones?.trim() || null,
          retiros,
          ...(fechaRecepcion ? { fecha_recepcion: fechaRecepcion } : {}),
        };

        const res = await fetch(`${apiUrl}/retiros-tesoreria/retiros-sucursal/${movimientoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo actualizar los retiros");
      }

      onSaved?.();
      onHide?.();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarTodos = async () => {
    if (!movimientoId) return;
    if (!window.confirm("Vas a eliminar todos los sobres y el movimiento de caja. ¿Continuar?")) return;
    try {
      setEnviando(true);
      const res = await fetch(`${apiUrl}/retiros-tesoreria/retiros-sucursal/${movimientoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo eliminar");
      onSaved?.();
      onHide?.();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  // ==== Abrir sub-modal y cargar retiros informados (modelo Retiro)
  const openInfModal = async () => {
    const targetFecha = String(presetFecha || fecha || "").slice(0, 10);
    const targetSucursalId =
      typeof presetSucursal === "object" ? presetSucursal.id : (presetSucursal || sucursalId);

    if (!targetFecha || !targetSucursalId) return;

    setShowInf(true);
    setInfLoading(true);
    setInfError(null);
    setInfItems([]);
    setInfTotal(0);

    try {
      const qs = new URLSearchParams({
        sucursal_id: String(targetSucursalId),
        fecha: targetFecha,
      }).toString();

      const r = await fetch(`${apiUrl}/retiros-sucursal-informados?${qs}`, {
        credentials: "include",
      });
      const json = await r.json();

      if (!r.ok) throw new Error(json?.error || "No se pudo obtener retiros informados");

      const items = Array.isArray(json?.retiros) ? json.retiros : Array.isArray(json) ? json : [];
      const norm = items.map((it) => ({
        id: it.id,
        descripcion: it.descripcion || "(sin descripción)",
        importe: Number(it.importe || 0),
        fecha: String(it.fecha || targetFecha).slice(0, 10),
      }));
      const total = norm.reduce((acc, it) => acc + Number(it.importe || 0), 0);

      setInfItems(norm);
      setInfTotal(total);
    } catch (err) {
      setInfError(err.message || "Error inesperado");
    } finally {
      setInfLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {movimientoId ? "Editar Retiro de Sucursal" : "Nuevo Retiro de Sucursal"}
              {fechaRecepcion ? ` · Recepción: ${new Date(fechaRecepcion + "T00:00:00").toLocaleDateString("es-AR")}` : ""}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {cargando && (
              <div className="mb-2">
                <Spinner size="sm" animation="border" className="me-2" />
                Cargando datos…
              </div>
            )}

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Fecha (origen)</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  disabled={!!movimientoId}
                />
                <Form.Text className="text-muted">
                  Caja #{caja_id ?? "-"} · {formaCobroCajaId ? "Caja/Efectivo" : "—"}
                </Form.Text>
              </Col>
              <Col md={5}>
                <Form.Label>Sucursal</Form.Label>
                <Form.Control
                  value={
                    typeof presetSucursal === "object"
                      ? `${presetSucursal?.id} - ${presetSucursal?.nombre || presetSucursal?.descripcion || ""}`.trim()
                      : String(sucursalId || "")
                  }
                  disabled
                />
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button variant="outline-info" className="w-100" onClick={openInfModal}>
                  Ver retiros informados
                </Button>
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
                >
                  <option value="">Seleccione…</option>
                  {(categoriasIngreso || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <div className="mb-2 fw-bold">Sobres (uno por línea)</div>
            {sobres.map((s, idx) => (
              <Row className="g-2 align-items-center mb-2" key={`sobre-${idx}-${s.id ?? "new"}`}>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={s.importe}
                      placeholder="Importe"
                      onChange={(e) => updateSobre(idx, e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md="auto">
                  <Button
                    variant="outline-danger"
                    onClick={() => removeSobre(idx)}
                    disabled={sobres.length === 1}
                    title="Eliminar sobre"
                  >
                    Eliminar
                  </Button>
                </Col>
              </Row>
            ))}

            <Button variant="outline-primary" size="sm" onClick={addSobre} className="mb-3">
              + Agregar otro sobre
            </Button>

            <Row className="mb-3">
              <Col>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder={
                    movimientoId
                      ? "Descripción del movimiento"
                      : `Retiros sucursal ${
                          typeof presetSucursal === "object"
                            ? presetSucursal?.nombre || presetSucursal?.descripcion || presetSucursal?.id
                            : presetSucursal
                        } (${fecha})`
                  }
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </Col>
            </Row>

            {msg && <div className={`alert alert-${msg.type} mt-3 py-2`}>{msg.text}</div>}
          </Modal.Body>

          <Modal.Footer className="justify-content-between">
            {movimientoId ? (
              <Button variant="outline-danger" onClick={handleEliminarTodos} disabled={enviando}>
                {enviando ? "Eliminando…" : "Eliminar todos los sobres y el movimiento"}
              </Button>
            ) : (
              <div />
            )}

            <div>
              <Button variant="outline-secondary" onClick={onHide} disabled={enviando}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={!puedeGuardar || enviando} className="mx-2">
                {enviando ? "Guardando…" : movimientoId ? "Guardar cambios" : "Guardar"}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Sub-modal: Retiros informados */}
      <Modal show={showInf} onHide={() => setShowInf(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Retiros informados por la sucursal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2 text-muted">
            {typeof presetSucursal === "object"
              ? `Sucursal: ${presetSucursal?.nombre || presetSucursal?.descripcion || presetSucursal?.id}`
              : `Sucursal: ${sucursalId}`}{" "}
            · Fecha origen: {String(presetFecha || fecha || "").slice(0, 10)}
          </div>

          {infLoading && (
            <div className="mb-2">
              <Spinner size="sm" animation="border" className="me-2" />
              Cargando retiros…
            </div>
          )}

          {infError && <div className="alert alert-danger py-2">{infError}</div>}

          {!infLoading && !infError && (
            <>
              {infItems.length === 0 ? (
                <div className="text-muted">No hay retiros informados para esta fecha y sucursal.</div>
              ) : (
                <ListGroup className="mb-3">
                  {infItems.map((it) => (
                    <ListGroup.Item key={it.id}>
                      <div className="d-flex justify-content-between">
                        <div className="me-3">{it.descripcion}</div>
                        <div className="fw-semibold">{fmt(it.importe)}</div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              <div className="d-flex justify-content-end">
                <span className="fw-bold">Total informado:&nbsp;{fmt(infTotal)}</span>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowInf(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
