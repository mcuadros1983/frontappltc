import React, {

    useEffect,
    useState

} from "react";

import {

    Card,
    Tabs,
    Tab,
    Spinner

} from "react-bootstrap";

import {

    ERPPage

} from "../../components/common/erp";

import {

    evaluacionSistemaApi

} from "../../services/evaluacion/evaluacionSistemaApi";

import {

    evaluacionEscalaApi

} from "../../services/evaluacion/evaluacionEscalaApi";

import GeneralTab
from "../../components/evaluacion/GeneralTab";

import PesosTab
from "../../components/evaluacion/PesosTab";

import EscalasTab
from "../../components/evaluacion/EscalasTab";

import NotificacionesTab
from "../../components/evaluacion/NotificacionesTab";

import EvaluacionesTab
from "../../components/evaluacion/EvaluacionesTab";

import MetasTab
from "../../components/evaluacion/MetasTab";

import DashboardTab
from "../../components/evaluacion/DashboardTab";

const SistemaPage = () => {

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        configuracion,

        setConfiguracion

    ] = useState(null);

    const [

        escalas,

        setEscalas

    ] = useState([]);

    const [

        tab,

        setTab

    ] = useState("general");

    const cargar = async () => {

    try {

        setLoading(true);

        const [

            configuracionData,

            escalasData

        ] = await Promise.all([

            evaluacionSistemaApi.obtenerConfiguracion(),

            evaluacionEscalaApi.listar()

        ]);

        setConfiguracion(

            configuracionData

        );

        setEscalas(

            escalasData || []

        );

    }

    catch(error){

        console.error(error);

    }

    finally{

        setLoading(false);

    }

};

useEffect(()=>{

    cargar();

},[]);

const guardarConfiguracion = async (data)=>{

    try{

        await evaluacionSistemaApi.guardarConfiguracion(

            data

        );

        cargar();

    }

    catch(error){

        console.error(error);

    }

};

if(loading){

    return(

        <ERPPage title="Sistema">

            <div className="text-center py-5">

                <Spinner animation="border"/>

            </div>

        </ERPPage>

    );

}

return (

    <ERPPage title="Configuración del Módulo de Evaluación">

        <Card className="shadow-sm">

            <Card.Header>

                <h5 className="mb-0">

                    Configuración General del Sistema

                </h5>

            </Card.Header>

            <Card.Body>

                <Tabs

                    activeKey={tab}

                    onSelect={(k) => setTab(k)}

                    className="mb-4"

                    mountOnEnter

                    unmountOnExit

                >

                    <Tab

                        eventKey="general"

                        title="General"

                    >

                        <GeneralTab

                            configuracion={configuracion}

                            onGuardar={guardarConfiguracion}

                        />

                    </Tab>

                    <Tab

                        eventKey="pesos"

                        title="Pesos"

                    >

                        <PesosTab

                            configuracion={configuracion}

                            onGuardar={guardarConfiguracion}

                        />

                    </Tab>

                    <Tab

                        eventKey="escalas"

                        title="Escalas"

                    >

                        <EscalasTab

                            escalas={escalas}

                            recargar={cargar}

                        />

                    </Tab>

                    <Tab

                        eventKey="notificaciones"

                        title="Notificaciones"

                    >

                        <NotificacionesTab

                            configuracion={configuracion}

                            onGuardar={guardarConfiguracion}

                        />

                    </Tab>

                    <Tab

                        eventKey="evaluaciones"

                        title="Evaluaciones"

                    >

                        <EvaluacionesTab

                            configuracion={configuracion}

                            onGuardar={guardarConfiguracion}

                        />

                    </Tab>

                    <Tab

                        eventKey="metas"

                        title="Metas"

                    >

                        <MetasTab

                            configuracion={configuracion}

                            onGuardar={guardarConfiguracion}

                        />

                    </Tab>

                    <Tab

                        eventKey="dashboard"

                        title="Dashboard"

                    >

                        <DashboardTab

                            configuracion={configuracion}

                            onGuardar={guardarConfiguracion}

                        />

                    </Tab>

                </Tabs>

            </Card.Body>

        </Card>

    </ERPPage>

);

};

export default SistemaPage;