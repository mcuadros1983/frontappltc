import React from "react";
import { Form } from "react-bootstrap";

const DateRenderer = ({
    value,
    onChange,
    disabled,
    readOnly,
    invalid,
}) => (
    <Form.Control
        type="date"
        value={
            value
                ? String(value)
                    .substring(0, 10)
                : ""
        }
        disabled={disabled}
        readOnly={readOnly}
        isInvalid={invalid}
        onChange={(event) =>
            onChange(
                event.target.value ||
                null
            )
        }
    />
);

export default DateRenderer;
