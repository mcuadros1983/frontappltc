import { api } from "../apiClient";

export const dashboardApi = {

    /*==========================================
      DASHBOARD
    ==========================================*/

    obtenerResumen: () =>
        api.get(
            "/evaluacion/dashboard/resumen"
        ),

    /*==========================================
      DASHBOARD ANALÍTICO
    ==========================================*/

    obtenerDashboardAnalitico: () =>
        api.get(
            "/evaluacion/dashboard/analitico"
        ),

    /*==========================================
      DASHBOARD GERENCIAL
    ==========================================*/

    obtenerDashboardGerencial: () =>
        api.get(
            "/evaluacion/dashboard/gerencial"
        ),

    /*==========================================
      AVISOS
    ==========================================*/

    obtenerAvisos: () =>
        api.get(
            "/evaluacion/dashboard/avisos"
        )

};