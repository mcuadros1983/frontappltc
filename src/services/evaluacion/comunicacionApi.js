import { api } from "../apiClient";

export const comunicacionApi = {

    /*==========================================
      COMUNICACIONES
    ==========================================*/

    listar: () =>
        api.get(
            "/evaluacion/comunicaciones"
        ),

    obtener: (id) =>
        api.get(
            `/evaluacion/comunicaciones/${id}`
        ),

    crear: (data) =>
        api.post(
            "/evaluacion/comunicaciones",
            data
        ),

    actualizar: (id, data) =>
        api.put(
            `/evaluacion/comunicaciones/${id}`,
            data
        ),

    eliminar: (id) =>
        api.del(
            `/evaluacion/comunicaciones/${id}`
        ),

    reenviar: (id) =>
        api.post(
            `/evaluacion/comunicaciones/${id}/reenviar`
        ),

    cancelar: (id) =>
        api.post(
            `/evaluacion/comunicaciones/${id}/cancelar`
        )

};