import React from "react";

import {
    Card,
    Col,
    Row,
} from "react-bootstrap";

const Item = ({
    titulo,
    valor,
}) => (

    <Col md={2}>

        <Card className="text-center h-100">

            <Card.Body>

                <h3>{valor}</h3>

                <small>{titulo}</small>

            </Card.Body>

        </Card>

    </Col>

);

const MotorConceptoDocumentosFaltantesResumen = ({
    resumen,
}) => (

    <Row className="g-3 mb-3">

        <Item
            titulo="Total"
            valor={resumen.total}
        />

        <Item
            titulo="Cumplidos"
            valor={resumen.cumplidos}
        />

        <Item
            titulo="Faltantes"
            valor={resumen.faltantes}
        />

        <Item
            titulo="Próximos"
            valor={resumen.proximos}
        />

        <Item
            titulo="Vencidos"
            valor={resumen.vencidos}
        />

        <Item
            titulo="%"
            valor={`${resumen.porcentaje}%`}
        />

    </Row>

);

export default MotorConceptoDocumentosFaltantesResumen;