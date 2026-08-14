import React, {

    useEffect,
    useState

} from "react";

import {

    Modal,
    Form,
    Row,
    Col,
    Button

} from "react-bootstrap";

import {

    evaluacionEscalaApi

} from "../../../services/evaluacion/evaluacionEscalaApi";

const EscalaFormModal = ({

    show,

    onHide,

    escala,

    onSaved

}) => {

    const [

        form,

        setForm

    ] = useState({

        codigo: "",

        nombre: "",

        descripcion: "",

        valor_desde: 0,

        valor_hasta: 100,

        color: "success",

        icono: "",

        orden: 1,

        activo: true,

        es_predeterminada: false

    });

    useEffect(() => {

    if (!show) {

        return;

    }

    if (!escala) {

        setForm({

            codigo: "",

            nombre: "",

            descripcion: "",

            valor_desde: 0,

            valor_hasta: 100,

            color: "success",

            icono: "",

            orden: 1,

            activo: true,

            es_predeterminada: false

        });

        return;

    }

    setForm({

        codigo:

            escala.codigo,

        nombre:

            escala.nombre,

        descripcion:

            escala.descripcion || "",

        valor_desde:

            Number(

                escala.valor_desde

            ),

        valor_hasta:

            Number(

                escala.valor_hasta

            ),

        color:

            escala.color,

        icono:

            escala.icono || "",

        orden:

            escala.orden,

        activo:

            escala.activo,

        es_predeterminada:

            escala.es_predeterminada

    });

}, [

    show,

    escala

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

        if (escala) {

            await evaluacionEscalaApi.actualizar(

                escala.id,

                form

            );

        }

        else {

            await evaluacionEscalaApi.crear(

                form

            );

        }

        onSaved();

        onHide();

    }

    catch(error){

        console.error(error);

    }

};

return (

    <Modal

        show={show}

        onHide={onHide}

        backdrop="static"

        keyboard={false}

        size="lg"

        centered

    >

        <Modal.Header closeButton>

            <Modal.Title>

                {

                    escala

                        ? "Editar Escala"

                        : "Nueva Escala"

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

                    as="textarea"

                    rows={3}

                    name="descripcion"

                    value={form.descripcion}

                    onChange={handleChange}

                />

            </Form.Group>

            <Row>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Valor Desde

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={0}

                            max={100}

                            step="0.01"

                            name="valor_desde"

                            value={form.valor_desde}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={6}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Valor Hasta

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={0}

                            max={100}

                            step="0.01"

                            name="valor_hasta"

                            value={form.valor_hasta}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

            </Row>

            <Row>

                <Col md={4}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Color

                        </Form.Label>

                        <Form.Select

                            name="color"

                            value={form.color}

                            onChange={handleChange}

                        >

                            <option value="success">

                                Verde

                            </option>

                            <option value="primary">

                                Azul

                            </option>

                            <option value="info">

                                Celeste

                            </option>

                            <option value="warning">

                                Amarillo

                            </option>

                            <option value="danger">

                                Rojo

                            </option>

                            <option value="secondary">

                                Gris

                            </option>

                        </Form.Select>

                    </Form.Group>

                </Col>

                <Col md={4}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Icono

                        </Form.Label>

                        <Form.Control

                            name="icono"

                            value={form.icono}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

                <Col md={4}>

                    <Form.Group className="mb-3">

                        <Form.Label>

                            Orden

                        </Form.Label>

                        <Form.Control

                            type="number"

                            min={1}

                            name="orden"

                            value={form.orden}

                            onChange={handleChange}

                        />

                    </Form.Group>

                </Col>

            </Row>

            <Row>

                <Col md={6}>

                    <Form.Check

                        type="switch"

                        name="activo"

                        label="Escala Activa"

                        checked={form.activo}

                        onChange={handleChange}

                    />

                </Col>

                <Col md={6}>

                    <Form.Check

                        type="switch"

                        name="es_predeterminada"

                        label="Predeterminada"

                        checked={form.es_predeterminada}

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

            >

                Guardar

            </Button>

        </Modal.Footer>

    </Modal>

);

};

export default EscalaFormModal;