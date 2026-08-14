import React from "react";

import {

    Radar,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer

} from "recharts";

const RadarChart = ({ data = [] }) => {

    return (

        <ResponsiveContainer
            width="100%"
            height={350}
        >

            <RechartsRadarChart
                data={data}
            >

                <PolarGrid />

                <PolarAngleAxis
                    dataKey="competencia"
                />

                <PolarRadiusAxis />

                <Radar
                    dataKey="promedio"
                    stroke="#0d6efd"
                    fill="#0d6efd"
                    fillOpacity={0.6}
                />

            </RechartsRadarChart>

        </ResponsiveContainer>

    );

};

export default RadarChart;