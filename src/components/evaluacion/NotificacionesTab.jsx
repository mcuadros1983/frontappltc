import React, {

    useEffect,
    useState

} from "react";

import {

    Card,
    Row,
    Col,
    Form,
    Button

} from "react-bootstrap";

const NotificacionesTab = ({

    configuracion,

    onGuardar

}) => {

    const [

        form,

        setForm

    ] = useState({

        enviar_correos: true,

        recordar_supervisor: true,

        recordar_rrhh: true,

        recordar_dias_antes: 7

    });

    useEffect(() => {

        if (!configuracion) {

            return;

        }

        setForm({

            enviar_correos:

                configuracion.enviar_correos,

            recordar_supervisor:

                configuracion.recordar_supervisor,

            recordar_rrhh:

                configuracion.recordar_rrhh,

            recordar_dias_antes:

                configuracion.recordar_dias_antes

        });

    }, [

        configuracion

    ]);

    const handleChange = (e) => {

    const {

        name,

        value,

        checked,

        type

    } = e.target;

    setForm(prev => ({

        ...prev,

        [name]:

            type === "checkbox"

                ? checked

                : value

    }));

};

const guardar = async () => {

    await onGuardar({

        ...configuracion,

        ...form

    });

};

return (

    <Card className="border-0">

        <Card.Body>

            <Row>

                <Col md={6}>

                    <Form.Check

                        type="switch"

                        name="enviar_correos"

                        label="Enviar Correos"

                        checked={form.enviar_correos}

                        onChange={handleChange}

                        className="mb-3"

                    />

                    <Form.Check

                        type="switch"

                        name="recordar_supervisor"

                        label="Notificar al Supervisor"

                        checked={form.recordar_supervisor}

                        onChange={handleChange}

                        className="mb-3"

                    />

                </Col>

                <Col md={6}>

                    <Form.Check

                        type="switch"

                        name="recordar_rrhh"

                        label="Notificar a Recursos Humanos"

                        checked={form.recordar_rrhh}

                        onChange={handleChange}

                        className="mb-3"

                    />

                    <Form.Group>

                        <Form.Label>

                            Días antes del vencimiento

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={1}

                            max={365}

                            name="recordar_dias_antes"

                            value={form.recordar_dias_antes}

                            onChange={handleChange}

                        />

                        <Form.Text>

                            Cantidad de días antes del vencimiento en que se enviarán los recordatorios.

                        </Form.Text>

                    </Form.Group>

                </Col>

            </Row>

            <hr/>

            <div className="d-flex justify-content-end">

                <Button

                    variant="primary"

                    onClick={guardar}

                >

                    Guardar Configuración

                </Button>

            </div>

        </Card.Body>

    </Card>

);

};

export default NotificacionesTab;