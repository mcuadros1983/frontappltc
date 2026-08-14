import { api } from "../apiClient";

const URL = "/evaluaciones/reportes";

const obtenerReporte = async (params = {}) => {

    const query = new URLSearchParams(params).toString();

    return await api.get(

        query ? `${URL}?${query}` : URL

    );

};

const exportarReporte = async (params = {}) => {

    const query = new URLSearchParams(params).toString();

    return await api.get(

        query ? `${URL}/exportar?${query}` : `${URL}/exportar`

    );

};

export default {

    obtenerReporte,

    exportarReporte

};