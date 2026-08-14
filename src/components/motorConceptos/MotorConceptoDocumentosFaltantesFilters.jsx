import React from "react";

import {
    Button,
    Col,
    Form,
    Row,
} from "react-bootstrap";

const estados = [
    {
        value: "",
        label: "Todos",
    },
    {
        value: "FALTANTE",
        label: "Faltantes",
    },
    {
        value: "PROXIMO_A_VENCER",
        label: "Próximos a vencer",
    },
    {
        value: "VENCIDO",
        label: "Vencidos",
    },
    {
        value: "CUMPLIDO",
        label: "Cumplidos",
    },
];

const MotorConceptoDocumentosFaltantesFilters = ({
    filtros,
    onChange,
    onSearch,
    onClear,
}) => {

    const handleChange = ({ target }) => {

        onChange({
            ...filtros,
            [target.name]: target.value,
        });

    };

    return (

        <Row className="g-3 mb-3">

            <Col md={6}>

                <Form.Control
                    name="search"
                    value={filtros.search}
                    onChange={handleChange}
                    placeholder="Buscar por código o concepto..."
                />

            </Col>

            <Col md={3}>

                <Form.Select
                    className="form-control"
                    name="estado"
                    value={filtros.estado}
                    onChange={handleChange}
                >

                    {estados.map(item => (

                        <option
                            key={item.value}
                            value={item.value}
                        >
                            {item.label}
                        </option>

                    ))}

                </Form.Select>

            </Col>

            <Col
                md={3}
                className="d-flex gap-2"
            >

                <Button
                    variant="primary"
                    onClick={onSearch}
                >
                    Buscar
                </Button>

                <Button
                    variant="outline-secondary"
                    onClick={onClear}
                >
                    Limpiar
                </Button>

            </Col>

        </Row>

    );

};

export default MotorConceptoDocumentosFaltantesFilters;