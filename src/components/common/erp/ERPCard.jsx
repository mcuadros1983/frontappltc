import React from "react";
import { Card } from "react-bootstrap";
import "./erp.css";

const ERPCard = ({
  title,
  footer,
  children,
  className = "",
  style = {},
}) => {
  return (
    <Card className={`erp-card ${className}`} style={style}>
      {title && <Card.Header className="erp-card-header">{title}</Card.Header>}
      <Card.Body>{children}</Card.Body>
      {footer && <Card.Footer>{footer}</Card.Footer>}
    </Card>
  );
};

export default ERPCard;