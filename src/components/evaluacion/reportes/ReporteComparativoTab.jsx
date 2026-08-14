import React, {

    useEffect,

    useState,

    useContext,

    useMemo

} from "react";

import {

    Row,

    Col,

    Card,

    Form,

    Button,

    Spinner,

    Table

} from "react-bootstrap";


import {

    Badge

} from "react-bootstrap";

import {

    ERPTable

} from "../../common/erp";

import {

    evaluacionApi

} from "../../../services/evaluacion/evaluacionApi";

import {

    reporteApi

} from "../../../services/evaluacion/reporteApi";

import Contexts from "../../../context/Contexts";

import {

    exportarComparativoExcel

} from "./exportExcel";

const ReporteComparativoTab = () => {

    const {

        empleados

    } = useContext(

        Contexts.DataContext

    );

    const [

        evaluacion1,

        setEvaluacion1

    ] = useState("");

    const [

        evaluacion2,

        setEvaluacion2

    ] = useState("");

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        comparativo,

        setComparativo

    ] = useState(null);

    const [

        evaluaciones,

        setEvaluaciones

    ] = useState([]);

    const empleadosMap = useMemo(() => {

        const map = new Map();

        empleados.forEach(emp => {

            const id =

                emp?.empleado?.id ??

                emp?.id;

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

    const obtenerNombre = id =>

        empleadosMap.get(

            Number(id)

        ) ||

        `Empleado #${id}`;

    useEffect(() => {

        cargarEvaluaciones();

    }, []);

    const cargarEvaluaciones = async () => {

        try {

            const data =
                await evaluacionApi.listar();

            setEvaluaciones(
                data
            );

        }

        catch (error) {

            console.error(error);

        }

    };

    /*=========================================
COMPETENCIAS
=========================================*/

    const competenciaColumns = [

        {

            key: "competencia",

            title: "Competencia",

            render: row =>

                row.campania1?.criterio?.descripcion ||

                row.campania2?.criterio?.descripcion

        },

        {

            key: "campania1",

            title: "Campaña A",

            render: row =>

                Number(

                    row.campania1?.promedio || 0

                ).toFixed(2)

        },

        {

            key: "campania2",

            title: "Campaña B",

            render: row =>

                Number(

                    row.campania2?.promedio || 0

                ).toFixed(2)

        },

        {

            key: "variacion",

            title: "Variación",

            render: row =>

                `${row.variacion.toFixed(2)

                } %`

        },

        {

            key: "tendencia",

            title: "",

            render: row => (

                <Badge

                    bg={

                        row.tendencia === "SUBE"

                            ? "success"

                            : row.tendencia === "BAJA"

                                ? "danger"

                                : "secondary"

                    }

                >

                    {

                        row.tendencia

                    }

                </Badge>

            )

        }

    ];

    /*=========================================
    PREGUNTAS
    =========================================*/

    const preguntaColumns = [

        {

            key: "pregunta",

            title: "Pregunta",

            render: row =>

                row.campania1?.criterio?.pregunta ||

                row.campania2?.criterio?.pregunta

        },

        {

            key: "campania1",

            title: "Campaña A",

            render: row =>

                Number(

                    row.campania1?.promedio || 0

                ).toFixed(2)

        },

        {

            key: "campania2",

            title: "Campaña B",

            render: row =>

                Number(

                    row.campania2?.promedio || 0

                ).toFixed(2)

        },

        {

            key: "diferencia",

            title: "Diferencia",

            render: row =>

                Number(

                    row.diferencia || 0

                ).toFixed(2)

        },

        {

            key: "variacion",

            title: "Variación",

            render: row =>

                `${Number(

                    row.variacion || 0

                ).toFixed(2)

                } %`

        },

        {

            key: "tendencia",

            title: "Tendencia",

            render: row => (

                <Badge

                    bg={

                        row.tendencia === "SUBE"

                            ? "success"

                            : row.tendencia === "BAJA"

                                ? "danger"

                                : "secondary"

                    }

                >

                    {row.tendencia}

                </Badge>

            )

        }

    ];

    /*=========================================
    RANKING
    =========================================*/

    const rankingColumns = [

        {

            key: "empleado",

            title: "Empleado",

            render: row =>

                obtenerNombre(

                    row.empleado_id

                )

        },

        {

            key: "cantidad1",

            title: "Resp. A"

        },

        {

            key: "cantidad2",

            title: "Resp. B"

        },

        {

            key: "campania1",

            title: "Promedio A",

            render: row =>

                Number(

                    row.campania1 || 0

                ).toFixed(2)

        },

        {

            key: "campania2",

            title: "Promedio B",

            render: row =>

                Number(

                    row.campania2 || 0

                ).toFixed(2)

        },

        {

            key: "variacion",

            title: "Variación",

            render: row =>

                `${row.variacion.toFixed(2)

                } %`

        },

        {

            key: "tendencia",

            title: "",

            render: row => (

                <Badge

                    bg={

                        row.tendencia === "SUBE"

                            ? "success"

                            : row.tendencia === "BAJA"

                                ? "danger"

                                : "secondary"

                    }

                >

                    {

                        row.tendencia

                    }

                </Badge>

            )

        }

    ];

    const comparar = async () => {

        if (

            !evaluacion1 ||

            !evaluacion2

        ) {

            return;

        }

        try {

            setLoading(true);

            const {

                data

            } = await reporteApi.obtenerComparativo(

                evaluacion1,

                evaluacion2

            );

            setComparativo(

                data

            );

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <>

            <Card className="mb-4">

                <Card.Body>

                    <Row>

                        <Col md={5}>

                            <Form.Label>

                                Campaña A

                            </Form.Label>

                            <Form.Select
                                className="form-control"

                                value={evaluacion1}

                                onChange={(e) =>

                                    setEvaluacion1(

                                        e.target.value

                                    )

                                }

                            >

                                <option value="">

                                    Seleccionar

                                </option>

                                {

                                    evaluaciones.map(item => (

                                        <option

                                            key={item.id}

                                            value={item.id}

                                        >

                                            {item.numero}

                                            {" - "}

                                            {item.tipo?.descripcion}

                                        </option>

                                    ))

                                }

                            </Form.Select>

                        </Col>

                        <Col md={5}>

                            <Form.Label>

                                Campaña B

                            </Form.Label>

                            <Form.Select

                                className="form-control"

                                value={evaluacion2}

                                onChange={(e) =>

                                    setEvaluacion2(

                                        e.target.value

                                    )

                                }

                            >

                                <option value="">

                                    Seleccionar

                                </option>

                                {

                                    evaluaciones.map(item => (

                                        <option

                                            key={item.id}

                                            value={item.id}

                                        >

                                            {item.numero}

                                            {" - "}

                                            {item.tipo?.descripcion}

                                        </option>

                                    ))

                                }

                            </Form.Select>

                        </Col>

                        <Col

                            md={2}

                            className="d-flex align-items-end"

                        >

                            <Button

                                className="w-100"

                                onClick={comparar}

                            >

                                Comparar

                            </Button>

                            <Button

                                variant="success"

                                className="ms-2"

                                disabled={!comparativo}

                                onClick={() =>

                                    exportarComparativoExcel(

                                        comparativo,

                                        comparativo?.campania1,

                                        comparativo?.campania2,

                                        empleadosMap

                                    )

                                }

                            >

                                Exportar Excel

                            </Button>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>

            {

                loading && (

                    <div className="text-center">

                        <Spinner

                            animation="border"

                        />

                    </div>

                )

            }

            {

                comparativo && (

                    <>

                        <Card className="mb-4">

                            <Card.Header>

                                Indicadores

                            </Card.Header>

                            <Card.Body>

                                <ERPTable

                                    pagination={false}

                                    columns={[

                                        {

                                            key: "descripcion",

                                            title: "Indicador"

                                        },

                                        {

                                            key: "campania1",

                                            title: "Campaña A",

                                            render: row =>

                                                Number(

                                                    row.campania1

                                                ).toFixed(2)

                                        },

                                        {

                                            key: "campania2",

                                            title: "Campaña B",

                                            render: row =>

                                                Number(

                                                    row.campania2

                                                ).toFixed(2)

                                        },

                                        {

                                            key: "diferencia",

                                            title: "Diferencia",

                                            render: row =>

                                                Number(

                                                    row.diferencia

                                                ).toFixed(2)

                                        },

                                        {

                                            key: "variacion",

                                            title: "Variación",

                                            render: row =>

                                                `${Number(

                                                    row.variacion

                                                ).toFixed(2)

                                                } %`

                                        },

                                        {

                                            key: "tendencia",

                                            title: "Tendencia",

                                            render: row => (

                                                <Badge

                                                    bg={

                                                        row.tendencia === "SUBE"

                                                            ? "success"

                                                            : row.tendencia === "BAJA"

                                                                ? "danger"

                                                                : "secondary"

                                                    }

                                                >

                                                    {

                                                        row.tendencia

                                                    }

                                                </Badge>

                                            )

                                        }

                                    ]}

                                    data={

                                        comparativo.indicadores

                                    }

                                />

                            </Card.Body>

                        </Card>

                        <Card className="mb-4">

                            <Card.Header>

                                Comparativo Competencias

                            </Card.Header>

                            <Card.Body>

                                <ERPTable

                                    columns={competenciaColumns}

                                    data={

                                        comparativo.competencias

                                    }

                                    pagination={false}

                                />

                            </Card.Body>

                        </Card>

                        <Card className="mb-4">

                            <Card.Header>

                                Comparativo Preguntas

                            </Card.Header>

                            <Card.Body>

                                <ERPTable

                                    columns={preguntaColumns}

                                    data={

                                        comparativo.preguntas

                                    }

                                    pagination={false}

                                />

                            </Card.Body>

                        </Card>

                        <Card>

                            <Card.Header>

                                Ranking Comparativo

                            </Card.Header>

                            <Card.Body>

                                <ERPTable

                                    columns={rankingColumns}

                                    data={

                                        comparativo.ranking

                                    }

                                    pagination={false}

                                />

                            </Card.Body>

                        </Card>

                    </>

                )

            }

        </>

    );

};

export default ReporteComparativoTab;