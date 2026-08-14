import React from "react";

import {
    Spinner,
} from "react-bootstrap";

const EntidadDocumentalLoading = ({

    message = "Cargando documentación..."

}) => {

    return (

        <div className="text-center py-5">

            <Spinner
                animation="border"
            />

            <div className="mt-3 text-muted">

                {message}

            </div>

        </div>

    );

};

export default EntidadDocumentalLoading;