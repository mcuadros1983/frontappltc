import React, {
    useEffect,
    useState
} from "react";

import {

    Row,
    Col,
    Spinner

} from "react-bootstrap";

import {

    ERPPage,
    ERPCard,
    ERPKpiCard,
    ERPTable

} from "../../components/common/erp";

import DashboardSemaforo
    from "../../components/evaluacion/DashboardSemaforo";

import {

    dashboardApi

} from "../../services/evaluacion/dashboardApi";

import DashboardHeatmap
    from "../../components/evaluacion/DashboardHeatmap";

import DashboardRadar
    from "../../components/evaluacion/DashboardRadar";

const DashboardEjecutivoPage = () => {

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        dashboard,

        setDashboard

    ] = useState({

        indicadores: {},

        ranking: [],

        campanias: [],

        frecuencias: {},

        cumplimiento: {},

        brechas: {}

    });

    const cargar = async () => {

        try {

            setLoading(true);

            const data =

                await dashboardApi.obtenerResumen();

            setDashboard(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargar();

    }, []);

    if (loading) {

        return (

            <div className="text-center mt-5">

                <Spinner />

            </div>

        );

    }

    const resumenEjecutivo = React.useMemo(() => {

        const mapa = new Map();

        (dashboard.frecuencias.items || []).forEach(item => {

            mapa.set(item.empleado_id, {

                empleado_id: item.empleado_id,

                empleado: item.empleado,

                frecuencia: item.estado,

                cumplimiento: "-",

                brecha: "-"

            });

        });

        (dashboard.cumplimiento.items || []).forEach(item => {

            const fila = mapa.get(item.empleado_id) || {

                empleado_id: item.empleado_id,

                empleado: item.empleado

            };

            fila.cumplimiento = item.estado;

            mapa.set(item.empleado_id, fila);

        });

        (dashboard.brechas.items || []).forEach(item => {

            const fila = mapa.get(item.empleado_id) || {

                empleado_id: item.empleado_id,

                empleado: item.empleado

            };

            fila.brecha = item.estado;

            mapa.set(item.empleado_id, fila);

        });

        return Array.from(mapa.values());

    }, [dashboard]);


    return (

        <ERPPage

            title="Dashboard Ejecutivo"

            subtitle="Resumen Ejecutivo del Sistema de Evaluaciones"

        >

            {/*=========================================================
        KPI EJECUTIVOS
        =========================================================*/}

            <Row className="mb-4">

                <Col lg={3}>

                    <ERPKpiCard

                        title="Campañas"

                        value={

                            dashboard.indicadores.campanias || 0

                        }

                        color="primary"

                    />

                </Col>

                <Col lg={3}>

                    <ERPKpiCard

                        title="Campañas Activas"

                        value={

                            dashboard.indicadores.campaniasActivas || 0

                        }

                        color="success"

                    />

                </Col>

                <Col lg={3}>

                    <ERPKpiCard

                        title="Respuestas"

                        value={

                            dashboard.indicadores.respuestas || 0

                        }

                        color="warning"

                    />

                </Col>

                <Col lg={3}>

                    <ERPKpiCard

                        title="Promedio General"

                        value={`${Number(

                            dashboard.indicadores.promedio || 0

                        ).toFixed(2)

                            } %`}

                        color="info"

                    />

                </Col>

            </Row>

            {/*=========================================================
        SEMÁFOROS EJECUTIVOS
        =========================================================*/}

            <Row className="mb-4">

                <Col lg={4}>

                    <DashboardSemaforo

                        titulo="Frecuencia"

                        total={

                            dashboard.frecuencias.total || 0

                        }

                        verde={

                            dashboard.frecuencias.vigentes || 0

                        }

                        amarillo={

                            dashboard.frecuencias.proximas || 0

                        }

                        rojo={

                            dashboard.frecuencias.vencidas || 0

                        }

                        verdeTexto="Vigentes"

                        amarilloTexto="Próximas"

                        rojoTexto="Vencidas"

                    />

                </Col>

                <Col lg={4}>

                    <DashboardSemaforo

                        titulo="Cumplimiento"

                        total={

                            dashboard.cumplimiento.total || 0

                        }

                        verde={

                            dashboard.cumplimiento.cumplen || 0

                        }

                        amarillo={

                            dashboard.cumplimiento.riesgo || 0

                        }

                        rojo={

                            dashboard.cumplimiento.incumplen || 0

                        }

                        verdeTexto="Cumplen"

                        amarilloTexto="Riesgo"

                        rojoTexto="Incumplen"

                    />

                </Col>

                <Col lg={4}>

                    <DashboardSemaforo

                        titulo="Brechas"

                        total={

                            dashboard.brechas.total || 0

                        }

                        verde={

                            dashboard.brechas.correctas || 0

                        }

                        amarillo={

                            dashboard.brechas.riesgo || 0

                        }

                        rojo={

                            dashboard.brechas.fueraRango || 0

                        }

                        verdeTexto="Correctas"

                        amarilloTexto="Riesgo"

                        rojoTexto="Fuera"

                    />

                </Col>

            </Row>

            {/*=========================================================
RESUMEN EJECUTIVO
=========================================================*/}

            <Row className="mb-4">

                <Col>

                    <ERPCard title="Estado General de Evaluaciones">

                        <ERPTable

                            pagination={false}

                            data={resumenEjecutivo}

                            columns={[

                                {

                                    key: "empleado",

                                    title: "Empleado"

                                },

                                {

                                    key: "frecuencia",

                                    title: "Frecuencia",

                                    render: row => (

                                        <ERPBadge

                                            status={

                                                row.frecuencia

                                            }

                                        />

                                    )

                                },

                                {

                                    key: "cumplimiento",

                                    title: "Cumplimiento",

                                    render: row => (

                                        <ERPBadge

                                            status={

                                                row.cumplimiento

                                            }

                                        />

                                    )

                                },

                                {

                                    key: "brecha",

                                    title: "Brechas",

                                    render: row => (

                                        <ERPBadge

                                            status={

                                                row.brecha

                                            }

                                        />

                                    )

                                },

                                {

                                    key: "estado",

                                    title: "Estado General",

                                    render: row => {

                                        const estados = [

                                            row.frecuencia,

                                            row.cumplimiento,

                                            row.brecha

                                        ];

                                        if (

                                            estados.includes("VENCIDA") ||

                                            estados.includes("INCUMPLE") ||

                                            estados.includes("FUERA_RANGO")

                                        ) {

                                            return (

                                                <span style={{ fontSize: 24 }}>

                                                    🔴

                                                </span>

                                            );

                                        }

                                        if (

                                            estados.includes("PROXIMA") ||

                                            estados.includes("RIESGO")

                                        ) {

                                            return (

                                                <span style={{ fontSize: 24 }}>

                                                    🟡

                                                </span>

                                            );

                                        }

                                        return (

                                            <span style={{ fontSize: 24 }}>

                                                🟢

                                            </span>

                                        );

                                    }

                                }

                            ]}

                        />

                    </ERPCard>

                </Col>

            </Row>

            {/*=========================================================
RANKING EJECUTIVO
=========================================================*/}

            <Row className="mb-4">

                <Col lg={6}>

                    <ERPCard

                        title="Top Desempeño"

                    >

                        <ERPTable

                            pagination={false}

                            data={[

                                ...(dashboard.ranking || [])

                            ]

                                .sort(

                                    (a, b) =>

                                        Number(

                                            b.promedio

                                        ) -

                                        Number(

                                            a.promedio

                                        )

                                )

                                .slice(0, 10)}

                            columns={[

                                {

                                    key: "empleado",

                                    title: "Empleado",

                                    render: row =>

                                        row.empleado ||

                                        row.empleado_nombre ||

                                        row.empleado_id

                                },

                                {

                                    key: "cantidad",

                                    title: "Evaluaciones"

                                },

                                {

                                    key: "promedio",

                                    title: "Promedio",

                                    render: row =>

                                        `${Number(

                                            row.promedio || 0

                                        ).toFixed(2)

                                        } %`

                                }

                            ]}

                        />

                    </ERPCard>

                </Col>

                <Col lg={6}>

                    <ERPCard

                        title="Menor Desempeño"

                    >

                        <ERPTable

                            pagination={false}

                            data={[

                                ...(dashboard.ranking || [])

                            ]

                                .sort(

                                    (a, b) =>

                                        Number(

                                            a.promedio

                                        ) -

                                        Number(

                                            b.promedio

                                        )

                                )

                                .slice(0, 10)}

                            columns={[

                                {

                                    key: "empleado",

                                    title: "Empleado",

                                    render: row =>

                                        row.empleado ||

                                        row.empleado_nombre ||

                                        row.empleado_id

                                },

                                {

                                    key: "cantidad",

                                    title: "Evaluaciones"

                                },

                                {

                                    key: "promedio",

                                    title: "Promedio",

                                    render: row =>

                                        `${Number(

                                            row.promedio || 0

                                        ).toFixed(2)

                                        } %`

                                }

                            ]}

                        />

                    </ERPCard>

                </Col>

            </Row>

            <Row className="mt-4">

                <Col>

                    <DashboardHeatmap

                        frecuencias={

                            dashboard.frecuencias.items

                        }

                        cumplimiento={

                            dashboard.cumplimiento.items

                        }

                        brechas={

                            dashboard.brechas.items

                        }

                    />

                </Col>

            </Row>

            <Row className="mt-4">

                <Col>

                    <DashboardRadar

                        tipos={

                            dashboard.tipos

                        }

                        cumplimiento={

                            dashboard.cumplimiento

                        }

                        brechas={

                            dashboard.brechas

                        }

                    />

                </Col>

            </Row>

            {/*=========================================================
RANKING + ALERTAS
=========================================================*/}

            <Row className="mt-4">

                <Col lg={6}>

                    <ERPCard title="Top 10 Desempeño">

                        <ERPTable

                            pagination={false}

                            data={[

                                ...(dashboard.ranking || [])

                            ]

                                .sort(

                                    (a, b) =>

                                        Number(b.promedio) -

                                        Number(a.promedio)

                                )

                                .slice(0, 10)}

                            columns={[

                                {

                                    key: "empleado",

                                    title: "Empleado",

                                    render: row =>

                                        row.empleado ||

                                        row.empleado_nombre ||

                                        row.empleado_id

                                },

                                {

                                    key: "cantidad",

                                    title: "Evaluaciones"

                                },

                                {

                                    key: "promedio",

                                    title: "Promedio",

                                    render: row =>

                                        `${Number(

                                            row.promedio || 0

                                        ).toFixed(2)} %`

                                }

                            ]}

                        />

                    </ERPCard>

                </Col>

                <Col lg={6}>

                    <ERPCard title="Alertas Ejecutivas">

                        <table className="table table-sm">

                            <tbody>

                                <tr>

                                    <td>

                                        🔴 Frecuencias vencidas

                                    </td>

                                    <td className="text-end">

                                        {

                                            dashboard.frecuencias

                                                ?.vencidas || 0

                                        }

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        🟡 Frecuencias próximas

                                    </td>

                                    <td className="text-end">

                                        {

                                            dashboard.frecuencias

                                                ?.proximas || 0

                                        }

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        🔴 Incumplimientos

                                    </td>

                                    <td className="text-end">

                                        {

                                            dashboard.cumplimiento

                                                ?.incumplen || 0

                                        }

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        🟡 Riesgos

                                    </td>

                                    <td className="text-end">

                                        {

                                            dashboard.cumplimiento

                                                ?.riesgo || 0

                                        }

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        🔴 Brechas fuera de rango

                                    </td>

                                    <td className="text-end">

                                        {

                                            dashboard.brechas

                                                ?.fueraRango || 0

                                        }

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </ERPCard>

                </Col>

            </Row>

            {/*=========================================================
ESTADO EJECUTIVO
=========================================================*/}

            <Row className="mt-4">

                <Col>

                    <ERPCard title="Estado General">

                        <div className="row text-center">

                            <div className="col">

                                <h1>

                                    {

                                        dashboard.frecuencias

                                            ?.vencidas > 0

                                            ? "🔴"

                                            : dashboard.frecuencias

                                                ?.proximas > 0

                                                ? "🟡"

                                                : "🟢"

                                    }

                                </h1>

                                <h5>

                                    Frecuencia

                                </h5>

                            </div>

                            <div className="col">

                                <h1>

                                    {

                                        dashboard.cumplimiento

                                            ?.incumplen > 0

                                            ? "🔴"

                                            : dashboard.cumplimiento

                                                ?.riesgo > 0

                                                ? "🟡"

                                                : "🟢"

                                    }

                                </h1>

                                <h5>

                                    Cumplimiento

                                </h5>

                            </div>

                            <div className="col">

                                <h1>

                                    {

                                        dashboard.brechas

                                            ?.fueraRango > 0

                                            ? "🔴"

                                            : dashboard.brechas

                                                ?.riesgo > 0

                                                ? "🟡"

                                                : "🟢"

                                    }

                                </h1>

                                <h5>

                                    Brechas

                                </h5>

                            </div>

                        </div>

                    </ERPCard>

                </Col>

            </Row>

            {/*=========================================================
ALERTAS EJECUTIVAS
=========================================================*/}

            <Row className="mt-4">

                <Col lg={3}>

                    <ERPKpiCard

                        title="Frecuencias Vencidas"

                        value={

                            dashboard.frecuencias.vencidas || 0

                        }

                        color="danger"

                    />

                </Col>

                <Col lg={3}>

                    <ERPKpiCard

                        title="Frecuencias Próximas"

                        value={

                            dashboard.frecuencias.proximas || 0

                        }

                        color="warning"

                    />

                </Col>

                <Col lg={3}>

                    <ERPKpiCard

                        title="Incumplimientos"

                        value={

                            dashboard.cumplimiento.incumplen || 0

                        }

                        color="danger"

                    />

                </Col>

                <Col lg={3}>

                    <ERPKpiCard

                        title="Brechas Fuera de Rango"

                        value={

                            dashboard.brechas.fueraRango || 0

                        }

                        color="danger"

                    />

                </Col>

            </Row>

            {/*=========================================================
RESUMEN EJECUTIVO
=========================================================*/}

            <Row className="mt-4">

                <Col>

                    <ERPCard

                        title="Resumen Ejecutivo"

                    >

                        <table className="table table-bordered table-hover align-middle">

                            <thead>

                                <tr>

                                    <th>Indicador</th>

                                    <th className="text-center">Valor</th>

                                    <th className="text-center">Estado</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr>

                                    <td>

                                        Frecuencia esperada

                                    </td>

                                    <td className="text-center">

                                        {dashboard.frecuencias.total || 0}

                                    </td>

                                    <td className="text-center">

                                        {

                                            dashboard.frecuencias.vencidas > 0

                                                ? "🔴"

                                                : dashboard.frecuencias.proximas > 0

                                                    ? "🟡"

                                                    : "🟢"

                                        }

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        Cumplimiento

                                    </td>

                                    <td className="text-center">

                                        {

                                            dashboard.cumplimiento.total || 0

                                        }

                                    </td>

                                    <td className="text-center">

                                        {

                                            dashboard.cumplimiento.incumplen > 0

                                                ? "🔴"

                                                : dashboard.cumplimiento.riesgo > 0

                                                    ? "🟡"

                                                    : "🟢"

                                        }

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        Brechas

                                    </td>

                                    <td className="text-center">

                                        {

                                            dashboard.brechas.total || 0

                                        }

                                    </td>

                                    <td className="text-center">

                                        {

                                            dashboard.brechas.fueraRango > 0

                                                ? "🔴"

                                                : dashboard.brechas.riesgo > 0

                                                    ? "🟡"

                                                    : "🟢"

                                        }

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </ERPCard>

                </Col>

            </Row>

            {/*=========================================================
CAMPAÑAS
=========================================================*/}

            <Row>

                <Col>

                    <ERPCard

                        title="Campañas Activas"

                    >

                        <ERPTable

                            data={

                                dashboard.campanias || []

                            }

                            pagination={false}

                            columns={[

                                {

                                    key: "numero",

                                    title: "Campaña"

                                },

                                {

                                    key: "tipo",

                                    title: "Tipo"

                                },

                                {

                                    key: "estado",

                                    title: "Estado",

                                    render: row => (

                                        <ERPBadge

                                            status={

                                                row.estado

                                            }

                                        />

                                    )

                                },

                                {

                                    key: "respuestas",

                                    title: "Respuestas"

                                },

                                {

                                    key: "promedio",

                                    title: "Promedio",

                                    render: row =>

                                        `${Number(

                                            row.promedio || 0

                                        ).toFixed(2)

                                        } %`

                                }

                            ]}

                        />

                    </ERPCard>

                </Col>

            </Row>

        </ERPPage>

    );

};

export default DashboardEjecutivoPage;