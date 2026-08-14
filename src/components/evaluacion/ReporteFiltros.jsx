import React from "react";

import {

    ERPCard,
    ERPButton

} from "../common/erp";

import {

    FiRefreshCw,
    FiSearch

} from "react-icons/fi";

const ReporteFiltros = ({

    filtros,

    onChange,

    onBuscar,

    onLimpiar,

    tipos = [],

    periodos = [],

    empleados = [],

    evaluadores = []

}) => {

    return (

        <ERPCard className="mb-4">

            <div className="row g-3">

                {/*=====================================
                  EMPLEADO
                =====================================*/}

                <div className="col-md-3">

                    <label className="form-label">

                        Empleado

                    </label>

                    <select

                        className="form-select"

                        value={filtros.empleado}

                        onChange={(e) =>

                            onChange(

                                "empleado",

                                e.target.value

                            )

                        }

                    >

                        <option value="">

                            Todos

                        </option>

                        {

                            empleados.map(emp => (

                                <option

                                    key={emp.id}

                                    value={emp.id}

                                >

                                    {emp.apellido} {emp.nombre}

                                </option>

                            ))

                        }

                    </select>

                </div>

                {/*=====================================
                  TIPO
                =====================================*/}

                <div className="col-md-3">

                    <label className="form-label">

                        Tipo

                    </label>

                    <select

                        className="form-select"

                        value={filtros.tipo}

                        onChange={(e) =>

                            onChange(

                                "tipo",

                                e.target.value

                            )

                        }

                    >

                        <option value="">

                            Todos

                        </option>

                        {

                            tipos.map(tipo => (

                                <option

                                    key={tipo.id}

                                    value={tipo.id}

                                >

                                    {tipo.descripcion}

                                </option>

                            ))

                        }

                    </select>

                </div>

                {/*=====================================
                  PERIODO
                =====================================*/}

                <div className="col-md-3">

                    <label className="form-label">

                        Período

                    </label>

                    <select

                        className="form-select"

                        value={filtros.periodo}

                        onChange={(e) =>

                            onChange(

                                "periodo",

                                e.target.value

                            )

                        }

                    >

                        <option value="">

                            Todos

                        </option>

                        {

                            periodos.map(periodo => (

                                <option

                                    key={periodo.id}

                                    value={periodo.id}

                                >

                                    {periodo.descripcion}

                                </option>

                            ))

                        }

                    </select>

                </div>

                {/*=====================================
                  ESTADO
                =====================================*/}

                <div className="col-md-3">

                    <label className="form-label">

                        Estado

                    </label>

                    <select

                        className="form-select"

                        value={filtros.estado}

                        onChange={(e) =>

                            onChange(

                                "estado",

                                e.target.value

                            )

                        }

                    >

                        <option value="">

                            Todos

                        </option>

                        <option value="PENDIENTE">

                            Pendiente

                        </option>

                        <option value="FINALIZADA">

                            Finalizada

                        </option>

                    </select>

                </div>

                {/*=====================================
                  EVALUADOR
                =====================================*/}

                <div className="col-md-3">

                    <label className="form-label">

                        Evaluador

                    </label>

                    <select

                        className="form-select"

                        value={filtros.evaluador}

                        onChange={(e) =>

                            onChange(

                                "evaluador",

                                e.target.value

                            )

                        }

                    >

                        <option value="">

                            Todos

                        </option>

                        {

                            evaluadores.map(usuario => (

                                <option

                                    key={usuario.id}

                                    value={usuario.id}

                                >

                                    {usuario.usuario}

                                </option>

                            ))

                        }

                    </select>

                </div>

                {/*=====================================
                  FECHAS
                =====================================*/}

                <div className="col-md-3">

                    <label className="form-label">

                        Desde

                    </label>

                    <input

                        type="date"

                        className="form-control"

                        value={filtros.fechaDesde}

                        onChange={(e) =>

                            onChange(

                                "fechaDesde",

                                e.target.value

                            )

                        }

                    />

                </div>

                <div className="col-md-3">

                    <label className="form-label">

                        Hasta

                    </label>

                    <input

                        type="date"

                        className="form-control"

                        value={filtros.fechaHasta}

                        onChange={(e) =>

                            onChange(

                                "fechaHasta",

                                e.target.value

                            )

                        }

                    />

                </div>

            </div>

            <div className="d-flex gap-2 mt-4">

                <ERPButton

                    variant="primary"

                    onClick={onBuscar}

                >

                    <FiSearch className="me-2"/>

                    Buscar

                </ERPButton>

                <ERPButton

                    variant="secondary"

                    onClick={onLimpiar}

                >

                    <FiRefreshCw className="me-2"/>

                    Limpiar

                </ERPButton>

            </div>

        </ERPCard>

    );

};

export default ReporteFiltros;