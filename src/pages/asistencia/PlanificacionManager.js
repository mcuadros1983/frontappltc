import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,Table
} from "react-bootstrap";
import Contexts from "../../context/Contexts";
import "./PlanificacionManager.css";

const apiUrl = process.env.REACT_APP_API_URL;

// ----------------- Helpers base -----------------

const getEmpleadoId = (e) =>
  Number(e?.empleado?.id ?? e?.id ?? e?.empleado_id ?? 0);

const getEmpleadoNombre = (e) => {
  const ap =
    e?.clientePersona?.apellido ||
    e?.empleado?.apellido ||
    e?.apellido ||
    "";
  const no =
    e?.clientePersona?.nombre ||
    e?.empleado?.nombre ||
    e?.nombre ||
    "";
  const full = `${ap} ${no}`.trim();
  return full || `Empleado #${getEmpleadoId(e) || "—"}`;
};

const getEvConceptoId = (ev) =>
  Number(ev?.concepto_id ?? ev?.concepto ?? 0);
const getEvEmpleadoId = (ev) =>
  Number(ev?.empleado_id ?? ev?.empleado ?? 0);

const toIsoDate = (d) => new Date(d).toISOString().split("T")[0];

const isValidDateISO = (s) => {
  const d = new Date(s);
  const ts = d.getTime();
  return (
    typeof ts === "number" &&
    !Number.isNaN(ts) &&
    s === toIsoDate(d)
  );
};

const buildDateRange = (start, end) => {
  const cur = new Date(start);
  const stop = new Date(end);
  const out = [];
  while (cur <= stop) {
    out.push(toIsoDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

// día de semana en rango [1..7]; Lun=1 ... Dom=7
function weekdayNumber1to7(dateIso) {
  const d = new Date(dateIso + "T00:00:00");
  const wd = d.getDay(); // 0=Dom..6=Sab
  return wd === 0 ? 7 : wd; // domingo=>7
}

export default function PlanificacionManager() {
  const dataContext = useContext(Contexts.DataContext);

  const empleadosCtx = dataContext?.empleados || [];
  const sucursalesCtx = dataContext?.sucursales || [];
  const conceptosCtx = dataContext?.conceptos || [];

  // filtros UI - Inicialización con fecha actual y 30 días después
  const today = new Date();
  const startDateDefault = toIsoDate(today);
  const endDateDefault = toIsoDate(
    new Date(today.setDate(today.getDate() + 30))
  );

  const [startDate, setStartDate] = useState(startDateDefault);
  const [endDate, setEndDate] = useState(endDateDefault);
  const [sucursalId, setSucursalId] = useState("");

  // datos cargados dinámicamente
  const [events, setEvents] = useState([]); // eventos (códigos)
  const [vacaciones, setVacaciones] = useState([]); // vacaciones
  const [dateRange, setDateRange] = useState([]);

  // estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // conceptos (para mostrar códigos de evento)
  const [conceptos, setConceptos] = useState(conceptosCtx);

  // datosempleado (sucursal_id, franco_am, franco_pm, etc.)
  const [datosEmpleadoList, setDatosEmpleadoList] = useState([]);

  // ---------- cargar conceptos una vez ----------
  useEffect(() => {
    let mounted = true;
    const cargarConceptos = async () => {
      if (conceptosCtx?.length) {
        setConceptos(conceptosCtx);
        return;
      }
      try {
        const r = await fetch(
          `${apiUrl}/conceptos?limit=1000&order=nombre&dir=ASC`,
          { credentials: "include" }
        );
        const d = await r.json().catch(() => null);
        if (!r.ok)
          throw new Error(
            d?.error || "No se pudieron obtener conceptos."
          );
        const arr = Array.isArray(d?.items)
          ? d.items
          : Array.isArray(d)
          ? d
          : [];
        if (mounted) setConceptos(arr);
      } catch (e) {
        console.warn("No se pudieron cargar conceptos:", e);
      }
    };
    cargarConceptos();
    return () => {
      mounted = false;
    };
  }, [conceptosCtx]);

  // ---------- cargar datosempleado una vez ----------
  useEffect(() => {
    let mounted = true;
    const cargarDatosEmpleado = async () => {
      try {
        const r = await fetch(`${apiUrl}/datosempleado?limit=1000`, {
          credentials: "include",
        });
        const d = await r.json().catch(() => null);
        if (!r.ok)
          throw new Error(
            d?.error || "No se pudieron obtener datosempleado."
          );
        const arr = Array.isArray(d?.items)
          ? d.items
          : Array.isArray(d)
          ? d
          : [];
        if (mounted) {
          setDatosEmpleadoList(arr);
        }
      } catch (e) {
        console.error("Error cargando datosempleado:", e);
        if (mounted) setDatosEmpleadoList([]);
      }
    };
    cargarDatosEmpleado();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- maps derivados ----------
  // concepto_id -> concepto
  const conceptosMap = useMemo(() => {
    const m = new Map();
    for (const c of conceptos || []) {
      m.set(Number(c.id), c);
    }
    return m;
  }, [conceptos]);

  // helper: dame el código corto y el nombre largo del concepto
  const getConceptDisplay = (conceptId) => {
    const c = conceptosMap.get(Number(conceptId));
    return {
      code: c?.codigo || `${conceptId}`,
      name: c?.nombre || c?.descripcion || c?.codigo || `${conceptId}`,
    };
  };

  // empleado_id -> datosEmpleado (sucursal_id, franco_am, franco_pm)
  const datosEmpleadoMap = useMemo(() => {
    const m = new Map();
    for (const row of datosEmpleadoList || []) {
      m.set(Number(row.empleado_id), row);
    }
    return m;
  }, [datosEmpleadoList]);

  // sucursales filtradas
  const sucursalesFiltradas = useMemo(() => {
    if (sucursalId) {
      const id = Number(sucursalId);
      return (sucursalesCtx || []).filter(
        (s) => Number(s.id) === id
      );
    }
    return sucursalesCtx || [];
  }, [sucursalId, sucursalesCtx]);

  // empleado -> sucursal usando datosEmpleadoMap
  const getSucursalIdDeEmpleado = (empleado) => {
    const id = getEmpleadoId(empleado);
    if (!id) return 0;
    const datos = datosEmpleadoMap.get(id);
    if (!datos) return 0;
    return Number(datos.sucursal_id) || 0;
  };

  // Agrupamos empleados por sucursal
  const empleadosPorSucursal = useMemo(() => {
    const map = new Map();
    // inicializar con las sucursales filtradas
    for (const s of sucursalesFiltradas) {
      map.set(Number(s.id), []);
    }
    // meter cada empleado en su sucursal asignada
    for (const e of empleadosCtx || []) {
      const sid = getSucursalIdDeEmpleado(e);
      if (!sid) continue;
      if (!map.has(sid)) {
        map.set(sid, []);
      }
      map.get(sid).push(e);
    }
    // ordenar empleados por nombre
    for (const [sid, arr] of map.entries()) {
      arr.sort((a, b) =>
        getEmpleadoNombre(a).localeCompare(getEmpleadoNombre(b))
      );
      map.set(sid, arr);
    }
    return map;
  }, [sucursalesFiltradas, empleadosCtx, datosEmpleadoMap]);

  // ---------- helpers de eventos / vacaciones ----------
  // arma calendario empleado
  // ahora guardamos tanto códigos para mostrar en la celda
  // como nombres largos para el tooltip
  function buildCalendarioEmpleado(empId) {
    // Map(dateIso -> { codes:[], names:[] })
    const eventsPerDay = new Map();
    const vacationDays = new Set();

    // eventos
    for (const ev of events || []) {
      if (getEvEmpleadoId(ev) !== Number(empId)) continue;
      const dIni = new Date(ev.fecha_desde);
      const dFin = new Date(ev.fecha_hasta);

      const { code, name } = getConceptDisplay(
        getEvConceptoId(ev)
      );

      const cur = new Date(dIni);
      while (cur <= dFin) {
        const key = toIsoDate(cur);
        if (!eventsPerDay.has(key)) {
          eventsPerDay.set(key, {
            codes: [code],
            names: [name],
          });
        } else {
          const slot = eventsPerDay.get(key);
          slot.codes.push(code);
          slot.names.push(name);
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    // vacaciones
    for (const vac of vacaciones || []) {
      if (Number(vac.empleado_id) !== Number(empId)) continue;
      if (!vac.fecha_desde || !vac.fecha_hasta) continue;

      const cur = new Date(vac.fecha_desde);
      const fin = new Date(vac.fecha_hasta);
      while (cur <= fin) {
        vacationDays.add(toIsoDate(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }

    return { eventsPerDay, vacationDays };
  }

  // Franco AM/PM info
  function getFrancoInfo(empId, dateIso) {
    const datos = datosEmpleadoMap.get(Number(empId));
    if (!datos) {
      return { isFrancoAM: false, isFrancoPM: false };
    }
    const w = weekdayNumber1to7(dateIso); // 1..7
    const isFrancoAM = Number(datos.franco_am) === w;
    const isFrancoPM = Number(datos.franco_pm) === w;
    return { isFrancoAM, isFrancoPM };
  }

  // ---------- buscar eventos + vacaciones ----------
  const handleSearch = async (e) => {
    e?.preventDefault?.();

    // validaciones
    if (!startDate || !endDate) {
      setError("Debe seleccionar el rango de fechas");
      return;
    }
    if (!isValidDateISO(startDate) || !isValidDateISO(endDate)) {
      setError("Fecha no válida");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError(
        "La fecha final no puede ser menor a la fecha de inicio"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // eventos
      let urlEv = `${apiUrl}/eventos?start_date=${startDate}&end_date=${endDate}&order=fecha_desde&dir=ASC&limit=10000`;
      if (sucursalId) urlEv += `&sucursal_id=${sucursalId}`;

      const rEv = await fetch(urlEv, { credentials: "include" });
      const dEv = await rEv.json().catch(() => null);
      if (!rEv.ok)
        throw new Error(
          dEv?.error || "No se pudieron obtener eventos."
        );
      const arrEv = Array.isArray(dEv?.items)
        ? dEv.items
        : Array.isArray(dEv)
        ? dEv
        : [];

      // vacaciones
      let urlVac = `${apiUrl}/asignacionesvacaciones?desde=${startDate}&hasta=${endDate}&limit=10000`;
      if (sucursalId) urlVac += `&sucursal_id=${sucursalId}`;

      const rVac = await fetch(urlVac, { credentials: "include" });
      const dVac = await rVac.json().catch(() => null);
      if (!rVac.ok)
        throw new Error(
          dVac?.error || "No se pudieron obtener vacaciones."
        );
      const arrVac = Array.isArray(dVac?.items)
        ? dVac.items
        : Array.isArray(dVac)
        ? dVac
        : [];

      setEvents(arrEv);
      setVacaciones(arrVac);
      setDateRange(buildDateRange(startDate, endDate));
    } catch (err) {
      console.error(err);
      setError(
        "Error al obtener la planificación: " +
          (err?.message || "desconocido")
      );
      setEvents([]);
      setVacaciones([]);
      setDateRange([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- render fila empleado ----------
  function renderEmpleadoRow(empleado) {
    const empId = getEmpleadoId(empleado);
    const { eventsPerDay, vacationDays } = buildCalendarioEmpleado(
      empId
    );

    return (
      <tr key={empId} className="text-center">
        <td className="fixed-column sticky-col empleado-cell">
          {getEmpleadoNombre(empleado)}
        </td>

        {dateRange.map((dateIso) => {
          // info base
          const dayInfo = eventsPerDay.get(dateIso) || {
            codes: [],
            names: [],
          };

          const codes = dayInfo.codes; // códigos cortos para mostrar
          const names = dayInfo.names; // nombres largos para tooltip

          // vacaciones?
          const isVacation = vacationDays.has(dateIso);

          // francos?
          const { isFrancoAM, isFrancoPM } = getFrancoInfo(
            empId,
            dateIso
          );

          // fin de semana?
          const dow = new Date(dateIso + "T00:00:00").getDay(); // 0..6
          const isWeekend = dow === 0 || dow === 6;

          // --- COLOR fondo ---
          let backgroundColor = "";
          if (isVacation) {
            backgroundColor = "red";
          } else if (isFrancoAM || isFrancoPM) {
            backgroundColor = "blue";
          } else if (isWeekend) {
            backgroundColor = "yellow";
          }

          // --- TEXTO para mostrar en la celda ---
          const labels = [];
          if (isVacation) {
            labels.push("VA");
          }
          if (isFrancoAM || isFrancoPM) {
            if (isFrancoAM && isFrancoPM) {
              labels.push("AM/PM");
            } else if (isFrancoAM) {
              labels.push("AM");
            } else if (isFrancoPM) {
              labels.push("PM");
            }
          }

          const eventCodes = codes.length ? codes.join("-") : "";

          // --- TEXTO para tooltip (title) ---
          // armamos descripciones humanas:
          // - Vacaciones
          // - Franco AM/PM
          // - Nombres completos de eventos de ese día
          const tooltipParts = [];

          if (isVacation) {
            tooltipParts.push("Vacaciones");
          }

          if (isFrancoAM || isFrancoPM) {
            if (isFrancoAM && isFrancoPM) {
              tooltipParts.push("Franco AM/PM");
            } else if (isFrancoAM) {
              tooltipParts.push("Franco AM");
            } else if (isFrancoPM) {
              tooltipParts.push("Franco PM");
            }
          }

          if (names.length) {
            tooltipParts.push(names);
          }

          const tooltipText = tooltipParts.join(" | ");

          return (
            <td
              key={dateIso}
              className="franco-cell"
              style={{ backgroundColor }}
              title={tooltipText || ""} // <-- tooltip nativo
            >
              <div className="celda-wrapper">
                {labels.length > 0 && (
                  <div className="franco-text">
                    {labels.join(" / ")}
                  </div>
                )}
                {eventCodes && (
                  <div className="evento-codes">{eventCodes}</div>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    );
  }

  // ---------- render tabla sucursal ----------
  function renderSucursalSection(s) {
    const sid = Number(s.id);
    const lista = empleadosPorSucursal.get(sid) || [];

    if (!lista.length) {
      return (
        <div key={sid} className="mb-4">
          <h5 className="mb-2">{s.nombre}</h5>
          <Alert variant="secondary" className="py-2">
            No hay empleados asignados a esta sucursal.
          </Alert>
        </div>
      );
    }

    return (
      <div key={sid} className="table-wrapper mb-4">
        <h5 className="mb-2">{s.nombre}</h5>

        <div className="table-scroll">
          <Table bordered size="sm" className="planificacion-table">
            <thead>
              <tr className="text-center sticky-header">
                <th className="fixed-column empleado-head">Empleado</th>

                {dateRange.map((dateIso) => {
                  const d = new Date(dateIso + "T00:00:00");
                  const wd = d.getDay(); // 0=Dom..6=Sab
                  const isWeekend = wd === 0 || wd === 6;

                  return (
                    <th
                      key={dateIso}
                      className="fecha-head"
                      style={{
                        backgroundColor: isWeekend ? "yellow" : "",
                      }}
                    >
                      {dateIso}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>{lista.map((emp) => renderEmpleadoRow(emp))}</tbody>
          </Table>
        </div>
      </div>
    );
  }

  // ---------- render principal ----------
  return (
  <Container fluid className="mt-3 cpm-page">
    <Row>
      <Col>
        <Card className="cpm-card">
          <Card.Header className="cpm-header">
            <strong>Planificación de Eventos</strong>
          </Card.Header>

          <Card.Body>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            {/* Filtros + Buscar */}
            <Form onSubmit={handleSearch} className="mb-3 cpm-filters">
              <Row className="g-2">
                <Col xs={12} sm={6} md={3}>
                  <Form.Label className="mb-1">Fecha Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="form-control my-input"
                  />
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Label className="mb-1">Fecha Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="form-control my-input"
                  />
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Label className="mb-1">Sucursal</Form.Label>
                  <Form.Select
                    value={sucursalId}
                    onChange={(e) => setSucursalId(e.target.value)}
                    className="form-control my-input"
                  >
                    <option value="">Todas</option>
                    {(sucursalesCtx || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col xs={12} sm={6} md={3} className="d-flex align-items-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-100 cpm-btn"
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" className="me-1" />
                    ) : (
                      "Buscar"
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* LEYENDA DE COLORES */}
            <Row className="mb-3">
              <Col>
                <div className="d-flex flex-wrap gap-3 cpm-legend">
                  <div className="d-flex align-items-center gap-2">
                    <span className="legend-box legend-weekend"></span>
                    <span>Fin de semana</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="legend-box legend-vacaciones"></span>
                    <span>Vacaciones</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="legend-box legend-franco"></span>
                    <span>Franco (AM / PM)</span>
                  </div>
                </div>
              </Col>
            </Row>

            {loading && (
              <div className="text-center my-4 py-4">
                <Spinner animation="border" size="lg" />
              </div>
            )}

            {!loading && dateRange.length > 0 && (
              <div>
                {sucursalesFiltradas.map((s) => renderSucursalSection(s))}
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);
}
