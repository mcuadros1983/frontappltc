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

    const clean =
        Object.entries(params)
            .filter(
                ([, value]) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
            )
            .reduce(
                (acc, [key, value]) => {

                    acc[key] = value;

                    return acc;

                },
                {}
            );


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
| API CLIMA
|--------------------------------------------------------------------------
*/

export const inteligenciaClimaApi = {


    /*
    |--------------------------------------------------------------------------
    | LISTAR HISTÓRICO
    |--------------------------------------------------------------------------
    */

    listar: async (params = {}) =>
        unwrap(
            await api.get(
                `/inteligencia/clima${toQuery({

                    fecha_desde:
                        params.fecha_desde,

                    fecha_hasta:
                        params.fecha_hasta,

                })}`
            )
        ),


    /*
    |--------------------------------------------------------------------------
    | OBTENER REGISTRO
    |--------------------------------------------------------------------------
    */

    obtener: async (id) =>
        unwrap(
            await api.get(
                `/inteligencia/clima/${id}`
            )
        ),


    /*
    |--------------------------------------------------------------------------
    | CAPTURA MANUAL
    |--------------------------------------------------------------------------
    |
    | Esto NO reemplaza al scheduler.
    |
    | Sirve para:
    |
    | - pruebas
    | - recuperación ante fallos
    | - ejecución administrativa
    |
    |--------------------------------------------------------------------------
    */

    capturar: async () =>
        unwrap(
            await api.post(
                "/inteligencia/clima/capturar"
            )
        ),

};


export default inteligenciaClimaApi;