import React from "react";
import { Form } from "react-bootstrap";

const TextRenderer = ({
    field,
    value,
    onChange,
    disabled,
    readOnly,
    invalid,
}) => (
    <Form.Control
        type="text"
        value={value ?? ""}
        placeholder={
            field.placeholder || ""
        }
        disabled={disabled}
        readOnly={readOnly}
        isInvalid={invalid}
        onChange={(event) =>
            onChange(
                event.target.value
            )
        }
    />
);

export default TextRenderer;
