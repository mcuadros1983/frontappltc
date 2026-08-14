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
    Spinner,
} from "react-bootstrap";

import Contexts from "../../../context/Contexts";

import {
    ERPModal,
    ERPButton,
} from "../../../components/common/erp";

import inteligenciaEventoApi
    from "../../../services/inteligencia/inteligenciaEventoService";


/*
|--------------------------------------------------------------------------
| ESTADO INICIAL
|--------------------------------------------------------------------------
*/

const INITIAL_FORM = {
    nombre: "",
    fecha: "",
    ambito: "",
    tipo_feriado: "",
    empresa_trabaja: false,
    fecha_descanso_efectivo: "",
    sucursales_ids: [],
    observaciones: "",
};


/*
|--------------------------------------------------------------------------
| OPCIONES
|--------------------------------------------------------------------------
*/

const AMBITOS = [
    {
        value: "NACIONAL",
        label: "Nacional",
    },
    {
        value: "PROVINCIAL",
        label: "Provincial",
    },
    {
        value: "MUNICIPAL",
        label: "Municipal",
    },
    {
        value: "EMPRESA",
        label: "Empresa",
    },
];


const TIPOS_FERIADO = [
    {
        value: "FERIADO_NACIONAL",
        label: "Feriado nacional",
    },
    {
        value: "FERIADO_PROVINCIAL",
        label: "Feriado provincial",
    },
    {
        value: "FERIADO_MUNICIPAL",
        label: "Feriado municipal",
    },
    {
        value: "DIA_NO_LABORABLE",
        label: "Día no laborable",
    },
    {
        value: "OTRO",
        label: "Otro",
    },
];


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const obtenerSucursalesIds = (feriado) => {
    if (!feriado) {
        return [];
    }

    if (Array.isArray(feriado.sucursales_ids)) {
        return feriado.sucursales_ids
            .map(Number)
            .filter(Number.isFinite);
    }

    if (Array.isArray(feriado.sucursales_evento)) {
        return feriado.sucursales_evento
            .map((item) =>
                Number(
                    item?.sucursal_id ??
                    item?.sucursal?.id
                )
            )
            .filter(Number.isFinite);
    }

    if (Array.isArray(feriado.sucursales)) {
        return feriado.sucursales
            .map((item) =>
                Number(
                    item?.sucursal_id ??
                    item?.id ??
                    item?.sucursal?.id
                )
            )
            .filter(Number.isFinite);
    }

    return [];
};


const obtenerMensajeError = (error) => {
    const mensaje =
        error?.message ||
        "No se pudo guardar el feriado.";

    try {
        const parsed = JSON.parse(mensaje);

        return (
            parsed?.error ||
            parsed?.message ||
            mensaje
        );
    }
    catch {
        return mensaje;
    }
};


/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

const InteligenciaFeriadoModal = ({
    show,
    feriado = null,
    onHide,
    onSaved,
}) => {

    /*
    |--------------------------------------------------------------------------
    | CONTEXTO
    |--------------------------------------------------------------------------
    */

    const dataContext =
        useContext(Contexts.DataContext);

    const sucursales =
        dataContext?.sucursalesTabla ||
        dataContext?.sucursales ||
        [];


    /*
    |--------------------------------------------------------------------------
    | ESTADO
    |--------------------------------------------------------------------------
    */

    const [form, setForm] =
        useState(INITIAL_FORM);

    const [saving, setSaving] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const isEdit =
        Boolean(feriado?.id);


    /*
    |--------------------------------------------------------------------------
    | SUCURSALES NORMALIZADAS
    |--------------------------------------------------------------------------
    */

    const sucursalesDisponibles =
        useMemo(() => {

            return (
                Array.isArray(sucursales)
                    ? sucursales
                    : []
            )
                .map((item) => {

                    const sucursal =
                        item?.sucursal ||
                        item;

                    return {
                        id: sucursal?.id,

                        nombre:
                            sucursal?.nombre ||
                            sucursal?.descripcion ||
                            `Sucursal #${sucursal?.id}`,
                    };
                })
                .filter(
                    (item) =>
                        item.id !== undefined &&
                        item.id !== null
                )
                .sort(
                    (a, b) =>
                        String(a.nombre).localeCompare(
                            String(b.nombre),
                            "es"
                        )
                );

        }, [sucursales]);


    /*
    |--------------------------------------------------------------------------
    | CARGAR DATOS AL ABRIR
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!show) {
            return;
        }

        let activo = true;

        setError("");
        setSaving(false);


        /*
        |--------------------------------------------------------------------------
        | NUEVO
        |--------------------------------------------------------------------------
        */

        if (!feriado?.id) {

            setLoading(false);

            setForm({
                ...INITIAL_FORM,
                sucursales_ids: [],
            });

            return () => {
                activo = false;
            };
        }


        /*
        |--------------------------------------------------------------------------
        | EDITAR
        |--------------------------------------------------------------------------
        */

        const cargarFeriado = async () => {

            setLoading(true);

            try {

                const data =
                    await inteligenciaEventoApi.obtener(
                        feriado.id
                    );

                if (!activo) {
                    return;
                }

                const item =
                    data?.evento ||
                    data?.data ||
                    data;

                const datos =
                    item?.datos ||
                    {};

                setForm({
                    nombre:
                        item?.nombre ||
                        "",

                    fecha:
                        item?.fecha_desde
                            ? String(
                                item.fecha_desde
                            ).slice(0, 10)
                            : "",

                    ambito:
                        datos?.ambito ||
                        "",

                    tipo_feriado:
                        datos?.tipo_feriado ||
                        "",

                    empresa_trabaja:
                        datos?.empresa_trabaja === true,

                    fecha_descanso_efectivo:
                        datos?.fecha_descanso_efectivo
                            ? String(
                                datos.fecha_descanso_efectivo
                            ).slice(0, 10)
                            : "",

                    sucursales_ids:
                        obtenerSucursalesIds(item),

                    observaciones:
                        item?.observaciones ||
                        "",
                });

            }
            catch (err) {

                if (!activo) {
                    return;
                }

                console.error(
                    "Error cargando feriado:",
                    err
                );

                setError(
                    obtenerMensajeError(err)
                );

            }
            finally {

                if (activo) {
                    setLoading(false);
                }

            }
        };


        cargarFeriado();


        return () => {
            activo = false;
        };

    }, [
        show,
        feriado?.id,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CAMBIAR CAMPO
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        campo,
        valor
    ) => {

        setForm((prev) => ({
            ...prev,
            [campo]: valor,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | EMPRESA TRABAJA
    |--------------------------------------------------------------------------
    */

    const handleEmpresaTrabaja =
        (valor) => {

            setForm((prev) => ({
                ...prev,

                empresa_trabaja:
                    valor,

                fecha_descanso_efectivo:
                    valor
                        ? prev.fecha_descanso_efectivo
                        : "",
            }));

        };


    /*
    |--------------------------------------------------------------------------
    | SELECCIONAR SUCURSAL
    |--------------------------------------------------------------------------
    */

    const handleSucursal = (
        sucursalId,
        checked
    ) => {

        const id =
            Number(sucursalId);

        if (!Number.isFinite(id)) {
            return;
        }

        setForm((prev) => {

            const actuales =
                Array.isArray(prev.sucursales_ids)
                    ? prev.sucursales_ids
                        .map(Number)
                        .filter(Number.isFinite)
                    : [];

            if (checked) {

                if (actuales.includes(id)) {
                    return prev;
                }

                return {
                    ...prev,

                    sucursales_ids: [
                        ...actuales,
                        id,
                    ],
                };
            }

            return {
                ...prev,

                sucursales_ids:
                    actuales.filter(
                        (item) =>
                            item !== id
                    ),
            };
        });

    };


    /*
    |--------------------------------------------------------------------------
    | TODAS LAS SUCURSALES
    |--------------------------------------------------------------------------
    */

    const sucursalesSeleccionadas =
        Array.isArray(form.sucursales_ids)
            ? form.sucursales_ids
                .map(Number)
                .filter(Number.isFinite)
            : [];


    const todasSeleccionadas =
        sucursalesDisponibles.length > 0 &&
        sucursalesDisponibles.every(
            (sucursal) =>
                sucursalesSeleccionadas.includes(
                    Number(sucursal.id)
                )
        );


    const handleTodasSucursales =
        (checked) => {

            setForm((prev) => ({
                ...prev,

                sucursales_ids:
                    checked
                        ? sucursalesDisponibles
                            .map(
                                (item) =>
                                    Number(item.id)
                            )
                            .filter(Number.isFinite)
                        : [],
            }));

        };


    /*
    |--------------------------------------------------------------------------
    | VALIDAR
    |--------------------------------------------------------------------------
    */

    const validar = () => {

        if (!form.nombre?.trim()) {
            return "Debe indicar el nombre del feriado.";
        }

        if (!form.fecha) {
            return "Debe indicar la fecha del feriado.";
        }

        if (
            form.fecha_descanso_efectivo &&
            !form.empresa_trabaja
        ) {
            return (
                "Solo puede indicarse una fecha de descanso efectivo " +
                "cuando la empresa trabaja el feriado original."
            );
        }

        if (
            form.empresa_trabaja &&
            form.fecha_descanso_efectivo &&
            form.fecha_descanso_efectivo === form.fecha
        ) {
            return (
                "La fecha de descanso efectivo debe ser diferente " +
                "a la fecha original del feriado."
            );
        }

        return null;
    };


    /*
    |--------------------------------------------------------------------------
    | GUARDAR
    |--------------------------------------------------------------------------
    */

    const handleGuardar = async () => {

        const mensaje =
            validar();

        if (mensaje) {
            setError(mensaje);
            return;
        }

        setSaving(true);
        setError("");

        try {

            /*
            |--------------------------------------------------------------------------
            | DATOS ESPECÍFICOS
            |--------------------------------------------------------------------------
            */

            const datos = {
                ambito:
                    form.ambito ||
                    null,

                empresa_trabaja:
                    Boolean(
                        form.empresa_trabaja
                    ),

                tipo_feriado:
                    form.tipo_feriado ||
                    null,

                fecha_descanso_efectivo:
                    form.empresa_trabaja &&
                    form.fecha_descanso_efectivo
                        ? form.fecha_descanso_efectivo
                        : null,
            };


            /*
            |--------------------------------------------------------------------------
            | PAYLOAD
            |--------------------------------------------------------------------------
            */

            const payload = {
                categoria:
                    "CALENDARIO",

                tipo:
                    "FERIADO",

                nombre:
                    form.nombre.trim(),

                fecha_desde:
                    form.fecha,

                fecha_hasta:
                    form.fecha,

                datos,

                sucursales_ids:
                    sucursalesSeleccionadas,

                articulos_ids:
                    [],

                observaciones:
                    form.observaciones?.trim() ||
                    null,
            };


            /*
            |--------------------------------------------------------------------------
            | CREAR / ACTUALIZAR
            |--------------------------------------------------------------------------
            */

            if (isEdit) {

                await inteligenciaEventoApi.actualizar(
                    feriado.id,
                    payload
                );

            }
            else {

                await inteligenciaEventoApi.crear(
                    payload
                );

            }


            if (onSaved) {
                await onSaved();
            }
            else {
                onHide?.();
            }

        }
        catch (err) {

            console.error(
                "Error guardando feriado:",
                err
            );

            setError(
                obtenerMensajeError(err)
            );

        }
        finally {
            setSaving(false);
        }

    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <ERPModal
            show={show}

            onHide={
                saving
                    ? undefined
                    : onHide
            }

            title={
                isEdit
                    ? "Editar feriado"
                    : "Nuevo feriado"
            }

            size="lg"

            footer={
                <>
                    <ERPButton
                        type="cancel"
                        onClick={onHide}
                        disabled={
                            saving ||
                            loading
                        }
                    >
                        Cancelar
                    </ERPButton>

                    <ERPButton
                        type="save"
                        onClick={
                            handleGuardar
                        }
                        disabled={
                            saving ||
                            loading
                        }
                    >
                        {
                            saving
                                ? (
                                    <>
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                            className="me-2"
                                        />
                                        Guardando...
                                    </>
                                )
                                : "Guardar"
                        }
                    </ERPButton>
                </>
            }
        >

            {
                error && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={() =>
                            setError("")
                        }
                    >
                        {error}
                    </Alert>
                )
            }


            {
                loading
                    ? (
                        <div className="text-center py-5">
                            <Spinner
                                animation="border"
                            />

                            <div className="mt-2">
                                Cargando feriado...
                            </div>
                        </div>
                    )
                    : (
                        <>
                            {/*
                            |--------------------------------------------------------------------------
                            | INFORMACIÓN GENERAL
                            |--------------------------------------------------------------------------
                            */}

                            <Row className="g-3">

                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label>
                                            Nombre del feriado *
                                        </Form.Label>

                                        <Form.Control
                                            type="text"
                                            value={
                                                form.nombre
                                            }
                                            disabled={
                                                saving
                                            }
                                            placeholder="Ej.: Día de la Independencia"
                                            onChange={
                                                (e) =>
                                                    handleChange(
                                                        "nombre",
                                                        e.target.value
                                                    )
                                            }
                                        />
                                    </Form.Group>
                                </Col>


                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>
                                            Fecha *
                                        </Form.Label>

                                        <Form.Control
                                            type="date"
                                            value={
                                                form.fecha
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={
                                                (e) =>
                                                    handleChange(
                                                        "fecha",
                                                        e.target.value
                                                    )
                                            }
                                        />
                                    </Form.Group>
                                </Col>


                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Ámbito
                                        </Form.Label>

                                        <Form.Select
                                            value={
                                                form.ambito
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={
                                                (e) =>
                                                    handleChange(
                                                        "ambito",
                                                        e.target.value
                                                    )
                                            }
                                        >
                                            <option value="">
                                                Seleccionar...
                                            </option>

                                            {
                                                AMBITOS.map(
                                                    (item) => (
                                                        <option
                                                            key={
                                                                item.value
                                                            }
                                                            value={
                                                                item.value
                                                            }
                                                        >
                                                            {
                                                                item.label
                                                            }
                                                        </option>
                                                    )
                                                )
                                            }
                                        </Form.Select>
                                    </Form.Group>
                                </Col>


                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Tipo de feriado
                                        </Form.Label>

                                        <Form.Select
                                            value={
                                                form.tipo_feriado
                                            }
                                            disabled={
                                                saving
                                            }
                                            onChange={
                                                (e) =>
                                                    handleChange(
                                                        "tipo_feriado",
                                                        e.target.value
                                                    )
                                            }
                                        >
                                            <option value="">
                                                Seleccionar...
                                            </option>

                                            {
                                                TIPOS_FERIADO.map(
                                                    (item) => (
                                                        <option
                                                            key={
                                                                item.value
                                                            }
                                                            value={
                                                                item.value
                                                            }
                                                        >
                                                            {
                                                                item.label
                                                            }
                                                        </option>
                                                    )
                                                )
                                            }
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                            </Row>


                            <hr className="my-4" />


                            {/*
                            |--------------------------------------------------------------------------
                            | COMPORTAMIENTO DE LA EMPRESA
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mb-3">
                                <div className="fw-semibold">
                                    Funcionamiento de la empresa
                                </div>

                                <div className="small text-muted">
                                    Indique si las sucursales trabajarán normalmente
                                    durante la fecha original del feriado.
                                </div>
                            </div>


                            <Form.Group className="mb-3">

                                <Form.Check
                                    type="radio"
                                    id="feriado-no-trabaja"
                                    name="empresa_trabaja"
                                    label="No se trabaja — se respeta el feriado en su fecha original"
                                    checked={
                                        form.empresa_trabaja === false
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={() =>
                                        handleEmpresaTrabaja(false)
                                    }
                                    className="mb-2"
                                />

                                <Form.Check
                                    type="radio"
                                    id="feriado-si-trabaja"
                                    name="empresa_trabaja"
                                    label="Se trabaja normalmente en la fecha original"
                                    checked={
                                        form.empresa_trabaja === true
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={() =>
                                        handleEmpresaTrabaja(true)
                                    }
                                />

                            </Form.Group>


                            {
                                form.empresa_trabaja && (
                                    <div className="border rounded p-3 mb-4">
                                        <Form.Group>
                                            <Form.Label>
                                                Fecha de descanso efectivo
                                            </Form.Label>

                                            <Form.Control
                                                type="date"
                                                value={
                                                    form.fecha_descanso_efectivo
                                                }
                                                disabled={
                                                    saving
                                                }
                                                onChange={
                                                    (e) =>
                                                        handleChange(
                                                            "fecha_descanso_efectivo",
                                                            e.target.value
                                                        )
                                                }
                                            />

                                            <Form.Text muted>
                                                Complete este campo si el descanso
                                                correspondiente al feriado se trasladará
                                                a otra fecha.
                                            </Form.Text>
                                        </Form.Group>
                                    </div>
                                )
                            }


                            {/*
                            |--------------------------------------------------------------------------
                            | SUCURSALES
                            |--------------------------------------------------------------------------
                            */}

                            <hr className="my-4" />


                            <div className="mb-3">
                                <div className="fw-semibold">
                                    Sucursales afectadas
                                </div>

                                <div className="small text-muted">
                                    Si no selecciona ninguna sucursal,
                                    el feriado se interpretará como aplicable
                                    a toda la empresa.
                                </div>
                            </div>


                            {
                                sucursalesDisponibles.length === 0
                                    ? (
                                        <Alert variant="secondary">
                                            No hay sucursales disponibles
                                            en el contexto del sistema.
                                        </Alert>
                                    )
                                    : (
                                        <>
                                            <Form.Check
                                                type="checkbox"
                                                id="feriado-todas-sucursales"
                                                label="Seleccionar todas las sucursales"
                                                checked={
                                                    todasSeleccionadas
                                                }
                                                disabled={
                                                    saving
                                                }
                                                onChange={
                                                    (e) =>
                                                        handleTodasSucursales(
                                                            e.target.checked
                                                        )
                                                }
                                                className="fw-semibold mb-3"
                                            />


                                            <div
                                                className="border rounded p-3"
                                                style={{
                                                    maxHeight: "220px",
                                                    overflowY: "auto",
                                                }}
                                            >
                                                <Row className="g-2">
                                                    {
                                                        sucursalesDisponibles.map(
                                                            (sucursal) => {

                                                                const checked =
                                                                    sucursalesSeleccionadas
                                                                        .includes(
                                                                            Number(
                                                                                sucursal.id
                                                                            )
                                                                        );

                                                                return (
                                                                    <Col
                                                                        md={6}
                                                                        key={
                                                                            sucursal.id
                                                                        }
                                                                    >
                                                                        <Form.Check
                                                                            type="checkbox"
                                                                            id={
                                                                                `feriado-sucursal-${sucursal.id}`
                                                                            }
                                                                            label={
                                                                                sucursal.nombre
                                                                            }
                                                                            checked={
                                                                                checked
                                                                            }
                                                                            disabled={
                                                                                saving
                                                                            }
                                                                            onChange={
                                                                                (e) =>
                                                                                    handleSucursal(
                                                                                        sucursal.id,
                                                                                        e.target.checked
                                                                                    )
                                                                            }
                                                                        />
                                                                    </Col>
                                                                );
                                                            }
                                                        )
                                                    }
                                                </Row>
                                            </div>
                                        </>
                                    )
                            }


                            {/*
                            |--------------------------------------------------------------------------
                            | OBSERVACIONES
                            |--------------------------------------------------------------------------
                            */}

                            <hr className="my-4" />


                            <Form.Group>
                                <Form.Label>
                                    Observaciones
                                </Form.Label>

                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={
                                        form.observaciones
                                    }
                                    disabled={
                                        saving
                                    }
                                    placeholder="Ej.: La empresa trabajará el viernes por ser un día de alta venta y otorgará el descanso el lunes."
                                    onChange={
                                        (e) =>
                                            handleChange(
                                                "observaciones",
                                                e.target.value
                                            )
                                    }
                                />
                            </Form.Group>
                        </>
                    )
            }

        </ERPModal>

    );
};


export default InteligenciaFeriadoModal;
