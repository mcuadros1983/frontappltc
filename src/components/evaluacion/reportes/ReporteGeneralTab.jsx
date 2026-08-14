import React from "react";

import {

    Card,

    Row,

    Col

} from "react-bootstrap";

import {

    ERPKpiCard,

    ERPTable

} from "../../common/erp";

import DashboardSemaforo
    from "../DashboardSemaforo";

import DashboardHeatmap
    from "../DashboardHeatmap";

import DashboardRadar
    from "../DashboardRadar";



const ReporteGeneralTab = ({

    dashboard

}) => {

    if (!dashboard) {

        return null;

    }

    const reporte = dashboard.reporte || {};

    const resumen = dashboard.resumen || {};

    const totales = reporte.totales || {};

    const columns = [

        {

            key: "tipo",

            title: "Tipo",

            render: row =>

                row.tipo?.descripcion

        },

        {

            key: "cantidad",

            title: "Cantidad"

        },

        {

            key: "promedio",

            title: "Promedio",

            render: row =>

                `${Number(

                    row.promedio

                ).toFixed(2)

                } %`

        }

    ];

    console.log("Dashboard:", dashboard);

    return (

        <>

            <Row className="mb-4">

                <Col md={3}>

                    <ERPKpiCard

                        title="Evaluaciones"

                        value={

                            totales.evaluaciones

                        }

                        color="primary"

                    />

                </Col>

                <Col md={3}>

                    <ERPKpiCard

                        title="Pendientes"

                        value={

                            totales.pendientes

                        }

                        color="warning"

                    />

                </Col>

                <Col md={3}>

                    <ERPKpiCard

                        title="Finalizadas"

                        value={

                            totales.finalizadas

                        }

                        color="success"

                    />

                </Col>

                <Col md={3}>

                    <ERPKpiCard

                        title="Promedio"

                        value={`${totales.promedio

                            } %`}

                        color="info"

                    />

                </Col>

            </Row>

            <Row className="mb-4">

                <Col lg={4}>

                    <DashboardSemaforo

                        titulo="Frecuencia"

                        total={resumen.frecuencias?.total}

                        verde={resumen.frecuencias?.vigentes}

                        amarillo={resumen.frecuencias?.proximas}

                        rojo={resumen.frecuencias?.vencidas}

                        verdeTexto="Vigentes"

                        amarilloTexto="Próximas"

                        rojoTexto="Vencidas"

                    />

                </Col>

                <Col lg={4}>

                    <DashboardSemaforo

                        titulo="Cumplimiento"

                        total={resumen.cumplimiento?.total}

                        verde={resumen.cumplimiento?.cumplen}

                        amarillo={resumen.cumplimiento?.riesgo}

                        rojo={resumen.cumplimiento?.incumplen}

                        verdeTexto="Cumplen"

                        amarilloTexto="Riesgo"

                        rojoTexto="Incumplen"

                    />

                </Col>

                <Col lg={4}>

                    <DashboardSemaforo

                        titulo="Brechas"

                        total={resumen.brechas?.total}

                        verde={resumen.brechas?.correctas}

                        amarillo={resumen.brechas?.riesgo}

                        rojo={resumen.brechas?.fueraRango}

                        verdeTexto="Correctas"

                        amarilloTexto="Riesgo"

                        rojoTexto="Fuera"

                    />

                </Col>

            </Row>

            <Row className="mb-4">

                <Col>

                    <DashboardHeatmap

                        frecuencias={

                            resumen.frecuencias?.items || []

                        }

                        cumplimiento={

                            resumen.cumplimiento?.items || []

                        }

                        brechas={

                            resumen.brechas?.items || []

                        }

                    />

                </Col>

            </Row>

            <Row className="mb-4">

                <Col>

                    <DashboardRadar

                        tipos={

                            reporte.tipos || []

                        }

                        cumplimiento={

                            resumen.cumplimiento || {}

                        }

                        brechas={

                            resumen.brechas || {}

                        }

                    />

                </Col>

            </Row>


            <Card>

                <Card.Header>

                    Resumen por Tipo

                </Card.Header>

                <Card.Body>

                    <ERPTable

                        columns={columns}

                        data={

                            reporte.tipos

                        }

                        pagination={false}

                    />

                </Card.Body>

            </Card>

            <Row className="mt-4">

                <Col>

                    <Card>

                        <Card.Header>

                            Ranking General

                        </Card.Header>

                        <Card.Body>

                            <ERPTable

                                pagination={false}

                                data={

                                    resumen.ranking || []

                                }

                                columns={[

                                    {

                                        key: "empleado",

                                        title: "Empleado"

                                    },

                                    {

                                        key: "cantidad",

                                        title: "Evaluaciones"

                                    },

                                    {

                                        key: "promedio",

                                        title: "Promedio",

                                        render: row =>

                                            `${Number(

                                                row.promedio || 0

                                            ).toFixed(2)} %`

                                    }

                                ]}

                            />

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

        </>

    );

};

export default ReporteGeneralTab;