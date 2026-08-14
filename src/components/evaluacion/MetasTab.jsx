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

const MetasTab = ({

    configuracion,

    onGuardar

}) => {

    const [

        form,

        setForm

    ] = useState({

        calcular_automaticamente: true,

        permitir_sobrecumplimiento: true,

        decimales: 2

    });

    useEffect(() => {

        if (!configuracion) {

            return;

        }

        setForm({

            calcular_automaticamente:

                configuracion.calcular_automaticamente,

            permitir_sobrecumplimiento:

                configuracion.permitir_sobrecumplimiento,

            decimales:

                configuracion.decimales

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

                            className="mb-3"

                            name="calcular_automaticamente"

                            label="Calcular cumplimiento automáticamente"

                            checked={form.calcular_automaticamente}

                            onChange={handleChange}

                        />

                        <Form.Check

                            type="switch"

                            className="mb-3"

                            name="permitir_sobrecumplimiento"

                            label="Permitir sobrecumplimiento"

                            checked={form.permitir_sobrecumplimiento}

                            onChange={handleChange}

                        />

                    </Col>

                    <Col md={6}>

                        <Form.Group>

                            <Form.Label>

                                Cantidad de Decimales

                            </Form.Label>

                            <Form.Control

                                type="number"

                                min={0}

                                max={6}

                                name="decimales"

                                value={form.decimales}

                                onChange={handleChange}

                            />

                            <Form.Text>

                                Número de decimales utilizados para calcular el porcentaje de cumplimiento de las metas.

                            </Form.Text>

                        </Form.Group>

                    </Col>

                </Row>

                <hr />

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

export default MetasTab;