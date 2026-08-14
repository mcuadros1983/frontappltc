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

import {

    notificationApi

} from "../../services/notification/notificationApi";

const DestinatarioFormModal = ({

    show,

    onHide,

    destinatario,

    onSaved

}) => {

    const [form, setForm] = useState({

        evento_id: "",

        nombre: "",

        email: "",

        descripcion: "",

        activo: true

    });

    const [eventos, setEventos] = useState([]);

    const [guardando, setGuardando] = useState(false);

    useEffect(() => {

        cargarEventos();

    }, []);

    useEffect(() => {

        if (destinatario) {

            setForm({

                evento_id:

                    destinatario.evento_id || "",

                nombre:

                    destinatario.nombre || "",

                email:

                    destinatario.email || "",

                descripcion:

                    destinatario.descripcion || "",

                activo:

                    destinatario.activo ?? true

            });

        }

        else {

            setForm({

                evento_id: "",

                nombre: "",

                email: "",

                descripcion: "",

                activo: true

            });

        }

    }, [

        destinatario,

        show

    ]);

    const cargarEventos = async () => {

        try {

            const data =
                await notificationApi.listarEventos();

            setEventos(data);

        }

        catch (error) {

            console.error(error);

        }

    };

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

    const guardar = async () => {

        try {

            setGuardando(true);

            if (destinatario) {

                await notificationApi.actualizarDestinatario(

                    destinatario.id,

                    form

                );

            }

            else {

                await notificationApi.crearDestinatario(

                    form

                );

            }

            onSaved();

            onHide();

        }

        catch (error) {

            console.error(error);

            alert(

                "No fue posible guardar el destinatario."

            );

        }

        finally {

            setGuardando(false);

        }

    };

    return (

        <Modal

            show={show}

            onHide={onHide}

            size="lg"

            backdrop="static"

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    {

                        destinatario

                            ? "Editar Destinatario"

                            : "Nuevo Destinatario"

                    }

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Row>

                    <Col md={12}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Evento

                            </Form.Label>

                            <Form.Select

                                name="evento_id"

                                value={form.evento_id}

                                onChange={handleChange}

                            >

                                <option value="">

                                    Seleccione...

                                </option>

                                {

                                    eventos.map(

                                        (evento) => (

                                            <option

                                                key={

                                                    evento.id

                                                }

                                                value={

                                                    evento.id

                                                }

                                            >

                                                {

                                                    evento.nombre

                                                }

                                            </option>

                                        )

                                    )

                                }

                            </Form.Select>

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

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Email

                            </Form.Label>

                            <Form.Control

                                type="email"

                                name="email"

                                value={form.email}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                    <Col md={12}>

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

                    </Col>

                    <Col md={12}>

                        <Form.Check

                            type="switch"

                            label="Destinatario Activo"

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

                    variant="primary"

                    onClick={guardar}

                    disabled={guardando}

                >

                    {

                        guardando

                            ? "Guardando..."

                            : "Guardar"

                    }

                </Button>

            </Modal.Footer>

        </Modal>

    );

};

export default DestinatarioFormModal;