import React, { useState } from "react";

import {

    Tabs,
    Tab

} from "react-bootstrap";

import {

    ERPPage,
    ERPCard

} from "../../components/common/erp";

import JobsTab from "../../components/scheduler/JobsTab";

const SchedulerPage = () => {

    const [

        activeTab,

        setActiveTab

    ] = useState("jobs");

    return (

        <ERPPage

            title="Scheduler"

            subtitle="Administración de procesos automáticos"

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

                        eventKey="jobs"

                        title="Jobs"

                    >

                        <JobsTab />

                    </Tab>

                </Tabs>

            </ERPCard>

        </ERPPage>

    );

};

export default SchedulerPage;