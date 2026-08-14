import React from "react";

import {
    Col,
    Row,
} from "react-bootstrap";

import MotorConceptoLegajoCard
    from "./MotorConceptoLegajoCard";

const MotorConceptoLegajoResumen =
    ({
        resumen,
        loading = false,
    }) => {
        const values =
            resumen || {};

        return (
            <Row className="g-3 mb-3">
                <Col
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <MotorConceptoLegajoCard
                        title="Total documentos"
                        value={
                            values.total || 0
                        }
                        icon="bi bi-folder2-open"
                        loading={
                            loading
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <MotorConceptoLegajoCard
                        title="Vigentes"
                        value={
                            values.vigentes || 0
                        }
                        icon="bi bi-check-circle"
                        textClassName="text-success"
                        loading={
                            loading
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <MotorConceptoLegajoCard
                        title="Próximos a vencer"
                        value={
                            values.proximosVencer ||
                            0
                        }
                        icon="bi bi-exclamation-triangle"
                        textClassName="text-warning"
                        loading={
                            loading
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <MotorConceptoLegajoCard
                        title="Vencidos"
                        value={
                            values.vencidos || 0
                        }
                        icon="bi bi-exclamation-octagon"
                        textClassName="text-danger"
                        loading={
                            loading
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <MotorConceptoLegajoCard
                        title="Pendientes"
                        value={
                            values.pendientes || 0
                        }
                        icon="bi bi-clock-history"
                        textClassName="text-warning"
                        loading={
                            loading
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <MotorConceptoLegajoCard
                        title="Borradores"
                        value={
                            values.borradores || 0
                        }
                        icon="bi bi-pencil-square"
                        textClassName="text-secondary"
                        loading={
                            loading
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <MotorConceptoLegajoCard
                        title="Sin vencimiento"
                        value={
                            values.sinVencimiento ||
                            0
                        }
                        icon="bi bi-calendar-x"
                        textClassName="text-muted"
                        loading={
                            loading
                        }
                    />
                </Col>

                <Col
                    xs={12}
                    sm={6}
                    xl={3}
                >
                    <MotorConceptoLegajoCard
                        title="Anulados"
                        value={
                            values.anulados || 0
                        }
                        icon="bi bi-x-circle"
                        textClassName="text-dark"
                        loading={
                            loading
                        }
                    />
                </Col>
            </Row>
        );
    };

export default MotorConceptoLegajoResumen;