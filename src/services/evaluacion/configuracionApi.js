import { api } from "../apiClient";

export const evaluacionConfiguracionApi = {

    /*=========================
      TIPOS
    =========================*/

    listarTipos: () =>
        api.get("/evaluacion/tipos"),

    obtenerTipo: (id) =>
        api.get(`/evaluacion/tipos/${id}`),

    crearTipo: (data) =>
        api.post("/evaluacion/tipos", data),

    actualizarTipo: (id, data) =>
        api.put(`/evaluacion/tipos/${id}`, data),

    eliminarTipo: (id) =>
        api.del(`/evaluacion/tipos/${id}`),



    /*=========================
      CRITERIOS
    =========================*/

    listarCriterios: () =>
        api.get("/evaluacion/criterios"),

    obtenerCriterio: (id) =>
        api.get(`/evaluacion/criterios/${id}`),

    crearCriterio: (data) =>
        api.post("/evaluacion/criterios", data),

    actualizarCriterio: (id, data) =>
        api.put(`/evaluacion/criterios/${id}`, data),

    eliminarCriterio: (id) =>
        api.del(`/evaluacion/criterios/${id}`),



    /*=========================
      PERIODOS
    =========================*/

    listarPeriodos: () =>
        api.get("/evaluacion/periodos"),

    obtenerPeriodo: (id) =>
        api.get(`/evaluacion/periodos/${id}`),

    crearPeriodo: (data) =>
        api.post("/evaluacion/periodos", data),

    actualizarPeriodo: (id, data) =>
        api.put(`/evaluacion/periodos/${id}`, data),

    eliminarPeriodo: (id) =>
        api.del(`/evaluacion/periodos/${id}`),



    /*=========================
      PLANTILLAS
    =========================*/

    listarPlantillas: () =>
        api.get("/evaluacion/plantillas"),

    obtenerPlantilla: (id) =>
        api.get(`/evaluacion/plantillas/${id}`),

    crearPlantilla: (data) =>
        api.post("/evaluacion/plantillas", data),

    actualizarPlantilla: (id, data) =>
        api.put(`/evaluacion/plantillas/${id}`, data),

    eliminarPlantilla: (id) =>
        api.del(`/evaluacion/plantillas/${id}`),

    /*==========================================
  DETALLE PLANTILLAS
==========================================*/

    obtenerDetallePlantilla: (id) =>
        api.get(
            `/evaluacion/plantillas/${id}/detalle`
        ),

    agregarDetallePlantilla: (id, data) =>
        api.post(
            `/evaluacion/plantillas/${id}/detalle`,
            data
        ),

    actualizarDetallePlantilla: (id, data) =>
        api.put(
            `/evaluacion/plantillas/detalle/${id}`,
            data
        ),

    eliminarDetallePlantilla: (id) =>
        api.del(
            `/evaluacion/plantillas/detalle/${id}`
        ),


    obtenerConfiguracionGeneral: () =>

        api.get(

            "/evaluacion/configuracion/general"

        ),

    guardarConfiguracionGeneral: (data) =>

        api.put(

            "/configuracion/general",

            data

        ),

    /*=========================
NOTIFICACIONES
=========================*/

    obtenerConfiguracionNotificaciones: () =>

        api.get(

            "/configuracion/notificaciones"

        ),

    guardarConfiguracionNotificaciones: (data) =>

        api.put(

            "/configuracion/notificaciones",

            data

        ),

    enviarMailPrueba: () =>

        api.post(

            "/configuracion/notificaciones/mail-prueba"

        ),

};