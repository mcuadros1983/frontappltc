import React from "react";

import {

    Card,
    Row,
    Col,
    ProgressBar,
    Badge

} from "react-bootstrap";

const DashboardSemaforo = ({

    titulo,

    total,

    verde,

    amarillo,

    rojo,

    verdeTexto = "Correcto",

    amarilloTexto = "Riesgo",

    rojoTexto = "Crítico"

}) => {

    const porcentaje = valor =>

        total

            ? (valor * 100) / total

            : 0;

    return (

        <Card className="h-100">

            <Card.Header>

                <strong>

                    {titulo}

                </strong>

            </Card.Header>

            <Card.Body>

                <Row>

                    <Col className="text-center">

                        <h2>

                            {total}

                        </h2>

                        <small>

                            Total

                        </small>

                    </Col>

                </Row>

                <ProgressBar

                    className="mt-3"

                    style={{

                        height: 24

                    }}

                >

                    <ProgressBar

                        variant="success"

                        now={

                            porcentaje(

                                verde

                            )

                        }

                        key={1}

                    />

                    <ProgressBar

                        variant="warning"

                        now={

                            porcentaje(

                                amarillo

                            )

                        }

                        key={2}

                    />

                    <ProgressBar

                        variant="danger"

                        now={

                            porcentaje(

                                rojo

                            )

                        }

                        key={3}

                    />

                </ProgressBar>

                <Row className="mt-4 text-center">

                    <Col>

                        <Badge bg="success">

                            {verde}

                        </Badge>

                        <div>

                            {verdeTexto}

                        </div>

                    </Col>

                    <Col>

                        <Badge bg="warning">

                            {amarillo}

                        </Badge>

                        <div>

                            {amarilloTexto}

                        </div>

                    </Col>

                    <Col>

                        <Badge bg="danger">

                            {rojo}

                        </Badge>

                        <div>

                            {rojoTexto}

                        </div>

                    </Col>

                </Row>

            </Card.Body>

        </Card>

    );

};

export default DashboardSemaforo;