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

const EvaluacionesTab = ({

    configuracion,

    onGuardar

}) => {

    const [

        form,

        setForm

    ] = useState({

        permitir_editar_finalizadas: false,

        cerrar_automaticamente: false,

        duplicar_periodo: false,

        requerir_comentario: false

    });

    useEffect(() => {

        if (!configuracion) {

            return;

        }

        setForm({

            permitir_editar_finalizadas:

                configuracion.permitir_editar_finalizadas,

            cerrar_automaticamente:

                configuracion.cerrar_automaticamente,

            duplicar_periodo:

                configuracion.duplicar_periodo,

            requerir_comentario:

                configuracion.requerir_comentario

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

                            name="permitir_editar_finalizadas"

                            label="Permitir editar evaluaciones finalizadas"

                            checked={form.permitir_editar_finalizadas}

                            onChange={handleChange}

                        />

                        <Form.Check

                            type="switch"

                            className="mb-3"

                            name="cerrar_automaticamente"

                            label="Cerrar automáticamente al finalizar"

                            checked={form.cerrar_automaticamente}

                            onChange={handleChange}

                        />

                    </Col>

                    <Col md={6}>

                        <Form.Check

                            type="switch"

                            className="mb-3"

                            name="duplicar_periodo"

                            label="Duplicar configuración al crear un nuevo período"

                            checked={form.duplicar_periodo}

                            onChange={handleChange}

                        />

                        <Form.Check

                            type="switch"

                            className="mb-3"

                            name="requerir_comentario"

                            label="Requerir comentario obligatorio"

                            checked={form.requerir_comentario}

                            onChange={handleChange}

                        />

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

export default EvaluacionesTab;