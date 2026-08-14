import React from "react";
import { Card, Col, Row } from "react-bootstrap";

const ReporteResumen = ({ items = [] }) => {

    return (

        <Card className="mb-3">

            <Card.Body>

                <Row>

                    {

                        items.map((item, index) => (

                            <Col
                                md={3}
                                key={index}
                            >

                                <strong>

                                    {item.label}

                                </strong>

                                <div>

                                    {item.value}

                                </div>

                            </Col>

                        ))

                    }

                </Row>

            </Card.Body>

        </Card>

    );

};

export default ReporteResumen;