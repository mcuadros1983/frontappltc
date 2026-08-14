import React from "react";

import {
    ERPCard,
    ERPButton,
    ERPEmpty,
} from "../../../components/common/erp";

const MotorConceptoDashboardEmpty = ({

    entidadNombre,

    onNuevo,

    onActualizar,

}) => {

    return (

        <ERPCard>

            <ERPEmpty

                title="No existe información para mostrar"

                description={

                    entidadNombre

                        ? `El legajo de "${entidadNombre}" aún no tiene documentos registrados.`

                        : "No existen documentos registrados para esta entidad."

                }

            />

            <div
                className="d-flex justify-content-center flex-wrap gap-2 mt-4"
            >

                {

                    onNuevo && (

                        <ERPButton

                            color="primary"

                            icon="add"

                            onClick={onNuevo}

                        >

                            Registrar documento

                        </ERPButton>

                    )

                }

                {

                    onActualizar && (

                        <ERPButton

                            color="secondary"

                            icon="refresh"

                            onClick={onActualizar}

                        >

                            Actualizar

                        </ERPButton>

                    )

                }

            </div>

        </ERPCard>

    );

};

export default React.memo(
    MotorConceptoDashboardEmpty
);