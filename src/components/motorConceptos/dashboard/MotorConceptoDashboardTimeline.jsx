import React, {
    useMemo,
} from "react";

import {
    ERPCard,
    ERPBadge,
} from "../../../components/common/erp";

const STATUS_VARIANTS = {

    CUMPLIDO: "success",

    PROXIMO_A_VENCER: "warning",

    VENCIDO: "danger",

    FALTANTE: "secondary",

};

const STATUS_LABELS = {

    CUMPLIDO: "Cumplido",

    PROXIMO_A_VENCER: "Próximo a vencer",

    VENCIDO: "Vencido",

    FALTANTE: "Faltante",

};

const formatDate = (value) => {

    if (!value) return "-";

    try {

        return new Date(value)
            .toLocaleDateString(
                "es-MX",
                {

                    year: "numeric",

                    month: "2-digit",

                    day: "2-digit",

                }

            );

    } catch {

        return value;

    }

};

const MotorConceptoDashboardTimeline = ({

    documentos = [],

}) => {

    const items = useMemo(() => {

        return [...documentos]

            .sort((a, b) => {

                const fa = new Date(
                    a.fecha_vencimiento || 0
                );

                const fb = new Date(
                    b.fecha_vencimiento || 0
                );

                return fa - fb;

            })

            .slice(0, 8);

    }, [

        documentos,

    ]);

    return (

        <ERPCard
            title="Estado documental"
        >

            {

                items.length === 0 && (

                    <div
                        className="text-center py-5 text-muted"
                    >

                        No existen documentos.

                    </div>

                )

            }

            {

                items.map((item, index) => (

                    <div
                        key={`${item.concepto_id}-${index}`}
                        className="d-flex justify-content-between align-items-start border-bottom py-3"
                    >

                        <div
                            className="flex-grow-1"
                        >

                            <div
                                className="fw-bold"
                            >

                                {item.nombre}

                            </div>

                            {

                                item.codigo && (

                                    <div
                                        className="text-muted small"
                                    >

                                        {item.codigo}

                                    </div>

                                )

                            }

                            <div
                                className="small mt-1"
                            >

                                {

                                    item.fecha_vencimiento

                                        ? `Vence: ${formatDate(item.fecha_vencimiento)}`

                                        : "Sin vencimiento"

                                }

                            </div>

                            {

                                item.fecha_documento && (

                                    <div
                                        className="small text-muted"
                                    >

                                        Documento:

                                        {" "}

                                        {

                                            formatDate(
                                                item.fecha_documento
                                            )

                                        }

                                    </div>

                                )

                            }

                        </div>

                        <div
                            className="text-end"
                        >

                            <ERPBadge

                                color={

                                    STATUS_VARIANTS[
                                        item.estado
                                    ] || "secondary"

                                }

                            >

                                {

                                    STATUS_LABELS[
                                        item.estado
                                    ] || item.estado

                                }

                            </ERPBadge>

                            {

                                item.dias_restantes !== undefined &&

                                item.dias_restantes !== null && (

                                    <div
                                        className="small mt-2 text-muted"
                                    >

                                        {

                                            item.dias_restantes >= 0

                                                ? `${item.dias_restantes} días`

                                                : `${Math.abs(item.dias_restantes)} días vencido`

                                        }

                                    </div>

                                )

                            }

                        </div>

                    </div>

                ))

            }

        </ERPCard>

    );

};

export default React.memo(
    MotorConceptoDashboardTimeline
);