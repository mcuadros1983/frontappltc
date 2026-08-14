import React, { useState } from "react";

import { Tabs, Tab } from "react-bootstrap";

import {

    ERPPage,
    ERPCard

} from "../../components/common/erp";

import ConfiguracionTab from "../../components/notification/ConfiguracionTab";
import EventosTab from "../../components/notification/EventosTab";
import DestinatariosTab from "../../components/notification/DestinatariosTab";
import PlantillasTab from "../../components/notification/PlantillasTab";
import HistorialTab from "../../components/notification/HistorialTab";

const NotificationPage = () => {

    const [

        activeTab,

        setActiveTab

    ] = useState(

        "configuracion"

    );

    return (

        <ERPPage

            title="Centro de Notificaciones"

            subtitle="Configuración del sistema de notificaciones"

        >

            <ERPCard>

                <Tabs

                    activeKey={activeTab}

                    onSelect={(k) =>

                        setActiveTab(k)

                    }

                    mountOnEnter

                    unmountOnExit={false}

                    className="mb-4"

                >

                    <Tab

                        eventKey="configuracion"

                        title="SMTP"

                    >

                        <ConfiguracionTab />

                    </Tab>

                    <Tab

                        eventKey="eventos"

                        title="Eventos"

                    >

                        <EventosTab />

                    </Tab>

                    <Tab

                        eventKey="destinatarios"

                        title="Destinatarios"

                    >

                        <DestinatariosTab />

                    </Tab>

                    <Tab

                        eventKey="plantillas"

                        title="Plantillas"

                    >

                        <PlantillasTab />

                    </Tab>

                    <Tab

                        eventKey="historial"

                        title="Historial"

                    >

                        <HistorialTab />

                    </Tab>

                </Tabs>

            </ERPCard>

        </ERPPage>

    );

};

export default NotificationPage;