import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Container, Row, Col, Form, Button, Spinner, Alert, Card, Table, Badge } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import NuevoMovimientoCajaRetiro from "./NuevoMovimientoCajaRetiro";

const apiUrl = process.env.REACT_APP_API_URL;

function isValidDateStr(str) {
  if (!str || typeof str !== "string") return false;
  // Debe venir como YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return false;
  const d = new Date(str + "T00:00:00");
  return !Number.isNaN(d.getTime());
}

function daysBetweenInclusive(d0, d1) {
  const ms = (new Date(d1 + "T00:00:00")).getTime() - (new Date(d0 + "T00:00:00")).getTime();
  // +1 día porque el rango es inclusivo
  return Math.floor(ms / 86400000) + 1;
}

function rangoFechas(fechaDesde, fechaHasta) {
  const out = [];
  if (!isValidDateStr(fechaDesde) || !isValidDateStr(fechaHasta)) return out;
  const d0 = new Date(fechaDesde + "T00:00:00");
  const d1 = new Date(fechaHasta + "T00:00:00");
  for (let d = new Date(d0); d <= d1; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function MovimientosRetirosTesoreria() {
  const data = useContext(Contexts.DataContext) || {};
  const { cajaAbierta, sucursales = [], sucursalesTabla = [] } = data;

  // columnas = sucursales (respeta tu fuente)
  const cols = useMemo(
    () => (sucursalesTabla?.length ? sucursalesTabla : sucursales) || [],
    [sucursalesTabla, sucursales]
  );
  const caja_id = cajaAbierta?.caja?.id || null;

  // intento de caja inicial desde contexto (ajusta si tu estructura es distinta)
  const cajaInicialContext =
    Number(cajaAbierta?.apertura?.monto || cajaAbierta?.caja?.saldo_inicial || 0) || 0;

  const hoy = new Date().toISOString().slice(0, 10);

  // ======== Estado modo normal (grilla) ========
  const [fechaDesde, setFechaDesde] = useState(hoy);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [errorFiltro, setErrorFiltro] = useState(""); // 👈 mensajes de validación
  const [mostrarDias, setMostrarDias] = useState(false); // 👈 sólo mostramos días tras “Actualizar”

  const [loading, setLoading] = useState(false);
  // key: `${fecha}__${sucursal_id}` -> monto (number)
  const [mMap, setMMap] = useState({});

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [celda, setCelda] = useState(null); // { fecha, sucursal }

  // Validación del rango (re-evaluada ante cualquier cambio)
  const validarRango = useCallback((fd, fh) => {
    if (!fd || !fh) return "Seleccioná ambas fechas.";
    if (!isValidDateStr(fd) || !isValidDateStr(fh)) return "Alguna fecha es inválida (formato YYYY-MM-DD).";
    if (fd > fh) return "La fecha desde no puede ser mayor que la fecha hasta.";
    const dias = daysBetweenInclusive(fd, fh);
    if (dias > 30) return "El rango no puede superar 30 días.";
    return ""; // ok
  }, []);

  useEffect(() => {
    setErrorFiltro(validarRango(fechaDesde, fechaHasta));
  }, [fechaDesde, fechaHasta, validarRango]);

  // Si el usuario modifica el rango, ocultamos nuevamente los días
  useEffect(() => {
    setMostrarDias(false);
  }, [fechaDesde, fechaHasta]);

  // 👇 Sólo lista días cuando el usuario confirmó con “Actualizar”
  const dias = useMemo(
    // () => (mostrarDias && !errorFiltro ? rangoFechas(fechaDesde, fechaHasta) : []),
    () => {
      if (!mostrarDias || errorFiltro) return [];
      const n = daysBetweenInclusive(fechaDesde, fechaHasta);
      if (n > 30) return [];
      return rangoFechas(fechaDesde, fechaHasta);
    },
    [mostrarDias, fechaDesde, fechaHasta, errorFiltro]
  );

  const cargarDatos = useCallback(async () => {
    // // No intentes si no hay caja o si el filtro es inválido
    // if (!caja_id || errorFiltro) {
    // No intentes si no hay caja o si el filtro es inválido (>30 días, etc.)
    const err = validarRango(fechaDesde, fechaHasta);
    if (!caja_id || err) {
      if (err) {
        setErrorFiltro(err);
        window.alert(err);
      }
      setMMap({});
      return;
    }
    try {
      setLoading(true);
      const qs = new URLSearchParams({
        caja_id: String(caja_id),
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        includeAnulados: "0",
      }).toString();

      const res = await fetch(`${apiUrl}/movimientos-caja-tesoreria?${qs}`, { credentials: "include" });
      const lista = (await res.json()) || [];

      // Tomamos solo ingresos con referencia "RetiroSucursal"
      const retiros = lista.filter(
        (m) =>
          String(m?.tipo || "").toLowerCase() === "ingreso" &&
          String(m?.referencia_tipo || "") === "RetiroSucursal"
      );

      // Construir mapa fecha+sucursal -> monto
      const map = {};
      for (const m of retiros) {
        const key = `${m.fecha}__${m.referencia_id}`; // referencia_id = sucursal_id
        map[key] = (map[key] || 0) + Number(m.monto || 0);
      }
      setMMap(map);
    } catch (e) {
      console.error("❌ carga grilla retiros:", e);
      setMMap({});
    } finally {
      setLoading(false);
    }
  }, [caja_id, fechaDesde, fechaHasta, errorFiltro]);

  // useEffect(() => {
  //   if (!modoRecepcion) {
  //     cargarDatos();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [cargarDatos]);

  const fmt = (n) =>
    n || n === 0 ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}` : "";

  const onDblClick = (fecha, suc) => {
    if (!caja_id) return;
    setCelda({ fecha, sucursal: suc });
    setModalOpen(true);
  };

  const afterSaved = () => {
    setModalOpen(false);
    setCelda(null);
    // refrescamos según modo
    if (modoRecepcion) {
      cargarRecepcion();
      cargarSaldoDia();
    } else {
      cargarDatos();
    }
  };

  // ======== Modo Recepción ========
  const [modoRecepcion, setModoRecepcion] = useState(false);
  const [fechaRecepcion, setFechaRecepcion] = useState(hoy);
  const [errorRecepcion, setErrorRecepcion] = useState("");

  useEffect(() => {
    // Validación simple: fecha válida y dentro de 365 días de hoy (opcional).
    // Por ahora: solo validar formato.
    if (!fechaRecepcion) setErrorRecepcion("Seleccioná una fecha.");
    else if (!isValidDateStr(fechaRecepcion)) setErrorRecepcion("Fecha de recepción inválida.");
    else setErrorRecepcion("");
  }, [fechaRecepcion]);

  const [loadingRecep, setLoadingRecep] = useState(false);
  const [recepResumen, setRecepResumen] = useState([]); // [{ sucursal_id, sucursal, totales:[{fecha_origen,total}], total_sucursal }]
  const [recepTotalGeneral, setRecepTotalGeneral] = useState(0);

  const cargarRecepcion = useCallback(async () => {
    if (!caja_id || !fechaRecepcion || errorRecepcion) {
      setRecepResumen([]);
      setRecepTotalGeneral(0);
      return;
    }
    try {
      setLoadingRecep(true);
      const qs = new URLSearchParams({ fecha_recepcion: fechaRecepcion }).toString();

      const res = await fetch(`${apiUrl}/retiros-sucursal-recepcion?${qs}`, { credentials: "include" });
      const json = await res.json();

      const resumen = Array.isArray(json?.resumen) ? json.resumen : [];
      setRecepResumen(resumen);
      setRecepTotalGeneral(Number(json?.total_general || 0));
    } catch (e) {
      console.error("❌ carga recepción:", e);
      setRecepResumen([]);
      setRecepTotalGeneral(0);
    } finally {
      setLoadingRecep(false);
    }
  }, [caja_id, fechaRecepcion, errorRecepcion]);

  useEffect(() => {
    if (modoRecepcion) {
      cargarRecepcion();
      cargarSaldoDia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoRecepcion, fechaRecepcion]);

  // ======== Saldo del día (panel lateral en recepción) ========
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [ingresosDia, setIngresosDia] = useState(0);
  const [egresosDia, setEgresosDia] = useState(0);
  const [cajaInicialDia, setCajaInicialDia] = useState(cajaInicialContext || 0);

  const cargarSaldoDia = useCallback(async () => {
    if (!caja_id || !fechaRecepcion || errorRecepcion) {
      setIngresosDia(0);
      setEgresosDia(0);
      setCajaInicialDia(cajaInicialContext || 0);
      return;
    }
    try {
      setLoadingSaldo(true);
      const qs = new URLSearchParams({
        caja_id: String(caja_id),
        fecha_desde: fechaRecepcion,
        fecha_hasta: fechaRecepcion,
        includeAnulados: "0",
      }).toString();

      const res = await fetch(`${apiUrl}/movimientos-caja-tesoreria?${qs}`, { credentials: "include" });
      const lista = (await res.json()) || [];

      let ing = 0, egr = 0;
      for (const m of lista) {
        const tipo = String(m?.tipo || "").toLowerCase();
        const monto = Number(m?.monto || 0);
        if (tipo === "ingreso") ing += monto;
        else if (tipo === "egreso") egr += monto;
      }

      setIngresosDia(ing);
      setEgresosDia(egr);
      setCajaInicialDia(cajaInicialContext || 0);
    } catch (e) {
      console.error("❌ carga saldo día:", e);
      setIngresosDia(0);
      setEgresosDia(0);
      setCajaInicialDia(cajaInicialContext || 0);
    } finally {
      setLoadingSaldo(false);
    }
  }, [caja_id, fechaRecepcion, cajaInicialContext, errorRecepcion]);

  const saldoEsperado = useMemo(() => {
    return Number(cajaInicialDia || 0) + Number(ingresosDia || 0) - Number(egresosDia || 0);
  }, [cajaInicialDia, ingresosDia, egresosDia]);

  const diferenciaRecepcion = useMemo(() => {
    return Number(saldoEsperado || 0) - Number(recepTotalGeneral || 0);
  }, [saldoEsperado, recepTotalGeneral]);

  // ======== Render ========
  return (
    <Container fluid>
      <h1 className="my-list-title dark-text">Retiros de Sucursales → Caja</h1>

      {!caja_id && (
        <Alert variant="warning">No hay caja abierta. Abrí una caja para trabajar con retiros.</Alert>
      )}

      {/* Filtros superiores */}
      <Form className="mb-3">
        <Row className="g-2 align-items-end">
          <Col md="auto">
            <Form.Check
              type="switch"
              id="switch-recepcion"
              label="Modo Recepción"
              checked={modoRecepcion}
              onChange={(e) => setModoRecepcion(e.target.checked)}
            />
          </Col>

          {!modoRecepcion ? (
            <>
              <Col md={3}>
                <Form.Label>Fecha desde</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label>Fecha hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </Col>
              <Col md="auto">
                <Button
                  variant="outline-secondary"
                  onClick={async () => {
                    // await cargarDatos();
                    // setMostrarDias(true); // 👈 recién ahora listamos los días
                    // Validación just-in-time
                    const err = validarRango(fechaDesde, fechaHasta);
                    setErrorFiltro(err);
                    if (err) {
                      window.alert(err);
                      setMostrarDias(false);
                      return;
                    }
                    await cargarDatos();
                    setMostrarDias(true); // 👈 recién ahora listamos los días
                  }}
                  disabled={loading || !caja_id || !!errorFiltro}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : "Actualizar"}
                </Button>
              </Col>
              {!!errorFiltro && (
                <Col xs={12}>
                  <Alert variant="danger" className="py-2 my-2">
                    {errorFiltro}
                  </Alert>
                </Col>
              )}
            </>
          ) : (
            <>
              <Col md={3}>
                <Form.Label>Fecha de recepción</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaRecepcion}
                  onChange={(e) => setFechaRecepcion(e.target.value)}
                />
              </Col>
              <Col md="auto">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    cargarRecepcion();
                    cargarSaldoDia();
                  }}
                  disabled={loadingRecep || loadingSaldo || !caja_id || !!errorRecepcion}
                >
                  {(loadingRecep || loadingSaldo) ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    "Actualizar"
                  )}
                </Button>
              </Col>
              {!!errorRecepcion && (
                <Col xs={12}>
                  <Alert variant="danger" className="py-2 my-2">
                    {errorRecepcion}
                  </Alert>
                </Col>
              )}
            </>
          )}
        </Row>
      </Form>

      {/* Vista según modo */}
      {!modoRecepcion ? (
        // ======== MODO NORMAL: Grilla por fecha origen ========
        <div className="table-responsive">
          <table className="table table-sm table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: 120 }}>Fecha</th>
                {cols.map((s) => (
                  <th key={s.id} className="text-center">
                    <div className="fw-semibold">
                      {s.nombre || s.descripcion || s.alias || `Sucursal #${s.id}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dias.length === 0 && !errorFiltro && (
                <tr>
                  <td colSpan={1 + cols.length} className="text-center text-muted">
                    Seleccioná un rango de fechas.
                  </td>
                </tr>
              )}
              {dias.map((d) => (
                <tr key={d}>
                  <td className="text-nowrap">
                    {new Date(d + "T00:00:00").toLocaleDateString("es-AR")}
                  </td>
                  {cols.map((s) => {
                    const key = `${d}__${s.id}`;
                    const val = mMap[key];
                    return (
                      <td
                        key={key}
                        onDoubleClick={() => onDblClick(d, s)}
                        title="Doble click para cargar/editar sobres (retiros) de esta sucursal y día"
                        style={{
                          cursor: caja_id ? "pointer" : "not-allowed",
                          background: val > 0 ? "#f6fff6" : undefined,
                        }}
                        className="text-end"
                      >
                        {val > 0 ? fmt(val) : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // ======== MODO RECEPCIÓN: Panel de conciliación ========
        <Row className="g-3">
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Recepción del día</strong>{" "}
                  {isValidDateStr(fechaRecepcion)
                    ? new Date(fechaRecepcion + "T00:00:00").toLocaleDateString("es-AR")
                    : "-"}
                </div>
                <Badge bg="success">Total: {fmt(recepTotalGeneral)}</Badge>
              </Card.Header>
              <Card.Body>
                {loadingRecep ? (
                  <div className="text-muted">
                    <Spinner size="sm" animation="border" className="me-2" />
                    Cargando recepción…
                  </div>
                ) : recepResumen.length === 0 ? (
                  <div className="text-muted">No hay retiros recepcionados en esta fecha.</div>
                ) : (
                  recepResumen.map((suc) => (
                    <div key={suc.sucursal_id} className="mb-4">
                      <div className="fw-semibold mb-2">
                        {suc.sucursal}{" "}
                        <Badge bg="light" text="dark">
                          Subtotal: {fmt(suc.total_sucursal)}
                        </Badge>
                      </div>
                      <Table size="sm" bordered className="mb-2">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: 160 }}>Fecha origen</th>
                            <th className="text-end">Total recibido</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(suc.totales || []).map((t) => (
                            <tr key={`${suc.sucursal_id}-${t.fecha_origen}`}>
                              <td>
                                {isValidDateStr(t.fecha_origen)
                                  ? new Date(t.fecha_origen + "T00:00:00").toLocaleDateString("es-AR")
                                  : t.fecha_origen}
                              </td>
                              <td className="text-end">{fmt(t.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Header>
                <strong>Saldo del día</strong>
              </Card.Header>
              <Card.Body>
                {loadingSaldo ? (
                  <div className="text-muted">
                    <Spinner size="sm" animation="border" className="me-2" />
                    Calculando saldos…
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between">
                      <span>Recepcionado hoy</span>
                      <span className="fw-bold">{fmt(recepTotalGeneral)}</span>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal crear/editar sobres */}
      <NuevoMovimientoCajaRetiro
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        presetFecha={celda?.fecha}
        presetSucursal={celda?.sucursal}
        caja_id={caja_id}
        onSaved={afterSaved}
      />
    </Container>
  );
}

