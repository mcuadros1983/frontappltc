import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Badge,
    Col,
    Row,
    Spinner,
} from "react-bootstrap";

import {
    ERPModal,
    ERPButton,
} from "../../../components/common/erp";

import inteligenciaClimaApi
    from "../../../services/inteligencia/inteligenciaClimaService";


const InteligenciaClimaDetalleModal = ({

    show,

    registro,

    onHide,

}) => {

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
            !registro?.id
        ) {

            setDetalle(null);

            return;

        }


        const cargar =
            async () => {

                setLoading(true);

                setError("");

                setDetalle(null);


                try {

                    const data =
                        await inteligenciaClimaApi
                            .obtener(
                                registro.id
                            );


                    setDetalle(
                        data?.clima ||
                        data?.data ||
                        data
                    );

                }
                catch (err) {

                    console.error(
                        "Error cargando detalle climático:",
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
        registro?.id,
    ]);


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

            title="Detalle climático"

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

                            <Spinner
                                animation="border"
                            />

                            <div className="mt-2">
                                Cargando información...
                            </div>

                        </div>

                    )
                    : detalle
                        ? (

                            <>

                                {/*
                                |--------------------------------------------------------------------------
                                | FECHA + CONDICIÓN
                                |--------------------------------------------------------------------------
                                */}

                                <div
                                    className="d-flex justify-content-between align-items-start mb-4"
                                >

                                    <div>

                                        <div
                                            className="small text-muted"
                                        >
                                            Fecha
                                        </div>

                                        <h4 className="mb-0">

                                            {
                                                formatearFecha(
                                                    detalle.fecha
                                                )
                                            }

                                        </h4>

                                    </div>


                                    <Badge

                                        bg="light"

                                        text="dark"

                                        className="border fs-6"

                                    >
                                        {
                                            obtenerDescripcionClima(
                                                detalle.codigo_clima
                                            )
                                        }
                                    </Badge>

                                </div>


                                {/*
                                |--------------------------------------------------------------------------
                                | TEMPERATURAS
                                |--------------------------------------------------------------------------
                                */}

                                <Row
                                    className="g-3 mb-4"
                                >

                                    <Col
                                        md={4}
                                    >

                                        <TarjetaDato

                                            titulo="Temperatura mínima"

                                            valor={
                                                formatearTemperatura(
                                                    detalle.temperatura_min
                                                )
                                            }

                                        />

                                    </Col>


                                    <Col
                                        md={4}
                                    >

                                        <TarjetaDato

                                            titulo="Temperatura media"

                                            valor={
                                                formatearTemperatura(
                                                    detalle.temperatura_media
                                                )
                                            }

                                            destacado

                                        />

                                    </Col>


                                    <Col
                                        md={4}
                                    >

                                        <TarjetaDato

                                            titulo="Temperatura máxima"

                                            valor={
                                                formatearTemperatura(
                                                    detalle.temperatura_max
                                                )
                                            }

                                        />

                                    </Col>

                                </Row>


                                {/*
                                |--------------------------------------------------------------------------
                                | LLUVIA Y VIENTO
                                |--------------------------------------------------------------------------
                                */}

                                <Row
                                    className="g-3 mb-4"
                                >

                                    <Col
                                        md={6}
                                    >

                                        <TarjetaDato

                                            titulo="Precipitación"

                                            valor={
                                                formatearUnidad(
                                                    detalle.precipitacion_mm,
                                                    "mm"
                                                )
                                            }

                                        />

                                    </Col>


                                    <Col
                                        md={6}
                                    >

                                        <TarjetaDato

                                            titulo="Viento máximo"

                                            valor={
                                                formatearUnidad(
                                                    detalle.viento_max_kmh,
                                                    "km/h"
                                                )
                                            }

                                        />

                                    </Col>

                                </Row>


                                {/*
                                |--------------------------------------------------------------------------
                                | INFORMACIÓN TÉCNICA
                                |--------------------------------------------------------------------------
                                */}

                                <div
                                    className="border rounded p-3"
                                >

                                    <div
                                        className="fw-semibold mb-3"
                                    >
                                        Información del registro
                                    </div>


                                    <Row
                                        className="g-3"
                                    >

                                        <Col
                                            md={4}
                                        >

                                            <Dato

                                                label="Código climático"

                                                value={
                                                    detalle.codigo_clima ??
                                                    "-"
                                                }

                                            />

                                        </Col>


                                        <Col
                                            md={4}
                                        >

                                            <Dato

                                                label="Fuente"

                                                value={
                                                    detalle.fuente ||
                                                    "-"
                                                }

                                            />

                                        </Col>


                                        <Col
                                            md={4}
                                        >

                                            <Dato

                                                label="Registrado"

                                                value={
                                                    formatearFechaHora(
                                                        detalle.createdAt
                                                    )
                                                }

                                            />

                                        </Col>

                                    </Row>

                                </div>

                            </>

                        )
                        : !error && (

                            <div
                                className="text-center text-muted py-5"
                            >
                                No hay información climática para mostrar.
                            </div>

                        )
            }

        </ERPModal>

    );

};


/*
|--------------------------------------------------------------------------
| TARJETA
|--------------------------------------------------------------------------
*/

const TarjetaDato = ({

    titulo,

    valor,

    destacado = false,

}) => (

    <div
        className={
            `border rounded p-3 h-100 ${
                destacado
                    ? "shadow-sm"
                    : ""
            }`
        }
    >

        <div
            className="small text-muted mb-1"
        >
            {titulo}
        </div>


        <div
            className="fs-4 fw-semibold"
        >
            {valor}
        </div>

    </div>

);


/*
|--------------------------------------------------------------------------
| DATO
|--------------------------------------------------------------------------
*/

const Dato = ({

    label,

    value,

}) => (

    <div>

        <div
            className="small text-muted"
        >
            {label}
        </div>

        <div className="fw-medium">
            {value}
        </div>

    </div>

);


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatearTemperatura =
    (valor) =>
        formatearUnidad(
            valor,
            "°C"
        );


const formatearUnidad =
    (
        valor,
        unidad
    ) => {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            return "-";
        }


        const numero =
            Number(valor);


        if (
            !Number.isFinite(numero)
        ) {
            return "-";
        }


        return (
            `${new Intl.NumberFormat(
                "es-AR",
                {
                    maximumFractionDigits: 1,
                }
            ).format(numero)} ${unidad}`
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


const formatearFechaHora =
    (fecha) => {

        if (!fecha) {
            return "-";
        }


        const date =
            new Date(fecha);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return fecha;
        }


        return new Intl.DateTimeFormat(
            "es-AR",
            {
                dateStyle: "short",
                timeStyle: "short",
            }
        ).format(date);

    };


const obtenerDescripcionClima =
    (codigo) => {

        if (
            codigo === null ||
            codigo === undefined
        ) {
            return "Sin información";
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
            descripciones[
                Number(codigo)
            ] ||
            `Código ${codigo}`
        );

    };


const obtenerMensajeError =
    (error) => {

        const mensaje =
            error?.message ||
            "No se pudo cargar la información climática.";


        try {

            const parsed =
                JSON.parse(mensaje);


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


export default InteligenciaClimaDetalleModal;