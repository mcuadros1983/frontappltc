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

const PlantillaFormModal = ({

    show,

    onHide,

    plantilla,

    onSaved

}) => {

    const [form, setForm] = useState({

        codigo: "",

        nombre: "",

        descripcion: "",

        asunto: "",

        html: "",

        texto: "",

        variables: "",

        activo: true

    });

    const [guardando, setGuardando] = useState(false);

    useEffect(() => {

        if (plantilla) {

            setForm({

                codigo: plantilla.codigo || "",

                nombre: plantilla.nombre || "",

                descripcion: plantilla.descripcion || "",

                asunto: plantilla.asunto || "",

                html: plantilla.html || "",

                texto: plantilla.texto || "",

                variables: plantilla.variables || "",

                activo: plantilla.activo ?? true

            });

        }

        else {

            setForm({

                codigo: "",

                nombre: "",

                descripcion: "",

                asunto: "",

                html: "",

                texto: "",

                variables: "",

                activo: true

            });

        }

    }, [plantilla, show]);

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

            if (plantilla) {

                await notificationApi.actualizarPlantilla(

                    plantilla.id,

                    form

                );

            }

            else {

                await notificationApi.crearPlantilla(

                    form

                );

            }

            onSaved();

            onHide();

        }

        catch (error) {

            console.error(error);

            alert(

                "No fue posible guardar la plantilla."

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

            size="xl"

            backdrop="static"

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    {

                        plantilla

                            ? "Editar Plantilla"

                            : "Nueva Plantilla"

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

                        Descripción

                    </Form.Label>

                    <Form.Control

                        name="descripcion"

                        value={form.descripcion}

                        onChange={handleChange}

                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label>

                        Asunto

                    </Form.Label>

                    <Form.Control

                        name="asunto"

                        value={form.asunto}

                        onChange={handleChange}

                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label>

                        Variables Disponibles

                    </Form.Label>

                    <Form.Control

                        name="variables"

                        value={form.variables}

                        onChange={handleChange}

                        placeholder="{{empleado}}, {{periodo}}, {{fecha}}"

                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label>

                        Contenido HTML

                    </Form.Label>

                    <Form.Control

                        as="textarea"

                        rows={10}

                        name="html"

                        value={form.html}

                        onChange={handleChange}

                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label>

                        Texto Plano

                    </Form.Label>

                    <Form.Control

                        as="textarea"

                        rows={6}

                        name="texto"

                        value={form.texto}

                        onChange={handleChange}

                    />

                </Form.Group>

                <Form.Check

                    type="switch"

                    label="Plantilla Activa"

                    name="activo"

                    checked={form.activo}

                    onChange={handleChange}

                />

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

export default PlantillaFormModal;