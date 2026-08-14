import React from "react";
import { Form } from "react-bootstrap";

const SelectRenderer = ({
    field,
    value,
    onChange,
    disabled,
    readOnly,
    invalid,
}) => {
    const items =
        field.lista?.items ||
        [];

    const multiple =
        Boolean(
            field.lista
                ?.permite_multiple
        );

    return (
        <Form.Select
        className="form-control"
            multiple={multiple}
            value={
                multiple
                    ? (
                        Array.isArray(value)
                            ? value
                            : []
                    )
                    : value ?? ""
            }
            disabled={
                disabled ||
                readOnly
            }
            isInvalid={invalid}
            onChange={(event) => {
                if (multiple) {
                    onChange(
                        Array.from(
                            event.target
                                .selectedOptions
                        ).map(
                            (option) =>
                                option.value
                        )
                    );
                    return;
                }

                onChange(
                    event.target.value ||
                    null
                );
            }}
        >
            {
                !multiple && (
                    <option value="">
                        Seleccionar
                    </option>
                )
            }

            {
                items
                    .filter(
                        (item) =>
                            item.activo !== false
                    )
                    .sort(
                        (a, b) =>
                            Number(
                                a.orden || 0
                            ) -
                            Number(
                                b.orden || 0
                            )
                    )
                    .map(
                        (item) => (
                            <option
                                key={
                                    item.id ||
                                    item.valor
                                }
                                value={
                                    item.valor
                                }
                            >
                                {
                                    item.etiqueta
                                }
                            </option>
                        )
                    )
            }
        </Form.Select>
    );
};

export default SelectRenderer;
