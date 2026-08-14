import React from "react";

import {
    Button,
    Col,
    Form,
    Row,
} from "react-bootstrap";

// const ESTADOS = [
//     {
//         value: "",
//         label: "Todos los estados",
//     },
//     {
//         value: "BORRADOR",
//         label: "Borrador",
//     },
//     {
//         value: "PENDIENTE",
//         label: "Pendiente",
//     },
//     {
//         value: "VIGENTE",
//         label: "Vigente",
//     },
//     {
//         value: "VENCIDO",
//         label: "Vencido",
//     },
//     {
//         value: "ANULADO",
//         label: "Anulado",
//     },
// ];

const ESTADOS = [
    {
        value: "",
        label: "Todos los estados",
    },
    {
        value: "VIGENTE",
        label: "Vigente",
    },
    {
        value: "VENCIDO",
        label: "Vencido",
    },

];
const MotorConceptoLegajoFilters =
    ({
        filters,
        loading = false,
        onChange,
        onSearch,
        onClear,
    }) => {
        const handleSubmit =
            event => {
                event.preventDefault();

                onSearch();
            };

        return (
            <Form
                onSubmit={
                    handleSubmit
                }
                className="mb-3"
            >
                <Row className="g-2 align-items-end">
                    <Col
                        xs={12}
                        md={6}
                        lg={5}
                    >
                        <Form.Group>
                            <Form.Label>
                                Buscar
                            </Form.Label>

                            <Form.Control
                                type="search"
                                value={
                                    filters.search
                                }
                                disabled={
                                    loading
                                }
                                placeholder="Buscar por concepto o registro..."
                                onChange={
                                    event =>
                                        onChange(
                                            "search",
                                            event.target.value
                                        )
                                }
                            />
                        </Form.Group>
                    </Col>

                    <Col
                        xs={12}
                        md={3}
                        lg={3}
                    >
                        <Form.Group>
                            <Form.Label>
                                Estado
                            </Form.Label>

                            <Form.Select
                            className="form-control"
                                value={
                                    filters.estado
                                }
                                disabled={
                                    loading
                                }
                                onChange={
                                    event =>
                                        onChange(
                                            "estado",
                                            event.target.value
                                        )
                                }
                            >
                                {ESTADOS.map(
                                    estado => (
                                        <option
                                            key={
                                                estado.value ||
                                                "TODOS"
                                            }
                                            value={
                                                estado.value
                                            }
                                        >
                                            {estado.label}
                                        </option>
                                    )
                                )}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col
                        xs={12}
                        md={3}
                        lg={4}
                    >
                        <div className="d-flex flex-wrap gap-2">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={
                                    loading
                                }
                            >
                                <i className="bi bi-search me-2" />

                                Buscar
                            </Button>

                            <Button
                                type="button"
                                variant="outline-secondary"
                                disabled={
                                    loading
                                }
                                onClick={
                                    onClear
                                }
                            >
                                Limpiar
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        );
    };

export default MotorConceptoLegajoFilters;