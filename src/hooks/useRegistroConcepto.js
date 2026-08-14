import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import motorConceptoRegistroApi
    from "../services/motorConceptoRegistroApi";

import motorConceptoApi
    from "../services/motorConceptoApi";

import {
    normalizeValues,
    serializeValues,
} from "../utils/motorConceptos/registroValues";

const errorMessage = (
    error,
    fallback
) =>
    error?.response?.data?.message ||
    error?.message ||
    fallback;

export const useRegistroConcepto = (
    registroId
) => {

    const isNew =
        !registroId ||
        registroId === "nuevo";

    const [
        registro,
        setRegistro,
    ] = useState(null);

    const [
        concepto,
        setConcepto,
    ] = useState(null);

    const [
        valores,
        setValores,
    ] = useState({});

    const [
        datosIniciales,
        setDatosIniciales,
    ] = useState({
        concepto_id: "",
        entidad_tipo_id: "",
        entidad_id: "",
        observaciones: "",
        fecha_vencimiento: null,
    });

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    // const concepto =
    //     registro?.concepto ||
    //     null;

    const versionActual =
        registro?.versionActual ||
        registro?.version_actual ||
        null;

    const campos =
        useMemo(
            () =>
                Array.isArray(
                    concepto?.campos
                )
                    ? [...concepto.campos]
                        .filter(
                            (field) =>
                                field.activo !== false
                        )
                        .sort(
                            (a, b) =>
                                Number(
                                    a.orden || 0
                                ) -
                                Number(
                                    b.orden || 0
                                )
                        )
                    : [],
            [
                concepto,
            ]
        );

    const reglas =
        useMemo(
            () =>
                Array.isArray(
                    concepto?.reglas
                )
                    ? concepto.reglas
                    : [],
            [
                concepto,
            ]
        );



    const cargar =
        useCallback(
            async () => {

                if (
                    isNew
                ) {

                    setDatosIniciales({
                        concepto_id: "",
                        entidad_tipo_id: "",
                        entidad_id: "",
                        observaciones: "",
                        fecha_vencimiento: null,
                    });

                    setRegistro(null);
                    setConcepto(null);
                    setValores({});
                    setError("");
                    setMessage("");
                    setLoading(false);

                    return;

                }

                setLoading(true);
                setError("");

                try {

                    const response =
                        await motorConceptoRegistroApi
                            .obtener(
                                registroId
                            );


                    setRegistro(
                        response
                    );

                    /*
                     * El registro trae solamente una versión
                     * resumida del concepto.
                     *
                     * Para editar necesitamos la configuración
                     * completa:
                     * - campos
                     * - reglas
                     * - tipos de archivo
                     * - vencimiento
                     * - versiones
                     */
                    const conceptoResponse =
                        response?.concepto_id
                            ? await motorConceptoApi.obtener(
                                response.concepto_id
                            )
                            : null;

                    setConcepto(
                        conceptoResponse
                    );

                    setDatosIniciales({
                        concepto_id:
                            response.concepto_id,

                        entidad_tipo_id:
                            response.entidad_tipo_id,

                        entidad_id:
                            response.entidad_id,

                        observaciones:
                            response.observaciones || "",

                        fecha_vencimiento:
                            response.fecha_vencimiento || null,
                    });

                    setValores(
                        normalizeValues(
                            response
                                ?.versionActual
                                ?.valores ||
                            response
                                ?.version_actual
                                ?.valores ||
                            response
                                ?.valores ||
                            []
                        )
                    );

                } catch (err) {

                    setError(
                        errorMessage(
                            err,
                            "No se pudo cargar el registro"
                        )
                    );

                } finally {

                    setLoading(false);

                }

            },
            [
                registroId,
                isNew,
            ]
        );

    const cargarConcepto =
        useCallback(
            async (conceptoId) => {

                if (!conceptoId) {

                    setConcepto(null);

                    return;

                }

                const response =
                    await motorConceptoApi.obtener(
                        conceptoId
                    );

                setConcepto(
                    response
                );

            },
            []
        );

    useEffect(
        () => {

            cargar();

        },
        [
            cargar,
        ]
    );

    const setValor =
        (
            campoId,
            value
        ) => {

            setValores(
                (current) => ({
                    ...current,
                    [campoId]:
                        value,
                })
            );

        };

    const run =
        useCallback(
            async (
                action,
                successMessage
            ) => {

                setSaving(true);
                setError("");
                setMessage("");

                try {

                    const response =
                        await action();

                    setMessage(
                        successMessage
                    );

                    /*
                     * En creación no se vuelve a ejecutar cargar(),
                     * porque el registroId todavía representa una
                     * ruta nueva y cargar() limpiaría el estado.
                     *
                     * La página navegará al registro creado usando
                     * el id devuelto por la API.
                     */
                    if (
                        !isNew
                    ) {

                        await cargar();

                    }

                    return response;

                } catch (err) {

                    setError(
                        errorMessage(
                            err,
                            "No se pudo completar la operación"
                        )
                    );

                    throw err;

                } finally {

                    setSaving(false);

                }

            },
            [
                cargar,
                isNew,
            ]
        );

    const guardar =
        async (
            extra = {}
        ) => {

            if (
                isNew
            ) {


                const payload = {
                    ...datosIniciales,
                    ...extra,

                    valores:
                        serializeValues(
                            campos,
                            valores
                        ),
                };



                return run(
                    () =>
                        motorConceptoRegistroApi
                            .crear(
                                payload
                            ),
                    "Registro creado correctamente"
                );

            }

            const payload = {
                observaciones:
                    datosIniciales.observaciones,

                fecha_vencimiento:
                    datosIniciales.fecha_vencimiento,

                valores:
                    serializeValues(
                        campos,
                        valores
                    ),

                ...extra,
            };

            return run(
                () =>
                    motorConceptoRegistroApi
                        .actualizar(
                            registroId,
                            payload
                        ),
                "Registro guardado correctamente"
            );

        };

    const guardarBorrador =
        async (
            extra = {}
        ) =>
            guardar({
                ...extra,

                estado:
                    "BORRADOR",
            });

    const finalizar =
        async () => {

            if (
                isNew
            ) {

                throw new Error(
                    "Debe guardar el registro antes de finalizar."
                );

            }

            return run(
                async () => {

                    await motorConceptoRegistroApi
                        .guardarValores(
                            registroId,
                            {
                                valores:
                                    serializeValues(
                                        campos,
                                        valores
                                    ),
                            }
                        );

                    await motorConceptoRegistroApi
                        .validarArchivosObligatorios(
                            registroId
                        );

                    return motorConceptoRegistroApi
                        .cambiarEstado(
                            registroId,
                            "VIGENTE"
                        );

                },
                "Registro finalizado correctamente"
            );

        };

    const crearVersion =
        async (
            payload = {}
        ) => {

            if (
                isNew
            ) {

                throw new Error(
                    "Debe guardar el registro antes de crear una versión."
                );

            }

            return run(
                () =>
                    motorConceptoRegistroApi
                        .crearVersion(
                            registroId,
                            payload
                        ),
                "Nueva versión creada correctamente"
            );

        };





    const clearMessages =
        () => {

            setError("");
            setMessage("");

        };

    return {
        isNew,

        datosIniciales,
        setDatosIniciales,

        registro,
        concepto,
        versionActual,

        campos,
        reglas,
        valores,

        loading,
        saving,
        error,
        message,

        setValor,
        cargar,
        guardar,
        guardarBorrador,
        finalizar,
        crearVersion,
        clearMessages,
        cargarConcepto
    };

};

export default useRegistroConcepto;