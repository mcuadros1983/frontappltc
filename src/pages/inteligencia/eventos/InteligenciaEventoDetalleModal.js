import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Badge,
    Col,
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


const InteligenciaEventoDetalleModal = ({

    show,

    evento = null,

    configuracion = {},

    onHide,

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

    const [detalle, setDetalle] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | CARGAR DETALLE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (
            !show ||
            !evento?.id
        ) {

            setDetalle(null);

            return;

        }


        const cargar =
            async () => {

                setLoading(true);

                setError("");


                try {

                    const data =
                        await inteligenciaEventoApi
                            .obtener(
                                evento.id
                            );


                    setDetalle(
                        data?.evento ||
                        data
                    );

                }
                catch (err) {

                    console.error(
                        "Error cargando detalle del evento:",
                        err
                    );


                    setError(
                        obtenerMensajeError(
                            err
                        )
                    );

                }
                finally {

                    setLoading(false);

                }

            };


        cargar();

    }, [
        show,
        evento?.id,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CONFIGURACIÓN DEL TIPO
    |--------------------------------------------------------------------------
    */

    const tipoConfig =
        useMemo(
            () => {

                if (
                    !detalle?.categoria ||
                    !detalle?.tipo
                ) {
                    return null;
                }


                return (
                    configuracion?.[
                        detalle.categoria
                    ]?.[
                        detalle.tipo
                    ] ||
                    null
                );

            },
            [
                configuracion,
                detalle,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | MAPAS DE CATÁLOGOS
    |--------------------------------------------------------------------------
    */

    const sucursalesMap =
        useMemo(
            () => {

                const map =
                    new Map();


                sucursalesTabla.forEach(
                    (item) => {

                        if (
                            item?.id === undefined ||
                            item?.id === null
                        ) {
                            return;
                        }


                        map.set(
                            Number(item.id),
                            item.nombre ||
                            item.descripcion ||
                            `Sucursal #${item.id}`
                        );

                    }
                );


                return map;

            },
            [
                sucursalesTabla,
            ]
        );


    const articulosMap =
        useMemo(
            () => {

                const map =
                    new Map();


                articulosTabla.forEach(
                    (item) => {

                        if (
                            item?.id === undefined ||
                            item?.id === null
                        ) {
                            return;
                        }


                        map.set(
                            Number(item.id),
                            item.descripcion ||
                            item.descripcionreducida ||
                            `Artículo #${item.id}`
                        );

                    }
                );


                return map;

            },
            [
                articulosTabla,
            ]
        );


    const tarjetasMap =
        useMemo(
            () => {

                const map =
                    new Map();


                tarjetaDeCreditoTabla.forEach(
                    (item) => {

                        if (
                            item?.id === undefined ||
                            item?.id === null
                        ) {
                            return;
                        }


                        map.set(
                            Number(item.id),
                            item.descripcion ||
                            `Tarjeta #${item.id}`
                        );

                    }
                );


                return map;

            },
            [
                tarjetaDeCreditoTabla,
            ]
        );


    const planesMap =
        useMemo(
            () => {

                const map =
                    new Map();


                planTarjetaTabla.forEach(
                    (item) => {

                        if (
                            item?.id === undefined ||
                            item?.id === null
                        ) {
                            return;
                        }


                        map.set(
                            Number(item.id),
                            item.descripcion ||
                            `Plan #${item.id}`
                        );

                    }
                );


                return map;

            },
            [
                planTarjetaTabla,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | IDS RELACIONADOS
    |--------------------------------------------------------------------------
    */

    const sucursalesIds =
        useMemo(
            () =>
                obtenerIdsRelacion(
                    detalle,
                    "sucursales"
                ),
            [
                detalle,
            ]
        );


    const articulosIds =
        useMemo(
            () =>
                obtenerIdsRelacion(
                    detalle,
                    "articulos"
                ),
            [
                detalle,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | FORMATEAR CAMPO DINÁMICO
    |--------------------------------------------------------------------------
    */

    const formatearValorCampo =
        (
            campo,
            valor
        ) => {

            if (
                valor === undefined ||
                valor === null ||
                valor === ""
            ) {
                return "-";
            }


            switch (campo.tipo) {

                case "booleano":

                    return valor
                        ? "Sí"
                        : "No";


                case "tarjeta":

                    return (
                        tarjetasMap.get(
                            Number(valor)
                        ) ||
                        `Tarjeta #${valor}`
                    );


                case "plan_tarjeta":

                    return (
                        planesMap.get(
                            Number(valor)
                        ) ||
                        `Plan #${valor}`
                    );


                case "porcentaje":

                    return `${valor}%`;


                case "fecha":

                    return formatearFecha(
                        valor
                    );


                default:

                    /*
                    | El catálogo actual usa "numero" para porcentaje,
                    | por lo que hacemos una comprobación adicional
                    | por nombre.
                    */

                    if (
                        campo.nombre ===
                        "porcentaje"
                    ) {
                        return `${valor}%`;
                    }


                    return String(valor);

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
                onHide
            }

            title="Detalle del evento"

            size="lg"

            footer={

                <ERPButton
                    type="cancel"
                    onClick={
                        onHide
                    }
                >
                    Cerrar
                </ERPButton>

            }

        >

            {
                error && (

                    <Alert
                        variant="danger"
                    >
                        {error}
                    </Alert>

                )
            }


            {
                loading
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
                    : detalle
                        ? (

                            <>

                                {/*
                                |--------------------------------------------------------------------------
                                | CABECERA
                                |--------------------------------------------------------------------------
                                */}

                                <div className="mb-4">

                                    <div
                                        className="d-flex align-items-center gap-2 mb-2"
                                    >

                                        <Badge
                                            bg={
                                                colorCategoria(
                                                    detalle.categoria
                                                )
                                            }
                                        >
                                            {
                                                formatearCodigo(
                                                    detalle.categoria
                                                )
                                            }
                                        </Badge>


                                        <Badge
                                            bg={
                                                detalle.activo === false
                                                    ? "secondary"
                                                    : "success"
                                            }
                                        >
                                            {
                                                detalle.activo === false
                                                    ? "Inactivo"
                                                    : "Activo"
                                            }
                                        </Badge>

                                    </div>


                                    <h5 className="mb-1">
                                        {
                                            detalle.nombre
                                        }
                                    </h5>


                                    <div className="text-muted">

                                        {
                                            tipoConfig?.nombre ||
                                            formatearCodigo(
                                                detalle.tipo
                                            )
                                        }

                                    </div>

                                </div>


                                {/*
                                |--------------------------------------------------------------------------
                                | DATOS GENERALES
                                |--------------------------------------------------------------------------
                                */}

                                <Row>

                                    <Col md={6}>

                                        <DatoDetalle
                                            label="Fecha desde"
                                            value={
                                                formatearFecha(
                                                    detalle.fecha_desde
                                                )
                                            }
                                        />

                                    </Col>


                                    <Col md={6}>

                                        <DatoDetalle
                                            label="Fecha hasta"
                                            value={
                                                detalle.fecha_hasta
                                                    ? formatearFecha(
                                                        detalle.fecha_hasta
                                                    )
                                                    : formatearFecha(
                                                        detalle.fecha_desde
                                                    )
                                            }
                                        />

                                    </Col>

                                </Row>


                                {/*
                                |--------------------------------------------------------------------------
                                | DATOS DINÁMICOS
                                |--------------------------------------------------------------------------
                                */}

                                {
                                    (
                                        tipoConfig?.campos ||
                                        []
                                    ).length > 0 && (

                                        <>

                                            <hr />

                                            <h6 className="mb-3">
                                                Datos del evento
                                            </h6>


                                            <Row>

                                                {
                                                    tipoConfig.campos.map(
                                                        (campo) => (

                                                            <Col
                                                                md={6}
                                                                key={
                                                                    campo.nombre
                                                                }
                                                            >

                                                                <DatoDetalle

                                                                    label={
                                                                        formatearNombreCampo(
                                                                            campo.nombre
                                                                        )
                                                                    }

                                                                    value={
                                                                        formatearValorCampo(
                                                                            campo,
                                                                            detalle.datos?.[
                                                                                campo.nombre
                                                                            ]
                                                                        )
                                                                    }

                                                                />

                                                            </Col>

                                                        )
                                                    )
                                                }

                                            </Row>

                                        </>

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

                                            <h6 className="mb-3">
                                                Sucursales
                                            </h6>


                                            {
                                                sucursalesIds.length > 0
                                                    ? (

                                                        <div
                                                            className="d-flex flex-wrap gap-2"
                                                        >

                                                            {
                                                                sucursalesIds.map(
                                                                    (id) => (

                                                                        <Badge
                                                                            key={
                                                                                id
                                                                            }
                                                                            bg="light"
                                                                            text="dark"
                                                                            className="border"
                                                                        >
                                                                            {
                                                                                sucursalesMap.get(
                                                                                    Number(id)
                                                                                ) ||
                                                                                `Sucursal #${id}`
                                                                            }
                                                                        </Badge>

                                                                    )
                                                                )
                                                            }

                                                        </div>

                                                    )
                                                    : (

                                                        <div className="text-muted">
                                                            Alcance general
                                                        </div>

                                                    )
                                            }

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

                                            <h6 className="mb-3">
                                                Artículos
                                            </h6>


                                            {
                                                articulosIds.length > 0
                                                    ? (

                                                        <div
                                                            className="d-flex flex-wrap gap-2"
                                                        >

                                                            {
                                                                articulosIds.map(
                                                                    (id) => (

                                                                        <Badge
                                                                            key={
                                                                                id
                                                                            }
                                                                            bg="light"
                                                                            text="dark"
                                                                            className="border"
                                                                        >
                                                                            {
                                                                                articulosMap.get(
                                                                                    Number(id)
                                                                                ) ||
                                                                                `Artículo #${id}`
                                                                            }
                                                                        </Badge>

                                                                    )
                                                                )
                                                            }

                                                        </div>

                                                    )
                                                    : (

                                                        <div className="text-muted">
                                                            Todos los artículos / alcance general
                                                        </div>

                                                    )
                                            }

                                        </>

                                    )
                                }


                                {/*
                                |--------------------------------------------------------------------------
                                | OBSERVACIONES
                                |--------------------------------------------------------------------------
                                */}

                                {
                                    detalle.observaciones && (

                                        <>

                                            <hr />

                                            <h6 className="mb-2">
                                                Observaciones
                                            </h6>

                                            <div
                                                style={{
                                                    whiteSpace:
                                                        "pre-wrap",
                                                }}
                                            >
                                                {
                                                    detalle.observaciones
                                                }
                                            </div>

                                        </>

                                    )
                                }

                            </>

                        )
                        : !error && (

                            <div
                                className="text-muted text-center py-4"
                            >
                                No hay información para mostrar.
                            </div>

                        )
            }

        </ERPModal>

    );

};


/*
|--------------------------------------------------------------------------
| COMPONENTE AUXILIAR
|--------------------------------------------------------------------------
*/

const DatoDetalle = ({
    label,
    value,
}) => (

    <div className="mb-3">

        <div
            className="small text-muted"
        >
            {label}
        </div>

        <div>
            {
                value ??
                "-"
            }
        </div>

    </div>

);


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

    const nombres = {

        ambito:
            "Ámbito",

        tipo_feriado:
            "Tipo de feriado",

        empresa_trabaja:
            "La empresa trabaja",

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

    };


    return (
        nombres[nombre] ||
        formatearCodigo(nombre)
    );

};


const formatearFecha = (
    fecha
) => {

    if (!fecha) {
        return "-";
    }


    const valor =
        String(fecha)
            .slice(0, 10);


    const partes =
        valor.split("-");


    if (
        partes.length !== 3
    ) {
        return valor;
    }


    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );

};


const obtenerIdsRelacion = (
    item,
    tipo
) => {

    if (!item) {
        return [];
    }


    if (
        tipo === "sucursales"
    ) {

        if (
            Array.isArray(
                item.sucursales_ids
            )
        ) {

            return item
                .sucursales_ids
                .map(Number)
                .filter(
                    Number.isFinite
                );

        }


        const relaciones =
            item.sucursales ||
            item.Sucursales ||
            [];


        return relaciones
            .map(
                (rel) =>
                    rel?.sucursal_id ??
                    rel?.id
            )
            .map(Number)
            .filter(
                Number.isFinite
            );

    }


    if (
        Array.isArray(
            item.articulos_ids
        )
    ) {

        return item
            .articulos_ids
            .map(Number)
            .filter(
                Number.isFinite
            );

    }


    const relaciones =
        item.articulos ||
        item.Articulos ||
        [];


    return relaciones
        .map(
            (rel) =>
                rel?.articulo_id ??
                rel?.id
        )
        .map(Number)
        .filter(
            Number.isFinite
        );

};


const colorCategoria = (
    categoria
) => {

    switch (categoria) {

        case "CALENDARIO":
            return "primary";

        case "MARKETING":
            return "info";

        case "ACCION_COMERCIAL":
            return "success";

        case "BENEFICIO":
            return "warning";

        case "OPERATIVO":
            return "secondary";

        default:
            return "dark";

    }

};


const obtenerMensajeError = (
    error
) => {

    const mensaje =
        error?.message ||
        "No se pudo cargar el evento.";


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


export default InteligenciaEventoDetalleModal;