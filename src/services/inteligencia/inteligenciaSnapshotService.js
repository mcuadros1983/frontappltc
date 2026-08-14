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
| API INTELIGENCIA - SNAPSHOTS
|--------------------------------------------------------------------------
*/

export const inteligenciaSnapshotApi = {


    /*
    |--------------------------------------------------------------------------
    | LISTAR
    |--------------------------------------------------------------------------
    */

    listar: async () =>
        unwrap(
            await api.get(
                "/inteligencia/snapshots"
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
                `/inteligencia/snapshots/${id}`
            )
        ),


    /*
    |--------------------------------------------------------------------------
    | CREAR SNAPSHOT
    |--------------------------------------------------------------------------
    |
    | payload:
    |
    | {
    |     fecha: "2026-08-13",
    |     observaciones: "..."
    | }
    |
    | El backend obtiene automáticamente los precios y promociones
    | existentes para esa fecha.
    |--------------------------------------------------------------------------
    */

    crear: async (payload) =>
        unwrap(
            await api.post(
                "/inteligencia/snapshots",
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
                `/inteligencia/snapshots/${id}`
            )
        ),

};


export default inteligenciaSnapshotApi;