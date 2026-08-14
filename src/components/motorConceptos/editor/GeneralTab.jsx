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
} from "../../common/erp";

const GeneralTab = ({
    concepto,
    entidadTipos = [],
    saving = false,
    canConfig = false,
    onSave,
}) => {

    const [
        form,
        setForm,
    ] = useState(null);

    const [
        validationError,
        setValidationError,
    ] = useState("");

    useEffect(() => {
        if (!concepto) return;

        setForm({
            codigo:
                concepto.codigo ||
                "",
            nombre:
                concepto.nombre ||
                "",
            descripcion:
                concepto.descripcion ||
                "",
            modo_captura:
                concepto.modo_captura ||
                "DATOS_Y_ARCHIVOS",
            permite_multiples:
                Boolean(
                    concepto.permite_multiples
                ),
            usa_versiones:
                concepto.usa_versiones !== false,
            usa_vencimiento:
                Boolean(
                    concepto.usa_vencimiento
                ),
            dias_alerta_vencimiento:
                concepto.dias_alerta_vencimiento ??
                "",
            activo:
                concepto.activo !== false,
            entidad_tipo_ids:
                Array.isArray(
                    concepto.entidades
                )
                    ? concepto.entidades
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
                    : [],

            obligatorio:
                Array.isArray(
                    concepto.entidades
                )
                    ? concepto.entidades
                        .some(
                            (item) =>
                                item.activo !== false &&
                                item.obligatorio === true
                        )
                    : false,
        });
    }, [concepto]);

    if (!form) return null;

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

    const toggleEntidad = (
        id
    ) => {

        const numericId =
            Number(id);

        setForm(
            (current) => {

                const seleccionada =
                    current.entidad_tipo_ids
                        .includes(
                            numericId
                        );

                /*
                 * Si se deselecciona la entidad actual:
                 *
                 * - dejamos el array vacío
                 * - obligatorio vuelve a false
                 *
                 * Esto habilitará nuevamente
                 * las demás entidades.
                 */
                if (
                    seleccionada
                ) {

                    return {
                        ...current,

                        entidad_tipo_ids:
                            [],

                        obligatorio:
                            false,
                    };

                }

                /*
                 * Solo puede existir una entidad
                 * seleccionada.
                 */
                return {
                    ...current,

                    entidad_tipo_ids:
                        [
                            numericId,
                        ],
                };

            }
        );

    };
    const handleSubmit =
        async (event) => {
            event.preventDefault();

            if (
                !form.codigo.trim()
            ) {
                setValidationError(
                    "El código es obligatorio"
                );
                return;
            }

            if (
                !form.nombre.trim()
            ) {
                setValidationError(
                    "El nombre es obligatorio"
                );
                return;
            }

            if (
                form.entidad_tipo_ids
                    .length !== 1
            ) {
                setValidationError(
                    "Debe seleccionar una entidad aplicable"
                );
                return;
            }

            setValidationError("");

            await onSave({
                ...form,
                codigo:
                    form.codigo.trim(),
                nombre:
                    form.nombre.trim(),
                descripcion:
                    form.descripcion.trim() ||
                    null,
                dias_alerta_vencimiento:
                    form.usa_vencimiento &&
                        form.dias_alerta_vencimiento !== ""
                        ? Number(
                            form.dias_alerta_vencimiento
                        )
                        : null,
            });
        };

    return (
        <Form
            onSubmit={
                handleSubmit
            }
        >
            {
                validationError && (
                    <Alert variant="danger">
                        {validationError}
                    </Alert>
                )
            }

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
                            disabled={
                                !canConfig ||
                                saving
                            }
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
                            disabled={
                                !canConfig ||
                                saving
                            }
                            onChange={(event) =>
                                setField(
                                    "nombre",
                                    event.target.value
                                )
                            }
                        />
                    </Form.Group>
                </Col>

                <Col xs={12}>
                    <Form.Group>
                        <Form.Label>
                            Descripción
                        </Form.Label>

                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={
                                form.descripcion
                            }
                            disabled={
                                !canConfig ||
                                saving
                            }
                            onChange={(event) =>
                                setField(
                                    "descripcion",
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
                            Modo de captura
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                form.modo_captura
                            }
                            disabled={
                                !canConfig ||
                                saving
                            }
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
                    md={6}
                >
                    <Form.Group>
                        <Form.Label>
                            Días de alerta de vencimiento
                        </Form.Label>

                        <Form.Control
                            type="number"
                            min={0}
                            value={
                                form.dias_alerta_vencimiento
                            }
                            disabled={
                                !canConfig ||
                                saving ||
                                !form.usa_vencimiento
                            }
                            onChange={(event) =>
                                setField(
                                    "dias_alerta_vencimiento",
                                    event.target.value
                                )
                            }
                        />
                    </Form.Group>
                </Col>

                <Col xs={12}>
                    <Form.Label>
                        Entidades aplicables
                    </Form.Label>

                    <div className="d-flex flex-wrap gap-3">
                        {
                            entidadTipos.map(
                                (item) => (
                                    <Form.Check
                                        type="checkbox"
                                        label={
                                            item.nombre
                                        }
                                        checked={
                                            form.entidad_tipo_ids
                                                .includes(
                                                    Number(
                                                        item.id
                                                    )
                                                )
                                        }
                                        disabled={
                                            !canConfig ||
                                            saving ||
                                            (
                                                form.entidad_tipo_ids
                                                    .length > 0 &&
                                                !form.entidad_tipo_ids
                                                    .includes(
                                                        Number(
                                                            item.id
                                                        )
                                                    )
                                            )
                                        }
                                        onChange={() =>
                                            toggleEntidad(
                                                item.id
                                            )
                                        }
                                    />
                                )
                            )
                        }
                    </div>
                </Col>

                <Col xs={12}>
                    <div className="d-flex flex-wrap gap-3">
                        <Form.Check
                            type="switch"
                            label="Obligatorio"
                            checked={
                                form.obligatorio
                            }
                            disabled={
                                !canConfig ||
                                saving ||
                                form.entidad_tipo_ids
                                    .length !== 1
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
                            label="Permite múltiples registros"
                            checked={
                                form.permite_multiples
                            }
                            disabled={
                                !canConfig ||
                                saving
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
                            label="Usa versiones"
                            checked={
                                form.usa_versiones
                            }
                            disabled={
                                !canConfig ||
                                saving
                            }
                            onChange={(event) =>
                                setField(
                                    "usa_versiones",
                                    event.target.checked
                                )
                            }
                        />

                        <Form.Check
                            type="switch"
                            label="Usa vencimiento"
                            checked={
                                form.usa_vencimiento
                            }
                            disabled={
                                !canConfig ||
                                saving
                            }
                            onChange={(event) =>
                                setField(
                                    "usa_vencimiento",
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
                            disabled={
                                !canConfig ||
                                saving
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

                {
                    canConfig && (
                        <Col xs={12}>
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
                                        : "Guardar cambios"
                                }
                            </ERPButton>
                        </Col>
                    )
                }

            </Row>
        </Form>
    );
};

export default GeneralTab;
