import React, {

    useEffect,
    useState

} from "react";

import {

    Card,
    Row,
    Col,
    Form,
    Alert,
    Button

} from "react-bootstrap";

const PesosTab = ({

    configuracion,

    onGuardar

}) => {

    const [

        form,

        setForm

    ] = useState({

        peso_competencias: 70,

        peso_metas: 30,

        peso_kpis: 0,

        peso_valores: 0,

        peso_objetivos: 0,

        peso_capacitacion: 0

    });

    const [

        total,

        setTotal

    ] = useState(100);

    useEffect(() => {

    if (!configuracion) {

        return;

    }

    setForm({

        peso_competencias:

            Number(

                configuracion.peso_competencias

            ),

        peso_metas:

            Number(

                configuracion.peso_metas

            ),

        peso_kpis:

            Number(

                configuracion.peso_kpis

            ),

        peso_valores:

            Number(

                configuracion.peso_valores

            ),

        peso_objetivos:

            Number(

                configuracion.peso_objetivos

            ),

        peso_capacitacion:

            Number(

                configuracion.peso_capacitacion

            )

    });

}, [

    configuracion

]);

useEffect(() => {

    const suma =

        Number(form.peso_competencias) +

        Number(form.peso_metas) +

        Number(form.peso_kpis) +

        Number(form.peso_valores) +

        Number(form.peso_objetivos) +

        Number(form.peso_capacitacion);

    setTotal(suma);

}, [

    form

]);

const handleChange = (e) => {

    const {

        name,

        value

    } = e.target;

    setForm(prev => ({

        ...prev,

        [name]:

            Number(value)

    }));

};

const guardar = async () => {

    if (total !== 100) {

        return;

    }

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

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Competencias (%)

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={0}

                            max={100}

                            name="peso_competencias"

                            value={form.peso_competencias}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Metas (%)

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={0}

                            max={100}

                            name="peso_metas"

                            value={form.peso_metas}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

            </Row>

            <Row>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            KPIs (%)

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={0}

                            max={100}

                            name="peso_kpis"

                            value={form.peso_kpis}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Valores (%)

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={0}

                            max={100}

                            name="peso_valores"

                            value={form.peso_valores}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

            </Row>

            <Row>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Objetivos (%)

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={0}

                            max={100}

                            name="peso_objetivos"

                            value={form.peso_objetivos}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Capacitación (%)

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={0}

                            max={100}

                            name="peso_capacitacion"

                            value={form.peso_capacitacion}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

            </Row>

            <Alert

                variant={

                    total === 100

                        ? "success"

                        : "danger"

                }

                className="mt-4"

            >

                <strong>

                    Total configurado:

                </strong>

                {" "}

                {total.toFixed(2)} %

                {

                    total !== 100 && (

                        <>

                            <br />

                            La suma de todos los pesos debe ser exactamente <strong>100%</strong>.

                        </>

                    )

                }

            </Alert>

            <div className="d-flex justify-content-end">

                <Button

                    variant="primary"

                    disabled={

                        total !== 100

                    }

                    onClick={guardar}

                >

                    Guardar Configuración

                </Button>

            </div>

        </Card.Body>

    </Card>

);

};

export default PesosTab;