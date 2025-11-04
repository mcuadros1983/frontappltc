// src/components/tesoreria/FormasPagoEditor.jsx
import { useMemo, useContext, useEffect, useState } from "react";
import { Button, Form, Container, Spinner, Alert } from "react-bootstrap";
import Contexts from "../../context/Contexts";

/**
 * props:
 * - total: number
 * - value: array (rows de pago)
 * - onChange(nextArray)
 * - headerCategoriaId, headerImputacionId
 * - showCategoriaPorFila
 * - empresaId: number
 * - proveedorId: number
 * - fechaComprobante: string (YYYY-MM-DD)   ⬅️ fecha del comprobante (obligatoria)
 */
export default function FormasPagoEditor({
  total = 0,
  value = [],
  onChange,
  headerCategoriaId = null,
  headerImputacionId = null,
  showCategoriaPorFila = false,
  empresaId,
  proveedorId,
  fechaComprobante,
}) {
  const dataContext = useContext(Contexts.DataContext);
  const {
    cajaAbierta,
    categoriasEgreso = [],
    formasPagoTesoreria = [],
    imputacionContableTabla = [],
    tiposTarjetaTabla = [],
    marcasTarjetaTabla = [],
    planTarjetaTesoreriaTabla = [],
    bancosTabla = [],
  } = dataContext || {};

  const apiUrl = process.env.REACT_APP_API_URL;

  // === Estado auxiliar por fila ===
  const [opcionesPorFila, setOpcionesPorFila] = useState({});
  const setOpc = (idx, patch) =>
    setOpcionesPorFila((prev) => ({ ...prev, [idx]: { ...(prev[idx] || {}), ...patch } }));

  const [gmPorFila, setGmPorFila] = useState({});
  const setGm = (idx, patch) =>
    setGmPorFila((prev) => ({ ...prev, [idx]: { ...(prev[idx] || {}), ...patch } }));

  // === Utilidades del dominio ===
  const getImpFromCat = (categoriaId) => {
    const cat = categoriasEgreso.find((c) => Number(c.id) === Number(categoriaId));
    return cat?.imputacioncontable_id ?? "";
  };

  const byFPId = (fpId) => formasPagoTesoreria.find((f) => Number(f.id) === Number(fpId));
  const has = (fpId, regex) => {
    const fp = byFPId(fpId);
    return fp ? regex.test((fp.descripcion || "").toLowerCase()) : false;
  };

  const esPagoEnCaja = (fpId) => has(fpId, /(caja|efectivo)/i);
  const esTransferencia = (fpId) => has(fpId, /(transfer|bancaria|cbu|alias)/i);
  const esCtaCte = (fpId) => has(fpId, /(cta\.?\s*cte|cuenta\s*corriente)/i);
  const esEcheq = (fpId) => has(fpId, /(e-?\s*cheq|echeq)/i);
  const esTarjeta = (fpId) => has(fpId, /(tarjeta|cr[eé]dito|d[eé]bito)/i);

  const medioFromFp = (fpId) => {
    if (esPagoEnCaja(fpId)) return "caja";
    if (esTransferencia(fpId)) return "transferencia";
    if (esEcheq(fpId)) return "echeq";
    if (esTarjeta(fpId)) return "tarjeta";
    if (esCtaCte(fpId)) return "ctacte";
    return "desconocido";
  };

  const tipoExistingFromMedio = (medio) => {
    switch (medio) {
      case "caja": return "caja";
      case "transferencia": return "banco";
      case "echeq": return "echeq";
      case "tarjeta": return "tarjeta";
      case "ctacte": return "ctacte";
      default: return null;
    }
  };

  const imputDescById = (id) => {
    const it = imputacionContableTabla.find((x) => Number(x.id) === Number(id));
    return it?.descripcion || "";
  };

  const suma = useMemo(
    () => value.reduce((acc, it) => acc + (Number(it.monto) || 0), 0),
    [value]
  );
  const restante = Number(total || 0) - Number(suma || 0);
  const valido = Math.abs(restante) < 0.009;

  // === Sincronizar la fecha de todas las filas con la del comprobante ===
  useEffect(() => {
    if (!fechaComprobante || !onChange) return;
    if (!Array.isArray(value) || value.length === 0) return;

    let changed = false;
    const next = value.map((row) => {
      if (row.fecha !== fechaComprobante) {
        changed = true;
        return { ...row, fecha: fechaComprobante };
      }
      return row;
    });
    if (changed) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaComprobante]);

  // === Edición de filas ===
  const addRow = () => {
    const hoy = new Date().toISOString().split("T")[0];
    const fechaRow = fechaComprobante || hoy;
    const impHeader = headerImputacionId || getImpFromCat(headerCategoriaId);
    onChange?.([
      ...value,
      {
        formapago_id: "",
        monto: "",
        fecha: fechaRow,            // fija = fecha del comprobante
        fecha_pago: "",
        detalle: "",
        formapago_futuro_id: "",    // NUEVO: para ctacte
        // condicionales
        caja_id: "",
        categoriaegreso_id: headerCategoriaId || "",
        imputacioncontable_id: impHeader || "",
        banco_id: "",
        referencia: "",
        // eCheq
        numero_echeq: "",
        fecha_vencimiento: "",
        // Tarjeta
        tipotarjeta_id: "",
        marcatarjeta_id: "",
        cupon_numero: "",
        planpago_id: "",
        // Transfer extra
        cbu_alias_destino: "",
        titular_destino: "",
        // Vinculación de movimiento existente
        existing_ref: null, // { tipo, id }
        // Gasto mensual (Front)
        gastoestimado: { aplicar: false, instancia_id: "", cancelar_renovacion: false },
      },
    ]);
  };

  const removeRow = (idx) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange?.(next);
    setOpc(idx, { items: [], chosen: null, error: null });
    setGm(idx, { items: [], error: null, loading: false });
  };

  const updateField = (idx, name, val) => {
    const next = value.slice();
    next[idx] = { ...next[idx], [name]: val };
    onChange?.(next);
  };

  // Prefill categoría/imputación desde encabezado
  useEffect(() => {
    if (!onChange) return;

    const impHeader = headerImputacionId || getImpFromCat(headerCategoriaId);
    if (!headerCategoriaId && !impHeader) return;

    let changed = false;
    const next = value.map((row) => {
      if (!row.categoriaegreso_id && headerCategoriaId) {
        changed = true;
        return {
          ...row,
          categoriaegreso_id: headerCategoriaId,
          imputacioncontable_id: row.imputacioncontable_id || impHeader || "",
        };
      }
      if (row.categoriaegreso_id && !row.imputacioncontable_id) {
        const imp = getImpFromCat(row.categoriaegreso_id) || impHeader || "";
        if (imp) {
          changed = true;
          return { ...row, imputacioncontable_id: imp };
        }
      }
      return row;
    });

    if (changed) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerCategoriaId, headerImputacionId, categoriasEgreso]);

  // Autocompletar caja_id si corresponde
  useEffect(() => {
    if (!onChange || !cajaAbierta?.caja?.id || !Array.isArray(value) || value.length === 0) return;

    let changed = false;
    const next = value.map((row) => {
      if (esPagoEnCaja(row.formapago_id) && !row.caja_id && !row.existing_ref) {
        changed = true;
        return { ...row, caja_id: cajaAbierta.caja.id };
      }
      return row;
    });

    if (changed) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cajaAbierta?.caja?.id, value, formasPagoTesoreria]);

  // === Buscar disponibles (movimientos existentes) por fila ===
  const buscarDisponibles = async (idx) => {
    const row = value[idx];
    const fpId = row?.formapago_id;
    const medio = medioFromFp(fpId);
    if (!empresaId || !proveedorId || !fpId || medio === "desconocido") {
      setOpc(idx, { error: "Completar Empresa, Proveedor y Forma de pago", items: [] });
      return;
    }

    try {
      setOpc(idx, { loading: true, error: null });
      const qs = new URLSearchParams();
      qs.set("medio", medio);
      qs.set("proveedor_id", String(proveedorId));
      const res = await fetch(`${apiUrl}/tesoreria/disponibles?${qs.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudieron obtener disponibles");
      setOpc(idx, { items: Array.isArray(json) ? json : [], loading: false });
    } catch (e) {
      setOpc(idx, { error: e.message || "Error al buscar disponibles", loading: false, items: [] });
    }
  };

  const elegirExistente = (idx, selectedId) => {
    const opts = opcionesPorFila[idx]?.items || [];
    const it = opts.find((x) => String(x.id) === String(selectedId));
    if (!it) return;

    const row = value[idx];
    const medio = medioFromFp(row.formapago_id);
    const tipo = tipoExistingFromMedio(medio);

    const importe =
      medio === "echeq"
        ? Number(it.importe ?? it.monto ?? 0)
        : Number(it.monto ?? 0);

    const next = value.slice();
    next[idx] = {
      ...row,
      existing_ref: { tipo, id: it.id },
      monto: String(importe),
      gastoestimado: { aplicar: false, instancia_id: "", cancelar_renovacion: false },
      // cualquier campo propio de ctacte no aplica si hay existente
      fecha_pago: "",
      formapago_futuro_id: "",
      // asegurar fecha igual al comprobante
      fecha: fechaComprobante || row.fecha,
    };
    onChange?.(next);
    setOpc(idx, { chosen: it });
    setGm(idx, { items: [], error: null, loading: false });
  };

  const quitarExistente = (idx) => {
    const row = value[idx];
    const next = value.slice();
    next[idx] = { ...row, existing_ref: null };
    onChange?.(next);
    setOpc(idx, { chosen: null });
  };

  // === Gasto mensual por fila ===
  const ymFromDate = (dateStr) => String(dateStr || "").slice(0, 7);

  const cargarInstanciasMensuales = async (idx) => {
    const row = value[idx];
    if (!row) return;
    const periodo = ymFromDate(row.fecha || fechaComprobante || new Date().toISOString().slice(0, 10));

    if (!empresaId || !proveedorId) {
      setGm(idx, { items: [], error: "Falta empresa/proveedor" });
      return;
    }

    try {
      setGm(idx, { loading: true, error: null, items: [] });
      const qs = new URLSearchParams();
      qs.set("proveedor_id", String(proveedorId));

      const url = `${apiUrl}/gasto-estimado/instancias?${qs.toString()}`;
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error("No se pudieron buscar instancias");
      const arr = await r.json();
      const instancias = (Array.isArray(arr) ? arr : []).filter(
        (x) => x.estado !== "pagado" && x.estado !== "anulado"
      );

      setGm(idx, { loading: false, error: null, items: instancias });
      if (instancias.length > 0) {
        updateField(idx, "gastoestimado", {
          ...(row.gastoestimado || {}),
          aplicar: true,
          instancia_id: String(instancias[0].id),
          cancelar_renovacion: Boolean(row.gastoestimado?.cancelar_renovacion),
        });
      }
    } catch (e) {
      setGm(idx, { loading: false, error: e.message || "Error buscando instancias", items: [] });
    }
  };

  const toggleAplicarMensual = (idx, checked) => {
    const row = value[idx];
    if (!row) return;
    if (row.existing_ref && checked) return;

    updateField(idx, "gastoestimado", {
      ...(row.gastoestimado || {}),
      aplicar: checked,
      instancia_id: checked ? (row.gastoestimado?.instancia_id || "") : "",
      cancelar_renovacion: checked ? Boolean(row.gastoestimado?.cancelar_renovacion) : false,
    });

    if (checked) cargarInstanciasMensuales(idx);
  };

  // refrescar instancias si cambia fecha/forma
  useEffect(() => {
    value.forEach((row, idx) => {
      if (row?.gastoestimado?.aplicar) {
        const gmState = gmPorFila[idx];
        if (gmState && Array.isArray(gmState.items)) {
          cargarInstanciasMensuales(idx);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.map((r) => `${r.fecha}-${r.formapago_id}`).join("|")]);

  // Helpers UI para CTActe: lista de formas “futuras” (excluye ctacte)
  const formasFuturas = useMemo(
    () => (formasPagoTesoreria || []).filter(fp =>
      !/(cta\.?\s*cte|cuenta\s*corriente)/i.test((fp.descripcion || "").toLowerCase())
    ),
    [formasPagoTesoreria]
  );

  return (
    <Container fluid className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Formas de Pago</h5>
        <Button size="sm" variant="outline-success" onClick={addRow} disabled={Number(total) <= 0}>
          + Agregar forma de pago
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-muted mb-2" style={{ fontSize: 14 }}>
          No hay formas de pago agregadas.
        </div>
      )}

      {value.map((it, idx) => {
        const enCaja = esPagoEnCaja(it.formapago_id);
        const esTransf = esTransferencia(it.formapago_id);
        const esCC = esCtaCte(it.formapago_id);
        const esECQ = esEcheq(it.formapago_id);
        const esTJ = esTarjeta(it.formapago_id);

        const tieneExistente = !!it.existing_ref;
        const op = opcionesPorFila[idx] || {};
        const gm = gmPorFila[idx] || {};
        const medio = medioFromFp(it.formapago_id);

        // Flags de validación (solo UI)
        const faltaFechaPagoCC = esCC && !tieneExistente && !it.fecha_pago;
        const faltaFormaFuturaCC = esCC && !tieneExistente && !it.formapago_futuro_id;

        return (
          <div key={idx} className="border rounded p-2 mb-2">
            <div className="row">
              <Form.Group className="mb-2 col-md-3">
                <Form.Label>Forma</Form.Label>
                <Form.Select
                  value={it.formapago_id || ""}
                  onChange={(e) => {
                    const fpId = e.target.value;

                    if (esPagoEnCaja(fpId) && !cajaAbierta?.caja?.id) {
                      alert("⚠️ No hay caja abierta. No se puede seleccionar 'Caja/Efectivo'.");
                      // Revertir el cambio visual en el <select>
                      e.target.value = (value[idx]?.formapago_id ?? "");
                      return;
                    }

                    const next = value.slice();
                    const prev = next[idx] || {};
                    const medioEsTarjeta = esTarjeta(fpId);
                    const medioEsEcheq = esEcheq(fpId);
                    const medioEsTransfer = esTransferencia(fpId);
                    const medioEsCaja = esPagoEnCaja(fpId);
                    const medioEsCC = esCtaCte(fpId);

                    let current = {
                      ...prev,
                      formapago_id: fpId,
                      existing_ref: null,
                      fecha: fechaComprobante || prev.fecha,
                    };
                    setOpc(idx, { items: [], chosen: null, error: null });

                    if (medioEsCaja) {
                      current.caja_id = cajaAbierta?.caja?.id ?? "";
                    } else {
                      current.caja_id = "";
                    }

                    if (!medioEsTarjeta) {
                      current.tipotarjeta_id = "";
                      current.marcatarjeta_id = "";
                      current.cupon_numero = "";
                      current.planpago_id = "";
                    }
                    if (!medioEsEcheq) {
                      current.numero_echeq = "";
                      current.fecha_vencimiento = "";
                    }
                    if (!medioEsTransfer) {
                      current.cbu_alias_destino = "";
                      current.titular_destino = "";
                      current.referencia = "";
                    }
                    if (!(medioEsEcheq || medioEsTransfer)) {
                      current.banco_id = "";
                    }

                    // Reglas para ctacte (obligatorios)
                    if (medioEsCC) {
                      current.fecha_pago = current.fecha_pago || "";
                      current.formapago_futuro_id = current.formapago_futuro_id || "";
                    } else {
                      // si dejó de ser ctacte, limpiar campos específicos
                      current.fecha_pago = "";
                      current.formapago_futuro_id = "";
                    }

                    next[idx] = current;
                    onChange?.(next);
                  }}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {formasPagoTesoreria.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.descripcion}
                    </option>
                  ))}
                </Form.Select>

                {/* Buscar disponibles (movimientos existentes) */}
                <div className="mt-2 d-flex align-items-center" style={{ gap: 8 }}>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => buscarDisponibles(idx)}
                    disabled={!empresaId || !proveedorId || !it.formapago_id}
                    title={!empresaId || !proveedorId ? "Elegí Empresa y Proveedor" : ""}
                  >
                    {op.loading ? <Spinner size="sm" animation="border" /> : "Buscar disponibles"}
                  </Button>
                </div>

                {op.error && (
                  <Alert variant="warning" className="py-1 mt-2">
                    {op.error}
                  </Alert>
                )}

                {Array.isArray(op.items) && op.items.length > 0 && (
                  <div className="mt-2">
                    <Form.Select
                      value={op.chosen?.id || ""}
                      onChange={(e) => elegirExistente(idx, e.target.value)}
                      className="form-control form-control-sm my-input"
                    >
                      <option value="">Seleccionar movimiento disponible…</option>
                      {op.items.map((mv) => {
                        const resumen = (() => {
                          if (medio === "caja")
                            return `#${mv.id} · ${mv.fecha} · $${Number(mv.monto || 0).toFixed(2)} · ${mv.descripcion || ""}`;
                          if (medio === "transferencia")
                            return `#${mv.id} · ${mv.fecha} · $${Number(mv.monto || 0).toFixed(2)} · ${mv.descripcion || ""}`;
                          if (medio === "echeq")
                            return `#${mv.id} · Emisión ${mv.fecha_emision} · Vto ${mv.fecha_vencimiento} · $${Number(mv.importe || mv.monto || 0).toFixed(2)}`;
                          if (medio === "tarjeta")
                            return `#${mv.id} · ${mv.fecha} · $${Number(mv.importe || mv.monto || 0).toFixed(2)} · cupón ${mv.cupon_numero || "-"}`;
                          if (medio === "ctacte")
                            return `#${mv.id} · ${mv.fecha} · $${Number(mv.monto || 0).toFixed(2)} · ${mv.descripcion || ""}`;
                          return `#${mv.id}`;
                        })();
                        return (
                          <option key={mv.id} value={mv.id}>{resumen}</option>
                        );
                      })}
                    </Form.Select>

                    {!!it.existing_ref && (
                      <div className="mt-1">
                        <Button size="sm" variant="outline-danger" onClick={() => quitarExistente(idx)}>
                          Quitar vínculo
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-2 col-md-3">
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={it.monto ?? ""}
                  onChange={(e) => updateField(idx, "monto", e.target.value)}
                  disabled={tieneExistente}
                />
                {tieneExistente && (
                  <small className="text-muted">El importe se toma del movimiento existente.</small>
                )}
              </Form.Group>

              <Form.Group className="mb-2 col-md-3">
                <Form.Label>Detalle</Form.Label>
                <Form.Control
                  value={it.detalle || ""}
                  onChange={(e) => updateField(idx, "detalle", e.target.value)}
                  placeholder="Obs./ref. breve"
                  disabled={tieneExistente}
                />
              </Form.Group>
            </div>

            {/* Categoría & Imputación */}
            {showCategoriaPorFila && !tieneExistente && (
              <div className="row">
                <Form.Group className="mb-2 col-md-4">
                  <Form.Label>Categoría de Egreso</Form.Label>
                  <Form.Select
                    value={it.categoriaegreso_id || ""}
                    onChange={(e) => {
                      const categoriaId = e.target.value;
                      const cat = categoriasEgreso.find(
                        (c) => Number(c.id) === Number(categoriaId)
                      );

                      const next = value.slice();
                      next[idx] = {
                        ...next[idx],
                        categoriaegreso_id: categoriaId,
                        imputacioncontable_id: cat?.imputacioncontable_id || "",
                      };
                      onChange?.(next);
                    }}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {categoriasEgreso.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2 col-md-4">
                  <Form.Label>Imputación Contable</Form.Label>
                  <Form.Control
                    value={
                      imputDescById(it.imputacioncontable_id) ||
                      (it.imputacioncontable_id ? `ID ${it.imputacioncontable_id}` : "")
                    }
                    placeholder="Se completa según la categoría"
                    disabled
                  />
                </Form.Group>
              </div>
            )}

            {/* Caja / Efectivo */}
            {enCaja && !tieneExistente && (
              <div className="row">
                <div className="mb-2 col-md-12">
                  <small className="text-muted">
                    {cajaAbierta?.caja?.id
                      ? `Se usará la Caja #${cajaAbierta.caja.id} — apertura ${cajaAbierta.caja.fecha_apertura} — saldo $${Number(cajaAbierta.saldo || 0).toFixed(2)}`
                      : "⚠️ No hay caja abierta. No se podrá registrar el movimiento de caja."}
                  </small>
                </div>
              </div>
            )}

            {/* Transferencia */}
            {esTransf && !tieneExistente && (
              <div className="row">
                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>Banco/Cuenta</Form.Label>
                  {Array.isArray(bancosTabla) && bancosTabla.length > 0 ? (
                    <Form.Select
                      value={it.banco_id || ""}
                      onChange={(e) => updateField(idx, "banco_id", e.target.value)}
                      className="form-control my-input"
                      required
                    >
                      <option value="">Seleccione...</option>
                      {bancosTabla.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      value={it.banco_id || ""}
                      onChange={(e) => updateField(idx, "banco_id", e.target.value)}
                      placeholder="ID Banco/Cta"
                      required
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>Referencia</Form.Label>
                  <Form.Control
                    value={it.referencia || ""}
                    onChange={(e) => updateField(idx, "referencia", e.target.value)}
                    placeholder="N° transferencia"
                  />
                </Form.Group>

                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>CBU/Alias Destino</Form.Label>
                  <Form.Control
                    value={it.cbu_alias_destino || ""}
                    onChange={(e) => updateField(idx, "cbu_alias_destino", e.target.value)}
                    placeholder="CBU o alias"
                  />
                </Form.Group>

                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>Titular Destino</Form.Label>
                  <Form.Control
                    value={it.titular_destino || ""}
                    onChange={(e) => updateField(idx, "titular_destino", e.target.value)}
                    placeholder="Titular de la cuenta"
                  />
                </Form.Group>

                {!it.banco_id && (
                  <div className="col-12">
                    <small className="text-danger">
                      Falta seleccionar el Banco/Cuenta para registrar la transferencia.
                    </small>
                  </div>
                )}
              </div>
            )}

            {/* Cuenta Corriente (obligatorios: fecha_pago y forma futura) */}
            {esCC && !tieneExistente && (
              <div className="row">
                <Form.Group className="mb-2 col-md-4">
                  <Form.Label>Fecha de pago (obligatoria)</Form.Label>
                  <Form.Control
                    type="date"
                    value={it.fecha_pago || ""}
                    onChange={(e) => updateField(idx, "fecha_pago", e.target.value)}
                    required
                  />
                  {faltaFechaPagoCC && (
                    <small className="text-danger d-block mt-1">
                      Debés indicar la fecha en la que se pagará este cargo de cuenta corriente.
                    </small>
                  )}
                </Form.Group>

                <Form.Group className="mb-2 col-md-4">
                  <Form.Label>Forma de pago acordada</Form.Label>
                  <Form.Select
                    value={it.formapago_futuro_id || ""}
                    onChange={(e) => updateField(idx, "formapago_futuro_id", e.target.value)}
                    required
                    className="form-control form-control-sm my-input"
                  >
                    <option value="">Seleccione...</option>
                    {formasFuturas.map(fp => (
                      <option key={fp.id} value={fp.id}>{fp.descripcion}</option>
                    ))}
                  </Form.Select>
                  {faltaFormaFuturaCC && (
                    <small className="text-danger d-block mt-1">
                      Elegí la forma de pago acordada.
                    </small>
                  )}
                </Form.Group>
              </div>
            )}

            {/* eCheq */}
            {esECQ && !tieneExistente && (
              <div className="row">
                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>Banco Emisor</Form.Label>
                  {/* ...igual que antes ... */}
                  {Array.isArray(bancosTabla) && bancosTabla.length > 0 ? (
                    <Form.Select
                      value={it.banco_id || ""}
                      onChange={(e) => updateField(idx, "banco_id", e.target.value)}
                      className="form-control my-input"
                      required
                    >
                      <option value="">Seleccione...</option>
                      {bancosTabla.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      value={it.banco_id || ""}
                      onChange={(e) => updateField(idx, "banco_id", e.target.value)}
                      placeholder="ID Banco"
                      required
                    />
                  )}

                  {!it.banco_id && (
                    <small className="text-danger d-block mt-1">
                      Falta seleccionar el Banco Emisor para registrar el eCheq.
                    </small>
                  )}
                </Form.Group>

                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>N° eCheq</Form.Label>
                  <Form.Control
                    value={it.numero_echeq || ""}
                    onChange={(e) => updateField(idx, "numero_echeq", e.target.value)}
                    placeholder="Identificador eCheq"
                  />
                </Form.Group>

                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>Vencimiento</Form.Label>
                  <Form.Control
                    type="date"
                    value={it.fecha_vencimiento || ""}
                    onChange={(e) => updateField(idx, "fecha_vencimiento", e.target.value)}
                    required
                  />
                </Form.Group>
              </div>
            )}

            {/* Tarjeta */}
            {esTJ && !tieneExistente && (
              <div className="row">
                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>Tipo Tarjeta</Form.Label>
                  <Form.Select
                    value={it.tipotarjeta_id || ""}
                    onChange={(e) => updateField(idx, "tipotarjeta_id", e.target.value)}
                    className="form-control my-input"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {tiposTarjetaTabla.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Select
                    value={it.marcatarjeta_id || ""}
                    onChange={(e) => updateField(idx, "marcatarjeta_id", e.target.value)}
                    className="form-control my-input"
                    required
                  >
                    <option value="">Seleccione...</option>
                    {marcasTarjetaTabla.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>N° Cupón</Form.Label>
                  <Form.Control
                    value={it.cupon_numero || ""}
                    onChange={(e) => updateField(idx, "cupon_numero", e.target.value)}
                    placeholder="Cupón"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-2 col-md-3">
                  <Form.Label>Plan Pago</Form.Label>
                  <Form.Select
                    value={it.planpago_id || ""}
                    onChange={(e) => updateField(idx, "planpago_id", e.target.value)}
                    className="form-control my-input"
                  >
                    <option value="">Sin plan</option>
                    {planTarjetaTesoreriaTabla.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.descripcion || p.nombre || `Plan ${p.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {(!it.tipotarjeta_id || !it.marcatarjeta_id || !it.cupon_numero) && (
                  <div className="col-12">
                    <small className="text-danger">
                      Falta completar Tipo/Marca y N° Cupón para registrar el pago con tarjeta.
                    </small>
                  </div>
                )}
              </div>
            )}

            {/* === Aplicar a gasto mensual (instancia) === */}
            <div className="row mt-2">
              <Form.Group className="mb-2 col-md-12">
                <Form.Check
                  type="switch"
                  id={`gm-switch-${idx}`}
                  label="Aplicar a gasto mensual (instancia)"
                  checked={!!it?.gastoestimado?.aplicar}
                  onChange={(e) => toggleAplicarMensual(idx, e.target.checked)}
                  disabled={tieneExistente || !empresaId || !proveedorId}
                />
                {tieneExistente && (
                  <small className="text-muted ms-2">
                    No disponible cuando se usa un movimiento existente.
                  </small>
                )}
                {(!empresaId || !proveedorId) && (
                  <small className="text-muted ms-2">
                    Seleccioná Empresa y Proveedor para habilitar.
                  </small>
                )}
              </Form.Group>

              {it?.gastoestimado?.aplicar && !tieneExistente && (
                <Form.Group className="mb-2 col-md-12">
                  {gm.loading ? (
                    <Alert variant="info" className="py-2">
                      <Spinner size="sm" animation="border" className="me-2" />
                      Buscando instancias del período {ymFromDate(it.fecha)}…
                    </Alert>
                  ) : gm.error ? (
                    <Alert variant="warning" className="py-2">{gm.error}</Alert>
                  ) : (gm.items || []).length === 0 ? (
                    <Alert variant="secondary" className="py-2">
                      No se encontró instancia mensual para este proveedor en {ymFromDate(it.fecha)}.
                    </Alert>
                  ) : (
                    <div className="p-2 border rounded">
                      <Form.Group>
                        <Form.Label>Instancia mensual</Form.Label>
                        <Form.Select
                          value={it.gastoestimado?.instancia_id || ""}
                          onChange={(e) =>
                            updateField(idx, "gastoestimado", {
                              ...(it.gastoestimado || {}),
                              instancia_id: e.target.value,
                              aplicar: true,
                            })
                          }
                        >
                          {(gm.items || [])
                            .slice()
                            .sort((a, b) =>
                              String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento))
                            )
                            .map((ins) => {
                              const base = Number(ins.monto_real ?? ins.monto_estimado ?? 0);
                              return (
                                <option key={ins.id} value={ins.id}>
                                  #{ins.id} · {ins.descripcion || "—"} · vence {ins.fecha_vencimiento} · $
                                  {base.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  {" · "}{ins.estado}
                                </option>
                              );
                            })}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mt-3">
                        <Form.Check
                          type="checkbox"
                          id={`gm-cancel-${idx}`}
                          label="Cancelar renovación de la plantilla"
                          checked={!!it.gastoestimado?.cancelar_renovacion}
                          onChange={(e) =>
                            updateField(idx, "gastoestimado", {
                              ...(it.gastoestimado || {}),
                              cancelar_renovacion: e.target.checked,
                              aplicar: true,
                            })
                          }
                        />
                        <small className="text-muted">
                          Si la instancia queda pagada y no marcás esta opción, se generará la del mes siguiente.
                        </small>
                      </Form.Group>
                    </div>
                  )}
                </Form.Group>
              )}
            </div>

            <div className="d-flex justify-content-end">
              <Button size="sm" variant="outline-danger" onClick={() => removeRow(idx)}>
                Eliminar
              </Button>
            </div>

            {/* Avisos de validación para CTActe */}
            {esCC && (!tieneExistente) && (faltaFechaPagoCC || faltaFormaFuturaCC) && (
              <div className="mt-2">
                <Alert variant="danger" className="py-1">
                  Completá {faltaFechaPagoCC ? "la fecha de pago" : ""}{faltaFechaPagoCC && faltaFormaFuturaCC ? " y " : ""}{faltaFormaFuturaCC ? "la forma de pago futura" : ""} para esta fila de Cuenta Corriente.
                </Alert>
              </div>
            )}
          </div>
        );
      })}

      <div className="d-flex justify-content-end mt-2" style={{ gap: 16 }}>
        <div>
          Total comprobante: <strong>${Number(total || 0).toFixed(2)}</strong>
        </div>
        <div>
          Pagos: <strong>${Number(suma || 0).toFixed(2)}</strong>
        </div>
        <div>
          Restante{" "}
          <strong style={{ color: valido ? "inherit" : "crimson" }}>
            ${Number(restante || 0).toFixed(2)}
          </strong>
        </div>
      </div>
    </Container>
  );
}
