// src/components/tesoreria/NuevoMovimientoCaja.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner, Table } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoMovimientoCaja({ show, onHide, onCreated }) {
  const data = useContext(Contexts.DataContext) || {};
  const {
    empresaSeleccionada,
    cajaAbierta,

    // 🔹 Listas + setters desde el contexto
    categoriasEgreso = [],
    setCategoriasEgreso,
    proveedoresTabla = [],
    setProveedoresTabla,
    proyectosTabla = [],
    setProyectosTabla,

    formasPagoTesoreria = [],
    bancosTabla = [],
    empresasTabla = [],
  } = data;

  // ================== UI / FORM ==================
  const [tipo, setTipo] = useState("egresos"); // 'egresos' | 'anticipo' | 'deposito'
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [proveedor_id, setProveedorId] = useState("");
  const [proyecto_id, setProyectoId] = useState("");
  const [categoriaegreso_id, setCategoriaId] = useState("");
  const [imputacioncontable_id, setImputacionId] = useState("");
  const [banco_id, setBancoId] = useState(""); // sólo depósito

  // 🔹 Pago mensual (multi-asignación cuando 'egresos')
  const [esPagoMensual, setEsPagoMensual] = useState(false);
  const [instanciasMensuales, setInstanciasMensuales] = useState([]);
  // estructura por instancia seleccionada: { id, monto: string, cancelarRenov: boolean }
  const [selecciones, setSelecciones] = useState([]);
  const [loadingMensual, setLoadingMensual] = useState(false);
  const [errMensual, setErrMensual] = useState(null);

  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState(null);

  const empresa_id = empresaSeleccionada?.id || null;
  const caja_id = cajaAbierta?.caja?.id || null;

  // ================== REFRESCAR DATOS AL ABRIR MODAL ==================
  useEffect(() => {
    if (!show) return;

    let cancelado = false;

    const refrescarListas = async () => {
      try {
        const [resProv, resProy, resCat] = await Promise.all([
          fetch(`${apiUrl}/proveedores`, { credentials: "include" }),
          fetch(`${apiUrl}/proyectos`, { credentials: "include" }),
          fetch(`${apiUrl}/categorias-egreso`, { credentials: "include" }),
        ]);

        const [
          dataProv = [],
          dataProy = [],
          dataCat = [],
        ] = await Promise.all([
          resProv.ok ? resProv.json() : Promise.resolve([]),
          resProy.ok ? resProy.json() : Promise.resolve([]),
          resCat.ok ? resCat.json() : Promise.resolve([]),
        ]);

        if (cancelado) return;

        if (typeof setProveedoresTabla === "function") {
          setProveedoresTabla(Array.isArray(dataProv) ? dataProv : []);
        }
        if (typeof setProyectosTabla === "function") {
          setProyectosTabla(Array.isArray(dataProy) ? dataProy : []);
        }
        if (typeof setCategoriasEgreso === "function") {
          setCategoriasEgreso(Array.isArray(dataCat) ? dataCat : []);
        }
      } catch (err) {
        console.error("Error refrescando proveedores/proyectos/categorías:", err);
      }
    };

    refrescarListas();

    return () => {
      cancelado = true;
    };
  }, [show, setProveedoresTabla, setProyectosTabla, setCategoriasEgreso]);

  // ================== IMPUTACIÓN AUTOMÁTICA ==================
  useEffect(() => {
    if (!categoriaegreso_id) {
      setImputacionId("");
      return;
    }
    const cat = (categoriasEgreso || []).find(
      (c) => Number(c.id) === Number(categoriaegreso_id)
    );
    setImputacionId(
      cat?.imputacioncontable_id ? String(cat.imputacioncontable_id) : ""
    );
  }, [categoriaegreso_id, categoriasEgreso]);

  // ==== Detectar forma de pago "Caja/Efectivo" ====
  const formaPagoCajaId = useMemo(() => {
    const m = (formasPagoTesoreria || []).find((f) =>
      /(caja|efectivo)/i.test(String(f.descripcion || ""))
    );
    return m?.id || null;
  }, [formasPagoTesoreria]);

  const norm = (s) => String(s || "").trim().toLowerCase();

  // ==== Mapa nombreEmpresa -> empresa ====
  const empresasByNombre = useMemo(() => {
    const map = new Map();
    (empresasTabla || []).forEach((e) => {
      const key =
        norm(e.descripcion) ||
        norm(e.nombre) ||
        norm(e.fantasia) ||
        norm(e.alias);
      if (key) map.set(key, e);
    });
    return map;
  }, [empresasTabla]);

  // ==== Proveedores ordenados alfabéticamente ====
  const proveedoresOrdenados = useMemo(() => {
    return [...(proveedoresTabla || [])].sort((a, b) => {
      const nA = (a.descripcion || a.nombre || "").toLowerCase();
      const nB = (b.descripcion || b.nombre || "").toLowerCase();
      return nA.localeCompare(nB);
    });
  }, [proveedoresTabla]);

  // ==== Proveedores visibles en DEPÓSITO ====
  const proveedoresParaUI = useMemo(() => {
    if (tipo !== "deposito") return proveedoresOrdenados;

    return [...(proveedoresTabla || [])]
      .filter((p) => empresasByNombre.has(norm(p.descripcion || p.nombre)))
      .sort((a, b) => {
        const nA = (a.descripcion || a.nombre || "").toLowerCase();
        const nB = (b.descripcion || b.nombre || "").toLowerCase();
        return nA.localeCompare(nB);
      });
  }, [tipo, proveedoresTabla, empresasByNombre, proveedoresOrdenados]);

  const proveedorIdToEmpresaId = useMemo(() => {
    const map = new Map();
    (proveedoresParaUI || []).forEach((p) => {
      const emp = empresasByNombre.get(norm(p.descripcion || p.nombre));
      if (emp) map.set(Number(p.id), Number(emp.id));
    });
    return map;
  }, [proveedoresParaUI, empresasByNombre]);

  const empresaDestinoId = useMemo(() => {
    if (tipo !== "deposito" || !proveedor_id) return null;
    return proveedorIdToEmpresaId.get(Number(proveedor_id)) || null;
  }, [tipo, proveedor_id, proveedorIdToEmpresaId]);

  const bancosDisponibles = useMemo(() => {
    if (tipo !== "deposito" || !empresaDestinoId) return [];
    return (bancosTabla || []).filter(
      (b) => Number(b.empresa_id) === Number(empresaDestinoId)
    );
  }, [tipo, empresaDestinoId, bancosTabla]);

  useEffect(() => {
    setBancoId("");
  }, [tipo, proveedor_id]);

  // ================== TOTALES / MONTO ==================
  const totalAsignado = useMemo(
    () =>
      (selecciones || []).reduce(
        (acc, s) => acc + (Number(s.monto) || 0),
        0
      ),
    [selecciones]
  );

  const restante = useMemo(
    () => Number(monto || 0) - totalAsignado,
    [monto, totalAsignado]
  );

  const montoMovimiento = useMemo(
    () =>
      tipo === "egresos" && esPagoMensual
        ? totalAsignado
        : Number(monto || 0),
    [tipo, esPagoMensual, totalAsignado, monto]
  );

  useEffect(() => {
    if (tipo === "egresos" && esPagoMensual) {
      setMonto(totalAsignado ? String(totalAsignado) : "");
    }
  }, [tipo, esPagoMensual, totalAsignado]);

  // ================== VALIDACIONES ==================
  const puedeGuardar = useMemo(() => {
    if (!show) return false;
    if (!empresa_id || !caja_id) return false;
    if (!fecha) return false;
    if (!descripcion?.trim()) return false;
    if (!proveedor_id) return false;
    if (!categoriaegreso_id) return false;
    if (!proyecto_id) return false;

    if (tipo === "deposito") {
      if (!empresaDestinoId) return false;
      if (!banco_id) return false;
    }

    const nMonto = montoMovimiento;

    if (tipo === "egresos" && esPagoMensual) {
      if (!(totalAsignado > 0)) return false;
      if (totalAsignado > nMonto) return false;
    } else {
      if (!(nMonto > 0)) return false;
    }

    return true;
  }, [
    show,
    empresa_id,
    caja_id,
    fecha,
    descripcion,
    proveedor_id,
    categoriaegreso_id,
    proyecto_id,
    tipo,
    banco_id,
    empresaDestinoId,
    esPagoMensual,
    totalAsignado,
    montoMovimiento,
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
    setBancoId("");
    setEsPagoMensual(false);
    setInstanciasMensuales([]);
    setSelecciones([]);
    setErrMensual(null);
    setMsg(null);
  };

  const handleClose = () => {
    if (!enviando) {
      limpiar();
      onHide?.();
    }
  };

  // ================== HELPERS MENSUAL ==================
  const ymFromDate = (d) => String(d || "").slice(0, 7);

  function baseInst(it) {
    return Number(it?.monto_real ?? it?.monto_estimado ?? 0);
  }
  function saldoInst(it) {
    const base = baseInst(it);
    const pag = Number(it?.monto_pagado || 0);
    return Math.max(0, base - pag);
  }

  async function buscarInstanciasMensuales({ empresaId, proveedorId, fechaStr }) {
    const qs = new URLSearchParams();
    if (proveedorId) qs.set("proveedor_id", String(proveedorId));
    const url = `${apiUrl}/gasto-estimado/instancias?${qs.toString()}`;

    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error("No se pudieron buscar instancias mensuales");
    const arr = await r.json();
    return (Array.isArray(arr) ? arr : []).filter(
      (x) => x.estado !== "pagado" && x.estado !== "anulado"
    );
  }

  async function aplicarPagoAInstancia(instanciaId, payload) {
    const r = await fetch(
      `${apiUrl}/gasto-estimado/instancias/${instanciaId}/pagos`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const json = await r.json();
    if (!r.ok)
      throw new Error(
        json?.error || "No se pudo aplicar el pago a la instancia mensual"
      );
    return json;
  }

  useEffect(() => {
    (async () => {
      setErrMensual(null);
      setInstanciasMensuales([]);
      setSelecciones([]);
      if (!show) return;
      if (tipo !== "egresos") return;
      if (!esPagoMensual) return;
      if (!empresa_id || !proveedor_id || !fecha) return;

      try {
        setLoadingMensual(true);
        const items = await buscarInstanciasMensuales({
          empresaId: empresa_id,
          proveedorId: Number(proveedor_id),
          fechaStr: fecha,
        });
        setInstanciasMensuales(items || []);

        if (items && items.length > 0) {
          const ordered = [...items].sort((a, b) =>
            String(a.fecha_vencimiento).localeCompare(
              String(b.fecha_vencimiento)
            )
          );
          const s0 = ordered[0];
          const sug = Math.min(Math.max(0, restante), saldoInst(s0));
          setSelecciones(
            sug > 0
              ? [{ id: String(s0.id), monto: String(sug), cancelarRenov: false }]
              : []
          );

          const inst0 = ordered[0];
          if (!descripcion?.trim() && inst0?.descripcion)
            setDescripcion(inst0.descripcion);
          if (!categoriaegreso_id && inst0?.categoriaegreso_id)
            setCategoriaId(String(inst0.categoriaegreso_id));
        }
      } catch (e) {
        setErrMensual(
          e.message || "No se pudieron recuperar instancias mensuales"
        );
      } finally {
        setLoadingMensual(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, tipo, esPagoMensual, empresa_id, proveedor_id, fecha]);

  // ================== HANDLERS SELECCIONES MENSUAL ==================
  const toggleSeleccion = (instId) => {
    setSelecciones((prev) => {
      const exists = prev.find((s) => s.id === String(instId));
      if (exists) {
        return prev.filter((s) => s.id !== String(instId));
      }
      const it = instanciasMensuales.find(
        (x) => String(x.id) === String(instId)
      );
      const sug = Math.min(Math.max(0, restante), saldoInst(it));
      return [
        ...prev,
        { id: String(instId), monto: sug ? String(sug) : "", cancelarRenov: false },
      ];
    });
  };

  const setMontoSeleccion = (instId, value) => {
    setSelecciones((prev) =>
      prev.map((s) =>
        s.id === String(instId) ? { ...s, monto: value } : s
      )
    );
  };

  const setCancelarSeleccion = (instId, checked) => {
    setSelecciones((prev) =>
      prev.map((s) =>
        s.id === String(instId)
          ? { ...s, cancelarRenov: !!checked }
          : s
      )
    );
  };

  // ================== SUBMIT ==================
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMsg(null);
    if (!puedeGuardar) {
      setMsg({ type: "warning", text: "Completá los campos requeridos." });
      return;
    }

    if (tipo === "egresos" && esPagoMensual && selecciones.length > 0) {
      for (const sel of selecciones) {
        const toApply = Number(sel.monto || 0);
        if (!(toApply > 0)) {
          return setMsg({
            type: "warning",
            text: `Ingresá un monto válido para la instancia #${sel.id}.`,
          });
        }
      }
      if (totalAsignado > montoMovimiento) {
        return setMsg({
          type: "warning",
          text: "El total asignado supera el monto del movimiento.",
        });
      }
    }

    try {
      setEnviando(true);

      // --- ANTICIPO A PROVEEDORES ---
      if (tipo === "anticipo") {
        const payload = {
          empresa_id,
          proveedor_id: Number(proveedor_id),
          fecha,
          observaciones: observaciones?.trim() || null,
          pagos: [
            {
              medio: "caja",
              formapago_id: formaPagoCajaId || null,
              caja_id: Number(caja_id),
              fecha,
              monto: Number(montoMovimiento),
              detalle: descripcion?.trim(),
              proyecto_id: Number(proyecto_id),
              categoriaegreso_id: Number(categoriaegreso_id),
              imputacioncontable_id: imputacioncontable_id
                ? Number(imputacioncontable_id)
                : null,
              proveedor_id: Number(proveedor_id) || null,
            },
          ],
        };
        const res = await fetch(
          `${apiUrl}/movimientos-caja-tesoreria/anticiposaproveedores`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "No se pudo registrar el anticipo");
        onCreated?.(json);
        handleClose();
        return;
      }

      // --- DEPÓSITO BANCARIO ---
      if (tipo === "deposito") {
        const payload = {
          empresa_id,
          deposito: {
            fecha,
            caja_id: Number(caja_id),
            banco_id: Number(banco_id),
            empresa_destino_id: Number(empresaDestinoId),
            monto: Number(montoMovimiento),
            descripcion: descripcion?.trim(),
            proyecto_id: Number(proyecto_id),
            categoriaegreso_id: Number(categoriaegreso_id),
            imputacioncontable_id: imputacioncontable_id
              ? Number(imputacioncontable_id)
              : null,
            observaciones: observaciones?.trim() || null,
            proveedor_id: Number(proveedor_id) || null,
            formapago_id: formaPagoCajaId || null,
          },
        };
        const res = await fetch(
          `${apiUrl}/movimientos-caja-tesoreria/deposito-bancario`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        const json = await res.json();
        if (!res.ok)
          throw new Error(
            json?.error || "No se pudo registrar el depósito bancario"
          );
        onCreated?.(json);
        handleClose();
        return;
      }

      // --- EGRESOS VARIOS ---
      const montoEgreso =
        tipo === "egresos" && esPagoMensual
          ? totalAsignado
          : Number(montoMovimiento);

      const payload = {
        empresa_id,
        egreso: {
          fecha,
          caja_id: Number(caja_id),
          monto: montoEgreso,
          descripcion: descripcion?.trim(),
          proyecto_id: Number(proyecto_id),
          categoriaegreso_id: Number(categoriaegreso_id),
          imputacioncontable_id: imputacioncontable_id
            ? Number(imputacioncontable_id)
            : null,
          observaciones: observaciones?.trim() || null,
          proveedor_id: Number(proveedor_id),
          formapago_id: formaPagoCajaId || null,
        },
      };

      const res = await fetch(
        `${apiUrl}/movimientos-caja-tesoreria/egresos-independientes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json?.error || "No se pudo registrar el egreso");

      if (tipo === "egresos" && esPagoMensual && selecciones.length > 0) {
        const errores = [];
        for (const sel of selecciones) {
          const toApply = Number(sel.monto || 0);
          if (!(toApply > 0)) continue;
          try {
            await aplicarPagoAInstancia(sel.id, {
              referencia_tipo: "MovimientoCajaTesoreria",
              referencia_id: json?.movimiento?.id || null,
              formapago_id: formaPagoCajaId || null,
              fecha_aplicacion: fecha,
              monto_aplicado: toApply,
              observaciones:
                observaciones?.trim() || descripcion?.trim() || null,
              cancelar_renovacion: !!sel.cancelarRenov,
            });
          } catch (e2) {
            console.error("Aplicar pago a instancia mensual:", e2);
            errores.push(`#${sel.id}: ${e2.message || "Error"}`);
          }
        }
        if (errores.length) {
          setMsg({
            type: "warning",
            text:
              "Egreso registrado, pero algunas aplicaciones a instancias fallaron: " +
              errores.join(" · "),
          });
        } else if (totalAsignado < montoEgreso) {
          setMsg({
            type: "info",
            text:
              "Egreso registrado y aplicado. Quedó un remanente sin asignar a instancias.",
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

  // ================== RENDER ==================
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Movimiento de Caja</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!empresa_id && (
            <Alert variant="warning" className="py-2">
              Seleccioná una empresa para continuar.
            </Alert>
          )}
          {!caja_id && (
            <Alert variant="warning" className="py-2">
              No hay caja abierta. Abrí una caja para registrar egresos en efectivo.
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

          {/* 1) Tipo + Fecha */}
          <Row className="mb-3">
            <Col md={8}>
              <Form.Label>Tipo de movimiento</Form.Label>
              <div
                className="d-flex flex-wrap align-items-center"
                style={{ gap: 16 }}
              >
                <Form.Check
                  inline
                  type="radio"
                  id="tipo-egresos"
                  name="tipo"
                  label="Egresos varios"
                  value="egresos"
                  checked={tipo === "egresos"}
                  onChange={(e) => setTipo(e.target.value)}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="tipo-anticipo"
                  name="tipo"
                  label="Anticipo a Proveedores"
                  value="anticipo"
                  checked={tipo === "anticipo"}
                  onChange={(e) => setTipo(e.target.value)}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="tipo-deposito"
                  name="tipo"
                  label="Depósito bancario"
                  value="deposito"
                  checked={tipo === "deposito"}
                  onChange={(e) => setTipo(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
              <small className="text-muted d-block mt-1 text-end">
                Caja #{caja_id ?? "-"} ·{" "}
                {formaPagoCajaId
                  ? "Caja/Efectivo"
                  : "Forma de pago no detectada"}
              </small>
            </Col>
          </Row>

          {/* 2) Proveedor / Entidad + Proyecto */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>
                {tipo === "deposito"
                  ? "Entidad (empresa destino)"
                  : "Proveedor / Entidad"}
              </Form.Label>

              {tipo === "deposito" ? (
                <Form.Select
                  value={proveedor_id}
                  onChange={(e) => {
                    setProveedorId(e.target.value);
                    setBancoId("");
                  }}
                  required
                  className="form-control my-input"
                  disabled={proveedoresParaUI.length === 0}
                >
                  <option value="">
                    {proveedoresParaUI.length
                      ? "Seleccione…"
                      : "No hay entidades compatibles"}
                  </option>
                  {proveedoresParaUI.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.descripcion || p.nombre || `Proveedor #${p.id}`}
                    </option>
                  ))}
                </Form.Select>
              ) : Array.isArray(proveedoresOrdenados) &&
                proveedoresOrdenados.length > 0 ? (
                <Form.Select
                  value={proveedor_id}
                  onChange={(e) => setProveedorId(e.target.value)}
                  required
                  className="form-control my-input"
                >
                  <option value="">Seleccione…</option>
                  {proveedoresOrdenados.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.descripcion || p.nombre || `Proveedor #${p.id}`}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="number"
                  placeholder="ID proveedor/entidad"
                  value={proveedor_id}
                  onChange={(e) => setProveedorId(e.target.value)}
                  required
                />
              )}

              {/* Toggle mensual SOLO en egresos */}
              {tipo === "egresos" && (
                <div className="mt-2">
                  <Form.Check
                    type="switch"
                    id="pago-mensual"
                    label="¿Aplicar a gasto mensual?"
                    checked={esPagoMensual}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEsPagoMensual(checked);
                      if (!checked) setSelecciones([]);
                    }}
                  />
                </div>
              )}
            </Col>

            <Col md={6}>
              <Form.Label>Proyecto</Form.Label>
              {Array.isArray(proveedoresOrdenados) &&
                proveedoresOrdenados.length > 0 ? (

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

          {/* Bloque instancias mensuales */}
          {tipo === "egresos" && esPagoMensual && (
            <Row className="mb-3">
              <Col md={12}>
                {loadingMensual ? (
                  <Alert variant="info" className="py-2">
                    Buscando instancias mensuales…
                  </Alert>
                ) : errMensual ? (
                  <Alert variant="warning" className="py-2">
                    {errMensual}
                  </Alert>
                ) : instanciasMensuales.length === 0 ? (
                  <Alert variant="secondary" className="py-2">
                    No se encontraron instancias para este proveedor en{" "}
                    {ymFromDate(fecha)} (ni pendientes). Podés continuar sin
                    aplicar a instancia.
                  </Alert>
                ) : (
                  <div className="p-2 border rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>Instancias del proveedor</strong>{" "}
                      </div>
                    </div>

                    <div className="table-responsive">
                      <Table bordered size="sm" className="mb-2">
                        <thead>
                          <tr>
                            <th style={{ width: 40 }}></th>
                            <th>#</th>
                            <th>Descripción</th>
                            <th>Vence</th>
                            <th className="text-end">Base</th>
                            <th className="text-end">Pagado</th>
                            <th className="text-end">Saldo</th>
                            <th
                              style={{ width: 160 }}
                              className="text-end"
                            >
                              Asignar
                            </th>
                            <th style={{ width: 180 }}>
                              Cancelar renovación
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {instanciasMensuales
                            .sort((a, b) =>
                              String(a.fecha_vencimiento).localeCompare(
                                String(b.fecha_vencimiento)
                              )
                            )
                            .map((it) => {
                              const sel = selecciones.find(
                                (s) => s.id === String(it.id)
                              );
                              const saldo = saldoInst(it);
                              return (
                                <tr key={it.id}>
                                  <td className="text-center">
                                    <Form.Check
                                      type="checkbox"
                                      checked={!!sel}
                                      onChange={() =>
                                        toggleSeleccion(it.id)
                                      }
                                    />
                                  </td>
                                  <td>{it.id}</td>
                                  <td>{it.descripcion || "—"}</td>
                                  <td>{it.fecha_vencimiento}</td>
                                  <td className="text-end">
                                    $
                                    {baseInst(it).toLocaleString("es-AR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="text-end">
                                    $
                                    {Number(
                                      it.monto_pagado || 0
                                    ).toLocaleString("es-AR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="text-end">
                                    $
                                    {saldo.toLocaleString("es-AR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="text-end">
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      disabled={!sel}
                                      value={sel?.monto ?? ""}
                                      onChange={(e) =>
                                        setMontoSeleccion(
                                          it.id,
                                          e.target.value
                                        )
                                      }
                                    />
                                    {sel &&
                                      Number(sel.monto || 0) >
                                      saldo && (
                                        <small className="text-warning d-block mt-1">
                                          Supera saldo: se actualizará el
                                          valor base / próximo rollover
                                        </small>
                                      )}
                                  </td>

                                  <td>
                                    <Form.Check
                                      type="switch"
                                      id={`cancelar-${it.id}`}
                                      disabled={!sel}
                                      label="Cancelar"
                                      checked={!!sel?.cancelarRenov}
                                      onChange={(e) =>
                                        setCancelarSeleccion(
                                          it.id,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          )}

          {/* 3) Descripción + Monto */}
          <Row className="mb-3">
            <Col md={8}>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                placeholder={
                  tipo === "anticipo"
                    ? "Anticipo / concepto"
                    : tipo === "deposito"
                      ? "Depósito en banco — concepto"
                      : "Descripción del gasto/servicio"
                }
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
                value={
                  tipo === "egresos" && esPagoMensual
                    ? String(totalAsignado || "")
                    : monto
                }
                onChange={(e) => setMonto(e.target.value)}
                disabled={tipo === "egresos" && esPagoMensual}
                required
              />
              {tipo === "egresos" && esPagoMensual && (
                <small className="text-muted">
                  Calculado automáticamente por la suma de “Asignar”.
                </small>
              )}
            </Col>
          </Row>

          {/* 4) Banco (si depósito) + Categoría */}
          <Row className="mb-3">
            {tipo === "deposito" && (
              <Col md={6}>
                <Form.Label>Banco (empresa destino)</Form.Label>
                <Form.Select
                  value={banco_id}
                  onChange={(e) => setBancoId(e.target.value)}
                  required
                  className="form-control my-input"
                  disabled={!empresaDestinoId}
                >
                  <option value="">
                    {empresaDestinoId
                      ? "Seleccione…"
                      : "Seleccione entidad primero"}
                  </option>
                  {bancosDisponibles.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre ||
                        b.descripcion ||
                        b.alias ||
                        `Banco ${b.id}`}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

            <Col md={tipo === "deposito" ? 6 : 12}>
              <Form.Label>Categoría de Egreso</Form.Label>
              <Form.Select
                value={categoriaegreso_id}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
                className="form-control my-input"
              >
                <option value="">Seleccione…</option>
                {(categoriasEgreso || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                La imputación contable se deriva automáticamente de la
                categoría.
              </Form.Text>
            </Col>
          </Row>

          {/* 5) Observaciones */}
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

          <input type="hidden" value={imputacioncontable_id || ""} readOnly />
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!puedeGuardar || enviando}
          >
            {enviando ? (
              <>
                <Spinner
                  size="sm"
                  animation="border"
                  className="me-2"
                />{" "}
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
