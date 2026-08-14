import React from "react";

import {
    Col,
    Form,
    Pagination,
    Row,
} from "react-bootstrap";

import {
    ERPCard,
} from "../../common/erp";

const RegistroConceptoReportePagination = ({

    pagination,

    loading = false,

    onChangePage,

    onChangeLimit,

}) => {

    const {

        page,

        limit,

        total,

        totalPages,

    } = pagination;

    return (

        <ERPCard className="mt-3">

            <Row className="align-items-center">

                <Col
                    md={4}
                >

                    <small>

                        Total registros: <strong>{total}</strong>

                    </small>

                </Col>

                <Col
                    md={4}
                    className="text-center"
                >

                    <Pagination className="justify-content-center mb-0">

                        <Pagination.First
                            disabled={
                                loading ||
                                page <= 1
                            }
                            onClick={() =>
                                onChangePage(1)
                            }
                        />

                        <Pagination.Prev
                            disabled={
                                loading ||
                                page <= 1
                            }
                            onClick={() =>
                                onChangePage(
                                    page - 1
                                )
                            }
                        />

                        <Pagination.Item active>

                            {page}

                        </Pagination.Item>

                        <Pagination.Next
                            disabled={
                                loading ||
                                page >= totalPages
                            }
                            onClick={() =>
                                onChangePage(
                                    page + 1
                                )
                            }
                        />

                        <Pagination.Last
                            disabled={
                                loading ||
                                page >= totalPages
                            }
                            onClick={() =>
                                onChangePage(
                                    totalPages
                                )
                            }
                        />

                    </Pagination>

                </Col>

                <Col
                    md={4}
                    className="text-end"
                >

                    <Form.Select
                    className="form-control"
                        style={{
                            width: 120,
                            display: "inline-block",
                        }}
                        value={limit}
                        disabled={loading}
                        onChange={(event) =>
                            onChangeLimit(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    >

                        <option value={10}>
                            10
                        </option>

                        <option value={20}>
                            20
                        </option>

                        <option value={50}>
                            50
                        </option>

                        <option value={100}>
                            100
                        </option>

                    </Form.Select>

                </Col>

            </Row>

        </ERPCard>

    );

};

export default RegistroConceptoReportePagination;