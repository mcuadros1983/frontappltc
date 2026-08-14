import React, {

    useEffect,
    useState

} from "react";

import {

    Modal,
    Button,
    Form,
    Row,
    Col

} from "react-bootstrap";

import schedulerApi from "../../services/scheduler/schedulerApi";

const initialState = {

    codigo: "",

    nombre: "",

    descripcion: "",

    modulo: "",

    handler: "",

    cron: "",

    activo: true,

    orden: 1

};

const JobFormModal = ({

    show,

    onHide,

    job,

    onSaved

}) => {

    const [

        form,

        setForm

    ] = useState(initialState);

    useEffect(() => {

        if (job) {

            setForm(job);

        }

        else {

            setForm(initialState);

        }

    }, [

        job,

        show

    ]);

    /*=========================================================
      CHANGE
    =========================================================*/

    const handleChange = (e) => {

        const {

            name,

            value,

            type,

            checked

        } = e.target;

        setForm((prev) => ({

            ...prev,

            [name]:

                type === "checkbox"

                    ? checked

                    : value

        }));

    };

    /*=========================================================
      GUARDAR
    =========================================================*/

    const guardar = async () => {

        try {

            if (job) {

                await schedulerApi.actualizarJob(

                    job.id,

                    form

                );

            }

            else {

                await schedulerApi.crearJob(

                    form

                );

            }

            onSaved();

            onHide();

        }

        catch (error) {

            console.error(error);

            alert(

                "No fue posible guardar el Job."

            );

        }

    };

    return (

        <Modal

            show={show}

            onHide={onHide}

            size="lg"

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    {

                        job

                            ? "Editar Job"

                            : "Nuevo Job"

                    }

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Row>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Código

                            </Form.Label>

                            <Form.Control

                                name="codigo"

                                value={form.codigo}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Nombre

                            </Form.Label>

                            <Form.Control

                                name="nombre"

                                value={form.nombre}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                </Row>

                <Form.Group className="mb-3">

                    <Form.Label>

                        Descripción

                    </Form.Label>

                    <Form.Control

                        as="textarea"

                        rows={3}

                        name="descripcion"

                        value={form.descripcion}

                        onChange={handleChange}

                    />

                </Form.Group>

                <Row>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Módulo

                            </Form.Label>

                            <Form.Control

                                name="modulo"

                                value={form.modulo}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Handler

                            </Form.Label>

                            <Form.Control

                                name="handler"

                                value={form.handler}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                </Row>

                <Row>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Cron

                            </Form.Label>

                            <Form.Control

                                name="cron"

                                placeholder="0 8 * * 1"

                                value={form.cron}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                    <Col md={3}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Orden

                            </Form.Label>

                            <Form.Control

                                type="number"

                                name="orden"

                                value={form.orden}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                    <Col
                        md={3}
                        className="d-flex align-items-center"
                    >

                        <Form.Check

                            label="Activo"

                            name="activo"

                            checked={form.activo}

                            onChange={handleChange}

                        />

                    </Col>

                </Row>

            </Modal.Body>

            <Modal.Footer>

                <Button

                    variant="secondary"

                    onClick={onHide}

                >

                    Cancelar

                </Button>

                <Button

                    onClick={guardar}

                >

                    Guardar

                </Button>

            </Modal.Footer>

        </Modal>

    );

};

export default JobFormModal;