import React from "react";
import { Card } from "react-bootstrap";

const colors = {

    primary: "primary",

    success: "success",

    warning: "warning",

    danger: "danger",

    info: "info",

    secondary: "secondary",

    dark: "dark"

};

const ERPKpiCard = ({

    title,

    value,

    subtitle,

    icon,

    color = "primary",

    className = ""

}) => {

    return (

        <Card

            className={`shadow-sm border-0 h-100 ${className}`}

        >

            <Card.Body>

                <div className="d-flex justify-content-between align-items-center">

                    <div>

                        <div

                            className={`text-${colors[color]} fw-semibold text-uppercase small`}

                        >

                            {title}

                        </div>

                        <div

                            className="display-6 fw-bold mt-2"

                        >

                            {value}

                        </div>

                        {

                            subtitle && (

                                <div className="text-muted mt-1">

                                    {subtitle}

                                </div>

                            )

                        }

                    </div>

                    {

                        icon && (

                            <div

                                className={`text-${colors[color]}`}

                                style={{

                                    fontSize: "2.5rem",

                                    opacity: 0.85

                                }}

                            >

                                {icon}

                            </div>

                        )

                    }

                </div>

            </Card.Body>

        </Card>

    );

};

export default ERPKpiCard;