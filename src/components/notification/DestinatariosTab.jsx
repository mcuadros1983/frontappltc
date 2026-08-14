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

import DestinatarioFormModal from "./DestinatarioFormModal";

const DestinatariosTab = () => {

    const [

        destinatarios,

        setDestinatarios

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

        destinatarioSeleccionado,

        setDestinatarioSeleccionado

    ] = useState(null);

    const cargarDestinatarios = async () => {

        try {

            setLoading(true);

            const data =
                await notificationApi.listarDestinatarios();

            setDestinatarios(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargarDestinatarios();

    }, []);

    const nuevo = () => {

        setDestinatarioSeleccionado(null);

        setMostrarFormulario(true);

    };

    const editar = (item) => {

        setDestinatarioSeleccionado(item);

        setMostrarFormulario(true);

    };

    const eliminar = async (id) => {

        if (

            !window.confirm(

                "¿Desea eliminar el destinatario?"

            )

        ) {

            return;

        }

        try {

            await notificationApi.eliminarDestinatario(id);

            cargarDestinatarios();

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

                    Destinatarios

                </span>

                <Button

                    onClick={nuevo}

                >

                    Nuevo Destinatario

                </Button>

            </Card.Header>

            <Card.Body>

                <Table

                    hover

                    responsive

                >

                    <thead>

                        <tr>

                            <th>Evento</th>

                            <th>Nombre</th>

                            <th>Email</th>

                            <th>Estado</th>

                            <th width="180">

                                Acciones

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            destinatarios.length === 0 &&

                            !loading &&

                            (

                                <tr>

                                    <td

                                        colSpan={5}

                                        className="text-center"

                                    >

                                        No existen destinatarios.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            destinatarios.map((item) => (

                                <tr key={item.id}>

                                    <td>

                                        {

                                            item.evento?.nombre

                                        }

                                    </td>

                                    <td>

                                        {

                                            item.nombre

                                        }

                                    </td>

                                    <td>

                                        {

                                            item.email

                                        }

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

                                                editar(item)

                                            }

                                        >

                                            Editar

                                        </Button>

                                        <Button

                                            size="sm"

                                            variant="danger"

                                            onClick={() =>

                                                eliminar(item.id)

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

            <DestinatarioFormModal

                show={

                    mostrarFormulario

                }

                onHide={() => {

                    setMostrarFormulario(false);

                    setDestinatarioSeleccionado(null);

                }}

                destinatario={

                    destinatarioSeleccionado

                }

                onSaved={

                    cargarDestinatarios

                }

            />

        </Card>

    );

};

export default DestinatariosTab;