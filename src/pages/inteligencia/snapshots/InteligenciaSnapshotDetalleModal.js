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
    Table,
} from "react-bootstrap";

import Contexts
    from "../../../context/Contexts";

import {
    ERPModal,
    ERPButton,
} from "../../../components/common/erp";

import inteligenciaSnapshotApi
    from "../../../services/inteligencia/inteligenciaSnapshotService";


/*
|--------------------------------------------------------------------------
| DÍAS DE LA SEMANA
|--------------------------------------------------------------------------
*/

const DIAS_SEMANA = {

    1: "Lunes",

    2: "Martes",

    3: "Miércoles",

    4: "Jueves",

    5: "Viernes",

    6: "Sábado",

    7: "Domingo",

};


/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

const InteligenciaSnapshotDetalleModal = ({

    show,

    snapshot = null,

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

        articulosTabla = [],

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
    | CARGAR SNAPSHOT COMPLETO
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (
            !show ||
            !snapshot?.id
        ) {

            setDetalle(null);

            return;

        }


        const cargarDetalle =
            async () => {

                setLoading(true);

                setError("");

                setDetalle(null);


                try {

                    const data =
                        await inteligenciaSnapshotApi
                            .obtener(
                                snapshot.id
                            );


                    setDetalle(
                        data?.snapshot ||
                        data?.data ||
                        data
                    );

                }
                catch (err) {

                    console.error(
                        "Error cargando detalle del snapshot:",
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


        cargarDetalle();

    }, [
        show,
        snapshot?.id,
    ]);


    /*
    |--------------------------------------------------------------------------
    | MAPA DE ARTÍCULOS
    |--------------------------------------------------------------------------
    */

    const articulosMap =
        useMemo(
            () => {

                const map =
                    new Map();


                articulosTabla.forEach(
                    (articulo) => {

                        if (
                            articulo?.id === undefined ||
                            articulo?.id === null
                        ) {
                            return;
                        }


                        map.set(
                            Number(
                                articulo.id
                            ),
                            articulo
                        );

                    }
                );


                return map;

            },
            [
                articulosTabla,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | PRECIOS
    |--------------------------------------------------------------------------
    */

    const precios =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        detalle?.precios
                    )
                ) {
                    return [];
                }


                return [
                    ...detalle.precios,
                ].sort(
                    (a, b) => {

                        const nombreA =
                            obtenerNombreArticulo(
                                a,
                                articulosMap
                            );


                        const nombreB =
                            obtenerNombreArticulo(
                                b,
                                articulosMap
                            );


                        return nombreA
                            .localeCompare(
                                nombreB,
                                "es"
                            );

                    }
                );

            },
            [
                detalle,
                articulosMap,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | PROMOCIONES
    |--------------------------------------------------------------------------
    */

    const promociones =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        detalle?.promociones
                    )
                ) {
                    return [];
                }


                return detalle.promociones;

            },
            [
                detalle,
            ]
        );


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

            title="Detalle de instantánea comercial"

            size="xl"

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

                            <Spinner
                                animation="border"
                            />

                            <div className="mt-2">
                                Cargando instantánea...
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
                                        className="small text-muted"
                                    >
                                        Instantánea comercial
                                    </div>


                                    <h4 className="mb-1">

                                        {
                                            formatearFecha(
                                                detalle.fecha
                                            )
                                        }

                                    </h4>


                                    {
                                        detalle.observaciones && (

                                            <div
                                                className="text-muted"
                                                style={{
                                                    whiteSpace:
                                                        "pre-wrap",
                                                }}
                                            >
                                                {
                                                    detalle.observaciones
                                                }
                                            </div>

                                        )
                                    }

                                </div>


                                {/*
                                |--------------------------------------------------------------------------
                                | RESUMEN
                                |--------------------------------------------------------------------------
                                */}

                                <Row
                                    className="g-3 mb-4"
                                >

                                    <Col
                                        md={6}
                                    >

                                        <div
                                            className="border rounded p-3 h-100"
                                        >

                                            <div
                                                className="small text-muted"
                                            >
                                                Precios capturados
                                            </div>


                                            <div
                                                className="fs-3 fw-semibold"
                                            >
                                                {
                                                    precios.length
                                                }
                                            </div>

                                        </div>

                                    </Col>


                                    <Col
                                        md={6}
                                    >

                                        <div
                                            className="border rounded p-3 h-100"
                                        >

                                            <div
                                                className="small text-muted"
                                            >
                                                Promociones capturadas
                                            </div>


                                            <div
                                                className="fs-3 fw-semibold"
                                            >
                                                {
                                                    promociones.length
                                                }
                                            </div>

                                        </div>

                                    </Col>

                                </Row>


                                {/*
                                |--------------------------------------------------------------------------
                                | PRECIOS
                                |--------------------------------------------------------------------------
                                */}

                                <div className="mb-5">

                                    <div
                                        className="d-flex justify-content-between align-items-center mb-3"
                                    >

                                        <h5 className="mb-0">
                                            Precios capturados
                                        </h5>


                                        <Badge
                                            bg="light"
                                            text="dark"
                                            className="border"
                                        >
                                            {
                                                precios.length
                                            }{" "}
                                            artículos
                                        </Badge>

                                    </div>


                                    {
                                        precios.length === 0
                                            ? (

                                                <Alert
                                                    variant="secondary"
                                                >
                                                    No hay precios registrados
                                                    en esta instantánea.
                                                </Alert>

                                            )
                                            : (

                                                <div
                                                    className="table-responsive"
                                                    style={{
                                                        maxHeight:
                                                            "350px",
                                                        overflowY:
                                                            "auto",
                                                    }}
                                                >

                                                    <Table

                                                        striped

                                                        hover

                                                        size="sm"

                                                        className="mb-0"

                                                    >

                                                        <thead>

                                                            <tr>

                                                                <th>
                                                                    Artículo
                                                                </th>

                                                                <th
                                                                    style={{
                                                                        width:
                                                                            "180px",
                                                                    }}
                                                                >
                                                                    Código
                                                                </th>

                                                                <th
                                                                    className="text-end"
                                                                    style={{
                                                                        width:
                                                                            "180px",
                                                                    }}
                                                                >
                                                                    Precio
                                                                </th>

                                                            </tr>

                                                        </thead>


                                                        <tbody>

                                                            {
                                                                precios.map(
                                                                    (
                                                                        item
                                                                    ) => {

                                                                        const articulo =
                                                                            obtenerArticulo(
                                                                                item,
                                                                                articulosMap
                                                                            );


                                                                        return (

                                                                            <tr
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                            >

                                                                                <td>

                                                                                    {
                                                                                        obtenerNombreArticulo(
                                                                                            item,
                                                                                            articulosMap
                                                                                        )
                                                                                    }

                                                                                </td>


                                                                                <td>

                                                                                    {
                                                                                        articulo
                                                                                            ?.codigobarra ||
                                                                                        "-"
                                                                                    }

                                                                                </td>


                                                                                <td
                                                                                    className="text-end fw-semibold"
                                                                                >

                                                                                    {
                                                                                        formatearMoneda(
                                                                                            item.precio
                                                                                        )
                                                                                    }

                                                                                </td>

                                                                            </tr>

                                                                        );

                                                                    }
                                                                )
                                                            }

                                                        </tbody>

                                                    </Table>

                                                </div>

                                            )
                                    }

                                </div>


                                {/*
                                |--------------------------------------------------------------------------
                                | PROMOCIONES
                                |--------------------------------------------------------------------------
                                */}

                                <div>

                                    <div
                                        className="d-flex justify-content-between align-items-center mb-3"
                                    >

                                        <h5 className="mb-0">
                                            Promociones capturadas
                                        </h5>


                                        <Badge
                                            bg="light"
                                            text="dark"
                                            className="border"
                                        >
                                            {
                                                promociones.length
                                            }{" "}
                                            promociones
                                        </Badge>

                                    </div>


                                    {
                                        promociones.length === 0
                                            ? (

                                                <Alert
                                                    variant="secondary"
                                                >
                                                    No había promociones
                                                    registradas para esta fecha.
                                                </Alert>

                                            )
                                            : (

                                                <div
                                                    className="d-flex flex-column gap-3"
                                                >

                                                    {
                                                        promociones.map(
                                                            (
                                                                promocion
                                                            ) => (

                                                                <PromocionDetalle

                                                                    key={
                                                                        promocion.id
                                                                    }

                                                                    promocion={
                                                                        promocion
                                                                    }

                                                                    articulosMap={
                                                                        articulosMap
                                                                    }

                                                                    fechaSnapshot={
                                                                        detalle.fecha
                                                                    }

                                                                />

                                                            )
                                                        )
                                                    }

                                                </div>

                                            )
                                    }

                                </div>

                            </>

                        )
                        : !error && (

                            <div
                                className="text-center text-muted py-5"
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
| DETALLE DE PROMOCIÓN
|--------------------------------------------------------------------------
*/

const PromocionDetalle = ({

    promocion,

    articulosMap,

    fechaSnapshot,

}) => {

    const dias =
        normalizarDiasSemana(
            promocion.dias_semana
        );


    const articulos =
        normalizarArticulosPromocion(
            promocion.articulos
        );


    /*
    |--------------------------------------------------------------------------
    | DETERMINAR SI APLICABA EL DÍA DEL SNAPSHOT
    |--------------------------------------------------------------------------
    |
    | Recordemos:
    |
    | - fecha_desde / fecha_hasta definen vigencia general.
    | - dias_semana define los días efectivos.
    |
    | Ejemplo:
    |
    | vigencia 01/08 -> 31/08
    | días [4, 5]
    |
    | solamente jueves y viernes.
    |--------------------------------------------------------------------------
    */

    const aplicabaEseDia =
        promocionAplicabaEnFecha(
            promocion,
            fechaSnapshot
        );


    return (

        <div
            className="border rounded p-3"
        >

            {/*
            |--------------------------------------------------------------------------
            | CABECERA
            |--------------------------------------------------------------------------
            */}

            <div
                className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3"
            >

                <div>

                    <div
                        className="fw-semibold"
                    >
                        {
                            promocion.descripcion
                        }
                    </div>


                    <div
                        className="small text-muted"
                    >
                        Promoción origen #
                        {
                            promocion.promocion_origen_id ??
                            "-"
                        }
                    </div>

                </div>


                <div
                    className="d-flex gap-2 flex-wrap"
                >

                    <Badge
                        bg={
                            promocion.tipo_promocion ===
                            "porcentaje"
                                ? "success"
                                : "primary"
                        }
                    >

                        {
                            promocion.tipo_promocion ===
                            "porcentaje"
                                ? "Porcentaje"
                                : promocion.tipo_promocion ===
                                  "precio_fijo"
                                    ? "Precio fijo"
                                    : promocion.tipo_promocion
                        }

                    </Badge>


                    <Badge
                        bg={
                            aplicabaEseDia
                                ? "success"
                                : "secondary"
                        }
                    >

                        {
                            aplicabaEseDia
                                ? "Aplicaba este día"
                                : "No aplicaba este día"
                        }

                    </Badge>

                </div>

            </div>


            {/*
            |--------------------------------------------------------------------------
            | VIGENCIA
            |--------------------------------------------------------------------------
            */}

            <Row
                className="g-3 mb-3"
            >

                <Col
                    md={4}
                >

                    <DatoDetalle

                        label="Desde"

                        value={
                            formatearFecha(
                                promocion.fecha_desde
                            )
                        }

                    />

                </Col>


                <Col
                    md={4}
                >

                    <DatoDetalle

                        label="Hasta"

                        value={
                            formatearFecha(
                                promocion.fecha_hasta
                            )
                        }

                    />

                </Col>


                <Col
                    md={4}
                >

                    <DatoDetalle

                        label="Prioridad"

                        value={
                            promocion.prioridad ??
                            0
                        }

                    />

                </Col>

            </Row>


            {/*
            |--------------------------------------------------------------------------
            | DÍAS
            |--------------------------------------------------------------------------
            */}

            <div className="mb-3">

                <div
                    className="small text-muted mb-2"
                >
                    Días de aplicación
                </div>


                {
                    dias.length > 0
                        ? (

                            <div
                                className="d-flex flex-wrap gap-1"
                            >

                                {
                                    dias.map(
                                        (dia) => (

                                            <Badge

                                                key={
                                                    dia
                                                }

                                                bg="light"

                                                text="dark"

                                                className="border"

                                            >
                                                {
                                                    DIAS_SEMANA[
                                                        dia
                                                    ] ||
                                                    `Día ${dia}`
                                                }
                                            </Badge>

                                        )
                                    )
                                }

                            </div>

                        )
                        : (

                            <span className="text-muted">
                                Todos los días
                            </span>

                        )
                }

            </div>


            {/*
            |--------------------------------------------------------------------------
            | ARTÍCULOS
            |--------------------------------------------------------------------------
            */}

            <div>

                <div
                    className="small text-muted mb-2"
                >
                    {
                        promocion.aplica_todos
                            ? "Aplicación"
                            : "Artículos incluidos"
                    }
                </div>


                {
                    promocion.aplica_todos
                        ? (

                            <Badge
                                bg="info"
                            >
                                Todos los artículos
                            </Badge>

                        )
                        : articulos.length === 0
                            ? (

                                <span
                                    className="text-muted"
                                >
                                    Sin artículos registrados
                                </span>

                            )
                            : (

                                <div
                                    className="table-responsive"
                                >

                                    <Table
                                        size="sm"
                                        bordered
                                        className="mb-0"
                                    >

                                        <thead>

                                            <tr>

                                                <th>
                                                    Artículo
                                                </th>

                                                <th
                                                    className="text-end"
                                                    style={{
                                                        width:
                                                            "180px",
                                                    }}
                                                >

                                                    {
                                                        promocion.tipo_promocion ===
                                                        "porcentaje"
                                                            ? "Descuento"
                                                            : "Precio promoción"
                                                    }

                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                articulos.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => {

                                                        const articulo =
                                                            articulosMap.get(
                                                                Number(
                                                                    item.articulo_id
                                                                )
                                                            );


                                                        return (

                                                            <tr
                                                                key={
                                                                    `${item.articulo_id}-${index}`
                                                                }
                                                            >

                                                                <td>

                                                                    {
                                                                        articulo
                                                                            ?.descripcion ||
                                                                        articulo
                                                                            ?.descripcionreducida ||
                                                                        `Artículo #${item.articulo_id}`
                                                                    }

                                                                </td>


                                                                <td
                                                                    className="text-end fw-semibold"
                                                                >

                                                                    {
                                                                        promocion.tipo_promocion ===
                                                                        "porcentaje"
                                                                            ? `${formatearNumero(
                                                                                item.valor
                                                                            )}%`
                                                                            : formatearMoneda(
                                                                                item.valor
                                                                            )
                                                                    }

                                                                </td>

                                                            </tr>

                                                        );

                                                    }
                                                )
                                            }

                                        </tbody>

                                    </Table>

                                </div>

                            )
                }

            </div>

        </div>

    );

};


/*
|--------------------------------------------------------------------------
| DATO
|--------------------------------------------------------------------------
*/

const DatoDetalle = ({

    label,

    value,

}) => (

    <div>

        <div
            className="small text-muted"
        >
            {label}
        </div>


        <div
            className="fw-medium"
        >
            {
                value ??
                "-"
            }
        </div>

    </div>

);


/*
|--------------------------------------------------------------------------
| OBTENER ARTÍCULO
|--------------------------------------------------------------------------
*/

const obtenerArticulo =
    (
        precioHistorico,
        articulosMap
    ) => {

        /*
        | Si el backend incluye:
        |
        | articulo: {...}
        |
        | lo usamos directamente.
        */

        if (
            precioHistorico?.articulo
        ) {
            return precioHistorico.articulo;
        }


        return (
            articulosMap.get(
                Number(
                    precioHistorico?.articulo_id
                )
            ) ||
            null
        );

    };


const obtenerNombreArticulo =
    (
        precioHistorico,
        articulosMap
    ) => {

        const articulo =
            obtenerArticulo(
                precioHistorico,
                articulosMap
            );


        return (
            articulo?.descripcion ||
            articulo?.descripcionreducida ||
            `Artículo #${precioHistorico?.articulo_id}`
        );

    };


/*
|--------------------------------------------------------------------------
| NORMALIZAR JSONB
|--------------------------------------------------------------------------
*/

const normalizarDiasSemana =
    (dias) => {

        if (
            Array.isArray(dias)
        ) {

            return dias
                .map(Number)
                .filter(
                    (dia) =>
                        Number.isInteger(dia) &&
                        dia >= 1 &&
                        dia <= 7
                );

        }


        /*
        | Esto normalmente no será necesario con PostgreSQL + JSONB,
        | pero deja el frontend tolerante si en algún momento llega
        | serializado como string.
        */

        if (
            typeof dias ===
            "string"
        ) {

            try {

                const parsed =
                    JSON.parse(
                        dias
                    );


                if (
                    Array.isArray(parsed)
                ) {

                    return parsed
                        .map(Number)
                        .filter(
                            (dia) =>
                                Number.isInteger(dia) &&
                                dia >= 1 &&
                                dia <= 7
                        );

                }

            }
            catch {

                return [];

            }

        }


        return [];

    };


const normalizarArticulosPromocion =
    (articulos) => {

        if (
            Array.isArray(articulos)
        ) {
            return articulos;
        }


        if (
            typeof articulos ===
            "string"
        ) {

            try {

                const parsed =
                    JSON.parse(
                        articulos
                    );


                return Array.isArray(
                    parsed
                )
                    ? parsed
                    : [];

            }
            catch {

                return [];

            }

        }


        return [];

    };


/*
|--------------------------------------------------------------------------
| PROMOCIÓN APLICABLE EN FECHA
|--------------------------------------------------------------------------
*/

const promocionAplicabaEnFecha =
    (
        promocion,
        fecha
    ) => {

        if (
            !promocion ||
            !fecha
        ) {
            return false;
        }


        const fechaISO =
            String(fecha)
                .slice(0, 10);


        /*
        |--------------------------------------------------------------------------
        | VIGENCIA
        |--------------------------------------------------------------------------
        */

        if (
            promocion.fecha_desde &&
            fechaISO <
            String(
                promocion.fecha_desde
            ).slice(0, 10)
        ) {
            return false;
        }


        if (
            promocion.fecha_hasta &&
            fechaISO >
            String(
                promocion.fecha_hasta
            ).slice(0, 10)
        ) {
            return false;
        }


        /*
        |--------------------------------------------------------------------------
        | DÍAS DE SEMANA
        |--------------------------------------------------------------------------
        */

        const dias =
            normalizarDiasSemana(
                promocion.dias_semana
            );


        /*
        | Sin días configurados:
        | consideramos que aplica todos los días
        | dentro de la vigencia.
        */

        if (
            dias.length === 0
        ) {
            return true;
        }


        /*
        | Construimos la fecha en horario local sin usar
        | new Date("YYYY-MM-DD"), porque esa variante se
        | interpreta como UTC.
        */

        const [
            year,
            month,
            day,
        ] =
            fechaISO
                .split("-")
                .map(Number);


        const fechaLocal =
            new Date(
                year,
                month - 1,
                day
            );


        /*
        | JS:
        |
        | 0 domingo
        | 1 lunes
        | ...
        | 6 sábado
        |
        | Nuestro sistema:
        |
        | 1 lunes
        | ...
        | 7 domingo
        */

        const diaJs =
            fechaLocal.getDay();


        const diaSistema =
            diaJs === 0
                ? 7
                : diaJs;


        return dias.includes(
            diaSistema
        );

    };


/*
|--------------------------------------------------------------------------
| FORMATEADORES
|--------------------------------------------------------------------------
*/

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


const formatearMoneda =
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
                style:
                    "currency",

                currency:
                    "ARS",

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2,
            }
        ).format(
            numero
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
                maximumFractionDigits:
                    2,
            }
        ).format(
            numero
        );

    };


/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

const obtenerMensajeError =
    (error) => {

        const mensaje =
            error?.message ||
            "No se pudo cargar la instantánea comercial.";


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


export default InteligenciaSnapshotDetalleModal;