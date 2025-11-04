// IvaProyeccion.jsx
import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Table, Spinner, Badge, Pagination } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

// ---- Helpers ----
const toMoney = (n) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const diffDaysInclusive = (d1, d2) => {
  const a = new Date(d1 + "T00:00:00");
  const b = new Date(d2 + "T00:00:00");
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((b - a) / ms) + 1;
};

const daysInMonthFromDate = (isoYmd /* 'YYYY-MM-DD' */) => {
  const [y, m] = isoYmd.split("-").map((x) => parseInt(x, 10));
  if (!y || !m) return 0;
  return new Date(y, m, 0).getDate();
};

const isBetweenYMD = (ymd, desde, hasta) => {
  if (!ymd) return false;
  return (!desde || ymd >= desde) && (!hasta || ymd <= hasta);
};

const includesNotaCredito = (desc = "") => {
  const s = (desc || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
  // Busca "NOTA CREDITO" o "NOTA DE CREDITO"
  return /NOTA\s+(DE\s+)?CREDITO/.test(s);
};

// ---- API ----
async function fetchEmpresaById(id) {
  const r = await fetch(`${apiUrl}/empresas/${id}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudo obtener la empresa.");
  return r.json(); // { id, descripcion, cuit, nombrecorto, cuit }
}

async function fetchIvaDebitoDesdeCierreZ({ cuit, fechaDesde, fechaHasta }) {
  const r = await fetch(`${apiUrl}/caja/cierrez/filtrados`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cuit, fechaDesde, fechaHasta }),
  });
  if (!r.ok) throw new Error("No se pudo obtener CierreZ.");
  const data = await r.json(); // [{iva105, iva21, ivaTotal, fechaJornada, ...}]
  const totalIvaDebitoZ = data.reduce((acc, z) => acc + Number(z.ivaTotal || 0), 0);
  return { totalIvaDebitoZ, registros: data };
}

async function fetchTiposComprobantesMap() {
  const r = await fetch(`${apiUrl}/tipos-comprobantes`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener Tipos de Comprobante.");
  const arr = await r.json(); // [{id, descripcion}]
  const map = new Map();
  (arr || []).forEach((t) => map.set(Number(t.id), t.descripcion || ""));
  return map;
}

// --- Comprobantes de Ingreso (Débito fijo) ---
async function fetchComprobantesIngreso({ empresaId, fechaDesde, fechaHasta }) {
  const qs = new URLSearchParams();
  if (empresaId) qs.set("empresa_id", String(empresaId));
  if (fechaDesde) qs.set("desde", fechaDesde);
  if (fechaHasta) qs.set("hasta", fechaHasta);

  const r = await fetch(`${apiUrl}/comprobantes-ingreso?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener Comprobantes de Ingreso.");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchIvaDebitoComprobantesIngreso({ empresaId, fechaDesde, fechaHasta }) {
  const [tiposMap, comprobantes] = await Promise.all([
    fetchTiposComprobantesMap(),
    fetchComprobantesIngreso({ empresaId, fechaDesde, fechaHasta }),
  ]);

  const filtered = comprobantes.filter((c) => {
    if (empresaId && Number(c.empresa_id) !== Number(empresaId)) return false;
    if (!isBetweenYMD(c.fechacomprobante, fechaDesde, fechaHasta)) return false;
    return true;
  });

  let totalIvaDebitoCI = 0;
  for (const c of filtered) {
    const ivaTotal = Number(c.iva105 || 0) + Number(c.iva21 || 0);
    const descTipo = tiposMap.get(Number(c.tipocomprobante_id)) || "";
    const sign = includesNotaCredito(descTipo) ? -1 : 1; // NC resta
    totalIvaDebitoCI += sign * ivaTotal;
  }

  return { totalIvaDebitoCI, registros: filtered };
}

// --- Compras proyectadas (Crédito) ---
async function fetchIvaCreditoCompras({ empresaId, fechaDesde, fechaHasta, incluirInformadas = true }) {
  const qs = new URLSearchParams();
  if (empresaId) qs.set("empresa_id", String(empresaId));
  if (fechaDesde) qs.set("desde", fechaDesde);
  if (fechaHasta) qs.set("hasta", fechaHasta);
  if (!incluirInformadas) qs.set("informada", "false");

  const r = await fetch(`${apiUrl}/compraproyectada?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudo obtener compras proyectadas.");
  const data = await r.json();

  // Filtro defensivo por si el backend no aplica el parámetro
  const arr = Array.isArray(data) ? data : [];
  const registros = incluirInformadas ? arr : arr.filter((it) => !Boolean(it.informada));

  const totalIvaCredito = registros.reduce((acc, it) => acc + Number(it.iva || 0), 0);
  return { totalIvaCredito, registros };
}

// --- Comprobantes de Egreso (Crédito fijo) ---
async function fetchComprobantesEgreso({ empresaId, fechaDesde, fechaHasta }) {
  const qs = new URLSearchParams();
  if (empresaId) qs.set("empresa_id", String(empresaId));
  if (fechaDesde) qs.set("desde", fechaDesde);
  if (fechaHasta) qs.set("hasta", fechaHasta);

  const r = await fetch(`${apiUrl}/comprobantes-egreso?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron obtener Comprobantes de Egreso.");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function fetchIvaCreditoComprobantesEgreso({ empresaId, fechaDesde, fechaHasta }) {
  const [tiposMap, comprobantes] = await Promise.all([
    fetchTiposComprobantesMap(),
    fetchComprobantesEgreso({ empresaId, fechaDesde, fechaHasta }),
  ]);

  const filtered = comprobantes.filter((c) => {
    if (empresaId && Number(c.empresa_id ?? c.empresaId) !== Number(empresaId)) return false;
    if (!isBetweenYMD(c.fechacomprobante, fechaDesde, fechaHasta)) return false;
    return true;
  });

  let totalIvaCreditoCE = 0;
  for (const c of filtered) {
    const ivaTotal = Number(c.iva105 || 0) + Number(c.iva21 || 0);
    const descTipo = tiposMap.get(Number(c.tipocomprobante_id)) || "";
    // En crédito: NC resta el crédito
    const sign = includesNotaCredito(descTipo) ? -1 : 1;
    totalIvaCreditoCE += sign * ivaTotal;
  }

  return { totalIvaCreditoCE, registros: filtered };
}

export default function IvaProyeccion() {
  const dataContext = useContext(Contexts?.DataContext || null);
  const empresaSeleccionada = dataContext?.empresaSeleccionada || null;

  const disabledUI = !empresaSeleccionada?.id;

  // Datos de empresa (desde backend para obtener CUIT)
  const [empresa, setEmpresa] = useState(null);
  const [empresaErr, setEmpresaErr] = useState(null);
  const [empresaLoading, setEmpresaLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    async function run() {
      setEmpresa(null);
      setEmpresaErr(null);
      if (!empresaSeleccionada?.id) return;
      try {
        setEmpresaLoading(true);
        const emp = await fetchEmpresaById(empresaSeleccionada.id);
        if (!cancel) setEmpresa(emp);
      } catch (e) {
        if (!cancel) setEmpresaErr(e.message || "Error obteniendo la empresa.");
      } finally {
        if (!cancel) setEmpresaLoading(false);
      }
    }
    run();
    return () => { cancel = true; };
  }, [empresaSeleccionada?.id]);

  // Entradas de usuario
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [diasNoOperativosMes, setDiasNoOperativosMes] = useState(0);
  const [proyectarCompras, setProyectarCompras] = useState(false);

  // Estado de cálculo
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [resultado, setResultado] = useState(null);

  // Registros completos (para cálculo) y paginación (solo visual)
  const [cierresZ, setCierresZ] = useState([]);
  const [czPage, setCzPage] = useState(1);
  const CZ_PAGE_SIZE = 20;

  const calcular = useCallback(async () => {
    try {
      setErr(null);
      setResultado(null);
      setCierresZ([]);
      setCzPage(1);

      if (disabledUI) {
        setErr("Para proyectar, seleccioná una empresa.");
        return;
      }
      if (!empresa?.cuit) {
        setErr("No se encontró CUIT de la empresa.");
        return;
      }
      if (!fechaDesde || !fechaHasta) {
        setErr("Completá las fechas Desde y Hasta.");
        return;
      }
      if (new Date(fechaDesde) > new Date(fechaHasta)) {
        setErr("El rango de fechas es inválido (Desde > Hasta).");
        return;
      }

      setLoading(true);

      const empresaId = empresaSeleccionada.id;

      // 1) Traer datos del rango
      const [
        { totalIvaDebitoZ, registros: registrosZ },
        { totalIvaDebitoCI },
        { totalIvaCredito: totalIvaCreditoCompras }, // compras proyectadas (puede proyectarse)
        { totalIvaCreditoCE }                         // egresos (crédito fijo)
      ] = await Promise.all([
        fetchIvaDebitoDesdeCierreZ({ cuit: empresa.cuit, fechaDesde, fechaHasta }),
        fetchIvaDebitoComprobantesIngreso({ empresaId, fechaDesde, fechaHasta }),
        fetchIvaCreditoCompras({ empresaId, fechaDesde, fechaHasta, incluirInformadas: false }),
        fetchIvaCreditoComprobantesEgreso({ empresaId, fechaDesde, fechaHasta }),
      ]);

      setCierresZ(registrosZ || []);

      // Días del rango total (inclusive) y días con registros reales (Z)
      const diasRango = diffDaysInclusive(fechaDesde, fechaHasta);
      const uniqueDaySet = new Set((registrosZ || []).map((z) => String(z.fechaJornada)));
      const diasConRegistro = uniqueDaySet.size;
      const diasSinRegistro = Math.max(0, diasRango - diasConRegistro);

      // 2) Proyección mensual basada en el mes de "hasta"
      const diasMes = daysInMonthFromDate(fechaHasta);
      const diasProyectados = Math.max(0, diasMes - Number(diasNoOperativosMes || 0));

      // Débito (Z proyectable + CI fijo)
      const ivaDebitoProjZ = diasConRegistro > 0 ? (totalIvaDebitoZ / diasConRegistro) * diasProyectados : 0;
      const ivaDebitoRangoTotal = totalIvaDebitoZ + totalIvaDebitoCI;
      const ivaDebitoProjTotal = ivaDebitoProjZ + totalIvaDebitoCI;

      // Crédito (Compras proyectables + Egreso fijo)
      const ivaCreditoComprasProj = proyectarCompras
        ? (diasConRegistro > 0 ? (totalIvaCreditoCompras / diasConRegistro) * diasProyectados : 0)
        : totalIvaCreditoCompras;

      const ivaCreditoRangoTotal = totalIvaCreditoCompras + totalIvaCreditoCE;
      const ivaCreditoProjTotal = ivaCreditoComprasProj + totalIvaCreditoCE;

      // Saldos
      const saldoRango = ivaDebitoRangoTotal - ivaCreditoRangoTotal;
      const saldoProj = ivaDebitoProjTotal - ivaCreditoProjTotal;

      setResultado({
        rango: {
          diasRango,
          diasConRegistro,
          diasSinRegistro,
          ivaDebitoZ: totalIvaDebitoZ,
          ivaDebitoCI: totalIvaDebitoCI,
          ivaDebitoTotal: ivaDebitoRangoTotal,
          ivaCreditoCompras: totalIvaCreditoCompras,
          ivaCreditoFijoCE: totalIvaCreditoCE,
          ivaCreditoTotal: ivaCreditoRangoTotal,
          saldo: saldoRango,
        },
        proyeccion: {
          diasMes,
          diasProyectados,
          factor: diasConRegistro > 0 ? (diasProyectados / diasConRegistro) : 0,
          // Débito
          ivaDebitoProjZ,
          ivaDebitoFijoCI: totalIvaDebitoCI,
          ivaDebitoProjTotal,
          // Crédito
          ivaCreditoComprasProj,
          ivaCreditoFijoCE: totalIvaCreditoCE,
          ivaCreditoProjTotal,
          // Final
          saldoProj,
        },
        parametros: {
          fechaDesde,
          fechaHasta,
          proyectarCompras,
          diasNoOperativosMes: Number(diasNoOperativosMes || 0),
        },
      });
    } catch (e) {
      setErr(e.message || "Error realizando la proyección.");
    } finally {
      setLoading(false);
    }
  }, [
    disabledUI,
    empresa?.cuit,
    empresaSeleccionada?.id,
    fechaDesde,
    fechaHasta,
    diasNoOperativosMes,
    proyectarCompras,
  ]);

  const limpiar = () => {
    setErr(null);
    setResultado(null);
    setCierresZ([]);
    setCzPage(1);
    setFechaDesde("");
    setFechaHasta("");
    setDiasNoOperativosMes(0);
  };

  const headerEmpresa = useMemo(() => {
    if (empresaLoading) return "Cargando empresa…";
    if (empresaErr) return "Empresa (error)";
    if (!empresa) return "Empresa no cargada";
    return `${empresa.nombrecorto || empresa.descripcion || "Empresa"} — CUIT: ${empresa.cuit}`;
  }, [empresa, empresaErr, empresaLoading]);

  // ---- Paginación de cierres Z (solo visual) ----
  const czTotal = cierresZ.length;
  const czTotalPages = Math.max(1, Math.ceil(czTotal / CZ_PAGE_SIZE));
  const czStartIndex = (czPage - 1) * CZ_PAGE_SIZE;
  const czEndIndex = Math.min(czStartIndex + CZ_PAGE_SIZE, czTotal);
  const cierresZPage = useMemo(
    () => cierresZ.slice(czStartIndex, czEndIndex),
    [cierresZ, czStartIndex, czEndIndex]
  );

  const goFirst = () => setCzPage(1);
  const goPrev = () => setCzPage((p) => Math.max(1, p - 1));
  const goNext = () => setCzPage((p) => Math.min(czTotalPages, p + 1));
  const goLast = () => setCzPage(czTotalPages);

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <strong>Proyección de IVA del período</strong>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={limpiar} disabled={disabledUI || empresaLoading}>
                  Limpiar
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {/* Mensaje si no hay empresa */}
              {disabledUI && (
                <Alert variant="warning" className="mb-3">
                  Para proyectar, seleccioná una empresa.
                </Alert>
              )}

              {/* Estado empresa */}
              {!disabledUI && (
                <>
                  {empresaErr && <Alert variant="danger">{empresaErr}</Alert>}
                  {!empresaErr && (
                    <Alert variant="info" className="py-2">
                      {headerEmpresa}
                    </Alert>
                  )}
                </>
              )}

              {err && <Alert variant="danger">{err}</Alert>}

              {/* Parámetros */}
              <Form className="mb-3">
                <Row className="g-3">
                  <Col md={2}>
                    <Form.Label>Desde</Form.Label>
                    <Form.Control
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      disabled={disabledUI || empresaLoading}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      disabled={disabledUI || empresaLoading}
                    />
                  </Col>

                  <Col md={3}>
                    <Form.Label>Feriados / días no operativos del mes</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      value={diasNoOperativosMes}
                      onChange={(e) => setDiasNoOperativosMes(e.target.value)}
                      disabled={disabledUI || empresaLoading}
                    />
                    <Form.Text>Se descuentan del total de días del mes.</Form.Text>
                  </Col>

                  <Col md={3} className="d-flex align-items-end">
                    <Form.Check
                      type="switch"
                      id="proj-compras"
                      label="Proyectar también IVA compras"
                      checked={proyectarCompras}
                      onChange={(e) => setProyectarCompras(e.target.checked)}
                      disabled={disabledUI || empresaLoading}
                    />
                  </Col>

                  <Col md="auto" className="d-flex align-items-end">
                    <Button onClick={calcular} disabled={disabledUI || empresaLoading || loading || !empresa}>
                      {loading ? (<><Spinner size="sm" animation="border" /> Calculando…</>) : "Calcular"}
                    </Button>
                  </Col>
                </Row>
              </Form>

              {/* Resultados: resumen y proyección */}
              {resultado && !disabledUI && (
                <>
                  {/* Resumen del rango (REAL) */}
                  <Card className="mb-3">
                    <Card.Header>Resumen del rango seleccionado</Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={12}>
                          <Table bordered size="sm" className="mb-2">
                            <thead>
                              <tr>
                                <th>Días del rango</th>
                                <th>Días con Cierre Z</th>
                                <th>Días sin Cierre Z</th>
                                <th className="text-end">IVA Débito (Z)</th>
                                <th className="text-end">IVA Débito (Comprob. Ingreso)</th>
                                <th className="text-end">IVA Débito (Total)</th>
                                <th className="text-end">IVA Crédito (Compras Proy.)</th>
                                <th className="text-end">IVA Crédito (Comprob. Egreso)</th>
                                <th className="text-end">IVA Crédito (Total)</th>
                                <th className="text-end">Saldo (Débito - Crédito)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{resultado.rango.diasRango}</td>
                                <td>{resultado.rango.diasConRegistro}</td>
                                <td>{resultado.rango.diasSinRegistro}</td>
                                <td className="text-end">{toMoney(resultado.rango.ivaDebitoZ)}</td>
                                <td className="text-end">{toMoney(resultado.rango.ivaDebitoCI)}</td>
                                <td className="text-end"><strong>{toMoney(resultado.rango.ivaDebitoTotal)}</strong></td>
                                <td className="text-end">{toMoney(resultado.rango.ivaCreditoCompras)}</td>
                                <td className="text-end">{toMoney(resultado.rango.ivaCreditoFijoCE)}</td>
                                <td className="text-end"><strong>{toMoney(resultado.rango.ivaCreditoTotal)}</strong></td>
                                <td className="text-end">

                                  {toMoney(resultado.rango.saldo)}

                                </td>
                              </tr>
                            </tbody>
                          </Table>
                          <div className="text-muted small">
                            * Débito: Comprobantes de Ingreso (NC resta). Crédito: Comprobantes de Egreso (NC resta).
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Proyección mensual */}
                  <Card className="mb-3">
                    <Card.Header>Proyección para todo el mes</Card.Header>
                    <Card.Body>
                      <Row className="mb-2">
                        <Col md={12}>
                          <div className="text-muted">
                            Días del mes: <strong>{resultado.proyeccion.diasMes}</strong> — No operativos:{" "}
                            <strong>{resultado.parametros.diasNoOperativosMes}</strong> — Días proyectados:{" "}
                            <strong>{resultado.proyeccion.diasProyectados}</strong> — Factor (días proycción / días con Z):{" "}
                            <strong>{resultado.proyeccion.factor.toFixed(6)}</strong>
                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={12}>
                          <Table bordered size="sm" className="mb-0">
                            <thead>
                              <tr>
                                <th></th>
                                <th className="text-end">IVA Débito (real Z)</th>
                                <th className="text-end">IVA Débito (proyectado Z)</th>
                                <th className="text-end">IVA Débito</th>
                                <th className="text-end">IVA Débito (TOTAL proyectado)</th>
                                <th className="text-end">IVA Crédito (Compras {resultado.parametros.proyectarCompras ? "proy." : "real"})</th>
                                <th className="text-end">IVA Crédito (CE)</th>
                                <th className="text-end">IVA Crédito (TOTAL {resultado.parametros.proyectarCompras ? "proy." : "real"})</th>
                                <th className="text-end">Saldo (Débito - Crédito)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Proyección</td>
                                <td className="text-end">{toMoney(resultado.rango.ivaDebitoZ)}</td>
                                <td className="text-end">{toMoney(resultado.proyeccion.ivaDebitoProjZ)}</td>
                                <td className="text-end">{toMoney(resultado.proyeccion.ivaDebitoFijoCI)}</td>
                                <td className="text-end"><strong>{toMoney(resultado.proyeccion.ivaDebitoProjTotal)}</strong></td>
                                <td className="text-end">{toMoney(resultado.proyeccion.ivaCreditoComprasProj)}</td>
                                <td className="text-end">{toMoney(resultado.proyeccion.ivaCreditoFijoCE)}</td>
                                <td className="text-end"><strong>{toMoney(resultado.proyeccion.ivaCreditoProjTotal)}</strong></td>
                                <td className="text-end">
                                  {toMoney(resultado.proyeccion.saldoProj)}

                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Detalle de Cierres Z del rango con paginación */}
                  <Card className="mb-3">
                    <Card.Header>
                      Cierres Z incluidos en la proyección (detalle del rango {resultado.parametros.fechaDesde} a {resultado.parametros.fechaHasta})
                    </Card.Header>
                    <Card.Body>
                      {cierresZ.length === 0 ? (
                        <Alert variant="secondary" className="mb-0">No se encontraron Cierres Z para el rango seleccionado.</Alert>
                      ) : (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="text-muted">
                              Mostrando <strong>{czStartIndex + 1}</strong>–<strong>{czEndIndex}</strong> de <strong>{czTotal}</strong> registros
                            </div>
                            <Pagination className="mb-0">
                              <Pagination.First disabled={czPage === 1} onClick={goFirst} />
                              <Pagination.Prev disabled={czPage === 1} onClick={goPrev} />
                              <Pagination.Item active>{czPage}</Pagination.Item>
                              <Pagination.Next disabled={czPage === czTotalPages} onClick={goNext} />
                              <Pagination.Last disabled={czPage === czTotalPages} onClick={goLast} />
                            </Pagination>
                          </div>

                          <div className="table-responsive">
                            <Table bordered hover size="sm">
                              <thead>
                                <tr>
                                  <th>Fecha</th>
                                  <th>PV</th>
                                  <th>N° Z</th>
                                  <th className="text-end">IVA 10,5%</th>
                                  <th className="text-end">IVA 21%</th>
                                  <th className="text-end">IVA Total</th>
                                  <th className="text-end">Neto</th>
                                  <th className="text-end">Total</th>
                                  <th>Emitidos</th>
                                  <th>Cancelados</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cierresZPage.map((z) => (
                                  <tr key={z.id}>
                                    <td>{z.fechaJornada}</td>
                                    <td>{z.puntoVenta}</td>
                                    <td>{z.numeroZeta}</td>
                                    <td className="text-end">{toMoney(z.iva105)}</td>
                                    <td className="text-end">{toMoney(z.iva21)}</td>
                                    <td className="text-end"><strong>{toMoney(z.ivaTotal)}</strong></td>
                                    <td className="text-end">{toMoney(z.neto)}</td>
                                    <td className="text-end">{toMoney(z.total)}</td>
                                    <td>{z.cantidadEmitidos}</td>
                                    <td>{z.cantidadCancelados}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>

                          <div className="d-flex justify-content-end">
                            <Pagination>
                              <Pagination.First disabled={czPage === 1} onClick={goFirst} />
                              <Pagination.Prev disabled={czPage === 1} onClick={goPrev} />
                              <Pagination.Item active>{czPage}</Pagination.Item>
                              <Pagination.Next disabled={czPage === czTotalPages} onClick={goNext} />
                              <Pagination.Last disabled={czPage === czTotalPages} onClick={goLast} />
                            </Pagination>
                          </div>
                        </>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Cómo se calculó (con CI fijo y CE fijo) */}
                  <Card>
                    <Card.Header>Cómo se calculó</Card.Header>
                    <Card.Body>
                      <ul className="mb-3">
                        <li>
                          <strong>IVA Débito (Z, real)</strong> = suma de <code>ivaTotal</code> de Cierres Z en el rango →{" "}
                          <strong>{toMoney(resultado.rango.ivaDebitoZ)}</strong>
                        </li>
                        <li>
                          <strong>IVA Débito (Comprobantes de Ingreso)</strong> = suma de (<code>iva105 + iva21</code>) del rango,
                          restando si el tipo contiene “NOTA CREDITO/NOTA DE CREDITO” →{" "}
                          <strong>{toMoney(resultado.rango.ivaDebitoCI)}</strong>
                        </li>
                        <li>
                          <strong>IVA Crédito (Compras proyectadas)</strong> = suma de <code>iva</code> en CompraProyectada con <code>informada=false</code> →{" "}
                          <strong>{toMoney(resultado.rango.ivaCreditoCompras)}</strong>
                        </li>
                        <li>
                          <strong>IVA Crédito (Comprobantes de Egreso)</strong> = suma de (<code>iva105 + iva21</code>) del rango,
                          restando si el tipo contiene “NOTA CREDITO/NOTA DE CREDITO” →{" "}
                          <strong>{toMoney(resultado.rango.ivaCreditoFijoCE)}</strong>
                        </li>
                        <li>
                          <strong>Días con registro (Z)</strong> = fechas distintas con Cierre Z:{" "}
                          <strong>{resultado.rango.diasConRegistro}</strong> (del rango: {resultado.rango.diasRango}, sin registro: {resultado.rango.diasSinRegistro})
                        </li>
                        <li>
                          <strong>Promedio diario (Z)</strong> = Débito Z / Días con registro ={" "}
                          <code>{toMoney(resultado.rango.ivaDebitoZ)} / {resultado.rango.diasConRegistro || 1}</code>
                        </li>
                        <li>
                          <strong>Días proyectados</strong> = Días del mes ({resultado.proyeccion.diasMes}) − No operativos ({resultado.parametros.diasNoOperativosMes}) ={" "}
                          <strong>{resultado.proyeccion.diasProyectados}</strong>
                        </li>
                        <li>
                          <strong>Débito proyectado (Z)</strong> = Promedio diario × Días proyectados ={" "}
                          <code>
                            {toMoney(resultado.rango.ivaDebitoZ)} / {resultado.rango.diasConRegistro || 1} × {resultado.proyeccion.diasProyectados} = {toMoney(resultado.proyeccion.ivaDebitoProjZ)}
                          </code>
                        </li>
                        <li>
                          <strong>Crédito (Compras {resultado.parametros.proyectarCompras ? "proyectadas" : "real"} )</strong> ={" "}
                          {resultado.parametros.proyectarCompras
                            ? <code>{toMoney(resultado.rango.ivaCreditoCompras)} / {resultado.rango.diasConRegistro || 1} × {resultado.proyeccion.diasProyectados} = {toMoney(resultado.proyeccion.ivaCreditoComprasProj)}</code>
                            : <code>{toMoney(resultado.proyeccion.ivaCreditoComprasProj)}</code>}
                        </li>
                        <li>
                          <strong>Crédito TOTAL {resultado.parametros.proyectarCompras ? "(proyectado)" : "(real)"}</strong> = Crédito (Compras) + Crédito (CE) ={" "}
                          <code>
                            {toMoney(resultado.proyeccion.ivaCreditoComprasProj)} + {toMoney(resultado.proyeccion.ivaCreditoFijoCE)} = {toMoney(resultado.proyeccion.ivaCreditoProjTotal)}
                          </code>
                        </li>
                        <li>
                          <strong>Débito TOTAL {resultado.parametros.proyectarCompras ? "(proyectado)" : "(real)"}</strong> = Débito (Z) + Débito (CI) ={" "}
                          <code>
                            {toMoney(resultado.proyeccion.ivaDebitoProjZ)} + {toMoney(resultado.proyeccion.ivaDebitoFijoCI)} = {toMoney(resultado.proyeccion.ivaDebitoProjTotal)}
                          </code>
                        </li>
                        <li>
                          <strong>Saldo {resultado.parametros.proyectarCompras ? "proyectado" : "real"}</strong> = Débito TOTAL − Crédito TOTAL ={" "}
                          <code>
                            {toMoney(resultado.proyeccion.ivaDebitoProjTotal)} − {toMoney(resultado.proyeccion.ivaCreditoProjTotal)} = {toMoney(resultado.proyeccion.saldoProj)}
                          </code>
                        </li>
                      </ul>
                      <div className="text-muted small">
                        Nota: el promedio/factor se calcula exclusivamente con Cierres Z. Los Comprobantes de Ingreso (débito) y Egreso (crédito) se suman como montos fijos.
                      </div>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
