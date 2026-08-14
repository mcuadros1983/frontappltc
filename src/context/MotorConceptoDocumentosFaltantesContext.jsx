import { createContext, useCallback, useContext, useMemo, useState } from "react";
import motorConceptoApi from "../services/motorConceptoApi";

const Context = createContext();

export const MotorConceptoDocumentosFaltantesProvider = ({ children }) => {
    const [filtros, setFiltros] = useState({

        entidad_tipo_id: null,

        entidad_id: null,

        search: "",

        estado: "",

    });

    const [loading, setLoading] = useState(false);

    const [documentos, setDocumentos] = useState([]);

    const [resumen, setResumen] = useState({
        total: 0,
        cumplidos: 0,
        faltantes: 0,
        vencidos: 0,
        proximos: 0,
        porcentaje: 0,
    });

    // const [filtros, setFiltros] = useState({
    //     entidad_tipo_id: null,
    //     entidad_id: null,
    // });

    const cargar = useCallback(async (params = filtros) => {

        if (!params.entidad_tipo_id || !params.entidad_id)
            return;

        setLoading(true);

        try {

            const response =
                await motorConceptoApi.obtenerCumplimiento(params);

            setResumen(response.resumen);

            setDocumentos(response.documentos);

            setFiltros(params);

        } finally {

            setLoading(false);

        }

    }, [filtros]);

    const refresh = useCallback(() => {

        return cargar(filtros);

    }, [cargar, filtros]);

    const value = useMemo(() => ({

        loading,

        documentos,

        resumen,

        filtros,

        setFiltros,

        cargar,

        refresh,

    }), [

        loading,

        documentos,

        resumen,

        filtros,

        cargar,

        refresh,

    ]);

    return (

        <Context.Provider value={value}>

            {children}

        </Context.Provider>

    );

};

export const useMotorConceptoDocumentosFaltantes = () =>
    useContext(Context);