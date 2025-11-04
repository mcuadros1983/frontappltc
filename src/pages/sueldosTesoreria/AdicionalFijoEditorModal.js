import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdicionalFijoEditorModal({ show, onClose, mode, tipo, empresa_id, vigente }) {
    const isCreate = mode === "create";
    const isEditTipo = mode === "edit";
    const isNuevoValor = mode === "valor";
    const isEditValor = mode === "edit_valor"; // 👈 NUEVO
    // campos
    const [descripcion, setDescripcion] = useState("");
    const [monto, setMonto] = useState("");
    const [vigenciaDesde, setVigenciaDesde] = useState("");
    const [vigenciaHasta, setVigenciaHasta] = useState(""); // opcional (normalmente null para el abierto)
    const [cerrarActual, setCerrarActual] = useState(true); // cerrar vigente anterior cuando hay nuevo valor
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        setErr(null);

        if (isCreate) {
            setDescripcion("");
            setMonto("");
            setVigenciaDesde("");
            setVigenciaHasta("");
            setCerrarActual(true);
        } else if (isEditTipo) {
            setDescripcion(tipo?.descripcion || "");
        } else if (isNuevoValor) {
            setDescripcion(tipo?.descripcion || "");
            setMonto("");
            setVigenciaDesde("");
            setVigenciaHasta("");
            setCerrarActual(true);
        } else if (isEditValor) {
            setDescripcion(tipo?.descripcion || "");
            setMonto(vigente ? String(vigente.monto) : "");
            setVigenciaDesde(vigente?.vigencia_desde || "");
            setVigenciaHasta(vigente?.vigencia_hasta || ""); // normalmente null/"" en abierto
        }
    }, [isCreate, isEditTipo, isNuevoValor, isEditValor, tipo, vigente]);

    const crearTipoYValor = async () => {
        // 1) crear tipo
        const payloadTipo = { descripcion: descripcion?.trim() || null, ...(empresa_id ? { empresa_id } : {}) };
        const r = await fetch(`${apiUrl}/adicionalfijotipo`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadTipo), credentials:"include",
        });
        if (!r.ok) throw new Error("Error creando el tipo");
        const nuevoTipo = await r.json();

        // 2) crear valor
        const payloadValor = {
            adicionalfijotipo_id: nuevoTipo.id,
            vigencia_desde: vigenciaDesde,
            vigencia_hasta: null,
            monto: Number(monto),
        };
        const rv = await fetch(`${apiUrl}/adicionalfijovalor`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadValor), credentials:"include",
        });
        if (!rv.ok) throw new Error("Error creando el valor");
    };

    const editarTipo = async () => {
        const payload = { descripcion: descripcion?.trim() || null, ...(empresa_id ? { empresa_id } : {}) };
        const r = await fetch(`${apiUrl}/adicionalfijotipo/${tipo.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials:"include",
        });
        if (!r.ok) throw new Error("Error editando el tipo");
    };

    const editarValorActual = async () => {
        if (!vigente?.id) throw new Error("No se encontró el valor vigente.");
        const payload = {
            monto: Number(monto),
            vigencia_desde: vigenciaDesde || null,
            // si quisieras permitir tocar la fecha de cierre del abierto, descomenta:
            // vigencia_hasta: vigenciaHasta || null,
        };
        const r = await fetch(`${apiUrl}/adicionalfijovalor/${vigente.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials:"include"
        });
        if (!r.ok) {
            const e = await r.json().catch(() => ({}));
            throw new Error(e?.error || "No se pudo actualizar el valor.");
        }
    };

    const crearNuevoValor = async () => {
        const payload = {
            adicionalfijotipo_id: tipo.id,
            vigencia_desde: vigenciaDesde,
            monto: Number(monto),
        };
        const r = await fetch(`${apiUrl}/adicionalfijovalor/seguro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials:"include"
        });
        if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err?.error || "Error creando el nuevo valor");
        }
    };

    const onSave = async () => {
        try {
            setSaving(true);
            setErr(null);

            if (isCreate) {
                if (!descripcion?.trim() || !vigenciaDesde || !monto) {
                    throw new Error("Completá descripción, vigencia y monto.");
                }
                await crearTipoYValor();
            } else if (isEditTipo) {
                if (!descripcion?.trim()) throw new Error("La descripción es requerida.");
                await editarTipo();
            } else if (isNuevoValor) {
                if (!vigenciaDesde || !monto) throw new Error("Completá vigencia y monto.");
                await crearNuevoValor();
            } else if (isEditValor) {
                if (!vigenciaDesde || !monto) throw new Error("Completá vigencia y monto.");
                await editarValorActual();
            }

            onClose(true);
        } catch (e) {
            console.error(e);
            setErr(e.message || "No se pudo guardar.");
        } finally {
            setSaving(false);
        }
    };
    return (
        <Modal show={show} onHide={() => onClose(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isCreate && "Crear adicional (tipo + valor inicial)"}
                    {isEditTipo && `Editar tipo: ${tipo?.descripcion}`}
                    {isNuevoValor && `Nuevo valor para: ${tipo?.descripcion}`}
                    {isEditValor && `Editar valor vigente de: ${tipo?.descripcion}`} {/* 👈 */}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {err && <div className="alert alert-danger py-2">{err}</div>}

                <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        disabled={!isCreate && !isEditTipo} // bloqueada en valor/editar valor
                        placeholder="Ej.: Jefatura"
                    />
                </Form.Group>

                {(isCreate || isNuevoValor || isEditValor) && (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Vigencia desde</Form.Label>
                            <Form.Control
                                type="date"
                                value={vigenciaDesde}
                                onChange={(e) => setVigenciaDesde(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Monto</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                placeholder="0.00"
                            />
                        </Form.Group>

                        {/* Si quisieras permitir tocar vigencia_hasta del vigente, mostrala aquí:
            <Form.Group className="mb-3">
              <Form.Label>Vigencia hasta</Form.Label>
              <Form.Control
                type="date"
                value={vigenciaHasta || ""}
                onChange={(e) => setVigenciaHasta(e.target.value)}
              />
            </Form.Group>
            */}

                        {isNuevoValor && vigente && (
                            <Form.Check
                                type="checkbox"
                                checked={cerrarActual}
                                onChange={(e) => setCerrarActual(e.target.checked)}
                                label="Finalizar el monto actual con la nueva fecha de vigencia"
                                className="mb-2"
                            />
                        )}
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => onClose(false)} disabled={saving}>
                    Cancelar
                </Button>
                <Button onClick={onSave} disabled={saving}>
                    {saving ? (<><Spinner size="sm" className="me-2" />Guardando…</>) : "Guardar"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
