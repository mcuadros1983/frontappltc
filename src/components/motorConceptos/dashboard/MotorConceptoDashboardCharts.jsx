import React, {
    useMemo,
} from "react";

import {
    Row,
    Col,
} from "react-bootstrap";

import {

    ERPCard,

    ERPPieChart,

    ERPBarChart,

} from "../../../components/common/erp";

const MotorConceptoDashboardCharts = ({

    resumen = {},

}) => {

    const pieData = useMemo(() => ([
        {
            name: "Cumplidos",
            value: resumen.cumplidos || 0,
        },
        {
            name: "Próximos",
            value: resumen.proximos || 0,
        },
        {
            name: "Vencidos",
            value: resumen.vencidos || 0,
        },
        {
            name: "Faltantes",
            value: resumen.faltantes || 0,
        },
    ]), [

        resumen,

    ]);

    const barData = useMemo(() => ([
        {

            estado: "Cumplidos",

            cantidad: resumen.cumplidos || 0,

        },

        {

            estado: "Próximos",

            cantidad: resumen.proximos || 0,

        },

        {

            estado: "Vencidos",

            cantidad: resumen.vencidos || 0,

        },

        {

            estado: "Faltantes",

            cantidad: resumen.faltantes || 0,

        },

    ]), [

        resumen,

    ]);

    const total = useMemo(() => (

        (resumen.cumplidos || 0)

        +

        (resumen.proximos || 0)

        +

        (resumen.vencidos || 0)

        +

        (resumen.faltantes || 0)

    ), [

        resumen,

    ]);

    return (

        <Row>

            <Col
                lg={6}
                md={12}
                className="mb-4"
            >

                <ERPCard
                    title="Cumplimiento documental"
                >

                    {

                        total > 0

                            ? (

                                <ERPPieChart

                                    data={pieData}

                                    dataKey="value"

                                    nameKey="name"

                                />

                            )

                            : (

                                <div
                                    className="text-center py-5 text-muted"
                                >

                                    Sin información disponible

                                </div>

                            )

                    }

                </ERPCard>

            </Col>

            <Col
                lg={6}
                md={12}
                className="mb-4"
            >

                <ERPCard
                    title="Documentos por estado"
                >

                    {

                        total > 0

                            ? (

                                <ERPBarChart

                                    data={barData}

                                    xKey="estado"

                                    dataKey="cantidad"

                                />

                            )

                            : (

                                <div
                                    className="text-center py-5 text-muted"
                                >

                                    Sin información disponible

                                </div>

                            )

                    }

                </ERPCard>

            </Col>

        </Row>

    );

};

export default React.memo(
    MotorConceptoDashboardCharts
);