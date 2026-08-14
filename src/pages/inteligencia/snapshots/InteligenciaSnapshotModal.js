import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Form,
    Spinner,
} from "react-bootstrap";

import {
    ERPModal,
    ERPButton,
} from "../../../components/common/erp";

import inteligenciaSnapshotApi
    from "../../../services/inteligencia/inteligenciaSnapshotService";


/*
|--------------------------------------------------------------------------
| ESTADO INICIAL
|--------------------------------------------------------------------------
*/

const INITIAL_FORM = {

    fecha: "",

    observaciones: "",

};


/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

const InteligenciaSnapshotModal = ({

    show,

    onHide,

    onSaved,

}) => {

    /*
    |--------------------------------------------------------------------------
    | ESTADO
    |--------------------------------------------------------------------------
    */

    const [form, setForm] =
        useState(INITIAL_FORM);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [resultado, setResultado] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | INICIALIZAR AL ABRIR
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!show) {
            return;
        }


        setForm({
            fecha:
                obtenerFechaHoy(),

            observaciones:
                "",
        });


        setError("");

        setResultado(null);

        setSaving(false);

    }, [
        show,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CAMBIAR CAMPO
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
    | VALIDAR
    |--------------------------------------------------------------------------
    */

    const validar =
        () => {

            if (!form.fecha) {

                return "Debe indicar la fecha de la instantánea.";

            }


            return null;

        };


    /*
    |--------------------------------------------------------------------------
    | GENERAR SNAPSHOT
    |--------------------------------------------------------------------------
    */

    const handleGenerar =
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

            setResultado(null);


            try {

                const payload = {

                    fecha:
                        form.fecha,

                    observaciones:
                        form.observaciones
                            ?.trim() ||
                        null,

                };


                const data =
                    await inteligenciaSnapshotApi
                        .crear(
                            payload
                        );


                /*
                |--------------------------------------------------------------------------
                | RESPUESTA
                |--------------------------------------------------------------------------
                |
                | Nuestro service backend devuelve:
                |
                | {
                |   snapshot_id,
                |   fecha,
                |   precios_guardados,
                |   promociones_guardadas
                | }
                |
                | Pero soportamos también:
                |
                | {
                |   snapshot: {...}
                | }
                |
                | o:
                |
                | {
                |   data: {...}
                | }
                |
                |--------------------------------------------------------------------------
                */

                const resultadoFinal =
                    data?.snapshot ||
                    data?.data ||
                    data;


                setResultado(
                    resultadoFinal
                );

            }
            catch (err) {

                console.error(
                    "Error generando instantánea:",
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
    | CERRAR
    |--------------------------------------------------------------------------
    */

    const handleCerrar =
        async () => {

            if (saving) {
                return;
            }


            /*
            | Si se generó correctamente, actualizamos
            | el listado antes de cerrar.
            */

            if (
                resultado &&
                onSaved
            ) {

                await onSaved();

                return;

            }


            onHide?.();

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
                    : handleCerrar
            }

            title="Nueva instantánea comercial"

            size="md"

            footer={

                resultado
                    ? (

                        <ERPButton

                            type="save"

                            onClick={
                                handleCerrar
                            }

                        >
                            Finalizar
                        </ERPButton>

                    )
                    : (

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
                                    handleGenerar
                                }

                                disabled={
                                    saving ||
                                    !form.fecha
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

                                                Generando...
                                            </>
                                        )
                                        : "Generar instantánea"
                                }

                            </ERPButton>

                        </>

                    )

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
                resultado
                    ? (

                        /*
                        |--------------------------------------------------------------------------
                        | RESULTADO EXITOSO
                        |--------------------------------------------------------------------------
                        */

                        <>

                            <Alert
                                variant="success"
                            >

                                <div
                                    className="fw-semibold mb-1"
                                >
                                    Instantánea generada correctamente
                                </div>

                                <div>
                                    Se guardó el estado comercial correspondiente al{" "}
                                    <strong>
                                        {
                                            formatearFecha(
                                                resultado.fecha ||
                                                form.fecha
                                            )
                                        }
                                    </strong>.
                                </div>

                            </Alert>


                            <div
                                className="border rounded p-3"
                            >

                                <div
                                    className="d-flex justify-content-between align-items-center py-2 border-bottom"
                                >

                                    <span>
                                        Precios guardados
                                    </span>

                                    <strong>
                                        {
                                            resultado
                                                .precios_guardados ??
                                            0
                                        }
                                    </strong>

                                </div>


                                <div
                                    className="d-flex justify-content-between align-items-center py-2"
                                >

                                    <span>
                                        Promociones guardadas
                                    </span>

                                    <strong>
                                        {
                                            resultado
                                                .promociones_guardadas ??
                                            0
                                        }
                                    </strong>

                                </div>

                            </div>


                            {
                                form.observaciones && (

                                    <div className="mt-3">

                                        <div
                                            className="small text-muted mb-1"
                                        >
                                            Observaciones
                                        </div>

                                        <div
                                            style={{
                                                whiteSpace:
                                                    "pre-wrap",
                                            }}
                                        >
                                            {
                                                form.observaciones
                                            }
                                        </div>

                                    </div>

                                )
                            }

                        </>

                    )
                    : (

                        /*
                        |--------------------------------------------------------------------------
                        | FORMULARIO
                        |--------------------------------------------------------------------------
                        */

                        <>

                            <Alert
                                variant="info"
                            >

                                Esta operación guardará una copia histórica
                                de los precios actuales y de las promociones
                                correspondientes a la fecha seleccionada.

                            </Alert>


                            <Form.Group
                                className="mb-3"
                            >

                                <Form.Label>
                                    Fecha de la instantánea *
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

                                <Form.Text muted>

                                    Solo puede existir una instantánea
                                    comercial por fecha.

                                </Form.Text>

                            </Form.Group>


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

                                    placeholder={
                                        "Ej.: Cierre comercial semanal, actualización general de precios..."
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
| FECHA ACTUAL
|--------------------------------------------------------------------------
|
| No usamos:
|
| new Date().toISOString().slice(0, 10)
|
| porque toISOString() trabaja en UTC y cerca de medianoche puede devolver
| un día diferente al día local del usuario.
|--------------------------------------------------------------------------
*/

const obtenerFechaHoy =
    () => {

        const hoy =
            new Date();


        const year =
            hoy.getFullYear();

        const month =
            String(
                hoy.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                hoy.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            `${year}-${month}-${day}`
        );

    };


/*
|--------------------------------------------------------------------------
| FORMATEAR FECHA
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


/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

const obtenerMensajeError =
    (error) => {

        const mensaje =
            error?.message ||
            "No se pudo generar la instantánea comercial.";


        /*
        | Nuestro apiClient puede lanzar como Error.message
        | el JSON enviado por Express.
        */

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


export default InteligenciaSnapshotModal;