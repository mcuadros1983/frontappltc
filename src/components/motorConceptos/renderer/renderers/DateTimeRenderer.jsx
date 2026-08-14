import React from "react";
import { Form } from "react-bootstrap";

const normalize = (value) => {
    if (!value) return "";

    return String(value)
        .replace("Z", "")
        .substring(0, 16);
};

const DateTimeRenderer = ({
    value,
    onChange,
    disabled,
    readOnly,
    invalid,
}) => (
    <Form.Control
        type="datetime-local"
        value={normalize(value)}
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

export default DateTimeRenderer;
