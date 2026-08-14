import React from "react";

import {

    Card,

    Badge

} from "react-bootstrap";

import {

    ERPTable

} from "../../common/erp";

const DashboardTiposChart = ({

    tipos

}) => {

    const columns = [

        {

            key: "tipo",

            title: "Tipo",

            render: row =>

                row.tipo?.descripcion

        },

        {

            key: "cantidad",

            title: "Evaluaciones"

        },

        {

            key: "promedio",

            title: "Promedio",

            render: row =>

                `${

                    Number(

                        row.promedio

                    ).toFixed(2)

                } %`

        },

        {

            key: "estado",

            title: "",

            render: row => {

                const promedio =

                    Number(

                        row.promedio

                    );

                return (

                    <Badge

                        bg={

                            promedio >= 90

                                ? "success"

                                : promedio >= 75

                                    ? "warning"

                                    : "danger"

                        }

                    >

                        {

                            promedio >= 90

                                ? "Excelente"

                                : promedio >= 75

                                    ? "Bueno"

                                    : "Mejorar"

                        }

                    </Badge>

                );

            }

        }

    ];

    return (

        <Card>

            <Card.Header>

                Resultado por Tipo

            </Card.Header>

            <Card.Body>

                <ERPTable

                    columns={columns}

                    data={

                        tipos || []

                    }

                    pagination={false}

                />

            </Card.Body>

        </Card>

    );

};

export default DashboardTiposChart;