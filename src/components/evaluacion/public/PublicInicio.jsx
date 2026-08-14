import React from "react";

import {

    Card,
    Button

} from "react-bootstrap";

const PublicInicio = ({

    formulario,

    onComenzar

}) => {

    return (

        <div

            className="container py-4"

            style={{

                maxWidth: 700

            }}

        >

            <Card>

                <Card.Body>

                    <h3>

                        {formulario.tipo.descripcion}

                    </h3>

                    <hr />

                    <h5>

                        {formulario.plantilla.descripcion}

                    </h5>

                    <p>

                        {formulario.observaciones}

                    </p>

                    <p>

                        Vigencia

                    </p>

                    <strong>

                        {

                            formulario.fecha_inicio

                        }

                    </strong>

                    {" - "}

                    <strong>

                        {

                            formulario.fecha_fin

                        }

                    </strong>

                    <div

                        className="mt-4"

                    >

                        <Button

                            size="lg"

                            className="w-100"

                            onClick={onComenzar}

                        >

                            Comenzar Evaluación

                        </Button>

                    </div>

                </Card.Body>

            </Card>

        </div>

    );

};

export default PublicInicio;