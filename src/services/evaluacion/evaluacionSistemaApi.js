// src/services/evaluacion/evaluacionSistemaApi.js

import { api } from "../apiClient";

export const evaluacionSistemaApi = {

    /*=========================================================
      CONFIGURACIÓN DEL MÓDULO
    =========================================================*/

    obtenerConfiguracion: () =>
        api.get(
            "/evaluacion/sistema"
        ),

    guardarConfiguracion: (data) =>
        api.put(
            "/evaluacion/sistema",
            data
        )

};