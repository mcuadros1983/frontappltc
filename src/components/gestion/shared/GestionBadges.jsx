import React from "react";
import { Badge } from "react-bootstrap";

export const EstadoBadge = ({ estado }) => {
  const variants = {
    PENDIENTE: "secondary",
    EN_CURSO: "primary",
    EN_REVISION: "warning",
    FINALIZADA: "success",
    CANCELADA: "dark",
  };
  return <Badge bg={variants[estado] || "secondary"}>{estado || "-"}</Badge>;
};

export const PrioridadBadge = ({ prioridad }) => {
  const variants = {
    BAJA: "secondary",
    NORMAL: "primary",
    ALTA: "warning",
    CRITICA: "danger",
  };
  return <Badge bg={variants[prioridad] || "secondary"}>{prioridad || "-"}</Badge>;
};
