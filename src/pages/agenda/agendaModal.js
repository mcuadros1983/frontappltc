import React, { useEffect, useMemo, useState, useContext } from "react";
import { Modal, Button, Row, Col, Form, Spinner, Alert, InputGroup } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

/* ==================== API ==================== */
async function obtenerAgenda(id) {
  const r = await fetch(`${apiUrl}/agenda/${id}`, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudo obtener el registro");
  return r.json();
}

async function crearAgenda(payload) {
  const r = await fetch(`${apiUrl}/agenda`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || "No se pudo crear el registro");
  }
  return r.json();
}

async function actualizarAgenda(id, payload) {
  const r = await fetch(`${apiUrl}/agenda/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || "No se pudo actualizar el registro");
  }
  return r.json();
}

/* ==================== Modal ==================== */
export default function AgendaModal({
  show,
  onHide,
  agendaId = null,                 // null = crear
  onSaved,
  defaultEmpresaId = null,
  defaultSucursalId = null,
  defaultResponsableId = null,
}) {
  const isEdit = !!agendaId;

  // Contextos para catálogos
  const dataCtx = useContext(Contexts.DataContext);
  const { empresasTabla = [], sucursalesTabla = [] } = dataCtx || {};

  // Estado de carga/errores
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // Form
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [fechaVenc, setFechaVenc] = useState("");
  const [importancia, setImportancia] = useState("media");
  const [realizado, setRealizado] = useState("pendiente");
  const [costo, setCosto] = useState("");
  const [periodicidad, setPeriodicidad] = useState("unica");
  const [repetirCada, setRepetirCada] = useState(1);
  const [repetirHasta, setRepetirHasta] = useState("");
  const [recordatorioDias, setRecordatorioDias] = useState("");
  const [sucursalId, setSucursalId] = useState(defaultSucursalId || "");
  const [empresaId, setEmpresaId] = useState(defaultEmpresaId || "");
  const [usuarioRespId, setUsuarioRespId] = useState(defaultResponsableId || "");
  const [observaciones, setObservaciones] = useState("");
  const [diaVencimiento, setDiaVencimiento] = useState("");
  const [usuariosAuth, setUsuariosAuth] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  // Cargar si es edición
  useEffect(() => {
    let cancel = false;
    if (!show) return;
    if (!isEdit) {
      // reset al abrir en modo crear
      setTitulo("");
      setDescripcion("");
      setFecha(new Date().toISOString().slice(0, 10));
      setFechaVenc("");
      setImportancia("media");
      setRealizado("pendiente");
      setCosto("");
      setPeriodicidad("unica");
      setRepetirCada(1);
      setRepetirHasta("");
      setRecordatorioDias("");
      setSucursalId(defaultSucursalId || "");
      setEmpresaId(defaultEmpresaId || "");
      setUsuarioRespId(defaultResponsableId || "");
      setObservaciones("");
      setDiaVencimiento("");
      setErr(null);
      return;
    }



    (async () => {
      setLoading(true); setErr(null);
      try {
        const it = await obtenerAgenda(agendaId);
        if (cancel) return;
        setTitulo(it.titulo || "");
        setDescripcion(it.descripcion || "");
        setFecha(it.fecha || new Date().toISOString().slice(0, 10));
        setFechaVenc(it.fecha_vencimiento || "");
        setImportancia(it.importancia || "media");
        setRealizado(it.realizado || "pendiente");
        setCosto(it.costo != null ? String(it.costo) : "");
        setPeriodicidad(it.periodicidad || "unica");
        setRepetirCada(it.repetir_cada != null ? Number(it.repetir_cada) : 1);
        setRepetirHasta(it.repetir_hasta || "");
        setRecordatorioDias(it.recordatorio_dias_antes != null ? String(it.recordatorio_dias_antes) : "");
        setSucursalId(it.sucursal_id != null ? String(it.sucursal_id) : "");
        setEmpresaId(it.empresa_id != null ? String(it.empresa_id) : "");
        setUsuarioRespId(it.usuario_responsable_id != null ? String(it.usuario_responsable_id) : (defaultResponsableId || ""));
        setObservaciones(it.observaciones || "");
        setDiaVencimiento(it.dia_vencimiento != null ? String(it.dia_vencimiento) : "");
      } catch (e) {
        if (!cancel) setErr(e.message || "Error cargando el registro");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, agendaId, isEdit]);

  useEffect(() => {
    let cancel = false;
    if (!show) return;

    (async () => {
      try {
        setLoadingUsuarios(true);
        const r = await fetch(`${apiUrl}/usuarios`, { credentials: "include" });
        if (!r.ok) throw new Error("No se pudieron obtener los usuarios");
        const data = await r.json();
        if (!cancel) setUsuariosAuth(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancel) console.warn("Usuarios:", e.message);
        if (!cancel) setUsuariosAuth([]);
      } finally {
        if (!cancel) setLoadingUsuarios(false);
      }
    })();

    return () => { cancel = true; };
  }, [show]);

  // Mostrar campo día de vencimiento sólo si aplica
  const showDiaVto = useMemo(() => ["mensual", "anual"].includes(periodicidad), [periodicidad]);
  const showRecurrencia = useMemo(() => periodicidad !== "unica", [periodicidad]);

  const guardar = async () => {
    try {
      setSaving(true); setErr(null);

      const payload = {
        titulo: titulo?.trim(),
        descripcion: descripcion?.trim() || null,
        fecha: fecha || new Date().toISOString().slice(0, 10),
        fecha_vencimiento: fechaVenc || null,
        importancia,
        realizado,
        costo: costo !== "" ? Number(costo) : null,
        periodicidad,
        repetir_cada: showRecurrencia ? Number(repetirCada || 1) : 1,
        repetir_hasta: showRecurrencia ? (repetirHasta || null) : null,
        recordatorio_dias_antes: recordatorioDias !== "" ? Number(recordatorioDias) : null,
        sucursal_id: sucursalId ? Number(sucursalId) : null,
        empresa_id: empresaId ? Number(empresaId) : null,
        usuario_responsable_id: usuarioRespId ? Number(usuarioRespId) : null,
        observaciones: observaciones?.trim() || null,
        dia_vencimiento: showDiaVto && diaVencimiento !== "" ? Number(diaVencimiento) : null,
      };

      if (!payload.titulo) {
        setSaving(false);
        setErr("El título es obligatorio");
        return;
      }

      if (isEdit) {
        await actualizarAgenda(agendaId, payload);
      } else {
        await crearAgenda(payload);
      }

      onSaved?.();
      onHide?.();
    } catch (e) {
      setErr(e.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? `Editar tarea #${agendaId}` : "Nueva tarea"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" /></div>
        ) : (
          <Form>
            <Row className="g-3">
              <Col md={7}>
                <Form.Label>Título</Form.Label>
                <Form.Control value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </Col>
              <Col md={5}>
                <Form.Label>Importancia</Form.Label>
                <Form.Select value={importancia} onChange={(e) => setImportancia(e.target.value)} className="form-control my-input">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </Form.Select>
              </Col>

              <Col md={12}>
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </Col>

              <Col md={4}>
                <Form.Label>Fecha</Form.Label>
                <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </Col>
              <Col md={4}>
                <Form.Label>Fecha vencimiento</Form.Label>
                <Form.Control type="date" value={fechaVenc} onChange={(e) => setFechaVenc(e.target.value)} />
              </Col>
              <Col md={4}>
                <Form.Label>Estado</Form.Label>
                <Form.Select value={realizado} onChange={(e) => setRealizado(e.target.value)} className="form-control my-input">
                  <option value="pendiente">Pendiente</option>
                  <option value="parcial">Parcial</option>
                  <option value="realizado">Realizado</option>
                  <option value="postergado">Postergado</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label>Periodicidad</Form.Label>
                <Form.Select value={periodicidad} onChange={(e) => setPeriodicidad(e.target.value)} className="form-control my-input">
                  <option value="unica">Única</option>
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
                </Form.Select>
              </Col>

              {showRecurrencia && (
                <>
                  <Col md={4}>
                    <Form.Label>Repetir cada</Form.Label>
                    <InputGroup>
                      <Form.Control type="number" min={1} value={repetirCada} onChange={(e) => setRepetirCada(Number(e.target.value || 1))} />
                      <InputGroup.Text>
                        {periodicidad === "diaria" && "día(s)"}
                        {periodicidad === "semanal" && "semana(s)"}
                        {periodicidad === "mensual" && "mes(es)"}
                        {periodicidad === "anual" && "año(s)"}
                      </InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Label>Repetir hasta</Form.Label>
                    <Form.Control type="date" value={repetirHasta} onChange={(e) => setRepetirHasta(e.target.value)} />
                  </Col>
                </>
              )}

              {showDiaVto && (
                <Col md={4}>
                  <Form.Label>Día de vencimiento</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={31}
                    value={diaVencimiento}
                    onChange={(e) => setDiaVencimiento(e.target.value)}
                    placeholder="1..31"
                  />
                  <Form.Text className="text-muted">Si no se indica, se usará la fecha de vencimiento.</Form.Text>
                </Col>
              )}

              <Col md={4}>
                <Form.Label>Costo</Form.Label>
                <Form.Control type="number" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} />
              </Col>

              <Col md={4}>
                <Form.Label>Recordatorio (días antes)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={recordatorioDias}
                  onChange={(e) => setRecordatorioDias(e.target.value)}
                  placeholder="p.ej. 7"
                />
              </Col>

              <Col md={4}>
                <Form.Label>Empresa</Form.Label>
                <Form.Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} className="form-control my-input">
                  <option value="">—</option>
                  {empresasTabla.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombrecorto || emp.descripcion || emp.razon_social || `Empresa ${emp.id}`}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Sucursal</Form.Label>
                <Form.Select value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} className="form-control my-input">
                  <option value="">—</option>
                  {sucursalesTabla.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre || s.descripcion || `Sucursal ${s.id}`}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Responsable</Form.Label>
                <Form.Select
                  value={String(usuarioRespId || "")}
                  onChange={(e) => setUsuarioRespId(e.target.value)}
                  className="form-control my-input"
                  disabled={loadingUsuarios}
                >
                  <option value="">{loadingUsuarios ? "Cargando..." : "— Sin responsable —"}</option>

                  {usuariosAuth
                    .slice()
                    .sort((a, b) => String(a?.usuario || "").localeCompare(String(b?.usuario || "")))
                    .map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        {u.usuario || `Usuario ${u.id}`}
                      </option>
                    ))}
                </Form.Select>

                <Form.Text className="text-muted">
                  Se muestra el usuario, se guarda el ID.
                </Form.Text>
              </Col>

              <Col md={12}>
                <Form.Label>Observaciones</Form.Label>
                <Form.Control as="textarea" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>Cancelar</Button>
        <Button variant="primary" onClick={guardar} disabled={saving || loading}>
          {saving ? <Spinner size="sm" animation="border" /> : (isEdit ? "Guardar cambios" : "Crear")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
