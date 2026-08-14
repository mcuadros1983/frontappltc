import React from "react";

import {
    ERPButton,
    ERPCard,
    ERPEmpty,
} from "../../common/erp";

const MotorConceptoVencimientosEmpty = ({

    onRefresh,

    onClearFilters,

}) => {

    return (

        <ERPCard>

            <ERPEmpty

                title="No se encontraron vencimientos"

                description="No existen documentos que coincidan con los filtros seleccionados."

            />

            <div className="d-flex justify-content-center gap-2 mt-4">

                <ERPButton

                    variant="secondary"

                    icon="filter_alt_off"

                    onClick={onClearFilters}

                >

                    Limpiar filtros

                </ERPButton>

                <ERPButton

                    variant="primary"

                    icon="refresh"

                    onClick={onRefresh}

                >

                    Actualizar

                </ERPButton>

            </div>

        </ERPCard>

    );

};

export default MotorConceptoVencimientosEmpty;