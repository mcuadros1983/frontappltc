import React from "react";

import {

    Row,

    Col

} from "react-bootstrap";

import {

    ERPKpiCard

} from "../../common/erp";

const DashboardKPIs = ({

    indicadores

}) => {

    if (!indicadores) {

        return null;

    }

    return (

        <Row className="mb-4">

            <Col md={3}>

                <ERPKpiCard

                    title="Evaluaciones"

                    value={

                        indicadores.evaluaciones

                    }

                    color="primary"

                />

            </Col>

            <Col md={3}>

                <ERPKpiCard

                    title="Pendientes"

                    value={

                        indicadores.pendientes

                    }

                    color="warning"

                />

            </Col>

            <Col md={3}>

                <ERPKpiCard

                    title="Finalizadas"

                    value={

                        indicadores.finalizadas

                    }

                    color="success"

                />

            </Col>

            <Col md={3}>

                <ERPKpiCard

                    title="Promedio"

                    value={`${

                        indicadores.promedio

                    } %`}

                    color="info"

                />

            </Col>

        </Row>

    );

};

export default DashboardKPIs;