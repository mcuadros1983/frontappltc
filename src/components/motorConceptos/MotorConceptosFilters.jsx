import React, {
    useEffect,
    useState,
} from "react";

import {
    Col,
    Form,
    Row,
} from "react-bootstrap";

import {
    ERPButton,
    ERPCard,
} from "../common/erp";


const MotorConceptosFilters = ({
    filters,
    entidades = [],
    onChange,
    onSearch,
    onClear,
    disabled = false,
}) => {

    /*
     * El texto de búsqueda se mantiene localmente.
     *
     * Esto evita modificar filters.buscar
     * mientras el usuario está escribiendo.
     */
    const [
        buscar,
        setBuscar,
    ] = useState(
        filters.buscar || ""
    );


    /*
     * Sincroniza el estado local cuando
     * los filtros externos son limpiados
     * o modificados desde otro lugar.
     */
    useEffect(() => {
        setBuscar(
            filters.buscar || ""
        );
    }, [
        filters.buscar,
    ]);


    /*
     * Aplica el texto escrito al filtro real.
     *
     * No llamamos manualmente a cargar().
     * Al modificar filters, el hook existente
     * realizará la carga mediante su useEffect.
     */
    const handleSearch = () => {

        onChange({
            buscar:
                buscar.trim(),
            page: 1,
        });

    };


    const handleKeyDown = (
        event
    ) => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            handleSearch();

        }

    };


    /*
     * Limpia también el estado local.
     */
    const handleClear = () => {

        setBuscar("");

        onClear();

    };


    return (
        <ERPCard className="mb-3">

            <Row className="g-3 align-items-end">

                <Col
                    xs={12}
                    lg={5}
                >

                    <Form.Group>

                        <Form.Label>
                            Buscar
                        </Form.Label>

                        <Form.Control
                            value={buscar}
                            placeholder="Código o nombre"
                            disabled={disabled}
                            onKeyDown={
                                handleKeyDown
                            }
                            onChange={
                                (event) =>
                                    setBuscar(
                                        event.target.value
                                    )
                            }
                        />

                    </Form.Group>

                </Col>


                <Col
                    xs={12}
                    md={6}
                    lg={2}
                >

                    <Form.Group>

                        <Form.Label>
                            Estado
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.activo
                            }
                            disabled={disabled}
                            onChange={
                                (event) =>
                                    onChange({
                                        activo:
                                            event.target.value,
                                        page: 1,
                                    })
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
                    md={6}
                    lg={3}
                >

                    <Form.Group>

                        <Form.Label>
                            Entidad
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.entidad_tipo_id ||
                                ""
                            }
                            disabled={disabled}
                            onChange={
                                (event) =>
                                    onChange({
                                        entidad_tipo_id:
                                            event.target.value,
                                        page: 1,
                                    })
                            }
                        >

                            <option value="">
                                Todas
                            </option>

                            {
                                entidades.map(
                                    (entidad) => (
                                        <option
                                            key={
                                                entidad.id
                                            }
                                            value={
                                                entidad.id
                                            }
                                        >
                                            {
                                                entidad.nombre
                                            }
                                        </option>
                                    )
                                )
                            }

                        </Form.Select>

                    </Form.Group>

                </Col>


                <Col
                    xs={12}
                    lg={2}
                >

                    <div className="d-flex gap-2">

                        <ERPButton
                            type="refresh"
                            label="Buscar"
                            disabled={disabled}
                            onClick={
                                handleSearch
                            }
                        />

                        <ERPButton
                            type="cancel"
                            label="Limpiar"
                            disabled={disabled}
                            onClick={
                                handleClear
                            }
                        />

                    </div>

                </Col>

            </Row>

        </ERPCard>
    );

};


export default MotorConceptosFilters;