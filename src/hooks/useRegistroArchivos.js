import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import motorConceptoRegistroApi
    from "../services/motorConceptoRegistroApi";

const getMessage = (
    error,
    fallback
) =>
    error?.response?.data?.message ||
    error?.message ||
    fallback;

export const useRegistroArchivos = (
    registroId,
    archivoTipos = []
) => {

    const [
        archivos,
        setArchivos,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        uploading,
        setUploading,
    ] = useState(false);

    const [
        deletingId,
        setDeletingId,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    const cargar =
        useCallback(async () => {
            if (!registroId) return;

            setLoading(true);
            setError("");

            try {
                const response =
                    await motorConceptoRegistroApi
                        .listarArchivos(
                            registroId
                        );

                setArchivos(
                    Array.isArray(response)
                        ? response
                        : response?.items ||
                        []
                );
            } catch (err) {
                setError(
                    getMessage(
                        err,
                        "No se pudieron cargar los archivos"
                    )
                );
            } finally {
                setLoading(false);
            }
        }, [registroId]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const subir =
        async (payload) => {
            setUploading(true);
            setError("");
            setMessage("");

            try {
                await motorConceptoRegistroApi
                    .subirArchivo(
                        registroId,
                        payload
                    );

                setMessage(
                    "Archivo subido correctamente"
                );

                await cargar();
            } catch (err) {
                setError(
                    getMessage(
                        err,
                        "No se pudo subir el archivo"
                    )
                );
                throw err;
            } finally {
                setUploading(false);
            }
        };

    const eliminar =
        async (archivoId) => {
            setDeletingId(
                archivoId
            );
            setError("");
            setMessage("");

            try {
                await motorConceptoRegistroApi
                    .eliminarArchivo(
                        archivoId
                    );

                setMessage(
                    "Archivo eliminado correctamente"
                );

                await cargar();
            } catch (err) {
                setError(
                    getMessage(
                        err,
                        "No se pudo eliminar el archivo"
                    )
                );
                throw err;
            } finally {
                setDeletingId(null);
            }
        };

    const estadoObligatorios =
        useMemo(() => {
            const activos =
                archivoTipos.filter(
                    (item) =>
                        item.activo !== false
                );

            return activos.map(
                (tipo) => {
                    const encontrados =
                        archivos.filter(
                            (archivo) =>
                                Number(
                                    archivo.archivo_tipo_id
                                ) ===
                                Number(
                                    tipo.id
                                ) &&
                                archivo.activo !== false
                        );

                    return {
                        tipo,
                        archivos:
                            encontrados,
                        completo:
                            !tipo.obligatorio ||
                            encontrados.length > 0,
                    };
                }
            );
        }, [
            archivoTipos,
            archivos,
        ]);

    const faltantes =
        estadoObligatorios
            .filter(
                (item) =>
                    !item.completo
            );

    return {
        archivos,
        loading,
        uploading,
        deletingId,
        error,
        message,
        estadoObligatorios,
        faltantes,
        cargar,
        subir,
        eliminar,
        clearMessages: () => {
            setError("");
            setMessage("");
        },
    };
};

export default useRegistroArchivos;
