import { api } from "../apiClient";


/*
|--------------------------------------------------------------------------
| UNWRAP
|--------------------------------------------------------------------------
*/

const unwrap = (res) =>
    res && res.data !== undefined
        ? res.data
        : res;


/*
|--------------------------------------------------------------------------
| QUERY STRING
|--------------------------------------------------------------------------
*/

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


    const query =
        new URLSearchParams(
            clean
        ).toString();


    return query
        ? `?${query}`
        : "";

};


/*
|--------------------------------------------------------------------------
| MAPEAR FILTROS DE LISTADO
|--------------------------------------------------------------------------
|
| Mantiene separados los nombres utilizados por la UI de los nombres
| esperados por el backend.
|
|--------------------------------------------------------------------------
*/

const mapListParams = (params = {}) => ({

    categoria:
        params.categoria,

    tipo:
        params.tipo,

    fecha_desde:
        params.fecha_desde,

    fecha_hasta:
        params.fecha_hasta,

    sucursal_id:
        params.sucursal_id,

    articulo_id:
        params.articulo_id,

    activo:
        params.activo,

    search:
        params.search ??
        params.buscar,

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


/*
|--------------------------------------------------------------------------
| API INTELIGENCIA - EVENTOS
|--------------------------------------------------------------------------
*/

export const inteligenciaEventoApi = {


    /*
    |--------------------------------------------------------------------------
    | CONFIGURACIÓN
    |--------------------------------------------------------------------------
    */

    obtenerConfiguracion: async () =>
        unwrap(
            await api.get(
                "/inteligencia/eventos/configuracion"
            )
        ),


    /*
    |--------------------------------------------------------------------------
    | LISTAR
    |--------------------------------------------------------------------------
    */

    listar: async (params = {}) =>
        unwrap(
            await api.get(
                `/inteligencia/eventos${toQuery(
                    mapListParams(params)
                )}`
            )
        ),


    /*
    |--------------------------------------------------------------------------
    | OBTENER POR ID
    |--------------------------------------------------------------------------
    */

    obtener: async (id) =>
        unwrap(
            await api.get(
                `/inteligencia/eventos/${id}`
            )
        ),


    /*
    |--------------------------------------------------------------------------
    | CREAR
    |--------------------------------------------------------------------------
    */

    crear: async (payload) =>
        unwrap(
            await api.post(
                "/inteligencia/eventos",
                payload
            )
        ),


    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR
    |--------------------------------------------------------------------------
    */

    actualizar: async (
        id,
        payload
    ) =>
        unwrap(
            await api.put(
                `/inteligencia/eventos/${id}`,
                payload
            )
        ),


    /*
    |--------------------------------------------------------------------------
    | ELIMINAR
    |--------------------------------------------------------------------------
    */

    eliminar: async (id) =>
        unwrap(
            await api.del(
                `/inteligencia/eventos/${id}`
            )
        ),

};


export default inteligenciaEventoApi;