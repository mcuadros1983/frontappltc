import React from "react";

import {

    Modal,
    Row,
    Col,
    Card,
    ProgressBar,
    Button

} from "react-bootstrap";

import {

    FiAward,
    FiTarget,
    FiCheckCircle

} from "react-icons/fi";

const ResultadoEvaluacionModal = ({

    show,

    onHide,

    resultado

}) => {

    if (!resultado) {

        return null;

    }

    const {

        competencias,

        metas,

        resultadoFinal

    } = resultado;

    const renderCompetencias = () => (

        <Card className="shadow-sm h-100">

            <Card.Body>

                <h5 className="mb-3">

                    <FiAward className="me-2 text-primary" />

                    Competencias

                </h5>

                <Row>

                    <Col md={6}>

                        <strong>

                            Promedio

                        </strong>

                        <div>

                            {

                                Number(

                                    competencias.promedio

                                ).toFixed(2)

                            } %

                        </div>

                    </Col>

                    <Col md={6}>

                        <strong>

                            Peso

                        </strong>

                        <div>

                            {

                                competencias.peso

                            } %

                        </div>

                    </Col>

                </Row>

                <div className="mt-3">

                    <ProgressBar

                        now={

                            Number(

                                competencias.promedio

                            )

                        }

                    />

                </div>

                <div className="mt-3">

                    <strong>

                        Resultado

                    </strong>

                    <div className="fs-4 text-primary">

                        {

                            Number(

                                competencias.resultado

                            ).toFixed(2)

                        }

                    </div>

                </div>

            </Card.Body>

        </Card>

    );

    const renderMetas = () => (

        <Card className="shadow-sm h-100">

            <Card.Body>

                <h5 className="mb-3">

                    <FiTarget className="me-2 text-success" />

                    Metas

                </h5>

                <Row>

                    <Col md={6}>

                        <strong>

                            Promedio

                        </strong>

                        <div>

                            {

                                Number(

                                    metas.promedio

                                ).toFixed(2)

                            } %

                        </div>

                    </Col>

                    <Col md={6}>

                        <strong>

                            Peso

                        </strong>

                        <div>

                            {

                                metas.peso

                            } %

                        </div>

                    </Col>

                </Row>

                <div className="mt-3">

                    <ProgressBar

                        variant="success"

                        now={

                            Number(

                                metas.promedio

                            )

                        }

                    />

                </div>

                <div className="mt-3">

                    <strong>

                        Resultado

                    </strong>

                    <div className="fs-4 text-success">

                        {

                            Number(

                                metas.resultado

                            ).toFixed(2)

                        }

                    </div>

                </div>

            </Card.Body>

        </Card>

    );

    return (

        <Modal

            show={show}

            onHide={onHide}

            size="xl"

            centered

            backdrop="static"

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    <FiCheckCircle className="me-2 text-success" />

                    Resultado de la Evaluación

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Card className="mb-4 shadow-sm">

                    <Card.Body>

                        <Row>

                            <Col md={6}>

                                <strong>Evaluación:</strong>

                                <div>

                                    {resultado.evaluacion.numero}

                                </div>

                            </Col>

                            <Col md={6}>

                                <strong>Fecha:</strong>

                                <div>

                                    {resultado.evaluacion.fecha}

                                </div>

                            </Col>

                        </Row>

                        <Row className="mt-3">

                            <Col md={6}>

                                <strong>Empleado:</strong>

                                <div>

                                    {resultado.evaluacion.empleado?.nombre}

                                </div>

                            </Col>

                            <Col md={6}>

                                <strong>Evaluador:</strong>

                                <div>

                                    {resultado.evaluacion.evaluador?.nombre}

                                </div>

                            </Col>

                        </Row>

                        <Row className="mt-3">

                            <Col md={6}>

                                <strong>Tipo:</strong>

                                <div>

                                    {resultado.evaluacion.tipo?.nombre}

                                </div>

                            </Col>

                            <Col md={6}>

                                <strong>Período:</strong>

                                <div>

                                    {resultado.evaluacion.periodo?.nombre}

                                </div>

                            </Col>

                        </Row>

                    </Card.Body>

                </Card>
                <Row className="g-3">

                    <Col lg={6}>

                        {renderCompetencias()}

                    </Col>

                    <Col lg={6}>

                        {renderMetas()}

                    </Col>

                </Row>

                <Row className="mt-4">

                    <Col>

                        <Card className="border-success shadow-sm">

                            <Card.Body className="text-center">

                                <h4 className="text-success mb-3">

                                    Resultado Final

                                </h4>

                                <h1
                                    className="display-4 fw-bold text-success"
                                >

                                    {

                                        Number(

                                            resultadoFinal

                                        ).toFixed(2)

                                    } %

                                </h1>

                                <ProgressBar

                                    now={

                                        Number(

                                            resultadoFinal

                                        )

                                    }

                                    variant="success"

                                    style={{

                                        height: "20px"

                                    }}

                                    className="mt-3"

                                />

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