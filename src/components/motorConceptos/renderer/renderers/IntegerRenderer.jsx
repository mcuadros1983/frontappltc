import React from "react";
import { Form } from "react-bootstrap";

const IntegerRenderer = ({
    field,
    value,
    onChange,
    disabled,
    readOnly,
    invalid,
}) => (
    <Form.Control
        type="number"
        step="1"
        min={
            field.configuracion?.min
        }
        max={
            field.configuracion?.max
        }
        value={value ?? ""}
        disabled={disabled}
        readOnly={readOnly}
        isInvalid={invalid}
        onChange={(event) =>
            onChange(
                event.target.value === ""
                    ? null
                    : Number(
                        event.target.value
                    )
            )
        }
    />
);

export default IntegerRenderer;
