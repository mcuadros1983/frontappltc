import React from "react";

import {

    ProgressBar

} from "react-bootstrap";

import {

    ERPTable

} from "../../common/erp";

const ResultadoCompetenciasTab = ({

    competencias

}) => {

    const columns = [

        {

            key: "competencia",

            title: "Competencia",

            render: row =>

                row.criterio?.descripcion

        },

        {

            key: "cantidad",

            title: "Evaluaciones"

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

            key: "porcentaje",

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

                competencias || []

            }

        />

    );

};

export default ResultadoCompetenciasTab;