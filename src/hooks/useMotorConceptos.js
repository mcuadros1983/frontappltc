import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import motorConceptoApi
    from "../services/motorConceptoApi";

const getErrorMessage = (
    error,
    fallback
) => {
    if (!error) return fallback;

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

const normalizeListResponse = (
    response
) => {
    if (Array.isArray(response)) {
        return {
            items: response,
            total: response.length,
        };
    }

    if (
        Array.isArray(response?.rows)
    ) {
        return {
            items: response.rows,
            total:
                response.total ??
                response.count ??
                response.rows.length,
        };
    }

    if (
        Array.isArray(response?.items)
    ) {
        return {
            items: response.items,
            total:
                response.total ??
                response.count ??
                response.items.length,
        };
    }

    if (
        Array.isArray(response?.data)
    ) {
        return {
            items: response.data,
            total:
                response.total ??
                response.count ??
                response.data.length,
        };
    }

    return {
        items: [],
        total: 0,
    };
};

const initialFilters = {
    buscar: "",
    activo: "",
    entidad: "",
    page: 1,
    limit: 10,
    orderBy: "id",
    orderDirection: "DESC",
};

export const useMotorConceptos = () => {

    const [
        conceptos,
        setConceptos,
    ] = useState([]);

    const [
        total,
        setTotal,
    ] = useState(0);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        filters,
        setFilters,
    ] = useState(
        initialFilters
    );

    const limpiarMensajes =
        useCallback(() => {
            setError("");
            setMessage("");
        }, []);

    const actualizarFiltros =
        useCallback((changes) => {
            setFilters(
                (current) => ({
                    ...current,
                    ...changes,
                })
            );
        }, []);

    const limpiarFiltros =
        useCallback(() => {
            setFilters(
                initialFilters
            );
        }, []);

    const cargar = useCallback(
        async () => {
            setLoading(true);
            setError("");

            try {
                const response =
                    await motorConceptoApi
                        .listar(filters);

                const normalized =
                    normalizeListResponse(
                        response
                    );

                setConceptos(
                    normalized.items
                );

                setTotal(
                    normalized.total
                );
            } catch (err) {
                setConceptos([]);
                setTotal(0);
                setError(
                    getErrorMessage(
                        err,
                        "No se pudieron cargar los conceptos"
                    )
                );
            } finally {
                setLoading(false);
            }
        },
        [filters]
    );

    useEffect(() => {
        cargar();
    }, [cargar]);

    const obtener = useCallback(
        async (id) => {
            setError("");

            try {
                return await motorConceptoApi
                    .obtener(id);
            } catch (err) {
                const msg =
                    getErrorMessage(
                        err,
                        "No se pudo obtener el concepto"
                    );

                setError(msg);
                throw err;
            }
        },
        []
    );

    const crear = useCallback(
        async (payload) => {
            setSaving(true);
            limpiarMensajes();

            try {
                const result =
                    await motorConceptoApi
                        .crear(payload);

                setMessage(
                    "Concepto creado correctamente"
                );

                await cargar();

                return result;
            } catch (err) {
                const msg =
                    getErrorMessage(
                        err,
                        "No se pudo crear el concepto"
                    );

                setError(msg);
                throw err;
            } finally {
                setSaving(false);
            }
        },
        [
            cargar,
            limpiarMensajes,
        ]
    );

    const actualizar =
        useCallback(
            async (
                id,
                payload
            ) => {
                setSaving(true);
                limpiarMensajes();

                try {
                    const result =
                        await motorConceptoApi
                            .actualizar(
                                id,
                                payload
                            );

                    setMessage(
                        "Concepto actualizado correctamente"
                    );

                    await cargar();

                    return result;
                } catch (err) {
                    const msg =
                        getErrorMessage(
                            err,
                            "No se pudo actualizar el concepto"
                        );

                    setError(msg);
                    throw err;
                } finally {
                    setSaving(false);
                }
            },
            [
                cargar,
                limpiarMensajes,
            ]
        );

    const eliminar =
        useCallback(
            async (id) => {
                setDeleting(true);
                limpiarMensajes();

                try {
                    const result =
                        await motorConceptoApi
                            .eliminar(id);

                    setMessage(
                        "Concepto eliminado correctamente"
                    );

                    await cargar();

                    return result;
                } catch (err) {
                    const msg =
                        getErrorMessage(
                            err,
                            "No se pudo eliminar el concepto"
                        );

                    setError(msg);
                    throw err;
                } finally {
                    setDeleting(false);
                }
            },
            [
                cargar,
                limpiarMensajes,
            ]
        );

    const totalPages =
        useMemo(
            () =>
                Math.max(
                    1,
                    Math.ceil(
                        total /
                        Number(
                            filters.limit ||
                            10
                        )
                    )
                ),
            [
                total,
                filters.limit,
            ]
        );

    return {
        conceptos,
        total,
        totalPages,
        loading,
        saving,
        deleting,
        error,
        message,
        filters,
        setError,
        setMessage,
        limpiarMensajes,
        actualizarFiltros,
        limpiarFiltros,
        cargar,
        obtener,
        crear,
        actualizar,
        eliminar,
    };
};

export default useMotorConceptos;
