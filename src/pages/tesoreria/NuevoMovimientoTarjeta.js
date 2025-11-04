// src/components/tesoreria/NuevoMovimientoTarjeta.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner, Table } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoMovimientoTarjeta({ show, onHide, onCreated }) {
  const data = useContext(Contexts.DataContext) || {};
  const {
    empresaSeleccionada,
    categoriasEgresoTabla = [],
    categoriasEgreso = [],
    proveedoresTabla = [],
    proyectosTabla = [],
    bancosTabla = [],
    planTarjetaTesoreriaTabla = [],
  } = data;

  const empresa_id = empresaSeleccionada?.id || null;

  // Listas desde contexto
  const categorias = useMemo(
    () => (categoriasEgresoTabla?.length ? categoriasEgresoTabla : categoriasEgreso) || [],
    [categoriasEgresoTabla, categoriasEgreso]
  );
  const planesPago = useMemo(() => planTarjetaTesoreriaTabla || [], [planTarjetaTesoreriaTabla]);

  // UI
  const [tipo, setTipo] = useState("egresos"); // 'egresos' | 'anticipo'
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [proveedor_id, setProveedorId] = useState("");
  const [proyecto_id, setProyectoId] = useState(""); // requerido (como en caja/banco)
  const [categoriaegreso_id, setCategoriaId] = useState("");
  const [imputacioncontable_id, setImputacionId] = useState("");

  // Tarjeta
  const [tarjetas, setTarjetas] = useState([]);
  const [tarjetacomun_id, setTarjetaId] = useState("");
  const [terminacionFiltro, setTerminacionFiltro] = useState("");

  // Otros campos de tarjeta
  const [cupon_numero, setCuponNumero] = useState("");
  const [planpago_id, setPlanPagoId] = useState("");

  // 🔹 Flujo mensual (multi-asignación, igual a Caja/Banco)
  const [esPagoMensual, setEsPagoMensual] = useState(false);
  const [instanciasMensuales, setInstanciasMensuales] = useState([]);
  const [loadingMensual, setLoadingMensual] = useState(false);
  const [errMensual, setErrMensual] = useState(null);
  const [cancelarRenovacion, setCancelarRenovacion] = useState(false);

  // Selecciones: [{id, monto}]
  const [selecciones, setSelecciones] = useState([]);

  // Estado envío
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState(null);

  // Derivar imputación desde categoría
  useEffect(() => {
    if (!categoriaegreso_id) { setImputacionId(""); return; }
    const cat = (categorias || []).find((c) => Number(c.id) === Number(categoriaegreso_id));
    setImputacionId(cat?.imputacioncontable_id ? String(cat.imputacioncontable_id) : "");
  }, [categoriaegreso_id, categorias]);

  // Cargar tarjetas por empresa (y filtro por terminación opcional)
  const loadTarjetas = async () => {
    if (!empresa_id) { setTarjetas([]); return; }
    const qs = new URLSearchParams();
    qs.set("empresa_id", empresa_id);
    if (terminacionFiltro) qs.set("terminacion", String(terminacionFiltro).padStart(4, "0"));

    try {
      const res = await fetch(`${apiUrl}/tarjetas-comunes?${qs.toString()}`, { credentials: "include" });
      const json = await res.json();
      setTarjetas(Array.isArray(json) ? json : []);
    } catch (e) {
      console.warn("⚠️ No se pudieron cargar tarjetas:", e.message);
      setTarjetas([]);
    }
  };

  useEffect(() => {
    if (show) loadTarjetas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, empresa_id]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => { loadTarjetas(); }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminacionFiltro]);

  // ==== Helpers mensual ====
  const ymFromDate = (d) => (String(d || "").slice(0, 7)); // 'YYYY-MM'
  const toMoney = (n) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  async function buscarInstanciasMensuales({ proveedorId, fechaStr }) {
    const qs = new URLSearchParams();
    if (proveedorId) qs.set("proveedor_id", String(proveedorId));
    const url = `${apiUrl}/gasto-estimado/instancias?${qs.toString()}`;

    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error("No se pudieron buscar instancias mensuales");
    const arr = await r.json();
    return (Array.isArray(arr) ? arr : [])
      .filter(x => x.estado !== "pagado" && x.estado !== "anulado");
  }

  async function aplicarPagoAInstancia(instanciaId, payload) {
    const r = await fetch(`${apiUrl}/gasto-estimado/instancias/${instanciaId}/pagos`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(json?.error || "No se pudo aplicar el pago a la instancia mensual");
    return json;
  }

  // Buscar instancias cuando: esPagoMensual ON y hay proveedor/fecha y tipo==='egresos'
  useEffect(() => {
    (async () => {
      setErrMensual(null);
      setInstanciasMensuales([]);
      setSelecciones([]);
      setCancelarRenovacion(false);

      if (!show) return;
      if (tipo !== "egresos") return;
      if (!esPagoMensual) return;
      if (!proveedor_id || !fecha) return;

      try {
        setLoadingMensual(true);
        const items = await buscarInstanciasMensuales({
          proveedorId: Number(proveedor_id),
          fechaStr: fecha,
        });
        setInstanciasMensuales(items || []);

        if (items && items.length > 0) {
          // Prefill no intrusivo (como en Caja/Banco)
          const ordered = [...items].sort((a, b) =>
            String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento))
          );
          const inst0 = ordered[0];
          if (!descripcion?.trim() && inst0?.descripcion) setDescripcion(inst0.descripcion);
          if (!categoriaegreso_id && inst0?.categoriaegreso_id) setCategoriaId(String(inst0.categoriaegreso_id));
        }
      } catch (e) {
        setErrMensual(e.message || "No se pudieron recuperar instancias mensuales");
      } finally {
        setLoadingMensual(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, tipo, esPagoMensual, proveedor_id, fecha]);

  // ==== Selecciones helpers ====
  const getSel = (id) => selecciones.find((s) => String(s.id) === String(id));
  const setMontoSeleccion = (id, value) => {
    const v = value === "" ? "" : String(value).replace(",", ".");
    setSelecciones((prev) => {
      const idx = prev.findIndex((s) => String(s.id) === String(id));
      if (idx === -1) return [...prev, { id, monto: v }];
      const next = [...prev];
      next[idx] = { ...next[idx], monto: v };
      return next;
    });
  };
  const toggleSeleccion = (id, checked, defaultMonto = "") => {
    setSelecciones((prev) => {
      const exists = prev.some((s) => String(s.id) === String(id));
      if (checked && !exists) return [...prev, { id, monto: defaultMonto }];
      if (!checked && exists) return prev.filter((s) => String(s.id) !== String(id));
      return prev;
    });
  };
  const seleccionarTodo = () => {
    const all = instanciasMensuales.map((it) => {
      const base = Number(it.monto_real ?? it.monto_estimado ?? 0);
      const pagado = Number(it.monto_pagado || 0);
      const saldo = Math.max(0, base - pagado);
      // por defecto proponemos saldo (puede ser superado por el usuario)
      const def = saldo > 0 ? String(saldo) : String(base);
      return { id: it.id, monto: def };
    });
    setSelecciones(all);
  };
  const seleccionarNinguno = () => setSelecciones([]);

  const totalAsignado = useMemo(
    () => selecciones.reduce((acc, s) => acc + Number(s.monto || 0), 0),
    [selecciones]
  );

  // 👉 Monto efectivo del movimiento: si es mensual, usa la suma asignada
  const montoMovimiento = useMemo(
    () => (tipo === "egresos" && esPagoMensual ? totalAsignado : Number(monto || 0)),
    [tipo, esPagoMensual, totalAsignado, monto]
  );

  // 👉 Mantener “monto” sincronizado cuando es mensual (para payload/UI)
  useEffect(() => {
    if (tipo === "egresos" && esPagoMensual) {
      setMonto(totalAsignado ? String(totalAsignado) : "");
    }
  }, [tipo, esPagoMensual, totalAsignado]);

  // Helpers para armar referencia del movimiento de tarjeta
  function resolverReferenciaTarjeta(json) {
    if (json?.id) return { tipo: "PagoTarjetaCredito", id: json.id };
    if (json?.pagoTarjeta?.id) return { tipo: "PagoTarjetaCredito", id: json.pagoTarjeta.id };
    if (json?.movimientoTarjeta?.id) return { tipo: "MovimientoTarjetaTesoreria", id: json.movimientoTarjeta.id };
    if (json?.movimiento?.id) return { tipo: "MovimientoTarjetaTesoreria", id: json.movimiento.id };
    if (json?.pago?.id) return { tipo: "PagoTarjetaCredito", id: json.pago.id };
    if (json?.registro?.id) return { tipo: "PagoTarjetaCredito", id: json.registro.id };
    return { tipo: "PagoTarjetaCredito", id: null };
  }

  // Validaciones
  const puedeGuardar = useMemo(() => {
    if (!show) return false;
    if (!empresa_id) return false;
    if (!fecha) return false;
    if (!descripcion?.trim()) return false;

    if (!tarjetacomun_id) return false;
    if (!proveedor_id) return false;
    if (!categoriaegreso_id) return false;
    if (!proyecto_id) return false;

    const nMonto = montoMovimiento;

    if (tipo === "egresos" && esPagoMensual) {
      if (!(totalAsignado > 0)) return false;   // debe asignar algo
      if (totalAsignado > nMonto) return false; // seguridad (deberían ser iguales)
    } else {
      if (!(nMonto > 0)) return false;
    }
    return true;
  }, [
    show, empresa_id, fecha, descripcion,
    tarjetacomun_id, proveedor_id, categoriaegreso_id, proyecto_id,
    tipo, esPagoMensual, totalAsignado, montoMovimiento
  ]);

  const limpiar = () => {
    setTipo("egresos");
    setFecha(new Date().toISOString().slice(0, 10));
    setDescripcion("");
    setMonto("");
    setObservaciones("");
    setProveedorId("");
    setProyectoId("");
    setCategoriaId("");
    setImputacionId("");
    setTarjetaId("");
    setTerminacionFiltro("");
    setCuponNumero("");
    setPlanPagoId("");

    // mensual
    setEsPagoMensual(false);
    setInstanciasMensuales([]);
    setSelecciones([]);
    setCancelarRenovacion(false);
    setErrMensual(null);

    setMsg(null);
  };

  const handleClose = () => { if (!enviando) { limpiar(); onHide?.(); } };

  // Submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMsg(null);
    if (!puedeGuardar) {
      setMsg({ type: "warning", text: "Completá los campos requeridos." });
      return;
    }

    // Validaciones de multi-asignación:
    if (tipo === "egresos" && esPagoMensual && selecciones.length > 0) {
      for (const sel of selecciones) {
        const toApply = Number(sel.monto || 0);
        if (!(toApply > 0)) {
          return setMsg({ type: "warning", text: `Ingresá un monto válido para la instancia #${sel.id}.` });
        }
      }
      if (totalAsignado > montoMovimiento) {
        return setMsg({ type: "warning", text: "El total asignado supera el monto del movimiento." });
      }
    }

    try {
      setEnviando(true);

      if (tipo === "anticipo") {
        // ANTICIPO A PROVEEDORES (Tarjeta)
        const payload = {
          empresa_id,
          proveedor_id: Number(proveedor_id),
          fecha,
          observaciones: observaciones?.trim() || null,
          pagos: [
            {
              tarjetacomun_id: Number(tarjetacomun_id),
              monto: Number(montoMovimiento),
              detalle: descripcion?.trim(),
              proyecto_id: Number(proyecto_id),
              categoriaegreso_id: Number(categoriaegreso_id),
              imputacioncontable_id: imputacioncontable_id ? Number(imputacioncontable_id) : null,
              cupon_numero: cupon_numero || null,
              planpago_id: planpago_id ? Number(planpago_id) : null,
            },
          ],
        };

        const res = await fetch(`${apiUrl}/pagos-tarjeta/anticiposaproveedores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo registrar el anticipo");

        onCreated?.(json);
        handleClose();
        return;
      }

      // EGRESOS VARIOS (Tarjeta)
      const payload = {
        empresa_id,
        egreso: {
          fecha,
          tarjetacomun_id: Number(tarjetacomun_id),
          importe: Number(montoMovimiento),
          proveedor_id: Number(proveedor_id),
          proyecto_id: Number(proyecto_id),
          categoriaegreso_id: Number(categoriaegreso_id),
          imputacioncontable_id: imputacioncontable_id ? Number(imputacioncontable_id) : null,
          concepto: descripcion?.trim(),
          observaciones: observaciones?.trim() || null,
          cupon_numero: cupon_numero || null,
          planpago_id: planpago_id ? Number(planpago_id) : null,
        },
      };

      const res = await fetch(`${apiUrl}/pagos-tarjeta/egresos-independientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo registrar el egreso");

      // 🔹 Asociar a gastos mensuales (multi) SI corresponde
      if (tipo === "egresos" && esPagoMensual && selecciones.length > 0) {
        const { tipo: refTipo, id: refId } = resolverReferenciaTarjeta(json);
        if (refId == null) throw new Error("No se recibió el id del pago de tarjeta.");

        const tasks = selecciones.map((sel) =>
          aplicarPagoAInstancia(sel.id, {
            referencia_tipo: refTipo,       // "PagoTarjetaCredito"
            referencia_id: refId,
            formapago_id: null,             // opcional
            fecha_aplicacion: fecha,
            monto_aplicado: Number(sel.monto || 0),
            observaciones: observaciones?.trim() || descripcion?.trim() || null,
            cancelar_renovacion: !!cancelarRenovacion,
          }).then(
            () => ({ id: sel.id, ok: true }),
            (err) => ({ id: sel.id, ok: false, error: err?.message || "Error aplicando pago" })
          )
        );

        const results = await Promise.allSettled(tasks);
        const fails = results
          .map((r) => (r.status === "fulfilled" ? r.value : { ok: false, error: r.reason?.message }))
          .filter((x) => !x.ok);

        if (fails.length > 0) {
          setMsg({
            type: "warning",
            text: `Egreso registrado. No se pudo aplicar el pago a ${fails.length} instancia(s).`,
          });
        }
      }

      onCreated?.(json);
      handleClose();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  // Render
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Movimiento con Tarjeta</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!empresa_id && (
            <Alert variant="warning" className="py-2">Seleccioná una empresa para continuar.</Alert>
          )}
          {msg && (
            <Alert variant={msg.type} className="py-2" onClose={() => setMsg(null)} dismissible>
              {msg.text}
            </Alert>
          )}

          {/* 1) Tipo + Fecha */}
          <Row className="mb-3">
            <Col md={8}>
              <Form.Label>Tipo de movimiento</Form.Label>
              <div className="d-flex flex-wrap align-items-center" style={{ gap: 16 }}>
                <Form.Check
                  inline type="radio" id="tipo-egresos" name="tipo"
                  label="Egresos varios (Tarjeta)"
                  value="egresos"
                  checked={tipo === "egresos"}
                  onChange={(e) => setTipo(e.target.value)}
                />
                <Form.Check
                  inline type="radio" id="tipo-anticipo" name="tipo"
                  label="Anticipo a Proveedores (Tarjeta)"
                  value="anticipo"
                  checked={tipo === "anticipo"}
                  onChange={(e) => setTipo(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </Col>
          </Row>

          {/* 2) Tarjeta + filtro por terminación */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Filtrar por terminación</Form.Label>
              <Form.Control
                placeholder="Últimos 4 (ej: 1234)"
                maxLength={4}
                value={terminacionFiltro}
                onChange={(e) => setTerminacionFiltro(e.target.value.replace(/\D/g, "").slice(0, 4))}
                disabled={!empresa_id || enviando}
              />
            </Col>
            <Col md={8}>
              <Form.Label>Tarjeta</Form.Label>
              <Form.Select
                value={tarjetacomun_id}
                onChange={(e) => setTarjetaId(e.target.value)}
                required
                disabled={!empresa_id || tarjetas.length === 0 || enviando}
                className="form-control my-input"
              >
                <option value="">{tarjetas.length ? "Seleccione…" : "No hay tarjetas disponibles"}</option>
                {tarjetas.map((t) => {
                  const banco = bancosTabla.find((b) => Number(b.id) === Number(t.banco_id));
                  const bancoTxt = banco?.nombre || banco?.descripcion || banco?.alias || "";
                  return (
                    <option key={t.id} value={t.id}>
                      ****{t.terminacion} {bancoTxt ? `· ${bancoTxt}` : ""} {t.marca_id ? `· Marca #${t.marca_id}` : ""} {t.tipotarjeta_id ? `· Tipo #${t.tipotarjeta_id}` : ""}
                    </option>
                  );
                })}
              </Form.Select>
            </Col>
          </Row>

          {/* 3) Proveedor + Proyecto */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Proveedor</Form.Label>
              {(Array.isArray(proveedoresTabla) && proveedoresTabla.length > 0) ? (
                <Form.Select
                  value={proveedor_id}
                  onChange={(e) => setProveedorId(e.target.value)}
                  required
                  className="form-control my-input"
                >
                  <option value="">Seleccione…</option>
                  {proveedoresTabla.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.razonsocial || p.nombre || p.descripcion || `Proveedor #${p.id}`}
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

              {/* 🔹 Toggle mensual SOLO en egresos */}
              {tipo === "egresos" && (
                <div className="mt-2">
                  <Form.Check
                    type="switch"
                    id="pago-mensual-tarjeta"
                    label="¿Aplicar a gasto mensual?"
                    checked={esPagoMensual}
                    onChange={(e) => setEsPagoMensual(e.target.checked)}
                  />
                </div>
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

          {/* 🔹 Bloque instancia mensual (multi) */}
          {tipo === "egresos" && esPagoMensual && (
            <Row className="mb-3">
              <Col md={12}>
                {loadingMensual ? (
                  <Alert variant="info" className="py-2">Buscando instancias…</Alert>
                ) : errMensual ? (
                  <Alert variant="warning" className="py-2">{errMensual}</Alert>
                ) : instanciasMensuales.length === 0 ? (
                  <Alert variant="secondary" className="py-2">
                    No se encontraron instancias abiertas para este proveedor en {ymFromDate(fecha)}.
                  </Alert>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="small text-muted">
                        Seleccioná una o varias instancias y definí el monto a aplicar (podés superar el saldo).
                      </div>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-secondary" onClick={seleccionarTodo}>Seleccionar todo</Button>
                        <Button size="sm" variant="outline-secondary" onClick={seleccionarNinguno}>Ninguno</Button>
                      </div>
                    </div>

                    <div className="table-responsive border rounded">
                      <Table size="sm" bordered className="mb-2">
                        <thead>
                          <tr>
                            <th style={{ width: 36 }}></th>
                            <th>#</th>
                            <th>Descripción</th>
                            <th>Vence</th>
                            <th className="text-end">Base</th>
                            <th className="text-end">Pagado</th>
                            <th className="text-end">Saldo</th>
                            <th className="text-end" style={{ width: 150 }}>Asignar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instanciasMensuales
                            .slice()
                            .sort((a, b) => String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento)))
                            .map((it) => {
                              const base = Number(it.monto_real ?? it.monto_estimado ?? 0);
                              const pagado = Number(it.monto_pagado || 0);
                              const saldo = Math.max(0, base - pagado);
                              const sel = getSel(it.id);
                              return (
                                <tr key={it.id}>
                                  <td className="text-center">
                                    <Form.Check
                                      type="checkbox"
                                      checked={!!sel}
                                      onChange={(e) => toggleSeleccion(it.id, e.target.checked, saldo > 0 ? String(saldo) : String(base))}
                                    />
                                  </td>
                                  <td>#{it.id}</td>
                                  <td>{it.descripcion || "—"}</td>
                                  <td>{it.fecha_vencimiento}</td>
                                  <td className="text-end">${toMoney(base)}</td>
                                  <td className="text-end">${toMoney(pagado)}</td>
                                  <td className="text-end">${toMoney(saldo)}</td>
                                  <td className="text-end">
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      disabled={!sel}
                                      value={sel?.monto ?? ""}
                                      onChange={(e)=> setMontoSeleccion(it.id, e.target.value)}
                                    />
                                    {sel && Number(sel.monto || 0) > saldo && (
                                      <small className="text-warning d-block mt-1">
                                        Supera saldo: se actualizará el valor base / próximo rollover
                                      </small>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </Table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="form-check">
                        <Form.Check
                          type="checkbox"
                          id="cancelar-renovacion-tarjeta"
                          label="Cancelar renovación de la plantilla si queda pagada"
                          checked={cancelarRenovacion}
                          onChange={(e) => setCancelarRenovacion(e.target.checked)}
                        />
                      </div>
                      <div className="fw-bold">
                        Total a aplicar: ${toMoney(totalAsignado)} / Monto movimiento: ${toMoney(montoMovimiento)}
                      </div>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          )}

          {/* 4) Descripción + Monto */}
          <Row className="mb-3">
            <Col md={8}>
              <Form.Label>Descripción / Concepto</Form.Label>
              <Form.Control
                placeholder={tipo === "anticipo" ? "Anticipo / concepto" : "Descripción del gasto/servicio"}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </Col>
            <Col md={4}>
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={tipo === "egresos" && esPagoMensual ? String(totalAsignado || "") : monto}
                onChange={(e) => setMonto(e.target.value)}
                disabled={tipo === "egresos" && esPagoMensual}
                required
              />
              {tipo === "egresos" && esPagoMensual && (
                <small className="text-muted">Calculado automáticamente por la suma de “Asignar”.</small>
              )}
            </Col>
          </Row>

          {/* 5) Categoría + Observaciones */}
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
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="(Opcional)"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </Col>
          </Row>

          {/* 6) Info de cupón / plan (opcionales) */}
          <Row className="mb-2">
            <Col md={6}>
              <Form.Label>N° de cupón</Form.Label>
              <Form.Control
                placeholder="(Opcional)"
                value={cupon_numero}
                onChange={(e) => setCuponNumero(e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Plan de pago</Form.Label>
              <Form.Select
                value={planpago_id}
                onChange={(e) => setPlanPagoId(e.target.value)}
                className="form-control my-input"
                disabled={planesPago.length === 0}
              >
                <option value="">Sin plan</option>
                {planesPago.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.descripcion || p.nombre || `Plan #${p.id}`}
                    {p.cuotas ? ` · ${p.cuotas} cuotas` : ""}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* mantener derivación visible (no editable) */}
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
            ) : ("Guardar")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
