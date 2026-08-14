import React from "react";
import { Col, Row } from "react-bootstrap";
import ReporteCard from "./ReporteCard";

const ReporteKPIs = ({ items = [] }) => {

    return (

        <Row>

            {

                items.map((item, index) => (

                    <Col
                        key={index}
                        md={3}
                    >

                        <ReporteCard

                            title={item.title}

                            value={item.value}

                            subtitle={item.subtitle}

                            color={item.color}

                        />

                    </Col>

                ))

            }

        </Row>

    );

};

export default ReporteKPIs;