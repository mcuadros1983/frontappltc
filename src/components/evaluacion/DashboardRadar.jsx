import React, {

    useMemo

} from "react";

import {

    Card

} from "react-bootstrap";

import {

    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend

} from "recharts";

const DashboardRadar = ({

    tipos = [],

    cumplimiento = {},

    brechas = {}

}) => {

    const data = useMemo(() => {

        const radar = [];

        (tipos || []).forEach(item => {

            radar.push({

                criterio:

                    item.tipo,

                promedio:

                    Number(

                        item.promedio || 0

                    ),

                cumplimiento:

                    Number(

                        cumplimiento.porcentaje || 0

                    ),

                brecha:

                    Number(

                        brechas.porcentaje || 0

                    )

            });

        });

        return radar;

    }, [

        tipos,

        cumplimiento,

        brechas

    ]);

    return (

        <Card>

            <Card.Header>

                Radar Ejecutivo

            </Card.Header>

            <Card.Body

                style={{

                    height: 450

                }}

            >

                <ResponsiveContainer

                    width="100%"

                    height="100%"

                >

                    <RadarChart

                        data={

                            data

                        }

                    >

                        <PolarGrid />

                        <PolarAngleAxis

                            dataKey="criterio"

                        />

                        <PolarRadiusAxis

                            domain={[

                                0,

                                100

                            ]}

                        />

                        <Radar

                            name="Promedio"

                            dataKey="promedio"

                            stroke="#0d6efd"

                            fill="#0d6efd"

                            fillOpacity={0.35}

                        />

                        <Radar

                            name="Cumplimiento"

                            dataKey="cumplimiento"

                            stroke="#198754"

                            fill="#198754"

                            fillOpacity={0.25}

                        />

                        <Radar

                            name="Brechas"

                            dataKey="brecha"

                            stroke="#dc3545"

                            fill="#dc3545"

                            fillOpacity={0.20}

                        />

                        <Legend />

                    </RadarChart>

                </ResponsiveContainer>

            </Card.Body>

        </Card>

    );

};

export default DashboardRadar;

