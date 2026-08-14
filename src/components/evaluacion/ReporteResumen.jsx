import React, { useMemo } from "react";

import { Row, Col } from "react-bootstrap";

import {

    ERPKpiCard

} from "../common/erp";

const ReporteResumen = ({

    items = []

}) => {

    /*=========================================
      INDICADORES
    =========================================*/

    const indicadores =

        useMemo(() => {

            const total = items.length;

            const pendientes =

                items.filter(

                    item =>

                        item.estado ===

                        "PENDIENTE"

                ).length;

            const finalizadas =

                items.filter(

                    item =>

                        item.estado ===

                        "FINALIZADA"

                ).length;

            const promedio =

                total === 0

                    ? 0

                    : (

                        items.reduce(

                            (acumulado, item) =>

                                acumulado +

                                Number(

                                    item.porcentaje || 0

                                ),

                            0

                        ) / total

                    );

            return {

                total,

                pendientes,

                finalizadas,

                promedio:

                    promedio.toFixed(2)

            };

        }, [items]);

    /*=========================================
      RENDER
    =========================================*/

    return (

        <Row className="mb-4">

            <Col lg={3} md={6} className="mb-3">

                <ERPKpiCard

                    title="Evaluaciones"

                    value={

                        indicadores.total

                    }

                    color="primary"

                    icon="clipboard"

                />

            </Col>

            <Col lg={3} md={6} className="mb-3">

                <ERPKpiCard

                    title="Promedio"

                    value={`${

                        indicadores.promedio

                    } %`}

                    color="success"

                    icon="bar-chart"

                />

            </Col>

            <Col lg={3} md={6} className="mb-3">

                <ERPKpiCard

                    title="Pendientes"

                    value={

                        indicadores.pendientes

                    }

                    color="warning"

                    icon="clock"

                />

            </Col>

            <Col lg={3} md={6} className="mb-3">

                <ERPKpiCard

                    title="Finalizadas"

                    value={

                        indicadores.finalizadas

                    }

                    color="info"

                    icon="check-circle"

                />

            </Col>

        </Row>

    );

};

export default ReporteResumen;