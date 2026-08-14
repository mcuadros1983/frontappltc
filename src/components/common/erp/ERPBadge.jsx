import React from "react";
import { Badge } from "react-bootstrap";

const STATUS = {
  ACTIVO: "success",
  INACTIVO: "secondary",
  BORRADOR: "warning",
  PENDIENTE: "warning",
  CONFIRMADO: "success",
  FINALIZADO: "primary",
  ANULADO: "danger",
  ERROR: "danger",
};

const ERPBadge = ({
  status,
  children,
  bg,
  className = "",
  style = {},
}) => {

  const text = children || status || "";

  return (
    <Badge
      bg={bg || STATUS[text] || "secondary"}
      className={className}
      style={style}
    >
      {text}
    </Badge>
  );
};

export default ERPBadge;