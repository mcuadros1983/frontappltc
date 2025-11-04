// src/components/tesoreria/ComprasNoProveedores.jsx
import React, { useContext, useMemo, useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import Contexts from "../../context/Contexts";

/**
 * Componente para registrar egresos de caja SIN proveedor (Compras No Proveedores).
 *
 * Props:
 * - endpoint?: string -> URL del POST (default: "/movimientos-caja-tesoreria/egresos-independientes")
 * - categorias?: Array<{id:number, nombre:string, imputacioncontable_id?:number}>
 * - onCreated?: (res) => void  -> callback al crear OK
 */
export default function ComprasNoProveedores({
    endpoint = "/movimientos-caja-tesoreria/egresos-independientes",
    categorias = [],
    onCreated,
}) {
    const { DataContext } = Contexts;
    const data = useContext(DataContext) || {};
    const {
        empresaSeleccionada,
        cajaAbierta,
        formasPagoTesoreria = [],
        categoriasEgresoTabla = [], // si lo tenés en el contexto
    } = data;

    // Fuente de categorías: prop > contexto
    const categoriasSrc = useMemo(
        () => (categorias && categorias.length > 0 ? categorias : categoriasEgresoTabla || []),
        [categorias, categoriasEgresoTabla]
    );

    // Estado del formulario
    const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
    const [descripcion, setDescripcion] = useState("");
    const [categoriaegreso_id, setCategoriaId] = useState("");
    const [imputacioncontable_id, setImputacionId] = useState("");
    const [monto, setMonto] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const [enviando, setEnviando] = useState(false);
    const [msg, setMsg] = useState(null); // {type:'success'|'danger'|'warning', text:string}

    // Autocompletar imputación desde la categoría elegida
    useEffect(() => {
        if (!categoriaegreso_id) return;
        const cat = categoriasSrc.find((c) => Number(c.id) === Number(categoriaegreso_id));
        if (cat?.imputacioncontable_id) {
            setImputacionId(String(cat.imputacioncontable_id));
        }
    }, [categoriaegreso_id, categoriasSrc]);

    // Detectar formapago "Caja/Efectivo" si existe
    const formaPagoCajaId = useMemo(() => {
        const match = (formasPagoTesoreria || []).find((f) =>
            /(caja|efectivo)/i.test(String(f.descripcion || ""))
        );
        return match?.id || null;
    }, [formasPagoTesoreria]);

    const empresa_id = empresaSeleccionada?.id || null;
    const caja_id = cajaAbierta?.caja?.id || null;

    const puedeGuardar = useMemo(() => {
        if (!empresa_id || !caja_id) return false;
        if (!descripcion?.trim()) return false;
        const nMonto = Number(monto);
        if (!nMonto || nMonto <= 0) return false;
        // Requerimos imputación (directa o derivada de categoría)
        if (!imputacioncontable_id && !categoriaegreso_id) return false;
        return true;
    }, [empresa_id, caja_id, descripcion, monto, imputacioncontable_id, categoriaegreso_id]);

    const limpiar = () => {
        setFecha(new Date().toISOString().slice(0, 10));
        setDescripcion("");
        setCategoriaId("");
        setImputacionId("");
        setMonto("");
        setObservaciones("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);

        if (!puedeGuardar) {
            setMsg({ type: "warning", text: "Completá los campos requeridos." });
            return;
        }
        if (!formaPagoCajaId) {
            setMsg({
                type: "warning",
                text: "No se encontró una forma de pago de Caja/Efectivo en el catálogo. Se enviará sin formapago_id.",
            });
        }

        const payload = {
            empresa_id,
            egreso: {
                fecha,
                caja_id,
                monto: Number(monto),
                descripcion: descripcion.trim(),
                categoriaegreso_id: categoriaegreso_id ? Number(categoriaegreso_id) : null,
                imputacioncontable_id: imputacioncontable_id ? Number(imputacioncontable_id) : null,
                observaciones: observaciones?.trim() || null,
                proveedor_id: null,          // SIN proveedor
                formapago_id: formaPagoCajaId || null, // opcional
            },
            // idempotencyKey opcional:
            // idempotencyKey: crypto.randomUUID()
        };

        try {
            setEnviando(true);
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "No se pudo registrar el egreso");

            setMsg({ type: "success", text: "Egreso de caja registrado correctamente." });
            onCreated?.(json);
            limpiar();
        } catch (err) {
            setMsg({ type: "danger", text: err.message || "Error inesperado" });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Container fluid className="p-3 border rounded">
            <h5 className="mb-3">Compras No Proveedores</h5>

            {!empresa_id && (
                <Alert variant="warning" className="py-2">
                    Seleccioná una empresa para continuar.
                </Alert>
            )}
            {!caja_id && (
                <Alert variant="warning" className="py-2">
                    No hay caja abierta. Abrí una caja para registrar egresos en efectivo.
                </Alert>
            )}
            {msg && (
                <Alert
                    variant={msg.type}
                    className="py-2"
                    onClose={() => setMsg(null)}
                    dismissible
                >
                    {msg.text}
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={9}>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                placeholder="Ej: Compra insumos de ferretería"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Categoría de Egreso</Form.Label>
                            <Form.Select
                                value={categoriaegreso_id}
                                onChange={(e) => setCategoriaId(e.target.value)}
                                className="form-control my-input"
                            >
                                <option value="">(Opcional) Seleccionar…</option>
                                {categoriasSrc.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                                Si la categoría tiene imputación predefinida, se completa abajo.
                            </Form.Text>
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Imputación Contable</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="ID imputación (opcional si elegís categoría con imputación)"
                                value={imputacioncontable_id}
                                onChange={(e) => setImputacionId(e.target.value)}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Monto</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="(Opcional) Detalles adicionales"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                    />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="text-muted">
                        Caja seleccionada:{" "}
                        {caja_id ? (
                            <strong>#{caja_id}</strong>
                        ) : (
                            <span className="text-danger">Sin caja abierta</span>
                        )}
                        {" · "}Forma de pago:{" "}
                        {formaPagoCajaId ? (
                            <strong>Caja/Efectivo</strong>
                        ) : (
                            <span className="text-warning">No detectada</span>
                        )}
                    </div>

                    <div>
                        <Button
                            type="button"
                            variant="outline-secondary"
                            className="me-2"
                            onClick={limpiar}
                            disabled={enviando}
                        >
                            Limpiar
                        </Button>
                        <Button type="submit" variant="primary" disabled={!puedeGuardar || enviando}>
                            {enviando ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Guardando…
                                </>
                            ) : (
                                "Guardar egreso"
                            )}
                        </Button>
                    </div>
                </div>
            </Form>
        </Container>
    );
}
