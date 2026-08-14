import React from "react";
import { Button } from "react-bootstrap";
import {
  FiPlus,
  FiSave,
  FiEdit2,
  FiTrash2,
  FiX,
  FiArrowLeft,
  FiRefreshCw,
  FiEye
} from "react-icons/fi";
import "./erp.css";

const TYPES = {

  new: {
    label: "Nuevo",
    variant: "primary",
    icon: <FiPlus />,
  },

  save: {
    label: "Guardar",
    variant: "success",
    icon: <FiSave />,
  },

  edit: {
    label: "Editar",
    variant: "outline-primary",
    icon: <FiEdit2 />,
  },

  view: {
    label: "Ver",
    variant: "outline-primary",
    icon: <FiEye />,
  },

  delete: {
    label: "Eliminar",
    variant: "outline-danger",
    icon: <FiTrash2 />,
  },

  cancel: {
    label: "Cancelar",
    variant: "secondary",
    icon: <FiX />,
  },

  back: {
    label: "Volver",
    variant: "outline-secondary",
    icon: <FiArrowLeft />,
  },

  refresh: {
    label: "Actualizar",
    variant: "outline-secondary",
    icon: <FiRefreshCw />,
  },

};

const ERPButton = ({
  type = "new",
  label,
  icon,
  variant,
  size,
  children,
  className = "",
  ...props
}) => {
  const cfg = TYPES[type] || TYPES.new;

  return (
    <Button
      variant={variant || cfg.variant}
      size={size}
      className={`erp-button ${className}`}
      {...props}
    >
      {icon !== undefined ? icon : cfg.icon}
      <span>{children || label || cfg.label}</span>
    </Button>
  );
};

export default ERPButton;