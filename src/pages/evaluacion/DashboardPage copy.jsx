// src/pages/evaluacion/DashboardPage.jsx

import React, {
    useEffect,
    useState
} from "react";

import {

    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPTable,
    ERPBadge,
    ERPKpiCard,
    ERPBarChart,
    ERPLineChart,
    ERPPieChart

} from "../../components/common/erp";

import {
    dashboardApi
} from "../../services/evaluacion/dashboardApi";

const DashboardPage = () => {

    const [loading, setLoading] =
        useState(true);

    const [totales, setTotales] =
        useState({

            evaluaciones: 0,

            pendientes: 0,

            finalizadas: 0,

            promedio: 0

        });

    const [ultimas, setUltimas] =
        useState([]);

    const [ranking, setRanking] =
        useState([]);

    const [tipos, setTipos] =
        useState([]);

    const [periodos, setPeriodos] =
        useState([]);





    /*=========================================
      CARGAR DASHBOARD
    =========================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const data =
                await dashboardApi.obtenerResumen();

            setTotales(
                data.totales || {}
            );

            setUltimas(
                data.ultimas || []
            );

            setRanking(
                data.ranking || []
            );

            setTipos(
                data.tipos || []
            );

            setPeriodos(
                data.periodos || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };





    useEffect(() => {

        cargar();

    }, []);


    /*=========================================
      DATOS GRAFICOS
    =========================================*/

    const datosPie = [

        {

            estado: "Pendientes",

            cantidad: Number(
                totales.pendientes || 0
            )

        },

        {

            estado: "Finalizadas",

            cantidad: Number(
                totales.finalizadas || 0
            )

        }

    ];

    const datosTipos =

        tipos.map(item => ({

            descripcion:

                item.tipo?.descripcion,

            cantidad:

                Number(
                    item.dataValues?.cantidad || 0
                ),

            promedio:

                Number(
                    item.dataValues?.promedio || 0
                )

        }));

    const datosPeriodos =

        periodos.map(item => ({

            descripcion:

                item.periodo?.descripcion,

            cantidad:

                Number(
                    item.dataValues?.cantidad || 0
                ),

            promedio:

                Number(
                    item.dataValues?.promedio || 0
                )

        }));


    /*=========================================
      TABLA ULTIMAS EVALUACIONES
    =========================================*/

    const columnasUltimas = [

        {

            key: "numero",

            title: "Número"

        },

        {

            key: "empleado",

            title: "Empleado",

            render: row =>

                `${row.empleado?.apellido || ""} ${row.empleado?.nombre || ""}`

        },

        {

            key: "tipo",

            title: "Tipo",

            render: row =>

                row.tipo?.descripcion

        },

        {

            key: "periodo",

            title: "Período",

            render: row =>

                row.periodo?.descripcion

        },

        {

            key: "estado",

            title: "Estado",

            render: row =>

                <ERPBadge
                    status={row.estado}
                />

        },

        {

            key: "porcentaje",

            title: "%",

            render: row =>

                `${Number(
                    row.porcentaje || 0
                ).toFixed(2)} %`

        }

    ];





    /*=========================================
      TABLA RANKING
    =========================================*/

    const columnasRanking = [

        {

            key: "empleado",

            title: "Empleado",

            render: row =>

                `${row.empleado?.apellido || ""} ${row.empleado?.nombre || ""}`

        },

        {

            key: "cantidad",

            title: "Evaluaciones",

            render: row =>

                row.dataValues?.cantidad

        },

        {

            key: "promedio",

            title: "Promedio",

            render: row =>

                `${Number(
                    row.dataValues?.promedio || 0
                ).toFixed(2)} %`

        }

    ];





    if (loading) {

        return (

            <ERPPage
                title="Dashboard Ejecutivo"
            >

                Cargando...

            </ERPPage>

        );

    } return (

        <ERPPage

            title="Dashboard Ejecutivo"

            subtitle="Resumen General del Módulo de Evaluaciones"

        >

            <ERPToolbar />

            {/*==================================================
              KPI
            ==================================================*/}

            <div className="row mb-4">

                <div className="col-md-3">

                    <ERPKpiCard

                        title="Total Evaluaciones"

                        value={totales.evaluaciones}

                        color="primary"

                    />

                </div>

                <div className="col-md-3">

                    <ERPKpiCard

                        title="Pendientes"

                        value={totales.pendientes}

                        color="warning"

                    />

                </div>

                <div className="col-md-3">

                    <ERPKpiCard

                        title="Finalizadas"

                        value={totales.finalizadas}

                        color="success"

                    />

                </div>

                <div className="col-md-3">

                    <ERPKpiCard

                        title="Promedio General"

                        value={`${Number(
                            totales.promedio || 0
                        ).toFixed(2)} %`}

                        color="info"

                    />

                </div>

            </div>

            {/*==================================================
              GRAFICOS
            ==================================================*/}

            <div className="row mb-4">

                <div className="col-lg-6">

                    <ERPPieChart

                        title="Estado de Evaluaciones"

                        data={datosPie}

                        nameKey="estado"

                        dataKey="cantidad"

                    />

                </div>

                <div className="col-lg-6">

                    <ERPBarChart

                        title="Evaluaciones por Tipo"

                        data={datosTipos}

                        xKey="descripcion"

                        yKey="cantidad"

                    />

                </div>

            </div>

            <div className="row mb-4">

                <div className="col-12">

                    <ERPLineChart

                        title="Promedio por Período"

                        data={datosPeriodos}

                        xKey="descripcion"

                        yKey="promedio"

                    />

                </div>

            </div>

            {/*==================================================
              TABLAS
            ==================================================*/}

            <div className="row">

                <div className="col-lg-6">

                    <ERPCard>

                        <h5 className="mb-3">

                            Últimas Evaluaciones

                        </h5>

                        <ERPTable

                            columns={columnasUltimas}

                            data={ultimas}

                            loading={loading}

                            emptyMessage="No existen evaluaciones."

                        />

                    </ERPCard>

                </div>

                <div className="col-lg-6">

                    <ERPCard>

                        <h5 className="mb-3">

                            Ranking de Empleados

                        </h5>

                        <ERPTable

                            columns={columnasRanking}

                            data={ranking}

                            loading={loading}

                            emptyMessage="No existen resultados."

                        />

                    </ERPCard>

                </div>

            </div>

        </ERPPage>

    );

};

export default DashboardPage;