// src/components/tesoreria/NuevoMovimientoCajaRetiro.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Spinner, ListGroup } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoMovimientoCajaRetiro({
  show,
  onHide,
  onSaved,
  presetFecha,    // "YYYY-MM-DD" (fecha origen)
  presetSucursal, // { id, nombre?/descripcion? } o id
  caja_id,        // viene del padre
  fechaRecepcion, // ← OPCIONAL: cuando estás en “Modo Recepción”
}) {
  const dataContext = useContext(Contexts.DataContext) || {};
  const {
    formasPagoTesoreria = [],
    categoriasIngreso = [],
    // 👇 setters opcionales para refrescar listas
    setCategoriasIngresoTabla,
    setCategoriasIngreso,
  } = dataContext;



  // ==== Helpers
  const fmt = (n) =>
    typeof n === "number" || typeof n === "string"
      ? `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
      : "";

  // Calcula una expresión formada únicamente por números, sumas y restas.
  // Ejemplos:
  // 15000
  // 15000 + 12000
  // 15000 + 12000 - 3000
  const calcularExpresionSobres = (texto) => {
    const original = String(texto || "").trim();

    if (!original) return 0;

    // Permitimos espacios y coma decimal.
    const limpio = original
      .replace(/\s+/g, "")
      .replace(/,/g, ".");

    // Solamente números, punto, + y -
    if (!/^[0-9.+-]*$/.test(limpio)) {
      return null;
    }

    // Si termina en + o -, calculamos igualmente el parcial.
    // Ej: "15000+12000+" => 27000
    const expresionCalculable = limpio.replace(/[+-]+$/, "");

    if (!expresionCalculable) return 0;

    // La expresión debe comenzar con un número positivo.
    if (!/^\d/.test(expresionCalculable)) {
      return null;
    }

    const partes = expresionCalculable.match(/[+-]?\d+(?:\.\d+)?/g);

    if (!partes) return null;

    // Verificamos que lo interpretado coincida exactamente con lo escrito.
    if (partes.join("") !== expresionCalculable) {
      return null;
    }

    return partes.reduce((total, parte) => {
      return total + Number(parte);
    }, 0);
  };

  // 👉 REFRESCAR categorías de ingreso al abrir el modal
  useEffect(() => {
    if (!show) return;

    let cancelado = false;

    const refrescarCategoriasIngreso = async () => {
      try {
        const res = await fetch(`${apiUrl}/categorias-ingreso`, {
          credentials: "include",
        });
        const json = res.ok ? await res.json() : [];
        const lista = Array.isArray(json) ? json : [];

        if (cancelado) return;

        if (typeof setCategoriasIngresoTabla === "function") {
          setCategoriasIngresoTabla(lista);
        } else if (typeof setCategoriasIngreso === "function") {
          setCategoriasIngreso(lista);
        }

        // Categoría predeterminada exclusiva para este modal
        const categoriaRetiro = lista.find(
          (c) =>
            String(
              c.nombre ||
              c.descripcion ||
              c.denominacion ||
              ""
            )
              .trim()
              .toLowerCase() === "retiro sucursal"
        );

        if (categoriaRetiro?.id) {
          setCategoriaIngresoId((actual) =>
            actual || String(categoriaRetiro.id)
          );
        }
      } catch (err) {
        console.error("Error refrescando categorías de ingreso (retiros):", err);
      }
    };

    refrescarCategoriasIngreso();

    return () => {
      cancelado = true;
    };
  }, [show, setCategoriasIngresoTabla, setCategoriasIngreso]);

  // Resolver formacobro "Caja/Efectivo" desde el contexto
  const formaCobroCajaId = useMemo(() => {
    const t = (s) => String(s || "").toLowerCase();
    const found =
      (formasPagoTesoreria || []).find((f) => /caja/.test(t(f.descripcion))) ||
      (formasPagoTesoreria || []).find((f) => /efectivo/.test(t(f.descripcion)));
    return found?.id || null;
  }, [formasPagoTesoreria]);

  // Categoría por defecto exclusiva de este modal
  const categoriaRetiroSucursalId = useMemo(() => {
    const normalizar = (s) =>
      String(s || "")
        .trim()
        .toLowerCase();

    const categoria = (categoriasIngreso || []).find(
      (c) => normalizar(c.nombre) === "retiro sucursal"
    );

    return categoria?.id || null;
  }, [categoriasIngreso]);

  // UI State
  const [fecha, setFecha] = useState(presetFecha || "");
  const [sucursalId, setSucursalId] = useState(
    typeof presetSucursal === "object" ? presetSucursal?.id : presetSucursal
  );
  const [categoriaingreso_id, setCategoriaIngresoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState(null);

  // Lista de sobres (retiros) – en edición guardamos { id?, importe }
  // const [sobres, setSobres] = useState([{ importe: "" }]);
  const [expresionSobres, setExpresionSobres] = useState("");

  // Modo edición
  const [movimientoId, setMovimientoId] = useState(null);

  // código nuevo...


  // ==== Sub-modal: “Retiros informados” (modelo Retiro)
  const [showInf, setShowInf] = useState(false);
  const [infLoading, setInfLoading] = useState(false);
  const [infError, setInfError] = useState(null);
  const [infItems, setInfItems] = useState([]); // [{id, descripcion, importe, fecha, ...}]
  const [infTotal, setInfTotal] = useState(0);

  // Reset base al abrir
  useEffect(() => {
    if (show) {
      setFecha(presetFecha || "");
      setSucursalId(typeof presetSucursal === "object" ? presetSucursal?.id : presetSucursal);
      setCategoriaIngresoId("");
      setDescripcion("");
      setObservaciones("");
      setExpresionSobres("");
      setMsg(null);
      setMovimientoId(null);

      // cerrar submodal por si quedó abierto
      setShowInf(false);
      setInfItems([]);
      setInfError(null);
      setInfTotal(0);
    }
  }, [show, presetFecha, presetSucursal]);

  // Seleccionar RETIRO SUCURSAL por defecto únicamente al crear.
  // Si estamos editando, se respeta la categoría guardada del movimiento.
  useEffect(() => {
    if (!show) return;
    if (movimientoId) return;
    if (!categoriaRetiroSucursalId) return;

    setCategoriaIngresoId((actual) => {
      // Si el usuario ya seleccionó otra categoría, no la pisamos.
      if (actual) return actual;

      return String(categoriaRetiroSucursalId);
    });
  }, [show, movimientoId, categoriaRetiroSucursalId]);

  // Precargar si ya existen retiros para la celda actual (usa SIEMPRE los props)
  useEffect(() => {
    const cargarExistente = async () => {
      if (!show || !presetFecha || !presetSucursal || !caja_id) return;

      const targetFecha = String(presetFecha).slice(0, 10);
      const targetSucursalId =
        typeof presetSucursal === "object" ? presetSucursal.id : presetSucursal;

      try {
        setCargando(true);

        const qs = new URLSearchParams({
          fecha: targetFecha,
          sucursal_id: String(targetSucursalId),
          caja_id: String(caja_id),
        }).toString();

        const res = await fetch(`${apiUrl}/retiros-tesoreria/retiros?${qs}`, {
          credentials: "include",
        });
        const raw = await res.json();
        const listaAll = Array.isArray(raw) ? raw : Array.isArray(raw?.retiros) ? raw.retiros : [];

        const iso = (d) => String(d || "").slice(0, 10);
        // FILTRO ESTRICTO por fecha y sucursal usando los props (no el estado)
        const lista = listaAll.filter(
          (r) => iso(r?.fecha) === targetFecha && Number(r?.sucursal_id) === Number(targetSucursalId)
        );

        if (lista.length > 0) {
          const movId = lista[0]?.movimiento_id || null;
          setMovimientoId(movId);

          // Compatibilidad con movimientos anteriores:
          // si existen varios sobres, los sumamos y cargamos el total
          // como expresión inicial.
          const totalExistente = lista.reduce(
            (acc, r) => acc + Number(r.importe || 0),
            0
          );

          // No cargamos todavía expresionSobres.
          // Primero consultamos el movimiento para saber si existe
          // una expresión original guardada.

          // Traer movimiento para completar encabezado
          if (movId) {
            const r2 = await fetch(`${apiUrl}/movimientos-caja-tesoreria/${movId}`, {
              credentials: "include",
            });
            const mov = await r2.json();
            if (r2.ok && mov) {

              const expresionGuardada =
                typeof mov.expresion_retiros === "string"
                  ? mov.expresion_retiros.trim()
                  : "";

              if (expresionGuardada) {
                // Movimiento nuevo: recuperamos exactamente la expresión original.
                setExpresionSobres(expresionGuardada);
              } else {
                // Movimiento histórico: no tenía expresión guardada,
                // por lo que usamos como fallback la suma de sus retiros.
                setExpresionSobres(
                  totalExistente > 0 ? String(totalExistente) : ""
                );
              }

              setDescripcion(mov.descripcion || "");
              setObservaciones(mov.observaciones || "");
              setCategoriaIngresoId(mov.categoriaingreso_id ? String(mov.categoriaingreso_id) : "");
              setFecha(mov.fecha || targetFecha); // asegura fecha correcta en el form
            } else {
              setFecha(targetFecha);
            }
          } else {
            setFecha(targetFecha);
          }
          setSucursalId(targetSucursalId);
        } else {
          // No hay datos -> modo crear
          setMovimientoId(null);
          setExpresionSobres("");
          setFecha(targetFecha);
          setSucursalId(targetSucursalId);
          setDescripcion("");
          setObservaciones("");
          setCategoriaIngresoId("");
        }
      } catch (e) {
        console.warn("Precarga edición retiros:", e);
      } finally {
        setCargando(false);
      }
    };

    cargarExistente();
    // 👉 Dependencias: props en lugar de los estados derivados
  }, [show, presetFecha, presetSucursal, caja_id]);

  // Validación mínima
  const totalSobres = useMemo(() => {
    const resultado = calcularExpresionSobres(expresionSobres);

    // Si la expresión es inválida, devolvemos 0 para las validaciones.
    if (resultado === null) return 0;

    return resultado;
  }, [expresionSobres]);

  const expresionSobresValida = useMemo(() => {
    return calcularExpresionSobres(expresionSobres) !== null;
  }, [expresionSobres]);

  const expresionSobresCompleta = useMemo(() => {
    const limpio = String(expresionSobres || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/,/g, ".");

    if (!limpio) return false;

    return /^\d+(?:\.\d+)?(?:[+-]\d+(?:\.\d+)?)*$/.test(limpio);
  }, [expresionSobres]);

  const puedeGuardar = useMemo(() => {
    if (!show) return false;
    if (!caja_id) return false;
    if (!sucursalId) return false;
    if (!fecha) return false;
    if (!formaCobroCajaId) return false;
    if (!categoriaingreso_id) return false; // si querés opcional, quita esta línea

    if (!expresionSobresValida) return false;

    if (!expresionSobresCompleta) return false;

    // Crear: total > 0
    if (!movimientoId && !(totalSobres > 0)) return false;

    // Editar: total > 0 (si queda 0, usar "Eliminar todos")
    if (movimientoId && !(totalSobres > 0)) return false;

    return true;
  }, [
    show,
    caja_id,
    sucursalId,
    fecha,
    formaCobroCajaId,
    totalSobres,
    movimientoId,
    categoriaingreso_id,
    expresionSobresValida,
    expresionSobresCompleta,
  ]);

  // const addSobre = () => setSobres((prev) => [...prev, { importe: "" }]);
  // const removeSobre = (idx) =>
  //   setSobres((prev) => prev.filter((_, i) => i !== idx));
  // const updateSobre = (idx, value) =>
  //   setSobres((prev) =>
  //     prev.map((s, i) => (i === idx ? { ...s, importe: value } : s))
  //   );

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMsg(null);
    if (!puedeGuardar) {
      setMsg({
        type: "warning",
        text: "Completá los campos requeridos e ingresá una operación válida con total mayor a cero.",
      });
      return;
    }

    try {
      setEnviando(true);

      if (!movimientoId) {
        // CREAR
        // La expresión ingresada se guarda como un único retiro
        // utilizando el total resultante de las sumas y restas.
        const retiros = [
          {
            importe: Number(totalSobres),
          },
        ];

        const body = {
          caja_id: Number(caja_id),
          sucursal_id: Number(sucursalId),
          fecha, // fecha ORIGEN
          formacobro_id: Number(formaCobroCajaId),
          categoriaingreso_id: categoriaingreso_id ? Number(categoriaingreso_id) : null,
          descripcion: descripcion?.trim() || null,
          expresion_retiros: expresionSobres.trim(),
          observaciones: observaciones?.trim() || null,
          retiros,
          // ← enviar fecha de recepción sólo si viene
          ...(fechaRecepcion ? { fecha_recepcion: fechaRecepcion } : {}),
        };

        const res = await fetch(`${apiUrl}/retiros-tesoreria/retiros-sucursal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo registrar el/los retiro(s)");
      } else {
        // EDITAR
        // Reemplazamos los retiros anteriores por un único retiro
        // cuyo importe es el resultado final de la expresión.
        const retiros = [
          {
            importe: Number(totalSobres),
          },
        ];

        const body = {
          fecha,
          categoriaingreso_id: categoriaingreso_id ? Number(categoriaingreso_id) : null,
          descripcion: descripcion?.trim() || null,
          observaciones: observaciones?.trim() || null,
          expresion_retiros: expresionSobres.trim(),
          retiros,
          ...(fechaRecepcion ? { fecha_recepcion: fechaRecepcion } : {}),
        };

        const res = await fetch(`${apiUrl}/retiros-tesoreria/retiros-sucursal/${movimientoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo actualizar los retiros");
      }

      onSaved?.();
      onHide?.();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarTodos = async () => {
    if (!movimientoId) return;
    if (!window.confirm("Vas a eliminar todos los sobres y el movimiento de caja. ¿Continuar?")) return;
    try {
      setEnviando(true);
      const res = await fetch(`${apiUrl}/retiros-tesoreria/retiros-sucursal/${movimientoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "No se pudo eliminar");
      onSaved?.();
      onHide?.();
    } catch (err) {
      setMsg({ type: "danger", text: err.message || "Error inesperado" });
    } finally {
      setEnviando(false);
    }
  };

  // ==== Abrir sub-modal y cargar retiros informados (modelo Retiro)
  const openInfModal = async () => {
    const targetFecha = String(presetFecha || fecha || "").slice(0, 10);
    const targetSucursalId =
      typeof presetSucursal === "object" ? presetSucursal.id : (presetSucursal || sucursalId);

    if (!targetFecha || !targetSucursalId) return;

    setShowInf(true);
    setInfLoading(true);
    setInfError(null);
    setInfItems([]);
    setInfTotal(0);

    try {
      const qs = new URLSearchParams({
        sucursal_id: String(targetSucursalId),
        fecha: targetFecha,
      }).toString();

      const r = await fetch(`${apiUrl}/retiros-sucursal-informados?${qs}`, {
        credentials: "include",
      });
      const json = await r.json();

      if (!r.ok) throw new Error(json?.error || "No se pudo obtener retiros informados");

      const items = Array.isArray(json?.retiros) ? json.retiros : Array.isArray(json) ? json : [];
      const norm = items.map((it) => ({
        id: it.id,
        descripcion: it.descripcion || "(sin descripción)",
        importe: Number(it.importe || 0),
        fecha: String(it.fecha || targetFecha).slice(0, 10),
      }));
      const total = norm.reduce((acc, it) => acc + Number(it.importe || 0), 0);

      setInfItems(norm);
      setInfTotal(total);
    } catch (err) {
      setInfError(err.message || "Error inesperado");
    } finally {
      setInfLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {movimientoId ? "Editar Retiro de Sucursal" : "Nuevo Retiro de Sucursal"}
              {fechaRecepcion ? ` · Recepción: ${new Date(fechaRecepcion + "T00:00:00").toLocaleDateString("es-AR")}` : ""}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {cargando ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "280px" }}
              >
                <Spinner animation="border" className="mb-3" />
                <div className="text-muted">
                  Cargando datos…
                </div>
              </div>
            ) : (
              <>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Label>Fecha (origen)</Form.Label>
                    <Form.Control
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      required
                      disabled={!!movimientoId}
                    />
                    <Form.Text className="text-muted">
                      Caja #{caja_id ?? "-"} · {formaCobroCajaId ? "Caja/Efectivo" : "—"}
                    </Form.Text>
                  </Col>
                  <Col md={5}>
                    <Form.Label>Sucursal</Form.Label>
                    <Form.Control
                      value={
                        typeof presetSucursal === "object"
                          ? `${presetSucursal?.id} - ${presetSucursal?.nombre || presetSucursal?.descripcion || ""}`.trim()
                          : String(sucursalId || "")
                      }
                      disabled
                    />
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button variant="outline-info" className="w-100" onClick={openInfModal}>
                      Ver retiros informados
                    </Button>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Label>Categoría de Ingreso</Form.Label>
                    <Form.Select
                      value={categoriaingreso_id}
                      onChange={(e) => setCategoriaIngresoId(e.target.value)}
                      className="form-control my-input"
                      required
                    >
                      <option value="">Seleccione…</option>
                      {(categoriasIngreso || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                <div className="mb-3">
                  <Form.Label className="fw-bold">
                    Ingreso de sobres
                  </Form.Label>

                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>

                    <Form.Control
                      type="text"
                      value={expresionSobres}
                      onChange={(e) => setExpresionSobres(e.target.value)}
                      placeholder="Ej: 15000 + 12500 + 8000 - 500"
                      autoComplete="off"
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 600,
                      }}
                    />
                  </InputGroup>

                  <Form.Text className="text-muted">
                    Ingrese los importes utilizando + y -.
                    Ejemplo: 15000 + 12500 - 3000
                  </Form.Text>

                  {expresionSobres && !expresionSobresValida && (
                    <div className="text-danger mt-1">
                      Expresión inválida. Utilice solamente números, + y -.
                    </div>
                  )}

                  {expresionSobres &&
                    expresionSobresValida &&
                    !expresionSobresCompleta && (
                      <div className="text-warning mt-1">
                        Complete la operación antes de guardar.
                      </div>
                    )}

                  <div className="mt-3 p-3 border rounded bg-light">
                    <div className="text-muted">
                      Parcial
                    </div>

                    <div className="fs-3 fw-bold">
                      {fmt(totalSobres)}
                    </div>
                  </div>
                </div>
                <Row className="mb-3">
                  <Col>
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder={
                        movimientoId
                          ? "Descripción del movimiento"
                          : `Retiros sucursal ${typeof presetSucursal === "object"
                            ? presetSucursal?.nombre || presetSucursal?.descripcion || presetSucursal?.id
                            : presetSucursal
                          } (${fecha})`
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                  </Col>
                </Row>

                {msg && (
                  <div className={`alert alert-${msg.type} mt-3 py-2`}>
                    {msg.text}
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="justify-content-between">
            {movimientoId ? (
              <Button variant="outline-danger" onClick={handleEliminarTodos} disabled={enviando}>
                {enviando ? "Eliminando…" : "Eliminar todos los sobres y el movimiento"}
              </Button>
            ) : (
              <div />
            )}

            <div>
              <Button variant="outline-secondary" onClick={onHide} disabled={enviando}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={!puedeGuardar || enviando} className="mx-2">
                {enviando ? "Guardando…" : movimientoId ? "Guardar cambios" : "Guardar"}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Sub-modal: Retiros informados */}
      <Modal show={showInf} onHide={() => setShowInf(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Retiros informados por la sucursal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2 text-muted">
            {typeof presetSucursal === "object"
              ? `Sucursal: ${presetSucursal?.nombre || presetSucursal?.descripcion || presetSucursal?.id}`
              : `Sucursal: ${sucursalId}`}{" "}
            · Fecha origen: {String(presetFecha || fecha || "").slice(0, 10)}
          </div>

          {infLoading && (
            <div className="mb-2">
              <Spinner size="sm" animation="border" className="me-2" />
              Cargando retiros…
            </div>
          )}

          {infError && <div className="alert alert-danger py-2">{infError}</div>}

          {!infLoading && !infError && (
            <>
              {infItems.length === 0 ? (
                <div className="text-muted">No hay retiros informados para esta fecha y sucursal.</div>
              ) : (
                <ListGroup className="mb-3">
                  {infItems.map((it) => (
                    <ListGroup.Item key={it.id}>
                      <div className="d-flex justify-content-between">
                        <div className="me-3">{it.descripcion}</div>
                        <div className="fw-semibold">{fmt(it.importe)}</div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              <div className="d-flex justify-content-end">
                <span className="fw-bold">Total informado:&nbsp;{fmt(infTotal)}</span>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowInf(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
