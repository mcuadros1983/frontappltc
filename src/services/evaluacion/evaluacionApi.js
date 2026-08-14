import { api } from "../apiClient";

export const evaluacionApi = {

    /*==========================================
      EVALUACIONES
    ==========================================*/

    listar: () =>
        api.get("/evaluaciones"),

    obtener: (id) =>
        api.get(`/evaluaciones/${id}`),

    crear: (data) =>
        api.post("/evaluaciones", data),

    actualizar: (id, data) =>
        api.put(`/evaluaciones/${id}`, data),

    eliminar: (id) =>
        api.del(`/evaluaciones/${id}`),



    /*==========================================
      RESPUESTAS
    ==========================================*/

    guardarRespuestas: (id, data) =>
        api.post(
            `/evaluaciones/${id}/respuestas`,
            data
        ),

    finalizar: (id) =>
        api.post(
            `/evaluaciones/${id}/finalizar`
        ),

    cambiarEstado: (id, estado) =>
        api.put(
            `/evaluaciones/${id}/estado`,
            {
                estado
            }
        ),

    duplicar: (id) =>
        api.post(
            `/evaluaciones/${id}/duplicar`
        ),

    listarMisEvaluaciones: () =>
        api.get(
            "/evaluaciones/mis-evaluaciones"
        ),

    obtenerResultado: (id) =>

        api.get(

            `/evaluaciones/${id}/resultado`

        ),

    obtenerComparativo: (

        evaluacion1,

        evaluacion2

    ) =>

        api.get(

            `/evaluaciones/reportes/comparativo?evaluacion1=${evaluacion1}&evaluacion2=${evaluacion2}`

        ),

    /*==========================================
HISTORIAL EMPLEADO
==========================================*/

    obtenerEvaluacionesEmpleado: (id) =>
        api.get(
            `/evaluaciones/empleados/${id}`
        ),

    /*==========================================
FORMULARIO
==========================================*/

    obtenerFormulario: (id) =>

        api.get(

            `/evaluaciones/${id}/formulario`

        ),

    // obtenerResultado: (id) =>
    //     api.get(
    //         `/evaluaciones/${id}/resultado`
    //     ),

    // obtenerEvaluaciones: () =>

    // api.get(

    //     "/evaluaciones"

    // ),


};

