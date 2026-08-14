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

import PlantillaFormModal from "./PlantillaFormModal";

const PlantillasTab = () => {

    const [

        plantillas,

        setPlantillas

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

        plantillaSeleccionada,

        setPlantillaSeleccionada

    ] = useState(null);

    const cargarPlantillas = async () => {

        try {

            setLoading(true);

            const data =

                await notificationApi.listarPlantillas();

            setPlantillas(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargarPlantillas();

    }, []);

    const nuevaPlantilla = () => {

        setPlantillaSeleccionada(null);

        setMostrarFormulario(true);

    };

    const editarPlantilla = (item) => {

        setPlantillaSeleccionada(item);

        setMostrarFormulario(true);

    };

    const eliminarPlantilla = async (id) => {

        if (

            !window.confirm(

                "¿Desea eliminar la plantilla?"

            )

        ) {

            return;

        }

        try {

            await notificationApi.eliminarPlantilla(id);

            cargarPlantillas();

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

                    Plantillas de Notificación

                </span>

                <Button

                    onClick={

                        nuevaPlantilla

                    }

                >

                    Nueva Plantilla

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

                            <th>Asunto</th>

                            <th>Estado</th>

                            <th width="180">

                                Acciones

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            plantillas.length === 0 &&

                            !loading &&

                            (

                                <tr>

                                    <td

                                        colSpan={5}

                                        className="text-center"

                                    >

                                        No existen plantillas.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            plantillas.map(

                                (item) => (

                                    <tr

                                        key={

                                            item.id

                                        }

                                    >

                                        <td>

                                            {

                                                item.codigo

                                            }

                                        </td>

                                        <td>

                                            {

                                                item.nombre

                                            }

                                        </td>

                                        <td>

                                            {

                                                item.asunto

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

                                                    editarPlantilla(item)

                                                }

                                            >

                                                Editar

                                            </Button>

                                            <Button

                                                size="sm"

                                                variant="danger"

                                                onClick={() =>

                                                    eliminarPlantilla(item.id)

                                                }

                                            >

                                                Eliminar

                                            </Button>

                                        </td>

                                    </tr>

                                )

                            )

                        }

                    </tbody>

                </Table>

            </Card.Body>

            <PlantillaFormModal

                show={

                    mostrarFormulario

                }

                onHide={() => {

                    setMostrarFormulario(false);

                    setPlantillaSeleccionada(null);

                }}

                plantilla={

                    plantillaSeleccionada

                }

                onSaved={

                    cargarPlantillas

                }

            />

        </Card>

    );

};

export default PlantillasTab;