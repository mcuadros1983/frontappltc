import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import Contexts
    from "../context/Contexts";

import motorConceptoApi
    from "../services/motorConceptoApi";

import motorConceptoReporteService
    from "../services/motorConceptoReporteService";

import exportarRegistroConceptoReporteExcel
    from "../utils/motorConceptos/exportarRegistroConceptoReporteExcel";

const INITIAL_FILTERS = {

    search: "",

    concepto_id: "",

    entidad_tipo_id: "",

    entidad_id: "",

    estado: "",

    activo: "",

    sucursal_id: "",

    fecha_vencimiento_desde: "",

    fecha_vencimiento_hasta: "",

    ultimo_movimiento_desde: "",

    ultimo_movimiento_hasta: "",

    sortBy: "ultimo_movimiento",

    sortOrder: "DESC",

};

const INITIAL_PAGINATION = {

    page: 1,

    limit: 20,

    total: 0,

    totalPages: 1,

};

const ESTADOS = [

    {
        value: "",
        label: "Todos",
    },

    {
        value: "vigente",
        label: "Vigente",
    },

    {
        value: "por_vencer",
        label: "Por vencer",
    },

    {
        value: "vencido",
        label: "Vencido",
    },

];

const SORT_OPTIONS = [

    {
        value: "ultimo_movimiento",
        label: "Último movimiento",
    },

    {
        value: "fecha_vencimiento",
        label: "Fecha vencimiento",
    },

    {
        value: "concepto",
        label: "Concepto",
    },

    {
        value: "estado",
        label: "Estado",
    },

];

const normalizeCatalog = (response) => {

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    if (Array.isArray(response?.rows)) {
        return response.rows;
    }

    return [];

};

const getItems = (response) =>
    Array.isArray(response?.items)
        ? response.items
        : [];

const getPagination = (response) =>
    response?.pagination ??
    INITIAL_PAGINATION;

const normalizeFiltersForApi = (
    filters,
    pagination,
) => ({

    ...filters,

    page: pagination.page,

    limit: pagination.limit,

    sortBy: filters.sortBy,

    sortOrder: filters.sortOrder,

});

export default function useRegistroConceptoReporte() {

    const dataContext =
        useContext(
            Contexts.DataContext
        );

    const sucursales =
        dataContext?.sucursales || [];

    const empleados =
        dataContext?.empleados || [];

    const empresas =
        dataContext?.empresasTabla || [];

    const [
        registros,
        setRegistros,
    ] = useState([]);

    const [
        conceptos,
        setConceptos,
    ] = useState([]);

    const [
        entidadTipos,
        setEntidadTipos,
    ] = useState([]);

    const [
        filters,
        setFilters,
    ] = useState(
        INITIAL_FILTERS
    );

    const [
        pagination,
        setPagination,
    ] = useState(
        INITIAL_PAGINATION
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        loadingCatalogos,
        setLoadingCatalogos,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    const clearAlerts =
        useCallback(
            () => {

                setError("");
                setMessage("");

            },
            []
        );

    const loadCatalogos =
        useCallback(
            async () => {

                try {

                    setLoadingCatalogos(true);

                    const [

                        conceptosResponse,
                        entidadTiposResponse,

                    ] = await Promise.all([

                        motorConceptoApi.listar({

                            activo: true,

                            page: 1,

                            limit: 1000,

                            sortBy: "nombre",

                            sortOrder: "ASC",

                        }),

                        motorConceptoApi.listarEntidadTipos(),

                    ]);

                    // console.log("conceptos...", conceptosResponse,
                    //     entidadTiposResponse,)

                    setConceptos(
                        normalizeCatalog(
                            conceptosResponse
                        )
                    );

                    setEntidadTipos(
                        normalizeCatalog(
                            entidadTiposResponse
                        )
                    );

                } catch (err) {

                    console.error(err);

                    setError(
                        err?.message ||
                        "No fue posible cargar los catálogos."
                    );

                } finally {

                    setLoadingCatalogos(false);

                }

            },
            []
        );

    const loadRegistros =
        useCallback(
            async (
                currentFilters = filters,
                currentPagination = pagination,
            ) => {

                try {

                    setLoading(true);

                    clearAlerts();

                    const response =
                        await motorConceptoReporteService.getRegistros(

                            normalizeFiltersForApi(

                                currentFilters,

                                currentPagination,

                            )

                        );

                    // console.log("registros...", response)

                    setRegistros(
                        getItems(response)
                    );

                    setPagination(
                        getPagination(response)
                    );

                } catch (err) {

                    console.error(err);

                    setError(

                        err?.message ||

                        "No fue posible obtener el reporte."

                    );

                } finally {

                    setLoading(false);

                }

            },
            [
                clearAlerts,
            ]
        );

    const search =
        useCallback(
            async () => {

                const newPagination = {

                    ...pagination,

                    page: 1,

                };

                setPagination(
                    newPagination
                );

                await loadRegistros(
                    filters,
                    newPagination
                );

            },
            [
                filters,
                pagination,
                loadRegistros,
            ]
        );

    const refresh =
        useCallback(
            async () => {

                await loadRegistros();

            },
            [
                loadRegistros,
            ]
        );

    // const clearFilters =
    //     useCallback(
    //         () => {

    //             setFilters(
    //                 INITIAL_FILTERS
    //             );

    //             setPagination(
    //                 INITIAL_PAGINATION
    //             );

    //         },
    //         []
    //     );

    const clearFilters = useCallback(async () => {

        setFilters(INITIAL_FILTERS);

        const newPagination = INITIAL_PAGINATION;

        setPagination(newPagination);

        await loadRegistros(
            INITIAL_FILTERS,
            newPagination
        );

    }, [loadRegistros]);

    const changeFilters =
        useCallback(
            (
                field,
                value,
            ) => {

                setFilters(
                    previous => ({

                        ...previous,

                        [field]: value,

                    })
                );

            },
            []
        );

    const changePage =
        useCallback(
            async page => {

                const newPagination = {

                    ...pagination,

                    page,

                };

                setPagination(
                    newPagination
                );

                await loadRegistros(
                    filters,
                    newPagination
                );

            },
            [
                filters,
                pagination,
                loadRegistros,
            ]
        );

    const changeLimit =
        useCallback(
            async limit => {

                const newPagination = {

                    ...pagination,

                    page: 1,

                    limit,

                };

                setPagination(
                    newPagination
                );

                await loadRegistros(
                    filters,
                    newPagination
                );

            },
            [
                filters,
                pagination,
                loadRegistros,
            ]
        );

    const changeSort =
        useCallback(
            (
                sortBy,
                sortOrder,
            ) => {

                setFilters(
                    previous => ({

                        ...previous,

                        sortBy,

                        sortOrder,

                    })
                );

            },
            []
        );

    const applySort =
        useCallback(
            async () => {

                await loadRegistros(
                    filters,
                    pagination
                );

            },
            [
                filters,
                pagination,
                loadRegistros,
            ]
        );

    const exportExcel =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    clearAlerts();

                    const response =
                        await motorConceptoReporteService.getRegistros({

                            ...normalizeFiltersForApi(
                                filters,
                                {
                                    ...pagination,
                                    page: 1,
                                    limit: 100000,
                                }
                            ),

                        });

                    exportarRegistroConceptoReporteExcel(
                        getItems(response)
                    );

                } catch (err) {

                    console.error(err);

                    setError(
                        err?.message ||
                        "No fue posible exportar el reporte."
                    );

                } finally {

                    setLoading(false);

                }

            },
            [
                filters,
                pagination,
                clearAlerts,
            ]
        );

    useEffect(
        () => {

            loadCatalogos();

        },
        [
            loadCatalogos,
        ]
    );

    useEffect(
        () => {

            loadRegistros();

        },
        [
            loadRegistros,
        ]
    );

    return useMemo(
        () => ({

            registros,

            conceptos,

            entidadTipos,

            sucursales,

            empleados,

            empresas,

            filters,

            pagination,

            estados: ESTADOS,

            sortOptions: SORT_OPTIONS,

            loading,

            loadingCatalogos,

            error,

            message,

            clearAlerts,

            search,

            refresh,

            clearFilters,

            changeFilters,

            changePage,

            changeLimit,

            changeSort,

            applySort,

            exportExcel,

        }),
        [

            registros,

            conceptos,

            entidadTipos,

            sucursales,

            empleados,

            empresas,

            filters,

            pagination,

            loading,

            loadingCatalogos,

            error,

            message,

            clearAlerts,

            search,

            refresh,

            clearFilters,

            changeFilters,

            changePage,

            changeLimit,

            changeSort,

            applySort,

            exportExcel,

        ]
    );

}