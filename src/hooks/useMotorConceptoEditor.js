import {
    useCallback,
    useEffect,
    useState,
} from "react";

import motorConceptoApi
    from "../services/motorConceptoApi";

const getErrorMessage = (
    error,
    fallback
) => {
    const message =
        error?.message ||
        fallback;

    try {
        const parsed =
            JSON.parse(message);

        return (
            parsed?.message ||
            parsed?.error ||
            message
        );
    } catch (_) {
        return message;
    }
};

export const useMotorConceptoEditor = (
    conceptoId
) => {

    const [
        concepto,
        setConcepto,
    ] = useState(null);

    const [
        entidadTipos,
        setEntidadTipos,
    ] = useState([]);

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

    const clearMessages =
        useCallback(() => {
            setError("");
            setMessage("");
        }, []);

    const reload =
        useCallback(async () => {
            setLoading(true);
            setError("");

            try {
                const [
                    conceptoResponse,
                    entidadTiposResponse,
                ] = await Promise.all([
                    motorConceptoApi
                        .obtener(
                            conceptoId
                        ),
                    motorConceptoApi
                        .listarEntidadTipos(),
                ]);

                setConcepto(
                    conceptoResponse
                );

                setEntidadTipos(
                    Array.isArray(
                        entidadTiposResponse
                    )
                        ? entidadTiposResponse
                        : []
                );
            } catch (err) {
                setError(
                    getErrorMessage(
                        err,
                        "No se pudo cargar el editor"
                    )
                );
            } finally {
                setLoading(false);
            }
        }, [conceptoId]);

    useEffect(() => {
        reload();
    }, [reload]);

    const run = useCallback(
        async (
            action,
            successMessage
        ) => {
            setSaving(true);
            clearMessages();

            try {
                const result =
                    await action();

                setMessage(
                    successMessage
                );

                await reload();

                return result;
            } catch (err) {
                setError(
                    getErrorMessage(
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
            clearMessages,
            reload,
        ]
    );

    return {
        concepto,
        entidadTipos,
        loading,
        saving,
        error,
        message,
        clearMessages,
        reload,

        actualizarGeneral:
            (payload) =>
                run(
                    () =>
                        motorConceptoApi
                            .actualizar(
                                conceptoId,
                                payload
                            ),
                    "Configuración general actualizada"
                ),

        crearCampo:
            (payload) =>
                run(
                    () =>
                        motorConceptoApi
                            .crearCampo(
                                conceptoId,
                                payload
                            ),
                    "Campo creado correctamente"
                ),

        actualizarCampo:
            (
                campoId,
                payload
            ) =>
                run(
                    () =>
                        motorConceptoApi
                            .actualizarCampo(
                                conceptoId,
                                campoId,
                                payload
                            ),
                    "Campo actualizado correctamente"
                ),

        eliminarCampo:
            (campoId) =>
                run(
                    () =>
                        motorConceptoApi
                            .eliminarCampo(
                                conceptoId,
                                campoId
                            ),
                    "Campo eliminado correctamente"
                ),

        crearArchivoTipo:
            (payload) =>
                run(
                    () =>
                        motorConceptoApi
                            .crearArchivoTipo(
                                conceptoId,
                                payload
                            ),
                    "Tipo de archivo creado correctamente"
                ),

        actualizarArchivoTipo:
            (
                archivoTipoId,
                payload
            ) =>
                run(
                    () =>
                        motorConceptoApi
                            .actualizarArchivoTipo(
                                conceptoId,
                                archivoTipoId,
                                payload
                            ),
                    "Tipo de archivo actualizado correctamente"
                ),

        eliminarArchivoTipo:
            (archivoTipoId) =>
                run(
                    () =>
                        motorConceptoApi
                            .eliminarArchivoTipo(
                                conceptoId,
                                archivoTipoId
                            ),
                    "Tipo de archivo eliminado correctamente"
                ),

        crearRegla:
            (payload) =>
                run(
                    () =>
                        motorConceptoApi
                            .crearRegla(
                                conceptoId,
                                payload
                            ),
                    "Regla creada correctamente"
                ),

        actualizarRegla:
            (
                reglaId,
                payload
            ) =>
                run(
                    () =>
                        motorConceptoApi
                            .actualizarRegla(
                                conceptoId,
                                reglaId,
                                payload
                            ),
                    "Regla actualizada correctamente"
                ),

        eliminarRegla:
            (reglaId) =>
                run(
                    () =>
                        motorConceptoApi
                            .eliminarRegla(
                                conceptoId,
                                reglaId
                            ),
                    "Regla eliminada correctamente"
                ),
    };
};

export default useMotorConceptoEditor;
