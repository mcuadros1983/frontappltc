import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  Modal,
  ListGroup,
} from "react-bootstrap";
import Contexts from "../../context/Contexts";
import "./PlanificacionManager.css";
import AsignarEmpleadoModal from "./AsignarEmpleadoModal";
import EventoModal from "./EventoModal";


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

const getEmpleadoDni = (item) => {
  return (
    item?.empleado?.cuil ||
    item?.empleado?.numero ||
    item?.empleado?.dni ||
    "—"
  );
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
  const conceptosCtx = dataContext?.conceptos;

  const empleadosActivos = useMemo(() => {
    return (empleadosCtx || []).filter((item) => {
      const empleado =
        item?.empleado ?? item;

      return empleado?.fechabaja == null;
    });
  }, [empleadosCtx]);
  // filtros UI - Inicialización con fecha actual y 30 días después
  const today = new Date();
  const startDateDefault = toIsoDate(today);
  const endDateDefault = toIsoDate(
    new Date(today.setDate(today.getDate() + 30))
  );

  const [startDate, setStartDate] = useState(startDateDefault);
  const [endDate, setEndDate] = useState(endDateDefault);
  const [sucursalId, setSucursalId] = useState("");

  const [
    filtroEmpleado,
    setFiltroEmpleado,
  ] = useState("");

  const [
    soloSinSucursal,
    setSoloSinSucursal,
  ] = useState(false);

  const [
    ocultarSucursalesVacias,
    setOcultarSucursalesVacias,
  ] = useState(false);

  const [
    showDatosEmpleadoModal,
    setShowDatosEmpleadoModal,
  ] = useState(false);

  const [
    datosEmpleadoModalPayload,
    setDatosEmpleadoModalPayload,
  ] = useState(null);

  const [
    showEventoModal,
    setShowEventoModal,
  ] = useState(false);

  const [
    eventoModalPayload,
    setEventoModalPayload,
  ] = useState(null);

  const [
    eventosSeleccionDia,
    setEventosSeleccionDia,
  ] = useState([]);

  const [
    showSeleccionEvento,
    setShowSeleccionEvento,
  ] = useState(false);

  // datos cargados dinámicamente
  const [events, setEvents] = useState([]); // eventos (códigos)
  const [vacaciones, setVacaciones] = useState([]); // vacaciones
  const [dateRange, setDateRange] = useState([]);
  const [
    mobileDayIndex,
    setMobileDayIndex,
  ] = useState(0);
  const [
    mobileSucursalAbierta,
    setMobileSucursalAbierta,
  ] = useState(null);
  const [
    mobileWeekStart,
    setMobileWeekStart,
  ] = useState(() => {
    const hoy = new Date();
    const dia = hoy.getDay();

    // Lunes de la semana actual
    const diferencia =
      dia === 0 ? -6 : 1 - dia;

    const lunes = new Date(hoy);
    lunes.setDate(
      hoy.getDate() + diferencia
    );

    return toIsoDate(lunes);
  });
  // estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // conceptos (para mostrar códigos de evento)
  const [conceptos, setConceptos] = useState(conceptosCtx);

  // datosempleado (sucursal_id, franco_am, franco_pm, etc.)
  const [datosEmpleadoList, setDatosEmpleadoList] = useState([]);
  const [jornadas, setJornadas] =
    useState([]);
  const [
    ventas7DiasPorSucursal,
    setVentas7DiasPorSucursal,
  ] = useState({});

  const [
    loadingVentas7Dias,
    setLoadingVentas7Dias,
  ] = useState(false);

  const [
    ordenSucursales,
    setOrdenSucursales,
  ] = useState("nombre");


  // ---------- cargar conceptos ----------
  useEffect(() => {
    let mounted = true;

    const cargarConceptos = async () => {
      try {
        const r = await fetch(
          `${apiUrl}/conceptos?limit=1000&order=nombre&dir=ASC`,
          {
            credentials: "include",
          }
        );

        const d = await r.json().catch(() => null);

        if (!r.ok) {
          throw new Error(
            d?.error || "No se pudieron obtener conceptos."
          );
        }

        const arr = Array.isArray(d?.items)
          ? d.items
          : Array.isArray(d)
            ? d
            : [];

        if (mounted) {
          setConceptos(arr);
        }
      } catch (e) {
        console.warn(
          "No se pudieron cargar conceptos:",
          e
        );
      }
    };

    cargarConceptos();

    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  const cargarDatosEmpleado = async () => {
    try {
      const r = await fetch(
        `${apiUrl}/datosempleado?limit=1000`,
        {
          credentials: "include",
        }
      );

      const d = await r
        .json()
        .catch(() => null);

      if (!r.ok) {
        throw new Error(
          d?.error ||
          "No se pudieron obtener datosempleado."
        );
      }

      const arr = Array.isArray(d?.items)
        ? d.items
        : Array.isArray(d)
          ? d
          : [];

      setDatosEmpleadoList(arr);

      return arr;
    } catch (e) {
      console.error(
        "Error cargando datosempleado:",
        e
      );

      setDatosEmpleadoList([]);

      return [];
    }
  };

  const cargarVentasUltimos7Dias =
    async () => {

      setLoadingVentas7Dias(true);

      try {

        // Hoy
        const hasta = new Date();

        // Incluyendo hoy son 7 días:
        // hoy + los 6 anteriores
        const desde = new Date();

        desde.setDate(
          desde.getDate() - 6
        );

        const fechaDesde =
          toIsoDate(desde);

        const fechaHasta =
          toIsoDate(hasta);

        const response = await fetch(
          `${apiUrl}/ventas/filtradas`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              fechaDesde,
              fechaHasta,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Error al obtener ventas"
          );
        }

        const data =
          await response.json();

        const ventas =
          Array.isArray(data)
            ? data
            : [];

        // ---------------------------------
        // TOTAL POR SUCURSAL
        // ---------------------------------

        const totales = {};

        for (const venta of ventas) {

          const sid =
            Number(
              venta.sucursal_id
            );

          if (!sid) {
            continue;
          }

          const monto =
            Number(
              venta.monto || 0
            );

          if (!totales[sid]) {
            totales[sid] = 0;
          }

          totales[sid] += monto;
        }

        setVentas7DiasPorSucursal(
          totales
        );

      } catch (err) {

        console.error(
          "Error cargando ventas de los últimos 7 días:",
          err
        );

        setVentas7DiasPorSucursal(
          {}
        );

      } finally {

        setLoadingVentas7Dias(false);

      }
    };

  useEffect(() => {

    cargarDatosEmpleado();

    cargarVentasUltimos7Dias();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cargarJornadas = async () => {
      try {
        const r = await fetch(
          `${apiUrl}/jornadas?limit=1000`,
          {
            credentials: "include",
          }
        );

        const d = await r
          .json()
          .catch(() => null);

        if (!r.ok) {
          throw new Error(
            d?.error ||
            "No se pudieron obtener jornadas."
          );
        }

        const arr = Array.isArray(d?.items)
          ? d.items
          : Array.isArray(d)
            ? d
            : [];

        setJornadas(arr);
      } catch (e) {
        console.error(
          "Error cargando jornadas:",
          e
        );

        setJornadas([]);
      }
    };

    cargarJornadas();
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

  // Indica si un evento corresponde al concepto FINDE
  const esEventoFinde = (evento) => {
    const concepto =
      conceptosMap.get(
        getEvConceptoId(evento)
      );

    const nombre = String(
      concepto?.nombre || ""
    )
      .trim()
      .toUpperCase();

    return nombre === "FINDE";
  };

  const getSemanaRango = (dateIso) => {
    const fecha = new Date(
      `${dateIso}T00:00:00`
    );

    const dia = fecha.getDay();

    // Diferencia hasta el lunes
    const diferenciaLunes =
      dia === 0
        ? -6
        : 1 - dia;

    const lunes = new Date(fecha);

    lunes.setDate(
      fecha.getDate() +
      diferenciaLunes
    );

    const domingo =
      new Date(lunes);

    domingo.setDate(
      lunes.getDate() + 6
    );

    return {
      desde: toIsoDate(lunes),
      hasta: toIsoDate(domingo),
    };
  };

  const tieneFindeEnSemana = (
    empId,
    dateIso
  ) => {

    const empleadoId =
      Number(empId);

    const {
      desde,
      hasta,
    } = getSemanaRango(
      dateIso
    );

    return (events || []).some(
      (evento) => {

        if (
          getEvEmpleadoId(evento) !==
          empleadoId
        ) {
          return false;
        }

        if (
          !esEventoFinde(evento)
        ) {
          return false;
        }

        const eventoDesde =
          evento.fecha_desde;

        const eventoHasta =
          evento.fecha_hasta ||
          evento.fecha_desde;

        if (
          !eventoDesde ||
          !eventoHasta
        ) {
          return false;
        }

        // El evento FINDE pertenece a esta
        // semana si su período se superpone
        // con lunes-domingo.
        return (
          eventoDesde <= hasta &&
          eventoHasta >= desde
        );
      }
    );
  };

  // empleado_id -> datosEmpleado (sucursal_id, franco_am, franco_pm)
  const datosEmpleadoMap = useMemo(() => {
    const m = new Map();
    for (const row of datosEmpleadoList || []) {
      m.set(Number(row.empleado_id), row);
    }
    return m;
  }, [datosEmpleadoList]);

  const empleadosPlanificacion = useMemo(() => {
    let lista = empleadosActivos.map((empleado) => {
      const empleadoId =
        getEmpleadoId(empleado);

      const datosEmpleado =
        datosEmpleadoMap.get(empleadoId) ||
        null;

      const sucursalAsignadaId =
        Number(
          datosEmpleado?.sucursal_id
        ) || 0;

      return {
        empleado,
        empleadoId,
        datosEmpleado,
        sucursalAsignadaId,
        tieneSucursal:
          sucursalAsignadaId > 0,
      };
    });

    // FILTRO POR SUCURSAL
    if (sucursalId) {
      lista = lista.filter(
        ({ sucursalAsignadaId }) =>
          Number(sucursalAsignadaId) ===
          Number(sucursalId)
      );
    }

    // SOLO SIN SUCURSAL
    if (soloSinSucursal) {
      lista = lista.filter(
        ({ tieneSucursal }) =>
          !tieneSucursal
      );
    }

    // BUSCADOR
    const termino = filtroEmpleado
      .trim()
      .toLowerCase();

    if (termino) {
      lista = lista.filter(
        ({ empleado }) => {
          const nombre =
            getEmpleadoNombre(
              empleado
            ).toLowerCase();

          const dni = String(
            getEmpleadoDni(empleado)
          ).toLowerCase();

          return (
            nombre.includes(termino) ||
            dni.includes(termino)
          );
        }
      );
    }

    // ORDEN ALFABÉTICO
    lista.sort((a, b) =>
      getEmpleadoNombre(
        a.empleado
      ).localeCompare(
        getEmpleadoNombre(b.empleado),
        "es",
        {
          sensitivity: "base",
        }
      )
    );

    return lista;
  }, [
    empleadosActivos,
    datosEmpleadoMap,
    sucursalId,
    soloSinSucursal,
    filtroEmpleado,
  ]);

  const mobileWeekDays = useMemo(() => {
    const inicio = new Date(
      `${mobileWeekStart}T00:00:00`
    );

    const dias = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);

      dias.push(toIsoDate(d));
    }

    return dias;
  }, [mobileWeekStart]);
  const cambiarSemanaMobile = (
    cantidadSemanas
  ) => {
    const actual = new Date(
      `${mobileWeekStart}T00:00:00`
    );

    actual.setDate(
      actual.getDate() +
      cantidadSemanas * 7
    );

    setMobileWeekStart(
      toIsoDate(actual)
    );
    setMobileDayIndex(0);
    setMobileSucursalAbierta(null)
  };

  const cambiarDiaMobile = (
    direccion
  ) => {
    const nuevo =
      mobileDayIndex + direccion;

    // Lunes -> domingo de semana anterior
    if (nuevo < 0) {
      const actual = new Date(
        `${mobileWeekStart}T00:00:00`
      );

      actual.setDate(
        actual.getDate() - 7
      );

      setMobileWeekStart(
        toIsoDate(actual)
      );

      setMobileDayIndex(6);
      setMobileSucursalAbierta(null);

      return;
    }

    // Domingo -> lunes de semana siguiente
    if (nuevo > 6) {
      const actual = new Date(
        `${mobileWeekStart}T00:00:00`
      );

      actual.setDate(
        actual.getDate() + 7
      );

      setMobileWeekStart(
        toIsoDate(actual)
      );

      setMobileDayIndex(0);
      setMobileSucursalAbierta(null);

      return;
    }

    setMobileDayIndex(nuevo);
    setMobileSucursalAbierta(null);
  };
  const toggleSucursalMobile = (
    sucursalId
  ) => {
    setMobileSucursalAbierta(
      (actual) =>
        Number(actual) ===
          Number(sucursalId)
          ? null
          : Number(sucursalId)
    );
  };
  const irSemanaActualMobile = () => {
    const hoy = new Date();
    const dia = hoy.getDay();

    const diferencia =
      dia === 0 ? -6 : 1 - dia;

    const lunes = new Date(hoy);

    lunes.setDate(
      hoy.getDate() + diferencia
    );

    setMobileWeekStart(
      toIsoDate(lunes)
    );

    // Lun=0, Mar=1 ... Dom=6
    const indiceHoy =
      dia === 0
        ? 6
        : dia - 1;

    setMobileDayIndex(
      indiceHoy
    );

    setMobileSucursalAbierta(null);
  };

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

  // Sucursales que se mostrarán en la planificación.
  // Cuando está activo "Solo empleados sin sucursal",
  // agregamos una sección virtual con id 0.
  // const sucursalesPlanificacion =
  //   useMemo(() => {

  //     if (soloSinSucursal) {
  //       return [
  //         {
  //           id: 0,
  //           nombre: "Sin sucursal",
  //           esSinSucursal: true,
  //         },
  //       ];
  //     }

  //     return sucursalesFiltradas;

  //   }, [
  //     soloSinSucursal,
  //     sucursalesFiltradas,
  //   ]);

  // empleado -> sucursal usando datosEmpleadoMap
  const getSucursalIdDeEmpleado = (empleado) => {
    const id = getEmpleadoId(empleado);
    if (!id) return 0;
    const datos = datosEmpleadoMap.get(id);
    if (!datos) return 0;
    return Number(datos.sucursal_id) || 0;
  };

  const abrirDatosEmpleado = (
    empleado
  ) => {
    const empleadoId =
      getEmpleadoId(empleado);

    if (!empleadoId) return;

    const datosEmpleado =
      datosEmpleadoMap.get(
        empleadoId
      ) || null;

    setDatosEmpleadoModalPayload({
      empleado_id: empleadoId,

      empleado_nombre:
        getEmpleadoNombre(empleado),

      empleado_dni:
        getEmpleadoDni(empleado),

      modo: datosEmpleado
        ? "editar"
        : "nuevo",

      sucursal_id:
        datosEmpleado?.sucursal_id ??
        null,

      jornada_id:
        datosEmpleado?.jornada_id ??
        null,

      franco_am:
        datosEmpleado?.franco_am ??
        null,

      franco_pm:
        datosEmpleado?.franco_pm ??
        null,

      telefono:
        datosEmpleado?.telefono ?? "",

      tipo:
        datosEmpleado?.tipo ??
        "VENDEDOR",
    });

    setShowDatosEmpleadoModal(true);
  };

  const cerrarDatosEmpleadoModal =
    async (changed = false) => {
      setShowDatosEmpleadoModal(false);
      setDatosEmpleadoModalPayload(null);

      if (changed) {
        await cargarDatosEmpleado();
      }
    };

  const abrirNuevoEvento = (
    empleado,
    fechaEvento = null
  ) => {
    const empleadoId =
      getEmpleadoId(empleado);

    if (!empleadoId) return;

    const datosEmpleado =
      datosEmpleadoMap.get(
        empleadoId
      ) || null;

    const sucursalAsignadaId =
      Number(
        datosEmpleado?.sucursal_id
      ) || 0;

    const fechaInicial =
      fechaEvento ||
      startDate ||
      "";

    setEventoModalPayload({
      empleado_id: empleadoId,

      sucursal_id:
        sucursalAsignadaId || "",

      concepto_id: "",

      fecha_desde:
        fechaInicial,

      fecha_hasta:
        fechaInicial,

      observaciones: "",
    });

    setShowEventoModal(true);
  };

  const abrirEditarEvento = (evento) => {
    if (!evento?.id) {
      return;
    }

    setEventoModalPayload({
      id: evento.id,

      fecha_desde:
        evento.fecha_desde || "",

      fecha_hasta:
        evento.fecha_hasta || "",

      concepto_id: Number(
        evento.concepto_id ??
        evento.concepto
      ),

      empleado_id: Number(
        evento.empleado_id ??
        evento.empleado
      ),

      sucursal_id: Number(
        evento.sucursal_id ??
        evento.sucursal
      ),

      observaciones:
        evento.observaciones || "",
    });

    setShowEventoModal(true);
  };

  const manejarDobleClickEvento = (
    eventosDelDia
  ) => {
    if (
      !Array.isArray(eventosDelDia) ||
      eventosDelDia.length === 0
    ) {
      return;
    }

    // Un solo evento:
    // abrimos directamente.
    if (eventosDelDia.length === 1) {
      abrirEditarEvento(
        eventosDelDia[0]
      );

      return;
    }

    // Más de un evento:
    // mostramos selector.
    setEventosSeleccionDia(
      eventosDelDia
    );

    setShowSeleccionEvento(true);
  };

  // Agrupamos empleados por sucursal
  // utilizando la lista YA FILTRADA por:
  // - empleado
  // - sucursal
  // - sin sucursal
  const empleadosPorSucursal = useMemo(() => {
    const map = new Map();

    // Inicializamos las sucursales visibles
    for (const s of sucursalesFiltradas) {
      map.set(Number(s.id), []);
    }

    // Clave especial para empleados sin sucursal
    map.set(0, []);

    // IMPORTANTE:
    // usamos empleadosPlanificacion,
    // NO empleadosActivos
    for (const item of empleadosPlanificacion) {
      const {
        empleado,
        sucursalAsignadaId,
      } = item;

      const sid =
        Number(sucursalAsignadaId) || 0;

      if (!map.has(sid)) {
        map.set(sid, []);
      }

      map.get(sid).push(empleado);
    }

    // Orden alfabético
    for (const [sid, arr] of map.entries()) {
      arr.sort((a, b) =>
        getEmpleadoNombre(a).localeCompare(
          getEmpleadoNombre(b),
          "es",
          {
            sensitivity: "base",
          }
        )
      );

      map.set(sid, arr);
    }

    return map;
  }, [
    sucursalesFiltradas,
    empleadosPlanificacion,
  ]);

  // Sucursales que finalmente se muestran
  // en la planificación.
  const sucursalesPlanificacion = useMemo(() => {
    // Modo especial:
    // empleados que todavía no tienen sucursal.
    if (soloSinSucursal) {
      return [
        {
          id: 0,
          nombre: "Sin sucursal",
          esSinSucursal: true,
        },
      ];
    }

    let lista = [...sucursalesFiltradas];

    // Ocultar sucursales sin empleados visibles
    if (ocultarSucursalesVacias) {
      lista = lista.filter((sucursal) => {
        const empleados =
          empleadosPorSucursal.get(
            Number(sucursal.id)
          ) || [];

        return empleados.length > 0;
      });
    }

    // ==========================================
    // ORDEN DE SUCURSALES
    // ==========================================

    if (ordenSucursales === "ventas") {
      // Mayor venta últimos 7 días -> menor venta
      lista.sort((a, b) => {
        const ventasA = Number(
          ventas7DiasPorSucursal[Number(a.id)] || 0
        );

        const ventasB = Number(
          ventas7DiasPorSucursal[Number(b.id)] || 0
        );

        // Primero mayor venta
        if (ventasB !== ventasA) {
          return ventasB - ventasA;
        }

        // Si tienen la misma venta, orden alfabético
        return String(a.nombre || "").localeCompare(
          String(b.nombre || ""),
          "es",
          {
            sensitivity: "base",
          }
        );
      });
    } else {
      // Orden alfabético por nombre
      lista.sort((a, b) =>
        String(a.nombre || "").localeCompare(
          String(b.nombre || ""),
          "es",
          {
            sensitivity: "base",
          }
        )
      );
    }

    return lista;
  }, [
    soloSinSucursal,
    sucursalesFiltradas,
    ocultarSucursalesVacias,
    empleadosPorSucursal,
    ordenSucursales,
    ventas7DiasPorSucursal,
  ]);

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
            events: [ev],
          });
        } else {
          const slot =
            eventsPerDay.get(key);

          slot.codes.push(code);
          slot.names.push(name);
          slot.events.push(ev);
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
  function getFrancoInfo(
    empId,
    dateIso
  ) {

    const empleadoId =
      Number(empId);

    const w =
      weekdayNumber1to7(
        dateIso
      );

    // =====================================
    // ¿HAY FINDE EN ESTA SEMANA?
    // =====================================

    const tieneFinde =
      tieneFindeEnSemana(
        empleadoId,
        dateIso
      );

    if (tieneFinde) {

      // SÁBADO
      //
      // AM trabaja
      // PM franco
      if (w === 6) {
        return {
          isFrancoAM: false,
          isFrancoPM: true,
          tieneFinde: true,
        };
      }

      // DOMINGO
      //
      // AM franco
      // PM franco
      if (w === 7) {
        return {
          isFrancoAM: true,
          isFrancoPM: true,
          tieneFinde: true,
        };
      }

      // LUNES A VIERNES
      //
      // Durante esta semana especial
      // NO usamos el franco habitual
      // registrado del empleado.
      return {
        isFrancoAM: false,
        isFrancoPM: false,
        tieneFinde: true,
      };
    }


    // =====================================
    // SEMANA NORMAL
    // =====================================

    const datos =
      datosEmpleadoMap.get(
        empleadoId
      );

    if (!datos) {
      return {
        isFrancoAM: false,
        isFrancoPM: false,
        tieneFinde: false,
      };
    }

    const isFrancoAM =
      Number(datos.franco_am) === w;

    const isFrancoPM =
      Number(datos.franco_pm) === w;

    return {
      isFrancoAM,
      isFrancoPM,
      tieneFinde: false,
    };
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

  const cargarSemanaMobile =
    async () => {
      if (!mobileWeekDays.length) {
        return;
      }

      const desde =
        mobileWeekDays[0];

      const hasta =
        mobileWeekDays[
        mobileWeekDays.length - 1
        ];

      setLoading(true);
      setError("");

      try {
        let urlEv =
          `${apiUrl}/eventos` +
          `?start_date=${desde}` +
          `&end_date=${hasta}` +
          `&order=fecha_desde` +
          `&dir=ASC` +
          `&limit=10000`;

        const rEv = await fetch(
          urlEv,
          {
            credentials: "include",
          }
        );

        const dEv = await rEv
          .json()
          .catch(() => null);

        if (!rEv.ok) {
          throw new Error(
            dEv?.error ||
            "No se pudieron obtener eventos."
          );
        }

        const arrEv =
          Array.isArray(dEv?.items)
            ? dEv.items
            : Array.isArray(dEv)
              ? dEv
              : [];

        let urlVac =
          `${apiUrl}/asignacionesvacaciones` +
          `?desde=${desde}` +
          `&hasta=${hasta}` +
          `&limit=10000`;

        const rVac = await fetch(
          urlVac,
          {
            credentials: "include",
          }
        );

        const dVac = await rVac
          .json()
          .catch(() => null);

        if (!rVac.ok) {
          throw new Error(
            dVac?.error ||
            "No se pudieron obtener vacaciones."
          );
        }

        const arrVac =
          Array.isArray(dVac?.items)
            ? dVac.items
            : Array.isArray(dVac)
              ? dVac
              : [];

        setEvents(arrEv);
        setVacaciones(arrVac);

      } catch (err) {
        console.error(err);

        setError(
          "Error al obtener la planificación: " +
          (err?.message || "desconocido")
        );

        setEvents([]);
        setVacaciones([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    cargarSemanaMobile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileWeekStart]);

  const dotacionMobile = useMemo(() => {

    return (sucursalesCtx || [])
      .map((sucursal) => {

        const sid =
          Number(sucursal.id);

        const empleadosSucursal =
          empleadosActivos.filter(
            (empleado) =>
              Number(
                datosEmpleadoMap.get(
                  getEmpleadoId(
                    empleado
                  )
                )?.sucursal_id
              ) === sid
          );

        const dias =
          mobileWeekDays.map(
            (dateIso) => {

              let disponiblesAM = 0;
              let disponiblesPM = 0;

              let francosAM = 0;
              let francosPM = 0;

              let vacacionesCount = 0;

              const detalle = [];

              for (
                const empleado
                of empleadosSucursal
              ) {
                const empleadoId =
                  getEmpleadoId(
                    empleado
                  );

                const {
                  vacationDays,
                } =
                  buildCalendarioEmpleado(
                    empleadoId
                  );

                const isVacation =
                  vacationDays.has(
                    dateIso
                  );

                const {
                  isFrancoAM,
                  isFrancoPM,
                } =
                  getFrancoInfo(
                    empleadoId,
                    dateIso
                  );

                const disponibleAM =
                  !isVacation &&
                  !isFrancoAM;

                const disponiblePM =
                  !isVacation &&
                  !isFrancoPM;

                if (disponibleAM) {
                  disponiblesAM++;
                } else if (isFrancoAM) {
                  francosAM++;
                }

                if (disponiblePM) {
                  disponiblesPM++;
                } else if (isFrancoPM) {
                  francosPM++;
                }

                if (isVacation) {
                  vacacionesCount++;
                }

                detalle.push({
                  empleado,
                  empleadoId,
                  isVacation,
                  isFrancoAM,
                  isFrancoPM,
                  disponibleAM,
                  disponiblePM,
                });
              }

              return {
                dateIso,

                total:
                  empleadosSucursal.length,

                disponiblesAM,
                disponiblesPM,

                francosAM,
                francosPM,

                vacaciones:
                  vacacionesCount,

                detalle,
              };
            }
          );

        return {
          sucursal,
          empleadosSucursal,
          dias,
        };
      })
      .filter(
        (item) =>
          item.empleadosSucursal.length >
          0
      );

  }, [
    sucursalesCtx,
    empleadosActivos,
    datosEmpleadoMap,
    mobileWeekDays,
    vacaciones,
  ]);

  const cerrarEventoModal =
    async (changed = false) => {
      setShowEventoModal(false);
      setEventoModalPayload(null);

      if (changed) {
        await Promise.all([
          handleSearch(),
          cargarSemanaMobile(),
        ]);
      }
    };

  // ---------- render fila empleado ----------
  function renderEmpleadoRow(empleado) {
    const empId = getEmpleadoId(empleado);
    const datosEmpleado =
      datosEmpleadoMap.get(empId) || null;

    const { eventsPerDay, vacationDays } = buildCalendarioEmpleado(
      empId
    );

    return (
      <tr key={empId} className="text-center">
        <td className="fixed-column sticky-col empleado-cell">
          {getEmpleadoNombre(empleado)}
        </td>

        <td
          className="align-middle"
          style={{
            minWidth: 190,
            width: 190,
          }}
        >
          <div className="d-flex gap-1 justify-content-center flex-nowrap">
            <Button
              type="button"
              size="sm"
              variant="primary"
              className="text-nowrap"
              onClick={() =>
                abrirNuevoEvento(
                  empleado
                )
              }
            >
              + Evento
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline-secondary"
              className="text-nowrap"
              onClick={() =>
                abrirDatosEmpleado(empleado)
              }
            >
              {datosEmpleado
                ? "Editar"
                : "Asignar"}
            </Button>

          </div>
        </td>

        {dateRange.map((dateIso) => {
          // info base
          const dayInfo = eventsPerDay.get(dateIso) || {
            codes: [],
            names: [],
            events: [],
          }

          const codes = dayInfo.codes; // códigos cortos para mostrar
          const names = dayInfo.names; // nombres largos para tooltip

          const eventosDelDia =
            dayInfo.events || [];

          const tieneEventos =
            eventosDelDia.length > 0;

          // vacaciones?
          const isVacation = vacationDays.has(dateIso);

          // francos?
          const {
            isFrancoAM,
            isFrancoPM,
            tieneFinde,
          } = getFrancoInfo(
            empId,
            dateIso
          );

          // fin de semana?
          const dow = new Date(dateIso + "T00:00:00").getDay(); // 0..6
          const isWeekend = dow === 0 || dow === 6;

          const esSabadoFinde =
            tieneFinde &&
            dow === 6;

          // --- COLOR fondo ---
          let backgroundColor = "";

          if (isVacation) {

            backgroundColor = "red";

          } else if (esSabadoFinde) {

            // Semana con cambio de franco FINDE:
            // el sábado se muestra visualmente
            // completamente azul.
            //
            // El texto "PM" indica que el
            // franco corresponde solo a la tarde.
            backgroundColor = "blue";

          } else if (
            isFrancoAM ||
            isFrancoPM
          ) {

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
              className={`franco-cell ${tieneEventos
                ? "evento-editable-cell"
                : ""
                }`}
              style={{
                backgroundColor,
                cursor: tieneEventos
                  ? "pointer"
                  : "default",
              }}
              title={
                tieneEventos
                  ? `${tooltipText || ""}${tooltipText ? " | " : ""
                  }Doble click para editar`
                  : tooltipText || ""
              }
              onDoubleClick={() =>
                manejarDobleClickEvento(
                  eventosDelDia
                )
              }
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

    const ventas7Dias =
      Number(
        ventas7DiasPorSucursal[sid] ||
        0
      );

    const ventas7DiasTexto =
      ventas7Dias.toLocaleString(
        "es-AR",
        {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

    if (!lista.length) {
      return (
        <div key={sid} className="mb-4">
          {/* <h5 className="mb-2">{s.nombre}</h5> */}
          <h5 className="mb-2 d-flex align-items-center gap-3">

            <span>
              {s.nombre}
            </span>

            <span
              className="text-success"
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {loadingVentas7Dias
                ? "Ventas: cargando..."
                : `Ventas últimos 7 días: ${ventas7DiasTexto}`
              }
            </span>

          </h5>
          <Alert variant="secondary" className="py-2">
            No hay empleados asignados a esta sucursal.
          </Alert>
        </div>
      );
    }

    return (
      <div key={sid} className="table-wrapper mb-4">
        {/* <h5 className="mb-2">{s.nombre}</h5> */}
        <h5 className="mb-2 d-flex align-items-center gap-3">

          <span>
            {s.nombre}
          </span>

          <span
            className="text-success"
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {loadingVentas7Dias
              ? "Ventas: cargando..."
              : `Ventas últimos 7 días: ${ventas7DiasTexto}`
            }
          </span>

        </h5>

        <div className="table-scroll">
          <Table bordered size="sm" className="planificacion-table">
            <thead>
              <tr className="text-center sticky-header">
                <th className="fixed-column empleado-head">
                  Empleado
                </th>

                <th
                  className="acciones-head"
                  style={{
                    minWidth: 190,
                    width: 190,
                  }}
                >
                  Acciones
                </th>

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
              <Form
                onSubmit={handleSearch}
                className="mb-3 cpm-filters d-none d-md-block"
              >
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
                      onChange={(e) => {
                        setSucursalId(
                          e.target.value
                        );

                        if (e.target.value) {
                          setSoloSinSucursal(false);
                        }
                      }}
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

                <Row className="g-2 mt-2">

                  {/* BUSCAR EMPLEADO */}
                  <Col xs={12} md={6}>
                    <Form.Label className="mb-1">
                      Empleado
                    </Form.Label>

                    <Form.Control
                      type="search"
                      value={filtroEmpleado}
                      onChange={(e) =>
                        setFiltroEmpleado(
                          e.target.value
                        )
                      }
                      placeholder="Buscar por nombre o DNI..."
                      style={{
                        minHeight: 48,
                      }}
                    />
                  </Col>

                  {/* SIN SUCURSAL */}
                  <Col
                    xs={12}
                    md={3}
                    className="d-flex align-items-end"
                  >
                    <div
                      className="border rounded px-3 d-flex align-items-center w-100"
                      style={{
                        minHeight: 48,
                      }}
                    >
                      <Form.Check
                        type="switch"
                        id="solo-sin-sucursal"
                        label="Solo empleados sin sucursal"
                        checked={soloSinSucursal}
                        onChange={(e) => {
                          const checked =
                            e.target.checked;

                          setSoloSinSucursal(
                            checked
                          );

                          if (checked) {
                            setSucursalId("");
                          }
                        }}
                      />
                    </div>
                  </Col>

                  {/* OCULTAR SUCURSALES VACÍAS */}
                  <Col
                    xs={12}
                    md={3}
                    className="d-flex align-items-end"
                  >
                    <div
                      className="border rounded px-3 d-flex align-items-center w-100"
                      style={{
                        minHeight: 48,
                      }}
                    >
                      <Form.Check
                        type="switch"
                        id="ocultar-sucursales-vacias"
                        label="Ocultar sucursales vacías"
                        checked={ocultarSucursalesVacias}
                        onChange={(e) =>
                          setOcultarSucursalesVacias(
                            e.target.checked
                          )
                        }
                      />
                    </div>
                  </Col>

                </Row>

                <Row className="g-2 mt-2">
                  <Col xs={12} sm={6} md={3}>
                    <Form.Label className="mb-1">
                      Ordenar sucursales por
                    </Form.Label>

                    <Form.Select
                      value={ordenSucursales}
                      onChange={(e) =>
                        setOrdenSucursales(e.target.value)
                      }
                      className="form-control my-input"
                    >
                      <option value="nombre">
                        Nombre de sucursal
                      </option>

                      <option value="ventas">
                        Ventas últimos 7 días
                      </option>
                    </Form.Select>
                  </Col>
                </Row>

              </Form>


              {/* =========================
    PLANIFICACION - MOBILE
    ========================= */}

              <div className="d-md-none mb-3">

                {/* NAVEGACION SEMANAL */}

                <div className="border rounded p-2 mb-3">

                  <div className="d-flex align-items-center justify-content-between gap-2">

                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() =>
                        cambiarSemanaMobile(-1)
                      }
                      style={{
                        minWidth: 46,
                        minHeight: 46,
                      }}
                    >
                      ‹
                    </Button>

                    <div className="text-center flex-grow-1">

                      <div className="fw-bold">
                        Semana
                      </div>

                      <div className="small text-muted">
                        {new Date(
                          `${mobileWeekDays[0]}T00:00:00`
                        ).toLocaleDateString(
                          "es-AR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                          }
                        )}

                        {" — "}

                        {new Date(
                          `${mobileWeekDays[
                          mobileWeekDays.length - 1
                          ]
                          }T00:00:00`
                        ).toLocaleDateString(
                          "es-AR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                          }
                        )}
                      </div>

                    </div>

                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() =>
                        cambiarSemanaMobile(1)
                      }
                      style={{
                        minWidth: 46,
                        minHeight: 46,
                      }}
                    >
                      ›
                    </Button>

                  </div>

                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="w-100 mt-1"
                    onClick={
                      irSemanaActualMobile
                    }
                  >
                    Ir a hoy
                  </Button>

                </div>

                <div className="d-flex gap-1 mb-3">

                  {mobileWeekDays.map(
                    (dateIso, index) => {

                      const fecha =
                        new Date(
                          `${dateIso}T00:00:00`
                        );

                      const nombre =
                        fecha
                          .toLocaleDateString(
                            "es-AR",
                            {
                              weekday: "short",
                            }
                          )
                          .replace(".", "")
                          .toUpperCase();

                      const numero =
                        fecha.getDate();

                      const activo =
                        index ===
                        mobileDayIndex;

                      return (
                        <Button
                          key={dateIso}
                          type="button"
                          variant={
                            activo
                              ? "primary"
                              : "outline-secondary"
                          }
                          className="flex-fill px-1 py-2"
                          onClick={() => {
                            setMobileDayIndex(index);
                            setMobileSucursalAbierta(null);
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "0.68rem",
                            }}
                          >
                            {nombre}
                          </div>

                          <strong>
                            {numero}
                          </strong>

                        </Button>
                      );
                    }
                  )}

                </div>

                <div className="d-flex align-items-center justify-content-between mb-3">

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() =>
                      cambiarDiaMobile(-1)
                    }
                    style={{
                      minWidth: 44,
                      minHeight: 44,
                    }}
                  >
                    ‹
                  </Button>

                  <div className="text-center">

                    <div className="fw-bold">
                      {new Date(
                        `${mobileWeekDays[
                        mobileDayIndex
                        ]
                        }T00:00:00`
                      )
                        .toLocaleDateString(
                          "es-AR",
                          {
                            weekday: "long",
                          }
                        )
                        .toUpperCase()}
                    </div>

                    <div className="small text-muted">
                      {new Date(
                        `${mobileWeekDays[
                        mobileDayIndex
                        ]
                        }T00:00:00`
                      ).toLocaleDateString(
                        "es-AR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </div>

                  </div>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() =>
                      cambiarDiaMobile(1)
                    }
                    style={{
                      minWidth: 44,
                      minHeight: 44,
                    }}
                  >
                    ›
                  </Button>

                </div>

                {/* SUCURSALES */}

                {loading ? (

                  <div className="text-center py-4">
                    <Spinner animation="border" />
                  </div>

                ) : dotacionMobile.length ? (

                  <div className="d-grid gap-2">

                    {dotacionMobile.map(
                      ({
                        sucursal,
                        empleadosSucursal,
                        dias,
                      }) => {

                        const dia =
                          dias[
                          mobileDayIndex
                          ];

                        if (!dia) {
                          return null;
                        }

                        const estaAbierta =
                          Number(
                            mobileSucursalAbierta
                          ) ===
                          Number(sucursal.id);

                        return (
                          <Card
                            key={sucursal.id}
                            className="border shadow-sm"
                          >

                            <Card.Body className="p-3">

                              <div
                                role="button"
                                tabIndex={0}
                                className="d-flex justify-content-between align-items-center mb-3"
                                style={{
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  toggleSucursalMobile(
                                    sucursal.id
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" ||
                                    e.key === " "
                                  ) {
                                    e.preventDefault();

                                    toggleSucursalMobile(
                                      sucursal.id
                                    );
                                  }
                                }}
                              >
                                <div>
                                  <strong>
                                    {sucursal.nombre}
                                  </strong>

                                  <div className="small text-muted">
                                    {estaAbierta
                                      ? "Ocultar detalle"
                                      : "Ver empleados"}
                                  </div>
                                </div>

                                <div className="text-end">
                                  <small className="text-muted d-block">
                                    {empleadosSucursal.length}{" "}
                                    asignados
                                  </small>

                                  <span
                                    style={{
                                      fontSize: "1.1rem",
                                    }}
                                  >
                                    {estaAbierta
                                      ? "▲"
                                      : "▼"}
                                  </span>
                                </div>
                              </div>

                              <Row className="g-2">

                                <Col xs={6}>

                                  <div className="bg-light rounded p-2 text-center">

                                    <small className="text-muted d-block">
                                      MAÑANA
                                    </small>

                                    <div
                                      className="fw-bold"
                                      style={{
                                        fontSize:
                                          "2rem",
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      {
                                        dia.disponiblesAM
                                      }
                                    </div>

                                    <small className="text-muted">
                                      disponibles
                                    </small>

                                    {dia.francosAM >
                                      0 && (
                                        <div className="small mt-1">
                                          {
                                            dia.francosAM
                                          }{" "}
                                          franco
                                        </div>
                                      )}

                                  </div>

                                </Col>

                                <Col xs={6}>

                                  <div className="bg-light rounded p-2 text-center">

                                    <small className="text-muted d-block">
                                      TARDE
                                    </small>

                                    <div
                                      className="fw-bold"
                                      style={{
                                        fontSize:
                                          "2rem",
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      {
                                        dia.disponiblesPM
                                      }
                                    </div>

                                    <small className="text-muted">
                                      disponibles
                                    </small>

                                    {dia.francosPM >
                                      0 && (
                                        <div className="small mt-1">
                                          {
                                            dia.francosPM
                                          }{" "}
                                          franco
                                        </div>
                                      )}

                                  </div>

                                </Col>

                              </Row>

                              {dia.vacaciones >
                                0 && (
                                  <div className="text-center mt-2">

                                    <span className="badge bg-danger">
                                      {
                                        dia.vacaciones
                                      }{" "}
                                      de vacaciones
                                    </span>

                                  </div>
                                )}

                              {estaAbierta && (

                                <div className="border-top mt-3 pt-2">

                                  <div className="small fw-bold mb-2">
                                    Personal del día
                                  </div>

                                  <div className="d-grid gap-2">

                                    {dia.detalle.map(
                                      ({
                                        empleado,
                                        empleadoId,
                                        isVacation,
                                        isFrancoAM,
                                        isFrancoPM,
                                        disponibleAM,
                                        disponiblePM,
                                      }) => {

                                        return (
                                          <div
                                            key={empleadoId}
                                            className="border rounded p-2"
                                          >

                                            <div className="d-flex justify-content-between align-items-start gap-2">

                                              <div>

                                                <div className="fw-semibold">
                                                  {getEmpleadoNombre(
                                                    empleado
                                                  )}
                                                </div>

                                                <div className="small mt-1">

                                                  {isVacation ? (

                                                    <span className="badge bg-danger">
                                                      Vacaciones
                                                    </span>

                                                  ) : (

                                                    <div className="d-flex flex-wrap gap-1">

                                                      <span
                                                        className={
                                                          disponibleAM
                                                            ? "badge bg-success"
                                                            : "badge bg-secondary"
                                                        }
                                                      >
                                                        AM{" "}
                                                        {disponibleAM
                                                          ? "Disponible"
                                                          : "Franco"}
                                                      </span>

                                                      <span
                                                        className={
                                                          disponiblePM
                                                            ? "badge bg-success"
                                                            : "badge bg-secondary"
                                                        }
                                                      >
                                                        PM{" "}
                                                        {disponiblePM
                                                          ? "Disponible"
                                                          : "Franco"}
                                                      </span>

                                                    </div>

                                                  )}

                                                </div>

                                              </div>

                                            </div>

                                            <div className="d-flex gap-2 mt-2">

                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="primary"
                                                className="flex-fill"
                                                onClick={() =>
                                                  abrirNuevoEvento(
                                                    empleado,
                                                    dia.dateIso
                                                  )
                                                }
                                              >
                                                + Evento
                                              </Button>

                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline-secondary"
                                                className="flex-fill"
                                                onClick={() =>
                                                  abrirDatosEmpleado(
                                                    empleado
                                                  )
                                                }
                                              >
                                                Editar
                                              </Button>

                                            </div>

                                          </div>
                                        );
                                      }
                                    )}

                                  </div>

                                </div>

                              )}

                            </Card.Body>

                          </Card>
                        );
                      }
                    )}

                  </div>

                ) : (

                  <div className="text-center text-muted py-4">
                    No hay empleados asignados
                    a sucursales.
                  </div>

                )}

              </div>


              {/* LEYENDA DE COLORES */}
              <Row className="mb-3 d-none d-md-flex">
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

              {!loading &&
                dateRange.length > 0 && (
                  <div className="d-none d-md-block">

                    {sucursalesPlanificacion.map(
                      (s) =>
                        renderSucursalSection(s)
                    )}

                  </div>
                )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showDatosEmpleadoModal && (
        <AsignarEmpleadoModal
          show={showDatosEmpleadoModal}
          onClose={
            cerrarDatosEmpleadoModal
          }
          initialData={
            datosEmpleadoModalPayload
          }
          sucursales={
            sucursalesCtx
          }
          jornadas={jornadas}
        />
      )}



      {/* =========================================
    SELECTOR CUANDO HAY VARIOS EVENTOS
    EN EL MISMO DÍA
    ========================================= */}

      <Modal
        show={showSeleccionEvento}
        onHide={() => {
          setShowSeleccionEvento(false);
          setEventosSeleccionDia([]);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Seleccionar evento
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <div className="text-muted mb-3">
            Hay más de un evento en este día.
            Seleccione cuál desea editar.
          </div>

          <ListGroup>

            {eventosSeleccionDia.map((evento) => {

              const concepto =
                conceptosMap.get(
                  getEvConceptoId(evento)
                );

              return (
                <ListGroup.Item
                  key={evento.id}
                  action
                  onClick={() => {

                    setShowSeleccionEvento(false);

                    setEventosSeleccionDia([]);

                    abrirEditarEvento(evento);
                  }}
                >

                  <div className="fw-semibold">
                    {concepto?.nombre ||
                      concepto?.descripcion ||
                      concepto?.codigo ||
                      `Evento #${evento.id}`}
                  </div>

                  <small className="text-muted">
                    {evento.fecha_desde}

                    {evento.fecha_hasta &&
                      evento.fecha_hasta !==
                      evento.fecha_desde && (
                        <>
                          {" → "}
                          {evento.fecha_hasta}
                        </>
                      )}
                  </small>

                  {evento.observaciones && (
                    <div className="small mt-1">
                      {evento.observaciones}
                    </div>
                  )}

                </ListGroup.Item>
              );
            })}

          </ListGroup>

        </Modal.Body>
      </Modal>


      {/* =========================================
    MODAL CREAR / EDITAR EVENTO
    ========================================= */}

      {showEventoModal && (
        <EventoModal
          show={showEventoModal}
          onClose={cerrarEventoModal}
          initialData={eventoModalPayload}
          conceptos={conceptos}
          sucursales={sucursalesCtx}
          empleados={empleadosActivos}
        />
      )}

    </Container>
  );
}
