import React, {

    useEffect,
    useState

} from "react";

import {

    Row,
    Col,
    Card,
    Form,
    Button

} from "react-bootstrap";

const GeneralTab = ({

    configuracion,

    onGuardar

}) => {

    const [

        form,

        setForm

    ] = useState({

        permitir_autoevaluacion: true,

        permitir_reapertura: false,

        mostrar_resultado_empleado: true,

        requerir_comentario: false,

        permitir_adjuntos: true,

        permitir_firma: false,

        dias_vigencia: 30

    });

    useEffect(() => {

        if (!configuracion) {

            return;

        }

        setForm({

            permitir_autoevaluacion:

                configuracion.permitir_autoevaluacion,

            permitir_reapertura:

                configuracion.permitir_reapertura,

            mostrar_resultado_empleado:

                configuracion.mostrar_resultado_empleado,

            requerir_comentario:

                configuracion.requerir_comentario,

            permitir_adjuntos:

                configuracion.permitir_adjuntos,

            permitir_firma:

                configuracion.permitir_firma,

            dias_vigencia:

                configuracion.dias_vigencia

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

        try {

            await onGuardar({

                ...configuracion,

                ...form

            });

            alert(

                "La configuración se guardó correctamente."

            );

        }

        catch (error) {

            console.error(error);

            alert(

                "No fue posible guardar la configuración."

            );

        }

    };

    return (

        <Card className="border-0">

            <Card.Body>

                <Row>

                    <Col md={6}>

                        <Form.Check

                            type="switch"

                            name="permitir_autoevaluacion"

                            label="Permitir Autoevaluación"

                            checked={form.permitir_autoevaluacion}

                            onChange={handleChange}

                            className="mb-3"

                        />

                        <Form.Check

                            type="switch"

                            name="permitir_reapertura"

                            label="Permitir Reapertura"

                            checked={form.permitir_reapertura}

                            onChange={handleChange}

                            className="mb-3"

                        />

                        <Form.Check

                            type="switch"

                            name="mostrar_resultado_empleado"

                            label="Mostrar Resultado al Empleado"

                            checked={form.mostrar_resultado_empleado}

                            onChange={handleChange}

                            className="mb-3"

                        />

                        <Form.Check

                            type="switch"

                            name="requerir_comentario"

                            label="Requerir Comentario Final"

                            checked={form.requerir_comentario}

                            onChange={handleChange}

                            className="mb-3"

                        />

                    </Col>

                    <Col md={6}>

                        <Form.Check

                            type="switch"

                            name="permitir_adjuntos"

                            label="Permitir Adjuntar Evidencias"

                            checked={form.permitir_adjuntos}

                            onChange={handleChange}

                            className="mb-3"

                        />

                        <Form.Check

                            type="switch"

                            name="permitir_firma"

                            label="Permitir Firma Digital"

                            checked={form.permitir_firma}

                            onChange={handleChange}

                            className="mb-3"

                        />

                        <Form.Group className="mt-4">

                            <Form.Label>

                                Días de Vigencia

                            </Form.Label>

                            <Form.Control

                                type="number"

                                min={1}

                                max={365}

                                name="dias_vigencia"

                                value={form.dias_vigencia}

                                onChange={handleChange}

                            />

                            <Form.Text className="text-muted">

                                Cantidad de días que permanecerá vigente una evaluación.

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

export default GeneralTab;