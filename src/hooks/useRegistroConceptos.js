import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import motorConceptoRegistroApi
    from "../services/motorConceptoRegistroApi";

import motorConceptoEntidadAsignacionApi
    from "../services/motorConceptoEntidadAsignacionApi";

import motorConceptoApi
    from "../services/motorConceptoApi";

const INITIAL_FILTERS = {
    buscar:
        "",

    search:
        "",

    concepto_id:
        "",

    entidad_tipo_id:
        "",

    entidad_id:
        "",

    estado:
        "",

    estado_vencimiento: "",

    sucursal_id:
        "",

    vencimiento_desde:
        "",

    vencimiento_hasta:
        "",

    activo:
        "true",

    page:
        1,

    limit:
        20,

    sortBy:
        "ultimo_movimiento",

    sortOrder:
        "DESC",
};

const INITIAL_PAGINATION = {
    page:
        1,

    limit:
        20,

    total:
        0,

    totalPages:
        1,
};

// const ESTADOS = [
//     {
//         value:
//             "",
//         label:
//             "Todos",
//     },
//     {
//         value:
//             "BORRADOR",
//         label:
//             "Borrador",
//     },
//     {
//         value:
//             "PENDIENTE",
//         label:
//             "Pendiente",
//     },
//     {
//         value:
//             "VIGENTE",
//         label:
//             "Vigente",
//     },
//     {
//         value:
//             "VENCIDO",
//         label:
//             "Vencido",
//     },
//     {
//         value:
//             "ANULADO",
//         label:
//             "Anulado",
//     },
// ];
const ESTADOS = [
    {
        value:
            "",
        label:
            "Todos",
    },
    {
        value:
            "VIGENTE",
        label:
            "Vigente",
    },
    {
        value:
            "POR_VENCER",
        label:
            "Por vencer",
    },
    {
        value:
            "VENCIDO",
        label:
            "Vencido",
    },
    // {
    //     value: "PENDIENTE",
    //     label: "Pendiente",
    // },
];

const SORT_OPTIONS = [
    {
        value:
            "ultimo_movimiento",
        label:
            "Último movimiento",
    },
    {
        value:
            "fecha_vencimiento",
        label:
            "Fecha de vencimiento",
    },
    {
        value:
            "created_at",
        label:
            "Fecha de creación",
    },
    {
        value:
            "updated_at",
        label:
            "Fecha de modificación",
    },
    {
        value:
            "estado",
        label:
            "Estado",
    },
    {
        value:
            "id",
        label:
            "Identificador",
    },
];

const getErrorMessage = (
    error,
    fallback
) => {
    if (
        error?.message
    ) {
        try {
            const parsed =
                JSON.parse(
                    error.message
                );

            return (
                parsed?.message ||
                parsed?.error ||
                fallback
            );
        } catch (
        parseError
        ) {
            return error.message;
        }
    }

    return fallback;
};

const getItems = (
    response
) => {
    if (
        Array.isArray(
            response
        )
    ) {
        return response;
    }

    if (
        Array.isArray(
            response?.items
        )
    ) {
        return response.items;
    }

    if (
        Array.isArray(
            response?.rows
        )
    ) {
        return response.rows;
    }

    if (
        Array.isArray(
            response?.registros
        )
    ) {
        return response.registros;
    }

    if (
        Array.isArray(
            response?.data
        )
    ) {
        return response.data;
    }

    if (
        Array.isArray(
            response?.data?.items
        )
    ) {
        return response.data.items;
    }

    if (
        Array.isArray(
            response?.data?.rows
        )
    ) {
        return response.data.rows;
    }

    if (
        Array.isArray(
            response?.data?.registros
        )
    ) {
        return response.data.registros;
    }

    return [];
};

const getPagination = (
    response,
    filters
) => {
    const source =
        response?.pagination ||
        response?.data?.pagination ||
        response ||
        {};

    const page =
        Number(
            source.page ||
            filters.page ||
            1
        );

    const limit =
        Number(
            source.limit ||
            filters.limit ||
            20
        );

    const total =
        Number(
            source.total ||
            source.count ||
            0
        );

    const totalPages =
        Number(
            source.totalPages ||
            source.total_pages ||
            (
                total > 0
                    ? Math.ceil(
                        total /
                        limit
                    )
                    : 1
            )
        );

    return {
        page:
            page > 0
                ? page
                : 1,

        limit:
            limit > 0
                ? limit
                : 20,

        total:
            total >= 0
                ? total
                : 0,

        totalPages:
            totalPages > 0
                ? totalPages
                : 1,
    };
};

const normalizeCatalog = (
    response
) => {
    const items =
        getItems(
            response
        );

    return items.filter(
        Boolean
    );
};

const normalizeFiltersForApi = (
    filters
) => ({
    search:
        filters.search ||
        filters.buscar,

    concepto_id:
        filters.concepto_id,

    entidad_tipo_id:
        filters.entidad_tipo_id,

    entidad_id:
        filters.entidad_id,

    /*
     * El filtro mostrado al usuario corresponde
     * al estado visual del registro.
     *
     * El backend lo recibe como
     * estado_vencimiento.
     */
    estado_vencimiento:
        filters.estado,

    sucursal_id:
        filters.sucursal_id,

    vencimiento_desde:
        filters.vencimiento_desde,

    vencimiento_hasta:
        filters.vencimiento_hasta,

    activo:
        filters.activo,

    page:
        filters.page,

    limit:
        filters.limit,

    sortBy:
        filters.sortBy,

    sortOrder:
        filters.sortOrder,
});
const buildSucursales = (
    registros
) => {
    const map =
        new Map();

    registros.forEach(
        (registro) => {
            const id =
                registro?.sucursal?.id ||
                registro?.sucursal_id;

            if (!id) {
                return;
            }

            const current = {
                id,
                nombre:
                    registro?.sucursal?.nombre ||
                    registro?.sucursal?.descripcion ||
                    `Sucursal #${id}`,
            };

            map.set(
                String(id),
                current
            );
        }
    );

    return Array.from(
        map.values()
    );
};

const useRegistroConceptos = () => {
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
        loading,
        setLoading,
    ] = useState(false);

    const [
        loadingCatalogs,
        setLoadingCatalogs,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const [
        filters,
        setFilters,
    ] = useState({
        ...INITIAL_FILTERS,
    });

    const [
        appliedFilters,
        setAppliedFilters,
    ] = useState({
        ...INITIAL_FILTERS,
    });

    const [
        pagination,
        setPagination,
    ] = useState({
        ...INITIAL_PAGINATION,
    });

    const [
        selectedRegistro,
        setSelectedRegistro,
    ] = useState(null);

    const [
        showDeleteModal,
        setShowDeleteModal,
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

    const changeFilters =
        useCallback(
            (
                changes
            ) => {
                setFilters(
                    (
                        current
                    ) => ({
                        ...current,
                        ...changes,
                    })
                );
            },
            []
        );

const loadRegistros =
    useCallback(
        async (
            customFilters
        ) => {

            const requestFilters = {
                ...appliedFilters,
                ...customFilters,
            };

            try {

                setLoading(
                    true
                );

                setError(
                    ""
                );


                /*
                 * =====================================================
                 * PENDIENTES
                 * =====================================================
                 *
                 * Un pendiente todavía no tiene
                 * MotorConceptoRegistro.
                 *
                 * Por eso NO se consulta
                 * motorConceptoRegistroApi.
                 *
                 * La fuente es:
                 * MotorConceptoEntidadAsignacion.
                 */

                if (
                    requestFilters.estado ===
                    "PENDIENTE"
                ) {

                    const response =
                        await motorConceptoEntidadAsignacionApi
                            .listar({

                                estado:
                                    "PENDIENTE",

                                activo:
                                    true,

                                concepto_id:
                                    requestFilters.concepto_id ||
                                    undefined,

                                entidad_tipo_id:
                                    requestFilters.entidad_tipo_id ||
                                    undefined,

                                entidad_id:
                                    requestFilters.entidad_id ||
                                    undefined,

                                search:
                                    requestFilters.search ||
                                    undefined,

                                page:
                                    requestFilters.page ||
                                    1,

                                limit:
                                    requestFilters.limit ||
                                    20,

                                sortBy:
                                    requestFilters.sortBy ||
                                    "created_at",

                                sortDirection:
                                    requestFilters.sortDirection ||
                                    "DESC",

                            });


                    const asignaciones =
                        Array.isArray(
                            response?.items
                        )
                            ? response.items
                            : [];


                    /*
                     * Protección adicional:
                     *
                     * solamente consideramos pendiente
                     * una asignación que realmente no
                     * tenga registro actual.
                     */

                    const nextRegistros =
                        asignaciones
                            .filter(
                                (
                                    asignacion
                                ) =>
                                    !asignacion
                                        ?.registroActual
                            )
                            .map(
                                (
                                    asignacion
                                ) => ({

                                    /*
                                     * ID visual.
                                     *
                                     * No corresponde a un
                                     * MotorConceptoRegistro.
                                     */

                                    id:
                                        `P-${asignacion.id}`,

                                    asignacion_id:
                                        asignacion.id,

                                    esPendiente:
                                        true,


                                    /*
                                     * Concepto
                                     */

                                    concepto_id:
                                        asignacion.concepto_id,

                                    concepto:
                                        asignacion.concepto,


                                    /*
                                     * Entidad
                                     */

                                    entidad_tipo_id:
                                        asignacion.entidad_tipo_id,

                                    entidad_id:
                                        asignacion.entidad_id,

                                    entidadTipo:
                                        asignacion.entidadTipo,


                                    /*
                                     * Estado visual
                                     */

                                    estado:
                                        "PENDIENTE",

                                    estado_visual:
                                        "PENDIENTE",


                                    /*
                                     * Un pendiente todavía
                                     * no posee versión.
                                     */

                                    version_actual_id:
                                        null,

                                    versionActual:
                                        null,


                                    /*
                                     * Datos inexistentes
                                     * hasta crear el registro.
                                     */

                                    fecha_vencimiento:
                                        null,

                                    dias_restantes:
                                        null,

                                    ultimo_movimiento:
                                        asignacion.updated_at ||
                                        asignacion.created_at ||
                                        null,

                                    sucursal_id:
                                        asignacion.sucursal_id ||
                                        null,

                                })
                            );


                    const responsePagination =
                        response?.pagination ||
                        {};


                    const nextPagination = {

                        page:
                            Number(
                                responsePagination.page ||
                                requestFilters.page ||
                                1
                            ),

                        limit:
                            Number(
                                responsePagination.limit ||
                                requestFilters.limit ||
                                20
                            ),

                        total:
                            Number(
                                responsePagination.total ||
                                nextRegistros.length
                            ),

                        totalPages:
                            Number(
                                responsePagination.totalPages ||
                                1
                            ),

                    };


                    setRegistros(
                        nextRegistros
                    );

                    setPagination(
                        nextPagination
                    );


                    return {

                        registros:
                            nextRegistros,

                        pagination:
                            nextPagination,

                        response,

                    };

                }


                /*
                 * =====================================================
                 * REGISTROS EXISTENTES
                 * =====================================================
                 *
                 * Se mantiene exactamente el flujo
                 * existente.
                 */

                const response =
                    await motorConceptoRegistroApi
                        .listar(
                            normalizeFiltersForApi(
                                requestFilters
                            )
                        );


                const nextRegistros =
                    getItems(
                        response
                    );


                const nextPagination =
                    getPagination(
                        response,
                        requestFilters
                    );


                setRegistros(
                    nextRegistros
                );

                setPagination(
                    nextPagination
                );


                return {

                    registros:
                        nextRegistros,

                    pagination:
                        nextPagination,

                    response,

                };

            } catch (
                requestError
            ) {

                console.error(
                    "ERROR CARGANDO REGISTROS:",
                    requestError
                );


                setError(
                    getErrorMessage(
                        requestError,
                        "No fue posible cargar los registros."
                    )
                );


                setRegistros(
                    []
                );


                setPagination({

                    page:
                        Number(
                            requestFilters.page ||
                            1
                        ),

                    limit:
                        Number(
                            requestFilters.limit ||
                            20
                        ),

                    total:
                        0,

                    totalPages:
                        1,

                });


                return null;

            } finally {

                setLoading(
                    false
                );

            }

        },
        [
            appliedFilters,
        ]
    );

    const loadCatalogs =
        useCallback(
            async () => {
                try {
                    setLoadingCatalogs(
                        true
                    );

                    const [
                        conceptosResponse,
                        entidadTiposResponse,
                    ] =
                        await Promise.all([
                            motorConceptoApi.listar({
                                activo:
                                    true,

                                page:
                                    1,

                                limit:
                                    100,

                                sortBy:
                                    "nombre",

                                sortOrder:
                                    "ASC",
                            }),

                            motorConceptoApi.listarEntidadTipos(),
                        ]);

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
                } catch (
                requestError
                ) {
                    setError(
                        getErrorMessage(
                            requestError,
                            "No fue posible cargar los catálogos del Motor de Conceptos."
                        )
                    );
                } finally {
                    setLoadingCatalogs(
                        false
                    );
                }
            },
            []
        );

    const search =
        useCallback(
            async () => {
                const nextFilters = {
                    ...filters,

                    search:
                        filters.buscar,

                    page:
                        1,
                };

                setFilters(
                    nextFilters
                );

                setAppliedFilters(
                    nextFilters
                );

                return loadRegistros(
                    nextFilters
                );
            },
            [
                filters,
                loadRegistros,
            ]
        );

    const refresh =
        useCallback(
            async () => {
                clearAlerts();

                return loadRegistros(
                    appliedFilters
                );
            },
            [
                appliedFilters,
                clearAlerts,
                loadRegistros,
            ]
        );

    const clearFilters =
        useCallback(
            async () => {
                const nextFilters = {
                    ...INITIAL_FILTERS,
                };

                clearAlerts();

                setFilters(
                    nextFilters
                );

                setAppliedFilters(
                    nextFilters
                );

                return loadRegistros(
                    nextFilters
                );
            },
            [
                clearAlerts,
                loadRegistros,
            ]
        );

    const changePage =
        useCallback(
            async (
                page
            ) => {
                const nextPage =
                    Number(
                        page
                    );

                if (
                    !Number.isInteger(
                        nextPage
                    ) ||
                    nextPage <= 0
                ) {
                    return null;
                }

                if (
                    pagination.totalPages > 0 &&
                    nextPage >
                    pagination.totalPages
                ) {
                    return null;
                }

                const nextFilters = {
                    ...appliedFilters,
                    page:
                        nextPage,
                };

                setFilters(
                    (
                        current
                    ) => ({
                        ...current,
                        page:
                            nextPage,
                    })
                );

                setAppliedFilters(
                    nextFilters
                );

                return loadRegistros(
                    nextFilters
                );
            },
            [
                appliedFilters,
                loadRegistros,
                pagination.totalPages,
            ]
        );

    const changeLimit =
        useCallback(
            async (
                limit
            ) => {
                const nextLimit =
                    Number(
                        limit
                    );

                if (
                    ![
                        10,
                        20,
                        50,
                        100,
                    ].includes(
                        nextLimit
                    )
                ) {
                    return null;
                }

                const nextFilters = {
                    ...appliedFilters,

                    page:
                        1,

                    limit:
                        nextLimit,
                };

                setFilters(
                    (
                        current
                    ) => ({
                        ...current,

                        page:
                            1,

                        limit:
                            nextLimit,
                    })
                );

                setAppliedFilters(
                    nextFilters
                );

                return loadRegistros(
                    nextFilters
                );
            },
            [
                appliedFilters,
                loadRegistros,
            ]
        );

    const changeSort =
        useCallback(
            async (
                sortBy
            ) => {
                if (!sortBy) {
                    return null;
                }

                const nextSortOrder =
                    appliedFilters.sortBy ===
                        sortBy &&
                        appliedFilters.sortOrder ===
                        "ASC"
                        ? "DESC"
                        : "ASC";

                const nextFilters = {
                    ...appliedFilters,

                    page:
                        1,

                    sortBy,

                    sortOrder:
                        nextSortOrder,
                };

                setFilters(
                    (
                        current
                    ) => ({
                        ...current,

                        page:
                            1,

                        sortBy,

                        sortOrder:
                            nextSortOrder,
                    })
                );

                setAppliedFilters(
                    nextFilters
                );

                return loadRegistros(
                    nextFilters
                );
            },
            [
                appliedFilters,
                loadRegistros,
            ]
        );

    const applySort =
        useCallback(
            async () => {
                const nextFilters = {
                    ...filters,

                    search:
                        filters.buscar,

                    page:
                        1,
                };

                setAppliedFilters(
                    nextFilters
                );

                return loadRegistros(
                    nextFilters
                );
            },
            [
                filters,
                loadRegistros,
            ]
        );

    const openDeleteModal =
        useCallback(
            (
                registro
            ) => {
                setSelectedRegistro(
                    registro
                );

                setShowDeleteModal(
                    true
                );

                setError(
                    ""
                );

                setMessage(
                    ""
                );
            },
            []
        );

    const closeDeleteModal =
        useCallback(
            () => {
                if (deleting) {
                    return;
                }

                setSelectedRegistro(
                    null
                );

                setShowDeleteModal(
                    false
                );
            },
            [
                deleting,
            ]
        );

    const removeRegistro =
        useCallback(
            async () => {
                if (
                    !selectedRegistro?.id
                ) {
                    return false;
                }

                try {
                    setDeleting(
                        true
                    );

                    setError(
                        ""
                    );

                    setMessage(
                        ""
                    );

                    await motorConceptoRegistroApi.eliminar(
                        selectedRegistro.id
                    );

                    setShowDeleteModal(
                        false
                    );

                    setSelectedRegistro(
                        null
                    );

                    setMessage(
                        "Registro eliminado correctamente."
                    );

                    const remaining =
                        Math.max(
                            pagination.total - 1,
                            0
                        );

                    const lastPage =
                        Math.max(
                            1,
                            Math.ceil(
                                remaining /
                                appliedFilters.limit
                            )
                        );

                    const nextPage =
                        Math.min(
                            appliedFilters.page,
                            lastPage
                        );

                    const nextFilters = {
                        ...appliedFilters,
                        page:
                            nextPage,
                    };

                    setFilters(
                        (
                            current
                        ) => ({
                            ...current,
                            page:
                                nextPage,
                        })
                    );

                    setAppliedFilters(
                        nextFilters
                    );

                    await loadRegistros(
                        nextFilters
                    );

                    return true;
                } catch (
                requestError
                ) {
                    setError(
                        getErrorMessage(
                            requestError,
                            "No fue posible eliminar el registro."
                        )
                    );

                    return false;
                } finally {
                    setDeleting(
                        false
                    );
                }
            },
            [
                appliedFilters,
                loadRegistros,
                pagination.total,
                selectedRegistro,
            ]
        );

    const sucursales =
        useMemo(
            () =>
                buildSucursales(
                    registros
                ),
            [
                registros,
            ]
        );

    useEffect(
        () => {
            loadCatalogs();
        },
        [
            loadCatalogs,
        ]
    );

    useEffect(
        () => {
            loadRegistros(
                INITIAL_FILTERS
            );
        },
        []
    );

    return {
        registros,
        conceptos,
        entidadTipos,
        sucursales,

        estados:
            ESTADOS,

        sortOptions:
            SORT_OPTIONS,

        filters,
        appliedFilters,
        pagination,

        loading,
        loadingCatalogs,
        deleting,

        selectedRegistro,
        showDeleteModal,

        error,
        message,

        setError,
        setMessage,

        clearAlerts,
        changeFilters,

        loadRegistros,
        loadCatalogs,

        search,
        refresh,
        clearFilters,

        changePage,
        changeLimit,
        changeSort,
        applySort,

        openDeleteModal,
        closeDeleteModal,
        removeRegistro,
    };
};

export default useRegistroConceptos;