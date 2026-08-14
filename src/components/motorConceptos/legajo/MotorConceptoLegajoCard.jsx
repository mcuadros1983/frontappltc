import React from "react";

import {
    Card,
} from "react-bootstrap";

const MotorConceptoLegajoCard =
    ({
        title,
        value = 0,
        icon,
        textClassName = "",
        loading = false,
    }) => (
        <Card className="h-100 shadow-sm border-0">
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between gap-3">
                    <div>
                        <div className="text-muted small mb-1">
                            {title}
                        </div>

                        <div
                            className={
                                `fs-3 fw-bold ${textClassName}`
                                    .trim()
                            }
                        >
                            {loading
                                ? "-"
                                : value}
                        </div>
                    </div>

                    {icon && (
                        <div
                            className={
                                `fs-2 ${textClassName}`
                                    .trim()
                            }
                        >
                            <i
                                className={
                                    icon
                                }
                            />
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );

export default MotorConceptoLegajoCard;