import React from "react";

import {
    Col,
    Form,
    Row,
} from "react-bootstrap";

import {
    ERPButton,
    ERPCard,
} from "../../common/erp";

const RegistroConceptoReporteFilters = ({
    filters,
    conceptos = [],
    entidadTipos = [],
    sucursales = [],
    onChange,
    onSearch,
    onClear,
    disabled = false,
}) => {

    const handleKeyDown = (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            onSearch();

        }

    };

    return (

        <ERPCard className="mb-3">

            <Row className="g-3">

                <Col
                    xs={12}
                    md={6}
                    lg={4}
                >
                    <Form.Group>

                        <Form.Label>
                            Buscar
                        </Form.Label>

                        <Form.Control
                            value={filters.search}
                            placeholder="Empleado, empresa o concepto"
                            disabled={disabled}
                            onKeyDown={handleKeyDown}
                            onChange={(event) =>
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
                    md={6}
                    lg={4}
                >
                    <Form.Group>

                        <Form.Label>
                            Concepto
                        </Form.Label>

                        <Form.Select
                        className="form-control"
                            value={filters.concepto_id}
                            disabled={disabled}
                            onChange={(event) =>
                                onChange(
                                    "concepto_id",
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Todos
                            </option>

                            {
                                conceptos.map(concepto => (

                                    <option
                                        key={concepto.id}
                                        value={concepto.id}
                                    >
                                        {concepto.nombre}
                                    </option>

                                ))
                            }

                        </Form.Select>

                    </Form.Group>
                </Col>

                <Col
                    xs={12}
                    md={6}
                    lg={4}
                >
                    <Form.Group>

                        <Form.Label>
                            Tipo de entidad
                        </Form.Label>

                        <Form.Select
                        className="form-control"
                            value={filters.entidad_tipo_id}
                            disabled={disabled}
                            onChange={(event) =>
                                onChange(
                                    "entidad_tipo_id",
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Todos
                            </option>

                            {
                                entidadTipos.map(tipo => (

                                    <option
                                        key={tipo.id}
                                        value={tipo.id}
                                    >
                                        {tipo.nombre}
                                    </option>

                                ))
                            }

                        </Form.Select>

                    </Form.Group>
                </Col>

                <Col
                    xs={12}
                    md={6}
                    lg={4}
                >
                    <Form.Group>

                        <Form.Label>
                            Sucursal
                        </Form.Label>

                        <Form.Select
                        className="form-control"
                            value={filters.sucursal_id}
                            disabled={disabled}
                            onChange={(event) =>
                                onChange(
                                    "sucursal_id",
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Todas
                            </option>

                            {
                                sucursales.map(sucursal => (

                                    <option
                                        key={sucursal.id}
                                        value={sucursal.id}
                                    >
                                        {sucursal.nombre}
                                    </option>

                                ))
                            }

                        </Form.Select>

                    </Form.Group>
                </Col>

                <Col
                    xs={12}
                    md={6}
                    lg={4}
                >
                    <Form.Group>

                        <Form.Label>
                            Estado
                        </Form.Label>

                        <Form.Select
                        className="form-control"
                            value={filters.estado}
                            disabled={disabled}
                            onChange={(event) =>
                                onChange(
                                    "estado",
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Todos
                            </option>

                            <option value="vigente">
                                Vigente
                            </option>

                            <option value="por_vencer">
                                Por vencer
                            </option>

                            <option value="vencido">
                                Vencido
                            </option>

                        </Form.Select>

                    </Form.Group>
                </Col>

                <Col
                    xs={12}
                    md={6}
                    lg={4}
                >
                    <Form.Group>

                        <Form.Label>
                            Activo
                        </Form.Label>

                        <Form.Select
                        className="form-control"
                            value={filters.activo}
                            disabled={disabled}
                            onChange={(event) =>
                                onChange(
                                    "activo",
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Todos
                            </option>

                            <option value="true">
                                Activos
                            </option>

                            <option value="false">
                                Inactivos
                            </option>

                        </Form.Select>

                    </Form.Group>
                </Col>

                <Col
                    xs={12}
                >
                    <div className="d-flex justify-content-end gap-2">

                        <ERPButton
                            type="refresh"
                            label="Buscar"
                            disabled={disabled}
                            onClick={onSearch}
                        />

                        <ERPButton
                            type="cancel"
                            label="Limpiar"
                            disabled={disabled}
                            onClick={onClear}
                        />

                    </div>
                </Col>

            </Row>

        </ERPCard>

    );

};

export default RegistroConceptoReporteFilters;