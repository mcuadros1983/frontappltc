import React, {
    useCallback,
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
    FiEdit2,
    FiTrash2,
    FiEye,
} from "react-icons/fi";

import {
    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPFilter,
    ERPSearch,
    ERPTable,
    ERPButton,
} from "../../../components/common/erp";

import inteligenciaEventoApi
    from "../../../services/inteligencia/inteligenciaEventoService";

import InteligenciaEventoModal
    from "./InteligenciaEventoModal";

import InteligenciaEventoDetalleModal
    from "./InteligenciaEventoDetalleModal";

const InteligenciaEventosPage = () => {

    /*
    |--------------------------------------------------------------------------
    | ESTADO
    |--------------------------------------------------------------------------
    */

    const [eventos, setEventos] =
        useState([]);

    const [configuracion, setConfiguracion] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | FILTROS
    |--------------------------------------------------------------------------
    */

    const [buscar, setBuscar] =
        useState("");

    const [categoria, setCategoria] =
        useState("");

    const [tipo, setTipo] =
        useState("");

    const [fechaDesde, setFechaDesde] =
        useState("");

    const [fechaHasta, setFechaHasta] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | MODALES
    |--------------------------------------------------------------------------
    |
    | Los dejamos preparados.
    | En el siguiente paso conectamos InteligenciaEventoModal.
    |--------------------------------------------------------------------------
    */

    const [showEventoModal, setShowEventoModal] =
        useState(false);

    const [showDetalleModal, setShowDetalleModal] =
        useState(false);

    const [eventoSeleccionado, setEventoSeleccionado] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | NORMALIZAR RESPUESTA LISTADO
    |--------------------------------------------------------------------------
    |
    | Soportamos:
    |
    | []
    |
    | { rows: [] }
    |
    | { eventos: [] }
    |
    |--------------------------------------------------------------------------
    */

    const normalizarEventos = (data) => {

        if (Array.isArray(data)) {
            return data;
        }

        if (
            data &&
            Array.isArray(data.rows)
        ) {
            return data.rows;
        }

        if (
            data &&
            Array.isArray(data.eventos)
        ) {
            return data.eventos;
        }

        return [];

    };


    /*
    |--------------------------------------------------------------------------
    | CARGAR CONFIGURACIÓN
    |--------------------------------------------------------------------------
    */

    const cargarConfiguracion =
        useCallback(
            async () => {

                try {

                    const data =
                        await inteligenciaEventoApi
                            .obtenerConfiguracion();


                    /*
                    | El endpoint devuelve:
                    |
                    | {
                    |   categorias: {...}
                    | }
                    */

                    setConfiguracion(
                        data?.categorias ||
                        data ||
                        {}
                    );

                }
                catch (err) {

                    console.error(
                        "Error cargando configuración de eventos:",
                        err
                    );

                    setError(
                        err?.message ||
                        "No se pudo cargar la configuración de eventos."
                    );

                }

            },
            []
        );


    /*
    |--------------------------------------------------------------------------
    | CARGAR EVENTOS
    |--------------------------------------------------------------------------
    */

    const cargarEventos =
        useCallback(
            async () => {

                setLoading(true);
                setError("");

                try {

                    const data =
                        await inteligenciaEventoApi
                            .listar({
                                buscar,
                                categoria,
                                tipo,
                                fecha_desde:
                                    fechaDesde,
                                fecha_hasta:
                                    fechaHasta,
                            });


                    setEventos(
                        normalizarEventos(data)
                    );

                }
                catch (err) {

                    console.error(
                        "Error cargando eventos:",
                        err
                    );

                    setEventos([]);

                    setError(
                        err?.message ||
                        "No se pudieron cargar los eventos."
                    );

                }
                finally {

                    setLoading(false);

                }

            },
            [
                buscar,
                categoria,
                tipo,
                fechaDesde,
                fechaHasta,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | CARGA INICIAL DE CONFIGURACIÓN
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        cargarConfiguracion();

    }, [
        cargarConfiguracion,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CARGAR LISTADO
    |--------------------------------------------------------------------------
    |
    | Por ahora los filtros recargan automáticamente.
    |
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const timer =
            setTimeout(
                () => {

                    cargarEventos();

                },
                250
            );


        return () =>
            clearTimeout(timer);

    }, [
        cargarEventos,
    ]);


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
                ).map(
                    (key) => ({
                        value: key,
                        label:
                            formatearCodigo(key),
                    })
                );

            },
            [
                configuracion,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | TIPOS DISPONIBLES
    |--------------------------------------------------------------------------
    */

    const tipos =
        useMemo(
            () => {

                if (
                    !categoria ||
                    !configuracion?.[categoria]
                ) {
                    return [];
                }


                return Object.entries(
                    configuracion[categoria]
                ).map(
                    ([
                        key,
                        config,
                    ]) => ({

                        value:
                            key,

                        label:
                            config?.nombre ||
                            formatearCodigo(key),

                    })
                );

            },
            [
                categoria,
                configuracion,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | CAMBIO DE CATEGORÍA
    |--------------------------------------------------------------------------
    */

    const handleCategoriaChange =
        (value) => {

            setCategoria(value);

            /*
            | Un tipo perteneciente a otra categoría
            | ya no sería válido.
            */

            setTipo("");

        };


    /*
    |--------------------------------------------------------------------------
    | NUEVO
    |--------------------------------------------------------------------------
    */

    const handleNuevo = () => {

        setEventoSeleccionado(null);

        setShowEventoModal(true);

    };


    /*
    |--------------------------------------------------------------------------
    | VER
    |--------------------------------------------------------------------------
    */

    const handleVer = (evento) => {

        setEventoSeleccionado(
            evento
        );

        setShowDetalleModal(true);

    };


    /*
    |--------------------------------------------------------------------------
    | EDITAR
    |--------------------------------------------------------------------------
    */

    const handleEditar = (evento) => {

        setEventoSeleccionado(
            evento
        );

        setShowEventoModal(true);

    };


    /*
    |--------------------------------------------------------------------------
    | ELIMINAR
    |--------------------------------------------------------------------------
    */

    const handleEliminar =
        async (evento) => {

            const confirmar =
                window.confirm(
                    `¿Eliminar el evento "${evento.nombre}"?`
                );


            if (!confirmar) {
                return;
            }


            try {

                setError("");


                await inteligenciaEventoApi
                    .eliminar(
                        evento.id
                    );


                await cargarEventos();

            }
            catch (err) {

                console.error(
                    "Error eliminando evento:",
                    err
                );

                setError(
                    err?.message ||
                    "No se pudo eliminar el evento."
                );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | DESPUÉS DE GUARDAR
    |--------------------------------------------------------------------------
    |
    | Este callback lo utilizará el modal.
    |--------------------------------------------------------------------------
    */

    const handleEventoGuardado =
        async () => {

            setShowEventoModal(false);

            setEventoSeleccionado(null);

            await cargarEventos();

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
                    key:
                        "fecha_desde",

                    title:
                        "Desde",

                    render:
                        (row) =>
                            formatearFecha(
                                row.fecha_desde
                            ),
                },

                {
                    key:
                        "fecha_hasta",

                    title:
                        "Hasta",

                    render:
                        (row) =>
                            formatearFecha(
                                row.fecha_hasta ||
                                row.fecha_desde
                            ),
                },

                {
                    key:
                        "categoria",

                    title:
                        "Categoría",

                    render:
                        (row) => (

                            <Badge
                                bg={
                                    colorCategoria(
                                        row.categoria
                                    )
                                }
                            >
                                {
                                    formatearCodigo(
                                        row.categoria
                                    )
                                }
                            </Badge>

                        ),
                },

                {
                    key:
                        "tipo",

                    title:
                        "Tipo",

                    render:
                        (row) =>
                            obtenerNombreTipo(
                                configuracion,
                                row.categoria,
                                row.tipo
                            ),
                },

                {
                    key:
                        "nombre",

                    title:
                        "Evento",
                },

                {
                    key:
                        "alcance",

                    title:
                        "Alcance",

                    render:
                        (row) =>
                            obtenerAlcance(
                                row
                            ),
                },

                {
                    key:
                        "activo",

                    title:
                        "Estado",

                    render:
                        (row) => (

                            <Badge
                                bg={
                                    row.activo === false
                                        ? "secondary"
                                        : "success"
                                }
                            >
                                {
                                    row.activo === false
                                        ? "Inactivo"
                                        : "Activo"
                                }
                            </Badge>

                        ),
                },

            ],
            [
                configuracion,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | ACCIONES TABLA
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

                {
                    icon:
                        <FiEdit2 />,

                    variant:
                        "outline-primary",

                    onClick:
                        handleEditar,
                },

                {
                    icon:
                        <FiTrash2 />,

                    variant:
                        "outline-danger",

                    onClick:
                        handleEliminar,
                },

            ],
            // Las funciones utilizan el estado actual del componente.
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [
                cargarEventos,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <ERPPage

            title="Eventos"

            subtitle={
                "Inteligencia Comercial · Factores que pueden influir en las ventas"
            }

            actions={

                <ERPButton
                    type="new"
                    onClick={
                        handleNuevo
                    }
                >
                    Nuevo evento
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


            <ERPCard>

                <ERPToolbar

                    left={

                        <ERPSearch

                            value={
                                buscar
                            }

                            onChange={
                                setBuscar
                            }

                            placeholder={
                                "Buscar evento..."
                            }

                            width={
                                320
                            }

                        />

                    }

                    right={

                        <ERPButton

                            type="refresh"

                            onClick={
                                cargarEventos
                            }

                            disabled={
                                loading
                            }

                        >
                            Actualizar
                        </ERPButton>

                    }

                />


                <ERPFilter
                    className="mb-3"
                >

                    <Form.Select

                        value={
                            categoria
                        }

                        onChange={
                            (e) =>
                                handleCategoriaChange(
                                    e.target.value
                                )
                        }

                        style={{
                            minWidth:
                                190,
                        }}

                    >

                        <option value="">
                            Todas las categorías
                        </option>

                        {
                            categorias.map(
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


                    <Form.Select

                        value={
                            tipo
                        }

                        onChange={
                            (e) =>
                                setTipo(
                                    e.target.value
                                )
                        }

                        disabled={
                            !categoria
                        }

                        style={{
                            minWidth:
                                210,
                        }}

                    >

                        <option value="">
                            Todos los tipos
                        </option>

                        {
                            tipos.map(
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


                    <Form.Control

                        type="date"

                        value={
                            fechaDesde
                        }

                        onChange={
                            (e) =>
                                setFechaDesde(
                                    e.target.value
                                )
                        }

                        title="Fecha desde"

                    />


                    <Form.Control

                        type="date"

                        value={
                            fechaHasta
                        }

                        onChange={
                            (e) =>
                                setFechaHasta(
                                    e.target.value
                                )
                        }

                        title="Fecha hasta"

                    />


                    {
                        (
                            categoria ||
                            tipo ||
                            fechaDesde ||
                            fechaHasta
                        ) && (

                            <ERPButton

                                type="cancel"

                                size="sm"

                                onClick={() => {

                                    setCategoria("");
                                    setTipo("");
                                    setFechaDesde("");
                                    setFechaHasta("");

                                }}

                            >
                                Limpiar filtros
                            </ERPButton>

                        )
                    }

                </ERPFilter>


                <ERPTable

                    columns={
                        columns
                    }

                    data={
                        eventos
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
            | MODALES
            |--------------------------------------------------------------------------
            |
            | En el siguiente paso:
            |
            | <InteligenciaEventoModal
            |     show={showEventoModal}
            |     evento={eventoSeleccionado}
            |     configuracion={configuracion}
            |     onHide={...}
            |     onSaved={handleEventoGuardado}
            | />
            |
            | <InteligenciaEventoDetalleModal ... />
            |
            |--------------------------------------------------------------------------
            */}


            {/*
            | Estas referencias mantienen preparado el estado hasta
            | incorporar los componentes.
            */}

            <InteligenciaEventoModal

                show={
                    showEventoModal
                }

                evento={
                    eventoSeleccionado
                }

                configuracion={
                    configuracion
                }

                onHide={() => {

                    setShowEventoModal(false);

                    setEventoSeleccionado(null);

                }}

                onSaved={
                    handleEventoGuardado
                }

            />

            <InteligenciaEventoDetalleModal

                show={
                    showDetalleModal
                }

                evento={
                    eventoSeleccionado
                }

                configuracion={
                    configuracion
                }

                onHide={() => {

                    setShowDetalleModal(false);

                    setEventoSeleccionado(null);

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


const formatearFecha = (
    fecha
) => {

    if (!fecha) {
        return "-";
    }


    const [
        anio,
        mes,
        dia,
    ] =
        String(fecha)
            .slice(0, 10)
            .split("-");


    if (
        !anio ||
        !mes ||
        !dia
    ) {
        return fecha;
    }


    return `${dia}/${mes}/${anio}`;

};


const obtenerNombreTipo = (
    configuracion,
    categoria,
    tipo
) => {

    return (
        configuracion?.[categoria]?.[tipo]?.nombre ||
        formatearCodigo(tipo)
    );

};


const obtenerAlcance = (
    evento
) => {

    /*
    | El backend puede devolver las asociaciones con diferentes
    | propiedades dependiendo del alias utilizado.
    |
    | Cuando veamos la respuesta real del endpoint ajustamos esto
    | al alias definitivo.
    */

    const sucursales =
        evento.sucursales ||
        evento.Sucursales ||
        [];


    const articulos =
        evento.articulos ||
        evento.Articulos ||
        [];


    if (
        Array.isArray(sucursales) &&
        sucursales.length > 0
    ) {

        return `${sucursales.length} sucursal${sucursales.length === 1
            ? ""
            : "es"
            }`;

    }


    if (
        Array.isArray(articulos) &&
        articulos.length > 0
    ) {

        return `${articulos.length} artículo${articulos.length === 1
            ? ""
            : "s"
            }`;

    }


    return "General";

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


export default InteligenciaEventosPage;