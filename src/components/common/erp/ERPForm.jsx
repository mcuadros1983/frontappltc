import React from "react";

import {
    Row,
    Col,
    Form,
} from "react-bootstrap";

const ERPForm = ({
    fields = [],
    values = {},
    onChange,
}) => {

    const handleValue = (name, value) => {

        onChange({
            ...values,
            [name]: value,
        });

    };

    return (

        <Row className="g-3">

            {

                fields.map((field) => (

                    <Col

                        md={field.md || 12}

                        key={field.name}

                    >

                        <Form.Group>

                            {

                                field.type !== "checkbox" && (

                                    <Form.Label>

                                        {field.label}

                                    </Form.Label>

                                )

                            }

                            {

                                field.type === "textarea" ? (

                                    <Form.Control

                                        as="textarea"

                                        rows={field.rows || 3}

                                        value={

                                            values[field.name] ?? ""

                                        }

                                        onChange={(e) =>

                                            handleValue(

                                                field.name,

                                                e.target.value

                                            )

                                        }

                                    />

                                ) : field.type === "select" ? (

                                    <Form.Select

                                        className="form-control"

                                        value={

                                            values[field.name] ?? ""

                                        }

                                        onChange={(e) =>

                                            handleValue(

                                                field.name,

                                                e.target.value

                                            )

                                        }

                                    >

                                        <option value="">

                                            Seleccionar...

                                        </option>

                                        {

                                            field.options?.map((op) => (

                                                <option

                                                    key={op.value}

                                                    value={op.value}

                                                >

                                                    {op.label}

                                                </option>

                                            ))

                                        }

                                    </Form.Select>

                                ) : field.type === "checkbox" ? (

                                    <Form.Check

                                        type="checkbox"

                                        label={field.label}

                                        checked={

                                            values[field.name] || false

                                        }

                                        onChange={(e) =>

                                            handleValue(

                                                field.name,

                                                e.target.checked

                                            )

                                        }

                                    />

                                ) : (

                                    <Form.Control

                                        type={

                                            field.type || "text"

                                        }

                                        value={

                                            values[field.name] ?? ""

                                        }

                                        onChange={(e) =>

                                            handleValue(

                                                field.name,

                                                e.target.value

                                            )

                                        }

                                    />

                                )

                            }

                        </Form.Group>
                    </Col>

                ))

            }

        </Row>

    );

};

export default ERPForm;