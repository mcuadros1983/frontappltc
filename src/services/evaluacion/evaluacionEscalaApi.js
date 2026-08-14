// src/services/evaluacion/evaluacionEscalaApi.js

import { api } from "../apiClient";

export const evaluacionEscalaApi = {

    /*=========================================================
      ESCALAS
    =========================================================*/

    listar: () =>
        api.get(
            "/evaluacion/escalas"
        ),

    obtener: (id) =>
        api.get(
            `/evaluacion/escalas/${id}`
        ),

    crear: (data) =>
        api.post(
            "/evaluacion/escalas",
            data
        ),

    actualizar: (id, data) =>
        api.put(
            `/evaluacion/escalas/${id}`,
            data
        ),

    eliminar: (id) =>
        api.del(
            `/evaluacion/escalas/${id}`
        )

};