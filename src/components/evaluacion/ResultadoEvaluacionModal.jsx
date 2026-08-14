import React from "react";

import {

    Modal,
    Row,
    Col,
    Card,
    Badge,
    Button

} from "react-bootstrap";

const ResultadoEvaluacionModal = ({

    show,

    onHide,

    resultado

}) => {

    if (

        !resultado

    ) {

        return null;

    }

    const {

        evaluacion,

        escala,

        pesos,

        competencias,

        metas,

        resumen,

        resultadoFinal

    } = resultado;

    return (

        <Modal

            show={show}

            onHide={onHide}

            size="xl"

            backdrop="static"

            centered

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    Resultado de Evaluación

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Row>

                    <Col md={8}>

                        <Card className="mb-3">

                            <Card.Body>

                                <Row>

                                    <Col md={6}>

                                        <strong>

                                            Empleado

                                        </strong>

                                        <br />

                                        {

                                            evaluacion.empleado?.nombre

                                        }

                                    </Col>

                                    <Col md={6}>

                                        <strong>

                                            Evaluador

                                        </strong>

                                        <br />

                                        {

                                            evaluacion.evaluador?.usuario

                                        }

                                    </Col>

                                </Row>

                                <hr />

                                <Row>

                                    <Col md={4}>

                                        <strong>

                                            Tipo

                                        </strong>

                                        <br />

                                        {

                                            evaluacion.tipo?.descripcion

                                        }

                                    </Col>

                                    <Col md={4}>

                                        <strong>

                                            Período

                                        </strong>

                                        <br />

                                        {

                                            evaluacion.periodo?.descripcion

                                        }

                                    </Col>

                                    <Col md={4}>

                                        <strong>

                                            Fecha

                                        </strong>

                                        <br />

                                        {

                                            evaluacion.fecha

                                        }

                                    </Col>

                                </Row>

                            </Card.Body>

                        </Card>

                    </Col>

                    <Col md={4}>

                        <Card

                            bg={

                                escala?.color ||

                                "secondary"

                            }

                            text="white"

                        >

                            <Card.Body className="text-center">

                                <div

                                    style={{

                                        fontSize: 50

                                    }}

                                >

                                    🏆

                                </div>

                                <h3>

                                    {

                                        escala?.nombre ||

                                        "Sin Escala"

                                    }

                                </h3>

                                <h1>

                                    {

                                        resultadoFinal

                                    }

                                    %

                                </h1>

                                <Badge bg="light" text="dark">

                                    {

                                        escala

                                            ? `${escala.valor_desde} - ${escala.valor_hasta}`

                                            : "-"

                                    }

                                </Badge>

                            </Card.Body>

                        </Card>

                    </Col>

                </Row>

                <Row>

                    <Col>

                        <Card>

                            <Card.Header>

                                <strong>

                                    Desglose del Resultado

                                </strong>

                            </Card.Header>

                            <Card.Body>

                                <table className="table table-bordered table-hover align-middle">

                                    <thead>

                                        <tr>

                                            <th>Componente</th>

                                            <th className="text-center">

                                                Peso

                                            </th>

                                            <th className="text-center">

                                                Promedio

                                            </th>

                                            <th className="text-center">

                                                Resultado

                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        <tr>

                                            <td>

                                                Competencias

                                            </td>

                                            <td className="text-center">

                                                {

                                                    pesos.competencias

                                                }%

                                            </td>

                                            <td className="text-center">

                                                {

                                                    competencias.promedio

                                                }%

                                            </td>

                                            <td className="text-center">

                                                {

                                                    competencias.resultado

                                                }

                                            </td>

                                        </tr>

                                        <tr>

                                            <td>

                                                Metas

                                            </td>

                                            <td className="text-center">

                                                {

                                                    pesos.metas

                                                }%

                                            </td>

                                            <td className="text-center">

                                                {

                                                    metas.promedio

                                                }%

                                            </td>

                                            <td className="text-center">

                                                {

                                                    metas.resultado

                                                }

                                            </td>

                                        </tr>

                                        <tr>

                                            <td>

                                                KPIs

                                            </td>

                                            <td className="text-center">

                                                {

                                                    pesos.kpis

                                                }%

                                            </td>

                                            <td className="text-center">

                                                -

                                            </td>

                                            <td className="text-center">

                                                -

                                            </td>

                                        </tr>

                                        <tr>

                                            <td>

                                                Valores

                                            </td>

                                            <td className="text-center">

                                                {

                                                    pesos.valores

                                                }%

                                            </td>

                                            <td className="text-center">

                                                -

                                            </td>

                                            <td className="text-center">

                                                -

                                            </td>

                                        </tr>

                                        <tr>

                                            <td>

                                                Objetivos

                                            </td>

                                            <td className="text-center">

                                                {

                                                    pesos.objetivos

                                                }%

                                            </td>

                                            <td className="text-center">

                                                -

                                            </td>

                                            <td className="text-center">

                                                -

                                            </td>

                                        </tr>

                                        <tr>

                                            <td>

                                                Capacitación

                                            </td>

                                            <td className="text-center">

                                                {

                                                    pesos.capacitacion

                                                }%

                                            </td>

                                            <td className="text-center">

                                                -

                                            </td>

                                            <td className="text-center">

                                                -

                                            </td>

                                        </tr>

                                    </tbody>

                                    <tfoot>

                                        <tr>

                                            <th>

                                                Resultado Final

                                            </th>

                                            <th className="text-center">

                                                {

                                                    resumen.total_peso

                                                }%

                                            </th>

                                            <th></th>

                                            <th className="text-center">

                                                {

                                                    resultadoFinal

                                                }

                                            </th>

                                        </tr>

                                    </tfoot>

                                </table>

                            </Card.Body>

                        </Card>

                    </Col>

                </Row>

                <Row className="mt-3">

                    <Col md={6}>

                        <Card>

                            <Card.Header>

                                <strong>

                                    Competencias

                                </strong>

                            </Card.Header>

                            <Card.Body>

                                <p>

                                    <strong>

                                        Promedio:

                                    </strong>

                                    {" "}

                                    {

                                        competencias.promedio

                                    }%

                                </p>

                                <p>

                                    <strong>

                                        Peso:

                                    </strong>

                                    {" "}

                                    {

                                        competencias.peso

                                    }%

                                </p>

                                <p className="mb-0">

                                    <strong>

                                        Resultado:

                                    </strong>

                                    {" "}

                                    {

                                        competencias.resultado

                                    }

                                </p>

                            </Card.Body>

                        </Card>

                    </Col>

                    <Col md={6}>

                        <Card>

                            <Card.Header>

                                <strong>

                                    Metas

                                </strong>

                            </Card.Header>

                            <Card.Body>

                                <p>

                                    <strong>

                                        Total de metas:

                                    </strong>

                                    {" "}

                                    {

                                        metas.total

                                    }

                                </p>

                                <p>

                                    <strong>

                                        Promedio:

                                    </strong>

                                    {" "}

                                    {

                                        metas.promedio

                                    }%

                                </p>

                                <p>

                                    <strong>

                                        Peso:

                                    </strong>

                                    {" "}

                                    {

                                        metas.peso

                                    }%

                                </p>

                                <p className="mb-0">

                                    <strong>

                                        Resultado:

                                    </strong>

                                    {" "}

                                    {

                                        metas.resultado

                                    }

                                </p>

                            </Card.Body>

                        </Card>

                    </Col>

                </Row>

            </Modal.Body>

            <Modal.Footer>

                <Button

                    variant="secondary"

                    onClick={onHide}

                >

                    Cerrar

                </Button>

            </Modal.Footer>

        </Modal>

    );

};

export default ResultadoEvaluacionModal;