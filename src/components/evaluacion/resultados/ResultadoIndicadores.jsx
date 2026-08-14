import React from "react";

import {

    Row,

    Col

} from "react-bootstrap";

import {

    ERPKpiCard

} from "../../common/erp";

const ResultadoIndicadores = ({

    indicadores

}) => {

    if (!indicadores) {

        return null;

    }

    return (

        <Row className="mb-4">

            <Col md={2}>

                <ERPKpiCard

                    title="Respuestas"

                    value={

                        indicadores.cantidad || 0

                    }

                    color="primary"

                />

            </Col>

            <Col md={2}>

                <ERPKpiCard

                    title="Promedio"

                    value={`${

                        Number(

                            indicadores.promedio || 0

                        ).toFixed(2)

                    } %`}

                    color="success"

                />

            </Col>

            <Col md={2}>

                <ERPKpiCard

                    title="Auto"

                    value={

                        indicadores.auto || 0

                    }

                    color="info"

                />

            </Col>

            <Col md={2}>

                <ERPKpiCard

                    title="Supervisor"

                    value={

                        indicadores.supervisor || 0

                    }

                    color="warning"

                />

            </Col>

            <Col md={2}>

                <ERPKpiCard

                    title="Mystery"

                    value={

                        indicadores.mystery || 0

                    }

                    color="danger"

                />

            </Col>

        </Row>

    );

};

export default ResultadoIndicadores;