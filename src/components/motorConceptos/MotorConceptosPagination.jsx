import React from "react";

import {
    Form,
    Pagination,
} from "react-bootstrap";

const MotorConceptosPagination = ({
    page,
    limit,
    total,
    totalPages,
    disabled = false,
    onPageChange,
    onLimitChange,
}) => {

    const currentPage =
        Number(page || 1);

    const currentLimit =
        Number(limit || 10);

    const from =
        total === 0
            ? 0
            : (
                currentPage - 1
            ) * currentLimit + 1;

    const to =
        Math.min(
            currentPage *
            currentLimit,
            total
        );

    return (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">

            <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                    Mostrando {from} - {to} de {total}
                </small>

                <Form.Select
                    className="form-control"
                    size="sm"
                    value={currentLimit}
                    disabled={disabled}
                    style={{
                        width: 90,
                    }}
                    onChange={(event) =>
                        onLimitChange(
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
            </div>

            <Pagination className="mb-0">
                <Pagination.Prev
                    disabled={
                        disabled ||
                        currentPage <= 1
                    }
                    onClick={() =>
                        onPageChange(
                            currentPage - 1
                        )
                    }
                />

                <Pagination.Item active>
                    Página {currentPage} de {totalPages}
                </Pagination.Item>

                <Pagination.Next
                    disabled={
                        disabled ||
                        currentPage >=
                        totalPages
                    }
                    onClick={() =>
                        onPageChange(
                            currentPage + 1
                        )
                    }
                />
            </Pagination>

        </div>
    );
};

export default MotorConceptosPagination;
