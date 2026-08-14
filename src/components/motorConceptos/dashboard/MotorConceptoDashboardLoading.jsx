import React from "react";

import {
    Row,
    Col,
    Placeholder,
} from "react-bootstrap";

import {
    ERPCard,
} from "../../../components/common/erp";

const KPIPlaceholder = () => (

    <Col
        xl={2}
        lg={4}
        md={6}
        sm={6}
        xs={12}
        className="mb-3"
    >

        <ERPCard>

            <Placeholder
                as="div"
                animation="glow"
            >

                <Placeholder
                    xs={12}
                    style={{
                        height: 18,
                    }}
                />

            </Placeholder>

            <Placeholder
                as="div"
                animation="glow"
                className="mt-3"
            >

                <Placeholder
                    xs={8}
                    style={{
                        height: 40,
                    }}
                />

            </Placeholder>

            <Placeholder
                as="div"
                animation="glow"
                className="mt-3"
            >

                <Placeholder
                    xs={6}
                    style={{
                        height: 14,
                    }}
                />

            </Placeholder>

        </ERPCard>

    </Col>

);

const TimelinePlaceholder = () => (

    <ERPCard
        title="Estado documental"
    >

        {

            [...Array(6)].map((_, index) => (

                <div
                    key={index}
                    className="border-bottom py-3"
                >

                    <Placeholder
                        as="div"
                        animation="glow"
                    >

                        <Placeholder xs={5} />

                    </Placeholder>

                    <Placeholder
                        as="div"
                        animation="glow"
                        className="mt-2"
                    >

                        <Placeholder xs={3} />

                    </Placeholder>

                    <Placeholder
                        as="div"
                        animation="glow"
                        className="mt-2"
                    >

                        <Placeholder xs={2} />

                    </Placeholder>

                </div>

            ))

        }

    </ERPCard>

);

const ChartPlaceholder = ({
    title,
}) => (

    <ERPCard
        title={title}
    >

        <div
            className="d-flex align-items-center justify-content-center"
            style={{
                height: 260,
            }}
        >

            <Placeholder
                animation="glow"
            >

                <Placeholder
                    xs={12}
                    style={{
                        width: 220,
                        height: 220,
                        borderRadius: "50%",
                    }}
                />

            </Placeholder>

        </div>

    </ERPCard>

);

const ActionsPlaceholder = () => (

    <ERPCard
        title="Acciones"
    >

        <Row>

            {

                [...Array(5)].map((_, index) => (

                    <Col
                        xl={2}
                        lg={4}
                        md={6}
                        xs={12}
                        key={index}
                        className="mb-2"
                    >

                        <Placeholder
                            animation="glow"
                        >

                            <Placeholder
                                xs={12}
                                style={{
                                    height: 38,
                                }}
                            />

                        </Placeholder>

                    </Col>

                ))

            }

        </Row>

    </ERPCard>

);

const MotorConceptoDashboardLoading = () => {

    return (

        <>

            <ERPCard>

                <Placeholder
                    animation="glow"
                >

                    <Placeholder
                        xs={5}
                        style={{
                            height: 28,
                        }}
                    />

                </Placeholder>

                <Placeholder
                    animation="glow"
                    className="mt-3"
                >

                    <Placeholder
                        xs={12}
                        style={{
                            height: 14,
                        }}
                    />

                </Placeholder>

            </ERPCard>

            <Row className="mt-4">

                {

                    [...Array(6)].map((_, index) => (

                        <KPIPlaceholder
                            key={index}
                        />

                    ))

                }

            </Row>

            <Row className="mt-4">

                <Col
                    lg={6}
                    className="mb-4"
                >

                    <ChartPlaceholder
                        title="Cumplimiento documental"
                    />

                </Col>

                <Col
                    lg={6}
                    className="mb-4"
                >

                    <ChartPlaceholder
                        title="Documentos por estado"
                    />

                </Col>

            </Row>

            <Row className="mt-4">

                <Col
                    lg={12}
                >

                    <TimelinePlaceholder />

                </Col>

            </Row>

            <Row className="mt-4">

                <Col
                    lg={12}
                >

                    <ActionsPlaceholder />

                </Col>

            </Row>

        </>

    );

};

export default React.memo(
    MotorConceptoDashboardLoading
);