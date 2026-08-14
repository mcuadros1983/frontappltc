import React, {
    useMemo,
} from "react";

import {
    Card,
    Col,
    Row,
} from "react-bootstrap";

const EntidadDocumentalResumen = ({

    asignaciones = [],

    entidadNombre = "",

    entidadTipoNombre = "",

}) => {

    const resumen =
        useMemo(() => {

            const data = {

                total: 0,

                completos: 0,

                pendientes: 0,

                porVencer: 0,

                vencidos: 0,

            };

            asignaciones.forEach(
                (item) => {

                    data.total++;

                    switch (
                        item.estado
                    ) {

                        case "COMPLETO":

                            data.completos++;

                            break;

                        case "PENDIENTE":

                            data.pendientes++;

                            break;

                        case "POR_VENCER":

                            data.porVencer++;

                            break;

                        case "VENCIDO":

                            data.vencidos++;

                            break;

                        default:

                            break;

                    }

                }
            );

            return data;

        }, [

            asignaciones,

        ]);

    return (

        <Card className="mb-3">

            <Card.Body>

                <Row>

                    <Col md={12}>

                        <h5 className="mb-1">

                            {entidadTipoNombre}

                        </h5>

                        <h6 className="text-muted">

                            {entidadNombre}

                        </h6>

                    </Col>

                </Row>

                <Row className="mt-4">

                    <Col md={2}>

                        <div className="text-center">

                            <h3>

                                {resumen.total}

                            </h3>

                            <small>

                                Conceptos

                            </small>

                        </div>

                    </Col>

                    <Col md={2}>

                        <div className="text-center">

                            <h3 className="text-success">

                                {resumen.completos}

                            </h3>

                            <small>

                                Completos

                            </small>

                        </div>

                    </Col>

                    <Col md={2}>

                        <div className="text-center">

                            <h3 className="text-danger">

                                {resumen.pendientes}

                            </h3>

                            <small>

                                Pendientes

                            </small>

                        </div>

                    </Col>

                    <Col md={3}>

                        <div className="text-center">

                            <h3 className="text-warning">

                                {resumen.porVencer}

                            </h3>

                            <small>

                                Por vencer

                            </small>

                        </div>

                    </Col>

                    <Col md={3}>

                        <div className="text-center">

                            <h3 className="text-dark">

                                {resumen.vencidos}

                            </h3>

                            <small>

                                Vencidos

                            </small>

                        </div>

                    </Col>

                </Row>

            </Card.Body>

        </Card>

    );

};

export default EntidadDocumentalResumen;