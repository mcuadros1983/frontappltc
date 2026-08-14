import React from "react";
import { Row, Col } from "react-bootstrap";

const ERPToolbar = ({
    left,
    right,
    children,
    className = "",
    style = {},
}) => {

    return (

        <Row
            className={`align-items-center mb-3 ${className}`}
            style={style}
        >

            <Col>

                {left || children}

            </Col>

            <Col xs="auto">

                {right}

            </Col>

        </Row>

    );

};

export default ERPToolbar;