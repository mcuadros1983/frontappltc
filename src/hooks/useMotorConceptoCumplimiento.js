import {
    useCallback,
    useEffect,
    useState,
} from "react";

import motorConceptoApi
    from "../services/motorConceptoApi";

const initialResumen = {

    total: 0,

    cumplidos: 0,

    faltantes: 0,

    vencidos: 0,

    proximos: 0,

    porcentaje: 0,

};

const useMotorConceptoCumplimiento = (
    entidadTipoId,
    entidadId
) => {

    const [loading, setLoading] =
        useState(false);

    const [documentos, setDocumentos] =
        useState([]);

    const [resumen, setResumen] =
        useState(initialResumen);

    const cargar = useCallback(async (extra = {}) => {

        if (!entidadTipoId || !entidadId)
            return;

        setLoading(true);

        try {

            const response =
                await motorConceptoApi.obtenerCumplimiento({

                    entidad_tipo_id:
                        entidadTipoId,

                    entidad_id:
                        entidadId,

                    ...extra,

                });

            setResumen(
                response.resumen ??
                initialResumen
            );

            setDocumentos(
                response.documentos ??
                []
            );

        } finally {

            setLoading(false);

        }

    }, [

        entidadTipoId,

        entidadId,

    ]);

    useEffect(() => {

        cargar();

    }, [cargar]);

    return {

        loading,

        resumen,

        documentos,

        refresh: cargar,

    };

};

export default useMotorConceptoCumplimiento;