import { api } from "../apiClient";

const toQuery = (params = {}) => {

    const clean = Object.entries(params)

        .filter(

            ([, value]) =>

                value !== undefined &&

                value !== null &&

                value !== ""

        );

    if (!clean.length) {

        return "";

    }

    return `?${new URLSearchParams(clean)

            .toString()

        }`;

};

export const reporteApi = {

    /*==========================================
      REPORTE EVALUACIONES
    ==========================================*/

    obtenerReporte: (filtros = {}) =>

        api.get(

            `/evaluacion/reportes${toQuery(filtros)

            }`

        ),
    obtenerComparativo: (

        evaluacion1,

        evaluacion2

    ) =>

        api.get(

            `/evaluaciones/reportes/comparativo?evaluacion1=${evaluacion1}&evaluacion2=${evaluacion2}`

        )



};