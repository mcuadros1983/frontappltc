import React from "react";

import {
    Col,
    Row,
} from "react-bootstrap";

import {
    ERPButton,
    ERPCard,
} from "../../common/erp";

const RegistroConceptoReporteToolbar = ({

    loading = false,

    onRefresh,

    onExport,

}) => {

    return (

        <ERPCard className="mb-3">

            <Row className="align-items-center">

                <Col>

                    <h4 className="mb-0">

                        Reporte de Registros de Conceptos

                    </h4>

                    <small className="text-muted">

                        Consulta, búsqueda y exportación de registros del Motor de Conceptos.

                    </small>

                </Col>

                <Col
                    xs="auto"
                >

                    <div className="d-flex gap-2">

                        <ERPButton
                            type="refresh"
                            label="Actualizar"
                            disabled={loading}
                            onClick={onRefresh}
                        />

                        <ERPButton
                            type="excel"
                            label="Exportar"
                            disabled={loading}
                            onClick={onExport}
                        />

                    </div>

                </Col>

            </Row>

        </ERPCard>

    );

};

export default RegistroConceptoReporteToolbar;