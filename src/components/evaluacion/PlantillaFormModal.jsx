import React, {

    useEffect,
    useState

} from "react";

import {

    Modal,
    Button,
    Form,
    Row,
    Col,
    Alert

} from "react-bootstrap";

// import { evaluacionPlantillaApi } from "../../services/evaluacion/evaluacionPlantillaApi";

import { evaluacionConfiguracionApi } from "../../services/evaluacion/configuracionApi";

const initialForm = {

    codigo: "",

    descripcion: "",

    tipo_id: "",

    activo: true

};

const PlantillaFormModal = ({

    show,

    onHide,

    plantilla,

    onSaved

}) => {

    const [

        form,

        setForm

    ] = useState(initialForm);

    const [

        tipos,

        setTipos

    ] = useState([]);

    const [

        guardando,

        setGuardando

    ] = useState(false);

    const [

        error,

        setError

    ] = useState("");

    useEffect(() => {

        if (show) {

            cargarTipos();

        }

    }, [show]);

    useEffect(() => {

        if (plantilla) {

            setForm({

                codigo: plantilla.codigo || "",

                descripcion: plantilla.descripcion || "",

                tipo_id: plantilla.tipo_id || "",

                activo: plantilla.activo ?? true

            });

        }

        else {

            setForm(initialForm);

        }

        setError("");

    }, [

        plantilla,

        show

    ]);

    const cargarTipos = async () => {

        try {

            const data =
                await evaluacionConfiguracionApi.listarTipos();

            setTipos(

                Array.isArray(data)

                    ? data

                    : []

            );

        }

        catch (error) {

            console.error(error);

            setTipos([]);

        }

    };

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

    const validar = () => {

        if (!form.codigo.trim()) {

            setError("Ingrese el código.");

            return false;

        }

        if (!form.descripcion.trim()) {

            setError("Ingrese la descripción.");

            return false;

        }

        if (!form.tipo_id) {

            setError("Seleccione el tipo de evaluación.");

            return false;

        }

        return true;

    };

    const guardar = async () => {

        if (!validar()) {

            return;

        }

        try {

            setGuardando(true);

            setError("");

            const payload = {

                codigo: form.codigo.trim(),

                descripcion: form.descripcion.trim(),

                tipo_id: Number(form.tipo_id),

                activo: form.activo

            };

            if (plantilla) {

                await evaluacionConfiguracionApi.actualizarPlantilla(

                    plantilla.id,

                    payload

                );

            }

            else {

                await evaluacionConfiguracionApi.crearPlantilla(

                    payload

                );

            }

            if (onSaved) {

                await onSaved();

            }

            onHide();

        }

        catch (error) {

            console.error(error);

            setError(

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

            backdrop="static"

            size="lg"

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

                {

                    error && (

                        <Alert variant="danger">

                            {error}

                        </Alert>

                    )

                }

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

                                maxLength={30}

                            />

                        </Form.Group>

                    </Col>

                    <Col md={8}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Descripción

                            </Form.Label>

                            <Form.Control

                                name="descripcion"

                                value={form.descripcion}

                                onChange={handleChange}

                                maxLength={150}

                            />

                        </Form.Group>

                    </Col>

                </Row>

                <Form.Group className="mb-3">

                    <Form.Label>

                        Tipo de Evaluación

                    </Form.Label>

                    <Form.Select

                        className="form-control my-input"

                        name="tipo_id"

                        value={form.tipo_id}

                        onChange={handleChange}

                    >

                        <option value="">

                            Seleccione...

                        </option>

                        {

                            tipos.map(tipo => (

                                <option

                                    key={tipo.id}

                                    value={tipo.id}

                                >

                                    {

                                        tipo.descripcion ||

                                        tipo.nombre ||

                                        tipo.codigo

                                    }

                                </option>

                            ))

                        }

                    </Form.Select>

                </Form.Group>

                <Form.Check

                    type="switch"

                    label="Plantilla activa"

                    name="activo"

                    checked={form.activo}

                    onChange={handleChange}

                />

            </Modal.Body>

            <Modal.Footer>

                <Button

                    variant="secondary"

                    onClick={onHide}

                    disabled={guardando}

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