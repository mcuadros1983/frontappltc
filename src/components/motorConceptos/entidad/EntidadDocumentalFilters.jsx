import React from "react";

import {
    Form,
    Row,
    Col,
} from "react-bootstrap";

const EntidadDocumentalFilters = ({

    filters,

    onChange,

}) => {

    const handleChange =
        (field) =>
            (event) => {

                onChange({

                    [field]:
                        event.target.value,

                });

            };

    return (

        <Row className="mb-3">

            <Col md={4}>

                <Form.Group>

                    <Form.Label>

                        Buscar concepto

                    </Form.Label>

                    <Form.Control

                        type="text"

                        placeholder="Buscar..."

                        value={
                            filters.search || ""
                        }

                        onChange={
                            handleChange(
                                "search"
                            )
                        }

                    />

                </Form.Group>

            </Col>

            <Col md={3}>

                <Form.Group>

                    <Form.Label>

                        Estado

                    </Form.Label>

                    <Form.Select
                     className="form-control"

                        value={
                            filters.estado || ""
                        }

                        onChange={
                            handleChange(
                                "estado"
                            )
                        }

                    >

                        <option value="">
                            Todos
                        </option>

                        <option value="PENDIENTE">
                            Pendientes
                        </option>

                        <option value="COMPLETO">
                            Completos
                        </option>

                        <option value="POR_VENCER">
                            Por vencer
                        </option>

                        <option value="VENCIDO">
                            Vencidos
                        </option>

                    </Form.Select>

                </Form.Group>

            </Col>

            <Col md={2}>

                <Form.Group>

                    <Form.Label>

                        Activo

                    </Form.Label>

                    <Form.Select
                        className="form-control"
                        value={
                            String(
                                filters.activo
                            )
                        }

                        onChange={(e) =>

                            onChange({

                                activo:
                                    e.target.value === "true",

                            })

                        }

                    >

                        <option value="true">

                            Sí

                        </option>

                        <option value="false">

                            No

                        </option>

                    </Form.Select>

                </Form.Group>

            </Col>

        </Row>

    );

};

export default EntidadDocumentalFilters;