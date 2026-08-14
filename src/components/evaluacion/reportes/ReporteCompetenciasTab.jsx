import React from "react";

import {

    Card,

    ProgressBar

} from "react-bootstrap";

import {

    ERPTable

} from "../../common/erp";

const ReporteCompetenciasTab = ({

    dashboard

}) => {

    const reporte = dashboard.reporte || {};

    console.log("competencias", reporte)

    if (!dashboard) {

        return null;

    }

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

            key: "cumplimiento",

            title: "Cumplimiento",

            render: row => {

                const porcentaje =

                    Number(

                        row.promedio

                    ) * 20;

                let color = "danger";

                if (

                    porcentaje >= 90

                ) {

                    color = "success";

                }

                else if (

                    porcentaje >= 75

                ) {

                    color = "warning";

                }

                return (

                    <ProgressBar

                        now={

                            porcentaje

                        }

                        variant={

                            color

                        }

                        label={`${porcentaje.toFixed(0)

                            } %`}

                    />

                );

            }

        }

    ];

    return (

        <Card>

            <Card.Header>

                Competencias

            </Card.Header>

            <Card.Body>

                <ERPTable

                    columns={columns}

                    data={

                        reporte.competencias || []

                    }

                    pagination={false}

                />

            </Card.Body>

        </Card>

    );

};

export default ReporteCompetenciasTab;