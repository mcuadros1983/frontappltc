import React from "react";
import { Spinner } from "react-bootstrap";

const ERPLoader = ({
    mensaje = "Cargando...",
    height = "300px"
}) => {

    return (

        <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: height }}
        >

            <Spinner
                animation="border"
                variant="primary"
            />

            {mensaje && (

                <div className="mt-3 text-muted">

                    {mensaje}

                </div>

            )}

        </div>

    );

};

export default ERPLoader;