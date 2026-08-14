import React from "react";

import {
    Row,
    Col,
} from "react-bootstrap";

import {

    ERPCard,

    ERPBadge,

} from "../../../components/common/erp";

const MotorConceptoDashboardHeader = ({

    entidadNombre,

    entidadTipoNombre,

    resumen = {},

}) => {

    const porcentaje =
        resumen.porcentaje || 0;

    const badgeColor =
        porcentaje >= 100
            ? "success"
            : porcentaje >= 80
                ? "warning"
                : "danger";

    return (

        <ERPCard>

            <Row
                className="align-items-center"
            >

                <Col
                    lg={8}
                    md={12}
                >

                    <h4
                        className="mb-1"
                    >

                        {

                            entidadNombre ||

                            "Legajo"

                        }

                    </h4>

                    {

                        entidadTipoNombre && (

                            <div
                                className="text-muted"
                            >

                                {

                                    entidadTipoNombre

                                }

                            </div>

                        )

                    }

                </Col>

                <Col
                    lg={4}
                    md={12}
                    className="text-lg-end mt-3 mt-lg-0"
                >

                    <ERPBadge
                        color={badgeColor}
                    >

                        {

                            `${porcentaje}% Cumplimiento`

                        }

                    </ERPBadge>

                </Col>

            </Row>

            <hr />

            <Row>

                <Col
                    lg={3}
                    md={6}
                    sm={6}
                    xs={12}
                    className="mb-3"
                >

                    <small
                        className="text-muted d-block"
                    >

                        Total conceptos

                    </small>

                    <strong>

                        {

                            resumen.total || 0

                        }

                    </strong>

                </Col>

                <Col
                    lg={3}
                    md={6}
                    sm={6}
                    xs={12}
                    className="mb-3"
                >

                    <small
                        className="text-muted d-block"
                    >

                        Cumplidos

                    </small>

                    <strong>

                        {

                            resumen.cumplidos || 0

                        }

                    </strong>

                </Col>

                <Col
                    lg={3}
                    md={6}
                    sm={6}
                    xs={12}
                    className="mb-3"
                >

                    <small
                        className="text-muted d-block"
                    >

                        Próximos a vencer

                    </small>

                    <strong>

                        {

                            resumen.proximos || 0

                        }

                    </strong>

                </Col>

                <Col
                    lg={3}
                    md={6}
                    sm={6}
                    xs={12}
                    className="mb-3"
                >

                    <small
                        className="text-muted d-block"
                    >

                        Vencidos

                    </small>

                    <strong>

                        {

                            resumen.vencidos || 0

                        }

                    </strong>

                </Col>

            </Row>

        </ERPCard>

    );

};

export default React.memo(
    MotorConceptoDashboardHeader
);