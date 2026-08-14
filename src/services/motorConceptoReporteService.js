import { api } from "./apiClient";

const unwrap = (res) =>
    res && res.data !== undefined
        ? res.data
        : res;

const toQuery = (params = {}) => {

    const clean =
        Object.entries(params)
            .filter(([, value]) =>
                value !== undefined &&
                value !== null &&
                value !== ""
            )
            .reduce((acc, [key, value]) => {

                acc[key] = value;

                return acc;

            }, {});

    const query =
        new URLSearchParams(clean).toString();

    return query
        ? `?${query}`
        : "";

};

const mapListParams = (params = {}) => ({

    search:
        params.search,

    concepto_id:
        params.concepto_id,

    entidad_tipo_id:
        params.entidad_tipo_id,

    entidad_id:
        params.entidad_id,

    estado:
        params.estado,

    activo:
        params.activo,

    sucursal_id:
        params.sucursal_id,

    fecha_vencimiento_desde:
        params.fecha_vencimiento_desde,

    fecha_vencimiento_hasta:
        params.fecha_vencimiento_hasta,

    ultimo_movimiento_desde:
        params.ultimo_movimiento_desde,

    ultimo_movimiento_hasta:
        params.ultimo_movimiento_hasta,

    page:
        params.page,

    limit:
        params.limit,

    sortBy:
        params.sortBy,

    sortOrder:
        params.sortOrder,

});

const motorConceptoReporteService = {

    getRegistros: async (params = {}) =>
        unwrap(
            await api.get(
                `/motorconceptos/reportes/registros${toQuery(
                    mapListParams(params)
                )}`
            )
        ),

    getConceptos: async () =>
        unwrap(
            await api.get(
                "/motorconceptos"
            )
        ),

    getEntidadTipos: async () =>
        unwrap(
            await api.get(
                "/motorconceptos/entidad-tipos"
            )
        ),

    getSucursales: async () =>
        unwrap(
            await api.get(
                "/sucursales"
            )
        ),

};

export default motorConceptoReporteService;