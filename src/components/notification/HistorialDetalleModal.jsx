import React from "react";

import {

    Modal,
    Button,
    Form,
    Row,
    Col,
    Badge

} from "react-bootstrap";

const HistorialDetalleModal = ({

    show,

    onHide,

    registro

}) => {

    if (!registro) {

        return null;

    }

    const badgeEstado = (estado) => {

        switch (estado) {

            case "ENVIADO":

                return "success";

            case "ERROR":

                return "danger";

            case "PENDIENTE":

                return "warning";

            case "CANCELADO":

                return "secondary";

            default:

                return "secondary";

        }

    };

    return (

        <Modal

            show={show}

            onHide={onHide}

            size="xl"

            backdrop="static"

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    Detalle de la Notificación

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Row>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Tipo

                            </Form.Label>

                            <Form.Control

                                value={registro.tipo || ""}

                                readOnly

                            />

                        </Form.Group>

                    </Col>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Canal

                            </Form.Label>

                            <Form.Control

                                value={registro.canal || ""}

                                readOnly

                            />

                        </Form.Group>

                    </Col>

                    <Col md={8}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Destinatario

                            </Form.Label>

                            <Form.Control

                                value={registro.destinatario || ""}

                                readOnly

                            />

                        </Form.Group>

                    </Col>

                    <Col md={4}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Estado

                            </Form.Label>

                            <div>

                                <Badge

                                    bg={

                                        badgeEstado(

                                            registro.estado

                                        )

                                    }

                                >

                                    {

                                        registro.estado

                                    }

                                </Badge>

                            </div>

                        </Form.Group>

                    </Col>

                    <Col md={12}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Asunto

                            </Form.Label>

                            <Form.Control

                                value={registro.asunto || ""}

                                readOnly

                            />

                        </Form.Group>

                    </Col>

                    <Col md={12}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Contenido

                            </Form.Label>

                            <Form.Control

                                as="textarea"

                                rows={10}

                                value={

                                    registro.contenido || ""

                                }

                                readOnly

                            />

                        </Form.Group>

                    </Col>

                    <Col md={12}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Error

                            </Form.Label>

                            <Form.Control

                                as="textarea"

                                rows={3}

                                value={registro.error || ""}

                                readOnly

                            />

                        </Form.Group>

                    </Col>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Fecha de Envío

                            </Form.Label>

                            <Form.Control

                                value={

                                    registro.fecha_envio

                                        ? new Date(

                                            registro.fecha_envio

                                        ).toLocaleString()

                                        : ""

                                }

                                readOnly

                            />

                        </Form.Group>

                    </Col>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Intentos

                            </Form.Label>

                            <Form.Control

                                value={

                                    registro.intentos ?? 0

                                }

                                readOnly

                            />

                        </Form.Group>

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

export default HistorialDetalleModal;