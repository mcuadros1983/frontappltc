import React from "react";
import { Row, Col } from "react-bootstrap";

const ERPFilter = ({
    children,
    className = "",
    style = {},
}) => {

    return (

        <Row

            className={`g-2 ${className}`}

            style={style}

        >

            {

                React.Children.map(children, (child) => (

                    <Col xs="auto">

                        {child}

                    </Col>

                ))

            }

        </Row>

    );

};

export default ERPFilter;