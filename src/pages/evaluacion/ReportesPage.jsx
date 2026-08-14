import React, {

    useEffect,

    useState

} from "react";

import {

    Alert,

    Spinner,

    Tabs,

    Tab

} from "react-bootstrap";

import {

    ERPPage

} from "../../components/common/erp";

import {

    reporteApi

} from "../../services/evaluacion/reporteApi";

import {

    dashboardApi

} from "../../services/evaluacion/dashboardApi";

import ReporteGeneralTab from "../../components/evaluacion/reportes/ReporteGeneralTab";
import ReporteCompetenciasTab from "../../components/evaluacion/reportes/ReporteCompetenciasTab";
import ReporteParticipantesTab from "../../components/evaluacion/reportes/ReporteParticipantesTab";
import ReporteComparativoTab from "../../components/evaluacion/reportes/ReporteComparativoTab";

const ReportesPage = () => {

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        dashboard,

        setDashboard

    ] = useState({

        reporte: {

            items: [],

            total: 0

        },

        resumen: {}

    });

    const [

        error,

        setError

    ] = useState("");

    useEffect(() => {

        cargar();

    }, []);

    const cargar = async () => {

        try {

            setLoading(true);

            setError("");

            const [

                reporte,

                resumen

            ] = await Promise.all([

                reporteApi.obtenerReporte(),

                dashboardApi.obtenerResumen()

            ]);

            setDashboard({

                reporte,

                resumen

            });

        }

        catch (error) {

            console.error(error);

            setError(

                error.message ||

                "Error obteniendo los reportes."

            );

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <ERPPage

                title="Reportes"

            >

                <div className="text-center mt-5">

                    <Spinner

                        animation="border"

                    />

                </div>

            </ERPPage>

        );

    }

    if (error) {

        return (

            <ERPPage

                title="Reportes"

            >

                <Alert variant="danger">

                    {error}

                </Alert>

            </ERPPage>

        );

    }

    return (

        <ERPPage

            title="Reportes"

            subtitle="Reportes generales del módulo de evaluación"

        >

            <Tabs

                defaultActiveKey="general"

                className="mb-3"

                mountOnEnter

                unmountOnExit

            >

                <Tab

                    eventKey="general"

                    title="General"

                >

                    <ReporteGeneralTab

                        dashboard={dashboard}

                    />

                </Tab>

                <Tab

                    eventKey="competencias"

                    title="Competencias"

                >

                    <ReporteCompetenciasTab

                        dashboard={dashboard}

                    />

                </Tab>

                <Tab

                    eventKey="participantes"

                    title="Participantes"

                >

                    <ReporteParticipantesTab

                        dashboard={dashboard}

                    />

                </Tab>

                <Tab

                    eventKey="comparativo"

                    title="Comparativo"

                >

                    <ReporteComparativoTab />

                </Tab>

            </Tabs>

        </ERPPage>

    );

};

export default ReportesPage;