import React from "react";

import {
    ERPButton,
} from "../../common/erp";

const MotorConceptoVencimientosActions = ({

    row,

    onView,

    onLegajo,

    onRenew,

    onDownload,

}) => {

    return (

        <div className="d-flex justify-content-end gap-2">

            <ERPButton

                size="sm"

                variant="info"

                icon="visibility"

                title="Ver documento"

                onClick={() => onView?.(row)}

            />

            <ERPButton

                size="sm"

                variant="secondary"

                icon="folder"

                title="Ir al legajo"

                onClick={() => onLegajo?.(row)}

            />

            <ERPButton

                size="sm"

                variant="warning"

                icon="autorenew"

                title="Renovar documento"

                onClick={() => onRenew?.(row)}

            />

            <ERPButton

                size="sm"

                variant="success"

                icon="download"

                title="Descargar"

                onClick={() => onDownload?.(row)}

            />

        </div>

    );

};

export default MotorConceptoVencimientosActions;