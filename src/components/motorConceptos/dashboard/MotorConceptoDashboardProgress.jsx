import React from "react";

import {
    ProgressBar,
} from "react-bootstrap";

const MotorConceptoDashboardProgress = ({
    porcentaje = 0,
}) => {

    let variant = "success";

    if (porcentaje < 60)
        variant = "danger";

    else if (porcentaje < 80)
        variant = "warning";

    return (

        <>

            <div
                className="d-flex justify-content-between mb-2"
            >

                <strong>

                    Cumplimiento

                </strong>

                <strong>

                    {porcentaje}%

                </strong>

            </div>

            <ProgressBar

                now={porcentaje}

                variant={variant}

                animated

            />

        </>

    );

};

export default MotorConceptoDashboardProgress;