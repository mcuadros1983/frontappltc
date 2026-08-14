import { api } from "./apiClient";

const unwrap = (res) =>
    res && res.data !== undefined
        ? res.data
        : res;

const toQuery = (params = {}) => {
    const clean = Object.entries(params)
        .filter(([, value]) =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

    const query = new URLSearchParams(clean).toString();

    return query ? `?${query}` : "";
};

const mapListParams = (params = {}) => ({
    search:
        params.search ??
        params.buscar,
    activo:
        params.activo,
    modo_captura:
        params.modo_captura,
    entidad_tipo_id:
        params.entidad_tipo_id,
    page:
        params.page,
    limit:
        params.limit,
    sortBy:
        params.sortBy ??
        params.orderBy,
    sortOrder:
        params.sortOrder ??
        params.orderDirection,
});

export const motorConceptoApi = {

    listar: async (params = {}) =>
        unwrap(
            await api.get(
                `/motorconceptos${toQuery(
                    mapListParams(params)
                )}`
            )
        ),

    obtener: async (id) =>
        unwrap(
            await api.get(
                `/motorconceptos/${id}`
            )
        ),

    crear: async (payload) =>
        unwrap(
            await api.post(
                "/motorconceptos",
                payload
            )
        ),

    actualizar: async (id, payload) =>
        unwrap(
            await api.put(
                `/motorconceptos/${id}`,
                payload
            )
        ),

    eliminar: async (id) =>
        unwrap(
            await api.del(
                `/motorconceptos/${id}`
            )
        ),

    listarEntidadTipos: async () =>
        unwrap(
            await api.get(
                "/motorconceptos/entidad-tipos"
            )
        ),

    // inicializarEntidadTipos: async () =>
    //     unwrap(
    //         await api.post(
    //             "/motorconceptos/entidad-tipos/seed"
    //         )
    //     ),

    crearCampo: async (
        conceptoId,
        payload
    ) =>
        unwrap(
            await api.post(
                `/motorconceptos/${conceptoId}/campos`,
                payload
            )
        ),

    actualizarCampo: async (
        conceptoId,
        campoId,
        payload
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/${conceptoId}/campos/${campoId}`,
                payload
            )
        ),

    eliminarCampo: async (
        conceptoId,
        campoId
    ) =>
        unwrap(
            await api.del(
                `/motorconceptos/${conceptoId}/campos/${campoId}`
            )
        ),

    crearArchivoTipo: async (
        conceptoId,
        payload
    ) =>
        unwrap(
            await api.post(
                `/motorconceptos/${conceptoId}/archivo-tipos`,
                payload
            )
        ),

    actualizarArchivoTipo: async (
        conceptoId,
        archivoTipoId,
        payload
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/${conceptoId}/archivo-tipos/${archivoTipoId}`,
                payload
            )
        ),

    eliminarArchivoTipo: async (
        conceptoId,
        archivoTipoId
    ) =>
        unwrap(
            await api.del(
                `/motorconceptos/${conceptoId}/archivo-tipos/${archivoTipoId}`
            )
        ),

    crearRegla: async (
        conceptoId,
        payload
    ) =>
        unwrap(
            await api.post(
                `/motorconceptos/${conceptoId}/reglas`,
                payload
            )
        ),

    actualizarRegla: async (
        conceptoId,
        reglaId,
        payload
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/${conceptoId}/reglas/${reglaId}`,
                payload
            )
        ),

    eliminarRegla: async (
        conceptoId,
        reglaId
    ) =>
        unwrap(
            await api.del(
                `/motorconceptos/${conceptoId}/reglas/${reglaId}`
            )
        ),

    obtenerCumplimiento: async (params = {}) =>
        unwrap(
            await api.get(
                `/motorconceptos/cumplimiento${toQuery({
                    entidad_tipo_id: params.entidad_tipo_id,
                    entidad_id: params.entidad_id,
                })}`
            )
        ),

    obtenerVencimientos: async (params = {}) =>
        unwrap(
            await api.get(
                `/motorconceptos/vencimientos${toQuery({
                    empresa_id: params.empresa_id,
                    sucursal_id: params.sucursal_id,
                    entidad_tipo_id: params.entidad_tipo_id,
                    entidad_id: params.entidad_id,
                    concepto_id: params.concepto_id,
                    estado: params.estado,
                    dias: params.dias,
                    desde: params.desde,
                    hasta: params.hasta,
                    search: params.search,
                    page: params.page,
                    limit: params.limit,
                    sortBy: params.sortBy,
                    sortOrder: params.sortOrder,
                })}`
            )
        ),
};

export default motorConceptoApi;
