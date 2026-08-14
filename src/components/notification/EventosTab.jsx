import React, {

    useEffect,
    useState

} from "react";

import {

    Button,
    Card,
    Table,
    Badge

} from "react-bootstrap";

import {

    notificationApi

} from "../../services/notification/notificationApi";

import EventoFormModal from "./EventoFormModal";

const EventosTab = () => {

    const [

        eventos,

        setEventos

    ] = useState([]);

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        mostrarFormulario,

        setMostrarFormulario

    ] = useState(false);

    const [

        eventoSeleccionado,

        setEventoSeleccionado

    ] = useState(null);

    const cargarEventos = async () => {

        try {

            setLoading(true);

            const data =
                await notificationApi.listarEventos();

            setEventos(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargarEventos();

    }, []);

    const nuevoEvento = () => {

        setEventoSeleccionado(null);

        setMostrarFormulario(true);

    };

    const editarEvento = (item) => {

        setEventoSeleccionado(item);

        setMostrarFormulario(true);

    };

    const eliminarEvento = async (id) => {

        if (

            !window.confirm(

                "¿Desea eliminar el evento?"

            )

        ) {

            return;

        }

        try {

            await notificationApi.eliminarEvento(id);

            cargarEventos();

        }

        catch (error) {

            console.error(error);

        }

    };

    return (

        <Card>

            <Card.Header
                className="d-flex justify-content-between align-items-center"
            >

                <span>

                    Eventos de Notificación

                </span>

                <Button
                    onClick={nuevoEvento}
                >

                    Nuevo Evento

                </Button>

            </Card.Header>

            <Card.Body>

                <Table

                    hover

                    responsive

                >

                    <thead>

                        <tr>

                            <th>Código</th>

                            <th>Nombre</th>

                            <th>Categoría</th>

                            <th>Estado</th>

                            <th width="180">

                                Acciones

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            eventos.length === 0 &&

                            !loading &&

                            (

                                <tr>

                                    <td

                                        colSpan={5}

                                        className="text-center"

                                    >

                                        No existen eventos.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            eventos.map((item) => (

                                <tr key={item.id}>

                                    <td>

                                        {item.codigo}

                                    </td>

                                    <td>

                                        {item.nombre}

                                    </td>

                                    <td>

                                        {item.categoria}

                                    </td>

                                    <td>

                                        <Badge

                                            bg={

                                                item.activo

                                                    ? "success"

                                                    : "secondary"

                                            }

                                        >

                                            {

                                                item.activo

                                                    ? "Activo"

                                                    : "Inactivo"

                                            }

                                        </Badge>

                                    </td>

                                    <td>

                                        <Button

                                            size="sm"

                                            variant="warning"

                                            className="me-2"

                                            onClick={() =>

                                                editarEvento(item)

                                            }

                                        >

                                            Editar

                                        </Button>

                                        <Button

                                            size="sm"

                                            variant="danger"

                                            onClick={() =>

                                                eliminarEvento(item.id)

                                            }

                                        >

                                            Eliminar

                                        </Button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </Table>

            </Card.Body>

            <EventoFormModal

                show={

                    mostrarFormulario

                }

                onHide={() => {

                    setMostrarFormulario(false);

                    setEventoSeleccionado(null);

                }}

                evento={

                    eventoSeleccionado

                }

                onSaved={

                    cargarEventos

                }

            />

        </Card>

    );

};

export default EventosTab;