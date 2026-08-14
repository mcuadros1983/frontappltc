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

const getOptionLabel = (
    item,
    prefix
) =>
    item?.nombre ||
    item?.descripcion ||
    item?.codigo ||
    `${prefix} #${item?.id}`;

const RegistroConceptoFilters = ({
    filters,
    conceptos = [],
    entidadTipos = [],
    sucursales = [],
    estados = [],
    sortOptions = [],
    onChange,
    onSearch,
    onClear,
    onApplySort,
    disabled = false,
}) => {
    const handleKeyDown = (
        event
    ) => {
        if (
            event.key ===
            "Enter"
        ) {
            event.preventDefault();

            onSearch();
        }
    };

    return (
        <ERPCard className="mb-3">

            <Row className="g-3 align-items-end">

                {/* <Col
                    xs={12}
                    md={6}
                    xl={4}
                >
                    <Form.Group>
                        <Form.Label>
                            Buscar
                        </Form.Label>

                        <Form.Control
                            value={
                                filters.buscar
                            }
                            placeholder="Registro, entidad u observaciones"
                            disabled={disabled}
                            onKeyDown={
                                handleKeyDown
                            }
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        buscar:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        />
                    </Form.Group>
                </Col> */}

                <Col
                    xs={12}
                    md={6}
                    xl={2}
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
                            disabled={disabled}
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        estado:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        >
                            {
                                estados.map(
                                    (
                                        estado
                                    ) => (
                                        <option
                                            key={
                                                estado.value ||
                                                "TODOS"
                                            }
                                            value={
                                                estado.value
                                            }
                                        >
                                            {
                                                estado.label
                                            }
                                        </option>
                                    )
                                )
                            }
                        </Form.Select>
                    </Form.Group>
                </Col>

                {/* <Col
                    xs={12}
                    md={6}
                    xl={2}
                >
                    <Form.Group>

                        <Form.Label>
                            Estado vencimiento
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.estado_vencimiento || ""
                            }
                            disabled={disabled}
                            onChange={(event) =>
                                onChange({
                                    estado_vencimiento:
                                        event.target.value,
                                    page: 1,
                                })
                            }
                        >

                            <option value="">
                                Todos
                            </option>

                            <option value="VIGENTE">
                                Vigente
                            </option>

                            <option value="POR_VENCER">
                                Por vencer
                            </option>

                            <option value="VENCIDO">
                                Vencido
                            </option>

                        </Form.Select>

                    </Form.Group>
                </Col> */}

                <Col
                    xs={12}
                    md={6}
                    xl={3}
                >
                    <Form.Group>
                        <Form.Label>
                            Concepto
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.concepto_id
                            }
                            disabled={disabled}
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        concepto_id:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        >
                            <option value="">
                                Todos
                            </option>

                            {
                                conceptos.map(
                                    (
                                        concepto
                                    ) => (
                                        <option
                                            key={
                                                concepto.id
                                            }
                                            value={
                                                concepto.id
                                            }
                                        >
                                            {
                                                concepto.codigo
                                                    ? `${concepto.codigo} - ${getOptionLabel(
                                                        concepto,
                                                        "Concepto"
                                                    )}`
                                                    : getOptionLabel(
                                                        concepto,
                                                        "Concepto"
                                                    )
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
                    md={6}
                    xl={3}
                >
                    <Form.Group>
                        <Form.Label>
                            Tipo de entidad
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.entidad_tipo_id
                            }
                            disabled={disabled}
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        entidad_tipo_id:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        >
                            <option value="">
                                Todos
                            </option>

                            {
                                entidadTipos.map(
                                    (
                                        entidadTipo
                                    ) => (
                                        <option
                                            key={
                                                entidadTipo.id
                                            }
                                            value={
                                                entidadTipo.id
                                            }
                                        >
                                            {
                                                entidadTipo.codigo
                                                    ? `${entidadTipo.codigo} - ${getOptionLabel(
                                                        entidadTipo,
                                                        "Tipo"
                                                    )}`
                                                    : getOptionLabel(
                                                        entidadTipo,
                                                        "Tipo"
                                                    )
                                            }
                                        </option>
                                    )
                                )
                            }
                        </Form.Select>
                    </Form.Group>
                </Col>

                {/* <Col
                    xs={12}
                    md={4}
                    xl={2}
                >
                    <Form.Group>
                        <Form.Label>
                            Entidad ID
                        </Form.Label>

                        <Form.Control
                            type="number"
                            min="1"
                            value={
                                filters.entidad_id
                            }
                            disabled={disabled}
                            placeholder="Todas"
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        entidad_id:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        />
                    </Form.Group>
                </Col> */}

                <Col
                    xs={12}
                    md={4}
                    xl={2}
                >
                    <Form.Group>
                        <Form.Label>
                            Sucursal
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.sucursal_id
                            }
                            disabled={disabled}
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        sucursal_id:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        >
                            <option value="">
                                Todas
                            </option>

                            {
                                sucursales.map(
                                    (
                                        sucursal
                                    ) => (
                                        <option
                                            key={
                                                sucursal.id
                                            }
                                            value={
                                                sucursal.id
                                            }
                                        >
                                            {
                                                getOptionLabel(
                                                    sucursal,
                                                    "Sucursal"
                                                )
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
                    md={4}
                    xl={2}
                >
                    <Form.Group>
                        <Form.Label>
                            Activo
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.activo
                            }
                            disabled={disabled}
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        activo:
                                            event.target.value,

                                        page:
                                            1,
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
                    xl={2}
                >
                    <Form.Group>
                        <Form.Label>
                            Vence desde
                        </Form.Label>

                        <Form.Control
                            type="date"
                            value={
                                filters.vencimiento_desde
                            }
                            disabled={disabled}
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        vencimiento_desde:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        />
                    </Form.Group>
                </Col>

                <Col
                    xs={12}
                    md={6}
                    xl={2}
                >
                    <Form.Group>
                        <Form.Label>
                            Vence hasta
                        </Form.Label>

                        <Form.Control
                            type="date"
                            value={
                                filters.vencimiento_hasta
                            }
                            disabled={disabled}
                            min={
                                filters.vencimiento_desde ||
                                undefined
                            }
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        vencimiento_hasta:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        />
                    </Form.Group>
                </Col>

                <Col
                    xs={12}
                    md={6}
                    xl={3}
                >
                    <Form.Group>
                        <Form.Label>
                            Ordenar por
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.sortBy
                            }
                            disabled={disabled}
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        sortBy:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        >
                            {
                                sortOptions.map(
                                    (
                                        option
                                    ) => (
                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>
                                    )
                                )
                            }
                        </Form.Select>
                    </Form.Group>
                </Col>

                {/* <Col
                    xs={12}
                    md={6}
                    xl={2}
                >
                    <Form.Group>
                        <Form.Label>
                            Dirección
                        </Form.Label>

                        <Form.Select
                            className="form-control"
                            value={
                                filters.sortOrder
                            }
                            disabled={disabled}
                            onChange={
                                (
                                    event
                                ) =>
                                    onChange({
                                        sortOrder:
                                            event.target.value,

                                        page:
                                            1,
                                    })
                            }
                        >
                            <option value="DESC">
                                Descendente
                            </option>

                            <option value="ASC">
                                Ascendente
                            </option>
                        </Form.Select>
                    </Form.Group>
                </Col> */}

                <Col
                    xs={12}
                    xl={5}
                >
                    <div className="d-flex flex-wrap gap-2">

                        <ERPButton
                            type="refresh"
                            label="Buscar"
                            disabled={disabled}
                            onClick={onSearch}
                        />

                        {/* <ERPButton
                            type="refresh"
                            label="Aplicar orden"
                            disabled={disabled}
                            onClick={onApplySort}
                        /> */}

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

export default RegistroConceptoFilters;