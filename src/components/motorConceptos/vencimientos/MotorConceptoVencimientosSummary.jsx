import React from "react";

import {
    ERPCard,
    ERPKpiCard,
} from "../../common/erp";

const defaultResumen = {

    total: 0,

    vencidos: 0,

    proximos30: 0,

    proximos60: 0,

    proximos90: 0,

};

const MotorConceptoVencimientosSummary = ({

    resumen = defaultResumen,

    loading = false,

}) => {

    return (

        <ERPCard className="mb-4">

            <div className="row g-3">

                <div className="col-xl-2 col-lg-4 col-md-6">

                    <ERPKpiCard

                        title="Total"

                        value={resumen.total}

                        loading={loading}

                    />

                </div>

                <div className="col-xl-2 col-lg-4 col-md-6">

                    <ERPKpiCard

                        title="Vencidos"

                        value={resumen.vencidos}

                        loading={loading}

                        variant="danger"

                    />

                </div>

                <div className="col-xl-2 col-lg-4 col-md-6">

                    <ERPKpiCard

                        title="Próx. 30 días"

                        value={resumen.proximos30}

                        loading={loading}

                        variant="warning"

                    />

                </div>

                <div className="col-xl-2 col-lg-4 col-md-6">

                    <ERPKpiCard

                        title="Próx. 60 días"

                        value={resumen.proximos60}

                        loading={loading}

                        variant="info"

                    />

                </div>

                <div className="col-xl-2 col-lg-4 col-md-6">

                    <ERPKpiCard

                        title="Próx. 90 días"

                        value={resumen.proximos90}

                        loading={loading}

                        variant="primary"

                    />

                </div>

            </div>

        </ERPCard>

    );

};

export default MotorConceptoVencimientosSummary;