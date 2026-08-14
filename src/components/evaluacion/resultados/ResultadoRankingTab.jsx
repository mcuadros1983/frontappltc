import React, {

    useContext,

    useMemo

} from "react";

import Contexts from "../../../context/Contexts";

import {

    ERPTable

} from "../../common/erp";

const ResultadoRankingTab = ({

    ranking

}) => {

    const {

        empleados

    } = useContext(

        Contexts.DataContext

    );

    /*=========================================
    MAPA EMPLEADOS
    =========================================*/

    const empleadosMap = useMemo(() => {

        const map = new Map();

        empleados.forEach(emp => {

            const id =

                emp?.empleado?.id ??

                emp?.id;

            if (!id) return;

            const apellido =

                emp?.clientePersona?.apellido ||

                emp?.empleado?.apellido ||

                "";

            const nombre =

                emp?.clientePersona?.nombre ||

                emp?.empleado?.nombre ||

                "";

            map.set(

                Number(id),

                `${apellido} ${nombre}`.trim()

            );

        });

        return map;

    }, [

        empleados

    ]);

    const nombreEmpleado = (id) =>

        empleadosMap.get(

            Number(id)

        ) ||

        `Empleado #${id}`;

    /*=========================================
    COLUMNAS
    =========================================*/

    const columns = [

        {

            key: "puesto",

            title: "#",

            render: (

                row,

                index

            ) =>

                index + 1

        },

        {

            key: "empleado",

            title: "Empleado",

            render: row =>

                nombreEmpleado(

                    row.empleado_id

                )

        },

        {

            key: "cantidad",

            title: "Evaluaciones"

        },

        {

            key: "promedio",

            title: "Promedio",

            render: row =>

                `${

                    Number(

                        row.promedio

                    ).toFixed(2)

                } %`

        },

        {

            key: "ultima",

            title: "Última Evaluación",

            render: row =>

                new Date(

                    row.ultima

                ).toLocaleDateString()

        }

    ];

    return (

        <ERPTable

            data={

                ranking || []

            }

            columns={columns}

        />

    );

};

export default ResultadoRankingTab;