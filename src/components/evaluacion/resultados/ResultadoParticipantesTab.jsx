import React, {

    useContext,

    useMemo

} from "react";

import Contexts from "../../../context/Contexts";

import {

    ERPTable

} from "../../common/erp";

const ResultadoParticipantesTab = ({

    participantes

}) => {

    console.log("participantes", participantes)

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

            key: "empleado",

            title: "Empleado",

            render: row =>

                nombreEmpleado(

                    row.empleado_id

                )

        },

        {

            key: "tipo_respuesta",

            title: "Tipo"

        },

        {

            key: "evaluador",

            title: "Evaluador",

            render: row => {

                if (

                    !row.evaluador_id

                ) {

                    return "-";

                }

                return nombreEmpleado(

                    row.evaluador_id

                );

            }

        },

        {

            key: "fecha",

            title: "Fecha",

            render: row =>

                new Date(

                    row.fecha_respuesta

                ).toLocaleDateString()

        },

        {
            key: "puntaje",

            title: "Puntaje",

            render: row => {

                if (
                    row.puntaje_total === null ||
                    row.puntaje_total === undefined ||
                    row.puntaje_total === ""
                ) {

                    return "-";

                }

                const puntaje = Number(
                    row.puntaje_total
                );

                return Number.isFinite(puntaje)
                    ? puntaje.toFixed(2)
                    : "-";

            }
        },

        {
            key: "porcentaje",

            title: "%",

            render: row => {

                const porcentaje = Number(
                    row.porcentaje
                );

                return Number.isFinite(porcentaje)
                    ? `${porcentaje.toFixed(2)} %`
                    : "-";

            }
        }

    ];

    return (

        <ERPTable

            columns={columns}

            data={

                participantes || []

            }

        />

    );

};

export default ResultadoParticipantesTab;