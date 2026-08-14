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
        new URLSearchParams(clean)
            .toString();

    return query
        ? `?${query}`
        : "";

};

export const motorConceptoEntidadAsignacionApi = {

    /*
    ===================================================
    CRUD
    ===================================================
    */

    listar: async (
        params = {}
    ) =>
        unwrap(
            await api.get(
                `/motorconceptos/asignaciones${toQuery(params)}`
            )
        ),

    obtener: async (
        asignacionId
    ) =>
        unwrap(
            await api.get(
                `/motorconceptos/asignaciones/${asignacionId}`
            )
        ),

    crear: async (
        payload
    ) =>
        unwrap(
            await api.post(
                "/motorconceptos/asignaciones",
                payload
            )
        ),

    actualizar: async (
        asignacionId,
        payload
    ) =>
        unwrap(
            await api.put(
                `/motorconceptos/asignaciones/${asignacionId}`,
                payload
            )
        ),

    eliminar: async (
        asignacionId
    ) =>
        unwrap(
            await api.del(
                `/motorconceptos/asignaciones/${asignacionId}`
            )
        ),

    /*
    ===================================================
    Gestión documental
    ===================================================
    */

    obtenerPorEntidad: async (
        entidadTipoId,
        entidadId
    ) =>
        unwrap(
            await api.get(
                `/motorconceptos/asignaciones/entidad${toQuery({
                    entidad_tipo_id:
                        entidadTipoId,

                    entidad_id:
                        entidadId,
                })}`
            )
        ),

    /*
    ===================================================
    Asignación manual
    ===================================================
    */

    asignarConcepto: async (
        payload
    ) =>
        unwrap(
            await api.post(
                "/motorconceptos/asignaciones/asignar",
                payload
            )
        ),

    /*
    ===================================================
    Sincronización
    ===================================================
    */

    sincronizarEntidad: async (
        entidadTipoId,
        entidadId
    ) =>
        unwrap(
            await api.post(
                "/motorconceptos/asignaciones/sincronizar",
                {

                    entidad_tipo_id:
                        entidadTipoId,

                    entidad_id:
                        entidadId,

                }
            )
        ),

    regenerarEntidad: async (
        entidadTipoId,
        entidadId
    ) =>
        unwrap(
            await api.post(
                "/motorconceptos/asignaciones/regenerar",
                {

                    entidad_tipo_id:
                        entidadTipoId,

                    entidad_id:
                        entidadId,

                }
            )
        ),

};

export default motorConceptoEntidadAsignacionApi;