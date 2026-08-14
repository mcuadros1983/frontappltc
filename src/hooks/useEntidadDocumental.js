import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import motorConceptoEntidadAsignacionApi
    from "../services/motorConceptoEntidadAsignacionApi";

const DEFAULT_FILTERS = {

    entidad_tipo_id: "",

    entidad_id: "",

    estado: "",

    activo: true,

    page: 1,

    limit: 100,

    sortBy: "concepto",

    sortOrder: "ASC",

};

const DEFAULT_PAGINATION = {

    page: 1,

    limit: 100,

    total: 0,

    totalPages: 1,

};

const useEntidadDocumental = () => {

    const [
        asignaciones,
        setAsignaciones,
    ] = useState([]);

    const [
        filters,
        setFilters,
    ] = useState(DEFAULT_FILTERS);

    const [
        pagination,
        setPagination,
    ] = useState(DEFAULT_PAGINATION);

    const [
        loading,
        setLoading,
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
        selectedAsignacion,
        setSelectedAsignacion,
    ] = useState(null);

        const clearAlerts =
        useCallback(
            () => {

                setError("");

                setMessage("");

            },
            []
        );

    const changeFilters =
        useCallback(
            (
                changes
            ) => {

                setFilters(
                    current => ({

                        ...current,

                        ...changes,

                    })
                );

            },
            []
        );

    const loadEntidad =
        useCallback(
            async (
                entidadTipoId,
                entidadId
            ) => {

                setLoading(true);

                clearAlerts();

                try {

                    const response =
                        await motorConceptoEntidadAsignacionApi.obtenerPorEntidad(

                            entidadTipoId,

                            entidadId

                        );

                    setAsignaciones(

                        response.items ||

                        response.rows ||

                        response ||

                        []

                    );

                    setPagination(

                        response.pagination ||

                        DEFAULT_PAGINATION

                    );

                } catch (error) {

                    setError(

                        error?.response
                            ?.data
                            ?.message ||

                        error?.message ||

                        "No fue posible obtener la documentación."

                    );

                } finally {

                    setLoading(false);

                }

            },
            [
                clearAlerts,
            ]
        );

    const refresh =
        useCallback(
            () => {

                if (

                    !filters.entidad_tipo_id ||

                    !filters.entidad_id

                ) {

                    return;

                }

                loadEntidad(

                    filters.entidad_tipo_id,

                    filters.entidad_id

                );

            },
            [
                filters,
                loadEntidad,
            ]
        );

    const search =
        useCallback(
            () => {

                refresh();

            },
            [
                refresh,
            ]
        );

    const changePage =
        useCallback(
            (
                page
            ) => {

                setPagination(
                    current => ({

                        ...current,

                        page,

                    })
                );

            },
            []
        );

    const changeLimit =
        useCallback(
            (
                limit
            ) => {

                setPagination(
                    current => ({

                        ...current,

                        page: 1,

                        limit,

                    })
                );

            },
            []
        );

    const changeSort =
        useCallback(
            (
                sortBy,
                sortOrder
            ) => {

                setFilters(
                    current => ({

                        ...current,

                        sortBy,

                        sortOrder,

                    })
                );

            },
            []
        );

            const openAsignacion =
        useCallback(
            (
                asignacion
            ) => {

                setSelectedAsignacion(
                    asignacion
                );

            },
            []
        );

    const closeAsignacion =
        useCallback(
            () => {

                setSelectedAsignacion(
                    null
                );

            },
            []
        );

    const createAsignacion =
        useCallback(
            async (
                payload
            ) => {

                clearAlerts();

                try {

                    setLoading(
                        true
                    );

                    const response =
                        await motorConceptoEntidadAsignacionApi.crear(
                            payload
                        );

                    setMessage(
                        "Asignación creada correctamente."
                    );

                    refresh();

                    return response;

                } catch (error) {

                    setError(

                        error?.response
                            ?.data
                            ?.message ||

                        error?.message ||

                        "No fue posible crear la asignación."

                    );

                    return null;

                } finally {

                    setLoading(
                        false
                    );

                }

            },
            [
                refresh,
                clearAlerts,
            ]
        );

    const updateAsignacion =
        useCallback(
            async (
                asignacionId,
                payload
            ) => {

                clearAlerts();

                try {

                    setLoading(
                        true
                    );

                    const response =
                        await motorConceptoEntidadAsignacionApi.actualizar(

                            asignacionId,

                            payload

                        );

                    setMessage(
                        "Asignación actualizada correctamente."
                    );

                    refresh();

                    return response;

                } catch (error) {

                    setError(

                        error?.response
                            ?.data
                            ?.message ||

                        error?.message ||

                        "No fue posible actualizar la asignación."

                    );

                    return null;

                } finally {

                    setLoading(
                        false
                    );

                }

            },
            [
                refresh,
                clearAlerts,
            ]
        );

    const deleteAsignacion =
        useCallback(
            async (
                asignacionId
            ) => {

                clearAlerts();

                try {

                    setLoading(
                        true
                    );

                    await motorConceptoEntidadAsignacionApi.eliminar(

                        asignacionId

                    );

                    setMessage(
                        "Asignación eliminada correctamente."
                    );

                    refresh();

                } catch (error) {

                    setError(

                        error?.response
                            ?.data
                            ?.message ||

                        error?.message ||

                        "No fue posible eliminar la asignación."

                    );

                } finally {

                    setLoading(
                        false
                    );

                }

            },
            [
                refresh,
                clearAlerts,
            ]
        );

    useEffect(
        () => {

            if (

                !filters.entidad_tipo_id ||

                !filters.entidad_id

            ) {

                return;

            }

            loadEntidad(

                filters.entidad_tipo_id,

                filters.entidad_id

            );

        },
        [

            filters.entidad_tipo_id,

            filters.entidad_id,

            loadEntidad,

        ]
    );

    return {

        asignaciones,

        loading,

        error,

        message,

        filters,

        pagination,

        selectedAsignacion,

        clearAlerts,

        changeFilters,

        search,

        refresh,

        loadEntidad,

        changePage,

        changeLimit,

        changeSort,

        openAsignacion,

        closeAsignacion,

        createAsignacion,

        updateAsignacion,

        deleteAsignacion,

    };

};

export default useEntidadDocumental;