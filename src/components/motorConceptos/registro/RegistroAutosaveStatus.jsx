import React from "react";
import { Badge } from "react-bootstrap";

const labels = {
    IDLE:
        "Autoguardado inactivo",
    PENDING:
        "Cambios pendientes",
    SAVING:
        "Guardando...",
    SAVED:
        "Guardado",
    ERROR:
        "Error al guardar",
};

const variants = {
    IDLE:
        "secondary",
    PENDING:
        "warning",
    SAVING:
        "info",
    SAVED:
        "success",
    ERROR:
        "danger",
};

const RegistroAutosaveStatus = ({
    status,
}) => (
    <Badge
        bg={
            variants[status] ||
            "secondary"
        }
    >
        {
            labels[status] ||
            status
        }
    </Badge>
);

export default RegistroAutosaveStatus;
