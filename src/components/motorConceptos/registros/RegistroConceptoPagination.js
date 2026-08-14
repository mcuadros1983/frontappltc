import React from "react";

import {
  Col,
  Form,
  Pagination,
  Row,
} from "react-bootstrap";

import {
  REGISTRO_LIMITS,
} from "../../../config/motorConceptos/registroConceptoConfig";

const buildPages = (
  page,
  totalPages
) => {
  if (
    totalPages <= 1
  ) {
    return [];
  }

  const start =
    Math.max(
      1,
      page - 2
    );

  const end =
    Math.min(
      totalPages,
      page + 2
    );

  const pages = [];

  for (
    let current = start;
    current <= end;
    current += 1
  ) {
    pages.push(
      current
    );
  }

  return pages;
};

const RegistroConceptoPagination = ({
  page,
  limit,
  total,
  totalPages,
  disabled,
  onPageChange,
  onLimitChange,
}) => {
  const pages =
    buildPages(
      page,
      totalPages
    );

  return (
    <Row className="align-items-center mt-3 g-2">
      <Col
        xs={12}
        md={4}
      >
        <small className="text-muted">
          Total de registros:{" "}
          {total}
        </small>
      </Col>

      <Col
        xs={12}
        md={4}
        className="d-flex justify-content-center"
      >
        <Pagination className="mb-0">
          <Pagination.First
            disabled={
              disabled ||
              page <= 1
            }
            onClick={
              () =>
                onPageChange(
                  1
                )
            }
          />

          <Pagination.Prev
            disabled={
              disabled ||
              page <= 1
            }
            onClick={
              () =>
                onPageChange(
                  page - 1
                )
            }
          />

          {
            pages.map(
              (current) => (
                <Pagination.Item
                  key={
                    current
                  }
                  active={
                    current ===
                    page
                  }
                  disabled={
                    disabled
                  }
                  onClick={
                    () =>
                      onPageChange(
                        current
                      )
                  }
                >
                  {current}
                </Pagination.Item>
              )
            )
          }

          <Pagination.Next
            disabled={
              disabled ||
              page >=
                totalPages
            }
            onClick={
              () =>
                onPageChange(
                  page + 1
                )
            }
          />

          <Pagination.Last
            disabled={
              disabled ||
              page >=
                totalPages
            }
            onClick={
              () =>
                onPageChange(
                  totalPages
                )
            }
          />
        </Pagination>
      </Col>

      <Col
        xs={12}
        md={4}
        className="d-flex justify-content-md-end"
      >
        <Form.Select
        className="form-control"
          style={{
            width:
              "auto",
          }}
          value={limit}
          disabled={disabled}
          onChange={
            (event) =>
              onLimitChange(
                Number(
                  event.target.value
                )
              )
          }
        >
          {
            REGISTRO_LIMITS.map(
              (value) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {value} por página
                </option>
              )
            )
          }
        </Form.Select>
      </Col>
    </Row>
  );
};

export default RegistroConceptoPagination;