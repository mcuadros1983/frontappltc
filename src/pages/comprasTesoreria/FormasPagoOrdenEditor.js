// src/components/tesoreria/FormasPagoOrdenEditor.jsx
import { useMemo, useContext, useEffect, useState } from "react";
import { Button, Form, Spinner, Alert } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * props:
 * - totalReferencia: number (para mostrar guía, no bloquea)
 * - value: array (filas)
 * - onChange(nextArray)
 */
export default function FormasPagoOrdenEditor({
  totalReferencia = 0,
  value = [],
  onChange,
}) {
  const dataContext = useContext(Contexts.DataContext) || {};
  const {
    cajaAbierta,
    formasPagoTesoreria = [],
    bancosTabla = [],
    tiposTarjetaTabla = [],
    marcasTarjetaTabla = [],
    planTarjetaTesoreriaTabla = [],
    empresaSeleccionada,
    proveedoresTabla = [],
  } = dataContext;

  const empresaId = empresaSeleccionada?.id || null;

  // === Estado auxiliar por fila ===
  const [opcionesPorFila, setOpcionesPorFila] = useState({}); // disponibles por fila
  const setOpc = (idx, patch) =>
    setOpcionesPorFila((prev) => ({ ...prev, [idx]: { ...(prev[idx] || {}), ...patch } }));

  // === helpers dominio ===
  const byFPId = (fpId) => formasPagoTesoreria.find((f) => Number(f.id) === Number(fpId));
  const has = (fpId, re) => {
    const fp = byFPId(fpId);
    return fp ? re.test((fp.descripcion || "").toLowerCase()) : false;
  };
  const esCaja = (fpId) => has(fpId, /caja|efectivo/i);
  const esTransfer = (fpId) => has(fpId, /transfer/i);
  const esEcheq = (fpId) => has(fpId, /e-?\s*cheq|echeq/i);
  const esTarjeta = (fpId) => has(fpId, /tarjeta|cr[eé]dito|d[eé]bito/i);
  const esCtaCte = (fpId) => has(fpId, /cta\.?\s*cte|cuenta\s*corriente/i); // NO se usa en OP
  const medioFromFp = (fpId) => esCaja(fpId) ? "caja" : esTransfer(fpId) ? "transferencia" : esEcheq(fpId) ? "echeq" : esTarjeta(fpId) ? "tarjeta" : esCtaCte(fpId) ? "ctacte" : "desconocido";
  const tipoExistingFromMedio = (medio) => ({ caja: "caja", transferencia: "banco", echeq: "echeq", tarjeta: "tarjeta" }[medio] || null);

  const suma = useMemo(() => value.reduce((a, r) => a + (Number(r.monto) || 0), 0), [value]);

  const addRow = () => {
    onChange?.([
      ...value,
      {
        formapago_id: "",
        monto: "",
        fecha: new Date().toISOString().slice(0, 10),
        detalle: "",
        // condicionales
        caja_id: "",
        banco_id: "",
        referencia: "",
        numero_echeq: "",
        fecha_vencimiento: "",
        tipotarjeta_id: "",
        marcatarjeta_id: "",
        cupon_numero: "",
        planpago_id: "",
        // vinculación de movimiento existente
        existing_ref: null, // { tipo, id, monto }
      }
    ]);
  };

  const removeRow = (idx) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange?.(next);
    setOpc(idx, { items: [], chosen: null, error: null });
  };

  const updateField = (idx, name, val) => {
    const next = value.slice();
    next[idx] = { ...next[idx], [name]: val };
    onChange?.(next);
  };

  // autocompletar caja_id si corresponde
  useEffect(() => {
    if (!onChange || !cajaAbierta?.caja?.id || !Array.isArray(value) || value.length === 0) return;
    let changed = false;
    const next = value.map((row) => {
      if (esCaja(row.formapago_id) && !row.caja_id && !row.existing_ref) {
        changed = true;
        return { ...row, caja_id: cajaAbierta.caja.id };
      }
      return row;
    });
    if (changed) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cajaAbierta?.caja?.id, value, formasPagoTesoreria]);

  // === Buscar disponibles (mov. existentes) ===
  const buscarDisponibles = async (idx) => {
    const row = value[idx];
    const fpId = row?.formapago_id;
    const medio = medioFromFp(fpId);
    // OP: NO soportamos cta cte como medio de pago
    if (!empresaId || !fpId || medio === "desconocido" || medio === "ctacte") {
      setOpc(idx, { error: "Completar Empresa y Forma de pago válida", items: [] });
      return;
    }
    try {
      setOpc(idx, { loading: true, error: null });
      const qs = new URLSearchParams();
      qs.set("medio", medio);
      // En OP no filtramos por proveedor necesariamente (puede o no tenerlo el movimiento),
      // pero si querés podés sumar ?proveedor_id=X para acotar:
      // if (proveedorId) qs.set("proveedor_id", String(proveedorId));
      const res = await fetch(`${apiUrl}/tesoreria/disponibles?${qs.toString()}`, { credentials: "include" });
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
    // Monto que usamos para cuadrar visualmente
    const importe = Number(it.importe ?? it.monto ?? 0);

    const next = value.slice();
    next[idx] = {
      ...row,
      existing_ref: { tipo, id: it.id, monto: importe },
      monto: String(importe),
    };
    onChange?.(next);
    setOpc(idx, { chosen: it });
  };

  const quitarExistente = (idx) => {
    const row = value[idx];
    const next = value.slice();
    next[idx] = { ...row, existing_ref: null };
    onChange?.(next);
    setOpc(idx, { chosen: null });
  };

  return (
    <div className="p-2 border rounded">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="small text-muted">
          Total ref.: <strong>${Number(totalReferencia || 0).toFixed(2)}</strong> ·
          Suma pagos: <strong>${Number(suma || 0).toFixed(2)}</strong>
        </div>
        <Button size="sm" variant="outline-primary" onClick={addRow}>+ Agregar forma de pago</Button>
      </div>

      {value.map((row, idx) => {
        const medio = medioFromFp(row.formapago_id);
        const usingExisting = !!row.existing_ref;

        return (
          <div key={idx} className="p-2 mb-2 border rounded">
            <div className="row g-2">
              <div className="col-md-3">
                <Form.Label>Forma de pago</Form.Label>
                <Form.Select
                  value={row.formapago_id ?? ""}
                  onChange={(e) => {
                    const fpId = e.target.value;

                    // limpiar existing_ref y opciones
                    setOpc(idx, { chosen: null, items: [] });

                    // una sola actualización del array
                    onChange?.(
                      value.map((r, i) =>
                        i === idx
                          ? {
                            ...r,
                            formapago_id: fpId,
                            existing_ref: null,
                            // opcional: limpiar campos condicionales al cambiar FP
                            banco_id: "",
                            referencia: "",
                            numero_echeq: "",
                            fecha_vencimiento: "",
                            tipotarjeta_id: "",
                            marcatarjeta_id: "",
                            cupon_numero: "",
                            planpago_id: "",
                            // sugerir caja si corresponde
                            caja_id:
                              /caja|efectivo/i.test(
                                (formasPagoTesoreria.find(f => Number(f.id) === Number(fpId))?.descripcion || "")
                              ) && (cajaAbierta?.caja?.id)
                                ? cajaAbierta.caja.id
                                : ""
                          }
                          : r
                      )
                    );
                  }}
                  className="form-control my-input"
                >
                  <option value="">Seleccione…</option>
                  {formasPagoTesoreria.map(fp => (
                    <option key={fp.id} value={fp.id}>{fp.descripcion}</option>
                  ))}
                </Form.Select>

              </div>

              <div className="col-md-2">
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={row.monto}
                  onChange={(e) => updateField(idx, "monto", e.target.value)}
                  readOnly={usingExisting}
                />
                {usingExisting && (
                  <small className="text-muted">Monto tomado del movimiento existente</small>
                )}
              </div>

              <div className="col-md-2">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={row.fecha || ""}
                  onChange={(e) => updateField(idx, "fecha", e.target.value)}
                  disabled={usingExisting}
                />
              </div>

              {/* <div className="col-md-5">
                <Form.Label>Detalle</Form.Label>
                <Form.Control
                  value={row.detalle || ""}
                  onChange={(e) => updateField(idx, "detalle", e.target.value)}
                  placeholder="(Opcional)"
                  disabled={usingExisting}
                />
              </div> */}

              {/* Campos condicionales si NO usa existente */}
              {!usingExisting && (
                <>


                  {esTransfer(row.formapago_id) && (
                    <div className="col-md-3">
                      <Form.Label>Banco</Form.Label>
                      <Form.Select
                        value={row.banco_id || ""}
                        onChange={(e) => updateField(idx, "banco_id", e.target.value)}
                        className="form-control my-input"
                      >
                        <option value="">Seleccione…</option>
                        {bancosTabla
                          .filter(b => !empresaId || Number(b.empresa_id) === Number(empresaId))
                          .map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                            </option>
                          ))}
                      </Form.Select>
                    </div>
                  )}

                  {esEcheq(row.formapago_id) && (
                    <>
                      <div className="col-md-3">
                        <Form.Label>Banco</Form.Label>
                        <Form.Select
                          value={row.banco_id || ""}
                          onChange={(e) => updateField(idx, "banco_id", e.target.value)}
                          className="form-control my-input"
                        >
                          <option value="">Seleccione…</option>
                          {bancosTabla
                            .filter(b => !empresaId || Number(b.empresa_id) === Number(empresaId))
                            .map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                              </option>
                            ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-3">
                        <Form.Label>Vencimiento</Form.Label>
                        <Form.Control
                          type="date"
                          value={row.fecha_vencimiento || ""}
                          onChange={(e) => updateField(idx, "fecha_vencimiento", e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <Form.Label>N° eCheq</Form.Label>
                        <Form.Control
                          value={row.numero_echeq || ""}
                          onChange={(e) => updateField(idx, "numero_echeq", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {esTarjeta(row.formapago_id) && (
                    <>
                      <div className="col-md-3">
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select
                          value={row.tipotarjeta_id || ""}
                          onChange={(e) => updateField(idx, "tipotarjeta_id", e.target.value)}
                          className="form-control my-input"
                        >
                          <option value="">Seleccione…</option>
                          {tiposTarjetaTabla.map((t) => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-3">
                        <Form.Label>Marca</Form.Label>
                        <Form.Select
                          value={row.marcatarjeta_id || ""}
                          onChange={(e) => updateField(idx, "marcatarjeta_id", e.target.value)}
                          className="form-control my-input"
                        >
                          <option value="">Seleccione…</option>
                          {marcasTarjetaTabla.map((m) => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-3">
                        <Form.Label>Cupón</Form.Label>
                        <Form.Control
                          value={row.cupon_numero || ""}
                          onChange={(e) => updateField(idx, "cupon_numero", e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <Form.Label>Plan (opcional)</Form.Label>
                        <Form.Select
                          value={row.planpago_id || ""}
                          onChange={(e) => updateField(idx, "planpago_id", e.target.value)}
                          className="form-control my-input"
                        >
                          <option value="">Sin plan</option>
                          {planTarjetaTesoreriaTabla.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.descripcion || p.nombre || `Plan #${p.id}`}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Selector de movimiento existente */}
              <div className="col-12 d-flex align-items-end" style={{ gap: 8 }}>
                <Button
                  size="sm"
                  variant="outline-primary"
                  disabled={!row.formapago_id || esCtaCte(row.formapago_id)}
                  onClick={() => buscarDisponibles(idx)}
                  className="my-2"
                >
                  Buscar disponibles
                </Button>

                {opcionesPorFila[idx]?.loading && <Spinner size="sm" className="ms-2" />}

                {(opcionesPorFila[idx]?.items || []).length > 0 && !usingExisting && (
                  <>
                    <Form.Select
                      size="sm"
                      className="form-control my-input"
                      onChange={(e) => elegirExistente(idx, e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Elegir existente…</option>
                      {opcionesPorFila[idx].items.map((it) => {
                        const monto = Number(it.importe ?? it.monto ?? 0);
                        return (
                          <option key={it.id} value={it.id}>
                            #{it.id} · ${monto.toFixed(2)} · {(it.descripcion || it.observaciones || "").slice(0, 40)}
                          </option>
                        );
                      })}
                    </Form.Select>
                    <small className="text-muted">
                      Al elegir uno, se usará el mismo importe y no se crearán nuevos movimientos.
                    </small>
                  </>
                )}

                {usingExisting && (
                  <>
                    <Alert variant="success" className="py-1 px-2 mb-0">
                      Usando existente: {row.existing_ref?.tipo} #{row.existing_ref?.id}
                    </Alert>
                    <Button variant="outline-danger" size="sm" onClick={() => quitarExistente(idx)}>
                      Quitar
                    </Button>
                  </>
                )}

                {opcionesPorFila[idx]?.error && (
                  <span className="text-danger small ms-2">{opcionesPorFila[idx].error}</span>
                )}
              </div>

              <div className="col-12 d-flex justify-content-end">
                <Button variant="outline-danger" size="sm" onClick={() => removeRow(idx)}>
                  Eliminar fila
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
