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

const DashboardTab = ({

    configuracion,

    onGuardar

}) => {

    const [

        form,

        setForm

    ] = useState({

        mostrar_dashboard: true,

        mostrar_ranking: true,

        mostrar_heatmap: true,

        mostrar_radar: true,

        mostrar_historico: true

    });

    useEffect(() => {

        if (!configuracion) {

            return;

        }

        setForm({

            mostrar_dashboard:

                configuracion.mostrar_dashboard,

            mostrar_ranking:

                configuracion.mostrar_ranking,

            mostrar_heatmap:

                configuracion.mostrar_heatmap,

            mostrar_radar:

                configuracion.mostrar_radar,

            mostrar_historico:

                configuracion.mostrar_historico

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

                            name="mostrar_dashboard"

                            label="Mostrar Dashboard Ejecutivo"

                            checked={form.mostrar_dashboard}

                            onChange={handleChange}

                        />

                        <Form.Check

                            type="switch"

                            className="mb-3"

                            name="mostrar_ranking"

                            label="Mostrar Ranking de Empleados"

                            checked={form.mostrar_ranking}

                            onChange={handleChange}

                        />

                        <Form.Check

                            type="switch"

                            className="mb-3"

                            name="mostrar_heatmap"

                            label="Mostrar Heatmap"

                            checked={form.mostrar_heatmap}

                            onChange={handleChange}

                        />

                    </Col>

                    <Col md={6}>

                        <Form.Check

                            type="switch"

                            className="mb-3"

                            name="mostrar_radar"

                            label="Mostrar Gráfico Radar"

                            checked={form.mostrar_radar}

                            onChange={handleChange}

                        />

                        <Form.Check

                            type="switch"

                            className="mb-3"

                            name="mostrar_historico"

                            label="Mostrar Histórico"

                            checked={form.mostrar_historico}

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

export default DashboardTab;