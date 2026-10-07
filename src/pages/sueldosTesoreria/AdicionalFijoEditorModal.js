import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const apiUrl = process.env.REACT_APP_API_URL;

export default function AdicionalFijoEditorModal({ show, onClose, mode, tipo, empresa_id, vigente }) {
    const isCreate = mode === "create";
    const isNuevoValor = mode === "valor";
    const isEdit = mode === "edit_valor";
    // campos
    const [descripcion, setDescripcion] = useState("");
    const [monto, setMonto] = useState("");
    const [vigenciaDesde, setVigenciaDesde] = useState("");
    const [vigenciaHasta, setVigenciaHasta] = useState(""); // opcional (normalmente null para el abierto)
    // const [cerrarActual, setCerrarActual] = useState(true); // cerrar vigente anterior cuando hay nuevo valor
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        setErr(null);

        if (isCreate) {

            setDescripcion("");
            setMonto("");
            setVigenciaDesde("");
            setVigenciaHasta("");

        } else if (isNuevoValor) {

            setDescripcion(
                tipo?.descripcion || ""
            );

            setMonto("");
            setVigenciaDesde("");
            setVigenciaHasta("");

        } else if (isEdit) {

            setDescripcion(
                tipo?.descripcion || ""
            );

            setMonto(
                vigente
                    ? String(vigente.monto)
                    : ""
            );

            setVigenciaDesde(
                vigente?.vigencia_desde || ""
            );

            setVigenciaHasta(
                vigente?.vigencia_hasta || ""
            );
        }
    }, [
        isCreate,
        isNuevoValor,
        isEdit,
        tipo,
        vigente
    ]);

    const crearTipoYValor = async () => {
        // 1) crear tipo
        const payloadTipo = { descripcion: descripcion?.trim() || null, ...(empresa_id ? { empresa_id } : {}) };
        const r = await fetch(`${apiUrl}/adicionalfijotipo`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadTipo), credentials: "include",
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
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadValor), credentials: "include",
        });
        if (!rv.ok) throw new Error("Error creando el valor");
    };

    const editarTipo = async () => {
        const payload = { descripcion: descripcion?.trim() || null, ...(empresa_id ? { empresa_id } : {}) };
        const r = await fetch(`${apiUrl}/adicionalfijotipo/${tipo.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "include",
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
            credentials: "include"
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
            credentials: "include"
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

            const montoNumero = Number(monto);

            if (isCreate) {

                if (!descripcion?.trim()) {
                    throw new Error(
                        "La descripción es requerida."
                    );
                }

                if (!vigenciaDesde) {
                    throw new Error(
                        "La vigencia desde es requerida."
                    );
                }

                if (
                    !Number.isFinite(montoNumero) ||
                    montoNumero <= 0
                ) {
                    throw new Error(
                        "El monto debe ser mayor a cero."
                    );
                }

                await crearTipoYValor();


            } else if (isNuevoValor) {

                if (!vigenciaDesde) {
                    throw new Error(
                        "La vigencia desde es requerida."
                    );
                }

                if (
                    !Number.isFinite(montoNumero) ||
                    montoNumero <= 0
                ) {
                    throw new Error(
                        "El monto debe ser mayor a cero."
                    );
                }

                await crearNuevoValor();


            } else if (isEdit) {

                if (!descripcion?.trim()) {
                    throw new Error(
                        "La descripción es requerida."
                    );
                }

                if (!vigente?.id) {
                    throw new Error(
                        "No se encontró el valor a editar."
                    );
                }

                if (!vigenciaDesde) {
                    throw new Error(
                        "La vigencia desde es requerida."
                    );
                }

                if (
                    !Number.isFinite(montoNumero) ||
                    montoNumero <= 0
                ) {
                    throw new Error(
                        "El monto debe ser mayor a cero."
                    );
                }


                // Primero modificamos el tipo/nombre.
                await editarTipo();

                // Después modificamos esta versión.
                await editarValorActual();
            }


            onClose(true);

        } catch (e) {

            console.error(e);

            setErr(
                e.message ||
                "No se pudo guardar."
            );

        } finally {

            setSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={() => onClose(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isCreate &&
                        "Crear adicional"}

                    {isNuevoValor &&
                        `Nuevo valor para: ${tipo?.descripcion}`}

                    {isEdit &&
                        `Editar adicional: ${tipo?.descripcion}`}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {err && <div className="alert alert-danger py-2">{err}</div>}

                <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                        value={descripcion}
                        onChange={(e) =>
                            setDescripcion(e.target.value)
                        }
                        disabled={isNuevoValor}
                        placeholder="Ej.: Jefatura"
                    />
                </Form.Group>

                {(isCreate || isNuevoValor || isEdit) && (
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
                        {/* 
                        {isNuevoValor && vigente && (
                            <Form.Check
                                type="checkbox"
                                checked={cerrarActual}
                                onChange={(e) => setCerrarActual(e.target.checked)}
                                label="Finalizar el monto actual con la nueva fecha de vigencia"
                                className="mb-2"
                            />
                        )} */}
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
