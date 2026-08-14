import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "react-bootstrap";

import {
    ERPPage,
    ERPCard
} from "../../components/common/erp";

import TiposTab from "../../components/evaluacion/TiposTab";
import CriteriosTab from "../../components/evaluacion/CriteriosTab";
import PeriodosTab from "../../components/evaluacion/PeriodosTab";
import PlantillasTab from "../../components/evaluacion/PlantillasTab";
import GeneralTab from "../../components/evaluacion/GeneralTab";
import ParametrosEvaluacionTab
    from "../../components/evaluacion/ParametrosEvaluacionTab";

import { evaluacionConfiguracionApi }
    from "../../services/evaluacion/configuracionApi";
import ConfiguracionNotificacionesTab from "../../components/evaluacion/ConfiguracionNotificacionesTab";

const ConfiguracionPage = () => {

    const [activeTab, setActiveTab] = useState("tipos");

    const [

        configuracion,

        setConfiguracion

    ] = useState(null);

    useEffect(() => {

        cargarConfiguracion();

    }, []);

    const cargarConfiguracion = async () => {

        const data =
            await evaluacionConfiguracionApi.obtenerConfiguracionGeneral();

        setConfiguracion(data);

    };
    const guardarConfiguracion = async (data) => {

        await evaluacionConfiguracionApi.guardarConfiguracionGeneral(data);

        cargarConfiguracion();

    };



    return (

        <ERPPage
            title="Configuración"
            subtitle="Configuración del módulo de Evaluación"
        >

            <ERPCard>

                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    mountOnEnter
                    unmountOnExit={false}
                    className="mb-4"
                >

                    <Tab
                        eventKey="tipos"
                        title="Tipos de Evaluación"
                    >

                        <TiposTab />

                    </Tab>

                    <Tab
                        eventKey="criterios"
                        title="Criterios"
                    >

                        <CriteriosTab />

                    </Tab>

                    <Tab
                        eventKey="periodos"
                        title="Períodos"
                    >

                        <PeriodosTab />

                    </Tab>

                    <Tab
                        eventKey="plantillas"
                        title="Plantillas"
                    >

                        <PlantillasTab />

                    </Tab>

                    <Tab
                        eventKey="general"
                        title="Configuración General"
                    >

                        <GeneralTab

                            configuracion={configuracion}

                            onGuardar={guardarConfiguracion}

                        />


                    </Tab>

                    <Tab
                        eventKey="parametros"
                        title="Parámetros de Evaluación"
                    >

                        <ParametrosEvaluacionTab />

                    </Tab>

                    <Tab
                        eventKey="notificaciones"
                        title="Notificaciones"
                    >
                        <ConfiguracionNotificacionesTab />
                    </Tab>


                </Tabs>

            </ERPCard>

        </ERPPage>

    );

};

export default ConfiguracionPage;