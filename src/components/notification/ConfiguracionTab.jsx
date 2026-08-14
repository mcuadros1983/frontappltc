import React, {

    useEffect,
    useState

} from "react";

import {

    Row,
    Col,
    Card,
    Button,
    Alert,
    Spinner

} from "react-bootstrap";

import ConfiguracionForm from "./ConfiguracionForm";

import {

    notificationApi

} from "../../services/notification/notificationApi";

const ConfiguracionTab = () => {

    const [

        configuracion,

        setConfiguracion

    ] = useState(null);

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        saving,

        setSaving

    ] = useState(false);

    const [

        testing,

        setTesting

    ] = useState(false);

    const [

        mensaje,

        setMensaje

    ] = useState(null);

    const cargarConfiguracion = async () => {

        setLoading(true);

        setMensaje(null);

        try {

            const data =

                await notificationApi.obtenerConfiguracion();

            setConfiguracion(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargarConfiguracion();

    }, []);

    const guardar = async (formulario) => {

        try {

            setSaving(true);

            setMensaje(null);

            const response =

                await notificationApi.guardarConfiguracion(

                    formulario

                );

            setConfiguracion(

                response.configuracion

            );

            setMensaje({

                variant: "success",

                text:

                    "Configuración guardada correctamente."

            });

        }

        catch (error) {

            console.error(error);

            setMensaje({

                variant: "danger",

                text:

                    "No fue posible guardar la configuración."

            });

        }

        finally {

            setSaving(false);

        }

    };

    const probarConexion = async () => {

        try {

            setTesting(true);

            setMensaje(null);

            const response =

                await notificationApi.probarConexion();

            setMensaje({

                variant:

                    response.ok

                        ? "success"

                        : "danger",

                text:

                    response.message

            });

        }

        catch (error) {

            console.error(error);

            setMensaje({

                variant: "danger",

                text:

                    "No fue posible conectar con el servidor SMTP."

            });

        }

        finally {

            setTesting(false);

        }

    };

    if (loading) {

        return (

            <div className="text-center py-5">

                <Spinner animation="border" />

            </div>

        );

    }

    return (

        <Row>

            <Col lg={8}>

                <Card>

                    <Card.Body>

                        {

                            mensaje && (

                                <Alert

                                    variant={

                                        mensaje.variant

                                    }

                                >

                                    {

                                        mensaje.text

                                    }

                                </Alert>

                            )

                        }

                        <ConfiguracionForm

                            configuracion={

                                configuracion

                            }

                            onSubmit={

                                guardar

                            }

                            saving={

                                saving

                            }

                        />

                    </Card.Body>

                </Card>

            </Col>

            <Col lg={4}>

                <Card>

                    <Card.Header>

                        Herramientas

                    </Card.Header>

                    <Card.Body>

                        <Button

                            variant="primary"

                            className="w-100"

                            onClick={

                                probarConexion

                            }

                            disabled={

                                testing

                            }

                        >

                            {

                                testing

                                    ? "Probando..."

                                    : "Probar conexión SMTP"

                            }

                        </Button>

                    </Card.Body>

                </Card>

            </Col>

        </Row>

    );

};

export default ConfiguracionTab;