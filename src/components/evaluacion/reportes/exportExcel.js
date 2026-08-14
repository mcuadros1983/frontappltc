import * as XLSX from "xlsx";

export const exportarComparativoExcel = (

    comparativo,

    campania1,

    campania2,

    empleadosMap

) => {

    if (!comparativo) {

        return;

    }

    const workbook = XLSX.utils.book_new();

    /*=========================================
    RESUMEN
    =========================================*/

    const resumen = [

        {

            Concepto: "Campaña A",

            Valor:

                campania1?.numero ||

                ""

        },

        {

            Concepto: "Campaña B",

            Valor:

                campania2?.numero ||

                ""

        },

        {

            Concepto: "Fecha",

            Valor:

                new Date()

                    .toLocaleString()

        }

    ];

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(

            resumen

        ),

        "Resumen"

    );

    /*=========================================
    INDICADORES
    =========================================*/

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(

            comparativo.indicadores.map(

                item => ({

                    Indicador:

                        item.descripcion,

                    "Campaña A":

                        item.campania1,

                    "Campaña B":

                        item.campania2,

                    Diferencia:

                        item.diferencia,

                    Variación:

                        item.variacion,

                    Tendencia:

                        item.tendencia

                })

            )

        ),

        "Indicadores"

    );

    /*=========================================
    COMPETENCIAS
    =========================================*/

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(

            comparativo.competencias.map(

                item => ({

                    Competencia:

                        item.campania1?.criterio

                            ?.descripcion ||

                        item.campania2?.criterio

                            ?.descripcion ||

                        "",

                    "Campaña A":

                        item.campania1

                            ?.promedio ??

                        0,

                    "Campaña B":

                        item.campania2

                            ?.promedio ??

                        0,

                    Diferencia:

                        item.diferencia,

                    Variación:

                        item.variacion,

                    Tendencia:

                        item.tendencia

                })

            )

        ),

        "Competencias"

    );

    /*=========================================
    PREGUNTAS
    =========================================*/

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(

            comparativo.preguntas.map(

                item => ({

                    Pregunta:

                        item.campania1?.criterio

                            ?.pregunta ||

                        item.campania2?.criterio

                            ?.pregunta ||

                        "",

                    "Campaña A":

                        item.campania1

                            ?.promedio ??

                        0,

                    "Campaña B":

                        item.campania2

                            ?.promedio ??

                        0,

                    Diferencia:

                        item.diferencia,

                    Variación:

                        item.variacion,

                    Tendencia:

                        item.tendencia

                })

            )

        ),

        "Preguntas"

    );

    /*=========================================
    RANKING
    =========================================*/

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(

            comparativo.ranking.map(

                item => ({

                    Empleado:

                        empleadosMap.get(

                            Number(item.empleado_id)

                        ) ||

                        `Empleado #${item.empleado_id}`,

                    "Campaña A":

                        item.campania1,

                    "Campaña B":

                        item.campania2,

                    Diferencia:

                        item.diferencia,

                    Variación:

                        item.variacion,

                    Tendencia:

                        item.tendencia

                })

            )

        ),

        "Ranking"

    );

    XLSX.writeFile(

        workbook,

        `Comparativo_${Date.now()}.xlsx`

    );

};

export default exportarComparativoExcel;