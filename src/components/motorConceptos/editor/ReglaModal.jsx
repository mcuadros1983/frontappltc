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
    "VISIBLE_CUANDO",
    "OBLIGATORIO_CUANDO",
    "SOLO_LECTURA_CUANDO",
];

const OPERADORES = [
    "IGUAL",
    "DISTINTO",
    "MAYOR",
    "MAYOR_IGUAL",
    "MENOR",
    "MENOR_IGUAL",
    "CONTIENE",
    "NO_CONTIENE",
    "EN",
    "NO_EN",
    "VACIO",
    "NO_VACIO",
];

const initialForm = {
    campo_destino_id: "",
    campo_origen_id: "",
    tipo_regla:
        "VISIBLE_CUANDO",
    operador:
        "IGUAL",
    valor_comparacion: "",
    prioridad: 0,
    activo: true,
};

const ReglaModal = ({
    show,
    item,
    campos = [],
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
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        if (!show) return;

        setForm({
            ...initialForm,
            ...item,
            campo_destino_id:
                item?.campo_destino_id ||
                "",
            campo_origen_id:
                item?.campo_origen_id ||
                "",
            valor_comparacion:
                item?.valor_comparacion ===
                    null ||
                    item?.valor_comparacion ===
                    undefined
                    ? ""
                    : typeof item.valor_comparacion ===
                        "string"
                        ? item.valor_comparacion
                        : JSON.stringify(
                            item.valor_comparacion
                        ),
        });

        setError("");
    }, [
        show,
        item,
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

    const save =
        async () => {
            if (
                !form.campo_destino_id ||
                !form.campo_origen_id
            ) {
                setError(
                    "Origen y destino son obligatorios"
                );
                return;
            }

            if (
                Number(
                    form.campo_destino_id
                ) ===
                Number(
                    form.campo_origen_id
                )
            ) {
                setError(
                    "Origen y destino no pueden ser el mismo campo"
                );
                return;
            }

            let valor =
                form.valor_comparacion;

            if (
                [
                    "VACIO",
                    "NO_VACIO",
                ].includes(
                    form.operador
                )
            ) {
                valor = null;
            } else if (
                typeof valor ===
                "string"
            ) {
                const trimmed =
                    valor.trim();

                if (!trimmed) {
                    valor = null;
                } else {
                    try {
                        valor =
                            JSON.parse(
                                trimmed
                            );
                    } catch (_) {
                        valor =
                            trimmed;
                    }
                }
            }

            await onSubmit({
                campo_destino_id:
                    Number(
                        form.campo_destino_id
                    ),
                campo_origen_id:
                    Number(
                        form.campo_origen_id
                    ),
                tipo_regla:
                    form.tipo_regla,
                operador:
                    form.operador,
                valor_comparacion:
                    valor,
                prioridad:
                    Number(
                        form.prioridad || 0
                    ),
                activo:
                    Boolean(
                        form.activo
                    ),
            });
        };

    return (
        <ERPModal
            show={show}
            onHide={onHide}
            title={
                item?.id
                    ? "Editar regla"
                    : "Nueva regla"
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
                        onClick={save}
                    />
                </>
            }
        >
            {
                error && (
                    <Alert variant="danger">
                        {error}
                    </Alert>
                )
            }

            <Row className="g-3">

                <Col
                    xs={12}
                    md={6}
                >
                    <Form.Label>
                        Campo origen
                    </Form.Label>
                    <Form.Select
                        className="form-control"
                        value={
                            form.campo_origen_id
                        }
                        onChange={(event) =>
                            setField(
                                "campo_origen_id",
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Seleccionar
                        </option>
                        {
                            campos.map(
                                (campo) => (
                                    <option
                                        key={
                                            campo.id
                                        }
                                        value={
                                            campo.id
                                        }
                                    >
                                        {
                                            campo.etiqueta
                                        }
                                    </option>
                                )
                            )
                        }
                    </Form.Select>
                </Col>

                <Col
                    xs={12}
                    md={6}
                >
                    <Form.Label>
                        Campo destino
                    </Form.Label>
                    <Form.Select
                        className="form-control"
                        value={
                            form.campo_destino_id
                        }
                        onChange={(event) =>
                            setField(
                                "campo_destino_id",
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Seleccionar
                        </option>
                        {
                            campos.map(
                                (campo) => (
                                    <option
                                        key={
                                            campo.id
                                        }
                                        value={
                                            campo.id
                                        }
                                    >
                                        {
                                            campo.etiqueta
                                        }
                                    </option>
                                )
                            )
                        }
                    </Form.Select>
                </Col>

                <Col
                    xs={12}
                    md={6}
                >
                    <Form.Label>
                        Tipo de regla
                    </Form.Label>
                    <Form.Select
                        className="form-control"
                        value={
                            form.tipo_regla
                        }
                        onChange={(event) =>
                            setField(
                                "tipo_regla",
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
                                    >
                                        {tipo}
                                    </option>
                                )
                            )
                        }
                    </Form.Select>
                </Col>

                <Col
                    xs={12}
                    md={6}
                >
                    <Form.Label>
                        Operador
                    </Form.Label>
                    <Form.Select
                        className="form-control"
                        value={
                            form.operador
                        }
                        onChange={(event) =>
                            setField(
                                "operador",
                                event.target.value
                            )
                        }
                    >
                        {
                            OPERADORES.map(
                                (operador) => (
                                    <option
                                        key={
                                            operador
                                        }
                                    >
                                        {
                                            operador
                                        }
                                    </option>
                                )
                            )
                        }
                    </Form.Select>
                </Col>

                <Col
                    xs={12}
                    md={8}
                >
                    <Form.Label>
                        Valor de comparación
                    </Form.Label>
                    <Form.Control
                        value={
                            form.valor_comparacion
                        }
                        disabled={
                            [
                                "VACIO",
                                "NO_VACIO",
                            ].includes(
                                form.operador
                            )
                        }
                        onChange={(event) =>
                            setField(
                                "valor_comparacion",
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    md={4}
                >
                    <Form.Label>
                        Prioridad
                    </Form.Label>
                    <Form.Control
                        type="number"
                        value={
                            form.prioridad
                        }
                        onChange={(event) =>
                            setField(
                                "prioridad",
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col xs={12}>
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
                </Col>

            </Row>
        </ERPModal>
    );
};

export default ReglaModal;
