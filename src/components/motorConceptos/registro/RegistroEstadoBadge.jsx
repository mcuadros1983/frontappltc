import React from "react";
import { Badge } from "react-bootstrap";

const variants = {
    BORRADOR:
        "secondary",
    PENDIENTE:
        "warning",
    VIGENTE:
        "success",
    VENCIDO:
        "danger",
    ANULADO:
        "dark",
};

const RegistroEstadoBadge = ({
    estado,
}) => (
    <Badge
        bg={
            variants[estado] ||
            "secondary"
        }
    >
        {estado || "SIN ESTADO"}
    </Badge>
);

export default RegistroEstadoBadge;
