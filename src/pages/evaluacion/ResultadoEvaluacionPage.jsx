import React, {

    useEffect,

    useState

} from "react";

import {

    useNavigate,

    useParams

} from "react-router-dom";

import {

    Alert,

    Spinner,

    Tabs,

    Tab,

    Row,

    Col

} from "react-bootstrap";

import {

    ERPPage,

    ERPToolbar,

    ERPButton

} from "../../components/common/erp";

import DashboardSemaforo
    from "../../components/evaluacion/DashboardSemaforo";

import DashboardHeatmap
    from "../../components/evaluacion/DashboardHeatmap";

import DashboardRadar
    from "../../components/evaluacion/DashboardRadar";

import ResultadoHeader
    from "../../components/evaluacion/resultados/ResultadoHeader";

import ResultadoIndicadores
    from "../../components/evaluacion/resultados/ResultadoIndicadores";

import ResultadoResumenTab
    from "../../components/evaluacion/resultados/ResultadoResumenTab";

import ResultadoRankingTab
    from "../../components/evaluacion/resultados/ResultadoRankingTab";

import ResultadoCompetenciasTab
    from "../../components/evaluacion/resultados/ResultadoCompetenciasTab";

import ResultadoPreguntasTab
    from "../../components/evaluacion/resultados/ResultadoPreguntasTab";

import ResultadoParticipantesTab
    from "../../components/evaluacion/resultados/ResultadoParticipantesTab";

import {

    evaluacionApi

} from "../../services/evaluacion/evaluacionApi";

const ResultadoEvaluacionPage = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        error,

        setError

    ] = useState("");

    const [

        resultado,

        setResultado

    ] = useState(null);

    useEffect(() => {

        let activo = true;

        const cargar = async () => {

            try {

                setLoading(true);

                setError("");

                const data =

                    await evaluacionApi.obtenerResultado(

                        id

                    );

                if (activo) {

                    setResultado(

                        data

                    );

                }

            }

            catch (error) {

                console.error(error);

                if (activo) {

                    setError(

                        error.message ||

                        "No fue posible obtener los resultados de la campaña."

                    );

                }

            }

            finally {

                if (activo) {

                    setLoading(false);

                }

            }

        };

        cargar();

        return () => {

            activo = false;

        };

    }, [id]);

    if (loading) {

        return (

            <ERPPage

                title="Resultado de Evaluación"

            >

                <div

                    className="d-flex justify-content-center align-items-center py-5"

                >

                    <Spinner

                        animation="border"

                    />

                </div>

            </ERPPage>

        );

    }

    if (error) {

        return (

            <ERPPage

                title="Resultado de Evaluación"

            >

                <Alert

                    variant="danger"

                >

                    {error}

                </Alert>

                <ERPButton

                    variant="secondary"

                    onClick={() =>

                        navigate("/evaluaciones")

                    }

                >

                    Volver

                </ERPButton>

            </ERPPage>

        );

    }

    const dashboard = resultado.dashboard || {

        frecuencias: {},

        cumplimiento: {},

        brechas: {},

        ranking: [],

        tipos: []

    };

    if (

        !resultado ||

        !resultado.campania

    ) {

        return (

            <ERPPage

                title="Resultado de Evaluación"

            >

                <Alert

                    variant="warning"

                >

                    No se encontraron resultados para esta campaña.

                </Alert>

                <ERPButton

                    variant="secondary"

                    onClick={() =>

                        navigate("/evaluaciones")

                    }

                >

                    Volver

                </ERPButton>

            </ERPPage>

        );

    }

    return (

        <ERPPage

            title={`Resultados ${resultado.campania.numero || ""

                }`}

            subtitle="Resultados de la campaña de evaluación"

        >

            <ERPToolbar

                right={

                    <ERPButton

                        variant="secondary"

                        onClick={() =>

                            navigate("/evaluaciones")

                        }

                    >

                        Volver

                    </ERPButton>

                }

            />

            <ResultadoHeader

                campania={

                    resultado.campania

                }

            />

            <ResultadoIndicadores

                indicadores={

                    resultado.indicadores

                }

            />

            {/*=========================================================
SEMÁFOROS
=========================================================*/}

            <Row className="mt-4 mb-4">

                <Col lg={4}>

                    <DashboardSemaforo

                        titulo="Frecuencia"

                        total={

                            dashboard.frecuencias?.total || 0

                        }

                        verde={

                            dashboard.frecuencias?.vigentes || 0

                        }

                        amarillo={

                            dashboard.frecuencias?.proximas || 0

                        }

                        rojo={

                            dashboard.frecuencias?.vencidas || 0

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

                            dashboard.cumplimiento?.total || 0

                        }

                        verde={

                            dashboard.cumplimiento?.cumplen || 0

                        }

                        amarillo={

                            dashboard.cumplimiento?.riesgo || 0

                        }

                        rojo={

                            dashboard.cumplimiento?.incumplen || 0

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

                            dashboard.brechas?.total || 0

                        }

                        verde={

                            dashboard.brechas?.correctas || 0

                        }

                        amarillo={

                            dashboard.brechas?.riesgo || 0

                        }

                        rojo={

                            dashboard.brechas?.fueraRango || 0

                        }

                        verdeTexto="Correctas"

                        amarilloTexto="Riesgo"

                        rojoTexto="Fuera"

                    />

                </Col>

            </Row>

            {/*=========================================================
HEATMAP
=========================================================*/}

            <Row className="mb-4">

                <Col>

                    <DashboardHeatmap

                        frecuencias={

                            dashboard.frecuencias?.items || []

                        }

                        cumplimiento={

                            dashboard.cumplimiento?.items || []

                        }

                        brechas={

                            dashboard.brechas?.items || []

                        }

                    />

                </Col>

            </Row>

            {/*=========================================================
RADAR
=========================================================*/}

            <Row className="mb-4">

                <Col>

                    <DashboardRadar

                        tipos={

                            dashboard.tipos || []

                        }

                        cumplimiento={

                            dashboard.cumplimiento || {}

                        }

                        brechas={

                            dashboard.brechas || {}

                        }

                    />

                </Col>

            </Row>

            {/*=========================================================
RESUMEN EJECUTIVO
=========================================================*/}

            <Row className="mb-4">

                <Col lg={6}>

                    <ResultadoRankingTab

                        ranking={

                            resultado.ranking || []

                        }

                    />

                </Col>

                <Col lg={6}>

                    <div className="card h-100">

                        <div className="card-header">

                            Estado Ejecutivo

                        </div>

                        <div className="card-body">

                            <table className="table">

                                <tbody>

                                    <tr>

                                        <td>

                                            Frecuencias vencidas

                                        </td>

                                        <td>

                                            {

                                                dashboard.frecuencias?.vencidas || 0

                                            }

                                        </td>

                                    </tr>

                                    <tr>

                                        <td>

                                            Incumplimientos

                                        </td>

                                        <td>

                                            {

                                                dashboard.cumplimiento?.incumplen || 0

                                            }

                                        </td>

                                    </tr>

                                    <tr>

                                        <td>

                                            Brechas críticas

                                        </td>

                                        <td>

                                            {

                                                dashboard.brechas?.fueraRango || 0

                                            }

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </Col>

            </Row>

            <Tabs

                defaultActiveKey="resumen"

                className="mb-3"

                mountOnEnter

                unmountOnExit

            >

                <Tab

                    eventKey="resumen"

                    title="Resumen"

                >

                    <div className="pt-3">

                        <ResultadoResumenTab

                            resultado={resultado}

                        />

                    </div>

                </Tab>

                <Tab

                    eventKey="ranking"

                    title="Ranking"

                >

                    <div className="pt-3">

                        <ResultadoRankingTab

                            ranking={

                                resultado.ranking || []

                            }

                        />

                    </div>

                </Tab>

                <Tab

                    eventKey="competencias"

                    title="Competencias"

                >

                    <div className="pt-3">

                        <ResultadoCompetenciasTab

                            competencias={

                                resultado.competencias || []

                            }

                        />

                    </div>

                </Tab>

                <Tab

                    eventKey="preguntas"

                    title="Preguntas"

                >

                    <div className="pt-3">

                        <ResultadoPreguntasTab

                            preguntas={

                                resultado.preguntas || []

                            }

                        />

                    </div>

                </Tab>

                <Tab

                    eventKey="participantes"

                    title="Participantes"

                >

                    <div className="pt-3">

                        <ResultadoParticipantesTab

                            participantes={

                                resultado.participantes || []

                            }

                        />

                    </div>

                </Tab>

            </Tabs>

        </ERPPage>

    );

};

export default ResultadoEvaluacionPage;