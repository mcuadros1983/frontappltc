import {
    useCallback,
    useEffect,
    useState,
} from "react";

import motorConceptoRegistroApi
    from "../services/motorConceptoRegistroApi";

const initialFilters = {
    search: "",
    estado: "",
    concepto_id: "",
    entidad_tipo_id: "",
    entidad_id: "",
    page: 1,
    limit: 20,
    sortBy: "ultimo_movimiento",
    sortOrder: "DESC",
};

export const useRegistrosConcepto = () => {

    const [
        filters,
        setFilters,
    ] = useState(
        initialFilters
    );

    const [
        items,
        setItems,
    ] = useState([]);

    const [
        pagination,
        setPagination,
    ] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const cargar =
        useCallback(async () => {
            setLoading(true);
            setError("");

            try {
                const response =
                    await motorConceptoRegistroApi
                        .listar(filters);

                setItems(
                    Array.isArray(response)
                        ? response
                        : response?.items || []
                );

                setPagination(
                    response?.pagination || {
                        page:
                            filters.page,
                        limit:
                            filters.limit,
                        total:
                            Array.isArray(response)
                                ? response.length
                                : 0,
                        totalPages: 1,
                    }
                );
            } catch (err) {
                setError(
                    err?.message ||
                    "No se pudieron cargar los registros"
                );
            } finally {
                setLoading(false);
            }
        }, [filters]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const updateFilter = (
        key,
        value
    ) => {
        setFilters(
            (current) => ({
                ...current,
                [key]: value,
                page:
                    key === "page"
                        ? value
                        : 1,
            })
        );
    };

    return {
        filters,
        items,
        pagination,
        loading,
        error,
        cargar,
        updateFilter,
        setFilters,
    };
};

export default useRegistrosConcepto;
