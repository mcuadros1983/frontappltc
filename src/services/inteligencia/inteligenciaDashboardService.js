import { api } from "../apiClient";


/*
|--------------------------------------------------------------------------
| UNWRAP
|--------------------------------------------------------------------------
|
| apiClient ya devuelve el JSON procesado.
|
| Dejamos unwrap por compatibilidad con el patrón utilizado
| por los demás services del ERP.
|--------------------------------------------------------------------------
*/

const unwrap = (res) =>
    res && res.data !== undefined
        ? res.data
        : res;


/*
|--------------------------------------------------------------------------
| NORMALIZAR RESPUESTA DEL DASHBOARD
|--------------------------------------------------------------------------
|
| El backend responde:
|
| {
|     ok: true,
|     dashboard: {...}
| }
|
| Desde el frontend queremos trabajar directamente con:
|
| {
|     fecha,
|     estado_general,
|     fuentes,
|     eventos_hoy,
|     proximos_eventos
| }
|
|--------------------------------------------------------------------------
*/

const unwrapDashboard = (res) => {

    const data =
        unwrap(res);


    return (
        data?.dashboard ||
        data
    );

};


/*
|--------------------------------------------------------------------------
| API DASHBOARD INTELIGENCIA COMERCIAL
|--------------------------------------------------------------------------
*/

export const inteligenciaDashboardApi = {


    /*
    |--------------------------------------------------------------------------
    | OBTENER DASHBOARD
    |--------------------------------------------------------------------------
    |
    | GET /inteligencia/dashboard
    |--------------------------------------------------------------------------
    */

    obtener: async () => {

        const response =
            await api.get(
                "/inteligencia/dashboard"
            );


        return unwrapDashboard(
            response
        );

    },

};


/*
|--------------------------------------------------------------------------
| EXPORT DEFAULT
|--------------------------------------------------------------------------
*/

export default inteligenciaDashboardApi;