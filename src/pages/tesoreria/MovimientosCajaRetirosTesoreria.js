import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Container, Row, Col, Form, Button, Spinner, Alert, Card, Table, Badge } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import NuevoMovimientoCajaRetiro from "./NuevoMovimientoCajaRetiro";
import NuevoMovimientoCaja from "./NuevoMovimientoCaja";
import GastosDiaModal from "./GastosDiaModal";

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

  // Saldo inicial real de la caja abierta
  const cajaInicialContext =
    Number(cajaAbierta?.caja?.caja_inicial || 0);



  const hoy = new Date().toISOString().slice(0, 10);

  // ======== Estado modo normal (grilla) ========
  const [fechaDesde, setFechaDesde] = useState(hoy);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [errorFiltro, setErrorFiltro] = useState(""); // 👈 mensajes de validación
  const [mostrarDias, setMostrarDias] = useState(false); // 👈 sólo mostramos días tras “Actualizar”

  const [loading, setLoading] = useState(false);
  // key: `${fecha}__${sucursal_id}` -> monto (number)
  const [mMap, setMMap] = useState({});

  // ======== Resumen financiero modo normal ========

  // Resultado correspondiente exclusivamente al rango filtrado.
  const [ingresosFiltrados, setIngresosFiltrados] = useState(0);
  const [egresosFiltrados, setEgresosFiltrados] = useState(0);

  // Totales completos de la caja abierta, sin filtro de fechas.
  const [ingresosCajaTotal, setIngresosCajaTotal] = useState(0);
  const [egresosCajaTotal, setEgresosCajaTotal] = useState(0);

  const [loadingSaldoCaja, setLoadingSaldoCaja] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [celda, setCelda] = useState(null); // { fecha, sucursal }

  // ======== Gastos por día ========

  // key: fecha YYYY-MM-DD -> total de egresos de ese día
  const [gastosMap, setGastosMap] = useState({});

  // Movimientos de egreso recuperados junto con la grilla.
  // Los conservamos para poder mostrar el detalle sin volver
  // a consultar el backend al hacer doble click.
  const [egresosGrilla, setEgresosGrilla] = useState([]);

  // Modal de consulta de gastos
  const [modalGastosOpen, setModalGastosOpen] = useState(false);
  const [fechaGastos, setFechaGastos] = useState(null);

  // Modal existente para crear un nuevo egreso
  const [modalNuevoEgresoOpen, setModalNuevoEgresoOpen] = useState(false);

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
      setGastosMap({});
      setEgresosGrilla([]);
      setIngresosFiltrados(0);
      setEgresosFiltrados(0);
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

      // ===== TOTALES DEL PERÍODO FILTRADO =====
      let totalIngresosFiltrados = 0;
      let totalEgresosFiltrados = 0;

      for (const m of lista) {
        if (m?.anulado) continue;

        const tipo = String(m?.tipo || "").toLowerCase();
        const monto = Number(m?.monto || 0);

        if (tipo === "ingreso") {
          totalIngresosFiltrados += monto;
        } else if (tipo === "egreso") {
          totalEgresosFiltrados += monto;
        }
      }

      setIngresosFiltrados(totalIngresosFiltrados);
      setEgresosFiltrados(totalEgresosFiltrados);

      // ===== EGRESOS / GASTOS DEL PERÍODO =====
      const egresos = lista.filter(
        (m) =>
          String(m?.tipo || "").toLowerCase() === "egreso" &&
          !m?.anulado
      );

      // Conservamos los movimientos completos para el modal de detalle.
      setEgresosGrilla(egresos);

      // Total de gastos agrupado por fecha.
      const gastosPorFecha = {};

      for (const m of egresos) {
        const fechaMovimiento = String(m?.fecha || "");

        if (!fechaMovimiento) continue;

        gastosPorFecha[fechaMovimiento] =
          (gastosPorFecha[fechaMovimiento] || 0) +
          Number(m?.monto || 0);
      }

      setGastosMap(gastosPorFecha);

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

      setGastosMap({});
      setEgresosGrilla([]);
      setIngresosFiltrados(0);
      setEgresosFiltrados(0);

    } finally {
      setLoading(false);
    }
  }, [caja_id, fechaDesde, fechaHasta, errorFiltro]);

  const resultadoFiltrado = useMemo(() => {
    return (
      Number(ingresosFiltrados || 0) -
      Number(egresosFiltrados || 0)
    );
  }, [ingresosFiltrados, egresosFiltrados]);

  const cargarSaldoTotalCaja = useCallback(async () => {
    if (!caja_id) {
      setIngresosCajaTotal(0);
      setEgresosCajaTotal(0);
      return;
    }

    try {
      setLoadingSaldoCaja(true);

      const qs = new URLSearchParams({
        caja_id: String(caja_id),
        includeAnulados: "0",
      }).toString();

      const res = await fetch(
        `${apiUrl}/movimientos-caja-tesoreria?${qs}`,
        {
          credentials: "include",
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json?.error || "No se pudo obtener el saldo de la caja"
        );
      }

      const lista = Array.isArray(json) ? json : [];

      let ingresos = 0;
      let egresos = 0;

      for (const m of lista) {
        if (m?.anulado) continue;

        const tipo = String(m?.tipo || "").toLowerCase();
        const monto = Number(m?.monto || 0);

        if (tipo === "ingreso") {
          ingresos += monto;
        } else if (tipo === "egreso") {
          egresos += monto;
        }
      }

      setIngresosCajaTotal(ingresos);
      setEgresosCajaTotal(egresos);
    } catch (e) {
      console.error("❌ carga saldo total caja:", e);

      setIngresosCajaTotal(0);
      setEgresosCajaTotal(0);
    } finally {
      setLoadingSaldoCaja(false);
    }
  }, [caja_id]);

  const saldoTotalCaja = useMemo(() => {
    return (
      Number(cajaInicialContext || 0) +
      Number(ingresosCajaTotal || 0) -
      Number(egresosCajaTotal || 0)
    );
  }, [
    cajaInicialContext,
    ingresosCajaTotal,
    egresosCajaTotal,
  ]);

  const handleActualizar = async () => {
    const err = validarRango(fechaDesde, fechaHasta);

    setErrorFiltro(err);

    if (err) {
      window.alert(err);
      setMostrarDias(false);
      return;
    }

    await Promise.all([
      cargarDatos(),
      cargarSaldoTotalCaja(),
    ]);

    setMostrarDias(true);
  };

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

  const onDblClickGastos = (fecha) => {
    if (!caja_id) return;

    setFechaGastos(fecha);
    setModalGastosOpen(true);
  };

  const abrirNuevoEgresoDesdeGastos = () => {
    // Primero cerramos el modal de consulta.
    setModalGastosOpen(false);

    // Abrimos el modal de carga en el siguiente ciclo visual,
    // evitando que ambos modales queden superpuestos.
    setTimeout(() => {
      setModalNuevoEgresoOpen(true);
    }, 150);
  };

  const cerrarNuevoEgresoDesdeGastos = () => {
    setModalNuevoEgresoOpen(false);

    setTimeout(() => {
      if (fechaGastos) {
        setModalGastosOpen(true);
      }
    }, 150);
  };
  const nuevoEgresoCreadoDesdeGastos = async () => {
    setModalNuevoEgresoOpen(false);

    // Refrescamos la grilla para incorporar inmediatamente
    // el nuevo gasto al total de la columna Gastos.
    await cargarDatos();

    // Volvemos al listado del mismo día.
    setTimeout(() => {
      if (fechaGastos) {
        setModalGastosOpen(true);
      }
    }, 150);
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
    if (!modoRecepcion && caja_id) {
      cargarSaldoTotalCaja();
    }
  }, [
    modoRecepcion,
    caja_id,
    cargarSaldoTotalCaja,
  ]);

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
  const [recepTotalEgresos, setRecepTotalEgresos] = useState(0);
  const [recepCuadratura, setRecepCuadratura] = useState(0);
  const [recepEgresos, setRecepEgresos] = useState([]);
  const cargarRecepcion = useCallback(async () => {
    if (!caja_id || !fechaRecepcion || errorRecepcion) {
      setRecepResumen([]);
      setRecepTotalGeneral(0);
      setRecepTotalEgresos(0);
      setRecepCuadratura(0);
      setRecepEgresos([]);
      return;
    }
    try {
      setLoadingRecep(true);
      const qs = new URLSearchParams({ fecha_recepcion: fechaRecepcion }).toString();

      const res = await fetch(`${apiUrl}/retiros-sucursal-recepcion?${qs}`, { credentials: "include" });
      const json = await res.json();

      const resumen = Array.isArray(json?.resumen)
        ? json.resumen
        : [];

      setRecepResumen(resumen);

      setRecepTotalGeneral(
        Number(json?.total_general || 0)
      );

      setRecepTotalEgresos(
        Number(json?.total_egresos || 0)
      );

      setRecepCuadratura(
        Number(json?.cuadratura || 0)
      );

      setRecepEgresos(
        Array.isArray(json?.egresos)
          ? json.egresos
          : []
      );

    } catch (e) {
      console.error("❌ carga recepción:", e);

      setRecepResumen([]);
      setRecepTotalGeneral(0);
      setRecepTotalEgresos(0);
      setRecepCuadratura(0);
      setRecepEgresos([]);
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
      setRecepEgresos([]);
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleActualizar();
                    }
                  }}
                />
              </Col>
              <Col md={3}>
                <Form.Label>Fecha hasta</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleActualizar();
                    }
                  }}
                />
              </Col>
              <Col md="auto">
                <Button
                  variant="outline-secondary"
                  onClick={handleActualizar}
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

      {/* Resumen financiero exclusivo del modo normal */}
      {!modoRecepcion && mostrarDias && !errorFiltro && (
        <Row className="g-3 mb-3">
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="text-muted mb-1">
                  Resultado del período
                </div>

                <div className="fs-4 fw-bold">
                  {fmt(resultadoFiltrado)}
                </div>

                <div className="small text-muted mt-2">
                  Ingresos {fmt(ingresosFiltrados)}
                  {" − "}
                  Egresos {fmt(egresosFiltrados)}
                </div>

                <div className="small text-muted">
                  {new Date(fechaDesde + "T00:00:00").toLocaleDateString("es-AR")}
                  {" al "}
                  {new Date(fechaHasta + "T00:00:00").toLocaleDateString("es-AR")}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="text-muted mb-1">
                  Saldo actual de caja
                </div>

                <div className="fs-4 fw-bold">
                  {loadingSaldoCaja ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    fmt(saldoTotalCaja)
                  )}
                </div>

                <div className="small text-muted mt-2">
                  Inicial {fmt(cajaInicialContext)}
                  {" + "}
                  Ingresos {fmt(ingresosCajaTotal)}
                  {" − "}
                  Egresos {fmt(egresosCajaTotal)}
                </div>

                <div className="small text-muted">
                  Considera todos los movimientos de la caja abierta.
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Vista según modo */}
      {!modoRecepcion ? (
        // ======== MODO NORMAL: Grilla por fecha origen ========
        <div
          className="table-responsive"
          style={{
            position: "relative",
          }}
        >
          <table className="table table-sm table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th
                  style={{
                    minWidth: 120,
                    width: 120,
                    position: "sticky",
                    left: 0,
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#f8f9fa",
                    boxShadow: "2px 0 3px rgba(0,0,0,0.12)",
                  }}
                >
                  Fecha
                </th>
                {cols.map((s) => (
                  <th key={s.id} className="text-center">
                    <div className="fw-semibold">
                      {s.nombre || s.descripcion || s.alias || `Sucursal #${s.id}`}
                    </div>
                  </th>
                ))}

                <th
                  className="text-center"
                  style={{
                    minWidth: 130,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <div className="fw-semibold">
                    GASTOS
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {dias.length === 0 && !errorFiltro && (
                <tr>
                  <td colSpan={2 + cols.length} className="text-center text-muted">
                    Seleccioná un rango de fechas.
                  </td>
                </tr>
              )}
              {dias.map((d) => (
                <tr key={d}>
                  <td
                    className="text-nowrap"
                    style={{
                      minWidth: 120,
                      width: 120,
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      backgroundColor: "#ffffff",
                      boxShadow: "2px 0 3px rgba(0,0,0,0.08)",
                    }}
                  >
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

                  <td
                    onDoubleClick={() => onDblClickGastos(d)}
                    className="text-end fw-semibold"
                    style={{
                      minWidth: 130,
                      cursor: caja_id ? "pointer" : "not-allowed",
                      background: gastosMap[d] > 0 ? "#fff8f0" : undefined,
                    }}
                    title={
                      gastosMap[d] > 0
                        ? "Doble click para ver los gastos de este día"
                        : "Doble click para registrar un nuevo gasto"
                    }
                  >
                    {gastosMap[d] > 0 ? fmt(gastosMap[d]) : ""}
                  </td>

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

                {/* ======== EGRESOS RECEPCIONADOS ======== */}
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">
                      Egresos recepcionados
                    </h6>

                    <Badge bg="secondary">
                      Total {fmt(recepTotalEgresos)}
                    </Badge>
                  </div>

                  <Table
                    bordered
                    hover
                    responsive
                    size="sm"
                    className="mb-0"
                  >
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 130 }}>
                          Fecha movimiento
                        </th>

                        <th>
                          Descripción
                        </th>

                        <th>
                          Proveedor
                        </th>

                        <th
                          className="text-end"
                          style={{ width: 150 }}
                        >
                          Importe
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recepEgresos.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-muted py-3"
                          >
                            No hay egresos cargados en esta fecha de recepción.
                          </td>
                        </tr>
                      ) : (
                        recepEgresos.map((e) => {
                          const proveedor = (
                            data.proveedoresTabla || []
                          ).find(
                            (p) =>
                              Number(p.id) ===
                              Number(e.proveedor_id)
                          );

                          return (
                            <tr key={e.id}>
                              <td>
                                {e.fecha
                                  ? new Date(
                                    `${e.fecha}T00:00:00`
                                  ).toLocaleDateString("es-AR")
                                  : "—"}
                              </td>

                              <td>
                                {e.descripcion || "—"}
                              </td>

                              <td>
                                {proveedor?.razon_social ||
                                  proveedor?.nombre ||
                                  proveedor?.descripcion ||
                                  "—"}
                              </td>

                              <td className="text-end fw-semibold">
                                {fmt(e.monto)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>

                    {recepEgresos.length > 0 && (
                      <tfoot>
                        <tr>
                          <td
                            colSpan={3}
                            className="text-end fw-bold"
                          >
                            TOTAL EGRESOS
                          </td>

                          <td className="text-end fw-bold">
                            {fmt(recepTotalEgresos)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </Table>
                </div>

              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Header>
                <strong>Cuadratura de recepción</strong>
              </Card.Header>

              <Card.Body>
                {loadingRecep ? (
                  <div className="text-muted">
                    <Spinner
                      size="sm"
                      animation="border"
                      className="me-2"
                    />
                    Calculando cuadratura…
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Ingresos recepcionados</span>

                      <span className="fw-semibold">
                        {fmt(recepTotalGeneral)}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Egresos cargados</span>

                      <span className="fw-semibold">
                        - {fmt(recepTotalEgresos)}
                      </span>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between align-items-center">
                      <strong>Cuadratura</strong>

                      <span className="fs-5 fw-bold">
                        {fmt(recepCuadratura)}
                      </span>
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

      {/* Modal de consulta de gastos del día */}
      <GastosDiaModal
        show={modalGastosOpen}
        onHide={() => {
          setModalGastosOpen(false);
          setFechaGastos(null);
        }}
        fecha={fechaGastos}
        egresos={egresosGrilla}
        proveedores={data.proveedoresTabla || []}
        categorias={
          data.categoriasEgresoTabla?.length
            ? data.categoriasEgresoTabla
            : data.categoriasEgreso || []
        }
        proyectos={data.proyectosTabla || []}
        onNuevoEgreso={abrirNuevoEgresoDesdeGastos}
      />

      {/* Modal existente para registrar el nuevo egreso */}
      <NuevoMovimientoCaja
        show={modalNuevoEgresoOpen}
        presetFecha={fechaGastos}
        onHide={cerrarNuevoEgresoDesdeGastos}
        onCreated={nuevoEgresoCreadoDesdeGastos}
      />

    </Container>
  );
}

