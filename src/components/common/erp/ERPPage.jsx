import React from "react";
import { Container } from "react-bootstrap";
import "./erp.css";

const ERPPage = ({
  title,
  subtitle,
  actions,
  children,
  className = "",
  style = {},
}) => {
  return (
    <Container fluid className={`erp-page ${className}`} style={style}>
      <div className="erp-page-header">
        <div>
          {title && <h3 className="erp-page-title">{title}</h3>}
          {subtitle && <div className="erp-page-subtitle">{subtitle}</div>}
        </div>

        {actions && <div>{actions}</div>}
      </div>

      {children}
    </Container>
  );
};

export default ERPPage;