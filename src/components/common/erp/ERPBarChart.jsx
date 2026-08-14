import React from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from "recharts";

import ERPCard from "./ERPCard";

const ERPBarChart = ({

    title,

    data = [],

    xKey,

    yKey,

    height = 320,

    color = "#0d6efd"

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

                <BarChart

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

                    <Bar

                        dataKey={yKey}

                        fill={color}

                        radius={[4, 4, 0, 0]}

                    />

                </BarChart>

            </ResponsiveContainer>

        </ERPCard>

    );

};

export default ERPBarChart;