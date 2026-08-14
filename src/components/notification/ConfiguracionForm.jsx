import React, {

    useEffect,
    useState

} from "react";

import {

    Form,
    Row,
    Col,
    Button

} from "react-bootstrap";

const ConfiguracionForm = ({

    configuracion,

    onSubmit,

    saving

}) => {

    const [form, setForm] = useState({

        nombre: "",

        smtp_host: "",

        smtp_port: 587,

        smtp_secure: false,

        smtp_user: "",

        smtp_password: "",

        remitente_nombre: "",

        remitente_email: "",

        responder_email: "",

        activo: true,

        observaciones: ""

    });

    useEffect(() => {

        if (configuracion) {

            setForm({

                ...form,

                ...configuracion

            });

        }

    }, [configuracion]);

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

    const handleSubmit = (e) => {

        e.preventDefault();

        onSubmit(form);

    };

    return (

        <Form onSubmit={handleSubmit}>

            <Row>

                <Col md={12}>

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

                <Col md={8}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Servidor SMTP

                        </Form.Label>

                        <Form.Control

                            name="smtp_host"

                            value={form.smtp_host}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={4}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Puerto

                        </Form.Label>

                        <Form.Control

                            type="number"

                            name="smtp_port"

                            value={form.smtp_port}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Usuario SMTP

                        </Form.Label>

                        <Form.Control

                            name="smtp_user"

                            value={form.smtp_user}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Contraseña SMTP

                        </Form.Label>

                        <Form.Control

                            type="password"

                            name="smtp_password"

                            value={form.smtp_password}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Nombre Remitente

                        </Form.Label>

                        <Form.Control

                            name="remitente_nombre"

                            value={form.remitente_nombre}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Email Remitente

                        </Form.Label>

                        <Form.Control

                            type="email"

                            name="remitente_email"

                            value={form.remitente_email}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={12}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Responder a

                        </Form.Label>

                        <Form.Control

                            type="email"

                            name="responder_email"

                            value={form.responder_email}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={12}>

                    <Form.Group className="mb-3">

                        <Form.Check

                            type="switch"

                            label="Utilizar conexión segura (SSL/TLS)"

                            name="smtp_secure"

                            checked={form.smtp_secure}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={12}>

                    <Form.Group className="mb-3">

                        <Form.Check

                            type="switch"

                            label="Configuración activa"

                            name="activo"

                            checked={form.activo}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={12}>

                    <Form.Group className="mb-4">

                        <Form.Label>

                            Observaciones

                        </Form.Label>

                        <Form.Control

                            as="textarea"

                            rows={4}

                            name="observaciones"

                            value={form.observaciones}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

            </Row>

            <div className="text-end">

                <Button

                    type="submit"

                    variant="primary"

                    disabled={saving}

                >

                    {

                        saving

                            ? "Guardando..."

                            : "Guardar Configuración"

                    }

                </Button>

            </div>

        </Form>

    );

};

export default ConfiguracionForm;