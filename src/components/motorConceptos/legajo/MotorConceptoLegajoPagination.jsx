import React from "react";

import {
    Button,
    Form,
} from "react-bootstrap";

const LIMITS = [
    10,
    20,
    50,
    100,
];

const MotorConceptoLegajoPagination =
    ({
        pagination,
        loading = false,
        onPageChange,
        onLimitChange,
    }) => {
        const page =
            Number(
                pagination?.page
            ) || 1;

        const limit =
            Number(
                pagination?.limit
            ) || 20;

        const total =
            Number(
                pagination?.total
            ) || 0;

        const totalPages =
            Math.max(
                Number(
                    pagination
                        ?.totalPages
                ) || 1,
                1
            );

        const from =
            total > 0
                ? (
                    (
                        page -
                        1
                    ) *
                    limit
                ) +
                1
                : 0;

        const to =
            Math.min(
                page *
                    limit,
                total
            );

        return (
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mt-3">
                <div className="text-muted">
                    Mostrando{" "}
                    <strong>
                        {from}
                    </strong>
                    {" - "}
                    <strong>
                        {to}
                    </strong>
                    {" de "}
                    <strong>
                        {total}
                    </strong>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    <Form.Select
                    className="form-control"
                        size="sm"
                        value={
                            limit
                        }
                        disabled={
                            loading
                        }
                        style={{
                            width:
                                "auto",
                        }}
                        onChange={
                            event =>
                                onLimitChange(
                                    event
                                        .target
                                        .value
                                )
                        }
                    >
                        {LIMITS.map(
                            item => (
                                <option
                                    key={
                                        item
                                    }
                                    value={
                                        item
                                    }
                                >
                                    {item} por página
                                </option>
                            )
                        )}
                    </Form.Select>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline-secondary"
                        disabled={
                            loading ||
                            page <= 1
                        }
                        onClick={
                            () =>
                                onPageChange(
                                    1
                                )
                        }
                        title="Primera página"
                    >
                        <i className="bi bi-chevron-bar-left" />
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline-secondary"
                        disabled={
                            loading ||
                            page <= 1
                        }
                        onClick={
                            () =>
                                onPageChange(
                                    page - 1
                                )
                        }
                        title="Página anterior"
                    >
                        <i className="bi bi-chevron-left" />
                    </Button>

                    <span className="px-2">
                        Página{" "}
                        <strong>
                            {page}
                        </strong>
                        {" de "}
                        <strong>
                            {totalPages}
                        </strong>
                    </span>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline-secondary"
                        disabled={
                            loading ||
                            page >=
                                totalPages
                        }
                        onClick={
                            () =>
                                onPageChange(
                                    page + 1
                                )
                        }
                        title="Página siguiente"
                    >
                        <i className="bi bi-chevron-right" />
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline-secondary"
                        disabled={
                            loading ||
                            page >=
                                totalPages
                        }
                        onClick={
                            () =>
                                onPageChange(
                                    totalPages
                                )
                        }
                        title="Última página"
                    >
                        <i className="bi bi-chevron-bar-right" />
                    </Button>
                </div>
            </div>
        );
    };

export default MotorConceptoLegajoPagination;