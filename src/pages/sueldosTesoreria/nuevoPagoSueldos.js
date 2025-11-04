// src/components/sueldos/NuevoPagoSueldo.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";

const apiUrl = process.env.REACT_APP_API_URL;

export default function NuevoPagoSueldo({ show, onHide, onCreated }) {
    const data = useContext(Contexts.DataContext) || {};
    const {
        empresaSeleccionada,
        cajaAbierta,
        empleados = [],                 // 👈 del contexto
        formasPagoTesoreria = [],
        bancosTabla = [],
        categoriasEgresoTabla = [],
        categoriasEgreso = [],
        proyectosTabla = [],
    } = data;

    const empresa_id = empresaSeleccionada?.id || null;
    const caja_id = cajaAbierta?.caja?.id || null;

    const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
    const [empleado_id, setEmpleadoId] = useState("");
    const [descripcion, setDescripcion] = useState("Pago de sueldo");
    const [importe, setImporte] = useState("");
    const [formapago_id, setFormapagoId] = useState("");
    const [banco_id, setBancoId] = useState("");
    const [proyecto_id, setProyectoId] = useState("");
    const [categoriaegreso_id, setCategoriaId] = useState("");
    const [imputacioncontable_id, setImputacionId] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [msg, setMsg] = useState(null);

    // Aplana empleados: toma el id desde item.empleado.id y arma la etiqueta
    const listaEmpleados = useMemo(() => {
        return (empleados || [])
            .map((row) => {
                const e = row?.empleado || row;            // objeto "empleado" (cuando viene anidado)
                const p = row?.clientePersona || null;     // datos de persona (si vienen)
                const id = e?.id ?? row?.id ?? null;       // PRIORIDAD: empleado.id
                if (!id) return null;

                const apellido = e?.apellido ?? p?.apellido ?? "";
                const nombre = e?.nombre ?? p?.nombre ?? "";
                const label =
                    [apellido, nombre].filter(Boolean).join(", ") ||
                    e?.razonSocial ||
                    `Empleado #${id}`;

                return { id, label };
            })
            .filter(Boolean)
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [empleados]);


    // Categorías: preferir tabla
    const categorias = useMemo(
        () => (categoriasEgresoTabla?.length ? categoriasEgresoTabla : categoriasEgreso) || [],
        [categoriasEgresoTabla, categoriasEgreso]
    );

    // Pre-seleccionar categoría "Sueldos" si existe
    useEffect(() => {
        console.log("empleados", empleados)
        if (!show) return;
        if (!categoriaegreso_id && categorias.length) {
            const c = categorias.find(
                (x) => /sueldo|jornal|remuneraci/i.test(String(x.nombre || ""))
            );
            if (c?.id) setCategoriaId(String(c.id));
        }
    }, [show, categorias, categoriaegreso_id]);

    // Derivar imputación
    useEffect(() => {
        if (!categoriaegreso_id) return setImputacionId("");
        const cat = (categorias || []).find((c) => Number(c.id) === Number(categoriaegreso_id));
        setImputacionId(cat?.imputacioncontable_id ? String(cat.imputacioncontable_id) : "");
    }, [categoriaegreso_id, categorias]);

    // Detectar medios a partir de formas de pago (opcional – solo para UI)
    const formaCajaId = useMemo(() => {
        const m = (formasPagoTesoreria || []).find((f) => /(caja|efectivo)/i.test(String(f.descripcion || "")));
        return m?.id || null;
    }, [formasPagoTesoreria]);

    const formaBancoId = useMemo(() => {
        const m = (formasPagoTesoreria || []).find((f) => /(transfer|banco)/i.test(String(f.descripcion || "")));
        return m?.id || null;
    }, [formasPagoTesoreria]);

    // ⬇️ SOLO mostrar "Efectivo" y "Transferencias"
    const formasPagoFiltradas = useMemo(() => {
        const regex = /(efectivo|transfer)/i; // cubre "Efectivo", "Transferencia(s)"
        return (formasPagoTesoreria || []).filter(f =>
            regex.test(String(f.descripcion || ""))
        );
    }, [formasPagoTesoreria]);


    useEffect(() => {
        if (!formapago_id) return;
        const ok = formasPagoFiltradas.some(f => Number(f.id) === Number(formapago_id));
        if (!ok) setFormapagoId("");
    }, [formasPagoFiltradas, formapago_id]);

    // Agregar justo debajo de formaCajaId y formaBancoId:
    const medioDetectado = useMemo(() => {
        if (!formapago_id) return "";
        if (Number(formapago_id) === Number(formaCajaId)) return "caja";
        if (Number(formapago_id) === Number(formaBancoId)) return "banco";
        const fp = (formasPagoTesoreria || []).find(f => Number(f.id) === Number(formapago_id));
        const desc = String(fp?.descripcion || "");
        if (/(caja|efectivo)/i.test(desc)) return "caja";
        if (/(transfer|banco)/i.test(desc)) return "banco";
        return "";
    }, [formapago_id, formaCajaId, formaBancoId, formasPagoTesoreria]);

    // Bancos de la empresa seleccionada
    const bancosEmpresa = useMemo(() => {
        if (!empresa_id) return [];
        return (bancosTabla || []).filter((b) => Number(b.empresa_id) === Number(empresa_id));
    }, [bancosTabla, empresa_id]);


    useEffect(() => {
        if (medioDetectado === "banco" && !banco_id && bancosEmpresa.length === 1) {
            setBancoId(String(bancosEmpresa[0].id));
        }
    }, [medioDetectado, bancosEmpresa, banco_id]);

    // Si cambia forma de pago, sugerir medio

    // Reemplazar todo el useMemo de puedeGuardar por:
    const puedeGuardar = useMemo(() => {
        if (!show) return false;
        if (!empresa_id) return false;
        if (!fecha) return false;
        if (!empleado_id) return false;

        const n = Number(importe);
        if (!(n > 0)) return false;

        if (!formapago_id) return false;

        // ✅ Solo exigimos la categoría (la imputación se deriva en backend)
        if (!categoriaegreso_id) return false;

        if (!medioDetectado) return false;

        if (medioDetectado === "caja" && !caja_id) return false;
        if (medioDetectado === "banco" && !banco_id) return false;

        return true;
    }, [
        show,
        empresa_id,
        fecha,
        empleado_id,
        importe,
        formapago_id,
        categoriaegreso_id,
        medioDetectado,
        caja_id,
        banco_id,
    ]);


    // Reemplazar la función limpiar por:
    const limpiar = () => {
        setFecha(new Date().toISOString().slice(0, 10));
        setEmpleadoId("");
        setDescripcion("Pago de sueldo");
        setImporte("");
        setFormapagoId("");
        setBancoId("");
        setProyectoId("");
        setMsg(null);
    };

    const handleClose = () => {
        if (!enviando) { limpiar(); onHide?.(); }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        setMsg(null);
        if (!puedeGuardar) {
            setMsg({ type: "warning", text: "Completá los campos requeridos." });
            return;
        }
        try {
            setEnviando(true);

            const payload = {
                empresa_id,
                medio: medioDetectado,                          // 'caja' | 'banco' (detectado)
                ...(medioDetectado === "caja" ? { caja_id: Number(caja_id) } : {}),
                ...(medioDetectado === "banco" ? { banco_id: Number(banco_id) } : {}),
                pago: {
                    empleado_id: Number(empleado_id),
                    fecha,
                    descripcion: descripcion?.trim(),
                    importe: Number(importe),
                    formapago_id: Number(formapago_id),
                    proyecto_id: proyecto_id ? Number(proyecto_id) : null,
                    categoriaegreso_id: Number(categoriaegreso_id),
                    imputacioncontable_id: imputacioncontable_id ? Number(imputacioncontable_id) : null,
                }
            };

            const res = await fetch(`${apiUrl}/pagossueldoempleado/pagar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "No se pudo registrar el pago");

            onCreated?.(json);
            handleClose();
        } catch (err) {
            setMsg({ type: "danger", text: err.message || "Error inesperado" });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Nuevo Pago de Sueldo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!empresa_id && (
                        <Alert variant="warning" className="py-2">
                            Seleccioná una empresa para continuar.
                        </Alert>
                    )}
                    {medioDetectado === "caja" && !caja_id && (
                        <Alert variant="warning" className="py-2">
                            No hay caja abierta. Abrí una caja para pagar en efectivo.
                        </Alert>
                    )}
                    {msg && (
                        <Alert variant={msg.type} className="py-2" onClose={() => setMsg(null)} dismissible>
                            {msg.text}
                        </Alert>
                    )}

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                        </Col>
                        <Col md={8}>
                            <Form.Label>Empleado</Form.Label>
                            <Form.Select
                                value={empleado_id}
                                onChange={(e) => setEmpleadoId(e.target.value)}
                                required
                                className="form-control my-input"
                            >
                                <option value="">Seleccione…</option>
                                {listaEmpleados.map((e) => (
                                    <option key={e.id} value={e.id}>{e.label}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
                        </Col>
                        <Col md={4}>
                            <Form.Label>Importe</Form.Label>
                            <Form.Control type="number" step="0.01" value={importe} onChange={(e) => setImporte(e.target.value)} required />
                        </Col>
                    </Row>


                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Forma de pago</Form.Label>
                            <Form.Select
                                value={formapago_id}
                                onChange={(e) => setFormapagoId(e.target.value)}
                                required
                                className="form-control my-input"
                            >
                                <option value="">Seleccione…</option>
                                {(formasPagoFiltradas || []).map((f) => (
                                    <option key={f.id} value={f.id}>{f.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                                Se detecta automáticamente si es Caja/Efectivo o Banco/Transferencia.
                            </Form.Text>
                        </Col>

                        <Col md={6} className="d-flex align-items-end">
                            <small className="text-muted d-block mt-4">
                                Medio detectado:{" "}
                                {medioDetectado
                                    ? (medioDetectado === "caja"
                                        ? `Caja/Efectivo${caja_id ? ` · Caja #${caja_id}` : ""}`
                                        : "Banco/Transferencia")
                                    : "— seleccione forma de pago —"}
                            </small>
                        </Col>
                    </Row>

                    {medioDetectado === "banco" && (
                        <Row className="mb-3">
                            <Col md={5}>
                                <Form.Label>Banco</Form.Label>
                                <Form.Select
                                    value={banco_id}
                                    onChange={(e) => setBancoId(e.target.value)}
                                    required
                                    className="form-control my-input"
                                    disabled={!empresa_id}
                                >
                                    <option value="">{empresa_id ? "Seleccione…" : "Seleccione empresa primero"}</option>
                                    {bancosEmpresa.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nombre || b.descripcion || b.alias || `Banco ${b.id}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={7}>
                                <Form.Label>Proyecto (opcional)</Form.Label>
                                <Form.Select
                                    value={proyecto_id}
                                    onChange={(e) => setProyectoId(e.target.value)}
                                    className="form-control my-input"
                                >
                                    <option value="">(Ninguno)</option>
                                    {(proyectosTabla || []).map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.descripcion || p.nombre || `Proyecto #${p.id}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    )}

                    {medioDetectado === "caja" && (
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Label>Proyecto (opcional)</Form.Label>
                                <Form.Select
                                    value={proyecto_id}
                                    onChange={(e) => setProyectoId(e.target.value)}
                                    className="form-control my-input"
                                >
                                    <option value="">(Ninguno)</option>
                                    {(proyectosTabla || []).map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.descripcion || p.nombre || `Proyecto #${p.id}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Información</Form.Label>
                                <div className="border rounded px-2 py-2 text-muted bg-light">
                                    {caja_id ? (
                                        <>Caja <strong>#{caja_id}</strong> · Se registrará un egreso en efectivo</>
                                    ) : (
                                        <>Caja no disponible</>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}

                    <Row className="mb-0">
                        <Col md={6}>
                            <Form.Label>Categoría de Egreso</Form.Label>
                            <Form.Select
                                value={categoriaegreso_id}
                                onChange={(e) => setCategoriaId(e.target.value)}
                                required
                                className="form-control my-input"
                            >
                                <option value="">Seleccione…</option>
                                {(categorias || []).map((c) => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-muted">La imputación se deriva automáticamente.</Form.Text>
                        </Col>
                        <Col md={6}>
                            <Form.Label>Imputación (derivada)</Form.Label>
                            <Form.Control value={imputacioncontable_id || ""} readOnly />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleClose} disabled={enviando}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={!puedeGuardar || enviando}>
                        {enviando ? (<><Spinner size="sm" animation="border" className="me-2" /> Guardando…</>) : ("Guardar")}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
