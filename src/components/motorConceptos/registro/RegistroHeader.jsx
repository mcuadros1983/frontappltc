import React from "react";
import {
    Col,
    Row,
} from "react-bootstrap";

import RegistroEstadoBadge
    from "./RegistroEstadoBadge";

const RegistroHeader = ({
    registro,
}) => (
    <Row className="g-3">
        <Col
            xs={12}
            md={6}
        >
            <div className="text-muted">
                Concepto
            </div>
            <strong>
                {
                    registro?.concepto
                        ?.nombre ||
                    "-"
                }
            </strong>
        </Col>

        <Col
            xs={6}
            md={2}
        >
            <div className="text-muted">
                Estado
            </div>
            <RegistroEstadoBadge
                estado={
                    registro?.estado
                }
            />
        </Col>

        <Col
            xs={6}
            md={2}
        >
            <div className="text-muted">
                Versión
            </div>
            <strong>
                {
                    registro?.versionActual
                        ?.numero ||
                    registro?.version_actual
                        ?.numero ||
                    "-"
                }
            </strong>
        </Col>

        <Col
            xs={12}
            md={2}
        >
            <div className="text-muted">
                Vencimiento
            </div>
            <strong>
                {
                    registro
                        ?.fecha_vencimiento ||
                    "-"
                }
            </strong>
        </Col>
    </Row>
);

export default RegistroHeader;
