import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useParams,
} from "react-router-dom";

import motorConceptoRegistroApi
    from "../services/motorConceptoRegistroApi";

import {
    getExpirationStatus,
    sortLegajoRecords,
} from "../components/motorConceptos/legajo/utils/legajoVencimiento";

const MotorConceptoLegajoContext =
    createContext(null);

const INITIAL_FILTERS = {
    search: "",
    estado: "",
};

const INITIAL_PAGINATION = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
};

const normalizeListResponse =
    response => {
        const payload =
            response?.data?.data ||
            response?.data ||
            response ||
            {};

        const rows =
            payload.items ||
            payload.rows ||
            payload.registros ||
            [];

        const pagination =
            payload.pagination ||
            {};

        const page =
            Number(
                pagination.page ??
                payload.page ??
                1
            ) || 1;

        const limit =
            Number(
                pagination.limit ??
                payload.limit ??
                20
            ) || 20;

        const total =
            Number(
                pagination.total ??
                payload.total ??
                payload.count ??
                rows.length
            ) || 0;

        const totalPages =
            Number(
                pagination.totalPages ??
                pagination.total_pages ??
                payload.totalPages ??
                payload.total_pages ??
                Math.ceil(
                    total /
                    Math.max(
                        limit,
                        1
                    )
                )
            ) || 1;

        return {
            rows:
                Array.isArray(
                    rows
                )
                    ? rows
                    : [],

            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.max(
                        totalPages,
                        1
                    ),
            },
        };
    };

const getErrorMessage =
    error =>
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No fue posible cargar el legajo documental";

const createResumen =
    registros => {
        const resumen = {
            total: 0,
            vigentes: 0,
            proximosVencer: 0,
            vencidos: 0,
            pendientes: 0,
            borradores: 0,
            anulados: 0,
            sinVencimiento: 0,
        };

        const rows =
            Array.isArray(
                registros
            )
                ? registros
                : [];

        rows.forEach(
            registro => {
                resumen.total += 1;

                if (
                    !registro
                        ?.fecha_vencimiento
                ) {
                    resumen.sinVencimiento +=
                        1;
                }

                const status =
                    getExpirationStatus(
                        registro
                    );

                switch (
                    status.key
                ) {
                    case "VIGENTE":
                        resumen.vigentes +=
                            1;
                        break;

                    case "PROXIMO_VENCER":
                        resumen.proximosVencer +=
                            1;
                        break;

                    case "VENCIDO":
                        resumen.vencidos +=
                            1;
                        break;

                    case "PENDIENTE":
                        resumen.pendientes +=
                            1;
                        break;

                    case "BORRADOR":
                        resumen.borradores +=
                            1;
                        break;

                    case "ANULADO":
                        resumen.anulados +=
                            1;
                        break;

                    default:
                        break;
                }
            }
        );

        return resumen;
    };

export const MotorConceptoLegajoProvider =
    ({
        children,
    }) => {
        const {
            entidadTipoId,
            entidadId,
        } = useParams();

        const mountedRef =
            useRef(true);

        const [
            registros,
            setRegistros,
        ] = useState([]);

        const [
            registrosResumen,
            setRegistrosResumen,
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
            summaryLoading,
            setSummaryLoading,
        ] = useState(false);

        const [
            error,
            setError,
        ] = useState("");

        const [
            message,
            setMessage,
        ] = useState("");

        const validParams =
            Boolean(
                entidadTipoId &&
                entidadId
            );

        const clearAlerts =
            useCallback(
                () => {
                    setError("");
                    setMessage("");
                },
                []
            );

        const fetchSummaryRecords =
            useCallback(
                async () => {
                    if (
                        !validParams
                    ) {
                        setRegistrosResumen(
                            []
                        );

                        return;
                    }

                    try {
                        setSummaryLoading(
                            true
                        );

                        const firstResponse =
                            await motorConceptoRegistroApi
                                .listar({
                                    entidad_tipo_id:
                                        entidadTipoId,

                                    entidad_id:
                                        entidadId,

                                    activo:
                                        true,

                                    page:
                                        1,

                                    limit:
                                        100,

                                    sortBy:
                                        "fecha_vencimiento",

                                    sortOrder:
                                        "ASC",
                                });

                        const firstResult =
                            normalizeListResponse(
                                firstResponse
                            );

                        let allRows = [
                            ...firstResult.rows,
                        ];

                        const totalPages =
                            Math.min(
                                firstResult
                                    .pagination
                                    .totalPages,
                                100
                            );

                        if (
                            totalPages > 1
                        ) {
                            for (
                                let page = 2;
                                page <= totalPages;
                                page += 1
                            ) {
                                const response =
                                    await motorConceptoRegistroApi
                                        .listar({
                                            entidad_tipo_id:
                                                entidadTipoId,

                                            entidad_id:
                                                entidadId,

                                            activo:
                                                true,

                                            page,

                                            limit:
                                                100,

                                            sortBy:
                                                "fecha_vencimiento",

                                            sortOrder:
                                                "ASC",
                                        });

                                const result =
                                    normalizeListResponse(
                                        response
                                    );

                                allRows = [
                                    ...allRows,
                                    ...result.rows,
                                ];
                            }
                        }

                        if (
                            mountedRef.current
                        ) {
                            setRegistrosResumen(
                                allRows
                            );
                        }
                    } catch (
                        currentError
                    ) {
                        if (
                            mountedRef.current
                        ) {
                            setRegistrosResumen(
                                []
                            );

                            setError(
                                getErrorMessage(
                                    currentError
                                )
                            );
                        }
                    } finally {
                        if (
                            mountedRef.current
                        ) {
                            setSummaryLoading(
                                false
                            );
                        }
                    }
                },
                [
                    entidadId,
                    entidadTipoId,
                    validParams,
                ]
            );

        const load =
            useCallback(
                async (
                    options = {}
                ) => {
                    if (
                        !validParams
                    ) {
                        setRegistros([]);

                        setError(
                            "No se recibió una entidad válida para consultar el legajo."
                        );

                        return;
                    }

                    const selectedPage =
                        Number(
                            options.page ??
                            pagination.page
                        ) || 1;

                    const selectedLimit =
                        Number(
                            options.limit ??
                            pagination.limit
                        ) || 20;

                    const selectedFilters = {
                        ...filters,
                        ...(
                            options.filters ||
                            {}
                        ),
                    };

                    try {
                        setLoading(
                            true
                        );

                        setError("");

                        const response =
                            await motorConceptoRegistroApi
                                .listar({
                                    entidad_tipo_id:
                                        entidadTipoId,

                                    entidad_id:
                                        entidadId,

                                    activo:
                                        true,

                                    page:
                                        selectedPage,

                                    limit:
                                        selectedLimit,

                                    estado:
                                        selectedFilters
                                            .estado ||
                                        undefined,

                                    search:
                                        selectedFilters
                                            .search ||
                                        undefined,

                                    sortBy:
                                        "fecha_vencimiento",

                                    sortOrder:
                                        "ASC",
                                });

                        const result =
                            normalizeListResponse(
                                response
                            );

                        if (
                            mountedRef.current
                        ) {
                            setRegistros(
                                sortLegajoRecords(
                                    result.rows
                                )
                            );

                            setPagination(
                                result.pagination
                            );
                        }
                    } catch (
                        currentError
                    ) {
                        if (
                            mountedRef.current
                        ) {
                            setRegistros(
                                []
                            );

                            setError(
                                getErrorMessage(
                                    currentError
                                )
                            );
                        }
                    } finally {
                        if (
                            mountedRef.current
                        ) {
                            setLoading(
                                false
                            );
                        }
                    }
                },
                [
                    entidadId,
                    entidadTipoId,
                    filters,
                    pagination.limit,
                    pagination.page,
                    validParams,
                ]
            );

        const refresh =
            useCallback(
                async () => {
                    await Promise.all([
                        load(),
                        fetchSummaryRecords(),
                    ]);
                },
                [
                    fetchSummaryRecords,
                    load,
                ]
            );

        const changeFilter =
            useCallback(
                (
                    field,
                    value
                ) => {
                    setFilters(
                        current => ({
                            ...current,
                            [field]:
                                value,
                        })
                    );
                },
                []
            );

        const applyFilters =
            useCallback(
                async () => {
                    setPagination(
                        current => ({
                            ...current,
                            page:
                                1,
                        })
                    );

                    await load({
                        page:
                            1,
                    });
                },
                [
                    load,
                ]
            );

        const clearFilters =
            useCallback(
                async () => {
                    setFilters(
                        INITIAL_FILTERS
                    );

                    setPagination(
                        current => ({
                            ...current,
                            page:
                                1,
                        })
                    );

                    await load({
                        page:
                            1,

                        filters:
                            INITIAL_FILTERS,
                    });
                },
                [
                    load,
                ]
            );

        const changePage =
            useCallback(
                async page => {
                    const parsedPage =
                        Number(
                            page
                        );

                    if (
                        !Number.isInteger(
                            parsedPage
                        ) ||
                        parsedPage < 1 ||
                        parsedPage >
                        pagination.totalPages
                    ) {
                        return;
                    }

                    setPagination(
                        current => ({
                            ...current,
                            page:
                                parsedPage,
                        })
                    );

                    await load({
                        page:
                            parsedPage,
                    });
                },
                [
                    load,
                    pagination.totalPages,
                ]
            );

        const changeLimit =
            useCallback(
                async limit => {
                    const parsedLimit =
                        Number(
                            limit
                        );

                    if (
                        !Number.isInteger(
                            parsedLimit
                        ) ||
                        parsedLimit < 1
                    ) {
                        return;
                    }

                    setPagination(
                        current => ({
                            ...current,
                            page:
                                1,

                            limit:
                                parsedLimit,
                        })
                    );

                    await load({
                        page:
                            1,

                        limit:
                            parsedLimit,
                    });
                },
                [
                    load,
                ]
            );

        useEffect(
            () => {
                mountedRef.current =
                    true;

                return () => {
                    mountedRef.current =
                        false;
                };
            },
            []
        );

        useEffect(
            () => {
                setFilters(
                    INITIAL_FILTERS
                );

                setPagination(
                    INITIAL_PAGINATION
                );

                setRegistros([]);
                setRegistrosResumen([]);
                setError("");
                setMessage("");

                if (
                    !validParams
                ) {
                    return;
                }

                Promise.all([
                    load({
                        page:
                            1,

                        filters:
                            INITIAL_FILTERS,
                    }),

                    fetchSummaryRecords(),
                ]);
            },
            [
                entidadId,
                entidadTipoId,
            ]
        );

        const entidadTipo =
            useMemo(
                () => {
                    const source =
                        registros[0] ||
                        registrosResumen[0];

                    return (
                        source?.entidadTipo ||
                        source?.entidad_tipo ||
                        null
                    );
                },
                [
                    registros,
                    registrosResumen,
                ]
            );

        const resumen =
            useMemo(
                () =>
                    createResumen(
                        registrosResumen
                    ),
                [
                    registrosResumen,
                ]
            );

        const value =
            useMemo(
                () => ({
                    entidadTipoId,
                    entidadId,
                    entidadTipo,

                    registros,
                    registrosResumen,
                    resumen,

                    filters,
                    pagination,

                    loading,
                    summaryLoading,

                    error,
                    message,

                    validParams,

                    clearAlerts,
                    changeFilter,
                    applyFilters,
                    clearFilters,

                    load,
                    refresh,
                    changePage,
                    changeLimit,
                    fetchSummaryRecords,
                }),
                [
                    entidadTipoId,
                    entidadId,
                    entidadTipo,

                    registros,
                    registrosResumen,
                    resumen,

                    filters,
                    pagination,

                    loading,
                    summaryLoading,

                    error,
                    message,

                    validParams,

                    clearAlerts,
                    changeFilter,
                    applyFilters,
                    clearFilters,

                    load,
                    refresh,
                    changePage,
                    changeLimit,
                    fetchSummaryRecords,
                ]
            );

        return (
            <MotorConceptoLegajoContext.Provider
                value={
                    value
                }
            >
                {children}
            </MotorConceptoLegajoContext.Provider>
        );
    };

export const useMotorConceptoLegajoContext =
    () => {
        const context =
            useContext(
                MotorConceptoLegajoContext
            );

        if (!context) {
            throw new Error(
                "useMotorConceptoLegajoContext debe utilizarse dentro de MotorConceptoLegajoProvider"
            );
        }

        return context;
    };

export default MotorConceptoLegajoContext;