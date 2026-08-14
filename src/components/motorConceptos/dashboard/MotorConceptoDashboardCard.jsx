import React from "react";

import {

    Card,

    Button,

    Spinner,

} from "react-bootstrap";

import {
    useNavigate,
} from "react-router-dom";

import useMotorConceptoCumplimiento
from "../../../hooks/useMotorConceptoCumplimiento";

import MotorConceptoDashboardProgress
from "./MotorConceptoDashboardProgress";

import MotorConceptoDashboardResumen
from "./MotorConceptoDashboardResumen";

const MotorConceptoDashboardCard = ({

    entidadTipoId,

    entidadId,

    entidadNombre,

    entidadTipoNombre,

}) => {

    const navigate =
        useNavigate();

    const {

        loading,

        resumen,

    } =
    useMotorConceptoCumplimiento(

        entidadTipoId,

        entidadId

    );

    return (

        <Card
            className="mb-4"
        >

            <Card.Header
                className="d-flex justify-content-between align-items-center"
            >

                <div>

                    <h5
                        className="mb-0"
                    >

                        Cumplimiento documental

                    </h5>

                </div>

                <Button

                    variant="primary"

                    onClick={() =>

                        navigate(

                            `/motor-conceptos/documentos-faltantes/${entidadTipoId}/${entidadId}`,

                            {

                                state: {

                                    entidad_tipo_id:
                                        entidadTipoId,

                                    entidad_id:
                                        entidadId,

                                    entidad_nombre:
                                        entidadNombre,

                                    entidad_tipo_nombre:
                                        entidadTipoNombre,

                                },

                            }

                        )

                    }

                >

                    Ver documentos

                </Button>

            </Card.Header>

            <Card.Body>

                {

                    loading

                        ? (

                            <div
                                className="text-center py-5"
                            >

                                <Spinner />

                            </div>

                        )

                        : (

                            <>

                                <MotorConceptoDashboardProgress

                                    porcentaje={
                                        resumen.porcentaje
                                    }

                                />

                                <MotorConceptoDashboardResumen

                                    resumen={resumen}

                                />

                            </>

                        )

                }

            </Card.Body>

        </Card>

    );

};

export default MotorConceptoDashboardCard;