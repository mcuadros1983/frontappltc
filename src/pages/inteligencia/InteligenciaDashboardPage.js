import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Badge,
    Card,
    Col,
    Row,
    Spinner,
} from "react-bootstrap";

import {
    ERPPage,
    ERPButton,
    ERPTable,
} from "../../components/common/erp";

import inteligenciaDashboardApi
    from "../../services/inteligencia/inteligenciaDashboardService";


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatearFecha = (fecha) => {

    if (!fecha) {
        return "Sin datos";
    }

    const partes =
        String(fecha)
            .slice(0, 10)
            .split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};


const formatearNumero = (valor) => {

    const numero =
        Number(valor);

    if (!Number.isFinite(numero)) {
        return "0";
    }

    return numero.toLocaleString("es-AR");
};


const formatearTemperatura = (valor) => {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "—";
    }

    const numero =
        Number(valor);

    if (!Number.isFinite(numero)) {
        return "—";
    }

    return `${numero.toLocaleString(
        "es-AR",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }
    )} °C`;
};


const formatearDecimal = (
    valor,
    sufijo = ""
) => {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "—";
    }

    const numero =
        Number(valor);

    if (!Number.isFinite(numero)) {
        return "—";
    }

    return (
        numero.toLocaleString(
            "es-AR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        ) +
        sufijo
    );
};


/*
|--------------------------------------------------------------------------
| ESTADOS
|--------------------------------------------------------------------------
*/

const estadoConfig = (estado) => {

    switch (estado) {

        case "OK":

            return {
                label: "Actualizado",
                variant: "success",
            };


        case "DESACTUALIZADO":

            return {
                label: "Desactualizado",
                variant: "warning",
            };


        case "SIN_DATOS":

            return {
                label: "Sin datos",
                variant: "danger",
            };


        case "DESCONOCIDO":

            return {
                label: "Desconocido",
                variant: "secondary",
            };


        default:

            return {
                label:
                    estado ||
                    "Sin estado",

                variant:
                    "secondary",
            };

    }

};


const estadoGeneralConfig = (estado) => {

    switch (estado) {

        case "OK":

            return {
                label:
                    "Información actualizada",

                variant:
                    "success",

                mensaje:
                    "Las principales fuentes de Inteligencia Comercial están actualizadas.",
            };


        case "ATENCION":

            return {
                label:
                    "Requiere atención",

                variant:
                    "warning",

                mensaje:
                    "Una o más fuentes necesitan actualización o revisión.",
            };


        case "INCOMPLETO":

            return {
                label:
                    "Información incompleta",

                variant:
                    "danger",

                mensaje:
                    "Faltan datos en una o más fuentes críticas para Inteligencia Comercial.",
            };


        default:

            return {
                label:
                    "Estado desconocido",

                variant:
                    "secondary",

                mensaje:
                    "No fue posible determinar el estado general de la información.",
            };

    }

};


/*
|--------------------------------------------------------------------------
| BADGE DE ESTADO
|--------------------------------------------------------------------------
*/

const EstadoBadge = ({
    estado,
}) => {

    const config =
        estadoConfig(
            estado
        );

    return (
        <Badge
            bg={
                config.variant
            }
        >
            {
                config.label
            }
        </Badge>
    );
};


/*
|--------------------------------------------------------------------------
| TARJETA DE FUENTE
|--------------------------------------------------------------------------
*/

const FuenteCard = ({
    titulo,
    estado,
    ultimaFecha,
    children,
}) => {

    return (

        <Card className="h-100 shadow-sm">

            <Card.Body>

                <div
                    className="
                        d-flex
                        justify-content-between
                        align-items-start
                        gap-2
                        mb-3
                    "
                >

                    <div>

                        <div className="fw-semibold">
                            {titulo}
                        </div>

                        <div className="small text-muted">
                            Último dato: {
                                formatearFecha(
                                    ultimaFecha
                                )
                            }
                        </div>

                    </div>


                    <EstadoBadge
                        estado={
                            estado
                        }
                    />

                </div>


                {children}

            </Card.Body>

        </Card>

    );

};


/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

const InteligenciaDashboardPage = () => {

    /*
    |--------------------------------------------------------------------------
    | ESTADO
    |--------------------------------------------------------------------------
    */

    const [
        dashboard,
        setDashboard,
    ] =
        useState(null);


    const [
        loading,
        setLoading,
    ] =
        useState(true);


    const [
        refreshing,
        setRefreshing,
    ] =
        useState(false);


    const [
        error,
        setError,
    ] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | CARGAR
    |--------------------------------------------------------------------------
    */

    const cargarDashboard =
        useCallback(
            async ({
                refresh = false,
            } = {}) => {

                if (refresh) {
                    setRefreshing(true);
                }
                else {
                    setLoading(true);
                }

                setError("");

                try {

                    const data =
                        await inteligenciaDashboardApi
                            .obtener();


                    setDashboard(
                        data ||
                        null
                    );

                }
                catch (err) {

                    console.error(
                        "Error cargando dashboard de Inteligencia Comercial:",
                        err
                    );


                    setError(
                        err?.message ||
                        "No se pudo cargar el dashboard de Inteligencia Comercial."
                    );

                }
                finally {

                    setLoading(false);
                    setRefreshing(false);

                }

            },
            []
        );


    useEffect(() => {

        cargarDashboard();

    }, [
        cargarDashboard,
    ]);


    /*
    |--------------------------------------------------------------------------
    | FUENTES
    |--------------------------------------------------------------------------
    */

    const fuentes =
        dashboard?.fuentes ||
        {};


    const ventas =
        fuentes?.ventas ||
        {};


    const ventasArticulos =
        fuentes?.ventas_articulos ||
        {};


    const snapshots =
        fuentes?.snapshots ||
        {};


    const clima =
        fuentes?.clima ||
        {};


    const eventos =
        fuentes?.eventos ||
        {};


    const climaRegistro =
        clima?.registro ||
        {};


    /*
    |--------------------------------------------------------------------------
    | ESTADO GENERAL
    |--------------------------------------------------------------------------
    */

    const estadoGeneral =
        useMemo(
            () =>
                estadoGeneralConfig(
                    dashboard?.estado_general
                ),
            [
                dashboard?.estado_general,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | EVENTOS
    |--------------------------------------------------------------------------
    */

    const eventosHoy =
        Array.isArray(
            dashboard?.eventos_hoy
        )
            ? dashboard.eventos_hoy
            : [];


    const proximosEventos =
        Array.isArray(
            dashboard?.proximos_eventos
        )
            ? dashboard.proximos_eventos
            : [];


    /*
    |--------------------------------------------------------------------------
    | COLUMNAS EVENTOS
    |--------------------------------------------------------------------------
    */

    const columnasEventos =
        useMemo(
            () => [

                {
                    key:
                        "fecha_desde",

                    label:
                        "Fecha",

                    render:
                        (item) =>
                            formatearFecha(
                                item.fecha_desde
                            ),
                },

                {
                    key:
                        "nombre",

                    label:
                        "Evento",

                    render:
                        (item) => (
                            <div>

                                <div className="fw-semibold">
                                    {
                                        item.nombre
                                    }
                                </div>

                                {
                                    item.fecha_hasta &&
                                    item.fecha_hasta !==
                                        item.fecha_desde && (

                                        <div className="small text-muted">

                                            Hasta {
                                                formatearFecha(
                                                    item.fecha_hasta
                                                )
                                            }

                                        </div>

                                    )
                                }

                            </div>
                        ),
                },

                {
                    key:
                        "categoria",

                    label:
                        "Categoría",

                    render:
                        (item) => (
                            <Badge bg="secondary">
                                {
                                    item.categoria ||
                                    "—"
                                }
                            </Badge>
                        ),
                },

                {
                    key:
                        "tipo",

                    label:
                        "Tipo",

                    render:
                        (item) =>
                            item.tipo ||
                            "—",
                },

            ],
            []
        );


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (
        loading &&
        !dashboard
    ) {

        return (

            <ERPPage
                title="Inteligencia Comercial"
                subtitle="Estado y cobertura de las fuentes de información"
            >

                <div className="text-center py-5">

                    <Spinner
                        animation="border"
                    />

                    <div className="mt-3 text-muted">
                        Cargando información...
                    </div>

                </div>

            </ERPPage>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <ERPPage

            title="Inteligencia Comercial"

            subtitle={
                dashboard?.fecha
                    ? `Estado de información al ${formatearFecha(
                        dashboard.fecha
                    )}`
                    : "Estado y cobertura de las fuentes de información"
            }

            actions={

                <ERPButton

                    type="secondary"

                    onClick={() =>
                        cargarDashboard({
                            refresh: true,
                        })
                    }

                    disabled={
                        refreshing
                    }

                >

                    {
                        refreshing
                            ? (
                                <>
                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />

                                    Actualizando...
                                </>
                            )
                            : "Actualizar"
                    }

                </ERPButton>

            }

        >

            {/*
            |--------------------------------------------------------------------------
            | ERROR
            |--------------------------------------------------------------------------
            */}

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


            {/*
            |--------------------------------------------------------------------------
            | ESTADO GENERAL
            |--------------------------------------------------------------------------
            */}

            <Alert
                variant={
                    estadoGeneral.variant
                }
                className="mb-4"
            >

                <div
                    className="
                        d-flex
                        justify-content-between
                        align-items-center
                        flex-wrap
                        gap-2
                    "
                >

                    <div>

                        <div className="fw-semibold">
                            {
                                estadoGeneral.label
                            }
                        </div>

                        <div>
                            {
                                estadoGeneral.mensaje
                            }
                        </div>

                    </div>


                    {
                        dashboard?.estado_general && (

                            <Badge
                                bg={
                                    estadoGeneral.variant
                                }
                            >
                                {
                                    dashboard.estado_general
                                }
                            </Badge>

                        )
                    }

                </div>

            </Alert>


            {/*
            |--------------------------------------------------------------------------
            | FUENTES PRINCIPALES
            |--------------------------------------------------------------------------
            */}

            <Row className="g-3 mb-4">

                {/*
                |--------------------------------------------------------------------------
                | VENTAS
                |--------------------------------------------------------------------------
                */}

                <Col
                    xl={3}
                    md={6}
                >

                    <FuenteCard
                        titulo="Ventas"
                        estado={
                            ventas.estado
                        }
                        ultimaFecha={
                            ventas.ultima_fecha
                        }
                    >

                        <Row className="g-2">

                            <Col xs={6}>

                                <div className="small text-muted">
                                    Registros
                                </div>

                                <div className="fs-5 fw-semibold">
                                    {
                                        formatearNumero(
                                            ventas.registros
                                        )
                                    }
                                </div>

                            </Col>


                            <Col xs={6}>

                                <div className="small text-muted">
                                    Sucursales
                                </div>

                                <div className="fs-5 fw-semibold">
                                    {
                                        formatearNumero(
                                            ventas.sucursales_ultima_fecha
                                        )
                                    }
                                </div>

                            </Col>

                        </Row>


                        {
                            ventas.dias_desde_ultimo_dato !==
                                null &&
                            ventas.dias_desde_ultimo_dato !==
                                undefined && (

                                <div className="small text-muted mt-3">

                                    Hace {
                                        ventas.dias_desde_ultimo_dato
                                    } día(s)

                                </div>

                            )
                        }

                    </FuenteCard>

                </Col>


                {/*
                |--------------------------------------------------------------------------
                | VENTAS POR ARTÍCULO
                |--------------------------------------------------------------------------
                */}

                <Col
                    xl={3}
                    md={6}
                >

                    <FuenteCard
                        titulo="Ventas por artículo"
                        estado={
                            ventasArticulos.estado
                        }
                        ultimaFecha={
                            ventasArticulos.ultima_fecha
                        }
                    >

                        <Row className="g-2">

                            <Col xs={4}>

                                <div className="small text-muted">
                                    Registros
                                </div>

                                <div className="fs-6 fw-semibold">
                                    {
                                        formatearNumero(
                                            ventasArticulos.registros
                                        )
                                    }
                                </div>

                            </Col>


                            <Col xs={4}>

                                <div className="small text-muted">
                                    Artículos
                                </div>

                                <div className="fs-6 fw-semibold">
                                    {
                                        formatearNumero(
                                            ventasArticulos.articulos_ultima_fecha
                                        )
                                    }
                                </div>

                            </Col>


                            <Col xs={4}>

                                <div className="small text-muted">
                                    Sucursales
                                </div>

                                <div className="fs-6 fw-semibold">
                                    {
                                        formatearNumero(
                                            ventasArticulos.sucursales_ultima_fecha
                                        )
                                    }
                                </div>

                            </Col>

                        </Row>

                    </FuenteCard>

                </Col>


                {/*
                |--------------------------------------------------------------------------
                | SNAPSHOTS
                |--------------------------------------------------------------------------
                */}

                <Col
                    xl={3}
                    md={6}
                >

                    <FuenteCard
                        titulo="Precios y promociones"
                        estado={
                            snapshots.estado
                        }
                        ultimaFecha={
                            snapshots.ultima_fecha
                        }
                    >

                        <Row className="g-2">

                            <Col xs={6}>

                                <div className="small text-muted">
                                    Precios
                                </div>

                                <div className="fs-5 fw-semibold">
                                    {
                                        formatearNumero(
                                            snapshots.precios
                                        )
                                    }
                                </div>

                            </Col>


                            <Col xs={6}>

                                <div className="small text-muted">
                                    Promociones
                                </div>

                                <div className="fs-5 fw-semibold">
                                    {
                                        formatearNumero(
                                            snapshots.promociones
                                        )
                                    }
                                </div>

                            </Col>

                        </Row>


                        {
                            snapshots.dias_desde_ultimo_dato !==
                                null &&
                            snapshots.dias_desde_ultimo_dato !==
                                undefined && (

                                <div className="small text-muted mt-3">

                                    Última instantánea hace {
                                        snapshots.dias_desde_ultimo_dato
                                    } día(s)

                                </div>

                            )
                        }

                    </FuenteCard>

                </Col>


                {/*
                |--------------------------------------------------------------------------
                | CLIMA
                |--------------------------------------------------------------------------
                */}

                <Col
                    xl={3}
                    md={6}
                >

                    <FuenteCard
                        titulo="Clima"
                        estado={
                            clima.estado
                        }
                        ultimaFecha={
                            clima.ultima_fecha
                        }
                    >

                        <Row className="g-2">

                            <Col xs={4}>

                                <div className="small text-muted">
                                    Mín.
                                </div>

                                <div className="fw-semibold">
                                    {
                                        formatearTemperatura(
                                            climaRegistro.temperatura_min
                                        )
                                    }
                                </div>

                            </Col>


                            <Col xs={4}>

                                <div className="small text-muted">
                                    Media
                                </div>

                                <div className="fw-semibold">
                                    {
                                        formatearTemperatura(
                                            climaRegistro.temperatura_media
                                        )
                                    }
                                </div>

                            </Col>


                            <Col xs={4}>

                                <div className="small text-muted">
                                    Máx.
                                </div>

                                <div className="fw-semibold">
                                    {
                                        formatearTemperatura(
                                            climaRegistro.temperatura_max
                                        )
                                    }
                                </div>

                            </Col>

                        </Row>


                        <div className="small text-muted mt-3">

                            Precipitación: {
                                formatearDecimal(
                                    climaRegistro.precipitacion_mm,
                                    " mm"
                                )
                            }

                        </div>

                    </FuenteCard>

                </Col>

            </Row>


            {/*
            |--------------------------------------------------------------------------
            | RESUMEN DE EVENTOS
            |--------------------------------------------------------------------------
            */}

            <Row className="g-3 mb-4">

                <Col
                    lg={8}
                >

                    <Card className="h-100 shadow-sm">

                        <Card.Header className="bg-white">

                            <div className="fw-semibold">
                                Eventos registrados
                            </div>

                        </Card.Header>


                        <Card.Body>

                            <Row className="g-3">

                                <Col
                                    sm={6}
                                    lg={3}
                                >

                                    <div className="small text-muted">
                                        Total activos
                                    </div>

                                    <div className="fs-4 fw-semibold">
                                        {
                                            formatearNumero(
                                                eventos.total
                                            )
                                        }
                                    </div>

                                </Col>


                                {
                                    Object.entries(
                                        eventos.por_categoria ||
                                        {}
                                    ).map(
                                        ([
                                            categoria,
                                            cantidad,
                                        ]) => (

                                            <Col
                                                sm={6}
                                                lg={3}
                                                key={
                                                    categoria
                                                }
                                            >

                                                <div className="small text-muted">
                                                    {
                                                        categoria
                                                    }
                                                </div>

                                                <div className="fs-4 fw-semibold">
                                                    {
                                                        formatearNumero(
                                                            cantidad
                                                        )
                                                    }
                                                </div>

                                            </Col>

                                        )
                                    )
                                }

                            </Row>

                        </Card.Body>

                    </Card>

                </Col>


                <Col
                    lg={4}
                >

                    <Card className="h-100 shadow-sm">

                        <Card.Header className="bg-white">

                            <div className="fw-semibold">
                                Actividad de hoy
                            </div>

                        </Card.Header>


                        <Card.Body>

                            <div className="small text-muted">
                                Eventos activos
                            </div>

                            <div className="display-6 fw-semibold">
                                {
                                    formatearNumero(
                                        eventosHoy.length
                                    )
                                }
                            </div>


                            {
                                eventosHoy.length > 0
                                    ? (

                                        <div className="mt-3">

                                            {
                                                eventosHoy
                                                    .slice(0, 4)
                                                    .map(
                                                        (evento) => (

                                                            <div
                                                                key={
                                                                    evento.id
                                                                }
                                                                className="
                                                                    border-top
                                                                    py-2
                                                                "
                                                            >

                                                                <div className="fw-semibold">
                                                                    {
                                                                        evento.nombre
                                                                    }
                                                                </div>

                                                                <div className="small text-muted">
                                                                    {
                                                                        evento.categoria
                                                                    }
                                                                    {" · "}
                                                                    {
                                                                        evento.tipo
                                                                    }
                                                                </div>

                                                            </div>

                                                        )
                                                    )
                                            }

                                        </div>

                                    )
                                    : (

                                        <div className="text-muted mt-3">
                                            No hay eventos activos hoy.
                                        </div>

                                    )
                            }

                        </Card.Body>

                    </Card>

                </Col>

            </Row>


            {/*
            |--------------------------------------------------------------------------
            | PRÓXIMOS EVENTOS
            |--------------------------------------------------------------------------
            */}

            <Card className="shadow-sm">

                <Card.Header
                    className="
                        bg-white
                        d-flex
                        justify-content-between
                        align-items-center
                    "
                >

                    <div>

                        <div className="fw-semibold">
                            Próximos eventos
                        </div>

                        <div className="small text-muted">
                            Próximos acontecimientos registrados
                            que pueden influir en las ventas.
                        </div>

                    </div>


                    <Badge bg="secondary">
                        {
                            proximosEventos.length
                        }
                    </Badge>

                </Card.Header>


                <Card.Body>

                    {
                        proximosEventos.length === 0
                            ? (

                                <Alert
                                    variant="secondary"
                                    className="mb-0"
                                >
                                    No hay próximos eventos registrados.
                                </Alert>

                            )
                            : (

                                <ERPTable

                                    columns={
                                        columnasEventos
                                    }

                                    data={
                                        proximosEventos
                                    }

                                />

                            )
                    }

                </Card.Body>

            </Card>

        </ERPPage>

    );

};


export default InteligenciaDashboardPage;