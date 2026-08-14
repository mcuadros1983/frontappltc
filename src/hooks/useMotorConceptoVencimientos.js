import {
    useCallback,
    useEffect,
    useState,
} from "react";

import motorConceptoApi
    from "../services/motorConceptoApi";

const initialResumen = {

    total: 0,

    vencidos: 0,

    proximos30: 0,

    proximos60: 0,

    proximos90: 0,

};

const initialPagination = {

    page: 1,

    limit: 20,

    total: 0,

    totalPages: 0,

};

const useMotorConceptoVencimientos = (
    initialFilters = {}
) => {

    const [loading, setLoading] =
        useState(false);

    const [documentos, setDocumentos] =
        useState([]);

    const [resumen, setResumen] =
        useState(initialResumen);

    const [pagination, setPagination] =
        useState(initialPagination);

    const [filters, setFilters] =
        useState({

            page: 1,

            limit: 20,

            sortBy: "fecha_vencimiento",

            sortOrder: "ASC",

            search: "",

            empresa_id: "",

            sucursal_id: "",

            entidad_tipo_id: "",

            entidad_id: "",

            concepto_id: "",

            estado: "",

            dias: "",

            desde: "",

            hasta: "",

            ...initialFilters,

        });

    const cargar = useCallback(async (extra = {}) => {

        setLoading(true);

        try {

            const response =
                await motorConceptoApi.obtenerVencimientos({

                    ...filters,

                    ...extra,

                });

            setResumen(
                response.resumen ??
                initialResumen
            );

            setDocumentos(
                response.documentos ??
                response.rows ??
                []
            );
            setPagination(

                response.pagination ??

                initialPagination

            );

        } finally {

            setLoading(false);

        }

    }, [filters]);

    useEffect(() => {

        cargar();

    }, [cargar]);

    return {

        loading,

        documentos,

        resumen,

        pagination,

        filters,

        setFilters,

        refresh: cargar,

    };

};

export default useMotorConceptoVencimientos;