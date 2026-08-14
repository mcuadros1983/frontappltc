import React from "react";

import {
    Row,
    Col,
} from "react-bootstrap";

import {
    ERPCard,
} from "../../../components/common/erp";

import useMotorConceptoCumplimiento
    from "../../../hooks/useMotorConceptoCumplimiento";

import MotorConceptoDashboardLoading
    from "./MotorConceptoDashboardLoading";

import MotorConceptoDashboardEmpty
    from "./MotorConceptoDashboardEmpty";

import MotorConceptoDashboardHeader
    from "./MotorConceptoDashboardHeader";

import MotorConceptoDashboardKPIs
    from "./MotorConceptoDashboardKPIs";

import MotorConceptoDashboardCharts
    from "./MotorConceptoDashboardCharts";

import MotorConceptoDashboardTimeline
    from "./MotorConceptoDashboardTimeline";

import MotorConceptoDashboardActions
    from "./MotorConceptoDashboardActions";

const MotorConceptoDashboard = ({

    entidadTipoId,

    entidadId,

    entidadNombre,

    entidadTipoNombre,

    onNuevo,

    onExportar,

}) => {

    const {

        loading,

        resumen,

        documentos,

        refresh,

    } = useMotorConceptoCumplimiento(

        entidadTipoId,

        entidadId

    );

    if (loading) {

        return (

            <MotorConceptoDashboardLoading />

        );

    }

    if (!documentos.length) {

        return (

            <MotorConceptoDashboardEmpty

                entidadNombre={entidadNombre}

                refresh={refresh}

            />

        );

    }

    return (

        <ERPCard>

            <Row>

                <Col xs={12}>

                    <MotorConceptoDashboardHeader

                        entidadNombre={entidadNombre}

                        entidadTipoNombre={entidadTipoNombre}

                        porcentaje={resumen.porcentaje}

                    />

                </Col>

            </Row>

            <Row className="mt-3">

                <Col xs={12}>

                    <MotorConceptoDashboardKPIs

                        resumen={resumen}

                    />

                </Col>

            </Row>

            <Row className="mt-4">

                <Col lg={5}>

                    <MotorConceptoDashboardCharts

                        resumen={resumen}

                    />

                </Col>

                <Col lg={7}>

                    <MotorConceptoDashboardTimeline

                        documentos={documentos}

                    />

                </Col>

            </Row>

            <Row className="mt-4">

                <Col xs={12}>

                    <MotorConceptoDashboardActions

                        entidadId={entidadId}

                        entidadTipoId={entidadTipoId}

                        entidadNombre={entidadNombre}

                        entidadTipoNombre={entidadTipoNombre}

                        onNuevo={onNuevo}

                        onExportar={onExportar}

                    />

                </Col>

            </Row>

        </ERPCard>

    );

};

export default MotorConceptoDashboard;