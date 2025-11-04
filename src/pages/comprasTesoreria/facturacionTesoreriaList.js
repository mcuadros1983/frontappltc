import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Table, Container, Button, Modal, Form, Row, Col, InputGroup } from "react-bootstrap";
import Contexts from "../../context/Contexts";
import FormasPagoEditor from "./FormasPagoEditor";
import HaciendaPickerModal from "./HaciendaPickerModal";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ComprobantesEgresoList() {
  // === Helpers ===
  const isBlank = (v) =>
    v === undefined ||
    v === null ||
    (typeof v === "string" && v.trim() === "") ||
    (typeof v === "number" && Number.isNaN(v));

  function validarObligatorios(obj, excepciones = []) {
    const faltan = [];
    for (const [k, v] of Object.entries(obj || {})) {
      if (excepciones.includes(k)) continue;
      const esBoolean = typeof v === "boolean";
      if (!esBoolean && isBlank(v)) faltan.push(k);
    }
    return faltan;
  }

  function validarPagos(pagosNormalizados) {
    const errores = [];
    pagosNormalizados.forEach((p, idx) => {
      const missing = [];
      const usaExistente = !!p.existing_ref;

      if (!p.formapago_id) missing.push("formapago_id");

      if (!usaExistente) {
        if (!(Number(p.monto) > 0)) missing.push("monto (> 0)");
        if (!p.fecha) missing.push("fecha");
        if (p.medio === "transferencia" && !p.banco_id) missing.push("banco_id (transferencia)");
        if (p.medio === "caja" && !p.caja_id) missing.push("caja_id (pago en caja)");
        if (p.medio === "echeq") {
          if (!p.banco_id) missing.push("banco_id (eCheq)");
          if (!p.fecha_vencimiento) missing.push("fecha_vencimiento (eCheq)");
        }
        if (p.medio === "tarjeta") {
          if (!p.tipotarjeta_id) missing.push("tipotarjeta_id (tarjeta)");
          if (!p.marcatarjeta_id) missing.push("marcatarjeta_id (tarjeta)");
          if (!String(p.cupon_numero || "").trim()) missing.push("cupon_numero (tarjeta)");
        }
        if (p.medio === "ctacte") {
          if (!p.fecha_pago) missing.push("fecha_pago (ctacte)");

          // en normalización ya mapeamos la forma futura a formapago_id,
          // así que acá solo chequeamos formapago_id
        }
      }

      if (missing.length) {
        errores.push(`Pago ${idx + 1}: falta ${missing.join(", ")}`);
      }
    });
    return errores;
  }


  const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
  const toNum = (v) => Number(v || 0);

  const dataContext = useContext(Contexts.DataContext);
  const {
    cajaAbierta,
    categoriasEgreso,
    proveedoresTabla = [],
    formasPagoTesoreria = [],
    librosIvaTabla = [],
    ptosVentaTabla = [],
    tiposComprobanteTabla = [],
    imputacionContableTabla = [],
    empresaSeleccionada,
    empresasTabla = [],
  } = dataContext;



  // === Estado principal ===
  const [pagos, setPagos] = useState([]);
  const [comprobantes, setComprobantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagosComprobante, setPagosComprobante] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // [REF: HAC_MODAL_STATE]
  const [showHaciendaPickerCreate, setShowHaciendaPickerCreate] = useState(false);
  const [showHaciendaPickerEdit, setShowHaciendaPickerEdit] = useState(false);
  const [hasHaciendaDisponiblesCreate, setHasHaciendaDisponiblesCreate] = useState(false);
  const [hasHaciendaDisponiblesEdit, setHasHaciendaDisponiblesEdit] = useState(false);

  // === Filtros (UI restaurada/extendida) ===
  const [filtros, setFiltros] = useState({
    texto: "",
    proveedor_id: "",
    estado: "",
    formapago_id: "", // usar 'varios' para filtrar los mixtos (sin formapago_id)
    fecha_desde: "",
    fecha_hasta: "",
  });

  const onFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };
  const limpiarFiltros = () =>
    setFiltros({ texto: "", proveedor_id: "", estado: "", formapago_id: "", fecha_desde: "", fecha_hasta: "" });

  const empresasById = useMemo(() => {
    const map = {};
    for (const e of empresasTabla)
      map[e.id] = e.nombre || e.razon_social || e.descripcion || `Empresa ${e.id}`;
    return map;
  }, [empresasTabla]);

  // ↓↓↓ Agregar justo debajo de empresasById
  const tiposComprobanteById = useMemo(() => {
    const map = {};
    for (const t of tiposComprobanteTabla) {
      map[t.id] = t.descripcion || `Tipo ${t.id}`;
    }
    return map;
  }, [tiposComprobanteTabla]);

  const hoy = new Date().toISOString().split("T")[0];

  const makeInitialNuevo = () => ({
    nrocomprobante: "",
    iva105: 0,
    iva21: 0,
    neto: 0,
    total: 0,
    tipocomprobante_id: "",
    ptoventa_id: "",
    libroiva_id: "",
    proveedor_id: "",
    fechacomprobante: hoy,
    fechavencimiento: hoy,
    imputacioncontable_id: "",
    observaciones: "",
    // ctacteproveedor_id: "",
    formapago_id: "",
    estadopago: "impaga",
    conFactura: true,
    fechapago: hoy,
    montoreal: 0,
    diferenciaefectivo: 0,
    hacienda_id: "",
    letra: "",
    retencion: 0,
    empresa_id: "",
    categoriaegreso_id: "",
  });

  const resetCreateForm = () => {
    setPagos([]);
    setNuevoComprobante(makeInitialNuevo());
  };

  const [nuevoComprobante, setNuevoComprobante] = useState(makeInitialNuevo());

  const librosIVAFiltrados = librosIvaTabla.filter((l) => l.empresa_id === empresaSeleccionada?.id);
  const ptosVtaFiltrados = ptosVentaTabla.filter((l) => l.empresa_id === empresaSeleccionada?.id);

  const loadComprobantes = useCallback(async () => {
    try {
      let url = `${apiUrl}/comprobantes-egreso`;
      if (empresaSeleccionada?.id) url += `?empresa_id=${empresaSeleccionada.id}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setComprobantes(data.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error("❌ Error al cargar comprobantes:", error);
    }
  }, [empresaSeleccionada?.id]);

  useEffect(() => {
    loadComprobantes();
  }, [loadComprobantes]);

  // const checkHaciendaDisponibles = useCallback(async ({ empresaId, proveedorId }) => {
  //   try {
  //     if (!empresaId || !proveedorId) return false;
  //     const params = new URLSearchParams();
  //     params.set("empresa_id", empresaId);
  //     params.set("proveedor_id", proveedorId);
  //     params.set("limit", "1");
  //     const res = await fetch(`${apiUrl}/hacienda/disponibles?${params.toString()}`, { credentials: "include" });
  //     const data = await res.json().catch(() => []);
  //     if (!res.ok) return false;
  //     return Array.isArray(data) && data.length > 0;
  //   } catch {
  //     return false;
  //   }
  // }, []);

  const checkHaciendaDisponibles = useCallback(async ({ empresaId, proveedorId, comprobanteId }) => {
    try {
      if (!empresaId || !proveedorId) return false;
      const params = new URLSearchParams();
      params.set("empresa_id", empresaId);
      params.set("proveedor_id", proveedorId);
      if (comprobanteId) params.set("comprobante_id", comprobanteId);
      params.set("limit", "1");
      const res = await fetch(`${apiUrl}/hacienda/disponibles?${params.toString()}`, { credentials: "include" });
      const data = await res.json().catch(() => []);
      if (!res.ok) return false;
      return Array.isArray(data) && data.length > 0;
    } catch {
      return false;
    }
  }, []);

  // [REF: HAC_CREATE_AVAIL] check al abrir el modal de CREACIÓN
  useEffect(() => {
    (async () => {
      if (!showCreateModal) return;
      const prov = nuevoComprobante?.proveedor_id;
      if (empresaSeleccionada?.id && prov) {
        const ok = await checkHaciendaDisponibles({
          empresaId: empresaSeleccionada.id,
          proveedorId: prov,
        });
        setHasHaciendaDisponiblesCreate(ok);
      } else {
        setHasHaciendaDisponiblesCreate(false);
      }
    })();
  }, [showCreateModal, empresaSeleccionada?.id, nuevoComprobante?.proveedor_id, checkHaciendaDisponibles]);




  // === Comprobantes filtrados (cliente) ===
  const comprobantesFiltrados = useMemo(() => {
    let arr = [...comprobantes];

    // proveedor
    if (filtros.proveedor_id) {
      arr = arr.filter((c) => String(c.proveedor_id) === String(filtros.proveedor_id));
    }

    // estado
    if (filtros.estado) {
      arr = arr.filter((c) => (c.estadopago || "").toLowerCase() === filtros.estado.toLowerCase());
    }

    // forma de pago (incluye "varios")
    if (filtros.formapago_id) {
      if (filtros.formapago_id === "varios") {
        arr = arr.filter((c) => !c.formapago_id);
      } else {
        arr = arr.filter(
          (c) => c.formapago_id && String(c.formapago_id) === String(filtros.formapago_id)
        );
      }
    }

    // fecha (usamos fechacomprobante)
    if (filtros.fecha_desde) {
      arr = arr.filter((c) => (c.fechacomprobante || "") >= filtros.fecha_desde);
    }
    if (filtros.fecha_hasta) {
      arr = arr.filter((c) => (c.fechacomprobante || "") <= filtros.fecha_hasta);
    }

    // texto libre: nrocomprobante, letra, observaciones
    if (filtros.texto.trim() !== "") {
      const q = filtros.texto.trim().toLowerCase();
      arr = arr.filter((c) => {
        const s1 = (c.nrocomprobante || "").toLowerCase();
        const s2 = (c.letra || "").toLowerCase();
        const s3 = (c.observaciones || "").toLowerCase();
        return s1.includes(q) || s2.includes(q) || s3.includes(q);
      });
    }

    return arr;
  }, [comprobantes, filtros]);

  // Totales útiles
  const totalFiltrado = useMemo(
    () => comprobantesFiltrados.reduce((acc, c) => acc + (Number(c.total) || 0), 0),
    [comprobantesFiltrados]
  );

  // === LCD Flags ===
  const esLCDCreate = useMemo(() => {
    const t = tiposComprobanteTabla.find(
      (tc) => String(tc.id) === String(nuevoComprobante.tipocomprobante_id)
    );
    return (t?.descripcion || "").toUpperCase() === "LCD";
  }, [tiposComprobanteTabla, nuevoComprobante.tipocomprobante_id]);

  const esLCDEdit = useMemo(() => {
    if (!selectedComprobante) return false;
    const t = tiposComprobanteTabla.find(
      (tc) => String(tc.id) === String(selectedComprobante.tipocomprobante_id)
    );
    return (t?.descripcion || "").toUpperCase() === "LCD";
  }, [tiposComprobanteTabla, selectedComprobante?.tipocomprobante_id]);

  // === Auto TOTAL (creación): total = neto + iva105 + iva21 - retención
  useEffect(() => {
    setNuevoComprobante((prev) => {
      if (!prev) return prev;
      const newTotal = round2(
        toNum(prev.neto) + toNum(prev.iva105) + toNum(prev.iva21) - toNum(prev.retencion)
      );
      return prev.total === newTotal ? prev : { ...prev, total: newTotal };
    });
  }, [nuevoComprobante.neto, nuevoComprobante.iva105, nuevoComprobante.iva21, nuevoComprobante.retencion]);

  // === Auto TOTAL (edición)
  useEffect(() => {
    if (!selectedComprobante) return;
    setSelectedComprobante((prev) => {
      if (!prev) return prev;
      const newTotal = round2(
        toNum(prev.neto) + toNum(prev.iva105) + toNum(prev.iva21) - toNum(prev.retencion)
      );
      return prev.total === newTotal ? prev : { ...prev, total: newTotal };
    });
  }, [
    selectedComprobante?.neto,
    selectedComprobante?.iva105,
    selectedComprobante?.iva21,
    selectedComprobante?.retencion,
  ]);

  // === Diferencia Efectivo: si no es LCD → 0 y readonly; si es LCD → auto (montoreal - total)
  useEffect(() => {
    setNuevoComprobante((prev) => {
      if (!prev) return prev;
      if (!esLCDCreate) {
        if (toNum(prev.montoreal) !== 0 || toNum(prev.diferenciaefectivo) !== 0) {
          return { ...prev, montoreal: 0, diferenciaefectivo: 0 };
        }
        return prev;
      }
      const diff = round2(toNum(prev.montoreal) - toNum(prev.total));
      return prev.diferenciaefectivo === diff ? prev : { ...prev, diferenciaefectivo: diff };
    });
  }, [esLCDCreate, nuevoComprobante.montoreal, nuevoComprobante.total]);

  useEffect(() => {
    if (!selectedComprobante) return;
    setSelectedComprobante((prev) => {
      if (!prev) return prev;
      if (!esLCDEdit) {
        if (toNum(prev.montoreal) !== 0 || toNum(prev.diferenciaefectivo) !== 0) {
          return { ...prev, montoreal: 0, diferenciaefectivo: 0 };
        }
        return prev;
      }
      const diff = round2(toNum(prev.montoreal) - toNum(prev.total));
      return prev.diferenciaefectivo === diff ? prev : { ...prev, diferenciaefectivo: diff };
    });
  }, [esLCDEdit, selectedComprobante?.montoreal, selectedComprobante?.total]);

  // === IVA quick calc (creación)
  const calcIVA105Create = () => {
    const base = toNum(nuevoComprobante.neto);
    setNuevoComprobante((p) => ({ ...p, iva105: round2(base * 0.105) }));
  };
  const calcIVA21Create = () => {
    const base = toNum(nuevoComprobante.neto);
    setNuevoComprobante((p) => ({ ...p, iva21: round2(base * 0.21) }));
  };

  // === IVA quick calc (edición)
  const calcIVA105Edit = () => {
    if (!selectedComprobante) return;
    const base = toNum(selectedComprobante.neto);
    setSelectedComprobante((p) => ({ ...p, iva105: round2(base * 0.105) }));
  };
  const calcIVA21Edit = () => {
    if (!selectedComprobante) return;
    const base = toNum(selectedComprobante.neto);
    setSelectedComprobante((p) => ({ ...p, iva21: round2(base * 0.21) }));
  };

  // === Edición
  const handleDoubleClick = async (comprobante) => {
    if (!empresaSeleccionada) {
      alert("Debe seleccionar una empresa para editar comprobantes.");
      return;
    }
    setSelectedComprobante(comprobante);
    setShowModal(true);
    setPagosComprobante([]);
    setLoadingPagos(true);
    try {
      const res = await fetch(`${apiUrl}/comprobantes-egreso/${comprobante.id}/detalle`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo obtener el detalle");
      console.log("datapagos", data)

      // actualizar el comprobante por si trae campos más frescos (ej: ordenpago_id)
      setSelectedComprobante(data.comprobante || comprobante);
      setPagosComprobante(Array.isArray(data.pagos) ? data.pagos : []);
    } catch (err) {
      console.error("❌ Error al cargar detalle:", err);
    } finally {
      setLoadingPagos(false);
    }
  };

  // [REF: HAC_EDIT_AVAIL] check si hay haciendas disponibles en EDICIÓN
  useEffect(() => {
    (async () => {
      if (!showModal || !selectedComprobante?.proveedor_id || !empresaSeleccionada?.id) {
        setHasHaciendaDisponiblesEdit(false);
        return;
      }
      const ok = await checkHaciendaDisponibles({
        empresaId: empresaSeleccionada.id,
        proveedorId: selectedComprobante.proveedor_id,
        comprobanteId: selectedComprobante.id, // << clave
      });
      setHasHaciendaDisponiblesEdit(ok);
    })();
  }, [showModal, selectedComprobante?.proveedor_id, selectedComprobante?.hacienda_id, empresaSeleccionada?.id, checkHaciendaDisponibles]);


  const handleCloseModal = () => {
    setSelectedComprobante(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedComprobante((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name.endsWith("_id") ||
            ["neto", "iva105", "iva21", "total", "montoreal", "diferenciaefectivo", "retencion"].includes(name)
            ? value === ""
              ? ""
              : value
            : value,
    }));
  };

  const handleGuardarCambios = async () => {
    try {
      const faltanEdit = validarObligatorios(selectedComprobante, ["observaciones", "hacienda_id"]);
      if (faltanEdit.length) {
        alert("Faltan completar campos obligatorios: " + faltanEdit.join(", "));
        return;
      }
      const body = {
        ...selectedComprobante,
        hacienda_id: selectedComprobante?.hacienda_id
          ? Number(selectedComprobante.hacienda_id)
          : null,
      };
      await fetch(`${apiUrl}/comprobantes-egreso/${selectedComprobante.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      await loadComprobantes();
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error al actualizar comprobante:", error);
    }
  };

  const handleEliminar = async (comp) => {
    const estado = String(comp.estadopago || "").toLowerCase();
    if (estado !== "impaga") {
      alert("Sólo se pueden eliminar comprobantes en estado IMPAGA.");
      return;
    }
    if (!window.confirm(`¿Eliminar el comprobante #${comp.id}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeletingId(comp.id);
      const res = await fetch(`${apiUrl}/comprobantes-egreso/${comp.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudo eliminar el comprobante");

      await loadComprobantes();
    } catch (err) {
      console.error("❌ Error al eliminar comprobante:", err);
      alert(err.message || "No se pudo eliminar el comprobante");
    } finally {
      setDeletingId(null);
    }
  };


  // === Creación
  const handleNuevoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoComprobante((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name.endsWith("_id") ||
            ["neto", "iva105", "iva21", "total", "montoreal", "diferenciaefectivo", "retencion"].includes(name)
            ? value === ""
              ? ""
              : value
            : value,
    }));
  };

  const getImputacionFromCategoria = (categoriaId) => {
    const cat = categoriasEgreso?.find((c) => Number(c.id) === Number(categoriaId));
    return cat?.imputacioncontable_id ?? null;
  };

  const handleCrearComprobante = async () => {
    try {
      // si hay transferencia nueva debe traer banco_id
      const transferenciaInvalida = pagos.some((p) => {
        const fp = formasPagoTesoreria.find((f) => Number(f.id) === Number(p.formapago_id));
        const esTransf = /transfer/i.test(fp?.descripcion || "");
        return esTransf && !p?.existing_ref && (!p?.banco_id || String(p.banco_id).trim() === "");
      });
      if (transferenciaInvalida) {
        alert("Falta Banco/Cuenta en una transferencia.");
        return;
      }

      if (!empresaSeleccionada) {
        alert("Debes seleccionar una empresa.");
        return;
      }

      // Guard temprano para cta cte incompleta (fecha_pago o forma futura)
      const hayCtacteIncompleta = pagos.some((p) => {
        const fp = formasPagoTesoreria.find((f) => Number(f.id) === Number(p.formapago_id));
        const esCC = /cta.?cte|cuenta corriente/i.test((fp?.descripcion || "").toLowerCase());
        return esCC && !p?.existing_ref && (!p?.fecha_pago || !p?.formapago_futuro_id);
      });
      if (hayCtacteIncompleta) {
        alert("Hay pagos en Cuenta Corriente sin 'Fecha de pago' o 'Forma de pago acordada'.");
        return;
      }

      // Base de comparación para pagos: Monto real si es LCD, Total si no
      const totalReferencia = esLCDCreate
        ? Number(nuevoComprobante.montoreal || 0)
        : Number(nuevoComprobante.total || 0);

      const sumaPagosLocal = pagos.reduce((acc, it) => acc + (Number(it.monto) || 0), 0);
      if (Math.abs(totalReferencia - sumaPagosLocal) > 0.009) {
        alert(
          `La suma de las formas de pago debe coincidir con ${esLCDCreate ? "el Monto real" : "el Total"
          } del comprobante.`
        );
        return;
      }

      const byId = (fpId) => formasPagoTesoreria.find((f) => Number(f.id) === Number(fpId));
      const has = (fpId, regex) => {
        const fp = byId(fpId);
        return fp ? regex.test(fp.descripcion || "") : false;
      };
      const esPagoEnCajaDesdeId = (fpId) => has(fpId, /caja|efectivo/i);
      const medioFromFp = (fpId) => {
        if (has(fpId, /caja|efectivo/i)) return "caja";
        if (has(fpId, /transfer/i)) return "transferencia";
        if (has(fpId, /e-?cheq|echeq/i)) return "echeq";
        if (has(fpId, /tarjeta/i)) return "tarjeta";
        if (has(fpId, /cta.?cte|cuenta corriente/i)) return "ctacte";
        return "desconocido";
      };

      const header_formapago_id =
        pagos.length === 1 ? (pagos[0]?.formapago_id ? Number(pagos[0].formapago_id) : null) : null;



      let header_imputacion_id = null;
      for (const p of pagos) {
        const imp = p.imputacioncontable_id
          ? Number(p.imputacioncontable_id)
          : p.categoriaegreso_id
            ? Number(getImputacionFromCategoria(p.categoriaegreso_id))
            : null;
        if (imp) {
          header_imputacion_id = imp;
          break;
        }
      }
      if (!header_imputacion_id && nuevoComprobante.categoriaegreso_id) {
        const impHeader = getImputacionFromCategoria(nuevoComprobante.categoriaegreso_id);
        if (impHeader) header_imputacion_id = Number(impHeader);
      }

      if (pagos.length === 1 && !header_formapago_id) {
        alert("Falta seleccionar la forma de pago.");
        return;
      }
      if (!header_imputacion_id) {
        alert("Falta imputación contable (se toma de la categoría del pago o del encabezado).");
        return;
      }
      const faltaImputacionEnTodo =
        !header_imputacion_id &&
        !pagos.some(
          (p) =>
            p.imputacioncontable_id ||
            (p.categoriaegreso_id && getImputacionFromCategoria(p.categoriaegreso_id))
        );
      if (faltaImputacionEnTodo) {
        alert(
          "Debes seleccionar una categoría (en el encabezado o en alguna forma de pago) para derivar la imputación contable."
        );
        return;
      }

      // Armamos el encabezado SIN formapago_id de entrada
      const comprobanteBase = {
        nrocomprobante: nuevoComprobante.nrocomprobante,
        iva105: Number(nuevoComprobante.iva105 || 0),
        iva21: Number(nuevoComprobante.iva21 || 0),
        neto: Number(nuevoComprobante.neto || 0),
        total: Number(nuevoComprobante.total || 0),
        tipocomprobante_id: nuevoComprobante.tipocomprobante_id
          ? Number(nuevoComprobante.tipocomprobante_id)
          : null,
        ptoventa_id: nuevoComprobante.ptoventa_id ? Number(nuevoComprobante.ptoventa_id) : null,
        libroiva_id: nuevoComprobante.libroiva_id ? Number(nuevoComprobante.libroiva_id) : null,
        proveedor_id: nuevoComprobante.proveedor_id ? Number(nuevoComprobante.proveedor_id) : null,
        fechacomprobante: nuevoComprobante.fechacomprobante,
        fechavencimiento: nuevoComprobante.fechavencimiento || null,
        imputacioncontable_id: header_imputacion_id,
        observaciones: nuevoComprobante.observaciones || null,
        // ctacteproveedor_id: nuevoComprobante.ctacteproveedor_id
        //   ? Number(nuevoComprobante.ctacteproveedor_id)
        //   : null,
        conFactura: !!nuevoComprobante.conFactura,
        fechapago: nuevoComprobante.fechapago,
        montoreal: Number(nuevoComprobante.montoreal || 0),
        diferenciaefectivo: Number(nuevoComprobante.diferenciaefectivo || 0),
        hacienda_id: nuevoComprobante.hacienda_id
          ? Number(nuevoComprobante.hacienda_id)
          : null,
        letra: nuevoComprobante.letra || "",
        retencion: Number(nuevoComprobante.retencion || 0),
        empresa_id: empresaSeleccionada.id,
      };

      // ⚠️ Sólo si hay UNA forma de pago seteamos formapago_id en el encabezado
      if (header_formapago_id != null) {
        comprobanteBase.formapago_id = header_formapago_id;
      }


      const numOrNull = (v) => (v === "" || v === undefined || v === null ? null : Number(v));

      // normalización (incluye existing_ref y gastoestimado en cada fila)
      const pagosNormalizados = pagos.map((p) => {
        const medio = medioFromFp(p.formapago_id);
        const usaExistente = !!p?.existing_ref;

        const imputacionPago =
          p.imputacioncontable_id
            ? Number(p.imputacioncontable_id)
            : p.categoriaegreso_id
              ? Number(getImputacionFromCategoria(p.categoriaegreso_id))
              : nuevoComprobante.categoriaegreso_id
                ? Number(getImputacionFromCategoria(nuevoComprobante.categoriaegreso_id))
                : null;

        const numOrNull = (v) => (v === "" || v === undefined || v === null ? null : Number(v));

        const base = {
          medio,
          // OJO: default usa formapago_id de la fila…
          formapago_id: p.formapago_id ? Number(p.formapago_id) : null,
          monto: Number(p.monto || 0),
          fecha: p.fecha || nuevoComprobante.fechapago || nuevoComprobante.fechacomprobante,
          detalle: p.detalle || null,
          categoriaegreso_id: p.categoriaegreso_id
            ? Number(p.categoriaegreso_id)
            : nuevoComprobante.categoriaegreso_id
              ? Number(nuevoComprobante.categoriaegreso_id)
              : null,
          imputacioncontable_id: imputacionPago,
          existing_ref: usaExistente ? { ...p.existing_ref } : null,
          caja_id:
            !usaExistente && esPagoEnCajaDesdeId(p.formapago_id)
              ? (p.caja_id ? Number(p.caja_id) : (cajaAbierta?.caja?.id ?? null))
              : null,
          gastoestimado:
            !usaExistente && p?.gastoestimado?.aplicar && p?.gastoestimado?.instancia_id
              ? {
                instancia_id: Number(p.gastoestimado.instancia_id),
                cancelar_renovacion: Boolean(p.gastoestimado.cancelar_renovacion),
              }
              : null,
        };

        if (!usaExistente) {
          if (medio === "tarjeta") {
            base.tipotarjeta_id = numOrNull(p.tipotarjeta_id);
            base.marcatarjeta_id = numOrNull(p.marcatarjeta_id);
            base.cupon_numero = (p.cupon_numero ?? "").toString().trim() || null;
            base.planpago_id = numOrNull(p.planpago_id);
          }

          if (medio === "echeq") {
            base.banco_id = numOrNull(p.banco_id);
            base.numero_echeq = (p.numero_echeq ?? "").toString().trim() || null;
            base.fecha_vencimiento = p.fecha_vencimiento || null;
          }

          if (medio === "transferencia") {
            base.banco_id = numOrNull(p.banco_id);
            base.referencia = (p.referencia ?? "").toString().trim() || null;
            base.cbu_alias_destino = (p.cbu_alias_destino ?? "").toString().trim() || null;
            base.titular_destino = (p.titular_destino ?? "").toString().trim() || null;
          }

          if (medio === "ctacte") {
            // ⬇️ EL PUNTO CRÍTICO: usar la forma futura como formapago_id
            base.formapago_id = p.formapago_futuro_id ? Number(p.formapago_futuro_id) : null;
            base.fecha_pago = p.fecha_pago || null;
          }
        }

        return base;
      });

      const payload = {
        empresa_id: empresaSeleccionada.id,
        comprobante: comprobanteBase,
        pagos: pagosNormalizados,
      };

      console.log("emitir comprobante payload:", JSON.parse(JSON.stringify(payload)));

      const EXC_OPTIONALES = ["observaciones", "hacienda_id"];
      const faltanHeader = validarObligatorios(payload.comprobante, EXC_OPTIONALES);
      if (faltanHeader.length) {
        alert("Faltan completar campos obligatorios: " + faltanHeader.join(", "));
        return;
      }

      if (!pagosNormalizados.length) {
        alert("Debes cargar al menos una forma de pago.");
        return;
      }

      const erroresPagos = validarPagos(pagosNormalizados);
      if (erroresPagos.length) {
        alert("Revisá las formas de pago:\n" + erroresPagos.join("\n"));
        return;
      }

      const res = await fetch(`${apiUrl}/comprobantes-egreso/emitir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "No se pudo emitir el comprobante");
      }

      await loadComprobantes();
      setShowCreateModal(false);
      resetCreateForm();
    } catch (error) {
      console.error("❌ Error al emitir comprobante:", error);
      alert(error.message);
    }
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    resetCreateForm();
  };

  // ====== Totales y pagos (creación)
  const totalParaPagos = useMemo(
    () => (esLCDCreate ? Number(nuevoComprobante.montoreal || 0) : Number(nuevoComprobante.total || 0)),
    [esLCDCreate, nuevoComprobante.montoreal, nuevoComprobante.total]
  );

  const sumaPagos = pagos.reduce((acc, it) => acc + (Number(it.monto) || 0), 0);
  const montosOk = Math.abs(totalParaPagos - sumaPagos) < 0.009;

  const imputHeaderDesc = useMemo(() => {
    const it = imputacionContableTabla.find(
      (x) => Number(x.id) === Number(nuevoComprobante.imputacioncontable_id)
    );
    return (
      it?.descripcion ||
      (nuevoComprobante.imputacioncontable_id
        ? `ID ${nuevoComprobante.imputacioncontable_id}`
        : "")
    );
  }, [imputacionContableTabla, nuevoComprobante.imputacioncontable_id]);

  const getFormaPagoDesc = (fpId) => {
    if (!fpId) return null;
    const fp = formasPagoTesoreria.find(f => Number(f.id) === Number(fpId));
    return fp?.descripcion || `FP #${fpId}`;
  };


  return (
    <Container>
      <h1 className="my-list-title dark-text">Comprobantes de Egreso</h1>

      {/* === Barra de filtros === */}
      <div className="p-3 mb-3 border rounded bg-light">
        <Row className="g-2">
          <Col md={3}>
            <Form.Label>Proveedor</Form.Label>
            <Form.Select
              name="proveedor_id"
              value={filtros.proveedor_id}
              onChange={onFiltroChange}
              className="form-control my-input"
            >
              <option value="">Todos</option>
              {proveedoresTabla.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Label>Estado</Form.Label>
            <Form.Select name="estado" value={filtros.estado} onChange={onFiltroChange} className="form-control my-input">
              <option value="">Todos</option>
              <option value="pagada">Pagada</option>
              <option value="impaga">Impaga</option>
              <option value="parcial">Parcial</option>
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Forma de pago</Form.Label>
            <Form.Select
              name="formapago_id"
              value={filtros.formapago_id}
              onChange={onFiltroChange}
              className="form-control my-input"
            >
              <option value="">Todas</option>
              <option value="varios">VARIOS (mixto)</option>
              {formasPagoTesoreria.map((fp) => (
                <option key={fp.id} value={fp.id}>
                  {fp.descripcion}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Label>Desde</Form.Label>
            <Form.Control
              type="date"
              name="fecha_desde"
              value={filtros.fecha_desde}
              onChange={onFiltroChange}
            />
          </Col>

          <Col md={2}>
            <Form.Label>Hasta</Form.Label>
            <Form.Control
              type="date"
              name="fecha_hasta"
              value={filtros.fecha_hasta}
              onChange={onFiltroChange}
            />
          </Col>

          <Col md={12}>
            <Form.Label>Búsqueda</Form.Label>
            <InputGroup>
              <Form.Control
                placeholder="N° comprobante, letra u observaciones…"
                name="texto"
                value={filtros.texto}
                onChange={onFiltroChange}
              />
              <Button variant="outline-secondary" onClick={limpiarFiltros} className="mx-2">
                Limpiar
              </Button>
            </InputGroup>
          </Col>
        </Row>
      </div>

      <div className="mb-2 d-flex justify-content-between align-items-center">
        <div className="text-muted">
          {comprobantesFiltrados.length} resultado(s) · Total filtrado:{" "}
          <strong>${totalFiltrado.toFixed(2)}</strong>
        </div>

        <div>
          <Button
            className="mx-2"
            variant="success"
            disabled={!empresaSeleccionada}
            onClick={() => {
              if (!empresaSeleccionada) {
                alert("Debe seleccionar una empresa para emitir comprobantes.");
                return;
              }
              resetCreateForm();   // <-- agrega esto
              setShowCreateModal(true);
            }}
          >
            Ingresar Comprobante
          </Button>
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Comprobante</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Proveedor</th>
            <th>Empresa</th>
            <th>Hacienda</th>
            <th>Forma de Pago</th>
            <th>Estado Pago</th>
            <th>Acciones</th>

          </tr>
        </thead>
        <tbody>
          {comprobantesFiltrados.map((comp) => (
            <tr
              key={comp.id}
              onDoubleClick={() => handleDoubleClick(comp)}
              style={{ cursor: "pointer" }}
            >
              <td>{comp.id}</td>
              <td>{comp.nrocomprobante}</td>
              <td>{tiposComprobanteById[comp.tipocomprobante_id] || comp.tipocomprobante_id}</td>
              <td>{comp.fechacomprobante || ""}</td>
              <td>${Number(comp.total).toFixed(2)}</td>
              <td>
                {proveedoresTabla.find((p) => p.id === comp.proveedor_id)?.nombre ||
                  comp.proveedor_id}
              </td>
              <td>
                {empresaSeleccionada?.id
                  ? empresaSeleccionada.descripcion ||
                  empresaSeleccionada.razon_social ||
                  `Empresa ${empresaSeleccionada.id}`
                  : empresasById[comp.empresa_id] || comp.empresa_id}
              </td>
              <td>{comp.hacienda_id || "-"}</td>
              <td>
                {comp.formapago_id
                  ? formasPagoTesoreria.find(
                    (fp) => Number(fp.id) === Number(comp.formapago_id)
                  )?.descripcion || comp.formapago_id
                  : "VARIOS"}
              </td>
              <td>{comp.estadopago}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={String(comp.estadopago || "").toLowerCase() !== "impaga" || deletingId === comp.id}
                  onClick={() => handleEliminar(comp)}
                  title={String(comp.estadopago || "").toLowerCase() !== "impaga" ? "Sólo IMPAGA" : "Eliminar"}
                >
                  {deletingId === comp.id ? "Eliminando…" : "Eliminar"}
                </Button>
              </td>

            </tr>
          ))}
        </tbody>
      </Table>

      {/* ===== Modal de edición ===== */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Comprobante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComprobante && (
            <Form>
              <div className="row">
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Letra</Form.Label>
                  <Form.Control
                    name="letra"
                    value={selectedComprobante.letra || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>N° Comprobante</Form.Label>
                  <Form.Control
                    name="nrocomprobante"
                    value={selectedComprobante.nrocomprobante || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Proveedor</Form.Label>
                  <Form.Select
                    name="proveedor_id"
                    value={selectedComprobante.proveedor_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {proveedoresTabla.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Categoría de Egreso (encabezado)</Form.Label>
                  <Form.Select
                    name="categoriaegreso_id"
                    value={selectedComprobante.categoriaegreso_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {categoriasEgreso.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </Form.Select>
                  <small className="text-muted">
                    Si no elegís categoría en un pago, se usará esta para derivar la imputación
                    contable.
                  </small>
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Imputación Contable (encabezado)</Form.Label>
                  <Form.Select
                    name="imputacioncontable_id"
                    value={selectedComprobante.imputacioncontable_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {imputacionContableTabla.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Empresa</Form.Label>
                  <Form.Control
                    value={
                      empresaSeleccionada?.nombre ||
                      empresasById[selectedComprobante?.empresa_id] ||
                      selectedComprobante?.empresa_id ||
                      ""
                    }
                    readOnly
                    plaintext
                  />
                </Form.Group>
              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="mb-0">Neto</Form.Label>
                  </div>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="neto"
                    value={selectedComprobante.neto || 0}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="mb-0">IVA 10.5%</Form.Label>
                    <Button size="sm" variant="outline-secondary" onClick={calcIVA105Edit}>
                      calc
                    </Button>
                  </div>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="iva105"
                    value={selectedComprobante.iva105 || 0}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="mb-0">IVA 21%</Form.Label>
                    <Button size="sm" variant="outline-secondary" onClick={calcIVA21Edit}>
                      calc
                    </Button>
                  </div>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="iva21"
                    value={selectedComprobante.iva21 || 0}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-3">
                  <Form.Label>Retención</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="retencion"
                    value={selectedComprobante?.retencion ?? 0}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-3">
                  <Form.Label>Total (auto)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="total"
                    value={selectedComprobante.total || 0}
                    readOnly
                  />
                </Form.Group>
              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Tipo Comprobante</Form.Label>
                  <Form.Select
                    name="tipocomprobante_id"
                    value={selectedComprobante.tipocomprobante_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {tiposComprobanteTabla.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Punto de Venta</Form.Label>
                  <Form.Select
                    name="ptoventa_id"
                    value={selectedComprobante.ptoventa_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {ptosVtaFiltrados.map((pv) => (
                      <option key={pv.id} value={pv.id}>
                        {pv.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Libro IVA</Form.Label>
                  <Form.Select
                    name="libroiva_id"
                    value={selectedComprobante.libroiva_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {librosIVAFiltrados.map((l) => (
                      <option key={l.id} value={l.id}>
                        {`${l.mes} / ${l.anio}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Fecha Comprobante</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechacomprobante"
                    value={selectedComprobante.fechacomprobante || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Fecha Vencimiento</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechavencimiento"
                    value={selectedComprobante.fechavencimiento || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Fecha Pago</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechapago"
                    value={selectedComprobante.fechapago || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Estado Pago</Form.Label>
                  <Form.Select
                    name="estadopago"
                    value={selectedComprobante.estadopago || "impaga"}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="pagada">Pagada</option>
                    <option value="impaga">Impaga</option>
                    <option value="parcial">Parcial</option>
                  </Form.Select>
                </Form.Group>

                {/* Monto Real (solo editable en LCD) */}
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Monto Real {esLCDEdit ? "" : "(solo LCD)"}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="montoreal"
                    value={esLCDEdit ? (selectedComprobante.montoreal || 0) : 0}
                    onChange={esLCDEdit ? handleChange : undefined}
                    readOnly={!esLCDEdit}
                  />
                </Form.Group>

                {/* Diferencia Efectivo (auto) */}
                <Form.Group className="mb-3 col-md-4">
                  <Form.Label>Diferencia Efectivo (auto)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="diferenciaefectivo"
                    value={esLCDEdit ? (selectedComprobante.diferenciaefectivo || 0) : 0}
                    readOnly
                  />
                  <small className="text-muted">
                    {esLCDEdit ? "Se calcula: Monto real − Total." : "Disponible solo para LCD."}
                  </small>
                </Form.Group>
              </div>

              <div className="row">
                {/* <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Cuenta Cte. Proveedor (opcional)</Form.Label>
                  <Form.Control
                    name="ctacteproveedor_id"
                    value={selectedComprobante.ctacteproveedor_id || ""}
                    onChange={handleChange}
                  />
                </Form.Group> */}



                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Hacienda (opcional)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      name="hacienda_id"
                      value={selectedComprobante?.hacienda_id || ""}
                      onChange={handleChange}
                      placeholder="ID de Hacienda"
                    />
                    <Button
                      variant="outline-primary"
                      disabled={
                        !empresaSeleccionada?.id ||
                        !selectedComprobante?.proveedor_id
                      }
                      title={
                        !empresaSeleccionada?.id
                          ? "Seleccioná empresa"
                          : !selectedComprobante?.proveedor_id
                            ? "Seleccioná proveedor"
                            : hasHaciendaDisponiblesEdit
                              ? "Buscar Hacienda disponibles"
                              : "Sin Hacienda disponibles"
                      }
                      onClick={() => setShowHaciendaPickerEdit(true)}
                      className="mx-2"
                    >
                      Buscar
                    </Button>

                    {/* NUEVO: botón para quitar la Hacienda */}
                    <Button
                      variant="outline-danger"
                      disabled={!selectedComprobante?.hacienda_id}
                      title="Quitar Hacienda seleccionada"
                      onClick={() =>
                        setSelectedComprobante((prev) => ({ ...prev, hacienda_id: null }))
                      }
                      className="mx-2"
                    >
                      Quitar
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Doble click en una fila del modal para seleccionar. “Quitar” deja el campo vacío.
                  </Form.Text>
                </Form.Group>

              </div>

              <div className="row">
                <Form.Group className="mb-3 col-md-6 d-flex align-items-end">
                  <Form.Check
                    label="Con Factura"
                    name="conFactura"
                    checked={!!selectedComprobante.conFactura}
                    onChange={(e) =>
                      setSelectedComprobante((prev) => ({
                        ...prev,
                        conFactura: e.target.checked,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Imputación Contable</Form.Label>
                  <Form.Select
                    name="imputacioncontable_id"
                    value={selectedComprobante.imputacioncontable_id || ""}
                    onChange={handleChange}
                    className="form-control my-input"
                  >
                    <option value="">Seleccione...</option>
                    {imputacionContableTabla.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  name="observaciones"
                  rows={2}
                  value={selectedComprobante.observaciones || ""}
                  onChange={handleChange}
                />
              </Form.Group>

              <hr />
              <h5 className="mb-3">
                Formas de pago aplicadas{" "}
                {selectedComprobante?.ordenpago_id ? (
                  <small className="text-muted"> (Orden #{selectedComprobante.ordenpago_id})</small>
                ) : null}
              </h5>

              {loadingPagos ? (
                <div className="text-muted">Cargando pagos…</div>
              ) : pagosComprobante.length === 0 ? (
                <div className="text-muted">Este comprobante no tiene pagos asociados.</div>
              ) : (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Medio</th>
                      <th>Detalle</th>
                      <th>Importe</th>
                      {/* <th>FP Acordada</th> 👈 nueva columna */}
                      {/*  <th>Info</th>*/}
                    </tr>
                  </thead>
                  <tbody>
                    {pagosComprobante.map((p) => (
                      <tr key={`${p.tabla}-${p.id}`}>
                        <td>{p.fecha || "-"}</td>
                        <td>{p.medio}</td>
                        <td>{p.detalle || "-"}</td>
                        <td>${Number(p.monto || 0).toFixed(2)}</td>
                        {/* <td>
                          {p.formapago_id
                            ? getFormaPagoDesc(p.formapago_id)
                            : p.ordenpago_id
                              ? "Segun Orden de Pago"
                              : "-"}
                        </td>*/}
                        {/*   <td>
                          {p.medio === "caja" && (p.caja_id ? `Caja #${p.caja_id}` : "-")}
                          {p.medio === "transferencia" && (p.banco_id ? `Banco #${p.banco_id}` : "-")}
                          {p.medio === "echeq" &&
                            `Banco #${p.banco_id || "-"} · N° ${p.numero_echeq || "-"} · Vto ${p.fecha_vencimiento || "-"}`}
                          {p.medio === "tarjeta" &&
                            `Tipo ${p.tipotarjeta_id || "-"} · Marca ${p.marcatarjeta_id || "-"} · Cupón ${p.cupon_numero || "-"}`}
                          {p.medio === "ctacte" && (p.fecha_pago ? `Fecha pago ${p.fecha_pago}` : "A cuenta corriente")}
                        </td>*/}
                      </tr>
                    ))}
                  </tbody>
                </Table>

              )}
            </Form>


          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleGuardarCambios}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Modal de creación ===== */}
      <Modal
        show={showCreateModal}
        onHide={handleCloseCreate}
        backdrop="static"
        centered
        size="lg"
        unmountOnClose
      >
        <Modal.Header closeButton>
          <Modal.Title>Ingresar Comprobante de Egreso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Tipo Comprobante</Form.Label>
                <Form.Select
                  name="tipocomprobante_id"
                  value={nuevoComprobante.tipocomprobante_id}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {tiposComprobanteTabla.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.descripcion}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Punto de Venta</Form.Label>
                <Form.Select
                  name="ptoventa_id"
                  value={nuevoComprobante.ptoventa_id}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {ptosVtaFiltrados.map((pv) => (
                    <option key={pv.id} value={pv.id}>
                      {pv.descripcion}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Libro IVA</Form.Label>
                <Form.Select
                  name="libroiva_id"
                  value={nuevoComprobante.libroiva_id || ""}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {librosIVAFiltrados.map((l) => (
                    <option key={l.id} value={l.id}>
                      {`${l.mes} / ${l.anio}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Fecha Comprobante</Form.Label>
                <Form.Control
                  type="date"
                  name="fechacomprobante"
                  value={nuevoComprobante.fechacomprobante}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Fecha Vencimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="fechavencimiento"
                  value={nuevoComprobante.fechavencimiento}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Fecha Pago</Form.Label>
                <Form.Control
                  type="date"
                  name="fechapago"
                  value={nuevoComprobante.fechapago}
                  onChange={handleNuevoChange}
                />
              </Form.Group>
            </div>
            <div className="row">
              {/* Letra */}
              <Form.Group className="mb-3 col-md-3">
                <Form.Label>Letra</Form.Label>
                <Form.Control
                  name="letra"
                  value={nuevoComprobante.letra || ""}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              {/* N° Comprobante */}
              <Form.Group className="mb-3 col-md-3">
                <Form.Label>N° Comprobante</Form.Label>
                <Form.Control
                  name="nrocomprobante"
                  value={nuevoComprobante.nrocomprobante}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              {/* Proveedor */}
              <Form.Group className="mb-3 col-md-3">
                <Form.Label>Proveedor</Form.Label>
                <Form.Select
                  name="proveedor_id"
                  value={nuevoComprobante.proveedor_id}
                  onChange={async (e) => {
                    handleNuevoChange(e);
                    const prov = e.target.value;
                    if (empresaSeleccionada?.id && prov) {
                      const ok = await checkHaciendaDisponibles({
                        empresaId: empresaSeleccionada.id,
                        proveedorId: prov,
                      });
                      setHasHaciendaDisponiblesCreate(ok);
                    } else {
                      setHasHaciendaDisponiblesCreate(false);
                    }
                  }}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {proveedoresTabla.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Hacienda (ID + Buscar + Quitar todo junto) */}
              <Form.Group className="mb-3 col-md-3">
                <Form.Label>Hacienda (opcional)</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={nuevoComprobante?.hacienda_id || ""}
                    placeholder="Sin seleccionar"
                    readOnly
                  />
                  <Button
                    variant="outline-primary"
                    disabled={
                      !empresaSeleccionada?.id ||
                      !nuevoComprobante?.proveedor_id ||
                      !hasHaciendaDisponiblesCreate
                    }
                    title={
                      !empresaSeleccionada?.id
                        ? "Seleccioná empresa"
                        : !nuevoComprobante?.proveedor_id
                          ? "Seleccioná proveedor"
                          : hasHaciendaDisponiblesCreate
                            ? "Buscar Hacienda disponibles"
                            : "Sin Hacienda disponibles"
                    }
                    onClick={() => setShowHaciendaPickerCreate(true)}
                    className="mx-1"
                  >
                    Buscar
                  </Button>
                  <Button
                    variant="outline-danger"
                    disabled={!nuevoComprobante?.hacienda_id}
                    title="Quitar Hacienda seleccionada"
                    onClick={() =>
                      setNuevoComprobante((prev) => ({ ...prev, hacienda_id: null }))
                    }
                  >
                    Quitar
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  Doble click en una fila del modal para seleccionar.
                </Form.Text>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Categoría de Egreso (encabezado)</Form.Label>
                <Form.Select
                  name="categoriaegreso_id"
                  value={nuevoComprobante.categoriaegreso_id || ""}
                  onChange={(e) => {
                    handleNuevoChange(e);
                    const imp = getImputacionFromCategoria(e.target.value);
                    setNuevoComprobante((prev) => ({
                      ...prev,
                      imputacioncontable_id: imp || "",
                    }));
                  }}
                  className="form-control my-input"
                >
                  <option value="">Seleccione...</option>
                  {categoriasEgreso.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </Form.Select>
                <small className="text-muted">
                  Esta categoría se usará por defecto en las formas de pago.
                </small>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Imputación Contable (encabezado)</Form.Label>
                <Form.Control
                  value={
                    imputacionContableTabla.find(
                      (x) => Number(x.id) === Number(nuevoComprobante.imputacioncontable_id)
                    )?.descripcion || ""
                  }
                  placeholder="Se completa según la categoría"
                  disabled
                />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0">Neto</Form.Label>
                </div>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="neto"
                  value={nuevoComprobante.neto}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0">IVA 10.5%</Form.Label>
                  <Button size="sm" variant="outline-secondary" onClick={calcIVA105Create}>
                    calc
                  </Button>
                </div>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="iva105"
                  value={nuevoComprobante.iva105}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0">IVA 21%</Form.Label>
                  <Button size="sm" variant="outline-secondary" onClick={calcIVA21Create}>
                    calc
                  </Button>
                </div>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="iva21"
                  value={nuevoComprobante.iva21}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-3">
                <Form.Label>Retención</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="retencion"
                  value={nuevoComprobante.retencion || 0}
                  onChange={handleNuevoChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-3">
                <Form.Label>Total (auto)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="total"
                  value={nuevoComprobante.total}
                  readOnly
                />
              </Form.Group>
            </div>

            {/* Editor de formas de pago (con existing_ref y gasto mensual) */}
            <FormasPagoEditor
              total={totalParaPagos}           // **base de pagos**: Monto real si LCD, Total si no
              value={pagos}
              onChange={setPagos}
              headerCategoriaId={nuevoComprobante.categoriaegreso_id || null}
              headerImputacionId={nuevoComprobante.imputacioncontable_id || null}
              showCategoriaPorFila={false}
              empresaId={empresaSeleccionada?.id || null}
              proveedorId={nuevoComprobante.proveedor_id || null}
              fechaComprobante={nuevoComprobante.fechacomprobante}   // ⬅️ IMPORTANTE
            />

            <div className="row mt-2">
              {/* Estado Pago */}
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Estado Pago</Form.Label>
                <Form.Select
                  name="estadopago"
                  value={nuevoComprobante.estadopago}
                  onChange={handleNuevoChange}
                  className="form-control my-input"
                >
                  <option value="pagada">Pagada</option>
                  <option value="impaga">Impaga</option>
                  <option value="parcial">Parcial</option>
                </Form.Select>
              </Form.Group>

              {/* Monto Real (solo editable en LCD) */}
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Monto Real {esLCDCreate ? "" : "(solo LCD)"}</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="montoreal"
                  value={esLCDCreate ? (nuevoComprobante.montoreal || 0) : 0}
                  onChange={esLCDCreate ? handleNuevoChange : undefined}
                  readOnly={!esLCDCreate}
                />
              </Form.Group>

              {/* Diferencia Efectivo (auto) */}
              <Form.Group className="mb-3 col-md-4">
                <Form.Label>Diferencia Efectivo (auto)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="diferenciaefectivo"
                  value={esLCDCreate ? (nuevoComprobante.diferenciaefectivo || 0) : 0}
                  readOnly
                />
                <small className="text-muted">
                  {esLCDCreate ? "Se calcula: Monto real − Total." : "Disponible solo para LCD."}
                </small>
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                name="observaciones"
                rows={2}
                value={nuevoComprobante.observaciones}
                onChange={handleNuevoChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <div className="me-auto text-muted">
            Suma pagos: <strong>${sumaPagos.toFixed(2)}</strong>{" "}
            {montosOk ? "✓" : esLCDCreate ? "↔️ debe coincidir con Monto real" : "↔️ debe coincidir con Total"}
          </div>
          <Button variant="secondary" onClick={handleCloseCreate}>
            Cancelar
          </Button>

          <Button
            variant="success"
            onClick={handleCrearComprobante}
            disabled={!montosOk || !empresaSeleccionada}
          >
            Crear Comprobante
          </Button>
        </Modal.Footer>
      </Modal>

      {/* [REF: HAC_MODAL_RENDER] Modal Picker - Crear */}
      <HaciendaPickerModal
        show={showHaciendaPickerCreate}
        onHide={() => setShowHaciendaPickerCreate(false)}
        empresaId={empresaSeleccionada?.id || null}
        proveedorId={nuevoComprobante?.proveedor_id || null}
        onSelect={(h) => {
          setNuevoComprobante((prev) => ({ ...prev, hacienda_id: h.id }));
          setShowHaciendaPickerCreate(false);
        }}
      />

      {/* [REF: HAC_MODAL_RENDER] Modal Picker - Editar */}
      <HaciendaPickerModal
        show={showHaciendaPickerEdit}
        onHide={() => setShowHaciendaPickerEdit(false)}
        empresaId={empresaSeleccionada?.id || null}
        proveedorId={selectedComprobante?.proveedor_id || null}
        comprobanteId={selectedComprobante?.id || null}  // <— pásalo al modal
        onSelect={(h) => {
          // solo estado local; el update real se hace al Guardar
          setSelectedComprobante((prev) => ({ ...prev, hacienda_id: h.id }));
          setShowHaciendaPickerEdit(false);
        }}
      />



    </Container>
  );
}
