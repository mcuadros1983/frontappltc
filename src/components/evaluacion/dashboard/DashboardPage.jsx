import React, {

    useEffect,

    useState

} from "react";

import {

    Alert,

    Spinner,

    Row,

    Col

} from "react-bootstrap";

import {

    ERPPage

} from "../../components/common/erp";

import DashboardKPIs from "../../components/evaluacion/dashboard/DashboardKPIs";

import DashboardRanking from "../../components/evaluacion/dashboard/DashboardRanking";

import DashboardUltimas from "../../components/evaluacion/dashboard/DashboardUltimas";

import DashboardCompetencias from "../../components/evaluacion/dashboard/DashboardCompetencias";

import DashboardTiposChart from "../../components/evaluacion/dashboard/DashboardTiposChart";

import DashboardAlertas from "../../components/evaluacion/dashboard/DashboardAlertas";

import {

    evaluacionConfiguracionApi

} from "../../services/evaluacion/configuracionApi";

const DashboardPage = () => {

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        dashboard,

        setDashboard

    ] = useState(null);

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

            const data =

                await evaluacionConfiguracionApi.obtenerResumenDashboard();

            setDashboard(

                data

            );

        }

        catch (error) {

            console.error(error);

            setError(

                error.message

            );

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="text-center mt-5">

                <Spinner animation="border" />

            </div>

        );

    }

    if (error) {

        return (

            <Alert variant="danger">

                {error}

            </Alert>

        );

    }

    return (

        <ERPPage

            title="Dashboard Evaluaciones"

        >

            <DashboardKPIs

                indicadores={

                    dashboard.totales

                }

            />

            <Row>

                <Col lg={7}>

                    <DashboardRanking

                        ranking={

                            dashboard.ranking

                        }

                    />

                </Col>

                <Col lg={5}>

                    <DashboardTiposChart

                        tipos={

                            dashboard.tipos

                        }

                    />

                </Col>

            </Row>

            <Row className="mt-4">

                <Col lg={7}>

                    <DashboardCompetencias

                        competencias={

                            dashboard.competencias

                        }

                    />

                </Col>

                <Col lg={5}>

                    <DashboardUltimas

                        ultimas={

                            dashboard.ultimas

                        }

                    />

                </Col>

            </Row>

            <DashboardAlertas

                indicadores={

                    dashboard.totales

                }

            />

        </ERPPage>

    );

};

export default DashboardPage;