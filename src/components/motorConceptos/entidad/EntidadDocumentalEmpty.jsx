import React from "react";

const EntidadDocumentalEmpty = ({

    title = "No hay información",

    message = "No existen conceptos asignados para esta entidad.",

}) => {

    return (

        <div className="text-center py-5">

            <i
                className="fas fa-folder-open fa-3x text-muted mb-3"
            />

            <h5 className="text-muted">

                {title}

            </h5>

            <p className="text-muted mb-0">

                {message}

            </p>

        </div>

    );

};

export default EntidadDocumentalEmpty;