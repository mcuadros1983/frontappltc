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

const EventoFormModal = ({

    show,

    onHide,

    evento,

    onSaved

}) => {

    const [form, setForm] = useState({

        codigo: "",

        nombre: "",

        categoria: "",

        descripcion: "",

        activo: true,

        email: true,

        interna: true,

        whatsapp: false,

        dashboard: false,

        auditoria: false,

        dias_antes: 0,

        dias_despues: 0

    });

    const [

        guardando,

        setGuardando

    ] = useState(false);

    useEffect(() => {

        if (evento) {

            setForm({

                codigo: evento.codigo || "",

                nombre: evento.nombre || "",

                categoria: evento.categoria || "",

                descripcion: evento.descripcion || "",

                activo: evento.activo ?? true,

                email: evento.email ?? true,

                interna: evento.interna ?? true,

                whatsapp: evento.whatsapp ?? false,

                dashboard: evento.dashboard ?? false,

                auditoria: evento.auditoria ?? false,

                dias_antes: evento.dias_antes ?? 0,

                dias_despues: evento.dias_despues ?? 0

            });

        }

        else {

            setForm({

                codigo: "",

                nombre: "",

                categoria: "",

                descripcion: "",

                activo: true,

                email: true,

                interna: true,

                whatsapp: false,

                dashboard: false,

                auditoria: false,

                dias_antes: 0,

                dias_despues: 0

            });

        }

    }, [

        evento,

        show

    ]);

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

            if (evento) {

                await notificationApi.actualizarEvento(

                    evento.id,

                    form

                );

            }

            else {

                await notificationApi.crearEvento(

                    form

                );

            }

            onSaved();

            onHide();

        }

        catch (error) {

            console.error(error);

            alert(

                "No fue posible guardar el evento."

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

            backdrop="static"

            size="lg"

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    {

                        evento

                            ? "Editar Evento"

                            : "Nuevo Evento"

                    }

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Row>

                    <Col md={4}>

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

                    <Col md={8}>

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

                        Categoría

                    </Form.Label>

                    <Form.Control

                        name="categoria"

                        value={form.categoria}

                        onChange={handleChange}

                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label>

                        Descripción

                    </Form.Label>

                    <Form.Control

                        as="textarea"

                        rows={4}

                        name="descripcion"

                        value={form.descripcion}

                        onChange={handleChange}

                    />

                </Form.Group>

                <Form.Check

                    type="switch"

                    label="Evento Activo"

                    name="activo"

                    checked={form.activo}

                    onChange={handleChange}

                />

                <hr />

                <h5 className="mb-3">

                    Canales de Notificación

                </h5>

                <Row>

                    <Col md={4}>

                        <Form.Check

                            type="switch"

                            label="Email"

                            name="email"

                            checked={form.email}

                            onChange={handleChange}

                        />

                    </Col>

                    <Col md={4}>

                        <Form.Check

                            type="switch"

                            label="Notificación Interna"

                            name="interna"

                            checked={form.interna}

                            onChange={handleChange}

                        />

                    </Col>

                    <Col md={4}>

                        <Form.Check

                            type="switch"

                            label="WhatsApp"

                            name="whatsapp"

                            checked={form.whatsapp}

                            onChange={handleChange}

                        />

                    </Col>

                </Row>

                                <hr />

                <h5 className="mb-3">

                    Integraciones

                </h5>

                <Row>

                    <Col md={6}>

                        <Form.Check

                            type="switch"

                            label="Dashboard"

                            name="dashboard"

                            checked={form.dashboard}

                            onChange={handleChange}

                        />

                    </Col>

                    <Col md={6}>

                        <Form.Check

                            type="switch"

                            label="Auditoría"

                            name="auditoria"

                            checked={form.auditoria}

                            onChange={handleChange}

                        />

                    </Col>

                </Row>

                <hr />

                <h5 className="mb-3">

                    Programación

                </h5>

                <Row>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Días antes del evento

                            </Form.Label>

                            <Form.Control

                                type="number"

                                name="dias_antes"

                                value={form.dias_antes}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                    <Col md={6}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Días después del evento

                            </Form.Label>

                            <Form.Control

                                type="number"

                                name="dias_despues"

                                value={form.dias_despues}

                                onChange={handleChange}

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

export default EventoFormModal;