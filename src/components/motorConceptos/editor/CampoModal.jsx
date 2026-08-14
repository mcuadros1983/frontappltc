import React, {
    useEffect,
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
} from "../../common/erp";

const TIPOS = [
    "TEXT",
    "TEXTAREA",
    "INTEGER",
    "DECIMAL",
    "BOOLEAN",
    "DATE",
    "DATETIME",
    "TIME",
    "EMAIL",
    "PHONE",
    "URL",
    "COLOR",
    "PASSWORD",
    "JSON",
    "LISTA",
    "RELACION",
    "IMAGEN",
    "FIRMA",
    "COORDENADAS",
];

const initialForm = {
    codigo: "",
    etiqueta: "",
    tipo: "TEXT",
    obligatorio: false,
    orden: 0,
    ancho: 12,
    placeholder: "",
    ayuda: "",
    solo_lectura: false,
    visible: true,
    valor_defecto: "",
    activo: true,
};

const CampoModal = ({
    show,
    campo,
    saving,
    onHide,
    onSubmit,
}) => {

    const [
        form,
        setForm,
    ] = useState(
        initialForm
    );

    const [
        validationError,
        setValidationError,
    ] = useState("");

    useEffect(() => {
        if (!show) return;

        setForm({
            ...initialForm,
            ...campo,
            configuracion:
                campo?.configuracion ||
                {},
        });

        setValidationError("");
    }, [
        show,
        campo,
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

    const handleSubmit =
        async (event) => {
            event.preventDefault();

            if (
                !String(
                    form.codigo
                ).trim()
            ) {
                setValidationError(
                    "El código es obligatorio"
                );
                return;
            }

            if (
                !String(
                    form.etiqueta
                ).trim()
            ) {
                setValidationError(
                    "La etiqueta es obligatoria"
                );
                return;
            }

            setValidationError("");

            await onSubmit({
                ...form,
                codigo:
                    String(
                        form.codigo
                    ).trim(),
                etiqueta:
                    String(
                        form.etiqueta
                    ).trim(),
                orden:
                    Number(
                        form.orden || 0
                    ),
                ancho:
                    Number(
                        form.ancho || 12
                    ),
                placeholder:
                    form.placeholder ||
                    null,
                ayuda:
                    form.ayuda ||
                    null,
                valor_defecto:
                    form.valor_defecto ||
                    null,
                configuracion:
                    form.configuracion ||
                    {},
            });
        };

    return (
        <ERPModal
            show={show}
            onHide={onHide}
            title={
                campo?.id
                    ? "Editar campo"
                    : "Nuevo campo"
            }
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
                    />
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

            <Form>
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
                                Etiqueta *
                            </Form.Label>

                            <Form.Control
                                value={
                                    form.etiqueta
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "etiqueta",
                                        event.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col
                        xs={12}
                        md={4}
                    >
                        <Form.Group>
                            <Form.Label>
                                Tipo
                            </Form.Label>

                            <Form.Select
                                className="form-control"
                                value={
                                    form.tipo
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "tipo",
                                        event.target.value
                                    )
                                }
                            >
                                {
                                    TIPOS.map(
                                        (tipo) => (
                                            <option
                                                key={
                                                    tipo
                                                }
                                                value={
                                                    tipo
                                                }
                                            >
                                                {tipo}
                                            </option>
                                        )
                                    )
                                }
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col
                        xs={6}
                        md={4}
                    >
                        <Form.Group>
                            <Form.Label>
                                Orden
                            </Form.Label>

                            <Form.Control
                                type="number"
                                value={
                                    form.orden
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "orden",
                                        event.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col
                        xs={6}
                        md={4}
                    >
                        <Form.Group>
                            <Form.Label>
                                Ancho
                            </Form.Label>

                            <Form.Control
                                type="number"
                                min={1}
                                max={12}
                                value={
                                    form.ancho
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "ancho",
                                        event.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col
                        xs={12}
                        md={6}
                    >
                        <Form.Group>
                            <Form.Label>
                                Placeholder
                            </Form.Label>

                            <Form.Control
                                value={
                                    form.placeholder
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "placeholder",
                                        event.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col
                        xs={12}
                        md={6}
                    >
                        <Form.Group>
                            <Form.Label>
                                Valor por defecto
                            </Form.Label>

                            <Form.Control
                                value={
                                    form.valor_defecto
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "valor_defecto",
                                        event.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <Form.Group>
                            <Form.Label>
                                Ayuda
                            </Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={
                                    form.ayuda
                                }
                                disabled={saving}
                                onChange={(event) =>
                                    setField(
                                        "ayuda",
                                        event.target.value
                                    )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12}>
                        <div className="d-flex flex-wrap gap-3">
                            <Form.Check
                                type="switch"
                                label="Obligatorio"
                                checked={
                                    form.obligatorio
                                }
                                onChange={(event) =>
                                    setField(
                                        "obligatorio",
                                        event.target.checked
                                    )
                                }
                            />

                            <Form.Check
                                type="switch"
                                label="Solo lectura"
                                checked={
                                    form.solo_lectura
                                }
                                onChange={(event) =>
                                    setField(
                                        "solo_lectura",
                                        event.target.checked
                                    )
                                }
                            />

                            <Form.Check
                                type="switch"
                                label="Visible"
                                checked={
                                    form.visible
                                }
                                onChange={(event) =>
                                    setField(
                                        "visible",
                                        event.target.checked
                                    )
                                }
                            />

                            <Form.Check
                                type="switch"
                                label="Activo"
                                checked={
                                    form.activo
                                }
                                onChange={(event) =>
                                    setField(
                                        "activo",
                                        event.target.checked
                                    )
                                }
                            />
                        </div>
                    </Col>

                </Row>
            </Form>
        </ERPModal>
    );
};

export default CampoModal;
