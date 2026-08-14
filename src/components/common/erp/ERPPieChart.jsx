import React from "react";

import {

    ResponsiveContainer,

    PieChart,

    Pie,

    Tooltip,

    Legend,

    Cell

} from "recharts";

import ERPCard from "./ERPCard";

const COLORS = [

    "#0d6efd",

    "#198754",

    "#ffc107",

    "#dc3545",

    "#0dcaf0",

    "#6f42c1",

    "#fd7e14",

    "#20c997"

];

const ERPPieChart = ({

    title,

    data = [],

    dataKey,

    nameKey,

    height = 320

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

                <PieChart>

                    <Pie

                        data={data}

                        dataKey={dataKey}

                        nameKey={nameKey}

                        outerRadius={110}

                        label

                    >

                        {

                            data.map(

                                (_, index) => (

                                    <Cell

                                        key={index}

                                        fill={

                                            COLORS[

                                                index %

                                                COLORS.length

                                            ]

                                        }

                                    />

                                )

                            )

                        }

                    </Pie>

                    <Tooltip />

                    <Legend />

                </PieChart>

            </ResponsiveContainer>

        </ERPCard>

    );

};

export default ERPPieChart;