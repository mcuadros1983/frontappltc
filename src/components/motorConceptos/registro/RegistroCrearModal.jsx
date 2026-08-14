import React, {
    useContext,
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
} from "../../common/erp";

import Contexts
    from "../../../context";

const getCollection = (
    type,
    dataContext
) => {
    switch (type) {
        case "EMPLEADO":
            return (
                dataContext?.empleados ||
                []
            );

        case "SUCURSAL":
            return (
                dataContext?.sucursales ||
                []
            );

        case "EMPRESA":
            return (
                dataContext?.empresasTabla ||
                []
            );

        default:
            return [];
    }
};

const getLabel = (
    type,
    item
) => {
    if (type === "EMPLEADO") {

        return (
            item.nombre_completo ||
            `${item.nombre || ""} ${item.apellido || ""}`.trim() ||
            item.usuario ||
            `Empleado ${item.id}`
        );
    }

    return (
        item.nombre ||
        item.razon_social ||
        item.descripcion ||
        `${type} ${item.id}`
    );
};

const RegistroCrearModal = ({
    show,
    conceptos = [],
    entidadTipos = [],
    saving,
    onHide,
    onSubmit,
}) => {

    const dataContext =
        useContext(
            Contexts.DataContext
        );

    const [
        conceptoId,
        setConceptoId,
    ] = useState("");

    const [
        entidadTipoId,
        setEntidadTipoId,
    ] = useState("");

    const [
        entidadId,
        setEntidadId,
    ] = useState("");

    const [
        fechaVencimiento,
        setFechaVencimiento,
    ] = useState("");

    const [
        observaciones,
        setObservaciones,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        if (!show) return;

        setConceptoId("");
        setEntidadTipoId("");
        setEntidadId("");
        setFechaVencimiento("");
        setObservaciones("");
        setError("");
    }, [show]);

    const selectedConcept =
        useMemo(
            () =>
                conceptos.find(
                    (item) =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            conceptoId
                        )
                ),
            [
                conceptos,
                conceptoId,
            ]
        );

    const allowedTypeIds =
        useMemo(
            () =>
                new Set(
                    (
                        selectedConcept
                            ?.entidades ||
                        []
                    )
                        .filter(
                            (item) =>
                                item.activo !== false
                        )
                        .map(
                            (item) =>
                                Number(
                                    item.entidad_tipo_id
                                )
                        )
                ),
            [selectedConcept]
        );

    const availableTypes =
        useMemo(
            () =>
                entidadTipos.filter(
                    (item) =>
                        allowedTypeIds.size === 0 ||
                        allowedTypeIds.has(
                            Number(
                                item.id
                            )
                        )
                ),
            [
                entidadTipos,
                allowedTypeIds,
            ]
        );

    const selectedType =
        availableTypes.find(
            (item) =>
                Number(
                    item.id
                ) ===
                Number(
                    entidadTipoId
                )
        );

    const entities =
        getCollection(
            selectedType?.codigo,
            dataContext
        );

    const submit =
        async () => {
            if (
                !conceptoId ||
                !entidadTipoId ||
                !entidadId
            ) {
                setError(
                    "Concepto, tipo de entidad y entidad son obligatorios"
                );
                return;
            }

            await onSubmit({
                concepto_id:
                    Number(
                        conceptoId
                    ),
                entidad_tipo_id:
                    Number(
                        entidadTipoId
                    ),
                entidad_id:
                    Number(
                        entidadId
                    ),
                fecha_vencimiento:
                    fechaVencimiento ||
                    null,
                observaciones:
                    observaciones.trim() ||
                    null,
            });

            onHide();
        };

    return (
        <ERPModal
            show={show}
            onHide={onHide}
            title="Nuevo registro"
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
                        onClick={submit}
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

                <Col xs={12}>
                    <Form.Label>
                        Concepto *
                    </Form.Label>

                    <Form.Select
                    className="form-control"
                        value={
                            conceptoId
                        }
                        disabled={saving}
                        onChange={(event) => {
                            setConceptoId(
                                event.target.value
                            );
                            setEntidadTipoId("");
                            setEntidadId("");
                        }}
                    >
                        <option value="">
                            Seleccionar
                        </option>

                        {
                            conceptos
                                .filter(
                                    (item) =>
                                        item.activo !== false
                                )
                                .map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.nombre
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
                        Tipo de entidad *
                    </Form.Label>

                    <Form.Select
                    className="form-control"
                        value={
                            entidadTipoId
                        }
                        disabled={
                            saving ||
                            !conceptoId
                        }
                        onChange={(event) => {
                            setEntidadTipoId(
                                event.target.value
                            );
                            setEntidadId("");
                        }}
                    >
                        <option value="">
                            Seleccionar
                        </option>

                        {
                            availableTypes.map(
                                (item) => (
                                    <option
                                        key={
                                            item.id
                                        }
                                        value={
                                            item.id
                                        }
                                    >
                                        {
                                            item.nombre
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
                        Entidad *
                    </Form.Label>

                    <Form.Select
                    className="form-control"
                        value={
                            entidadId
                        }
                        disabled={
                            saving ||
                            !entidadTipoId
                        }
                        onChange={(event) =>
                            setEntidadId(
                                event.target.value
                            )
                        }
                    >
                        <option value="">
                            Seleccionar
                        </option>

                        {
                            entities.map(
                                (item) => (
                                    <option
                                        key={
                                            item.id
                                        }
                                        value={
                                            item.id
                                        }
                                    >
                                        {
                                            getLabel(
                                                selectedType
                                                    ?.codigo,
                                                item
                                            )
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
                        Fecha de vencimiento
                    </Form.Label>

                    <Form.Control
                        type="date"
                        value={
                            fechaVencimiento
                        }
                        disabled={saving}
                        onChange={(event) =>
                            setFechaVencimiento(
                                event.target.value
                            )
                        }
                    />
                </Col>

                <Col xs={12}>
                    <Form.Label>
                        Observaciones
                    </Form.Label>

                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={
                            observaciones
                        }
                        disabled={saving}
                        onChange={(event) =>
                            setObservaciones(
                                event.target.value
                            )
                        }
                    />
                </Col>

            </Row>
        </ERPModal>
    );
};

export default RegistroCrearModal;
