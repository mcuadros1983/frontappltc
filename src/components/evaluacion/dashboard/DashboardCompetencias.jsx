import React from "react";

import {

    Card,

    ProgressBar

} from "react-bootstrap";

import {

    ERPTable

} from "../../common/erp";

const DashboardCompetencias = ({

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

            title: "Resp."

        },

        {

            key: "promedio",

            title: "Prom.",

            render: row =>

                Number(

                    row.promedio

                ).toFixed(2)

        },

        {

            key: "avance",

            title: "Cumplimiento",

            render: row => {

                const porcentaje =

                    Number(

                        row.promedio

                    ) * 20;

                let variant = "danger";

                if (

                    porcentaje >= 90

                ) {

                    variant = "success";

                }

                else if (

                    porcentaje >= 75

                ) {

                    variant = "warning";

                }

                return (

                    <ProgressBar

                        now={

                            porcentaje

                        }

                        variant={

                            variant

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

        <Card>

            <Card.Header>

                Competencias

            </Card.Header>

            <Card.Body>

                <ERPTable

                    columns={columns}

                    data={

                        competencias || []

                    }

                    pagination={false}

                />

            </Card.Body>

        </Card>

    );

};

export default DashboardCompetencias;