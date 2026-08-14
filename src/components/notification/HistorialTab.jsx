import React, {

    useEffect,
    useState

} from "react";

import {

    Badge,
    Button,
    Card,
    Spinner,
    Table

} from "react-bootstrap";

import {

    notificationApi

} from "../../services/notification/notificationApi";

import HistorialDetalleModal from "./HistorialDetalleModal";

const HistorialTab = () => {

    const [

        historial,

        setHistorial

    ] = useState([]);

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        registroSeleccionado,

        setRegistroSeleccionado

    ] = useState(null);

    const [

        mostrarDetalle,

        setMostrarDetalle

    ] = useState(false);

    const cargarHistorial = async () => {

        try {

            setLoading(true);

            const data =

                await notificationApi.listarHistorial();

            setHistorial(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargarHistorial();

    }, []);

    const verDetalle = async (id) => {

        try {

            const data =

                await notificationApi.obtenerHistorial(id);

            setRegistroSeleccionado(data);

            setMostrarDetalle(true);

        }

        catch (error) {

            console.error(error);

        }

    };

    const badgeEstado = (estado) => {

        switch (estado) {

            case "ENVIADO":

                return "success";

            case "ERROR":

                return "danger";

            case "PENDIENTE":

                return "warning";

            case "CANCELADO":

                return "secondary";

            default:

                return "secondary";

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

        <Card>

            <Card.Header>

                Historial de Notificaciones

            </Card.Header>

            <Card.Body>

                <Table

                    hover

                    striped

                    responsive

                >

                    <thead>

                        <tr>

                            <th>Fecha</th>

                            <th>Tipo</th>

                            <th>Canal</th>

                            <th>Destinatario</th>

                            <th>Estado</th>

                            <th width="120">

                                Acciones

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            historial.length === 0 &&

                            (

                                <tr>

                                    <td

                                        colSpan={6}

                                        className="text-center"

                                    >

                                        No existen registros.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            historial.map((item) => (

                                <tr key={item.id}>

                                    <td>

                                        {

                                            item.created_at

                                                ? new Date(

                                                    item.created_at

                                                ).toLocaleString()

                                                : ""

                                        }

                                    </td>

                                    <td>

                                        {item.tipo}

                                    </td>

                                    <td>

                                        {item.canal}

                                    </td>

                                    <td>

                                        {

                                            item.destinatario

                                        }

                                    </td>

                                    <td>

                                        <Badge

                                            bg={

                                                badgeEstado(

                                                    item.estado

                                                )

                                            }

                                        >

                                            {

                                                item.estado

                                            }

                                        </Badge>

                                    </td>

                                    <td>

                                        <Button

                                            size="sm"

                                            variant="primary"

                                            onClick={() =>

                                                verDetalle(

                                                    item.id

                                                )

                                            }

                                        >

                                            Ver

                                        </Button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </Table>

            </Card.Body>

            <HistorialDetalleModal

                show={

                    mostrarDetalle

                }

                onHide={() => {

                    setMostrarDetalle(false);

                    setRegistroSeleccionado(null);

                }}

                registro={

                    registroSeleccionado

                }

            />

        </Card>

    );

};

export default HistorialTab;