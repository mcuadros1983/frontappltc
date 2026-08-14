import React, {

    useEffect,
    useState,

} from "react";

import { useNavigate } from "react-router-dom";

import {

    Card,
    Table,
    Button,
    Badge

} from "react-bootstrap";

import {

    FiPlus,
    FiEdit2,
    FiTrash2,
    FiList

} from "react-icons/fi";

// import { evaluacionPlantillaApi } from "../../services/evaluacion/evaluacionPlantillaApi";

import { evaluacionConfiguracionApi }
    from "../../services/evaluacion/configuracionApi";

import PlantillaFormModal from "./PlantillaFormModal";

const PlantillasTab = () => {

    const [

        items,

        setItems

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

    const navigate = useNavigate();



    useEffect(() => {

        cargarPlantillas();

    }, []);

    const abrirDetalle = (item) => {

        navigate(

            `/evaluacion/plantillas/${item.id}/detalle`

        );

    };

    const cargarPlantillas = async () => {

        try {

            setLoading(true);

            const data =
                await evaluacionConfiguracionApi.listarPlantillas();

            setItems(

                Array.isArray(data)

                    ? data

                    : []

            );

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    const nuevaPlantilla = () => {

        setPlantillaSeleccionada(null);

        setMostrarFormulario(true);

    };

    const editarPlantilla = (item) => {

        setPlantillaSeleccionada(item);

        setMostrarFormulario(true);

    };

    const eliminarPlantilla = async (item) => {

        if (

            !window.confirm(

                `¿Eliminar la plantilla "${item.descripcion}"?`

            )

        ) {

            return;

        }

        try {

            await evaluacionConfiguracionApi.eliminarPlantilla(

                item.id

            );

            cargarPlantillas();

        }

        catch (error) {

            console.error(error);

        }

    };

    return (

        <Card className="border-0">

            <Card.Body>

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <h5 className="mb-0">

                        Plantillas de Evaluación

                    </h5>

                    <Button

                        variant="primary"

                        onClick={nuevaPlantilla}

                    >

                        <FiPlus className="me-2" />

                        Nueva Plantilla

                    </Button>

                </div>

                <Table

                    responsive

                    bordered

                    hover

                    striped

                >

                    <thead>

                        <tr>

                            <th>Código</th>

                            <th>Nombre</th>

                            <th>Tipo</th>

                            <th>Estado</th>

                            <th width="140">

                                Acciones

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            !loading &&

                            items.length === 0 && (

                                <tr>

                                    <td

                                        colSpan={5}

                                        className="text-center"

                                    >

                                        No existen plantillas registradas.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            items.map(item => (

                                <tr

                                    key={item.id}

                                >

                                    <td>

                                        {item.codigo}

                                    </td>

                                    <td>

                                        {item.descripcion}

                                    </td>

                                    <td>

                                        {

                                            item.tipo?.descripcion ||

                                            "-"

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
                                                    ? "ACTIVA"
                                                    : "INACTIVA"
                                            }
                                        </Badge>

                                    </td>

                                    <td>

                                        <Button

                                            size="sm"

                                            variant="info"

                                            className="me-2"

                                            onClick={() => abrirDetalle(item)}

                                        >

                                            <FiList />

                                        </Button>

                                        <Button

                                            size="sm"

                                            variant="warning"

                                            className="me-2"

                                            onClick={() =>

                                                editarPlantilla(item)

                                            }

                                        >

                                            <FiEdit2 />

                                        </Button>

                                        <Button

                                            size="sm"

                                            variant="danger"

                                            onClick={() =>

                                                eliminarPlantilla(item)

                                            }

                                        >

                                            <FiTrash2 />

                                        </Button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </Table>

                <PlantillaFormModal

                    show={mostrarFormulario}

                    onHide={() => {

                        setMostrarFormulario(false);

                        setPlantillaSeleccionada(null);

                    }}

                    plantilla={plantillaSeleccionada}

                    onSaved={cargarPlantillas}

                />

            </Card.Body>

        </Card>

    );

};

export default PlantillasTab;