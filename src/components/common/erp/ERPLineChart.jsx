import React from "react";

import {

    ResponsiveContainer,

    LineChart,

    Line,

    CartesianGrid,

    XAxis,

    YAxis,

    Tooltip,

    Legend

} from "recharts";

import ERPCard from "./ERPCard";

const ERPLineChart = ({

    title,

    data = [],

    xKey,

    yKey,

    height = 320,

    color = "#198754"

}) => {

    return (

        <ERPCard>

            {title && (

                <h5 className="mb-3">

                    {title}

                </h5>

            )}

            <ResponsiveContainer

                width="100%"

                height={height}

            >

                <LineChart

                    data={data}

                    margin={{

                        top: 10,

                        right: 20,

                        left: 0,

                        bottom: 30

                    }}

                >

                    <CartesianGrid

                        strokeDasharray="3 3"

                    />

                    <XAxis

                        dataKey={xKey}

                        angle={-20}

                        textAnchor="end"

                        height={60}

                    />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line

                        type="monotone"

                        dataKey={yKey}

                        stroke={color}

                        strokeWidth={3}

                    />

                </LineChart>

            </ResponsiveContainer>

        </ERPCard>

    );

};

export default ERPLineChart;