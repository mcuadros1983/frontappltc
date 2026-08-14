import { api } from "../apiClient";

export const metaApi = {

    /*=========================================================
      METAS
    =========================================================*/

    listarMetas: () =>
        api.get(
            "/evaluacion/metas"
        ),

    obtenerMeta: (id) =>
        api.get(
            `/evaluacion/metas/${id}`
        ),

    crearMeta: (data) =>
        api.post(
            "/evaluacion/metas",
            data
        ),

    actualizarMeta: (id, data) =>
        api.put(
            `/evaluacion/metas/${id}`,
            data
        ),

    eliminarMeta: (id) =>
        api.del(
            `/evaluacion/metas/${id}`
        ),

    /*=========================================================
      ASIGNACIONES
    =========================================================*/

    listarAsignaciones: () =>
        api.get(
            "/evaluacion/meta-asignaciones"
        ),

    obtenerAsignacion: (id) =>
        api.get(
            `/evaluacion/meta-asignaciones/${id}`
        ),

    crearAsignacion: (data) =>
        api.post(
            "/evaluacion/meta-asignaciones",
            data
        ),

    actualizarAsignacion: (id, data) =>
        api.put(
            `/evaluacion/meta-asignaciones/${id}`,
            data
        ),

    eliminarAsignacion: (id) =>
        api.del(
            `/evaluacion/meta-asignaciones/${id}`
        ),

    asignar: (id) =>
        api.post(
            `/evaluacion/meta-asignaciones/${id}/asignar`
        ),

    finalizar: (id) =>
        api.post(
            `/evaluacion/meta-asignaciones/${id}/finalizar`
        ),

    cancelar: (id) =>
        api.post(
            `/evaluacion/meta-asignaciones/${id}/cancelar`
        ),

    /*=========================================================
      AVANCES
    =========================================================*/

    listarAvances: () =>
        api.get(
            "/evaluacion/meta-avances"
        ),

    obtenerAvance: (id) =>
        api.get(
            `/evaluacion/meta-avances/${id}`
        ),

    actualizarAvance: (id, data) =>
        api.put(
            `/evaluacion/meta-avances/${id}`,
            data
        ),

    eliminarAvance: (id) =>
        api.del(
            `/evaluacion/meta-avances/${id}`
        ),

    registrarAvance: (data) =>
        api.post(
            "/evaluacion/meta-avances/registrar",
            data
        ),

    inicializarMetas: () =>

        api.post(

            "/evaluacion/metas/inicializar"

        ),



};