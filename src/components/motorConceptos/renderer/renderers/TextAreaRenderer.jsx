import React from "react";
import { Form } from "react-bootstrap";

const TextAreaRenderer = ({
    field,
    value,
    onChange,
    disabled,
    readOnly,
    invalid,
}) => (
    <Form.Control
        as="textarea"
        rows={
            field.configuracion
                ?.rows || 3
        }
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

export default TextAreaRenderer;
