import React, {

    useMemo

} from "react";

import {

    Card,
    Table,
    Badge

} from "react-bootstrap";

const DashboardHeatmap = ({

    frecuencias = [],

    cumplimiento = [],

    brechas = []

}) => {

    const datos = useMemo(() => {

        const mapa = new Map();

        frecuencias.forEach(item => {

            mapa.set(item.empleado_id, {

                empleado_id: item.empleado_id,

                empleado: item.empleado,

                frecuencia: item.estado,

                cumplimiento: "-",

                brecha: "-"

            });

        });

        cumplimiento.forEach(item => {

            const fila =

                mapa.get(item.empleado_id) ||

                {

                    empleado_id: item.empleado_id,

                    empleado: item.empleado

                };

            fila.cumplimiento =

                item.estado;

            mapa.set(

                item.empleado_id,

                fila

            );

        });

        brechas.forEach(item => {

            const fila =

                mapa.get(item.empleado_id) ||

                {

                    empleado_id: item.empleado_id,

                    empleado: item.empleado

                };

            fila.brecha =

                item.estado;

            mapa.set(

                item.empleado_id,

                fila

            );

        });

        return Array.from(

            mapa.values()

        );

    }, [

        frecuencias,

        cumplimiento,

        brechas

    ]);

    const color = estado => {

        switch (estado) {

            case "VIGENTE":

            case "CUMPLE":

            case "CORRECTA":

                return "success";

            case "PROXIMA":

            case "RIESGO":

                return "warning";

            default:

                return "danger";

        }

    };

    const semaforo = row => {

        const estados = [

            row.frecuencia,

            row.cumplimiento,

            row.brecha

        ];

        if (

            estados.includes("VENCIDA") ||

            estados.includes("NO_CUMPLE") ||

            estados.includes("FUERA_RANGO")

        ) {

            return "🔴";

        }

        if (

            estados.includes("PROXIMA") ||

            estados.includes("RIESGO")

        ) {

            return "🟡";

        }

        return "🟢";

    };

    return (

        <Card>

            <Card.Header>

                Heatmap Ejecutivo

            </Card.Header>

            <Card.Body>

                <Table

                    bordered

                    hover

                    responsive

                >

                    <thead>

                        <tr>

                            <th>

                                Empleado

                            </th>

                            <th>

                                Frecuencia

                            </th>

                            <th>

                                Cumplimiento

                            </th>

                            <th>

                                Brecha

                            </th>

                            <th>

                                Estado

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            datos.map(row => (

                                <tr

                                    key={

                                        row.empleado_id

                                    }

                                >

                                    <td>

                                        {

                                            row.empleado

                                        }

                                    </td>

                                    <td>

                                        <Badge

                                            bg={

                                                color(

                                                    row.frecuencia

                                                )

                                            }

                                        >

                                            {

                                                row.frecuencia

                                            }

                                        </Badge>

                                    </td>

                                    <td>

                                        <Badge

                                            bg={

                                                color(

                                                    row.cumplimiento

                                                )

                                            }

                                        >

                                            {

                                                row.cumplimiento

                                            }

                                        </Badge>

                                    </td>

                                    <td>

                                        <Badge

                                            bg={

                                                color(

                                                    row.brecha

                                                )

                                            }

                                        >

                                            {

                                                row.brecha

                                            }

                                        </Badge>

                                    </td>

                                    <td

                                        style={{

                                            fontSize: 28,

                                            textAlign: "center"

                                        }}

                                    >

                                        {

                                            semaforo(

                                                row

                                            )

                                        }

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </Table>

            </Card.Body>

        </Card>

    );

};

export default DashboardHeatmap;

