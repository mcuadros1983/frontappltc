import React, {

    useContext,

    useEffect,

    useMemo,

    useState

} from "react";

import {

    useNavigate

} from "react-router-dom";

import Contexts from "../../context/Contexts";

import {

    Row,

    Col,

    Spinner,

    Alert

} from "react-bootstrap";

import {

    ERPPage,

    ERPKpiCard,

    ERPCard,

    ERPTable,

    ERPBadge,

    ERPBarChart,

    ERPPieChart,

    ERPLineChart

} from "../../components/common/erp";

import {

    dashboardApi

} from "../../services/evaluacion/dashboardApi";

import DashboardSemaforo
    from "../../components/evaluacion/DashboardSemaforo";

const DashboardPage = () => {

    const navigate = useNavigate();

    const {

        empleados

    } = useContext(

        Contexts.DataContext

    );

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [dashboard, setDashboard] = useState({

        indicadores: {},

        ultimas: [],

        ranking: [],

        tipos: [],

        periodos: [],

        campanias: [],

        frecuencias: {

            total: 0,

            vigentes: 0,

            proximas: 0,

            vencidas: 0,

            items: []

        },

        cumplimiento: {

            total: 0,

            cumplen: 0,

            riesgo: 0,

            incumplen: 0,

            items: []

        },

        brechas: {

            total: 0,

            correctas: 0,

            riesgo: 0,

            fueraRango: 0,

            items: []

        }

    });

    useEffect(() => {

        cargar();

    }, []);

    const cargar = async () => {

        try {

            setLoading(true);

            setError("");

            const data =

                await dashboardApi.obtenerResumen();

            setDashboard({

                indicadores: {},

                ultimas: [],

                ranking: [],

                tipos: [],

                periodos: [],

                campanias: [],

                frecuencias: {

                    total: 0,

                    vigentes: 0,

                    proximas: 0,

                    vencidas: 0,

                    items: []

                },

                cumplimiento: {

                    total: 0,

                    cumplen: 0,

                    riesgo: 0,

                    incumplen: 0,

                    items: []

                },

                brechas: {

                    total: 0,

                    correctas: 0,

                    riesgo: 0,

                    fueraRango: 0,

                    items: []

                },

                ...data

            });

        }

        catch (error) {

            console.error(error);

            setError(

                error.message ||

                "Error obteniendo el dashboard."

            );

        }

        finally {

            setLoading(false);

        }

    };

    /*=========================================
      EMPLEADOS
    =========================================*/

    const empleadosMap = useMemo(() => {

        const map = new Map();

        empleados.forEach(emp => {

            const id =

                emp?.empleado?.id ??

                emp?.id ??

                emp?.empleado_id;

            if (!id) return;

            const apellido =

                emp?.clientePersona?.apellido ||

                emp?.empleado?.apellido ||

                "";

            const nombre =

                emp?.clientePersona?.nombre ||

                emp?.empleado?.nombre ||

                "";

            map.set(

                Number(id),

                `${apellido} ${nombre}`.trim()

            );

        });

        return map;

    }, [

        empleados

    ]);

    const obtenerNombreEmpleado = (id) => {

        return (

            empleadosMap.get(

                Number(id)

            ) ||

            `Empleado #${id}`

        );

    };

    /*=========================================
  GRAFICOS
=========================================*/

    const datosPie = useMemo(() => {

        return (dashboard.tipos || []).map(item => ({

            name: item.tipo,

            value: Number(item.cantidad)

        }));

    }, [dashboard.tipos]);

    const datosBarra = useMemo(() => {

        return (dashboard.tipos || []).map(item => ({

            tipo: item.tipo,

            promedio: Number(item.promedio)

        }));

    }, [dashboard.tipos]);

    const datosLinea = useMemo(() => {

        return (dashboard.periodos || []).map(item => ({

            periodo:

                item.periodo?.descripcion ||

                "",

            promedio:

                Number(item.promedio)

        }));

    }, [dashboard.periodos]);

    if (loading) {

        return (

            <div

                className="vh-100 d-flex justify-content-center align-items-center"

            >

                <Spinner />

            </div>

        );

    }

    if (error) {

        return (

            <Alert

                variant="danger"

                className="m-3"

            >

                {error}

            </Alert>

        );

    }


    return (

        <ERPPage

            title="Dashboard de Evaluaciones"

        >

            <Row className="mb-4">

                <Col md={3}>

                    <ERPKpiCard

                        title="Campañas"

                        value={

                            dashboard.indicadores.campanias || 0

                        }

                        color="primary"

                    />

                </Col>

                <Col md={3}>

                    <ERPKpiCard

                        title="Campañas Activas"

                        value={

                            dashboard.indicadores.campaniasActivas || 0

                        }

                        color="success"

                    />

                </Col>

                <Col md={3}>

                    <ERPKpiCard

                        title="Respuestas"

                        value={

                            dashboard.indicadores.respuestas || 0

                        }

                        color="warning"

                    />

                </Col>

                <Col md={3}>

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

            <Row className="mt-4">

                <Col lg={4}>

                    <DashboardSemaforo

                        titulo="Frecuencia"

                        total={

                            dashboard.frecuencias.total

                        }

                        verde={

                            dashboard.frecuencias.vigentes

                        }

                        amarillo={

                            dashboard.frecuencias.proximas

                        }

                        rojo={

                            dashboard.frecuencias.vencidas

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

                            dashboard.cumplimiento.total

                        }

                        verde={

                            dashboard.cumplimiento.cumplen

                        }

                        amarillo={

                            dashboard.cumplimiento.riesgo

                        }

                        rojo={

                            dashboard.cumplimiento.incumplen

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

                            dashboard.brechas.total

                        }

                        verde={

                            dashboard.brechas.correctas

                        }

                        amarillo={

                            dashboard.brechas.riesgo

                        }

                        rojo={

                            dashboard.brechas.fueraRango

                        }

                        verdeTexto="Correctas"

                        amarilloTexto="Riesgo"

                        rojoTexto="Fuera"

                    />

                </Col>

            </Row>

            {/*=========================================
RANKING + ÚLTIMAS RESPUESTAS
=========================================*/}

            <Row className="mt-4">

                <Col lg={6}>

                    <ERPCard title="Ranking de Empleados">

                        <ERPTable

                            data={dashboard.ranking || []}

                            columns={[

                                {

                                    key: "empleado",

                                    title: "Empleado",

                                    render: row =>

                                        obtenerNombreEmpleado(

                                            row.empleado_id

                                        )

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

                                            row.promedio

                                        ).toFixed(2)} %`

                                }

                            ]}

                            pagination={false}

                        />

                    </ERPCard>

                </Col>

                <Col lg={6}>

                    <ERPCard title="Últimas Respuestas">

                        <ERPTable

                            data={dashboard.ultimas || []}

                            columns={[

                                {

                                    key: "numero",

                                    title: "Campaña",

                                    render: row =>

                                        row.evaluacion?.numero

                                },

                                {

                                    key: "empleado",

                                    title: "Empleado",

                                    render: row =>

                                        obtenerNombreEmpleado(

                                            row.empleado_id

                                        )

                                },

                                {

                                    key: "evaluador",

                                    title: "Evaluador",

                                    render: row =>

                                        row.evaluador_id

                                            ? obtenerNombreEmpleado(

                                                row.evaluador_id

                                            )

                                            : "-"

                                },

                                {

                                    key: "tipo",

                                    title: "Tipo",

                                    render: row =>

                                        <ERPBadge

                                            status={

                                                row.tipo_respuesta

                                            }

                                        />

                                },

                                {

                                    key: "porcentaje",

                                    title: "%",

                                    render: row =>

                                        `${Number(

                                            row.porcentaje

                                        ).toFixed(2)} %`

                                },

                                {

                                    key: "fecha",

                                    title: "Fecha",

                                    render: row =>

                                        new Date(

                                            row.fecha_respuesta

                                        ).toLocaleDateString()

                                }

                            ]}

                            pagination={false}

                        />

                    </ERPCard>

                </Col>

            </Row>

            {/*=========================================
SEMÁFOROS
=========================================*/}

            <Row className="mt-4">

                <Col lg={4}>

                    <ERPCard title="Frecuencia Esperada">

                        <ERPTable

                            data={

                                dashboard.frecuencias.items || []

                            }

                            columns={[

                                {

                                    key: "empleado",

                                    title: "Empleado",

                                    render: row =>

                                        row.empleado

                                },

                                {

                                    key: "tipo",

                                    title: "Capa"

                                },

                                {

                                    key: "dias",

                                    title: "Días",

                                    render: row =>

                                        row.dias_transcurridos

                                },

                                {

                                    key: "estado",

                                    title: "Estado",

                                    render: row =>

                                        <ERPBadge

                                            status={

                                                row.estado

                                            }

                                        />

                                }

                            ]}

                            pagination={false}

                        />

                    </ERPCard>

                </Col>

                <Col lg={4}>

                    <ERPCard title="Cumplimiento">

                        <ERPTable

                            data={

                                dashboard.cumplimiento.items || []

                            }

                            columns={[

                                {

                                    key: "empleado",

                                    title: "Empleado",

                                    render: row =>

                                        row.empleado

                                },

                                {

                                    key: "tipo",

                                    title: "Capa"

                                },

                                {

                                    key: "promedio",

                                    title: "%",

                                    render: row =>

                                        `${Number(

                                            row.promedio

                                        ).toFixed(2)} %`

                                },

                                {

                                    key: "estado",

                                    title: "Estado",

                                    render: row =>

                                        <ERPBadge

                                            status={

                                                row.estado

                                            }

                                        />

                                }

                            ]}

                            pagination={false}

                        />

                    </ERPCard>

                </Col>

                <Col lg={4}>

                    <ERPCard title="Brechas">

                        <ERPTable

                            data={

                                dashboard.brechas.items || []

                            }

                            columns={[

                                {

                                    key: "empleado",

                                    title: "Empleado",

                                    render: row =>

                                        row.empleado

                                },

                                {

                                    key: "comparacion",

                                    title: "Comparación"

                                },

                                {

                                    key: "diferencia",

                                    title: "Brecha",

                                    render: row =>

                                        Number(

                                            row.diferencia

                                        ).toFixed(2)

                                },

                                {

                                    key: "estado",

                                    title: "Estado",

                                    render: row =>

                                        <ERPBadge

                                            status={

                                                row.estado

                                            }

                                        />

                                }

                            ]}

                            pagination={false}

                        />

                    </ERPCard>

                </Col>

            </Row>

            {/*=========================================
GRAFICOS
=========================================*/}

            <Row className="mt-4">

                <Col lg={4}>

                    <ERPCard

                        title="Participación por Tipo"

                    >

                        <ERPPieChart

                            data={datosPie}

                            nameKey="name"

                            dataKey="value"

                            height={280}

                        />

                    </ERPCard>

                </Col>

                <Col lg={4}>

                    <ERPCard

                        title="Promedio por Tipo"

                    >

                        <ERPBarChart

                            data={datosBarra}

                            xKey="tipo"

                            yKey="promedio"

                            height={280}

                        />

                    </ERPCard>

                </Col>

                <Col lg={4}>

                    <ERPCard

                        title="Promedio por Período"

                    >

                        <ERPLineChart

                            data={datosLinea}

                            xKey="periodo"

                            yKey="promedio"

                            height={280}

                        />

                    </ERPCard>

                </Col>

            </Row>


            {/*=========================================
CONTROL DE FRECUENCIAS
=========================================*/}

            <Row className="mt-4">

                <Col lg={4}>

                    <ERPCard title="Frecuencia Esperada">

                        <div className="text-center">

                            <h2 className="text-success">

                                {dashboard.frecuencias.vigentes}

                            </h2>

                            <div>

                                Vigentes

                            </div>

                            <hr />

                            <h4 className="text-warning">

                                {dashboard.frecuencias.proximas}

                            </h4>

                            <div>

                                Próximas

                            </div>

                            <hr />

                            <h4 className="text-danger">

                                {dashboard.frecuencias.vencidas}

                            </h4>

                            <div>

                                Vencidas

                            </div>

                        </div>

                    </ERPCard>

                </Col>

                <Col lg={4}>

                    <ERPCard title="Cumplimiento">

                        <div className="text-center">

                            <h2 className="text-success">

                                {dashboard.cumplimiento.cumplen}

                            </h2>

                            <div>

                                Cumplen

                            </div>

                            <hr />

                            <h4 className="text-warning">

                                {dashboard.cumplimiento.riesgo}

                            </h4>

                            <div>

                                Riesgo

                            </div>

                            <hr />

                            <h4 className="text-danger">

                                {dashboard.cumplimiento.incumplen}

                            </h4>

                            <div>

                                No cumplen

                            </div>

                        </div>

                    </ERPCard>

                </Col>

                <Col lg={4}>

                    <ERPCard title="Brechas">

                        <div className="text-center">

                            <h2 className="text-success">

                                {dashboard.brechas.correctas}

                            </h2>

                            <div>

                                Correctas

                            </div>

                            <hr />

                            <h4 className="text-warning">

                                {dashboard.brechas.riesgo}

                            </h4>

                            <div>

                                Riesgo

                            </div>

                            <hr />

                            <h4 className="text-danger">

                                {dashboard.brechas.fueraRango}

                            </h4>

                            <div>

                                Fuera de rango

                            </div>

                        </div>

                    </ERPCard>

                </Col>

            </Row>
            {/*=========================================
CAMPAÑAS
=========================================*/}

            <Row className="mt-4">

                <Col>

                    <ERPCard

                        title="Campañas de Evaluación"

                    >

                        <ERPTable

                            data={

                                dashboard.campanias || []

                            }

                            columns={[

                                {

                                    key: "numero",

                                    title: "Número"

                                },

                                {

                                    key: "tipo",

                                    title: "Tipo"

                                },

                                {

                                    key: "periodo",

                                    title: "Período"

                                },

                                {

                                    key: "fecha_inicio",

                                    title: "Inicio",

                                    render: row =>

                                        new Date(

                                            row.fecha_inicio

                                        ).toLocaleDateString()

                                },

                                {

                                    key: "fecha_fin",

                                    title: "Fin",

                                    render: row =>

                                        new Date(

                                            row.fecha_fin

                                        ).toLocaleDateString()

                                },

                                {

                                    key: "estado",

                                    title: "Estado",

                                    render: row =>

                                        <ERPBadge

                                            status={

                                                row.estado

                                            }

                                        />

                                },

                                {

                                    key: "respuestas",

                                    title: "Respuestas"

                                },

                                {

                                    key: "promedio",

                                    title: "Promedio",

                                    render: row =>

                                        `${row.promedio} %`

                                }

                            ]}

                            actions={[

                                {

                                    icon: "📊",

                                    title: "Resultados",

                                    onClick: row =>

                                        navigate(

                                            `/evaluacion/${row.id}/resultado`

                                        )

                                }

                            ]}

                        />

                    </ERPCard>

                </Col>

            </Row>

        </ERPPage>

    );
};

export default DashboardPage;