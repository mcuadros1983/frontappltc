import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Badge,
    Form,
} from "react-bootstrap";

import {
    FiEye,
} from "react-icons/fi";

import Contexts
    from "../../../context/Contexts";

import {
    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPTable,
    ERPButton,
} from "../../../components/common/erp";

import inteligenciaClimaApi
    from "../../../services/inteligencia/inteligenciaClimaService";

import InteligenciaClimaDetalleModal
    from "./InteligenciaClimaDetalleModal";

const InteligenciaClimaPage = () => {

    /*
    |--------------------------------------------------------------------------
    | DATACONTEXT
    |--------------------------------------------------------------------------
    */

    const dataContext =
        useContext(
            Contexts.DataContext
        );


    const {

        sucursalesTabla = [],

    } = dataContext || {};


    /*
    |--------------------------------------------------------------------------
    | ESTADO
    |--------------------------------------------------------------------------
    */

    const [registros, setRegistros] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [capturando, setCapturando] =
        useState(false);

    const [error, setError] =
        useState("");

    const [mensaje, setMensaje] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | FILTROS
    |--------------------------------------------------------------------------
    */

    // const [filtros, setFiltros] =
    //     useState({

    //         sucursal_id:
    //             "",

    //         fecha_desde:
    //             "",

    //         fecha_hasta:
    //             "",

    //     });

    const [filtros, setFiltros] =
        useState({

            // sucursal_id:
            //     "",

            fecha_desde:
                "",

            fecha_hasta:
                "",

        });

    /*
    |--------------------------------------------------------------------------
    | DETALLE
    |--------------------------------------------------------------------------
    */

    const [
        showDetalleModal,
        setShowDetalleModal,
    ] = useState(false);

    const [
        registroSeleccionado,
        setRegistroSeleccionado,
    ] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | MAPA SUCURSALES
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


    /*
    |--------------------------------------------------------------------------
    | NORMALIZAR RESPUESTA
    |--------------------------------------------------------------------------
    */

    const normalizarRegistros =
        (data) => {

            if (Array.isArray(data)) {
                return data;
            }


            if (
                Array.isArray(
                    data?.clima
                )
            ) {
                return data.clima;
            }


            if (
                Array.isArray(
                    data?.registros
                )
            ) {
                return data.registros;
            }


            if (
                Array.isArray(
                    data?.rows
                )
            ) {
                return data.rows;
            }


            return [];

        };


    /*
    |--------------------------------------------------------------------------
    | CARGAR
    |--------------------------------------------------------------------------
    */

    const cargar =
        useCallback(
            async () => {

                setLoading(true);

                setError("");


                try {

                    const data =
                        await inteligenciaClimaApi
                            .listar(
                                filtros
                            );


                    setRegistros(
                        normalizarRegistros(
                            data
                        )
                    );

                }
                catch (err) {

                    console.error(
                        "Error cargando clima:",
                        err
                    );


                    setRegistros([]);


                    setError(
                        obtenerMensajeError(
                            err
                        )
                    );

                }
                finally {

                    setLoading(false);

                }

            },
            [
                filtros,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | CARGA INICIAL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        cargar();

    }, [
        cargar,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CAMBIAR FILTROS
    |--------------------------------------------------------------------------
    */

    const handleFiltro =
        (
            campo,
            valor
        ) => {

            setFiltros(
                (prev) => ({

                    ...prev,

                    [campo]:
                        valor,

                })
            );

        };


    /*
    |--------------------------------------------------------------------------
    | LIMPIAR FILTROS
    |--------------------------------------------------------------------------
    */

    const limpiarFiltros =
        () => {

            setFiltros({

                // sucursal_id:
                //     "",

                fecha_desde:
                    "",

                fecha_hasta:
                    "",

            });

        };


    /*
    |--------------------------------------------------------------------------
    | CAPTURAR AHORA
    |--------------------------------------------------------------------------
    */

    const handleCapturar =
        async () => {

            const confirmar =
                window.confirm(
                    "¿Desea ejecutar una captura manual del clima ahora?"
                );


            if (!confirmar) {
                return;
            }


            setCapturando(true);

            setError("");

            setMensaje("");


            try {

                const resultado =
                    await inteligenciaClimaApi
                        .capturar();


                const cantidad =
                    resultado?.registros_guardados ??
                    resultado?.guardados ??
                    resultado?.cantidad ??
                    null;


                setMensaje(
                    cantidad !== null
                        ? `Captura completada. Se registraron ${cantidad} registros climáticos.`
                        : "Captura climática completada correctamente."
                );


                await cargar();

            }
            catch (err) {

                console.error(
                    "Error capturando clima:",
                    err
                );


                setError(
                    obtenerMensajeError(
                        err
                    )
                );

            }
            finally {

                setCapturando(false);

            }

        };


    /*
    |--------------------------------------------------------------------------
    | VER DETALLE
    |--------------------------------------------------------------------------
    */

    const handleVer =
        (registro) => {

            setRegistroSeleccionado(
                registro
            );

            setShowDetalleModal(
                true
            );

        };


    /*
    |--------------------------------------------------------------------------
    | COLUMNAS
    |--------------------------------------------------------------------------
    */

    const columns =
        useMemo(
            () => [

                {
                    key: "fecha",
                    title: "Fecha",

                    render: (row) => (
                        <strong>
                            {formatearFecha(row.fecha)}
                        </strong>
                    ),
                },

                {
                    key: "temperatura_media",
                    title: "Temp. media",

                    render: (row) =>
                        formatearTemperatura(
                            row.temperatura_media
                        ),
                },

                {
                    key: "temperatura_min",
                    title: "Mín.",

                    render: (row) =>
                        formatearTemperatura(
                            row.temperatura_min
                        ),
                },

                {
                    key: "temperatura_max",
                    title: "Máx.",

                    render: (row) =>
                        formatearTemperatura(
                            row.temperatura_max
                        ),
                },

                {
                    key: "precipitacion_mm",
                    title: "Precipitación",

                    render: (row) =>
                        row.precipitacion_mm !== null &&
                            row.precipitacion_mm !== undefined
                            ? `${formatearNumero(
                                row.precipitacion_mm
                            )} mm`
                            : "-",
                },

                {
                    key: "viento_max_kmh",
                    title: "Viento máx.",

                    render: (row) =>
                        row.viento_max_kmh !== null &&
                            row.viento_max_kmh !== undefined
                            ? `${formatearNumero(
                                row.viento_max_kmh
                            )} km/h`
                            : "-",
                },

                {
                    key: "codigo_clima",
                    title: "Clima",

                    render: (row) => (
                        <Badge
                            bg="light"
                            text="dark"
                            className="border"
                        >
                            {obtenerDescripcionClima(
                                row.codigo_clima
                            )}
                        </Badge>
                    ),
                },

                {
                    key: "fuente",
                    title: "Fuente",

                    render: (row) =>
                        row.fuente || "-",
                },

            ],
            []
        );


    /*
    |--------------------------------------------------------------------------
    | ACCIONES
    |--------------------------------------------------------------------------
    */

    const actions =
        useMemo(
            () => [

                {
                    icon:
                        <FiEye />,

                    variant:
                        "outline-primary",

                    onClick:
                        handleVer,
                },

            ],
            []
        );


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <ERPPage

            title="Clima"

            subtitle={
                "Histórico climático para Inteligencia Comercial"
            }

            actions={

                <ERPButton

                    type="refresh"

                    onClick={
                        handleCapturar
                    }

                    disabled={
                        capturando
                    }

                >
                    {
                        capturando
                            ? "Capturando..."
                            : "Capturar ahora"
                    }
                </ERPButton>

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
                mensaje && (

                    <Alert

                        variant="success"

                        dismissible

                        onClose={() =>
                            setMensaje("")
                        }

                    >
                        {mensaje}
                    </Alert>

                )
            }


            <ERPCard>

                {/*
                |--------------------------------------------------------------------------
                | FILTROS
                |--------------------------------------------------------------------------
                */}

                <ERPToolbar

                    left={

                        <div
                            className="d-flex flex-wrap gap-2"
                        >

                            <Form.Control

                                type="date"

                                value={
                                    filtros.fecha_desde
                                }

                                onChange={
                                    (e) =>
                                        handleFiltro(
                                            "fecha_desde",
                                            e.target.value
                                        )
                                }

                                title="Fecha desde"

                                style={{
                                    width: "170px",
                                }}

                            />


                            <Form.Control

                                type="date"

                                value={
                                    filtros.fecha_hasta
                                }

                                onChange={
                                    (e) =>
                                        handleFiltro(
                                            "fecha_hasta",
                                            e.target.value
                                        )
                                }

                                title="Fecha hasta"

                                style={{
                                    width: "170px",
                                }}

                            />

                        </div>

                    }

                />


                {/*
                |--------------------------------------------------------------------------
                | TABLA
                |--------------------------------------------------------------------------
                */}

                <ERPTable

                    columns={
                        columns
                    }

                    data={
                        registros
                    }

                    loading={
                        loading
                    }

                    actions={
                        actions
                    }

                />

            </ERPCard>


            {/*
            |--------------------------------------------------------------------------
            | DETALLE
            |--------------------------------------------------------------------------
            |
            | Lo conectaremos en el siguiente paso:
            |
            | <InteligenciaClimaDetalleModal ... />
            |--------------------------------------------------------------------------
            */}

            <InteligenciaClimaDetalleModal

                show={
                    showDetalleModal
                }

                registro={
                    registroSeleccionado
                }

                onHide={() => {

                    setShowDetalleModal(
                        false
                    );

                    setRegistroSeleccionado(
                        null
                    );

                }}

            />


        </ERPPage>

    );

};


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const obtenerNombreSucursal =
    (
        row,
        sucursalesMap
    ) => {

        /*
        | Si el backend ya trae la relación,
        | tiene prioridad.
        */

        if (
            row?.sucursal?.nombre
        ) {
            return row.sucursal.nombre;
        }


        if (
            row?.Sucursal?.nombre
        ) {
            return row.Sucursal.nombre;
        }


        return (
            sucursalesMap.get(
                Number(
                    row?.sucursal_id
                )
            ) ||
            `Sucursal #${row?.sucursal_id}`
        );

    };


const obtenerValor =
    (
        objeto,
        campos
    ) => {

        for (
            const campo
            of campos
        ) {

            const valor =
                objeto?.[campo];


            if (
                valor !== undefined &&
                valor !== null &&
                valor !== ""
            ) {

                const numero =
                    Number(valor);


                if (
                    Number.isFinite(
                        numero
                    )
                ) {
                    return numero;
                }

            }

        }


        return null;

    };

const formatearTemperatura =
    (valor) => {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            return "-";
        }

        return `${formatearNumero(valor)} °C`;
    };


const obtenerDescripcionClima =
    (codigo) => {

        if (
            codigo === null ||
            codigo === undefined
        ) {
            return "-";
        }

        const descripciones = {

            0: "Despejado",

            1: "Mayormente despejado",
            2: "Parcialmente nublado",
            3: "Nublado",

            45: "Niebla",
            48: "Niebla con escarcha",

            51: "Llovizna ligera",
            53: "Llovizna moderada",
            55: "Llovizna intensa",

            56: "Llovizna helada ligera",
            57: "Llovizna helada intensa",

            61: "Lluvia ligera",
            63: "Lluvia moderada",
            65: "Lluvia intensa",

            66: "Lluvia helada ligera",
            67: "Lluvia helada intensa",

            71: "Nevada ligera",
            73: "Nevada moderada",
            75: "Nevada intensa",

            77: "Granos de nieve",

            80: "Chaparrones ligeros",
            81: "Chaparrones moderados",
            82: "Chaparrones intensos",

            85: "Nevadas ligeras",
            86: "Nevadas intensas",

            95: "Tormenta",

            96: "Tormenta con granizo ligero",
            99: "Tormenta con granizo fuerte",

        };

        return (
            descripciones[Number(codigo)] ||
            `Código ${codigo}`
        );
    };

const formatearFecha =
    (fecha) => {

        if (!fecha) {
            return "-";
        }


        const partes =
            String(fecha)
                .slice(0, 10)
                .split("-");


        if (
            partes.length !== 3
        ) {
            return fecha;
        }


        return (
            `${partes[2]}/` +
            `${partes[1]}/` +
            `${partes[0]}`
        );

    };


const formatearNumero =
    (valor) => {

        const numero =
            Number(valor);


        if (
            !Number.isFinite(
                numero
            )
        ) {
            return "-";
        }


        return new Intl.NumberFormat(
            "es-AR",
            {
                minimumFractionDigits:
                    0,

                maximumFractionDigits:
                    1,
            }
        ).format(
            numero
        );

    };


const obtenerMensajeError =
    (error) => {

        const mensaje =
            error?.message ||
            "No se pudo obtener la información climática.";


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


export default InteligenciaClimaPage;