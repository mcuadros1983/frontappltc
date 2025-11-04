import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Table, Row, Col, Alert } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Modal para calcular/guardar una liquidación (Recibo).
 */
export default function LiquidacionMensualModal({ show, onClose, empleados, periodos, empresaIdDefault }) {
  const [empleadoId, setEmpleadoId] = useState("");
  const [periodoId, setPeriodoId] = useState("");

  const [recibo, setRecibo] = useState(null);
  const [adicionalesVar, setAdicionalesVar] = useState([]);
  const [adicionalesFijos, setAdicionalesFijos] = useState([]);
  const [adelantosAdm, setAdelantosAdm] = useState([]);

  const [sueldo, setSueldo] = useState("");
  const [aBanco, setABanco] = useState("");

  // acumuladores
  const [posVars, setPosVars] = useState(0);
  const [negVarsAbs, setNegVarsAbs] = useState(0);
  const [posFijos, setPosFijos] = useState(0);
  const [negFijosAbs, setNegFijosAbs] = useState(0);
  const [adelantosAbs, setAdelantosAbs] = useState(0);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [exVars, setExVars] = useState(new Set());        // IDs de AdicionalVariable
  const [exFijosRefs, setExFijosRefs] = useState(new Set()); // refs/códigos/idx de fijos (clave unificada)
  const [exAdelantos, setExAdelantos] = useState(new Set()); // IDs de AdelantoEmpleado

  // === Helper de clave única para fijos (UI, recálculo y backend) ===
  const fijoKey = (f, idx) =>
    String(f?.referencia ?? f?.codigo ?? f?.id ?? idx).toUpperCase();

  // helper para alternar en un Set
  const toggleSet = (setter) => (key) =>
    setter(prev => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });

  const toggleVar = toggleSet(setExVars);
  const toggleFijo = toggleSet(setExFijosRefs);
  const toggleAdel = toggleSet(setExAdelantos);

  const formatMonto = (valor) =>
    new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .format(Number(valor) || 0);

  const periodoSel = useMemo(
    () => periodos.find((x) => String(x.id) === String(periodoId)) || null,
    [periodos, periodoId]
  );

  const nombreEmpleado = useMemo(() => {
    const emp = empleados.find((e) => String(e?.empleado?.id) === String(empleadoId));
    const ap = emp?.clientePersona?.apellido || emp?.empleado?.apellido || "";
    const no = emp?.clientePersona?.nombre || emp?.empleado?.nombre || "";
    return `${ap} ${no}`.trim() || "—";
  }, [empleados, empleadoId]);

  const nombrePeriodo = useMemo(() => {
    if (!periodoSel) return "—";
    const mm = String(periodoSel.mes).padStart(2, "0");
    return `${periodoSel.anio}-${mm}`;
  }, [periodoSel]);

  // Fechas del período
  const periodoFechaDesde = useMemo(() => {
    if (!periodoSel) return null;
    if (periodoSel.fecha_desde) return periodoSel.fecha_desde;
    const y = Number(periodoSel.anio);
    const m = String(periodoSel.mes).padStart(2, "0");
    return `${y}-${m}-01`;
  }, [periodoSel]);

  const periodoFechaHasta = useMemo(() => {
    if (!periodoSel) return null;
    if (periodoSel.fecha_hasta) return periodoSel.fecha_hasta;
    const y = Number(periodoSel.anio);
    const m = Number(periodoSel.mes);
    const d = new Date(y, m, 0); // último día del mes
    const yyyy = d.getFullYear();
    const mm = String(m).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [periodoSel]);

  // Preselecciones al abrir
  useEffect(() => {
    if (!show) return;
    setErr(null);
    if (empleados.length && !empleadoId) setEmpleadoId(empleados[0]?.empleado?.id ?? "");
    if (periodos.length && !periodoId) setPeriodoId(String(periodos[0]?.id ?? ""));
  }, [show, empleados, periodos]); // eslint-disable-line

  // Cargar datos al cambiar empleado/período
  useEffect(() => {
    const load = async () => {
      if (!empleadoId || !periodoId) {
        setRecibo(null);
        setAdicionalesVar([]);
        setAdicionalesFijos([]);
        setAdelantosAdm([]);
        setSueldo("");
        setABanco("");
        setPosVars(0);
        setNegVarsAbs(0);
        setPosFijos(0);
        setNegFijosAbs(0);
        setAdelantosAbs(0);
        setExVars(new Set());
        setExFijosRefs(new Set());
        setExAdelantos(new Set());
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        // 1) Recibo existente
        const qsR = new URLSearchParams();
        qsR.set("empleado_id", empleadoId);
        qsR.set("periodo_id", periodoId);
        if (empresaIdDefault) qsR.set("empresa_id", String(empresaIdDefault));
        qsR.set("order", "updatedAt");
        qsR.set("dir", "DESC");
        qsR.set("limit", "1");
        const rR = await fetch(`${apiUrl}/liquidacion/recibo?${qsR.toString()}`, { credentials: "include" });
        const dataR = await rR.json();
        const rec = Array.isArray(dataR) && dataR.length ? dataR[0] : null;
        setRecibo(rec);
        setSueldo(rec?.sueldo != null ? String(rec.sueldo) : "");
        setABanco(rec?.acobrarporbanco != null ? String(rec.acobrarporbanco) : "");

        // 2) Fijos vigentes
        let fijos = [];
        if (periodoFechaHasta) {
          const qsF = new URLSearchParams();
          qsF.set("empleado_id", empleadoId);
          qsF.set("fecha", periodoFechaHasta);
          const rF = await fetch(`${apiUrl}/empleadoadicionalfijo/vigentes?${qsF.toString()}`, { credentials: "include" });
          const dataF = await rF.json();
          fijos = Array.isArray(dataF) ? dataF : [];
        }
        setAdicionalesFijos(fijos);

        // 3) Variables del período
        const qsA = new URLSearchParams();
        qsA.set("empleado_id", empleadoId);
        qsA.set("periodo_id", periodoId);
        qsA.set("limit", "1000");
        const rA = await fetch(`${apiUrl}/adicionalvariable?${qsA.toString()}`, { credentials: "include" });
        const dataA = await rA.json();
        const vars = Array.isArray(dataA) ? dataA : [];
        setAdicionalesVar(vars);

        // 4) Adelantos (rango del período)
        let adelantos = [];
        if (periodoFechaDesde && periodoFechaHasta) {
          const qsAd = new URLSearchParams();
          qsAd.set("empleado_id", empleadoId);
          qsAd.set("fecha_desde", periodoFechaDesde);
          qsAd.set("fecha_hasta", periodoFechaHasta);
          qsAd.set("limit", "1000");
          const rAd = await fetch(`${apiUrl}/adelantosempleado?${qsAd.toString()}`, { credentials: "include" });
          const dataAd = await rAd.json();
          adelantos = Array.isArray(dataAd) ? dataAd : [];
        }
        setAdelantosAdm(adelantos);

        // 5) Acumuladores base (se corrigen luego con exclusiones)
        let _posVars = 0, _negVarsAbs = 0;
        for (const it of vars) {
          const m = Number(it.monto || 0);
          if (m > 0) _posVars += m;
          else if (m < 0) _negVarsAbs += Math.abs(m);
        }

        let _posFijos = 0, _negFijosAbs = 0;
        for (const f of fijos) {
          const m = Number(f.monto || 0);
          if (m > 0) _posFijos += m;
          else if (m < 0) _negFijosAbs += Math.abs(m);
        }

        let _adelantosAbs = 0;
        for (const ad of adelantos) {
          const m = Number(ad.monto || 0);
          if (m > 0) _adelantosAbs += m; // siempre suman como descuento
        }

        setPosVars(_posVars);
        setNegVarsAbs(_negVarsAbs);
        setPosFijos(_posFijos);
        setNegFijosAbs(_negFijosAbs);
        setAdelantosAbs(_adelantosAbs);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar información para el cálculo.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [empleadoId, periodoId, apiUrl, periodoFechaDesde, periodoFechaHasta, empresaIdDefault]);

  // Recalcular totales teniendo en cuenta exclusiones
  useEffect(() => {
    // Variables
    let _posVars = 0, _negVarsAbs = 0;
    adicionalesVar.forEach((it) => {
      if (exVars.has(Number(it.id))) return; // excluido
      const m = Number(it.monto || 0);
      if (m > 0) _posVars += m;
      else if (m < 0) _negVarsAbs += Math.abs(m);
    });

    // Fijos (usar SIEMPRE la misma clave que en la UI: fijoKey)
    let _posFijos = 0, _negFijosAbs = 0;
    adicionalesFijos.forEach((f, idx) => {
      const ref = fijoKey(f, idx);
      if (exFijosRefs.has(ref)) return; // excluido
      const m = Number(f.monto || 0);
      if (m > 0) _posFijos += m;
      else if (m < 0) _negFijosAbs += Math.abs(m);
    });

    // Adelantos
    let _adelantosAbs = 0;
    adelantosAdm.forEach((ad) => {
      if (exAdelantos.has(Number(ad.id))) return; // excluido
      const m = Number(ad.monto || 0);
      if (m > 0) _adelantosAbs += m; // siempre descuento
    });

    setPosVars(_posVars);
    setNegVarsAbs(_negVarsAbs);
    setPosFijos(_posFijos);
    setNegFijosAbs(_negFijosAbs);
    setAdelantosAbs(_adelantosAbs);
  }, [adicionalesVar, adicionalesFijos, adelantosAdm, exVars, exFijosRefs, exAdelantos]);

  // Totales calculados en el front (incluye override de sueldo y banco)
  const totalHaberes = useMemo(() => {
    const s = Number(sueldo || 0);
    return s + Number(posVars || 0) + Number(posFijos || 0);
  }, [sueldo, posVars, posFijos]);

  const descuentos = useMemo(() => {
    return Number(negVarsAbs || 0) + Number(negFijosAbs || 0) + Number(adelantosAbs || 0);
  }, [negVarsAbs, negFijosAbs, adelantosAbs]);

  const aSucursal = useMemo(() => {
    const banco = Number(aBanco || 0);
    return totalHaberes - descuentos - banco;
  }, [totalHaberes, descuentos, aBanco]);

  // Guardar: snapshot + override (patch mínimo) + exclusiones
  const guardar = async () => {
    try {
      setSaving(true);
      setErr(null);

      if (!empleadoId) throw new Error("Seleccioná un empleado.");
      if (!periodoId) throw new Error("Seleccioná un período.");
      if (!empresaIdDefault) throw new Error("Falta empresa seleccionada.");

      // 1) Snapshot en backend, limitado al empleado y empresa actuales
      const qs = new URLSearchParams({
        empleado_id: String(empleadoId),
        empresa_id: String(empresaIdDefault),
      });

      // construir objeto excluir
      const excluir = {
        variables: Array.from(exVars).map(Number),
        fijos_refs: Array.from(exFijosRefs), // claves tal cual se usaron aquí (fijoKey)
        adelantos: Array.from(exAdelantos).map(Number),
      };

      const r = await fetch(`${apiUrl}/liquidacion/${periodoId}/calcular?${qs.toString()}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excluir }),
      });

      if (!r.ok) {
        let msg = "No se pudo liquidar el período.";
        try {
          const x = await r.json();
          if (x?.error) msg = x.error;
        } catch (_) {}
        throw new Error(msg);
      }

      // 2) Obtener el recibo resultante del snapshot
      const qsR = new URLSearchParams({
        empleado_id: String(empleadoId),
        periodo_id: String(periodoId),
        empresa_id: String(empresaIdDefault),
        order: "updatedAt",
        dir: "DESC",
        limit: "1",
      });
      const rRec = await fetch(`${apiUrl}/liquidacion/recibo?${qsR.toString()}`, { credentials: "include" });
      const dataRec = await rRec.json();
      const rcv = Array.isArray(dataRec) && dataRec.length ? dataRec[0] : null;
      if (!rcv?.id) throw new Error("No se encontró el recibo luego de liquidar.");

      // 3) Construir patch mínimo según override del front
      const sueldoNum = sueldo !== "" ? Number(sueldo) : 0;
      const bancoNum = aBanco !== "" ? Number(aBanco) : 0;
      const haberesNum = Number(totalHaberes);
      const descNum = Number(descuentos);
      const sucNum = Number(haberesNum - descNum - bancoNum);

      const patch = {};
      if (Number(rcv.sueldo ?? 0) !== sueldoNum) patch.sueldo = sueldoNum;
      if (Number(rcv.acobrarporbanco ?? 0) !== bancoNum) patch.acobrarporbanco = bancoNum;
      if (Number(rcv.totalhaberes ?? 0) !== haberesNum) patch.totalhaberes = haberesNum;
      if (Number(rcv.descuentos ?? 0) !== descNum) patch.descuentos = descNum;
      if (Number(rcv.acobrarporsucursal ?? 0) !== sucNum) patch.acobrarporsucursal = sucNum;

      // 4) Si hay cambios, PUT al recibo
      if (Object.keys(patch).length > 0) {
        patch.estado = "calculado";
        patch.empleado_id = Number(empleadoId);
        patch.periodo_id = Number(periodoId);
        patch.empresa_id = Number(empresaIdDefault);

        const rPut = await fetch(`${apiUrl}/liquidacion/recibo/${rcv.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
          credentials: "include",
        });
        if (!rPut.ok) {
          const x = await rPut.json().catch(() => ({}));
          throw new Error(x?.error || "No se pudo actualizar el recibo con los cambios.");
        }
      }

      onClose(true);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const onExited = () => {
    setErr(null);
    setEmpleadoId("");
    setPeriodoId("");
    setRecibo(null);
    setAdicionalesVar([]);
    setAdicionalesFijos([]);
    setAdelantosAdm([]);
    setSueldo("");
    setABanco("");
    setPosVars(0);
    setNegVarsAbs(0);
    setPosFijos(0);
    setNegFijosAbs(0);
    setAdelantosAbs(0);
  };

  return (
    <Modal show={show} onHide={() => onClose(false)} onExited={onExited} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Calcular Liquidación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Empleado</Form.Label>
              <Form.Select
                value={empleadoId}
                onChange={(e) => setEmpleadoId(e.target.value)}
                className="form-control my-input"
              >
                {empleados.length === 0 && <option value="">— Sin empleados —</option>}
                {empleados.map((item) => {
                  const id = item?.empleado?.id;
                  const ap = item?.clientePersona?.apellido || item?.empleado?.apellido || "";
                  const no = item?.clientePersona?.nombre || item?.empleado?.nombre || "";
                  return (
                    <option key={id} value={id}>
                      {ap} {no}
                    </option>
                  );
                })}
              </Form.Select>
              <small className="text-muted">Seleccionado: {nombreEmpleado}</small>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Período</Form.Label>
              <Form.Select
                value={periodoId}
                onChange={(e) => setPeriodoId(e.target.value)}
                className="form-control my-input"
              >
                {periodos.length === 0 && <option value="">— Sin períodos —</option>}
                {periodos.map((p) => {
                  const mm = String(p.mes).padStart(2, "0");
                  return (
                    <option key={p.id} value={p.id}>
                      {p.anio}-{mm}
                    </option>
                  );
                })}
              </Form.Select>
              <small className="text-muted">Seleccionado: {nombrePeriodo}</small>
            </Form.Group>
          </Col>
        </Row>

        <hr />

        {loading ? (
          <div className="py-3 text-center">
            <Spinner size="sm" className="me-2" /> Cargando datos…
          </div>
        ) : (
          <>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Sueldo</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={sueldo}
                    onChange={(e) => setSueldo(e.target.value)}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>A cobrar por banco</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={aBanco}
                    onChange={(e) => setABanco(e.target.value)}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Alert variant="light" className="w-100 mb-0">
                  <div className="d-flex justify-content-between">
                    <span>Total Haberes</span>
                    <span className="fw-semibold">${formatMonto(totalHaberes)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Descuentos</span>
                    <span className="fw-semibold">${formatMonto(descuentos)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <strong>A cobrar en sucursal</strong>
                    <span className="fw-semibold">${formatMonto(aSucursal)}</span>
                  </div>
                </Alert>
              </Col>
            </Row>

            <hr />

            {/* Fijos vigentes */}
            <Row className="mb-3">
              <Col>
                <h6 className="mb-2">Adicionales fijos vigentes</h6>
                <div className="table-responsive">
                  <Table bordered hover size="sm" striped>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}></th>
                        <th style={{ width: 100 }}>Código</th>
                        <th>Descripción</th>
                        <th style={{ width: 140 }}>Monto</th>
                        <th style={{ width: 120 }}>Fuente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adicionalesFijos.length ? (
                        adicionalesFijos.map((f, idx) => {
                          const ref = fijoKey(f, idx);
                          const checked = !exFijosRefs.has(ref);
                          return (
                            <tr key={idx}>
                              <td className="text-center">
                                <Form.Check
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleFijo(ref)}
                                  title={checked ? "Incluir" : "Excluido"}
                                />
                              </td>
                              <td>{f.codigo ?? "—"}</td>
                              <td>{f.descripcion || <span className="text-muted">—</span>}</td>
                              <td>${formatMonto(f.monto)}</td>
                              <td>{f.fuente || <span className="text-muted">—</span>}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center">Sin fijos vigentes para este período/empleado</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>

            {/* Adelantos en administración (solo si existen) */}
            {adelantosAdm.length > 0 && (
              <>
                <h6 className="mb-2">Adelantos en administración</h6>
                <div className="table-responsive mb-3">
                  <Table bordered hover size="sm" striped>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}></th>
                        <th style={{ width: 120 }}>Fecha</th>
                        <th style={{ width: 140 }}>Monto</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adelantosAdm.map((ad) => {
                        const id = Number(ad.id);
                        const checked = !exAdelantos.has(id);
                        return (
                          <tr key={ad.id}>
                            <td className="text-center">
                              <Form.Check
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAdel(id)}
                                title={checked ? "Incluir" : "Excluido"}
                              />
                            </td>
                            <td>{ad.fecha}</td>
                            <td>{`-$${formatMonto(ad.monto)}`}</td>
                            <td>{ad.observaciones || <span className="text-muted">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </>
            )}

            {/* Variables */}
            <Row>
              <Col>
                <h6 className="mb-2">Adicionales y Descuentos del período</h6>
                <div className="table-responsive">
                  <Table bordered hover size="sm" striped>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}></th>
                        <th style={{ width: 80 }}>ID</th>
                        <th>Descripción</th>
                        <th style={{ width: 110 }}>Monto</th>
                        <th style={{ width: 120 }}>Fecha</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adicionalesVar.length ? (
                        adicionalesVar.map((a) => {
                          const id = Number(a.id);
                          const checked = !exVars.has(id);
                          return (
                            <tr key={a.id}>
                              <td className="text-center">
                                <Form.Check
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleVar(id)}
                                  title={checked ? "Incluir" : "Excluido"}
                                />
                              </td>
                              <td>{a.id}</td>
                              <td>{a.descripcion || <span className="text-muted">—</span>}</td>
                              <td>${formatMonto(a.monto)}</td>
                              <td>{a.fecha || <span className="text-muted">—</span>}</td>
                              <td>{a.observaciones || <span className="text-muted">—</span>}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">Sin adicionales para este período/empleado</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                <small className="text-muted">
                  Los montos positivos se suman a <strong>Total Haberes</strong>. Los montos negativos y los adelantos alimentan <strong>Descuentos</strong>.
                </small>
              </Col>
            </Row>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>Cancelar</Button>
        <Button onClick={guardar} disabled={saving || !empleadoId || !periodoId || !empresaIdDefault}>
          {saving ? (<><Spinner size="sm" className="me-2" />Guardando…</>) : "Guardar liquidación"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
