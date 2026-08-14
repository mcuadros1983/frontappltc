import React, {
    useMemo,
} from "react";

import {
    Row,
    Col,
} from "react-bootstrap";

import {
    ERPKpiCard,
} from "../../../components/common/erp";

const MotorConceptoDashboardKPIs = ({
    resumen = {},
}) => {

    const {

        total = 0,

        cumplidos = 0,

        proximos = 0,

        vencidos = 0,

        faltantes = 0,

        porcentaje = 0,

    } = resumen;

    const indicadores = useMemo(() => ([
        {
            key: "total",
            title: "Conceptos",
            value: total,
            subtitle: "Total configurados",
            color: "primary",
            icon: "description",
        },
        {
            key: "cumplidos",
            title: "Cumplidos",
            value: cumplidos,
            subtitle: "Documentos vigentes",
            color: "success",
            icon: "check_circle",
        },
        {
            key: "proximos",
            title: "Próximos",
            value: proximos,
            subtitle: "Por vencer",
            color: "warning",
            icon: "schedule",
        },
        {
            key: "vencidos",
            title: "Vencidos",
            value: vencidos,
            subtitle: "Requieren atención",
            color: "danger",
            icon: "warning",
        },
        {
            key: "faltantes",
            title: "Faltantes",
            value: faltantes,
            subtitle: "Sin documento",
            color: "secondary",
            icon: "folder_off",
        },
        {
            key: "porcentaje",
            title: "Cumplimiento",
            value: `${porcentaje}%`,
            subtitle: "General",
            color:
                porcentaje >= 90
                    ? "success"
                    : porcentaje >= 70
                    ? "warning"
                    : "danger",
            icon: "analytics",
        },
    ]), [

        total,

        cumplidos,

        proximos,

        vencidos,

        faltantes,

        porcentaje,

    ]);

    return (

        <Row>

            {

                indicadores.map((item) => (

                    <Col

                        key={item.key}

                        xl={2}

                        lg={4}

                        md={6}

                        sm={6}

                        xs={12}

                        className="mb-3"

                    >

                        <ERPKpiCard

                            title={item.title}

                            value={item.value}

                            subtitle={item.subtitle}

                            color={item.color}

                            icon={item.icon}

                        />

                    </Col>

                ))

            }

        </Row>

    );

};

export default React.memo(
    MotorConceptoDashboardKPIs
);