import React, { useEffect, useState } from "react";

import {
    Alert,
    Button,
    Card,
    Col,
    Form,
    Row,
    Spinner
} from "react-bootstrap";

import {
    evaluacionConfiguracionApi
} from "../../services/evaluacion/configuracionApi";

const ConfiguracionNotificacionesTab = () => {

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const [datos, setDatos] = useState({

        mail_1: "",
        mail_2: "",
        mail_3: "",

        alerta_roja: true,
        bandera_critica: true,
        caida_rendimiento: true,
        resumen_semanal: true,
        resumen_mensual: true,
        recordatorio_supervisiones: true,
        baja_participacion: true,
        dni_no_reconocido: true,
        mejora_rendimiento: true,
        competencia_critica: true,
        autoevaluacion_desalineada: true,

        caida_sostenida: true,
        mejora_sostenida: true,

        tendencia_negativa: true,
        tendencia_positiva: true,
        estabilidad: true,

        consenso_evaluacion: true,

        riesgo_bajo: true,
        riesgo_medio: true,
        riesgo_alto: true,
        riesgo_critico: true,

    });

    useEffect(() => {

        cargar();

    }, []);

    const cargar = async () => {

        try {

            setLoading(true);
            setError("");

            const config =
                await evaluacionConfiguracionApi
                    .obtenerConfiguracionNotificaciones();

            setDatos({

                mail_1: config.mail_1 ?? "",

                mail_2: config.mail_2 ?? "",

                mail_3: config.mail_3 ?? "",

                alerta_roja: config.alerta_roja ?? true,

                bandera_critica: config.bandera_critica ?? true,

                caida_rendimiento: config.caida_rendimiento ?? true,

                resumen_semanal: config.resumen_semanal ?? true,

                resumen_mensual: config.resumen_mensual ?? true,

                recordatorio_supervisiones:
                    config.recordatorio_supervisiones ?? true,

                baja_participacion:
                    config.baja_participacion ?? true,

                dni_no_reconocido:
                    config.dni_no_reconocido ?? true,

                mejora_rendimiento:
                    config.mejora_rendimiento ?? true,

                competencia_critica:
                    config.competencia_critica ?? true,

                autoevaluacion_desalineada:
                    config.autoevaluacion_desalineada ?? true,

                caida_sostenida:
                    config.caida_sostenida ?? true,

                mejora_sostenida:
                    config.mejora_sostenida ?? true,

                tendencia_negativa:
                    config.tendencia_negativa ?? true,

                tendencia_positiva:
                    config.tendencia_positiva ?? true,

                estabilidad:
                    config.estabilidad ?? true,

                consenso_evaluacion:
                    config.consenso_evaluacion ?? true,

                riesgo_bajo:
                    config.riesgo_bajo ?? true,

                riesgo_medio:
                    config.riesgo_medio ?? true,

                riesgo_alto:
                    config.riesgo_alto ?? true,

                riesgo_critico:
                    config.riesgo_critico ?? true,

            });

        } catch (err) {

            console.error(err);

            setError(
                "No fue posible cargar la configuración."
            );

        } finally {

            setLoading(false);

        }

    };

    const guardar = async () => {

        try {

            setSaving(true);
            setMensaje("");
            setError("");

            const config =
                await evaluacionConfiguracionApi
                    .guardarConfiguracionNotificaciones(
                        datos
                    );

            setDatos(config);

            setMensaje(
                "Configuración guardada correctamente."
            );

        } catch (err) {

            console.error(err);

            setError(
                "No fue posible guardar la configuración."
            );

        } finally {

            setSaving(false);

        }

    };

    const enviarMailPrueba = async () => {

        try {

            setMensaje("");
            setError("");

            await evaluacionConfiguracionApi
                .enviarMailPrueba();

            setMensaje(
                "Correo de prueba enviado correctamente."
            );

        } catch (err) {

            console.error(err);

            setError(
                "No fue posible enviar el correo de prueba."
            );

        }

    };

    const handleChange = ({ target }) => {

        const {

            name,
            value,
            checked,
            type

        } = target;

        setDatos(prev => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };

    if (loading) {

        return (

            <div className="text-center py-5">

                <Spinner animation="border" />

            </div>

        );

    }

    return (

        <Card>

            <Card.Body>

                {mensaje && (

                    <Alert
                        variant="success"
                    >
                        {mensaje}
                    </Alert>

                )}

                {error && (

                    <Alert
                        variant="danger"
                    >
                        {error}
                    </Alert>

                )}

                <h5 className="mb-4">

                    Destinatarios

                </h5>

                <Row>

                    <Col md={4}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Responsable 1

                            </Form.Label>

                            <Form.Control

                                type="email"

                                name="mail_1"

                                value={datos.mail_1}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                    <Col md={4}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Responsable 2

                            </Form.Label>

                            <Form.Control

                                type="email"

                                name="mail_2"

                                value={datos.mail_2}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                    <Col md={4}>

                        <Form.Group className="mb-3">

                            <Form.Label>

                                Responsable 3

                            </Form.Label>

                            <Form.Control

                                type="email"

                                name="mail_3"

                                value={datos.mail_3}

                                onChange={handleChange}

                            />

                        </Form.Group>

                    </Col>

                </Row>

                <hr />

                <h5 className="mb-3">

                    Eventos que generan notificaciones

                </h5>

                <Form.Check

                    className="mb-2"

                    label="Alerta roja"

                    name="alerta_roja"

                    checked={datos.alerta_roja}

                    onChange={handleChange}

                />

                <Form.Check

                    className="mb-2"

                    label="Bandera crítica"

                    name="bandera_critica"

                    checked={datos.bandera_critica}

                    onChange={handleChange}

                />

                <Form.Check

                    className="mb-2"

                    label="Caída de rendimiento"

                    name="caida_rendimiento"

                    checked={datos.caida_rendimiento}

                    onChange={handleChange}

                />

                <Form.Check

                    className="mb-2"

                    label="Resumen semanal"

                    name="resumen_semanal"

                    checked={datos.resumen_semanal}

                    onChange={handleChange}

                />

                <Form.Check

                    className="mb-2"

                    label="Resumen mensual"

                    name="resumen_mensual"

                    checked={datos.resumen_mensual}

                    onChange={handleChange}

                />

                <Form.Check

                    className="mb-2"

                    label="Recordatorio de supervisiones"

                    name="recordatorio_supervisiones"

                    checked={datos.recordatorio_supervisiones}

                    onChange={handleChange}

                />

                <Form.Check

                    className="mb-2"

                    label="Baja participación"

                    name="baja_participacion"

                    checked={datos.baja_participacion}

                    onChange={handleChange}

                />

                <Form.Check

                    className="mb-4"

                    label="DNI no reconocido"

                    name="dni_no_reconocido"

                    checked={datos.dni_no_reconocido}

                    onChange={handleChange}

                />

                <div className="d-flex gap-2">

                    <Button

                        variant="primary"

                        onClick={guardar}

                        disabled={saving}

                    >

                        {saving
                            ? "Guardando..."
                            : "Guardar"}

                    </Button>

                    <Button

                        variant="outline-secondary"

                        onClick={enviarMailPrueba}

                    >

                        Enviar correo de prueba

                    </Button>

                </div>

            </Card.Body>

        </Card>

    );

};

export default ConfiguracionNotificacionesTab;