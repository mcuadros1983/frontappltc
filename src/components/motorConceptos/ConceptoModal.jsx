import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Col,
    Form,
    Row,
} from "react-bootstrap";

import {
    ERPButton,
    ERPModal,
} from "../common/erp";

const initialForm = {
    codigo: "",
    nombre: "",
    modo_captura: "SOLO_DATOS",
    activo: true,
};

const normalizeConcepto = (
    concepto
) => ({
    codigo:
        concepto?.codigo ??
        "",
    nombre:
        concepto?.nombre ??
        "",
    modo_captura:
        concepto?.modo_captura ??
        concepto?.modoCaptura ??
        "SOLO_DATOS",
    activo:
        concepto?.activo !== false,
});

const ConceptoModal = ({
    show,
    concepto,
    saving = false,
    onHide,
    onSubmit,
}) => {

    const [
        form,
        setForm,
    ] = useState(initialForm);

    const [
        validationError,
        setValidationError,
    ] = useState("");

    const isEdit =
        Boolean(concepto?.id);

    const title = useMemo(
        () =>
            isEdit
                ? "Editar concepto"
                : "Nuevo concepto",
        [isEdit]
    );

    useEffect(() => {
        if (!show) return;

        setForm(
            concepto
                ? normalizeConcepto(
                    concepto
                )
                : initialForm
        );

        setValidationError("");
    }, [
        show,
        concepto,
    ]);

    const setField = (
        field,
        value
    ) => {
        setForm(
            (current) => ({
                ...current,
                [field]: value,
            })
        );
    };

    const validate = () => {
        if (!form.codigo.trim()) {
            return "El código es obligatorio";
        }

        if (!form.nombre.trim()) {
            return "El nombre es obligatorio";
        }

        if (
            ![
                "SOLO_DATOS",
                "SOLO_ARCHIVOS",
                "DATOS_Y_ARCHIVOS",
            ].includes(
                form.modo_captura
            )
        ) {
            return "El modo de captura no es válido";
        }

        return "";
    };

    const handleSubmit =
        async (event) => {
            event.preventDefault();

            const error =
                validate();

            if (error) {
                setValidationError(
                    error
                );
                return;
            }

            setValidationError("");

            await onSubmit({
                codigo:
                    form.codigo.trim(),
                nombre:
                    form.nombre.trim(),
                modo_captura:
                    form.modo_captura,
                activo:
                    Boolean(form.activo),
            });
        };

    return (
        <ERPModal
            show={show}
            onHide={
                saving
                    ? undefined
                    : onHide
            }
            title={title}
            size="lg"
            footer={
                <>
                    <ERPButton
                        type="cancel"
                        disabled={saving}
                        onClick={onHide}
                    />

                    <ERPButton
                        type="save"
                        disabled={saving}
                        onClick={
                            handleSubmit
                        }
                    >
                        {
                            saving
                                ? "Guardando..."
                                : "Guardar"
                        }
                    </ERPButton>
                </>
            }
        >
            {
                validationError && (
                    <Alert variant="danger">
                        {validationError}
                    </Alert>
                )
            }

            <Form
                onSubmit={
                    handleSubmit
                }
            >
                <Row className="g-3">

                    <Col
                        xs={12}
                        md={4}
                    >
                        <Form.Group>
                            <Form.Label>
                                Código *
                            </Form.Label>

                            <Form.Control
                                value={
                                    form.codigo
                                }
                                maxLength={100}
                                autoFocus
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "codigo",
                                        event.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col
                        xs={12}
                        md={8}
                    >
                        <Form.Group>
                            <Form.Label>
                                Nombre *
                            </Form.Label>

                            <Form.Control
                                value={
                                    form.nombre
                                }
                                maxLength={255}
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "nombre",
                                        event.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col
                        xs={12}
                        md={8}
                    >
                        <Form.Group>
                            <Form.Label>
                                Modo de captura *
                            </Form.Label>

                            <Form.Select
                                className="form-control"
                                value={
                                    form.modo_captura
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "modo_captura",
                                        event.target.value
                                    )
                                }
                            >
                                <option value="SOLO_DATOS">
                                    Solo datos
                                </option>
                                <option value="SOLO_ARCHIVOS">
                                    Solo archivos
                                </option>
                                <option value="DATOS_Y_ARCHIVOS">
                                    Datos y archivos
                                </option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col
                        xs={12}
                        md={4}
                        className="d-flex align-items-end"
                    >
                        <Form.Check
                            type="switch"
                            id="motor-concepto-activo"
                            label="Activo"
                            checked={
                                form.activo
                            }
                            disabled={saving}
                            onChange={(event) =>
                                setField(
                                    "activo",
                                    event.target.checked
                                )
                            }
                        />
                    </Col>

                </Row>
            </Form>
        </ERPModal>
    );
};

export default ConceptoModal;
