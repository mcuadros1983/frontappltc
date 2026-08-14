import React from "react";

import {

    Card,

    Row,

    Col

} from "react-bootstrap";

const ResultadoHeader = ({

    campania

}) => {

    if (!campania) {

        return null;

    }

    return (

        <Card className="mb-4">

            <Card.Body>

                <Row>

                    <Col md={3}>

                        <strong>

                            Campaña

                        </strong>

                        <div>

                            {campania.numero || "-"}

                        </div>

                    </Col>

                    <Col md={3}>

                        <strong>

                            Tipo

                        </strong>

                        <div>

                            {

                                campania.tipo?.descripcion ||

                                "-"

                            }

                        </div>

                    </Col>

                    <Col md={3}>

                        <strong>

                            Período

                        </strong>

                        <div>

                            {

                                campania.periodo?.descripcion ||

                                "-"

                            }

                        </div>

                    </Col>

                    <Col md={3}>

                        <strong>

                            Vigencia

                        </strong>

                        <div>

                            {

                                campania.fecha_inicio

                                    ? new Date(

                                        campania.fecha_inicio

                                    ).toLocaleDateString()

                                    : "-"

                            }

                            {" - "}

                            {

                                campania.fecha_fin

                                    ? new Date(

                                        campania.fecha_fin

                                    ).toLocaleDateString()

                                    : "-"

                            }

                        </div>

                    </Col>

                </Row>

            </Card.Body>

        </Card>

    );

};

export default ResultadoHeader;