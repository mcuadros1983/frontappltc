import React from "react";

import {
    ERPButton,
    ERPCard,
    ERPForm,
} from "../../common/erp";

const MotorConceptoVencimientosFilters = ({

    filters,

    setFilters,

    refresh,

    empresaOptions = [],

    sucursalOptions = [],

    entidadTipoOptions = [],

    entidadOptions = [],

    conceptoOptions = [],

}) => {

    const handleChange = ({ target }) => {

        const { name, value } = target;

        setFilters((prev) => ({

            ...prev,

            [name]: value,

            page: 1,

        }));

    };

    const limpiar = () => {

        setFilters((prev) => ({

            ...prev,

            empresa_id: "",

            sucursal_id: "",

            entidad_tipo_id: "",

            entidad_id: "",

            concepto_id: "",

            estado: "",

            dias: "",

            desde: "",

            hasta: "",

            search: "",

            page: 1,

        }));

    };

    return (

        <ERPCard className="mb-4">

            <div className="row g-3">

                <div className="col-lg-3">

                    <ERPForm.Input

                        label="Buscar"

                        name="search"

                        value={filters.search}

                        onChange={handleChange}

                        placeholder="Entidad, documento..."

                    />

                </div>

                <div className="col-lg-3">

                    <ERPForm.Select
                    className="form-control"

                        label="Empresa"

                        name="empresa_id"

                        value={filters.empresa_id}

                        onChange={handleChange}

                        options={empresaOptions}

                    />

                </div>

                <div className="col-lg-3">

                    <ERPForm.Select
                    className="form-control"

                        label="Sucursal"

                        name="sucursal_id"

                        value={filters.sucursal_id}

                        onChange={handleChange}

                        options={sucursalOptions}

                    />

                </div>

                <div className="col-lg-3">

                    <ERPForm.Select
                    className="form-control"

                        label="Tipo de entidad"

                        name="entidad_tipo_id"

                        value={filters.entidad_tipo_id}

                        onChange={handleChange}

                        options={entidadTipoOptions}

                    />

                </div>

                <div className="col-lg-3">

                    <ERPForm.Select
                    className="form-control"

                        label="Entidad"

                        name="entidad_id"

                        value={filters.entidad_id}

                        onChange={handleChange}

                        options={entidadOptions}

                    />

                </div>

                <div className="col-lg-3">

                    <ERPForm.Select
                    className="form-control"

                        label="Concepto"

                        name="concepto_id"

                        value={filters.concepto_id}

                        onChange={handleChange}

                        options={conceptoOptions}

                    />

                </div>

                <div className="col-lg-2">

                    <ERPForm.Select
                    className="form-control"

                        label="Estado"

                        name="estado"

                        value={filters.estado}

                        onChange={handleChange}

                        options={[

                            {
                                value: "",
                                label: "Todos",
                            },

                            {
                                value: "VENCIDO",
                                label: "Vencido",
                            },

                            {
                                value: "PROXIMO_A_VENCER",
                                label: "Próximo a vencer",
                            },

                            {
                                value: "CUMPLIDO",
                                label: "Cumplido",
                            },

                            {
                                value: "FALTANTE",
                                label: "Faltante",
                            },

                        ]}

                    />

                </div>

                <div className="col-lg-2">

                    <ERPForm.Select
                    className="form-control"

                        label="Vence en"

                        name="dias"

                        value={filters.dias}

                        onChange={handleChange}

                        options={[

                            {
                                value: "",
                                label: "Todos",
                            },

                            {
                                value: 30,
                                label: "30 días",
                            },

                            {
                                value: 60,
                                label: "60 días",
                            },

                            {
                                value: 90,
                                label: "90 días",
                            },

                        ]}

                    />

                </div>

                <div className="col-lg-2">

                    <ERPForm.Input

                        type="date"

                        label="Desde"

                        name="desde"

                        value={filters.desde}

                        onChange={handleChange}

                    />

                </div>

                <div className="col-lg-2">

                    <ERPForm.Input

                        type="date"

                        label="Hasta"

                        name="hasta"

                        value={filters.hasta}

                        onChange={handleChange}

                    />

                </div>

            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">

                <ERPButton

                    variant="secondary"

                    onClick={limpiar}

                >

                    Limpiar

                </ERPButton>

                <ERPButton

                    variant="primary"

                    onClick={refresh}

                >

                    Buscar

                </ERPButton>

            </div>

        </ERPCard>

    );

};

export default MotorConceptoVencimientosFilters;