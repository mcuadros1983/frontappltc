import React from "react";

import {

    Alert,

    Card

} from "react-bootstrap";

const DashboardAlertas = ({

    indicadores

}) => {

    if (!indicadores) {

        return null;

    }

    const alertas = [];

    /*=========================================
    SIN EVALUACIONES
    =========================================*/

    if (

        Number(

            indicadores.evaluaciones

        ) === 0

    ) {

        alertas.push({

            variant: "secondary",

            titulo: "Sin campañas",

            mensaje:

                "No existen campañas de evaluación registradas."

        });

    }

    /*=========================================
    SIN RESPUESTAS
    =========================================*/

    if (

        Number(

            indicadores.finalizadas

        ) === 0

    ) {

        alertas.push({

            variant: "warning",

            titulo: "Sin respuestas",

            mensaje:

                "Todavía no existen evaluaciones finalizadas."

        });

    }

    /*=========================================
    MUCHAS PENDIENTES
    =========================================*/

    if (

        Number(

            indicadores.pendientes

        ) >

        Number(

            indicadores.finalizadas

        )

    ) {

        alertas.push({

            variant: "warning",

            titulo: "Pendientes",

            mensaje:

                "Existen más evaluaciones pendientes que finalizadas."

        });

    }

    /*=========================================
    PROMEDIO BAJO
    =========================================*/

    if (

        Number(

            indicadores.promedio

        ) < 70 &&

        Number(

            indicadores.finalizadas

        ) > 0

    ) {

        alertas.push({

            variant: "danger",

            titulo: "Promedio bajo",

            mensaje:

                "El promedio general de las evaluaciones es inferior al 70%."

        });

    }

    /*=========================================
    TODO OK
    =========================================*/

    if (

        alertas.length === 0

    ) {

        alertas.push({

            variant: "success",

            titulo: "Excelente",

            mensaje:

                "No existen alertas para mostrar."

        });

    }

    return (

        <Card className="mt-4">

            <Card.Header>

                Alertas

            </Card.Header>

            <Card.Body>

                {

                    alertas.map(

                        (

                            alerta,

                            index

                        ) => (

                            <Alert

                                key={index}

                                variant={

                                    alerta.variant

                                }

                                className="mb-2"

                            >

                                <strong>

                                    {

                                        alerta.titulo

                                    }

                                </strong>

                                <br />

                                {

                                    alerta.mensaje

                                }

                            </Alert>

                        )

                    )

                }

            </Card.Body>

        </Card>

    );

};

export default DashboardAlertas;