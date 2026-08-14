import React, {

    useContext,

    useMemo

} from "react";

import Contexts from "../../../context/Contexts";

import {

    Card

} from "react-bootstrap";

import {

    ERPTable

} from "../../common/erp";

const ReporteParticipantesTab = ({

    dashboard

}) => {

    const {

        empleados

    } = useContext(

        Contexts.DataContext

    );

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

    const nombreEmpleado = id =>

        empleadosMap.get(

            Number(id)

        ) ||

        `Empleado #${id}`;

    if (!dashboard) {

        return null;

    }

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

            render: row =>

                row.evaluador_id

                    ? nombreEmpleado(

                        row.evaluador_id

                    )

                    : "-"

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

            key: "porcentaje",

            title: "Resultado",

            render: row =>

                `${

                    Number(

                        row.porcentaje

                    ).toFixed(2)

                } %`

        }

    ];

    return (

        <Card>

            <Card.Header>

                Participantes

            </Card.Header>

            <Card.Body>

                <ERPTable

                    columns={columns}

                    data={

                        dashboard.participantes || []

                    }

                    pagination={false}

                />

            </Card.Body>

        </Card>

    );

};

export default ReporteParticipantesTab;