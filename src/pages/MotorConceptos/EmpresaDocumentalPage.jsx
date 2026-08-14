import React from "react";

import {
    useLocation,
} from "react-router-dom";

import EntidadDocumentalPage
    from "./EntidadDocumentalPage";

const EmpresaDocumentalPage = () => {

    const location =
        useLocation();

    const state =
        location.state || {};

    return (

        <EntidadDocumentalPage

            entidadTipoId={
                state.entidad_tipo_id
            }

            entidadId={
                state.entidad_id
            }

            entidadNombre={
                state.entidad_nombre
            }

            entidadTipoNombre={
                state.entidad_tipo_nombre ||
                "Empresa"
            }

        />

    );

};

export default EmpresaDocumentalPage;