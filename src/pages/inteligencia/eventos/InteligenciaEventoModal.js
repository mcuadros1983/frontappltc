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

import Contexts
    from "../../../context/Contexts";

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

    categoria: "",
    tipo: "",
    nombre: "",

    fecha_desde: "",
    fecha_hasta: "",

    observaciones: "",

    datos: {},

    sucursales_ids: [],
    articulos_ids: [],

};


/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

const InteligenciaEventoModal = ({

    show,

    evento = null,

    configuracion = {},

    onHide,

    onSaved,

}) => {

    /*
    |--------------------------------------------------------------------------
    | CONTEXTO
    |--------------------------------------------------------------------------
    */

    const dataContext =
        useContext(
            Contexts.DataContext
        );


    const {

        sucursalesTabla = [],

        articulosTabla = [],

        planTarjetaTabla = [],

        tarjetaDeCreditoTabla = [],

    } = dataContext || {};


    /*
    |--------------------------------------------------------------------------
    | ESTADO
    |--------------------------------------------------------------------------
    */

    const [form, setForm] =
        useState(INITIAL_FORM);

    const [saving, setSaving] =
        useState(false);

    const [loadingEvento, setLoadingEvento] =
        useState(false);

    const [error, setError] =
        useState("");


    const isEdit =
        Boolean(
            evento?.id
        );


    /*
    |--------------------------------------------------------------------------
    | CATEGORÍAS
    |--------------------------------------------------------------------------
    */

    const categorias =
        useMemo(
            () => {

                return Object.keys(
                    configuracion || {}
                );

            },
            [
                configuracion,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | TIPOS DE LA CATEGORÍA
    |--------------------------------------------------------------------------
    */

    const tipos =
        useMemo(
            () => {

                if (
                    !form.categoria ||
                    !configuracion?.[
                        form.categoria
                    ]
                ) {
                    return [];
                }


                return Object.entries(
                    configuracion[
                        form.categoria
                    ]
                ).map(
                    ([
                        codigo,
                        config,
                    ]) => ({

                        codigo,

                        nombre:
                            config?.nombre ||
                            formatearCodigo(
                                codigo
                            ),

                    })
                );

            },
            [
                configuracion,
                form.categoria,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | CONFIGURACIÓN DEL TIPO SELECCIONADO
    |--------------------------------------------------------------------------
    */

    const tipoConfig =
        useMemo(
            () => {

                if (
                    !form.categoria ||
                    !form.tipo
                ) {
                    return null;
                }


                return (
                    configuracion?.[
                        form.categoria
                    ]?.[
                        form.tipo
                    ] ||
                    null
                );

            },
            [
                configuracion,
                form.categoria,
                form.tipo,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | MAPAS
    |--------------------------------------------------------------------------
    */

    // const tarjetasMap =
    //     useMemo(
    //         () => {

    //             const map =
    //                 new Map();


    //             tarjetaDeCreditoTabla.forEach(
    //                 (item) => {

    //                     if (
    //                         item?.id === undefined ||
    //                         item?.id === null
    //                     ) {
    //                         return;
    //                     }


    //                     map.set(
    //                         Number(item.id),
    //                         item
    //                     );

    //                 }
    //             );


    //             return map;

    //         },
    //         [
    //             tarjetaDeCreditoTabla,
    //         ]
    //     );


    /*
    |--------------------------------------------------------------------------
    | PLANES DISPONIBLES
    |--------------------------------------------------------------------------
    |
    | Si el evento posee tarjeta_id, mostramos solamente los planes
    | pertenecientes a esa tarjeta.
    |--------------------------------------------------------------------------
    */

    const planesDisponibles =
        useMemo(
            () => {

                const tarjetaId =
                    form.datos
                        ?.tarjeta_id;


                if (!tarjetaId) {

                    return planTarjetaTabla;

                }


                return planTarjetaTabla.filter(
                    (plan) =>
                        Number(
                            plan.tarjetadecredito_id
                        ) ===
                        Number(
                            tarjetaId
                        )
                );

            },
            [
                planTarjetaTabla,
                form.datos,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | CARGAR EVENTO AL ABRIR
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!show) {
            return;
        }


        setError("");


        if (!evento?.id) {

            setForm({
                ...INITIAL_FORM,
                datos: {},
                sucursales_ids: [],
                articulos_ids: [],
            });

            return;

        }


        const cargar =
            async () => {

                setLoadingEvento(
                    true
                );


                try {

                    /*
                    | Obtenemos el registro completo.
                    |
                    | No dependemos del objeto reducido del listado.
                    */

                    const data =
                        await inteligenciaEventoApi
                            .obtener(
                                evento.id
                            );


                    const item =
                        data?.evento ||
                        data;


                    setForm({

                        categoria:
                            item?.categoria ||
                            "",

                        tipo:
                            item?.tipo ||
                            "",

                        nombre:
                            item?.nombre ||
                            "",

                        fecha_desde:
                            normalizarFechaInput(
                                item?.fecha_desde
                            ),

                        fecha_hasta:
                            normalizarFechaInput(
                                item?.fecha_hasta
                            ),

                        observaciones:
                            item?.observaciones ||
                            "",

                        datos:
                            item?.datos
                                ? {
                                    ...item.datos,
                                }
                                : {},

                        sucursales_ids:
                            obtenerIdsRelacion(
                                item,
                                "sucursales"
                            ),

                        articulos_ids:
                            obtenerIdsRelacion(
                                item,
                                "articulos"
                            ),

                    });

                }
                catch (err) {

                    console.error(
                        "Error cargando evento:",
                        err
                    );


                    setError(
                        err?.message ||
                        "No se pudo cargar el evento."
                    );

                }
                finally {

                    setLoadingEvento(
                        false
                    );

                }

            };


        cargar();

    }, [
        show,
        evento?.id,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CAMBIO CAMPO PRINCIPAL
    |--------------------------------------------------------------------------
    */

    const handleChange =
        (
            campo,
            valor
        ) => {

            setForm(
                (prev) => ({

                    ...prev,

                    [campo]:
                        valor,

                })
            );

        };


    /*
    |--------------------------------------------------------------------------
    | CAMBIO CATEGORÍA
    |--------------------------------------------------------------------------
    */

    const handleCategoriaChange =
        (categoria) => {

            setForm(
                (prev) => ({

                    ...prev,

                    categoria,

                    tipo: "",

                    datos: {},

                    sucursales_ids: [],

                    articulos_ids: [],

                })
            );

        };


    /*
    |--------------------------------------------------------------------------
    | CAMBIO TIPO
    |--------------------------------------------------------------------------
    */

    const handleTipoChange =
        (tipo) => {

            setForm(
                (prev) => ({

                    ...prev,

                    tipo,

                    datos: {},

                    sucursales_ids: [],

                    articulos_ids: [],

                })
            );

        };


    /*
    |--------------------------------------------------------------------------
    | CAMBIO CAMPO DINÁMICO
    |--------------------------------------------------------------------------
    */

    const handleDatoChange =
        (
            campo,
            valor
        ) => {

            setForm(
                (prev) => ({

                    ...prev,

                    datos: {

                        ...prev.datos,

                        [campo]:
                            valor,

                    },

                })
            );

        };


    /*
    |--------------------------------------------------------------------------
    | CAMBIO TARJETA
    |--------------------------------------------------------------------------
    |
    | Al cambiar la tarjeta eliminamos plan_id para impedir que quede
    | seleccionado un plan perteneciente a la tarjeta anterior.
    |--------------------------------------------------------------------------
    */

    const handleTarjetaChange =
        (valor) => {

            setForm(
                (prev) => {

                    const datos = {
                        ...prev.datos,
                    };


                    if (valor) {

                        datos.tarjeta_id =
                            Number(valor);

                    }
                    else {

                        delete datos.tarjeta_id;

                    }


                    delete datos.plan_id;


                    return {

                        ...prev,

                        datos,

                    };

                }
            );

        };


    /*
    |--------------------------------------------------------------------------
    | SELECCIÓN MÚLTIPLE
    |--------------------------------------------------------------------------
    */

    const handleMultiSelect =
        (
            campo,
            event
        ) => {

            const ids =
                Array.from(
                    event.target
                        .selectedOptions
                )
                    .map(
                        (option) =>
                            Number(
                                option.value
                            )
                    )
                    .filter(
                        (id) =>
                            Number.isFinite(
                                id
                            )
                    );


            handleChange(
                campo,
                ids
            );

        };


    /*
    |--------------------------------------------------------------------------
    | VALIDACIÓN FRONTEND
    |--------------------------------------------------------------------------
    |
    | La validación definitiva sigue estando en backend.
    |--------------------------------------------------------------------------
    */

    const validar =
        () => {

            if (!form.categoria) {

                return "Debe seleccionar una categoría.";

            }


            if (!form.tipo) {

                return "Debe seleccionar un tipo de evento.";

            }


            if (
                !form.nombre.trim()
            ) {

                return "El nombre del evento es obligatorio.";

            }


            if (!form.fecha_desde) {

                return "La fecha desde es obligatoria.";

            }


            if (
                form.fecha_hasta &&
                form.fecha_hasta <
                    form.fecha_desde
            ) {

                return "La fecha hasta no puede ser anterior a la fecha desde.";

            }


            if (
                tipoConfig
                    ?.requiere_sucursal &&
                form.sucursales_ids
                    .length === 0
            ) {

                return "Debe seleccionar al menos una sucursal.";

            }


            for (
                const campo
                of tipoConfig?.campos ||
                []
            ) {

                if (!campo.requerido) {
                    continue;
                }


                const valor =
                    form.datos?.[
                        campo.nombre
                    ];


                if (
                    valor === undefined ||
                    valor === null ||
                    valor === ""
                ) {

                    return `El campo "${formatearNombreCampo(
                        campo.nombre
                    )}" es obligatorio.`;

                }

            }


            return null;

        };


    /*
    |--------------------------------------------------------------------------
    | CONSTRUIR PAYLOAD
    |--------------------------------------------------------------------------
    */

    const construirPayload =
        () => {

            /*
            | Mandamos solamente los campos dinámicos permitidos por
            | la configuración actual.
            |
            | Así evitamos conservar campos pertenecientes a otro tipo.
            */

            const datos = {};


            for (
                const campo
                of tipoConfig?.campos ||
                []
            ) {

                const valor =
                    form.datos?.[
                        campo.nombre
                    ];


                if (
                    valor === undefined ||
                    valor === null ||
                    valor === ""
                ) {
                    continue;
                }


                datos[
                    campo.nombre
                ] = valor;

            }


            return {

                categoria:
                    form.categoria,

                tipo:
                    form.tipo,

                nombre:
                    form.nombre.trim(),

                fecha_desde:
                    form.fecha_desde,

                fecha_hasta:
                    form.fecha_hasta ||
                    null,

                datos,

                observaciones:
                    form.observaciones
                        ?.trim() ||
                    null,

                sucursales_ids:
                    tipoConfig
                        ?.permite_sucursales
                        ? form.sucursales_ids
                        : [],

                articulos_ids:
                    tipoConfig
                        ?.permite_articulos
                        ? form.articulos_ids
                        : [],

            };

        };


    /*
    |--------------------------------------------------------------------------
    | GUARDAR
    |--------------------------------------------------------------------------
    */

    const handleGuardar =
        async () => {

            const mensaje =
                validar();


            if (mensaje) {

                setError(
                    mensaje
                );

                return;

            }


            setSaving(true);
            setError("");


            try {

                const payload =
                    construirPayload();


                if (isEdit) {

                    await inteligenciaEventoApi
                        .actualizar(
                            evento.id,
                            payload
                        );

                }
                else {

                    await inteligenciaEventoApi
                        .crear(
                            payload
                        );

                }


                if (onSaved) {

                    await onSaved();

                }

            }
            catch (err) {

                console.error(
                    "Error guardando evento:",
                    err
                );


                setError(
                    obtenerMensajeError(
                        err
                    )
                );

            }
            finally {

                setSaving(false);

            }

        };


    /*
    |--------------------------------------------------------------------------
    | RENDER CAMPO DINÁMICO
    |--------------------------------------------------------------------------
    */

    const renderCampo =
        (campo) => {

            const valor =
                form.datos?.[
                    campo.nombre
                ];


            const label =
                formatearNombreCampo(
                    campo.nombre
                );


            switch (
                campo.tipo
            ) {

                /*
                |--------------------------------------------------------------------------
                | TEXTO
                |--------------------------------------------------------------------------
                */

                case "texto":

                    return (

                        <Form.Group
                            key={
                                campo.nombre
                            }
                            className="mb-3"
                        >

                            <Form.Label>
                                {label}

                                {
                                    campo.requerido
                                        ? " *"
                                        : ""
                                }
                            </Form.Label>


                            <Form.Control

                                type="text"

                                value={
                                    valor ??
                                    ""
                                }

                                disabled={
                                    saving
                                }

                                onChange={
                                    (e) =>
                                        handleDatoChange(
                                            campo.nombre,
                                            e.target.value
                                        )
                                }

                            />

                        </Form.Group>

                    );


                /*
                |--------------------------------------------------------------------------
                | NÚMERO
                |--------------------------------------------------------------------------
                */

                case "numero":

                    return (

                        <Form.Group
                            key={
                                campo.nombre
                            }
                            className="mb-3"
                        >

                            <Form.Label>
                                {label}

                                {
                                    campo.requerido
                                        ? " *"
                                        : ""
                                }
                            </Form.Label>


                            <Form.Control

                                type="number"

                                step="0.01"

                                value={
                                    valor ??
                                    ""
                                }

                                disabled={
                                    saving
                                }

                                onChange={
                                    (e) => {

                                        const value =
                                            e.target.value;


                                        handleDatoChange(
                                            campo.nombre,
                                            value === ""
                                                ? ""
                                                : Number(
                                                    value
                                                )
                                        );

                                    }
                                }

                            />

                        </Form.Group>

                    );


                /*
                |--------------------------------------------------------------------------
                | FECHA
                |--------------------------------------------------------------------------
                */

                case "fecha":

                    return (

                        <Form.Group
                            key={
                                campo.nombre
                            }
                            className="mb-3"
                        >

                            <Form.Label>
                                {label}

                                {
                                    campo.requerido
                                        ? " *"
                                        : ""
                                }
                            </Form.Label>


                            <Form.Control

                                type="date"

                                value={
                                    normalizarFechaInput(
                                        valor
                                    )
                                }

                                disabled={
                                    saving
                                }

                                onChange={
                                    (e) =>
                                        handleDatoChange(
                                            campo.nombre,
                                            e.target.value
                                        )
                                }

                            />

                        </Form.Group>

                    );


                /*
                |--------------------------------------------------------------------------
                | HORA
                |--------------------------------------------------------------------------
                */

                case "hora":

                    return (

                        <Form.Group
                            key={
                                campo.nombre
                            }
                            className="mb-3"
                        >

                            <Form.Label>
                                {label}

                                {
                                    campo.requerido
                                        ? " *"
                                        : ""
                                }
                            </Form.Label>


                            <Form.Control

                                type="time"

                                value={
                                    valor ??
                                    ""
                                }

                                disabled={
                                    saving
                                }

                                onChange={
                                    (e) =>
                                        handleDatoChange(
                                            campo.nombre,
                                            e.target.value
                                        )
                                }

                            />

                        </Form.Group>

                    );


                /*
                |--------------------------------------------------------------------------
                | BOOLEANO
                |--------------------------------------------------------------------------
                */

                case "booleano":

                    return (

                        <Form.Group
                            key={
                                campo.nombre
                            }
                            className="mb-3"
                        >

                            <Form.Check

                                type="switch"

                                id={
                                    `evento-${campo.nombre}`
                                }

                                label={
                                    label
                                }

                                checked={
                                    Boolean(
                                        valor
                                    )
                                }

                                disabled={
                                    saving
                                }

                                onChange={
                                    (e) =>
                                        handleDatoChange(
                                            campo.nombre,
                                            e.target.checked
                                        )
                                }

                            />

                        </Form.Group>

                    );


                /*
                |--------------------------------------------------------------------------
                | TARJETA
                |--------------------------------------------------------------------------
                */

                case "tarjeta":

                    return (

                        <Form.Group
                            key={
                                campo.nombre
                            }
                            className="mb-3"
                        >

                            <Form.Label>
                                {label}

                                {
                                    campo.requerido
                                        ? " *"
                                        : ""
                                }
                            </Form.Label>


                            <Form.Select

                                value={
                                    valor ??
                                    ""
                                }

                                disabled={
                                    saving
                                }

                                onChange={
                                    (e) =>
                                        handleTarjetaChange(
                                            e.target.value
                                        )
                                }

                            >

                                <option value="">
                                    Seleccionar tarjeta
                                </option>


                                {
                                    tarjetaDeCreditoTabla.map(
                                        (tarjeta) => (

                                            <option
                                                key={
                                                    tarjeta.id
                                                }
                                                value={
                                                    tarjeta.id
                                                }
                                            >
                                                {
                                                    tarjeta.descripcion ||
                                                    `Tarjeta #${tarjeta.id}`
                                                }
                                            </option>

                                        )
                                    )
                                }

                            </Form.Select>

                        </Form.Group>

                    );


                /*
                |--------------------------------------------------------------------------
                | PLAN TARJETA
                |--------------------------------------------------------------------------
                */

                case "plan_tarjeta":

                    return (

                        <Form.Group
                            key={
                                campo.nombre
                            }
                            className="mb-3"
                        >

                            <Form.Label>
                                {label}

                                {
                                    campo.requerido
                                        ? " *"
                                        : ""
                                }
                            </Form.Label>


                            <Form.Select

                                value={
                                    valor ??
                                    ""
                                }

                                disabled={
                                    saving ||
                                    !form.datos
                                        ?.tarjeta_id
                                }

                                onChange={
                                    (e) => {

                                        const value =
                                            e.target.value;


                                        handleDatoChange(
                                            campo.nombre,
                                            value
                                                ? Number(
                                                    value
                                                )
                                                : ""
                                        );

                                    }
                                }

                            >

                                <option value="">
                                    Seleccionar plan
                                </option>


                                {
                                    planesDisponibles.map(
                                        (plan) => (

                                            <option
                                                key={
                                                    plan.id
                                                }
                                                value={
                                                    plan.id
                                                }
                                            >
                                                {
                                                    plan.descripcion ||
                                                    `Plan #${plan.id}`
                                                }
                                            </option>

                                        )
                                    )
                                }

                            </Form.Select>

                        </Form.Group>

                    );


                /*
                |--------------------------------------------------------------------------
                | TIPO DESCONOCIDO
                |--------------------------------------------------------------------------
                */

                default:

                    return (

                        <Alert
                            key={
                                campo.nombre
                            }
                            variant="warning"
                            className="mb-3"
                        >
                            Tipo de campo no soportado:{" "}
                            <strong>
                                {campo.tipo}
                            </strong>
                        </Alert>

                    );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <ERPModal

            show={
                show
            }

            onHide={
                saving
                    ? undefined
                    : onHide
            }

            title={
                isEdit
                    ? "Editar evento"
                    : "Nuevo evento"
            }

            size="lg"

            footer={

                <>

                    <ERPButton

                        type="cancel"

                        onClick={
                            onHide
                        }

                        disabled={
                            saving
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
                            loadingEvento
                        }

                    >

                        {
                            saving
                                ? (
                                    <>
                                        <Spinner
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
                loadingEvento
                    ? (

                        <div
                            className="text-center py-5"
                        >
                            <Spinner />

                            <div className="mt-2">
                                Cargando evento...
                            </div>
                        </div>

                    )
                    : (

                        <>

                            {/*
                            |--------------------------------------------------------------------------
                            | CLASIFICACIÓN
                            |--------------------------------------------------------------------------
                            */}

                            <Row>

                                <Col md={6}>

                                    <Form.Group
                                        className="mb-3"
                                    >

                                        <Form.Label>
                                            Categoría *
                                        </Form.Label>


                                        <Form.Select

                                            value={
                                                form.categoria
                                            }

                                            disabled={
                                                saving
                                            }

                                            onChange={
                                                (e) =>
                                                    handleCategoriaChange(
                                                        e.target.value
                                                    )
                                            }

                                        >

                                            <option value="">
                                                Seleccionar categoría
                                            </option>


                                            {
                                                categorias.map(
                                                    (item) => (

                                                        <option
                                                            key={
                                                                item
                                                            }
                                                            value={
                                                                item
                                                            }
                                                        >
                                                            {
                                                                formatearCodigo(
                                                                    item
                                                                )
                                                            }
                                                        </option>

                                                    )
                                                )
                                            }

                                        </Form.Select>

                                    </Form.Group>

                                </Col>


                                <Col md={6}>

                                    <Form.Group
                                        className="mb-3"
                                    >

                                        <Form.Label>
                                            Tipo *
                                        </Form.Label>


                                        <Form.Select

                                            value={
                                                form.tipo
                                            }

                                            disabled={
                                                saving ||
                                                !form.categoria
                                            }

                                            onChange={
                                                (e) =>
                                                    handleTipoChange(
                                                        e.target.value
                                                    )
                                            }

                                        >

                                            <option value="">
                                                Seleccionar tipo
                                            </option>


                                            {
                                                tipos.map(
                                                    (item) => (

                                                        <option
                                                            key={
                                                                item.codigo
                                                            }
                                                            value={
                                                                item.codigo
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

                                    </Form.Group>

                                </Col>

                            </Row>


                            {/*
                            |--------------------------------------------------------------------------
                            | NOMBRE
                            |--------------------------------------------------------------------------
                            */}

                            <Form.Group
                                className="mb-3"
                            >

                                <Form.Label>
                                    Nombre *
                                </Form.Label>


                                <Form.Control

                                    type="text"

                                    value={
                                        form.nombre
                                    }

                                    disabled={
                                        saving
                                    }

                                    placeholder={
                                        ejemploNombreEvento(
                                            form.tipo
                                        )
                                    }

                                    onChange={
                                        (e) =>
                                            handleChange(
                                                "nombre",
                                                e.target.value
                                            )
                                    }

                                />

                            </Form.Group>


                            {/*
                            |--------------------------------------------------------------------------
                            | FECHAS
                            |--------------------------------------------------------------------------
                            */}

                            <Row>

                                <Col md={6}>

                                    <Form.Group
                                        className="mb-3"
                                    >

                                        <Form.Label>
                                            Fecha desde *
                                        </Form.Label>


                                        <Form.Control

                                            type="date"

                                            value={
                                                form.fecha_desde
                                            }

                                            disabled={
                                                saving
                                            }

                                            onChange={
                                                (e) =>
                                                    handleChange(
                                                        "fecha_desde",
                                                        e.target.value
                                                    )
                                            }

                                        />

                                    </Form.Group>

                                </Col>


                                <Col md={6}>

                                    <Form.Group
                                        className="mb-3"
                                    >

                                        <Form.Label>
                                            Fecha hasta
                                        </Form.Label>


                                        <Form.Control

                                            type="date"

                                            value={
                                                form.fecha_hasta
                                            }

                                            disabled={
                                                saving
                                            }

                                            min={
                                                form.fecha_desde ||
                                                undefined
                                            }

                                            onChange={
                                                (e) =>
                                                    handleChange(
                                                        "fecha_hasta",
                                                        e.target.value
                                                    )
                                            }

                                        />

                                        <Form.Text muted>
                                            Si es un evento de un solo día puede dejarse vacío.
                                        </Form.Text>

                                    </Form.Group>

                                </Col>

                            </Row>


                            {/*
                            |--------------------------------------------------------------------------
                            | CAMPOS DINÁMICOS
                            |--------------------------------------------------------------------------
                            */}

                            {
                                tipoConfig &&
                                (
                                    tipoConfig.campos ||
                                    []
                                ).length > 0 && (

                                    <div className="mt-2">

                                        <hr />

                                        <h6 className="mb-3">
                                            Datos del evento
                                        </h6>


                                        {
                                            tipoConfig.campos.map(
                                                renderCampo
                                            )
                                        }

                                    </div>

                                )
                            }


                            {/*
                            |--------------------------------------------------------------------------
                            | SUCURSALES
                            |--------------------------------------------------------------------------
                            */}

                            {
                                tipoConfig
                                    ?.permite_sucursales && (

                                    <>

                                        <hr />

                                        <Form.Group
                                            className="mb-3"
                                        >

                                            <Form.Label>

                                                Sucursales

                                                {
                                                    tipoConfig
                                                        ?.requiere_sucursal
                                                        ? " *"
                                                        : ""
                                                }

                                            </Form.Label>


                                            <Form.Select

                                                multiple

                                                value={
                                                    form.sucursales_ids
                                                        .map(
                                                            String
                                                        )
                                                }

                                                disabled={
                                                    saving
                                                }

                                                onChange={
                                                    (e) =>
                                                        handleMultiSelect(
                                                            "sucursales_ids",
                                                            e
                                                        )
                                                }

                                                style={{
                                                    minHeight:
                                                        140,
                                                }}

                                            >

                                                {
                                                    sucursalesTabla.map(
                                                        (sucursal) => (

                                                            <option
                                                                key={
                                                                    sucursal.id
                                                                }
                                                                value={
                                                                    sucursal.id
                                                                }
                                                            >
                                                                {
                                                                    sucursal.nombre ||
                                                                    sucursal.descripcion ||
                                                                    `Sucursal #${sucursal.id}`
                                                                }
                                                            </option>

                                                        )
                                                    )
                                                }

                                            </Form.Select>


                                            <Form.Text muted>

                                                {
                                                    tipoConfig
                                                        ?.requiere_sucursal
                                                        ? "Seleccione una o más sucursales."
                                                        : "Si no selecciona ninguna, el evento se considera de alcance general."
                                                }

                                            </Form.Text>

                                        </Form.Group>

                                    </>

                                )
                            }


                            {/*
                            |--------------------------------------------------------------------------
                            | ARTÍCULOS
                            |--------------------------------------------------------------------------
                            */}

                            {
                                tipoConfig
                                    ?.permite_articulos && (

                                    <>

                                        <hr />

                                        <Form.Group
                                            className="mb-3"
                                        >

                                            <Form.Label>
                                                Artículos
                                            </Form.Label>


                                            <Form.Select

                                                multiple

                                                value={
                                                    form.articulos_ids
                                                        .map(
                                                            String
                                                        )
                                                }

                                                disabled={
                                                    saving
                                                }

                                                onChange={
                                                    (e) =>
                                                        handleMultiSelect(
                                                            "articulos_ids",
                                                            e
                                                        )
                                                }

                                                style={{
                                                    minHeight:
                                                        180,
                                                }}

                                            >

                                                {
                                                    articulosTabla.map(
                                                        (articulo) => (

                                                            <option
                                                                key={
                                                                    articulo.id
                                                                }
                                                                value={
                                                                    articulo.id
                                                                }
                                                            >
                                                                {
                                                                    articulo.descripcion ||
                                                                    articulo.descripcionreducida ||
                                                                    `Artículo #${articulo.id}`
                                                                }
                                                            </option>

                                                        )
                                                    )
                                                }

                                            </Form.Select>


                                            <Form.Text muted>
                                                Si no selecciona artículos, el evento se considera general para los productos.
                                            </Form.Text>

                                        </Form.Group>

                                    </>

                                )
                            }


                            {/*
                            |--------------------------------------------------------------------------
                            | OBSERVACIONES
                            |--------------------------------------------------------------------------
                            */}

                            <hr />


                            <Form.Group
                                className="mb-2"
                            >

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


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatearCodigo = (
    value
) => {

    if (!value) {
        return "";
    }


    return String(value)
        .toLowerCase()
        .split("_")
        .map(
            (parte) =>
                parte
                    ? parte.charAt(0).toUpperCase() +
                      parte.slice(1)
                    : ""
        )
        .join(" ");

};


const formatearNombreCampo = (
    nombre
) => {

    const especiales = {

        ambito:
            "Ámbito",

        tipo_feriado:
            "Tipo de feriado",

        empresa_trabaja:
            "La empresa trabaja ese día",

        tarjeta_id:
            "Tarjeta",

        plan_id:
            "Plan",

        porcentaje:
            "Porcentaje",

        convenio:
            "Convenio",

        plataforma:
            "Plataforma",

        medio:
            "Medio",

        zona:
            "Zona",

        organismo:
            "Organismo",

        evento:
            "Evento",

        motivo:
            "Motivo",

        hora_desde:
            "Hora desde",

        hora_hasta:
            "Hora hasta",

        fecha_feriado_original:
            "Fecha del feriado original",

        codigo:
            "Código",

    };


    return (
        especiales[nombre] ||
        formatearCodigo(nombre)
    );

};


const normalizarFechaInput = (
    fecha
) => {

    if (!fecha) {
        return "";
    }


    return String(fecha)
        .slice(0, 10);

};


const obtenerIdsRelacion = (
    item,
    tipo
) => {

    /*
    |--------------------------------------------------------------------------
    | SUCURSALES
    |--------------------------------------------------------------------------
    */

    if (
        tipo === "sucursales"
    ) {

        if (
            Array.isArray(
                item?.sucursales_ids
            )
        ) {

            return item
                .sucursales_ids
                .map(Number)
                .filter(Number.isFinite);

        }


        const relaciones =
            item?.sucursales ||
            item?.Sucursales ||
            [];


        return relaciones
            .map(
                (rel) =>
                    rel?.sucursal_id ??
                    rel?.id
            )
            .map(Number)
            .filter(Number.isFinite);

    }


    /*
    |--------------------------------------------------------------------------
    | ARTÍCULOS
    |--------------------------------------------------------------------------
    */

    if (
        Array.isArray(
            item?.articulos_ids
        )
    ) {

        return item
            .articulos_ids
            .map(Number)
            .filter(Number.isFinite);

    }


    const relaciones =
        item?.articulos ||
        item?.Articulos ||
        [];


    return relaciones
        .map(
            (rel) =>
                rel?.articulo_id ??
                rel?.id
        )
        .map(Number)
        .filter(Number.isFinite);

};


const ejemploNombreEvento = (
    tipo
) => {

    switch (tipo) {

        case "FERIADO":
            return "Ej.: Día de la Independencia";

        case "CELEBRACION":
            return "Ej.: Día de la Madre";

        case "PAGO_ADMIN_PUBLICA":
            return "Ej.: Pago Administración Pública";

        case "RADIO":
            return "Ej.: Campaña Radio Valle Viejo";

        case "REDES_SOCIALES":
            return "Ej.: Campaña Día del Padre";

        case "CIERRE_TEMPORAL":
            return "Ej.: Cierre temporal por mantenimiento";

        case "CIERRE_FERIADO_COMPENSATORIO":
            return "Ej.: Compensación feriado";

        default:
            return "Nombre descriptivo del evento";

    }

};


const obtenerMensajeError = (
    error
) => {

    if (!error) {
        return "No se pudo guardar el evento.";
    }


    /*
    | apiClient actualmente puede lanzar como mensaje
    | el cuerpo completo del backend.
    |
    | Si el backend devuelve JSON convertido a texto,
    | intentamos recuperar error/message.
    */

    const mensaje =
        error.message ||
        String(error);


    try {

        const parsed =
            JSON.parse(
                mensaje
            );


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


export default InteligenciaEventoModal;