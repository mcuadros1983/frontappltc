import React from "react";

import {
    ERPButton,
    ERPToolbar,
} from "../../common/erp";

const MotorConceptoVencimientosToolbar = ({

    refresh,

    onExport,

}) => {

    return (

        <ERPToolbar

            title="Vencimientos"

            subtitle="Administración de documentos próximos a vencer y vencidos."

        >

            <ERPButton

                icon="refresh"

                variant="secondary"

                onClick={refresh}

            >

                Actualizar

            </ERPButton>

            <ERPButton

                icon="download"

                variant="success"

                onClick={onExport}

            >

                Exportar

            </ERPButton>

        </ERPToolbar>

    );

};

export default MotorConceptoVencimientosToolbar;