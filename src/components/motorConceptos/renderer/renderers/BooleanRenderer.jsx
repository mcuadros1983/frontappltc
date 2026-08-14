import React from "react";
import { Form } from "react-bootstrap";

const BooleanRenderer = ({
    field,
    value,
    onChange,
    disabled,
    readOnly,
}) => (
    <Form.Check
        type="switch"
        label={
            field.configuracion
                ?.boolean_label ||
            ""
        }
        checked={
            Boolean(value)
        }
        disabled={
            disabled ||
            readOnly
        }
        onChange={(event) =>
            onChange(
                event.target.checked
            )
        }
    />
);

export default BooleanRenderer;
