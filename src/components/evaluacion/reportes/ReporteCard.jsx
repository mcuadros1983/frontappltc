import React from "react";
import { ERPCard } from "../../common/erp";

const ReporteCard = ({
    title,
    value,
    subtitle,
    color = "primary"
}) => {

    return (

        <ERPCard className="h-100">

            <div className="text-muted small">

                {title}

            </div>

            <h2
                className={`mt-2 text-${color}`}
            >

                {value}

            </h2>

            {

                subtitle && (

                    <div className="small text-secondary">

                        {subtitle}

                    </div>

                )

            }

        </ERPCard>

    );

};

export default ReporteCard;