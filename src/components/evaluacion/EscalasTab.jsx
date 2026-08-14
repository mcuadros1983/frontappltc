import React, {

    useState

} from "react";

import {

    Card,
    Table,
    Button,
    Badge

} from "react-bootstrap";

import {

    FiPlus,
    FiEdit2,
    FiTrash2

} from "react-icons/fi";

import {

    evaluacionEscalaApi

} from "../../../services/evaluacion/evaluacionEscalaApi";

import EscalaFormModal
    from "./EscalaFormModal";

const EscalasTab = ({

    escalas,

    recargar

}) => {

    const [

        escalaSeleccionada,

        setEscalaSeleccionada

    ] = useState(null);

    const [

        mostrarFormulario,

        setMostrarFormulario

    ] = useState(false);

    const nuevaEscala = () => {

        setEscalaSeleccionada(null);

        setMostrarFormulario(true);

    };

    const editarEscala = (item) => {

        setEscalaSeleccionada(item);

        setMostrarFormulario(true);

    };

    const eliminarEscala = async (item) => {

        if (

            !window.confirm(

                `¿Eliminar la escala "${item.nombre}"?`

            )

        ) {

            return;

        }

        try {

            await evaluacionEscalaApi.eliminar(

                item.id

            );

            recargar();

        }

        catch (error) {

            console.error(error);

        }

    };

    const obtenerColor = (color) => {

        switch (color) {

            case "success":

                return "success";

            case "danger":

                return "danger";

            case "warning":

                return "warning";

            case "info":

                return "info";

            case "primary":

                return "primary";

            default:

                return "secondary";

        }

    };

    return (

        <Card className="border-0">

            <Card.Body>

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <h5 className="mb-0">

                        Escalas de Evaluación

                    </h5>

                    <Button

                        variant="primary"

                        onClick={nuevaEscala}

                    >

                        <FiPlus className="me-2" />

                        Nueva Escala

                    </Button>

                </div>

                <Table

                    responsive

                    striped

                    bordered

                    hover

                >

                    <thead>

                        <tr>

                            <th>Código</th>

                            <th>Nombre</th>

                            <th>Desde</th>

                            <th>Hasta</th>

                            <th>Color</th>

                            <th>Activa</th>

                            <th width="140">

                                Acciones

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            escalas.length === 0 && (

                                <tr>

                                    <td

                                        colSpan={7}

                                        className="text-center"

                                    >

                                        No existen escalas registradas.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            escalas.map(item => (

                                <tr

                                    key={item.id}

                                >

                                    <td>

                                        {item.codigo}

                                    </td>

                                    <td>

                                        {item.nombre}

                                    </td>

                                    <td>

                                        {

                                            Number(

                                                item.valor_desde

                                            ).toFixed(2)

                                        }

                                        %

                                    </td>

                                    <td>

                                        {

                                            Number(

                                                item.valor_hasta

                                            ).toFixed(2)

                                        }

                                        %

                                    </td>

                                    <td>

                                        <Badge

                                            bg={

                                                obtenerColor(

                                                    item.color

                                                )

                                            }

                                        >

                                            {item.color}

                                        </Badge>

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

                                                    ? "Sí"

                                                    : "No"

                                            }

                                        </Badge>

                                    </td>

                                    <td>

                                        <Button

                                            size="sm"

                                            variant="warning"

                                            className="me-2"

                                            onClick={() =>

                                                editarEscala(

                                                    item

                                                )

                                            }

                                        >

                                            <FiEdit2 />

                                        </Button>

                                        <Button

                                            size="sm"

                                            variant="danger"

                                            onClick={() =>

                                                eliminarEscala(

                                                    item

                                                )

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

                <EscalaFormModal

                    show={mostrarFormulario}

                    onHide={() => {

                        setMostrarFormulario(false);

                        setEscalaSeleccionada(null);

                    }}

                    escala={escalaSeleccionada}

                    onSaved={recargar}

                />

            </Card.Body>

        </Card>



    );

};

export default EscalasTab;