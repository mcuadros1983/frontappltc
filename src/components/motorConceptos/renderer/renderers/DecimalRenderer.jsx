import React from "react";
import { Form } from "react-bootstrap";

const DecimalRenderer = ({
    field,
    value,
    onChange,
    disabled,
    readOnly,
    invalid,
}) => (
    <Form.Control
        type="number"
        step={
            field.configuracion
                ?.step || "0.01"
        }
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

export default DecimalRenderer;
