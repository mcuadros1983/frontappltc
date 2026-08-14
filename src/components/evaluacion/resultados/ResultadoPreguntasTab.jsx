import React from "react";

import {

    ProgressBar

} from "react-bootstrap";

import {

    ERPTable

} from "../../common/erp";

const ResultadoPreguntasTab = ({

    preguntas

}) => {

    const columns = [

        {

            key: "codigo",

            title: "Código",

            render: row =>

                row.criterio?.codigo

        },

        {

            key: "pregunta",

            title: "Pregunta",

            render: row =>

                row.criterio?.pregunta

        },

        {

            key: "competencia",

            title: "Competencia",

            render: row =>

                row.criterio?.descripcion

        },

        {

            key: "cantidad",

            title: "Respuestas"

        },

        {

            key: "promedio",

            title: "Promedio",

            render: row =>

                Number(

                    row.promedio

                ).toFixed(2)

        },

        {

            key: "cumplimiento",

            title: "Cumplimiento",

            render: row => {

                const porcentaje =

                    Number(

                        row.promedio

                    ) * 20;

                return (

                    <ProgressBar

                        now={

                            porcentaje

                        }

                        label={`${

                            porcentaje.toFixed(0)

                        } %`}

                    />

                );

            }

        }

    ];

    return (

        <ERPTable

            columns={columns}

            data={

                preguntas || []

            }

        />

    );

};

export default ResultadoPreguntasTab;