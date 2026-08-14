import React from "react";

import {
    Col,
    Row,
    Card,
} from "react-bootstrap";

const Item = ({

    title,

    value,

    color,

}) => (

    <Col md={2}>

        <Card>

            <Card.Body
                className="text-center"
            >

                <div
                    className={`text-${color}`}
                    style={{
                        fontSize: 26,
                        fontWeight: 700,
                    }}
                >

                    {value}

                </div>

                <small>

                    {title}

                </small>

            </Card.Body>

        </Card>

    </Col>

);

const MotorConceptoDashboardResumen = ({
    resumen,
}) => (

    <Row className="mt-4">

        <Item

            title="Total"

            value={resumen.total}

            color="primary"

        />

        <Item

            title="Cumplidos"

            value={resumen.cumplidos}

            color="success"

        />

        <Item

            title="Próximos"

            value={resumen.proximos}

            color="warning"

        />

        <Item

            title="Vencidos"

            value={resumen.vencidos}

            color="danger"

        />

        <Item

            title="Faltantes"

            value={resumen.faltantes}

            color="secondary"

        />

    </Row>

);

export default MotorConceptoDashboardResumen;