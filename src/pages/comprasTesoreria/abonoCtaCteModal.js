// src/components/tesoreria/AbonoCtaCteModal.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import FormasPagoOrdenEditor from "./FormasPagoOrdenEditor";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * GET esperada:
 *   GET /movimientos-cta-cte-proveedor/cargos-abiertos?empresa_id=:eid&proveedor_id=:pid
 *   => { rows: [{ id, fecha, descripcion, comprobanteegreso_id, nrocomprobante, saldo, ordenpago_id? }] }
 *
 * GET (nuevo):
 *   GET /movimientos-cta-cte-proveedor/abonos-disponibles?empresa_id=:eid&proveedor_id=:pid
 *   => { rows: [{ id, fecha, descripcion, importe, aplicado, saldo }] }
 *
 * POST (pagos nuevos):
 *   POST /movimientos-cta-cte-proveedor/aplicar
 *   body: {
 *     empresa_id, proveedor_id, fecha, descripcion,
 *     aplicaciones: [{cargo_id, importe}],
 *     pagos: [...],
 *     ordenpago_id?: number
 *   }
 *
 * POST (anticipo existente):
 *   POST /movimientos-cta-cte-proveedor/aplicar-anticipo
 *   body: {
 *     empresa_id, proveedor_id, abono_id,
 *     aplicaciones: [{cargo_id, importe}],
 *     incluirNumerosComp?: boolean
 *   }
 */
export default function AbonoCtaCteModal({ show, onClose, onCreated }) {
  const dataContext = useContext(Contexts.DataContext);
  const {
    empresaSeleccionada,
    proveedoresTabla = [],
    formasPagoTesoreria = [],
  } = dataContext || {};

  const [proveedorId, setProveedorId] = useState("");
  const [cargos, setCargos] = useState([]);        // cargos pendientes
  const [aplicados, setAplicados] = useState({});  // { cargoId: importe }
  const [pagos, setPagos] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // NUEVO: origen + anticipos
  const [origen, setOrigen] = useState("pagos"); // "pagos" | "anticipo"
  const [abonos, setAbonos] = useState([]);      // anticipos con saldo>0
  const [abonoIdSel, setAbonoIdSel] = useState(null);
  const [loadingAbonos, setLoadingAbonos] = useState(false);

  // --- Cargar anticipos cuando sea necesario ---
  useEffect(() => {
    const loadAbonos = async () => {
      console.log("🔵 loadAbonos() start", { show, origen, proveedorId, empresaId: empresaSeleccionada?.id });
      if (!show || origen !== "anticipo" || !proveedorId) {
        console.log("ℹ️ No cargo abonos: condiciones no cumplidas");
        setAbonos([]);
        return;
      }
      setLoadingAbonos(true);
      try {
        const qs = new URLSearchParams();
        if (empresaSeleccionada?.id) qs.set("empresa_id", empresaSeleccionada.id);
        qs.set("proveedor_id", proveedorId);
        const url = `${apiUrl}/movimientos-cta-cte-proveedor/abonos-disponibles?${qs}`;
        console.log("🌐 GET", url);

        const res = await fetch(url, { credentials: "include" });
        console.log("📡 response", { ok: res.ok, status: res.status });
        const text = await res.text();
        console.log("📦 raw text", text);
        let data;
        try { data = JSON.parse(text); } catch (e) {
          console.error("❌ JSON parse error:", e);
          data = null;
        }
        console.log("📦 parsed data", data);

        const arr = Array.isArray(data?.rows) ? data.rows : (Array.isArray(data) ? data : []);
        console.log("✅ abonos (rows) length:", arr.length);
        setAbonos(arr.filter(a => Number(a.saldo || 0) > 0));
      } catch (e) {
        console.error("❌ abonos disponibles:", e);
        setAbonos([]);
      } finally {
        setLoadingAbonos(false);
      }
    };
    loadAbonos();
  }, [show, origen, proveedorId, empresaSeleccionada?.id, apiUrl]);

  // Reset al cerrar
  useEffect(() => {
    if (!show) {
      setProveedorId("");
      setCargos([]);
      setAplicados({});
      setPagos([]);
      setFecha(new Date().toISOString().slice(0, 10));
      setDescripcion("");
      setOrigen("pagos");
      setAbonos([]);
      setAbonoIdSel(null);
    }
  }, [show]);

  // Cargar CARGOS pendientes cuando cambia proveedor
  useEffect(() => {
    const load = async () => {
      if (!proveedorId) { setCargos([]); return; }
      setLoadingCargos(true);
      try {
        const qs = new URLSearchParams();
        if (empresaSeleccionada?.id) qs.set("empresa_id", empresaSeleccionada.id);
        qs.set("proveedor_id", proveedorId);

        const res = await fetch(`${apiUrl}/movimientos-cta-cte-proveedor/cargos-abiertos?${qs}`, {
          credentials: "include",
        });
        const data = await res.json();

        console.log("data cargos-abiertos", data);

        // Soportar ambos formatos: {rows:[...]} o array plano
        const arr = Array.isArray(data?.rows) ? data.rows : (Array.isArray(data) ? data : []);
        setCargos(arr);

        // Prefija montos en 0
        const preset = {};
        for (const c of arr) preset[c.id] = 0;
        setAplicados(preset);
      } catch (err) {
        console.error("❌ cargos pendientes:", err);
        setCargos([]);
        setAplicados({});
      } finally {
        setLoadingCargos(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedorId, empresaSeleccionada?.id]);

  const totalAplicar = useMemo(
    () => Object.values(aplicados).reduce((acc, v) => acc + (Number(v) || 0), 0),
    [aplicados]
  );

  const totalPagos = useMemo(
    () => pagos.reduce((acc, it) => acc + (Number(it.monto) || 0), 0),
    [pagos]
  );

  // Helper para derivar "medio" desde formapago_id (coincide con tu editor)
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

  const fpById = useMemo(() => {
    const m = new Map();
    (formasPagoTesoreria || []).forEach(fp => {
      m.set(Number(fp.id), fp.descripcion || fp.nombre || `ID ${fp.id}`);
    });
    return m;
  }, [formasPagoTesoreria]);

  const fpDesc = (id) => {
    if (id === null || id === undefined || id === "") return "-";
    return fpById.get(Number(id)) || `ID ${id}`;
  };

  const abonoSel = useMemo(
    () => abonos.find(a => Number(a.id) === Number(abonoIdSel)) || null,
    [abonos, abonoIdSel]
  );
  const saldoAbonoSel = Number(abonoSel?.saldo || 0);

  // Validación final: permitir confirmar si (anticipo + pagos) alcanzan el total a aplicar
  const montosOk = origen === "pagos"
    ? (totalPagos >= totalAplicar && totalAplicar > 0 && proveedorId)
    : ((saldoAbonoSel + totalPagos) >= totalAplicar && totalAplicar > 0 && proveedorId && (abonoSel || totalPagos > 0));

  // Obtiene ordenpago_id desde un cargo (tolerante a distintos nombres de campo)
  const readOrdenPagoIdFromCargo = (cargo) =>
    cargo?.ordenpago_id ??
    cargo?.op_id ??
    cargo?.comprobante_ordenpago_id ??
    null;

  const handleConfirmar = async () => {
    try {
      console.log("▶ handleConfirmar()", { origen, proveedorId, totalAplicar, totalPagos });

      const aplicaciones = Object.entries(aplicados)
        .map(([cargoId, importe]) => ({ cargo_id: Number(cargoId), importe: Number(importe || 0) }))
        .filter(x => x.importe > 0);
      console.log("🧮 aplicaciones", aplicaciones);

      if (!proveedorId) return alert("Seleccioná un proveedor.");
      if (aplicaciones.length === 0)
        return alert("Seleccioná al menos un cargo con monto a aplicar.");

      setEnviando(true);

      // ======== MODO ANTICIPO: anticipo + (opcional) pagos por remanente ========
      if (origen === "anticipo") {
        console.log("🟣 usando anticipo", { abonoIdSel, abonoSel, saldoAbonoSel, totalAplicar, totalPagos });
        if (!abonoSel && totalPagos <= 0)
          return alert("Seleccioná un anticipo o cargá pagos.");

        // 1) Aplicar anticipo hasta donde alcance
        let aplicadoPorAnticipo = 0;
        let aplicacionesRealizadas = [];
        if (abonoSel) {
          const bodyAnt = {
            empresa_id: empresaSeleccionada?.id || null,
            proveedor_id: Number(proveedorId),
            abono_id: Number(abonoSel.id),
            aplicaciones,             // el backend capea por saldo anticipo y saldo cargo
            incluirNumerosComp: true,
          };
          const urlAnt = `${apiUrl}/movimientos-cta-cte-proveedor/aplicar-anticipo`;
          console.log("🌐 POST", urlAnt, bodyAnt);

          const resAnt = await fetch(urlAnt, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(bodyAnt),
          });
          const textAnt = await resAnt.text();
          console.log("📡 aplicar-anticipo resp", { ok: resAnt.ok, status: resAnt.status, textAnt });

          if (!resAnt.ok) {
            let err;
            try { err = JSON.parse(textAnt); } catch { err = {}; }
            throw new Error(err?.error || "No se pudo aplicar el anticipo");
          }

          const dataAnt = JSON.parse(textAnt);
          aplicadoPorAnticipo = Number(dataAnt?.totalAplicado || 0);
          aplicacionesRealizadas = Array.isArray(dataAnt?.aplicacionesRealizadas)
            ? dataAnt.aplicacionesRealizadas
            : [];
        }

        // 2) Calcular remanente por cargo = solicitado - aplicadoPorAnticipo (por cargo)
        const aplicadoPorCargo = new Map(
          aplicacionesRealizadas.map(a => [Number(a.cargo_id), Number(a.aplicado || 0)])
        );
        const aplicacionesRestantes = aplicaciones
          .map(a => {
            const ya = aplicadoPorCargo.get(Number(a.cargo_id)) || 0;
            const rem = Math.max(0, Number(a.importe || 0) - ya);
            return { cargo_id: Number(a.cargo_id), importe: rem };
          })
          .filter(a => a.importe > 0);

        const totalRestante = aplicacionesRestantes.reduce((acc, x) => acc + x.importe, 0);
        console.log("🧮 remanente por aplicar con pagos", { totalRestante, aplicacionesRestantes });

        if (totalRestante <= 0) {
          // Listo solo con anticipo
          onCreated?.();
          return;
        }

        // 3) Validar que los pagos alcanzan el remanente
        if (totalPagos < totalRestante) {
          return alert(`Falta cubrir $${(totalRestante - totalPagos).toFixed(2)} con pagos.`);
        }

        // 4) Normalizar pagos → backend
        const pagosNormalized = pagos.map((p) => ({
          medio: medioFromFp(p.formapago_id),
          formapago_id: p.formapago_id ? Number(p.formapago_id) : null,
          monto: Number(p.monto || 0),
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
        }));

        // (Opcional) detectar ordenpago_id si todos los cargos comparten una
        const cargoIdsSeleccionados = aplicacionesRestantes.map(a => a.cargo_id);
        const cargosSeleccionados = cargos.filter(c => cargoIdsSeleccionados.includes(Number(c.id)));
        const opIds = [
          ...new Set(
            cargosSeleccionados
              .map(c => readOrdenPagoIdFromCargo(c))
              .filter(v => v !== null && v !== undefined && String(v).trim?.() !== "")
          ),
        ];
        const ordenPagoIdParaEnviar = opIds.length === 1 ? Number(opIds[0]) : null;

        // 5) Aplicar pagos por el remanente
        const bodyPagos = {
          empresa_id: empresaSeleccionada?.id || null,
          proveedor_id: Number(proveedorId),
          fecha,
          descripcion: descripcion || null,
          aplicaciones: aplicacionesRestantes, // solo lo que faltó
          pagos: pagosNormalized,
          incluirNumerosComp: true,
          ...(ordenPagoIdParaEnviar ? { ordenpago_id: ordenPagoIdParaEnviar } : {}),
        };

        const urlPagos = `${apiUrl}/movimientos-cta-cte-proveedor/aplicar`;
        console.log("🌐 POST", urlPagos, bodyPagos);

        const resPagos = await fetch(urlPagos, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(bodyPagos),
        });

        const textPagos = await resPagos.text();
        console.log("📡 aplicar (pagos) resp", { ok: resPagos.ok, status: resPagos.status, textPagos });

        if (!resPagos.ok) {
          let err;
          try { err = JSON.parse(textPagos); } catch { err = {}; }
          throw new Error(err?.error || "No se pudo aplicar el remanente con pagos");
        }

        onCreated?.();
        return;
      }

      // ======== MODO PAGOS (flujo original) ========
      if (totalPagos < totalAplicar) {
        return alert("La suma de pagos debe ser mayor o igual al total aplicado.");
      }

      // Validaciones de pagos
      for (const p of pagos) {
        const medio = medioFromFp(p.formapago_id);
        const monto = Number(p.monto || 0);
        if (monto <= 0) return alert("Hay un pago con monto inválido.");
        if (medio === "ctacte") return alert("La forma 'Cuenta Corriente' no está permitida como medio de pago.");
        if (p?.existing_ref) return alert("No se permiten movimientos existentes en este flujo.");
        if (medio === "caja" && !p.caja_id) return alert("Pago en caja requiere caja abierta.");
        if (medio === "transferencia" && !p.banco_id) return alert("Transferencia requiere seleccionar banco.");
        if (medio === "echeq" && (!p.banco_id || !p.fecha_vencimiento))
          return alert("eCheq requiere banco y fecha de vencimiento.");
        if (medio === "tarjeta" && (!p.tipotarjeta_id || !p.marcatarjeta_id || !p.cupon_numero))
          return alert("Tarjeta requiere Tipo, Marca y Nº cupón.");
      }

      const pagosNormalized = pagos.map((p) => ({
        medio: medioFromFp(p.formapago_id),
        formapago_id: p.formapago_id ? Number(p.formapago_id) : null,
        monto: Number(p.monto || 0),
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
      }));

      // calcular ordenpago_id si aplica
      const cargoIdsSeleccionados = aplicaciones.map(a => a.cargo_id);
      const cargosSeleccionados = cargos.filter(c => cargoIdsSeleccionados.includes(Number(c.id)));
      const opIds = [
        ...new Set(
          cargosSeleccionados
            .map(c => readOrdenPagoIdFromCargo(c))
            .filter(v => v !== null && v !== undefined && String(v).trim?.() !== "")
        ),
      ];
      const ordenPagoIdParaEnviar = opIds.length === 1 ? Number(opIds[0]) : null;

      const body = {
        empresa_id: empresaSeleccionada?.id || null,
        proveedor_id: Number(proveedorId),
        fecha,
        descripcion: descripcion || null,
        aplicaciones,
        pagos: pagosNormalized,
        incluirNumerosComp: true,
        ...(ordenPagoIdParaEnviar ? { ordenpago_id: ordenPagoIdParaEnviar } : {}),
      };

      console.log("🌐 POST /movimientos-cta-cte-proveedor/aplicar", body);

      const res = await fetch(`${apiUrl}/movimientos-cta-cte-proveedor/aplicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const text = await res.text();
      console.log("📡 aplicar resp", { ok: res.ok, status: res.status, text });

      if (!res.ok) {
        let err;
        try { err = JSON.parse(text); } catch { err = {}; }
        throw new Error(err?.error || "No se pudo aplicar el abono");
      }

      onCreated?.();

    } catch (err) {
      console.error("❌ aplicar abono:", err);
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Aplicar abono a cargos de Cta Cte</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Proveedor</Form.Label>
              <Form.Select
                value={proveedorId || ""}
                onChange={(e) => {
                  console.log("👤 proveedor change", e.target.value);
                  setProveedorId(e.target.value);
                }}
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
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="(Opcional) Se completará con los números de comprobante aplicados"
              />
            </Form.Group>
          </div>

          {/* CARGOS pendientes (con saldo) */}
          <h6 className="mt-2">Cargos pendientes</h6>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Sel.</th>
                <th>Cargo</th>
                <th>Fecha</th>
                <th>Comp.</th>
                <th>FP Acordada</th>
                <th className="text-end">Saldo</th>
                <th style={{ width: 180 }} className="text-end">Aplicar</th>
              </tr>
            </thead>
            <tbody>
              {loadingCargos && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">Cargando...</td>
                </tr>
              )}
              {!loadingCargos && cargos.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">Sin cargos pendientes.</td>
                </tr>
              )}
              {!loadingCargos && cargos.map((c) => {
                const cargoId = c.id;
                const sel = Number(aplicados[cargoId] || 0) > 0;
                const saldo = Number(c.saldo || 0);
                return (
                  <tr key={cargoId}>
                    <td className="text-center">
                      <Form.Check
                        checked={sel}
                        onChange={(e) => {
                          const next = { ...aplicados };
                          next[cargoId] = e.target.checked ? saldo : 0;
                          setAplicados(next);
                        }}
                      />
                    </td>
                    <td>{cargoId}</td>
                    <td>{c.fecha || ""}</td>
                    <td>{c.nrocomprobante || c.comprobante_nro || c.comprobanteegreso_id || "-"}</td>
                    <td>{fpDesc(c.formapago_id)}</td>
                    <td className="text-end">${Number(saldo).toFixed(2)}</td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max={saldo}
                        disabled={!sel}
                        value={aplicados[cargoId] || 0}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          if (v < 0) return;
                          setAplicados(prev => ({ ...prev, [cargoId]: Math.min(v, saldo) }));
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
              {!loadingCargos && cargos.length > 0 && (
                <tr>
                  <td colSpan={4}><strong>Total a aplicar</strong></td>
                  <td colSpan={3} className="text-end"><strong>${totalAplicar.toFixed(2)}</strong></td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Origen de fondos */}
          <div className="mb-3">
            <Form.Label>Origen de fondos</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="radio"
                label="Crear pagos ahora"
                name="origenFondos"
                checked={origen === "pagos"}
                onChange={() => { console.log("🟢 origen -> pagos"); setOrigen("pagos"); }}
              />
              <Form.Check
                type="radio"
                label="Usar anticipo existente"
                name="origenFondos"
                checked={origen === "anticipo"}
                onChange={() => { console.log("🟣 origen -> anticipo"); setOrigen("anticipo"); }}
                className="mx-2"
              />
            </div>
          </div>

          {origen === "anticipo" && (
            <>
              <h6 className="mt-2">Anticipos disponibles</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}></th>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th className="text-end">Importe</th>
                    <th className="text-end">Aplicado</th>
                    <th className="text-end">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAbonos && (
                    <tr><td colSpan={7} className="text-center text-muted">Cargando anticipos...</td></tr>
                  )}
                  {!loadingAbonos && abonos.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted">Sin anticipos con saldo disponible.</td></tr>
                  )}
                  {!loadingAbonos && abonos.map(a => (
                    <tr key={a.id}>
                      <td className="text-center">
                        <Form.Check
                          type="radio"
                          name="abonoSel"
                          checked={Number(abonoIdSel) === Number(a.id)}
                          onChange={() => setAbonoIdSel(a.id)}
                        />
                      </td>
                      <td>{a.id}</td>
                      <td>{a.fecha || ""}</td>
                      <td>{a.descripcion || "-"}</td>
                      <td className="text-end">${Number(a.importe || 0).toFixed(2)}</td>
                      <td className="text-end">${Number(a.aplicado || 0).toFixed(2)}</td>
                      <td className="text-end">${Number(a.saldo || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {!loadingAbonos && abonos.length > 0 && (
                    <tr>
                      <td colSpan={6}><strong>Saldo del anticipo seleccionado</strong></td>
                      <td className="text-end">
                        <strong>{abonoSel ? `$${saldoAbonoSel.toFixed(2)}` : "-"}</strong>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          )}

          {/* Editor de pagos */}
          {origen === "pagos" ? (
            <FormasPagoOrdenEditor
              totalReferencia={totalAplicar}
              value={pagos}
              onChange={setPagos}
            />
          ) : (
            <>
              <h6 className="mt-3">Pagos adicionales (opcional)</h6>
              <FormasPagoOrdenEditor
                totalReferencia={Math.max(0, totalAplicar - saldoAbonoSel)}
                value={pagos}
                onChange={setPagos}
              />
            </>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <div className="me-auto text-muted">
          {origen === "pagos" ? (
            <>Pagos: <strong>${totalPagos.toFixed(2)}</strong> — A aplicar: <strong>${totalAplicar.toFixed(2)}</strong></>
          ) : (
            <>Anticipo: <strong>${saldoAbonoSel.toFixed(2)}</strong> + Pagos: <strong>${totalPagos.toFixed(2)}</strong> — A aplicar: <strong>${totalAplicar.toFixed(2)}</strong></>
          )}
          {montosOk ? <span className="ms-2">✅</span> : <span className="ms-2">⚠️</span>}
        </div>

        <Button variant="secondary" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button
          variant="success"
          onClick={handleConfirmar}
          disabled={enviando || !montosOk}
        >
          {enviando ? "Aplicando..." : "Confirmar Abono"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
