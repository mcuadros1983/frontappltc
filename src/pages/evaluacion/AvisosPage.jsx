// src/pages/evaluacion/AvisosPage.jsx

import React, {

    useEffect,
    useState,
    useMemo,

} from "react";

import {

    FiEye,
    FiAlertTriangle,
    FiCheckCircle,
    FiClock,
    FiFileText

} from "react-icons/fi";

import {

    useNavigate

} from "react-router-dom";

import {

    ERPPage,
    ERPToolbar,
    ERPTable,
    ERPKpiCard,
    ERPBadge

} from "../../components/common/erp";

import {

    dashboardApi

} from "../../services/evaluacion/dashboardApi";

const AvisosPage = () => {

    const navigate =
        useNavigate();

    /*=========================================
      ESTADOS
    =========================================*/

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        dashboard,

        setDashboard

    ] = useState({

        frecuencias: {

            total: 0,

            vigentes: 0,

            proximas: 0,

            vencidas: 0,

            items: []

        },

        cumplimiento: {

            total: 0,

            cumplen: 0,

            riesgo: 0,

            incumplen: 0,

            items: []

        },

        brechas: {

            total: 0,

            correctas: 0,

            riesgo: 0,

            fueraRango: 0,

            items: []

        }

    });

    /*=========================================
      CARGAR
    =========================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const data =

                await dashboardApi.obtenerResumen();

            setDashboard(data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargar();

    }, []);

    const frecuenciaAvisos = useMemo(() =>

        dashboard.frecuencias.items.filter(

            item =>

                item.estado !== "VIGENTE"

        ),

        [dashboard]);

    const cumplimientoAvisos = useMemo(() =>

        dashboard.cumplimiento.items.filter(

            item =>

                item.estado !== "CUMPLE"

        ),

        [dashboard]);

    const brechaAvisos = useMemo(() =>

        dashboard.brechas.items.filter(

            item =>

                item.estado !== "CORRECTA"

        ),

        [dashboard]);

    /*=========================================
      ICONO
    =========================================*/

    const obtenerIcono = (tipo) => {

        switch (tipo) {

            case "EVALUACION_PENDIENTE":

                return <FiClock color="#ffc107" />;

            case "EVALUACION_FINALIZADA":

                return <FiCheckCircle color="#198754" />;

            case "PLANTILLA_INCOMPLETA":

                return <FiAlertTriangle color="#dc3545" />;

            case "PERIODO_POR_VENCER":

                return <FiAlertTriangle color="#fd7e14" />;

            default:

                return <FiFileText />;

        }

    };

    /*=========================================
      ACCIONES
    =========================================*/

    const abrir = (row) => {

        if (row.id) {

            navigate(

                `/evaluaciones/${row.id}`

            );

        }

    };

    const actions = [

        {

            icon: <FiEye />,

            title: "Abrir",

            variant: "outline-primary",

            onClick: abrir

        }

    ];

    /*=========================================
      COLUMNAS
    =========================================*/

    const columns = [

        {

            key: "empleado",

            title: "Empleado"

        },

        {

            key: "categoria",

            title: "Categoría"

        },
        {

            key: "prioridad",

            title: "Prioridad",

            render: row => (

                <ERPBadge

                    status={row.prioridad}

                />

            )

        },

        {

            key: "tipo",

            title: "Tipo"

        },

        {

            key: "detalle",

            title: "Detalle"

        },

        {

            key: "estado",

            title: "Estado",

            render: row => (

                <ERPBadge

                    status={row.estado}

                />

            )

        },


    ];



    const avisos = [

        ...frecuenciaAvisos.map(item => ({

            ...item,

            categoria: "Frecuencia",

            prioridad:

                item.estado === "VENCIDA"

                    ? "ALTA"

                    : "MEDIA",

            detalle:

                item.nunca_evaluado

                    ? `Nunca evaluado (esperado cada ${item.frecuencia_esperada} días)`

                    : `${item.dias_transcurridos} días (esperado ${item.frecuencia_esperada} días)`

        })),

        ...cumplimientoAvisos.map(item => ({

            ...item,

            categoria: "Cumplimiento",

            prioridad:

                item.estado === "INCUMPLE"

                    ? "ALTA"

                    : "MEDIA",

            detalle:

                `${Number(item.promedio).toFixed(2)} % (mínimo ${item.minimo} %)`

        })),

        ...brechaAvisos.map(item => ({

            ...item,

            categoria: "Brechas",

            prioridad:

                item.estado === "FUERA_RANGO"

                    ? "ALTA"

                    : "MEDIA",

            tipo:

                item.comparacion,

            detalle:

                `Brecha ${Number(item.diferencia).toFixed(2)} (máx. ${item.maxima})`

        }))

    ];

    avisos.sort((a, b) => {

        const prioridad = {

            ALTA: 1,

            MEDIA: 2,

            BAJA: 3

        };

        return prioridad[a.prioridad] - prioridad[b.prioridad];

    });

    return (

        <ERPPage

            title="Centro de Avisos"

            subtitle="Alertas y notificaciones del módulo de Evaluaciones"

        >

            <ERPToolbar />

            {/*=========================================
              KPI
            =========================================*/}

            <div className="row mb-4">

                <div className="col-lg-3">

                    <ERPKpiCard

                        title="Frecuencias"

                        value={

                            dashboard.frecuencias.vencidas

                        }

                        color="danger"

                    />

                </div>

                <div className="col-lg-4">

                    <ERPKpiCard

                        title="Incumplimientos"

                        value={

                            dashboard.cumplimiento.incumplen

                        }

                        color="warning"

                    />

                </div>

                <div className="col-lg-4">

                    <ERPKpiCard

                        title="Brechas"

                        value={

                            dashboard.brechas.fueraRango

                        }

                        color="info"

                    />

                </div>

                <div className="col-lg-3">

                    <ERPKpiCard

                        title="Total Alertas"

                        value={

                            avisos.length

                        }

                        color="primary"

                    />

                </div>

            </div>

            {/*=========================================
              TABLA
            =========================================*/}
            <ERPTable

                title="Avisos"

                columns={columns}

                data={avisos}

                actions={actions}

                loading={loading}

                emptyMessage="No existen avisos para mostrar."

                rowClassName={row => {

                    switch (row.estado) {

                        case "VENCIDA":

                        case "INCUMPLE":

                        case "FUERA_RANGO":

                            return "table-danger";

                        case "PROXIMA":

                        case "RIESGO":

                            return "table-warning";

                        default:

                            return "";

                    }

                }}

            />

        </ERPPage>

    );

};

export default AvisosPage;