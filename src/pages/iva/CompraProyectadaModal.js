import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

// Valida fecha ISO YYYY-MM-DD
const isValidISODate = (s) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(new Date(s).getTime());

export default function CompraProyectadaModal({
  show,
  onClose,
  initialItem = null,
  empresaId,
  empresaNombreCorto = "",
  librosIva = [],
  proveedores = [],
  periodos = [], // si viene vacío, se hará fetch automático
  disabledGlobal = false,
}) {
  const isEdit = !!initialItem;

  // Form vacío
  const makeEmptyForm = useCallback(
    () => ({
      empresa_id: empresaId || "",
      libroiva_id: "",
      periodo_id: "",
      proveedor_id: "",
      fecha: "",      // YYYY-MM-DD
      informada: false,
      cantidad: "",
      precio: "",
      kg: "",
      bruto: "",
      iva: "",
      neto: "",
    }),
    [empresaId]
  );

  const [form, setForm] = useState(makeEmptyForm());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Períodos (fetch opcional)
  const [periodosLocal, setPeriodosLocal] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [errPeriodos, setErrPeriodos] = useState(null);

  const formatPeriodo = useCallback((p) => {
    if (!p) return "";
    const mm = String(p.mes).padStart(2, "0");
    return `${mm}/${p.anio}`;
  }, []);

  const handleClose = useCallback(
    (ok = false) => {
      if (typeof onClose === "function") onClose(ok);
    },
    [onClose]
  );

  const periodosFuente = (periodos && periodos.length > 0) ? periodos : periodosLocal;

  const loadPeriodos = useCallback(async () => {
    if (periodos && periodos.length > 0) return;
    setLoadingPeriodos(true);
    setErrPeriodos(null);
    try {
      const r = await fetch(`${apiUrl}/periodoliquidacion`, { credentials: "include" });
      if (!r.ok) throw new Error("No se pudieron obtener los períodos.");
      const data = await r.json();
      setPeriodosLocal(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrPeriodos(e.message || "Error cargando períodos.");
    } finally {
      setLoadingPeriodos(false);
    }
  }, [periodos]);

  useEffect(() => {
    if (show) loadPeriodos();
  }, [show, loadPeriodos]);

  // Re-init al abrir
  useEffect(() => {
    if (!show) return;
    if (initialItem) {
      const fechaISO =
        typeof initialItem.fecha === "string" && initialItem.fecha.length >= 10
          ? initialItem.fecha.slice(0, 10)
          : (initialItem.fecha ?? "");
      setForm({
        empresa_id: initialItem.empresa_id ?? empresaId ?? "",
        libroiva_id: initialItem.libroiva_id != null ? String(initialItem.libroiva_id) : "",
        periodo_id: initialItem.periodo_id != null ? String(initialItem.periodo_id) : "",
        proveedor_id: initialItem.proveedor_id != null ? String(initialItem.proveedor_id) : "",
        fecha: fechaISO,
        informada: !!initialItem.informada,
        cantidad: initialItem.cantidad ?? "",
        precio: initialItem.precio ?? "",
        kg: initialItem.kg ?? "",
        bruto: initialItem.bruto ?? "",
        iva: initialItem.iva ?? "",
        neto: initialItem.neto ?? "",
      });
    } else {
      setForm(makeEmptyForm());
    }
  }, [show, initialItem, empresaId, makeEmptyForm]);

  // Sincroniza empresa si cambia mientras está abierto
  useEffect(() => {
    if (show && !initialItem && empresaId && !form.empresa_id) {
      setForm((f) => ({ ...f, empresa_id: empresaId }));
    }
  }, [show, initialItem, empresaId, form.empresa_id]);

  const resetOnExited = useCallback(() => {
    setForm(makeEmptyForm());
    setErr(null);
    setErrPeriodos(null);
  }, [makeEmptyForm]);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  // ---- Cálculos automáticos (sin formateos) ----
  // Bruto = cantidad * kg * precio
  const recalcularBrutoDesdeFactores = useCallback(() => {
    const cantidadNum = Number(form.cantidad || 0);
    const kgNum = Number(form.kg || 0);
    const precioNum = Number(form.precio || 0);

    if (cantidadNum > 0 && kgNum > 0 && Number.isFinite(precioNum) && precioNum > 0) {
      const brutoNum = +(cantidadNum * kgNum * precioNum).toFixed(2);
      const ivaNum = +(brutoNum * 0.105).toFixed(2);
      const netoNum = +(brutoNum + ivaNum).toFixed(2);
      setField("bruto", String(brutoNum));
      setField("iva", String(ivaNum));
      setField("neto", String(netoNum));
    } else {
      setField("bruto", "");
      setField("iva", "");
      setField("neto", "");
    }
  }, [form.cantidad, form.kg, form.precio]);

  const onPrecioBlur = () => {
    recalcularBrutoDesdeFactores();
  };
  const onCantidadBlur = () => {
    recalcularBrutoDesdeFactores();
  };
  const onKgBlur = () => {
    recalcularBrutoDesdeFactores();
  };

  // Si editan Bruto manualmente, recalcular IVA/NETO
  const onBrutoBlur = () => {
    const brutoNum = Number(form.bruto);
    if (Number.isFinite(brutoNum)) {
      const ivaNum = +(brutoNum * 0.105).toFixed(2);
      const netoNum = +(brutoNum + ivaNum).toFixed(2);
      setField("iva", String(ivaNum));
      setField("neto", String(netoNum));
    } else {
      setField("iva", "");
      setField("neto", "");
    }
  };

  // Bloqueo: solo cuando disabledGlobal es true y NO es edición
  const bloqueado = useMemo(() => disabledGlobal && !isEdit, [disabledGlobal, isEdit]);

  // Habilitar Guardar
  const canSave = useMemo(() => {
    const empresaIdEfectiva = form.empresa_id || empresaId || "";
    return (
      !!empresaIdEfectiva &&
      !!form.libroiva_id &&
      !!form.periodo_id &&
      !!form.proveedor_id &&
      !!form.fecha &&
      isValidISODate(form.fecha) &&
      !bloqueado
    );
  }, [form, empresaId, bloqueado]);

  // 🔎 Filtrado de Libros IVA por empresa seleccionada
  const empresaIdEfectiva = form.empresa_id || empresaId || "";
  const librosIvaFiltrados = useMemo(() => {
    if (!empresaIdEfectiva) return [];
    const base = (librosIva || []).filter(
      (l) => Number(l.empresa_id) === Number(empresaIdEfectiva)
    );
    // Si estoy editando y el seleccionado no aparece por el filtro (consistencia),
    // lo agrego para no ocultarlo.
    if (isEdit && form.libroiva_id) {
      const sel = (librosIva || []).find((l) => String(l.id) === String(form.libroiva_id));
      if (sel && !base.some((b) => String(b.id) === String(sel.id))) {
        return [...base, sel];
      }
    }
    return base;
  }, [librosIva, empresaIdEfectiva, isEdit, form.libroiva_id]);

  const onSubmit = async (e) => {
    e?.preventDefault();

    const faltantes = [];
    const empresaFinal = form.empresa_id || empresaId || "";

    if (!empresaFinal) faltantes.push("empresa");
    if (!form.libroiva_id) faltantes.push("libro IVA");
    if (!form.periodo_id) faltantes.push("período");
    if (!form.proveedor_id) faltantes.push("proveedor");
    if (!form.fecha) faltantes.push("fecha");
    if (form.fecha && !isValidISODate(form.fecha)) {
      setErr("La fecha es inválida. Usá formato YYYY-MM-DD.");
      return;
    }
    if (faltantes.length) {
      setErr(`Completá: ${faltantes.join(", ")}.`);
      return;
    }
    if (bloqueado) {
      setErr("No podés crear compras proyectadas sin seleccionar una empresa.");
      return;
    }

    try {
      setSaving(true);
      setErr(null);

      const payload = {
        ...form,
        empresa_id: Number(empresaFinal),
        libroiva_id: Number(form.libroiva_id),
        periodo_id: Number(form.periodo_id),
        proveedor_id: Number(form.proveedor_id),
        fecha: form.fecha, // YYYY-MM-DD
        informada: !!form.informada,
        cantidad: form.cantidad === "" ? null : Number(form.cantidad),
        kg: form.kg === "" ? null : Number(form.kg),
        precio: form.precio === "" ? null : Number(form.precio),
        bruto: form.bruto === "" ? 0 : Number(form.bruto),
        iva: form.iva === "" ? 0 : Number(form.iva),
        neto: form.neto === "" ? 0 : Number(form.neto),
      };

      const url = isEdit
        ? `${apiUrl}/compraproyectada/${initialItem.id}`
        : `${apiUrl}/compraproyectada`;

      const r = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) throw new Error("No se pudo guardar la compra.");
      handleClose(true);
    } catch (e2) {
      setErr(e2.message || "Error guardando.");
    } finally {
      setSaving(false);
    }
  };

  const empresaLabel =
    (initialItem && initialItem.empresa && initialItem.empresa.nombrecorto) ||
    empresaNombreCorto ||
    String(form.empresa_id || empresaId || "");

  return (
    <Modal
      show={show}
      onHide={() => handleClose(false)}
      onExited={resetOnExited}
      size="lg"
      backdrop="static"
    >
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Editar Compra Proyectada" : "Nueva Compra Proyectada"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {err && <Alert variant="danger">{err}</Alert>}
          {errPeriodos && <Alert variant="warning">{errPeriodos}</Alert>}

          <Row className="g-2">
            <Col md={4}>
              <Form.Label>Empresa</Form.Label>
              <Form.Control value={empresaLabel} disabled readOnly />
              <Form.Text>La empresa se toma de la selección actual.</Form.Text>
            </Col>

            <Col md={4}>
              <Form.Label>Libro IVA</Form.Label>
              <Form.Select
                value={String(form.libroiva_id || "")}
                onChange={(e) => setField("libroiva_id", e.target.value)}
                required
                className="form-control my-input"
                disabled={!empresaIdEfectiva}
              >
                <option value="">{!empresaIdEfectiva ? "Seleccione empresa" : "Seleccione..."}</option>
                {librosIvaFiltrados.map((l) => (
                  <option key={l.id} value={String(l.id)}>
                    {l.descripcion || `Libro ${l.id}`}
                  </option>
                ))}
              </Form.Select>
              {!empresaIdEfectiva && (
                <Form.Text className="text-muted">Debés seleccionar una empresa.</Form.Text>
              )}
            </Col>

            <Col md={4}>
              <Form.Label>Período</Form.Label>
              <Form.Select
                value={String(form.periodo_id || "")}
                onChange={(e) => setField("periodo_id", e.target.value)}
                required
                className="form-control my-input"
                disabled={loadingPeriodos}
              >
                <option value="">{loadingPeriodos ? "Cargando..." : "Seleccione..."}</option>
                {(periodosFuente || []).map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {formatPeriodo(p)} {/* {id, anio, mes} */}
                  </option>
                ))}
              </Form.Select>
              {!loadingPeriodos && (periodosFuente || []).length === 0 && (
                <Form.Text className="text-muted">No hay períodos disponibles.</Form.Text>
              )}
            </Col>

            <Col md={6}>
              <Form.Label>Proveedor</Form.Label>
              <Form.Select
                value={String(form.proveedor_id || "")}
                onChange={(e) => setField("proveedor_id", e.target.value)}
                required
                className="form-control my-input"
              >
                <option value="">Seleccione...</option>
                {proveedores?.map((pr) => (
                  <option key={pr.id} value={String(pr.id)}>
                    {pr.razonsocial || pr.nombre || `Proveedor ${pr.id}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={form.fecha}
                onChange={(e) => setField("fecha", e.target.value)}
                required
              />
            </Col>

            <Col md={3} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                id="informada"
                label="Informada"
                checked={!!form.informada}
                onChange={(e) => setField("informada", e.target.checked)}
              />
            </Col>

            <Col md={3}>
              <Form.Label>Cantidad (u.)</Form.Label>
              <Form.Control
                type="number"
                step="0.001"
                value={form.cantidad}
                onChange={(e) => setField("cantidad", e.target.value)}
                onBlur={recalcularBrutoDesdeFactores}
              />
            </Col>

            <Col md={3}>
              <Form.Label>Kg</Form.Label>
              <Form.Control
                type="number"
                step="0.001"
                value={form.kg}
                onChange={(e) => setField("kg", e.target.value)}
                onBlur={recalcularBrutoDesdeFactores}
              />
            </Col>

            <Col md={3}>
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                value={form.precio}
                onChange={(e) => setField("precio", e.target.value)}
                onBlur={recalcularBrutoDesdeFactores}
              />
            </Col>

            <Col md={3}>
              <Form.Label>Bruto</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={form.bruto}
                onChange={(e) => setField("bruto", e.target.value)}
                onBlur={onBrutoBlur}
              />
            </Col>

            <Col md={3}>
              <Form.Label>IVA (10,5%)</Form.Label>
              <Form.Control value={form.iva} readOnly disabled />
            </Col>

            <Col md={3}>
              <Form.Label>Total</Form.Label>
              <Form.Control value={form.neto} readOnly disabled />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleClose(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSave || saving || (disabledGlobal && !isEdit)}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
