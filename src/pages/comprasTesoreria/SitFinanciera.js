import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef
} from "react";
import { Card, Row, Col, Form, Button, Table, Spinner, Alert, Badge, Pagination, InputGroup } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import NuevoPagoProgramado from "../../components/tesoreria/NuevoPagoProgramado";
import AcreditarPagoProgramadoModal
  from "./AcreditarPagoProgramadoModal";

import EditarPagoProgramadoModal from "./EditarPagoProgramadoModal";
import NuevoMovimientoCheques from "../tesoreria//NuevoMovimientoCheques";
import AplicarInstanciaGasto
  from "../../components/tesoreria/AplicarInstanciaGasto";
import EditarInstanciaGasto
  from "../../components/tesoreria/EditarInstanciaGasto";
import EditarEcheqModal
  from "./EditarEcheqModal";

const apiUrl = process.env.REACT_APP_API_URL;

// -------- Utils ----------
const toMoney = (n) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseDate = (s) => (s ? new Date(s + "T00:00:00") : null);
const daysDiffFromToday = (dateStr) => {
  const d = parseDate(dateStr);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ms = d.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};
const iso = (d) => d.toISOString().slice(0, 10);

// -------- Presentación ----------
function EstadoBadge({ estado, diasRest }) {
  const map = { pendiente: "secondary", parcial: "warning", vencido: "danger", pagado: "success", anulado: "secondary" };
  const variant = map[estado] || "secondary";
  return (
    <div className="d-flex align-items-center gap-2">
      <Badge bg={variant} className="text-uppercase">{estado || "—"}</Badge>
      {typeof diasRest === "number" && (
        <small className={diasRest < 0 ? "text-danger" : diasRest === 0 ? "text-warning" : "text-muted"}>
          {diasRest < 0 ? `${Math.abs(diasRest)} d. vencidos` : diasRest === 0 ? "vence hoy" : `faltan ${diasRest} d.`}
        </small>
      )}
    </div>
  );
}

// -------- API helpers (reportes / ctacte / echeqs) ----------
async function listarVencimientos(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const r = await fetch(`${apiUrl}/gastos-estimados/reportes/vencen-en?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudieron listar los vencimientos");
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function listarCargosAbiertos(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const r = await fetch(`${apiUrl}/movimientos-cta-cte-proveedor/cargos-abiertos?${qs.toString()}`, {
    credentials: "include",
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json?.error || "No se pudieron obtener cargos abiertos");
  return Array.isArray(json?.rows) ? json.rows : Array.isArray(json) ? json : [];
}

async function listarEcheqsPendientes(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const r = await fetch(`${apiUrl}/echeqs-emitidos?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.error || "No se pudieron obtener eCheqs");
  }
  const data = await r.json();

  console.log("echeq", data)
  const list = Array.isArray(data) ? data : [];
  const PEND = new Set(["emitido", "entregado", "presentado"]);
  return list.filter((e) => PEND.has(String(e.estado || "").toLowerCase()));
}

// -------- Acciones eCheq ----------

async function acreditarEcheqApi(id, body = {}) {
  const r = await fetch(
    `${apiUrl}/echeqs-emitidos/${id}/acreditar`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const json = await r.json().catch(() => ({}));

  if (!r.ok) {
    throw new Error(
      json?.error ||
      "No se pudo acreditar el eCheq"
    );
  }

  return json;
}


async function eliminarEcheqApi(id) {
  const r = await fetch(
    `${apiUrl}/echeqs-emitidos/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const json = await r.json().catch(() => ({}));

  if (!r.ok) {
    throw new Error(
      json?.error ||
      "No se pudo eliminar el eCheq"
    );
  }

  return json;
}

// -------- Pagos programados ----------
async function listarPagosProgramados(params = {}) {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, String(v));
    }
  });

  const r = await fetch(
    `${apiUrl}/pagos-programados?${qs.toString()}`,
    {
      credentials: "include",
    }
  );

  const json = await r.json().catch(() => []);

  if (!r.ok) {
    throw new Error(
      json?.error ||
      "No se pudieron obtener los pagos programados"
    );
  }

  return Array.isArray(json) ? json : [];
}

async function acreditarPagoProgramadoApi(id, body = {}) {
  const r = await fetch(
    `${apiUrl}/pagos-programados/${id}/acreditar`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const json = await r.json().catch(() => ({}));

  if (!r.ok) {
    throw new Error(
      json?.error ||
      "No se pudo acreditar el pago programado"
    );
  }

  return json;
}


async function eliminarPagoProgramadoApi(id) {
  const r = await fetch(
    `${apiUrl}/pagos-programados/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const json = await r.json().catch(() => ({}));

  if (!r.ok) {
    throw new Error(
      json?.error ||
      "No se pudo eliminar el pago programado"
    );
  }

  return json;
}

async function actualizarPagoProgramadoApi(
  id,
  body = {}
) {

  const r = await fetch(
    `${apiUrl}/pagos-programados/${id}`,
    {
      method: "PUT",

      credentials:
        "include",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          body
        ),
    }
  );


  const json =
    await r
      .json()
      .catch(() => ({}));


  if (!r.ok) {
    throw new Error(
      json?.error ||
      "No se pudo actualizar el pago programado"
    );
  }


  return json;
}

// -------- Helper nrocomprobante por id --------
async function fetchComprobanteNro(id) {
  // 1) intento con /detalle
  try {
    const r1 = await fetch(`${apiUrl}/comprobantes-egreso/${id}/detalle`, { credentials: "include" });
    if (r1.ok) {
      const j1 = await r1.json();
      if (j1?.nrocomprobante) return j1.nrocomprobante;
      if (j1?.comprobante?.nrocomprobante) return j1.comprobante.nrocomprobante; // posible payload
    }
  } catch (_) { }

  // 2) fallback a /:id
  try {
    const r2 = await fetch(`${apiUrl}/comprobantes-egreso/${id}`, { credentials: "include" });
    if (r2.ok) {
      const j2 = await r2.json();
      if (j2?.nrocomprobante) return j2.nrocomprobante;
    }
  } catch (_) { }

  return null;
}

// -------- Componente principal unificado ----------
export default function SitFinanciera() {
  const dataContext = useContext(Contexts.DataContext);
  const {
    empresaSeleccionada,
    empresasTabla = [],
    proveedoresTabla = [],
    categoriasEgreso = [],
    sucursalesTabla = [],
    formasPagoTesoreria = [],
    bancosTabla = [],
  } = dataContext || {};

  // -------- Filtros --------
  const [empresaId, setEmpresaId] = useState(empresaSeleccionada?.id || "");
  const [proveedorId, setProveedorId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [
    fpAcordadaFiltro,
    setFpAcordadaFiltro,
  ] = useState("");

  const [
    tipoFiltro,
    setTipoFiltro,
  ] = useState("");
  const [modoRango, setModoRango] = useState("prox"); // prox | rango
  const [dias, setDias] = useState(7);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [q, setQ] = useState("");

  // -------- Data combinada --------
  const [loading, setLoading] = useState(false);
  const [
    programadoAcreditar,
    setProgramadoAcreditar,
  ] = useState(null);
  const [
    programadoEditar,
    setProgramadoEditar
  ] = useState(null);
  const cargaSeq = useRef(0);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]); // normalizados combinados
  const [accionandoId, setAccionandoId] =
    useState(null);
  const [showNuevoPagoProgramado, setShowNuevoPagoProgramado] =
    useState(false);
  const [
    showNuevoMovimientoCheques,
    setShowNuevoMovimientoCheques,
  ] = useState(false);
  const [
    mostrarInstancias,
    setMostrarInstancias,
  ] = useState(true);
  // -------- Paginación --------
  const [
    showAplicarInstancia,
    setShowAplicarInstancia,
  ] = useState(false);

  const [
    instanciaAplicar,
    setInstanciaAplicar,
  ] = useState(null);
  const [
    showEditarInstancia,
    setShowEditarInstancia,
  ] = useState(false);


  const [
    instanciaEditar,
    setInstanciaEditar,
  ] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // -------- Orden --------
  const [sortKey, setSortKey] = useState("fecha_vencimiento"); // por defecto
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  // -------- Cache nrocomprobante por id --------
  const [compNroById, setCompNroById] = useState(() => new Map());
  const setCompNro = useCallback((id, nro) => {
    setCompNroById((prev) => {
      if (prev.get(id) === nro) return prev;
      const m = new Map(prev);
      m.set(id, nro);
      return m;
    });
  }, []);

  const [
    echeqEditar,
    setEcheqEditar,
  ] = useState(null);


  const [
    showEditarEcheq,
    setShowEditarEcheq,
  ] = useState(false);

  // Si cambia empresa en el contexto, reflejar en filtro
  useEffect(() => {
    setEmpresaId(empresaSeleccionada?.id || "");
  }, [empresaSeleccionada?.id]);

  // -------- Mapas auxiliares (nombres) --------
  const empNameById = useMemo(() => {
    const m = new Map();
    (empresasTabla || []).forEach((e) =>
      m.set(Number(e.id), e.nombrecorto || e.descripcion || e.nombre || `Empresa ${e.id}`)
    );
    return m;
  }, [empresasTabla]);

  const bancoById = useMemo(() => {
    const m = new Map();
    (bancosTabla || []).forEach((b) => m.set(Number(b.id), b));
    return m;
  }, [bancosTabla]);

  const provNameById = useMemo(() => {
    const m = new Map();
    (proveedoresTabla || []).forEach((p) => m.set(Number(p.id), p.nombre || `Prov. ${p.id}`));
    return m;
  }, [proveedoresTabla]);

  const catNameById = useMemo(() => {
    const m = new Map();
    (categoriasEgreso || []).forEach((c) => m.set(Number(c.id), c.nombre || `Cat. ${c.id}`));
    return m;
  }, [categoriasEgreso]);

  const sucNameById = useMemo(() => {
    const m = new Map();
    (sucursalesTabla || []).forEach((s) =>
      m.set(Number(s.id), s.nombre || s.descripcion || `Sucursal ${s.id}`)
    );
    return m;
  }, [sucursalesTabla]);

  const fpById = useMemo(() => {
    const m = new Map();
    (formasPagoTesoreria || []).forEach((fp) => m.set(Number(fp.id), fp));
    return m;
  }, [formasPagoTesoreria]);

  const fpDesc = (id) => (id ? (fpById.get(Number(id))?.descripcion || `FP #${id}`) : "");

  // -------- Normalizadores --------
  const normalizeInstancias = (arr = []) =>
    arr.map((it) => ({
      tipo: "instancia",
      id: it.id,

      // Origen de la instancia:
      // "generado" | "importado"
      created_from:
        it.created_from || null,

      // Plantilla GastoEstimado a la que
      // pertenece esta instancia.
      gastoestimado_id:
        it.gastoestimado_id ?? null,

      empresa_id: it.empresa_id ?? null,
      empresa_nombre: empNameById.get(Number(it.empresa_id)) || "",
      proveedor_id: it.proveedor_id ?? null,
      proveedor_nombre: it.proveedor_nombre || provNameById.get(Number(it.proveedor_id)) || "",
      categoria_id: it.categoriaegreso_id ?? null,
      categoria_nombre: it.categoria_nombre || catNameById.get(Number(it.categoriaegreso_id)) || "",
      categoriaegreso_id:
        it.categoriaegreso_id ?? null,
      sucursal_id: it.sucursal_id ?? null,
      sucursal_nombre: sucNameById.get(Number(it.sucursal_id)) || "",
      fecha_vencimiento: it.fecha_vencimiento || "",
      monto_base: Number(it.monto_base ?? it.monto_real ?? it.monto_estimado ?? 0),
      monto_estimado:
        Number(
          it.monto_estimado ??
          it.monto_base ??
          it.monto_real ??
          0
        ),
      estado: it.estado || "pendiente",
      dias_restantes: typeof it.dias_restantes === "number" ? it.dias_restantes : daysDiffFromToday(it.fecha_vencimiento),
      descripcion: it.descripcion || "-",
      monto_pagado:
        Number(it.monto_pagado || 0),

      proyecto_id:
        it.proyecto_id ?? null,

      imputacioncontable_id:
        it.imputacioncontable_id ?? null,
      formapago_id:
        it.formapago_id ?? null,

      formapago_futuro_desc:
        fpById.get(Number(it.formapago_id))?.descripcion || "",

      comprobanteegreso_id: it.comprobanteegreso_id ?? null, // <-- clave
      comprobante_nro: null, // lo resolvemos por id
      key: `inst-${it.id}`,
    }));

  const normalizeCargos = (arr = []) =>
    arr.map((c) => {
      const saldo = Number(c.saldo ?? c.importe ?? 0);
      const fechaVenc = c.fecha_pago || c.fecha || "";
      const diasRest = daysDiffFromToday(fechaVenc);
      const estado = saldo <= 0 ? "pagado" : diasRest < 0 ? "vencido" : "pendiente";
      const proveedor_nombre =
        provNameById.get(Number(c.proveedor_id)) || `Prov. ${c.proveedor_id || "-"}`;
      const categoria_nombre = "";
      const sucursal_nombre = "";
      const descripcion =
        c.descripcion || (c.comprobante_nro ? `Comp. ${c.comprobante_nro}` : `Cargo #${c.id}`);

      return {
        tipo: "ctacte",
        id: c.id,
        empresa_id: c.empresa_id ?? null,
        empresa_nombre: empNameById.get(Number(c.empresa_id)) || "",
        proveedor_id: c.proveedor_id ?? null,
        proveedor_nombre,
        categoria_id: null,
        categoria_nombre,
        sucursal_id: null,
        sucursal_nombre,
        fecha_vencimiento: fechaVenc,
        monto_base: saldo,
        estado,
        dias_restantes: diasRest,
        descripcion,
        formapago_futuro_desc: c.formapago_id ? fpDesc(c.formapago_id) : "",
        comprobanteegreso_id: c.comprobanteegreso_id ?? null, // <-- clave
        comprobante_nro: null, // preferimos resolver por id
        key: `cta-${c.id}`,
      };
    });

  const normalizeEcheqs = (arr = []) =>
    arr.map((e) => {
      const bank = bancoById.get(Number(e.banco_id));
      const empresa_id = e.empresa_id ?? bank?.empresa_id ?? null;
      const empresa_nombre = empNameById.get(Number(empresa_id)) || "";
      const proveedor_nombre =
        provNameById.get(Number(e.proveedor_id)) || (e.proveedor_id ? `Prov. ${e.proveedor_id}` : "");
      const categoria_nombre = catNameById.get(Number(e.categoriaegreso_id)) || "";
      const fecha_venc = e.fecha_vencimiento || "";
      const diasRest = daysDiffFromToday(fecha_venc);

      // si tu backend manda el link al comprobante, lo tomamos
      const compId =
        e.comprobanteegreso_id ??
        e.comprobanteEgresoId ?? // por si viene en camellCase
        e.comprobante_id ??      // por si usaste otro nombre
        null;

      return {
        tipo: "echeq",
        id: e.id,
        empresa_id,
        empresa_nombre,
        proveedor_id: e.proveedor_id ?? null,
        proveedor_nombre,
        categoria_id: e.categoriaegreso_id ?? null,
        categoria_nombre,
        sucursal_id: null,
        sucursal_nombre: "",
        fecha_vencimiento: fecha_venc,
        monto_base: Number(e.importe || 0),
        estado: e.estado || "emitido",
        dias_restantes: diasRest,
        descripcion: `eCheq ${e.numero_echeq || `#${e.id}`}`,
        formapago_futuro_desc: "eCheq",

        // ⬅️ ahora sí propagamos el id del comprobante si viene
        comprobanteegreso_id: compId,

        // Lo resolvemos por ID (fetch on-demand). Si tu backend YA manda el nro, podés setearlo acá:
        comprobante_nro: e.nrocomprobante ?? null,

        key: `echeq-${e.id}`,
      };
    });

  const normalizePagosProgramados = (arr = []) =>
    arr.map((p) => {

      const proveedor_nombre =
        provNameById.get(
          Number(
            p.proveedor_id
          )
        ) ||
        (
          p.proveedor_id
            ? `Prov. ${p.proveedor_id}`
            : ""
        );


      const categoria_nombre =
        catNameById.get(
          Number(
            p.categoriaegreso_id
          )
        ) ||
        "";


      const fechaVenc =
        p.fecha_programada ||
        "";


      const diasRest =
        daysDiffFromToday(
          fechaVenc
        );


      const medioDesc =
        p.medio === "caja"
          ? "EFECTIVO"
          : p.medio === "banco"
            ? "TRANSFERENCIA"
            : p.medio ||
            "";


      /*
       * Si existe una forma de pago concreta,
       * mostramos su descripción.
       *
       * Si no existe, usamos como respaldo
       * la descripción general del medio.
       */
      const formaPagoDesc =
        p.formapago_id
          ? (
            fpDesc(
              p.formapago_id
            ) ||
            medioDesc
          )
          : medioDesc;


      return {

        // ================================================
        // IDENTIFICACIÓN DEL ITEM
        // ================================================

        tipo:
          "programado",

        id:
          p.id,

        key:
          `programado-${p.id}`,


        // ================================================
        // EMPRESA
        // ================================================

        empresa_id:
          p.empresa_id ??
          null,

        empresa_nombre:
          empNameById.get(
            Number(
              p.empresa_id
            )
          ) ||
          "",


        // ================================================
        // PROVEEDOR
        // ================================================

        proveedor_id:
          p.proveedor_id ??
          null,

        proveedor_nombre,


        // ================================================
        // CATEGORÍA / IMPUTACIÓN
        // ================================================

        categoria_id:
          p.categoriaegreso_id ??
          null,

        categoria_nombre,

        imputacioncontable_id:
          p.imputacioncontable_id ??
          null,


        // ================================================
        // SUCURSAL
        // ================================================

        sucursal_id:
          null,

        sucursal_nombre:
          "",


        // ================================================
        // FECHAS
        // ================================================

        fecha_vencimiento:
          fechaVenc,

        fecha_programada:
          p.fecha_programada ||
          "",


        // ================================================
        // MONTO
        // ================================================

        monto_base:
          Number(
            p.monto ||
            0
          ),


        // ================================================
        // ESTADO
        // ================================================

        estado:
          p.estado ||
          "pendiente",

        dias_restantes:
          diasRest,


        // ================================================
        // DESCRIPCIÓN / OBSERVACIONES
        // ================================================

        descripcion:
          p.descripcion ||
          `Pago programado #${p.id}`,

        observaciones:
          p.observaciones ||
          "",


        // ================================================
        // DATOS PROPIOS DEL PAGO PROGRAMADO
        // ================================================

        pago_programado_tipo:
          p.tipo,

        medio:
          p.medio,

        formapago_id:
          p.formapago_id ??
          null,

        formapago_futuro_desc:
          formaPagoDesc,

        banco_id:
          p.banco_id ??
          null,

        caja_id:
          p.caja_id ??
          null,

        proyecto_id:
          p.proyecto_id ??
          null,


        // ================================================
        // COMPROBANTE
        // ================================================

        comprobanteegreso_id:
          p.comprobanteegreso_id ??
          null,

        comprobante_nro:
          null,
      };
    });

  const opcionesFpAcordada = useMemo(() => {
    const opciones = new Set();

    // Formas de pago del maestro
    for (const fp of fpById.values()) {
      if (fp?.descripcion) {
        opciones.add(
          String(fp.descripcion).trim()
        );
      }
    }

    // Medios utilizados por pagos programados
    opciones.add("EFECTIVO");
    opciones.add("TRANSFERENCIA");

    return Array.from(opciones)
      .filter(Boolean)
      .sort((a, b) =>
        a.localeCompare(b)
      );
  }, [fpById]);

  // -------- Carga combinada --------
  const cargar = useCallback(async () => {

    /*
     * Cada carga recibe un número.
     *
     * Si mientras esta consulta está esperando al backend
     * comienza una carga nueva, esta carga anterior ya no
     * podrá modificar items.
     */
    const miCarga =
      ++cargaSeq.current;

    setLoading(true);
    setErr(null);

    try {

      // ==========================================
      // CUENTA CORRIENTE
      // ==========================================

      const pCta = {
        empresa_id:
          empresaId || undefined,

        proveedor_id:
          proveedorId || undefined,
      };


      // ==========================================
      // INSTANCIAS
      // ==========================================

      const pInst = {
        empresa_id:
          empresaId || undefined,

        proveedor_id:
          proveedorId || undefined,

        categoria_id:
          categoriaId || undefined,

        sucursal_id:
          sucursalId || undefined,
      };


      if (modoRango === "prox") {

        pInst.dias =
          Number(dias) || 7;

      } else {

        if (desde) {
          pInst.desde =
            desde;
        }

        if (hasta) {
          pInst.hasta =
            hasta;
        }
      }


      // ==========================================
      // ECHEQS
      // ==========================================

      const pEch = {
        empresa_id:
          empresaId || undefined,

        por:
          "vencimiento",
      };


      if (modoRango === "prox") {

        const today =
          new Date();

        const to =
          new Date(today);

        to.setDate(
          today.getDate() +
          (Number(dias) || 7)
        );


        /*
         * SIN fecha_desde:
         *
         * incluye eCheqs vencidos anteriores
         * que continúan pendientes.
         */

        pEch.fecha_hasta =
          iso(to);

      } else {

        if (desde) {
          pEch.fecha_desde =
            desde;
        }

        if (hasta) {
          pEch.fecha_hasta =
            hasta;
        }
      }


      if (proveedorId) {
        pEch.proveedor_id =
          proveedorId;
      }


      // ==========================================
      // PAGOS PROGRAMADOS
      // ==========================================

      const pProg = {
        empresa_id:
          empresaId || undefined,

        proveedor_id:
          proveedorId || undefined,

        categoriaegreso_id:
          categoriaId || undefined,

        estado:
          "pendiente",
      };

      if (modoRango === "prox") {

        const today =
          new Date();

        const to =
          new Date(today);

        to.setDate(
          today.getDate() +
          (Number(dias) || 7)
        );


        /*
         * SIN desde:
         *
         * incluye pagos programados anteriores
         * que todavía están pendientes.
         */

        pProg.hasta =
          iso(to);

      } else {

        if (desde) {
          pProg.desde =
            desde;
        }

        if (hasta) {
          pProg.hasta =
            hasta;
        }
      }


      // ==========================================
      // CONSULTAS
      // ==========================================

      const [
        rawInst,
        rawCta,
        rawEch,
        rawProg,
      ] = await Promise.all([

        listarVencimientos(
          pInst
        ),

        listarCargosAbiertos(
          pCta
        ),

        listarEcheqsPendientes(
          pEch
        ),

        listarPagosProgramados(
          pProg
        ),

      ]);

      console.log(
        "RAW INSTANCIAS:",
        rawInst
      );

      console.log(
        "CREATED_FROM RECIBIDOS:",
        rawInst.map((it) => ({
          id: it.id,
          descripcion: it.descripcion,
          created_from: it.created_from,
          gastoestimado_id: it.gastoestimado_id,
        }))
      );

      const instancias =
        normalizeInstancias(
          rawInst
        );

      const cargos =
        normalizeCargos(
          rawCta
        );

      const echeqs =
        normalizeEcheqs(
          rawEch
        );

      const programados =
        normalizePagosProgramados(
          rawProg
        );


      let merged = [

        ...(mostrarInstancias
          ? instancias
          : []),

        ...cargos,
        ...echeqs,
        ...programados,

      ];

      // ==========================================
      // FILTRO FP ACORDADA
      // ==========================================

      // ==========================================
      // FILTRO PROVEEDOR
      // ==========================================

      if (proveedorId) {

        merged = merged.filter(
          (it) =>
            Number(it.proveedor_id) ===
            Number(proveedorId)
        );
      }


      // ==========================================
      // FILTRO CATEGORÍA
      // ==========================================

      if (categoriaId) {

        merged = merged.filter(
          (it) =>
            Number(it.categoria_id) ===
            Number(categoriaId)
        );
      }


      // ==========================================
      // FILTRO TIPO
      // ==========================================

      if (tipoFiltro) {

        merged = merged.filter(
          (it) =>
            String(
              it.tipo || ""
            )
              .trim()
              .toLowerCase() ===
            String(
              tipoFiltro
            )
              .trim()
              .toLowerCase()
        );
      }


      // ==========================================
      // FILTRO FP ACORDADA
      // ==========================================

      if (fpAcordadaFiltro) {

        merged = merged.filter(
          (it) =>
            String(
              it.formapago_futuro_desc || ""
            )
              .trim()
              .toLowerCase() ===
            String(
              fpAcordadaFiltro
            )
              .trim()
              .toLowerCase()
        );
      }

      // ==========================================
      // FILTRO TIPO
      // ==========================================

      if (tipoFiltro) {

        merged = merged.filter(
          (it) =>
            String(
              it.tipo || ""
            )
              .trim()
              .toLowerCase() ===
            String(
              tipoFiltro
            )
              .trim()
              .toLowerCase()
        );
      }

      if (fpAcordadaFiltro) {
        merged = merged.filter(
          (it) =>
            String(
              it.formapago_futuro_desc || ""
            )
              .trim()
              .toLowerCase() ===
            String(fpAcordadaFiltro)
              .trim()
              .toLowerCase()
        );
      }

      if (
        q &&
        q.trim() !== ""
      ) {

        const s =
          q
            .trim()
            .toLowerCase();

        merged =
          merged.filter(
            (it) =>
              (it.descripcion || "")
                .toLowerCase()
                .includes(s) ||

              (it.proveedor_nombre || "")
                .toLowerCase()
                .includes(s) ||

              (it.categoria_nombre || "")
                .toLowerCase()
                .includes(s)
          );
      }


      // Orden por vencimiento
      merged.sort(
        (a, b) =>
          String(
            a.fecha_vencimiento
          ).localeCompare(
            String(
              b.fecha_vencimiento
            )
          )
      );


      /*
       * Si mientras esperábamos las respuestas
       * comenzó una carga más nueva, descartamos
       * los resultados de esta carga anterior.
       */
      if (
        miCarga !==
        cargaSeq.current
      ) {
        return;
      }


      setItems(
        merged
      );

      setPage(1);

    } catch (e) {

      /*
       * Sólo la carga más reciente puede
       * modificar el estado de la pantalla.
       */
      if (
        miCarga ===
        cargaSeq.current
      ) {

        setErr(
          e.message ||
          "Error cargando situación financiera"
        );

        setItems([]);
      }

    } finally {

      /*
       * Una carga anterior tampoco debe apagar
       * el spinner de una carga más nueva.
       */
      if (
        miCarga ===
        cargaSeq.current
      ) {
        setLoading(false);
      }

    }

  }, [
    mostrarInstancias,
    empresaId,
    proveedorId,
    categoriaId,
    sucursalId,
    modoRango,
    dias,
    desde,
    hasta,
    q,
    empNameById,
    provNameById,
    catNameById,
    sucNameById,
    fpById,
    bancoById,
    fpAcordadaFiltro,
    tipoFiltro,
  ]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // -------- Fetch on-demand de nrocomprobante para filas con comprobanteegreso_id (batched) --------
  useEffect(() => {
    const faltantes = Array.from(
      new Set(
        items
          .map((r) => r.comprobanteegreso_id)
          .filter((id) => !!id && !compNroById.has(id))
      )
    );
    if (faltantes.length === 0) return;

    const BATCH_SIZE = 10;
    (async () => {
      for (let i = 0; i < faltantes.length; i += BATCH_SIZE) {
        const slice = faltantes.slice(i, i + BATCH_SIZE);
        const resultados = await Promise.all(
          slice.map(async (id) => {
            try {
              const nro = await fetchComprobanteNro(id);
              return { id, nro };
            } catch {
              return { id, nro: null };
            }
          })
        );
        resultados.forEach(({ id, nro }) => {
          if (nro) setCompNro(id, nro);
        });
      }
    })();
  }, [items, compNroById, setCompNro]);

  // -------- Derivados / orden / paginación --------
  const getSortableValue = useCallback((row, key) => {
    switch (key) {
      case "id":
        return Number(row.id) || 0;
      case "tipo":
        return row.tipo || "";
      case "empresa_nombre":
        return row.empresa_nombre || "";
      case "comprobante_nro":
        return (
          row.comprobante_nro ||
          (row.comprobanteegreso_id ? (compNroById.get(row.comprobanteegreso_id) || "") : "")
        );
      case "descripcion":
        return row.descripcion || "";
      case "proveedor_nombre":
        return row.proveedor_nombre || "";
      case "categoria_nombre":
        return row.categoria_nombre || "";
      case "sucursal_nombre":
        return row.sucursal_nombre || "";
      case "fecha_vencimiento":
        return row.fecha_vencimiento || "";
      case "monto_base":
        return Number(row.monto_base) || 0;
      case "estado":
        return row.estado || "";
      case "formapago_futuro_desc":
        return row.formapago_futuro_desc || "";
      default:
        return "";
    }
  }, [compNroById]);

  const sortedItems = useMemo(() => {
    const arr = [...items];
    if (!sortKey) return arr;
    arr.sort((a, b) => {
      const va = getSortableValue(a, sortKey);
      const vb = getSortableValue(b, sortKey);

      if (sortKey === "monto_base" || sortKey === "id") {
        const na = Number(va) || 0;
        const nb = Number(vb) || 0;
        return sortDir === "asc" ? na - nb : nb - na;
      }
      if (sortKey === "fecha_vencimiento") {
        const sa = String(va || "");
        const sb = String(vb || "");
        return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
      }
      const sa = String(va || "");
      const sb = String(vb || "");
      return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return arr;
  }, [items, sortKey, sortDir, getSortableValue]);

  const total = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = sortedItems.slice(start, start + pageSize);

  const totalPendiente = useMemo(
    () => sortedItems.reduce((acc, it) => acc + (Number(it.monto_base) || 0), 0),
    [sortedItems]
  );

  // -------- Helpers UI de orden --------
  const toggleSort = (key) => {
    setPage(1);
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir("asc");
        return key;
      }
      setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      return key;
    });
  };

  const SortableTh = ({ colKey, children, center }) => {
    const active = sortKey === colKey;
    const arrow = !active ? "↕" : sortDir === "asc" ? "▲" : "▼";
    return (
      <th
        role="button"
        onClick={() => toggleSort(colKey)}
        className={`user-select-none ${center ? "text-center" : ""}`}
        title="Ordenar"
      >
        <div className="d-flex align-items-center justify-content-between gap-2">
          <span>{children}</span>
          <small className={`text-muted ${active ? "" : "opacity-75"}`}>{arrow}</small>
        </div>
      </th>
    );
  };

  const handleAcreditarProgramado =
    (row) => {

      setProgramadoAcreditar(row);
    };

  const handleEditarProgramado =
    (row) => {

      setProgramadoEditar(
        row
      );
    };

  const handleEditarEcheq =
    (row) => {

      setEcheqEditar(
        row
      );

      setShowEditarEcheq(
        true
      );
    };

  const confirmarEdicionProgramado =
    async (datos = {}) => {

      const row =
        programadoEditar;


      if (!row) {
        return;
      }


      try {

        setAccionandoId(
          row.key
        );

        setErr(
          null
        );


        const body = {

          fecha_programada:
            datos.fecha_programada,

          medio:
            datos.medio,

          formapago_id:
            datos.formapago_id
              ? Number(
                datos.formapago_id
              )
              : null,

          caja_id:
            datos.medio === "caja"
              ? Number(
                datos.caja_id
              )
              : null,

          banco_id:
            datos.medio === "banco"
              ? Number(
                datos.banco_id
              )
              : null,

          monto:
            Number(
              datos.monto
            ),

          descripcion:
            datos.descripcion,

          observaciones:
            datos.observaciones ||
            null,

          categoriaegreso_id:
            datos.categoriaegreso_id
              ? Number(
                datos.categoriaegreso_id
              )
              : null,

          proyecto_id:
            datos.proyecto_id
              ? Number(
                datos.proyecto_id
              )
              : null,
        };


        await actualizarPagoProgramadoApi(
          row.id,
          body
        );


        setProgramadoEditar(
          null
        );


        await cargar();


      } catch (e) {

        setErr(
          e.message ||
          "No se pudo actualizar el pago programado"
        );

        /*
         * Igual que en Acreditar:
         * permitimos que el modal también
         * reciba el error.
         */
        throw e;


      } finally {

        setAccionandoId(
          null
        );
      }
    };

  const confirmarAcreditacionProgramado =
    async (datos = {}) => {

      const row =
        programadoAcreditar;


      if (!row) {
        return;
      }


      try {

        setAccionandoId(
          row.key
        );

        setErr(
          null
        );


        // ================================================
        // DATOS RECIBIDOS DESDE EL MODAL
        // ================================================

        const {

          fecha_acreditacion,

          medio,

          caja_id,

          banco_id,

          monto,
          formapago_id,

          descripcion,

          observaciones,

          proyecto_id,

          generar_abono_ctacte,

        } = datos;


        // ================================================
        // BODY PARA EL BACKEND
        // ================================================

        const body = {

          fecha_acreditacion:
            fecha_acreditacion ||
            iso(new Date()),

          medio:
            medio ||
            row.medio,

          formapago_id:
            formapago_id
              ? Number(
                formapago_id
              )
              : null,

          monto:
            Number(
              monto ??
              row.monto_base
            ),

          descripcion:
            descripcion ??
            row.descripcion,

          observaciones:
            observaciones ??
            row.observaciones ??
            null,

          proyecto_id:
            proyecto_id ??
            row.proyecto_id ??
            null,

          generar_abono_ctacte:
            Boolean(
              generar_abono_ctacte
            ),
        };


        // ================================================
        // BANCO / CAJA
        // ================================================

        if (
          body.medio === "banco"
        ) {

          body.banco_id =
            banco_id
              ? Number(
                banco_id
              )
              : null;

          body.caja_id =
            null;

        } else if (
          body.medio === "caja"
        ) {

          body.caja_id =
            caja_id
              ? Number(
                caja_id
              )
              : null;

          body.banco_id =
            null;
        }


        // ================================================
        // DEBUG TEMPORAL
        // ================================================

        console.log(
          "======================================"
        );

        console.log(
          "ACREDITAR PAGO PROGRAMADO"
        );

        console.log(
          "Row original:",
          row
        );

        console.log(
          "Datos recibidos modal:",
          datos
        );

        console.log(
          "Body enviado backend:",
          body
        );

        console.log(
          "======================================"
        );


        // ================================================
        // ACREDITAR
        // ================================================

        await acreditarPagoProgramadoApi(
          row.id,
          body
        );


        // ================================================
        // CERRAR MODAL
        // ================================================

        setProgramadoAcreditar(
          null
        );


        // ================================================
        // RECARGAR SITUACIÓN FINANCIERA
        // ================================================

        await cargar();


      } catch (e) {

        console.error(
          "Error acreditando pago programado:",
          e
        );


        setErr(
          e.message ||
          "No se pudo acreditar el pago programado"
        );


        /*
         * IMPORTANTE:
         * relanzamos el error.
         *
         * El modal hace:
         *
         * await onConfirm(payload)
         *
         * por lo tanto necesita recibir el error para
         * mantener abierto el modal y mostrarlo allí.
         */
        throw e;


      } finally {

        setAccionandoId(
          null
        );
      }
    };

  const handleEliminarProgramado =
    async (row) => {

      const esAnticipo =
        row.pago_programado_tipo ===
        "anticipo";


      const mensaje =
        esAnticipo
          ? `¿Eliminar este anticipo programado por $${toMoney(row.monto_base)}?\n\nTambién se anulará el anticipo generado en la cuenta corriente del proveedor.`
          : `¿Eliminar este egreso programado por $${toMoney(row.monto_base)}?`;


      const confirmar =
        window.confirm(
          mensaje
        );


      if (!confirmar) {
        return;
      }


      try {

        setAccionandoId(
          row.key
        );

        setErr(null);


        await eliminarPagoProgramadoApi(
          row.id
        );


        await cargar();

      } catch (e) {

        setErr(
          e.message ||
          "No se pudo eliminar el pago programado"
        );

      } finally {

        setAccionandoId(
          null
        );
      }
    };

  // ======================================================
  // ACCIONES ECHEQ
  // ======================================================

  const handleAcreditarEcheq =
    async (row) => {

      const confirmar =
        window.confirm(
          `¿Acreditar el eCheq "${row.descripcion}" por $${toMoney(row.monto_base)}?`
        );

      if (!confirmar) {
        return;
      }

      try {

        setAccionandoId(
          row.key
        );

        setErr(null);


        const body = {
          fecha_acreditacion:
            iso(new Date()),
        };


        await acreditarEcheqApi(
          row.id,
          body
        );


        /*
         * Volvemos a consultar todo.
         *
         * Al quedar el eCheq como "acreditado",
         * listarEcheqsPendientes() ya no lo incluirá,
         * porque sólo admite:
         *
         * emitido
         * entregado
         * presentado
         */
        await cargar();

      } catch (e) {

        setErr(
          e.message ||
          "No se pudo acreditar el eCheq"
        );

      } finally {

        setAccionandoId(
          null
        );
      }
    };


  const handleEliminarEcheq =
    async (row) => {

      const confirmar =
        window.confirm(
          `¿Eliminar el eCheq "${row.descripcion}" por $${toMoney(row.monto_base)}?\n\nEsta acción utilizará la misma lógica de eliminación que la pantalla de movimientos de eCheq.`
        );

      if (!confirmar) {
        return;
      }


      try {

        setAccionandoId(
          row.key
        );

        setErr(null);


        await eliminarEcheqApi(
          row.id
        );


        /*
         * No modificamos items manualmente.
         * Recargamos desde backend.
         */
        await cargar();

      } catch (e) {

        setErr(
          e.message ||
          "No se pudo eliminar el eCheq"
        );

      } finally {

        setAccionandoId(
          null
        );
      }
    };

  // ======================================================
  // ELIMINAR / DESACTIVAR INSTANCIA DE GASTO
  // ======================================================

  const handleEliminarInstancia =


    async (row) => {

      console.log(
        "ELIMINAR INSTANCIA:",
        row
      );

      console.log(
        "created_from:",
        row?.created_from
      );

      const esImportado =
        String(
          row?.created_from || ""
        )
          .trim()
          .toLowerCase() === "importado";


      // ==================================================
      // 1) INSTANCIA IMPORTADA
      //
      // Se elimina/anula únicamente ESTA instancia.
      // No se toca ningún GastoEstimado ni otras instancias.
      // ==================================================

      if (esImportado) {

        const confirmar =
          window.confirm(
            "Este fue un gasto importado.\n\n" +
            "Su eliminación no afectará a los demás gastos importados de su clase.\n\n" +
            "¿Desea eliminar esta instancia?"
          );


        if (!confirmar) {
          return;
        }


        try {

          setAccionandoId(
            row.key
          );

          setErr(null);


          const r =
            await fetch(
              `${apiUrl}/gasto-estimado/instancias/${row.id}`,
              {
                method: "DELETE",

                credentials:
                  "include",
              }
            );


          const json =
            await r
              .json()
              .catch(() => ({}));


          if (!r.ok) {

            throw new Error(
              json?.error ||
              "No se pudo eliminar la instancia importada"
            );
          }


          /*
           * Recargamos desde backend.
           *
           * La instancia anulada dejará de aparecer,
           * sin afectar otros gastos importados.
           */
          await cargar();


        } catch (e) {

          console.error(
            "handleEliminarInstancia importada:",
            e
          );


          setErr(
            e.message ||
            "No se pudo eliminar la instancia importada"
          );


        } finally {

          setAccionandoId(
            null
          );
        }


        return;
      }


      // ==================================================
      // 2) INSTANCIA GENERADA
      //
      // Conservamos EXACTAMENTE la lógica actual:
      // se desactiva el GastoEstimado padre.
      // ==================================================

      const gastoEstimadoId =
        row?.gastoestimado_id;


      if (!gastoEstimadoId) {

        setErr(
          "No se pudo identificar el gasto estimado asociado a esta instancia."
        );

        return;
      }


      const confirmar =
        window.confirm(
          "Se desactivará el gasto estimado y se eliminarán todas las instancias pendientes sin pagos asociadas a este gasto.\n\n" +
          "Las instancias con pagos realizados conservarán su historial.\n\n" +
          "¿Desea continuar?"
        );


      if (!confirmar) {
        return;
      }


      try {

        setAccionandoId(
          row.key
        );

        setErr(null);


        const r =
          await fetch(
            `${apiUrl}/gasto-estimado/${gastoEstimadoId}`,
            {
              method: "PUT",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  activo: false,
                }),
            }
          );


        const json =
          await r
            .json()
            .catch(() => ({}));


        if (!r.ok) {

          throw new Error(
            json?.error ||
            "No se pudo desactivar el gasto estimado"
          );
        }


        await cargar();


      } catch (e) {

        console.error(
          "handleEliminarInstancia generado:",
          e
        );


        setErr(
          e.message ||
          "No se pudo desactivar el gasto estimado"
        );


      } finally {

        setAccionandoId(
          null
        );
      }
    };

  const compNroView = (row) =>
    row.comprobante_nro ||
    (row.comprobanteegreso_id ? (compNroById.get(row.comprobanteegreso_id) || "-") : "-");

  const BotonNoHabilitado = ({
    children,
  }) => (

    <span
      title="Función no habilitada"
      style={{
        cursor: "not-allowed",
        display: "inline-block",
      }}
    >

      <Button
        size="sm"
        variant="secondary"
        disabled
        style={{
          pointerEvents: "none",
          opacity: 0.55,
        }}
      >
        {children}
      </Button>

    </span>
  );

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header>
          <Row className="g-2 align-items-end">

            {/* ================================================== */}
            {/* EMPRESA                                            */}
            {/* ================================================== */}

            <Col sm={12} md={6} lg>
              <Form.Group>

                <Form.Label>
                  Empresa
                </Form.Label>

                <Form.Select
                  value={empresaId || ""}
                  onChange={(e) =>
                    setEmpresaId(
                      e.target.value
                    )
                  }
                  className="form-control form-control-sm my-input"
                >
                  <option value="">
                    Todas
                  </option>

                  {(empresasTabla || []).map(
                    (emp) => (
                      <option
                        key={emp.id}
                        value={emp.id}
                      >
                        {
                          emp.nombrecorto ||
                          emp.descripcion ||
                          emp.nombre ||
                          `Empresa ${emp.id}`
                        }
                      </option>
                    )
                  )}
                </Form.Select>

              </Form.Group>
            </Col>


            {/* ================================================== */}
            {/* PROVEEDOR                                          */}
            {/* ================================================== */}

            <Col sm={12} md={6} lg>
              <Form.Group>

                <Form.Label>
                  Proveedor
                </Form.Label>

                <Form.Select
                  value={proveedorId || ""}
                  onChange={(e) =>
                    setProveedorId(
                      e.target.value
                    )
                  }
                  className="form-control form-control-sm my-input"
                >
                  <option value="">
                    Todos
                  </option>

                  {(proveedoresTabla || []).map(
                    (p) => (
                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.nombre}
                      </option>
                    )
                  )}
                </Form.Select>

              </Form.Group>
            </Col>


            {/* ================================================== */}
            {/* CATEGORÍA                                          */}
            {/* ================================================== */}

            <Col sm={12} md={6} lg>
              <Form.Group>

                <Form.Label>
                  Categoría
                </Form.Label>

                <Form.Select
                  value={categoriaId || ""}
                  onChange={(e) =>
                    setCategoriaId(
                      e.target.value
                    )
                  }
                  className="form-control form-control-sm my-input"
                >
                  <option value="">
                    Todas
                  </option>

                  {(categoriasEgreso || []).map(
                    (c) => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.nombre}
                      </option>
                    )
                  )}
                </Form.Select>

              </Form.Group>
            </Col>


            {/* ================================================== */}
            {/* TIPO                                               */}
            {/* ================================================== */}

            <Col sm={12} md={6} lg>
              <Form.Group>

                <Form.Label>
                  Tipo
                </Form.Label>

                <Form.Select
                  value={tipoFiltro}
                  onChange={(e) =>
                    setTipoFiltro(
                      e.target.value
                    )
                  }
                  className="form-control form-control-sm my-input"
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="instancia">
                    Gasto estimado
                  </option>

                  <option value="ctacte">
                    Cuenta corriente
                  </option>

                  <option value="echeq">
                    eCheq
                  </option>

                  <option value="programado">
                    Pago programado
                  </option>
                </Form.Select>

              </Form.Group>
            </Col>


            {/* ================================================== */}
            {/* FP ACORDADA                                        */}
            {/* ================================================== */}

            <Col sm={12} md={6} lg>
              <Form.Group>

                <Form.Label>
                  FP Acordada
                </Form.Label>

                <Form.Select
                  value={fpAcordadaFiltro}
                  onChange={(e) =>
                    setFpAcordadaFiltro(
                      e.target.value
                    )
                  }
                  className="form-control form-control-sm my-input"
                >
                  <option value="">
                    Todas
                  </option>

                  {opcionesFpAcordada.map(
                    (fp) => (
                      <option
                        key={fp}
                        value={fp}
                      >
                        {fp}
                      </option>
                    )
                  )}
                </Form.Select>

              </Form.Group>
            </Col>


            {/* ================================================== */}
            {/* TIPO DE RANGO                                      */}
            {/* ================================================== */}

            <Col sm={12}>

              <Form.Check
                inline
                type="radio"
                id="rango-prox"
                name="rangoOpt"
                label="Próximos X días"
                checked={
                  modoRango === "prox"
                }
                onChange={() =>
                  setModoRango("prox")
                }
              />

              <Form.Check
                inline
                type="radio"
                id="rango-fechas"
                name="rangoOpt"
                label="Entre fechas"
                checked={
                  modoRango === "rango"
                }
                onChange={() =>
                  setModoRango("rango")
                }
              />

            </Col>


            {/* ================================================== */}
            {/* RANGO DE FECHAS                                    */}
            {/* ================================================== */}

            {modoRango === "prox" ? (

              <Col sm={6} md={2}>

                <Form.Group>

                  <Form.Label>
                    Días
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min={0}
                    value={dias}
                    onChange={(e) =>
                      setDias(
                        Number(
                          e.target.value || 0
                        )
                      )
                    }
                  />

                </Form.Group>

              </Col>

            ) : (

              <>

                <Col sm={6} md={2}>

                  <Form.Group>

                    <Form.Label>
                      Desde
                    </Form.Label>

                    <Form.Control
                      type="date"
                      value={desde}
                      onChange={(e) =>
                        setDesde(
                          e.target.value
                        )
                      }
                    />

                  </Form.Group>

                </Col>


                <Col sm={6} md={2}>

                  <Form.Group>

                    <Form.Label>
                      Hasta
                    </Form.Label>

                    <Form.Control
                      type="date"
                      value={hasta}
                      onChange={(e) =>
                        setHasta(
                          e.target.value
                        )
                      }
                    />

                  </Form.Group>

                </Col>

              </>

            )}


            {/* ================================================== */}
            {/* BUSCAR                                             */}
            {/* ================================================== */}

            <Col sm={12} md={4}>

              <Form.Label>
                Buscar
              </Form.Label>

              <InputGroup>

                <Form.Control
                  placeholder="Descripción, proveedor, categoría…"
                  value={q}
                  onChange={(e) =>
                    setQ(
                      e.target.value
                    )
                  }
                />

                <Button
                  variant="outline-primary"
                  onClick={cargar}
                  className="mx-2"
                >
                  Buscar
                </Button>

              </InputGroup>

            </Col>


            {/* ================================================== */}
            {/* POR PÁGINA                                         */}
            {/* ================================================== */}

            <Col
              sm={12}
              md="auto"
              className="d-flex align-items-end"
            >

              <Form.Label className="me-2">
                Por página
              </Form.Label>

              <Form.Select
                value={pageSize}
                onChange={(e) => {

                  setPageSize(
                    Number(
                      e.target.value
                    )
                  );

                  setPage(1);
                }}
                style={{
                  width: 90,
                }}
                className="form-control form-control-sm my-input mx-2"
              >
                {[10, 20, 30, 50, 100].map(
                  (n) => (
                    <option
                      key={n}
                      value={n}
                    >
                      {n}
                    </option>
                  )
                )}
              </Form.Select>

            </Col>


            {/* ================================================== */}
            {/* MOSTRAR INSTANCIAS                                 */}
            {/* ================================================== */}

            <Col
              sm={12}
              md="auto"
              className="d-flex align-items-end"
            >

              <Form.Check
                type="checkbox"
                id="mostrar-instancias"
                label="Instancias"
                checked={
                  mostrarInstancias
                }
                onChange={(e) =>
                  setMostrarInstancias(
                    e.target.checked
                  )
                }
              />

            </Col>


            {/* ================================================== */}
            {/* NUEVO PAGO / ECHEQ                                 */}
            {/* ================================================== */}

            <Col
              sm={12}
              md="auto"
              className="text-end"
            >

              <Button
                variant="success"
                onClick={() =>
                  setShowNuevoPagoProgramado(
                    true
                  )
                }
              >
                + Nuevo pago programado
              </Button>

              <Button
                variant="primary"
                className="ms-2"
                onClick={() =>
                  setShowNuevoMovimientoCheques(
                    true
                  )
                }
              >
                + Nuevo eCheq
              </Button>

            </Col>


            {/* ================================================== */}
            {/* ACTUALIZAR                                         */}
            {/* ================================================== */}

            <Col
              sm={12}
              md="auto"
              className="text-end"
            >

              <Button
                variant="outline-secondary"
                onClick={cargar}
                disabled={loading}
              >
                {
                  loading
                    ? (
                      <Spinner
                        size="sm"
                        animation="border"
                      />
                    )
                    : "Actualizar"
                }
              </Button>

            </Col>

          </Row>
        </Card.Header>

        <Card.Body>
          {err && <Alert variant="danger" className="mb-3">{err}</Alert>}

          <div className="table-responsive">
            <Table hover bordered size="sm" className="align-middle">
              <thead>
                <tr>
                  <SortableTh colKey="id">#</SortableTh>
                  <SortableTh colKey="tipo">Tipo</SortableTh>
                  <SortableTh colKey="empresa_nombre">Empresa</SortableTh>
                  <SortableTh colKey="comprobante_nro">Comprobante</SortableTh>
                  <SortableTh colKey="descripcion">Descripción</SortableTh>
                  <SortableTh colKey="proveedor_nombre">Proveedor</SortableTh>
                  <SortableTh colKey="categoria_nombre">Categoría</SortableTh>
                  <SortableTh colKey="sucursal_nombre">Sucursal</SortableTh>
                  <SortableTh colKey="fecha_vencimiento">Vencimiento</SortableTh>
                  <SortableTh colKey="monto_base" center>Monto</SortableTh>
                  <SortableTh colKey="estado">Estado</SortableTh>
                  <SortableTh colKey="formapago_futuro_desc">FP Acordada</SortableTh>
                  <th className="text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={13} className="text-center text-muted">
                      <Spinner size="sm" animation="border" className="me-2" />
                      Cargando…
                    </td>
                  </tr>
                )}
                {!loading && pageItems.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-center text-muted">Sin resultados</td>
                  </tr>
                )}
                {!loading &&
                  pageItems.map((row) => (
                    <tr key={row.key}>
                      <td>{row.id}</td>
                      <td>
                        {row.tipo === "ctacte"
                          ? "Cta Cte"
                          : row.tipo === "echeq"
                            ? "eCheq"
                            : row.tipo === "programado"
                              ? (
                                row.pago_programado_tipo === "anticipo"
                                  ? "Anticipo programado"
                                  : "Egreso programado"
                              )
                              : "Instancia"}
                      </td>
                      <td>{row.empresa_nombre || "-"}</td>
                      <td>{compNroView(row)}</td>
                      <td>{row.descripcion || "-"}</td>
                      <td>{row.proveedor_nombre || "-"}</td>
                      <td>{row.categoria_nombre || "-"}</td>
                      <td>{row.sucursal_nombre || "-"}</td>
                      <td>{row.fecha_vencimiento || "-"}</td>
                      <td className="text-end">${toMoney(row.monto_base)}</td>
                      <td><EstadoBadge estado={row.estado} diasRest={row.dias_restantes} /></td>
                      <td>{row.formapago_futuro_desc || "-"}</td>
                      <td className="text-center">

                        {/* ================================= */}
                        {/* PAGOS PROGRAMADOS                 */}
                        {/* ================================= */}

                        {row.tipo === "programado" && (

                          <div className="d-flex justify-content-center gap-1">

                            <Button
                              size="sm"
                              variant="success"
                              disabled={
                                accionandoId === row.key
                              }
                              onClick={() =>
                                handleAcreditarProgramado(
                                  row
                                )
                              }
                            >
                              {accionandoId === row.key
                                ? (
                                  <Spinner
                                    size="sm"
                                    animation="border"
                                  />
                                )
                                : "Acreditar"}
                            </Button>


                            <Button
                              size="sm"
                              variant="outline-primary"
                              disabled={
                                accionandoId === row.key
                              }
                              onClick={() =>
                                handleEditarProgramado(
                                  row
                                )
                              }
                            >
                              Editar
                            </Button>


                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={
                                accionandoId === row.key
                              }
                              onClick={() =>
                                handleEliminarProgramado(
                                  row
                                )
                              }
                            >
                              Eliminar
                            </Button>

                          </div>

                        )}


                        {/* ================================= */}
                        {/* ECHEQS                            */}
                        {/* ================================= */}

                        {row.tipo === "echeq" && (

                          <div className="d-flex justify-content-center gap-1">

                            <Button
                              size="sm"
                              variant="success"
                              disabled={
                                accionandoId === row.key
                              }
                              onClick={() =>
                                handleAcreditarEcheq(
                                  row
                                )
                              }
                            >
                              {accionandoId === row.key
                                ? (
                                  <Spinner
                                    size="sm"
                                    animation="border"
                                  />
                                )
                                : "Acreditar"}
                            </Button>
                            {/* 

                            <BotonNoHabilitado>
                              Editar
                            </BotonNoHabilitado> */}

                            <Button
                              size="sm"
                              variant="outline-primary"
                              disabled={
                                accionandoId === row.key
                              }
                              onClick={() =>
                                handleEditarEcheq(
                                  row
                                )
                              }
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={
                                accionandoId === row.key
                              }
                              onClick={() =>
                                handleEliminarEcheq(
                                  row
                                )
                              }
                            >
                              Eliminar
                            </Button>


                          </div>

                        )}


                        {/* ================================= */}
                        {/* INSTANCIAS / ESTIMACIONES         */}
                        {/* ================================= */}

                        {row.tipo === "instancia" && (

                          <div className="d-flex justify-content-center gap-1">

                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => {

                                setInstanciaAplicar(
                                  row
                                );

                                setShowAplicarInstancia(
                                  true
                                );
                              }}
                            >
                              Acreditar
                            </Button>


                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => {

                                setInstanciaEditar(
                                  row
                                );

                                setShowEditarInstancia(
                                  true
                                );
                              }}
                            >
                              Editar
                            </Button>


                            <Button
                              size="sm"
                              variant="outline-danger"
                              disabled={
                                accionandoId === row.key
                              }
                              onClick={() =>
                                handleEliminarInstancia(
                                  row
                                )
                              }
                            >
                              {accionandoId === row.key
                                ? (
                                  <Spinner
                                    size="sm"
                                    animation="border"
                                  />
                                )
                                : "Eliminar"}
                            </Button>

                          </div>

                        )}


                        {/* ================================= */}
                        {/* CUENTA CORRIENTE / OTROS          */}
                        {/* ================================= */}

                        {row.tipo !== "programado" &&
                          row.tipo !== "echeq" &&
                          row.tipo !== "instancia" && (

                            <div className="d-flex justify-content-center gap-1">

                              <BotonNoHabilitado>
                                Acreditar
                              </BotonNoHabilitado>

                              <BotonNoHabilitado>
                                Editar
                              </BotonNoHabilitado>

                              <BotonNoHabilitado>
                                Eliminar
                              </BotonNoHabilitado>

                            </div>

                          )}

                      </td>
                    </tr>
                  ))}
              </tbody>
              {items.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={9}><strong>Total (filtrado)</strong></td>
                    <td className="text-end"><strong>${toMoney(totalPendiente)}</strong></td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </Table>
          </div>

          {/* Paginación */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="text-muted" style={{ fontSize: 13 }}>
              {items.length > 0
                ? (
                  <>
                    Mostrando <strong>{start + 1}</strong>–<strong>{Math.min(start + pageSize, items.length)}</strong> de <strong>{items.length}</strong>
                  </>
                )
                : "Sin resultados"}
            </div>

            <Pagination className="mb-0">
              <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
              <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
              <Pagination.Item active>{page}</Pagination.Item>
              <Pagination.Next
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
              <Pagination.Last disabled={page === totalPages} onClick={() => setPage(totalPages)} />
            </Pagination>
          </div>
        </Card.Body>
      </Card>


      <NuevoPagoProgramado
        show={
          showNuevoPagoProgramado
        }

        onHide={() =>
          setShowNuevoPagoProgramado(false)
        }

        onCreated={async () => {

          /*
           * Cerramos el modal.
           */
          setShowNuevoPagoProgramado(false);


          /*
           * Volvemos a consultar SitFinanciera.
           *
           * El nuevo pago aparecerá automáticamente
           * dentro de los pagos programados pendientes.
           */
          await cargar();

        }}
      />

      <NuevoMovimientoCheques
        show={
          showNuevoMovimientoCheques
        }

        onHide={() =>
          setShowNuevoMovimientoCheques(false)
        }

        onCreated={async () => {

          setShowNuevoMovimientoCheques(
            false
          );

          /*
           * Recargar Situación Financiera para que
           * el nuevo eCheq aparezca inmediatamente
           * en la lista de obligaciones.
           */
          await cargar();

        }}
      />
      <AplicarInstanciaGasto

        show={
          showAplicarInstancia
        }

        instancia={
          instanciaAplicar
        }

        onHide={() => {

          setShowAplicarInstancia(
            false
          );

          setInstanciaAplicar(
            null
          );

        }}

        onApplied={async () => {

          setShowAplicarInstancia(
            false
          );

          setInstanciaAplicar(
            null
          );

          await cargar();

        }}

      />

      <EditarInstanciaGasto

        show={
          showEditarInstancia
        }

        instancia={
          instanciaEditar
        }

        proveedores={
          proveedoresTabla
        }

        categorias={
          categoriasEgreso
        }

        onHide={() => {

          setShowEditarInstancia(
            false
          );

          setInstanciaEditar(
            null
          );

        }}

        onUpdated={async () => {

          setShowEditarInstancia(
            false
          );

          setInstanciaEditar(
            null
          );

          await cargar();

        }}

      />

      <EditarPagoProgramadoModal
        show={
          Boolean(
            programadoEditar
          )
        }
        row={
          programadoEditar
        }
        onHide={() =>
          setProgramadoEditar(
            null
          )
        }
        onConfirm={
          confirmarEdicionProgramado
        }
      />

      <AcreditarPagoProgramadoModal
        show={
          Boolean(
            programadoAcreditar
          )
        }
        row={
          programadoAcreditar
        }
        onHide={() =>
          setProgramadoAcreditar(null)
        }
        onConfirm={
          confirmarAcreditacionProgramado
        }


      />

      <EditarEcheqModal
        show={
          showEditarEcheq
        }
        row={
          echeqEditar
        }
        onHide={() => {

          setShowEditarEcheq(
            false
          );

          setEcheqEditar(
            null
          );
        }}
        onUpdated={async () => {

          setShowEditarEcheq(
            false
          );

          setEcheqEditar(
            null
          );

          await cargar();
        }}
      />
    </>
  );


}