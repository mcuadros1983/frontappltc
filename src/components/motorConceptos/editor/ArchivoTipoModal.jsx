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

const initialForm = {
    codigo: "",
    nombre: "",
    descripcion: "",
    obligatorio: false,
    permite_multiples: false,
    extensiones_permitidas: "",
    mime_types_permitidos: "",
    tamanio_maximo_mb: "",
    orden: 0,
    activo: true,
};

const splitValues = (value) =>
    String(value || "")
        .split(",")
        .map((item) =>
            item.trim()
        )
        .filter(Boolean);

const ArchivoTipoModal = ({
    show,
    item,
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
            extensiones_permitidas:
                Array.isArray(
                    item?.extensiones_permitidas
                )
                    ? item.extensiones_permitidas
                        .join(", ")
                    : "",
            mime_types_permitidos:
                Array.isArray(
                    item?.mime_types_permitidos
                )
                    ? item.mime_types_permitidos
                        .join(", ")
                    : "",
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
                !form.codigo.trim() ||
                !form.nombre.trim()
            ) {
                setError(
                    "Código y nombre son obligatorios"
                );
                return;
            }

            await onSubmit({
                ...form,
                codigo:
                    form.codigo.trim(),
                nombre:
                    form.nombre.trim(),
                descripcion:
                    form.descripcion ||
                    null,
                extensiones_permitidas:
                    splitValues(
                        form.extensiones_permitidas
                    ),
                mime_types_permitidos:
                    splitValues(
                        form.mime_types_permitidos
                    ),
                tamanio_maximo_mb:
                    form.tamanio_maximo_mb === ""
                        ? null
                        : Number(
                            form.tamanio_maximo_mb
                        ),
                orden:
                    Number(
                        form.orden || 0
                    ),
            });
        };

    return (
        <ERPModal
            show={show}
            onHide={onHide}
            title={
                item?.id
                    ? "Editar tipo de archivo"
                    : "Nuevo tipo de archivo"
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
                    md={4}
                >
                    <Form.Label>
                        Código *
                    </Form.Label>
                    <Form.Control
                        value={
                            form.codigo
                        }
                        onChange={(event) =>
                            setField(
                                "codigo",
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    md={8}
                >
                    <Form.Label>
                        Nombre *
                    </Form.Label>
                    <Form.Control
                        value={
                            form.nombre
                        }
                        onChange={(event) =>
                            setField(
                                "nombre",
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col xs={12}>
                    <Form.Label>
                        Descripción
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={
                            form.descripcion
                        }
                        onChange={(event) =>
                            setField(
                                "descripcion",
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    md={6}
                >
                    <Form.Label>
                        Extensiones permitidas
                    </Form.Label>
                    <Form.Control
                        value={
                            form.extensiones_permitidas
                        }
                        placeholder=".pdf, .jpg, .png"
                        onChange={(event) =>
                            setField(
                                "extensiones_permitidas",
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    md={6}
                >
                    <Form.Label>
                        MIME types permitidos
                    </Form.Label>
                    <Form.Control
                        value={
                            form.mime_types_permitidos
                        }
                        placeholder="application/pdf, image/jpeg"
                        onChange={(event) =>
                            setField(
                                "mime_types_permitidos",
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    md={6}
                >
                    <Form.Label>
                        Tamaño máximo MB
                    </Form.Label>
                    <Form.Control
                        type="number"
                        min={1}
                        value={
                            form.tamanio_maximo_mb
                        }
                        onChange={(event) =>
                            setField(
                                "tamanio_maximo_mb",
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    md={6}
                >
                    <Form.Label>
                        Orden
                    </Form.Label>
                    <Form.Control
                        type="number"
                        value={
                            form.orden
                        }
                        onChange={(event) =>
                            setField(
                                "orden",
                                event.target.value
                            )
                        }
                    />
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
                            label="Permite múltiples"
                            checked={
                                form.permite_multiples
                            }
                            onChange={(event) =>
                                setField(
                                    "permite_multiples",
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
        </ERPModal>
    );
};

export default ArchivoTipoModal;
