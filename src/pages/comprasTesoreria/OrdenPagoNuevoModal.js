// src/components/tesoreria/OrdenPagoNuevoModal.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import FormasPagoOrdenEditor from "./FormasPagoOrdenEditor";

const apiUrl = process.env.REACT_APP_API_URL;

export default function OrdenPagoNuevoModal({ show, onClose, onCreated }) {
  const dataContext = useContext(Contexts.DataContext);
  const {
    empresaSeleccionada,
    proveedoresTabla = [],
    formasPagoTesoreria = [],
  } = dataContext || {};

  const [proveedorId, setProveedorId] = useState("");
  const [impagos, setImpagos] = useState([]);
  const [aplicados, setAplicados] = useState({}); // { compId: monto }
  const [pagos, setPagos] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState("");
  const [loadingImpagos, setLoadingImpagos] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Reset al cerrar
  useEffect(() => {
    if (!show) {
      setProveedorId("");
      setImpagos([]);
      setAplicados({});
      setPagos([]);
      setFecha(new Date().toISOString().slice(0, 10));
      setObservaciones("");
    }
  }, [show]);

  // Cargar impagos cuando cambia proveedor
  useEffect(() => {
    const load = async () => {
      if (!proveedorId) { setImpagos([]); return; }
      setLoadingImpagos(true);
      try {
        const qs = empresaSeleccionada?.id ? `?empresa_id=${empresaSeleccionada.id}` : "";
        const res = await fetch(`${apiUrl}/ordenes-pago/proveedor/${proveedorId}/comprobantes-impagos${qs}`, {
          credentials: "include",
        });
        const data = await res.json();

        setImpagos(Array.isArray(data) ? data : []);
        // Prefija montos en 0
        const preset = {};
        for (const c of (Array.isArray(data) ? data : [])) preset[c.id] = 0;
        setAplicados(preset);
      } catch (err) {
        console.error("❌ impagos:", err);
        setImpagos([]);
        setAplicados({});
      } finally {
        setLoadingImpagos(false);
      }
    };
    load();
  }, [proveedorId, empresaSeleccionada?.id]);

  const totalAplicar = useMemo(
    () => Object.values(aplicados).reduce((acc, v) => acc + (Number(v) || 0), 0),
    [aplicados]
  );

  const totalPagos = useMemo(
    () => pagos.reduce((acc, it) => acc + (Number(it.monto) || 0), 0),
    [pagos]
  );

  const medioFromFp = (fpId) => {
    const fp = formasPagoTesoreria.find(f => Number(f.id) === Number(fpId));
    const desc = (fp?.descripcion || "").toLowerCase();
    if (/caja|efectivo/.test(desc)) return "caja";
    if (/transfer/.test(desc)) return "transferencia";
    if (/e-?\s*cheq|echeq/.test(desc)) return "echeq";
    if (/tarjeta|cr[eé]dito|d[eé]bito/.test(desc)) return "tarjeta";
    if (/cta\.?\s*cte|cuenta\s*corriente/.test(desc)) return "ctacte";
    return "desconocido";
  };

  const montosOk = totalPagos >= totalAplicar && totalAplicar > 0 && proveedorId;

  const handleConfirmar = async () => {
    try {
      if (!proveedorId) {
        alert("Seleccioná un proveedor.");
        return;
      }
      const items = Object.entries(aplicados)
        .map(([compId, monto]) => ({ comprobanteegreso_id: Number(compId), monto_aplicado: Number(monto || 0) }))
        .filter(x => x.monto_aplicado > 0);

      if (items.length === 0) {
        alert("Seleccioná al menos un comprobante con monto a aplicar.");
        return;
      }
      if (totalPagos < totalAplicar) {
        alert("La suma de pagos debe ser mayor o igual al total aplicado.");
        return;
      }

      // Validaciones rápidas por medio (sin cambios) …
      for (const p of pagos) {
        const medio = medioFromFp(p.formapago_id);
        const monto = Number(p.monto || 0);
        if (monto <= 0) return alert("Hay un pago con monto inválido.");
        if (medio === "ctacte") return alert("La forma 'Cuenta Corriente' no está permitida en OP.");
        if (p?.existing_ref) continue;
        if (medio === "caja" && !p.caja_id) return alert("Pago en caja requiere caja abierta.");
        if (medio === "transferencia" && !p.banco_id) return alert("Transferencia requiere seleccionar banco.");
        if (medio === "echeq" && (!p.banco_id || !p.fecha_vencimiento))
          return alert("eCheq requiere banco y fecha de vencimiento.");
        if (medio === "tarjeta" && (!p.tipotarjeta_id || !p.marcatarjeta_id || !p.cupon_numero))
          return alert("Tarjeta requiere Tipo, Marca y Nº cupón.");
      }

      // Normalizar pagos (sin cambios) …
      const pagosNormalized = pagos.map((p) => {
        const base = {
          medio: medioFromFp(p.formapago_id),
          formapago_id: p.formapago_id ? Number(p.formapago_id) : null,
          monto: Number(p.monto || 0),
        };
        if (p?.existing_ref) {
          return { ...base, existing_ref: { tipo: p.existing_ref.tipo, id: Number(p.existing_ref.id) } };
        }
        return {
          ...base,
          fecha: p.fecha || fecha,
          detalle: p.detalle || null,
          caja_id: p.caja_id ? Number(p.caja_id) : null,
          banco_id: p.banco_id ? Number(p.banco_id) : null,
          referencia: p.referencia || null,
          cbu_alias_destino: p.cbu_alias_destino || null,
          titular_destino: p.titular_destino || null,
          numero_echeq: p.numero_echeq || null,
          fecha_vencimiento: p.fecha_vencimiento || null,
          tipotarjeta_id: p.tipotarjeta_id ? Number(p.tipotarjeta_id) : null,
          marcatarjeta_id: p.marcatarjeta_id ? Number(p.marcatarjeta_id) : null,
          cupon_numero: p.cupon_numero || null,
          planpago_id: p.planpago_id ? Number(p.planpago_id) : null,
        };
      });

      // 👉 NUEVO: determinar ordenpago_id a partir de los comprobantes seleccionados
      // Tomamos sólo los impagos a los que se les aplica monto > 0
      const compsSeleccionados = impagos.filter(c => Number(aplicados[c.id] || 0) > 0);

      console.log("seleccionados", compsSeleccionados)

      // Extraer ordenpago_id no nulos/ni vacíos y deduplicar
      const opIds = [
        ...new Set(
          compsSeleccionados
            .map(c => c?.ordenpago_id)
            .filter(v => v !== null && v !== undefined && String(v).trim() !== "")
        ),
      ];

      // Regla: si todos los seleccionados comparten el MISMO ordenpago_id => lo enviamos.
      // En cualquier otro caso (0 o más de 1 distintos) no enviamos nada (backend seguirá lógica "clásica").
      const ordenPagoIdParaEnviar = opIds.length === 1 ? Number(opIds[0]) : null;

      // Si querés ser estrict@, podés avisar si hay varios distintos:
      // if (opIds.length > 1) {
      //   alert("Los comprobantes seleccionados tienen distintos ordenpago_id. No se enviará ninguno.");
      // }

      setEnviando(true);

      const body = {
        empresa_id: empresaSeleccionada?.id || null,
        proveedor_id: Number(proveedorId),
        fecha,
        observaciones: observaciones || null,
        items,
        pagos: pagosNormalized,
        ...(ordenPagoIdParaEnviar ? { ordenpago_id: ordenPagoIdParaEnviar } : {}), // 👈 agregado condicional
      };

      const res = await fetch(`${apiUrl}/ordenes-pago/emitir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "No se pudo emitir la orden de pago");
      }

      onCreated?.();
    } catch (err) {
      console.error("❌ emitir OP:", err);
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };
  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Pago</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Proveedor</Form.Label>
              <Form.Select
                value={proveedorId || ""}
                onChange={(e) => setProveedorId(e.target.value)}
                className="form-control my-input"
              >
                <option value="">Seleccione...</option>
                {proveedoresTabla.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3 col-md-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3 col-md-12">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </Form.Group>
          </div>

          {/* Comprobantes impagos */}
          <h6 className="mt-2">Comprobantes impagos</h6>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Sel.</th>
                <th>Comprobante</th>
                <th>Fecha</th>
                <th className="text-end">Saldo</th>
                <th style={{ width: 180 }} className="text-end">Aplicar</th>
              </tr>
            </thead>
            <tbody>
              {loadingImpagos && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">Cargando...</td>
                </tr>
              )}
              {!loadingImpagos && impagos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">Sin comprobantes con saldo.</td>
                </tr>
              )}
              {!loadingImpagos && impagos.map((c) => {
                const sel = Number(aplicados[c.id] || 0) > 0;
                const saldo = Number(c.saldo || 0);
                return (
                  <tr key={c.id}>
                    <td className="text-center">
                      <Form.Check
                        checked={sel}
                        onChange={(e) => {
                          const next = { ...aplicados };
                          if (e.target.checked) {
                            next[c.id] = saldo; // aplicar todo por defecto
                          } else {
                            next[c.id] = 0;
                          }
                          setAplicados(next);
                        }}
                      />
                    </td>
                    <td>{c.nrocomprobante || c.id}</td>
                    <td>{c.fechacomprobante || ""}</td>
                    <td className="text-end">${Number(c.saldo || 0).toFixed(2)}</td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max={saldo}
                        disabled={!sel}
                        value={aplicados[c.id] || 0}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          if (v < 0) return;
                          const next = { ...aplicados, [c.id]: Math.min(v, saldo) };
                          setAplicados(next);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
              {!loadingImpagos && impagos.length > 0 && (
                <tr>
                  <td colSpan={4}><strong>Total a aplicar</strong></td>
                  <td className="text-end"><strong>${totalAplicar.toFixed(2)}</strong></td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Editor de pagos (sin cta cte) */}
          <FormasPagoOrdenEditor
            totalReferencia={totalAplicar}
            value={pagos}
            onChange={setPagos}
          />
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <div className="me-auto text-muted">
          Pagos: <strong>${totalPagos.toFixed(2)}</strong> — A aplicar: <strong>${totalAplicar.toFixed(2)}</strong>
          {totalPagos >= totalAplicar && totalAplicar > 0 ? (
            <span className="ms-2">✅</span>
          ) : (
            <span className="ms-2">⚠️</span>
          )}
        </div>

        <Button variant="secondary" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button
          variant="success"
          onClick={handleConfirmar}
          disabled={enviando || !montosOk}
        >
          {enviando ? "Emitiendo..." : "Confirmar Pago"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
