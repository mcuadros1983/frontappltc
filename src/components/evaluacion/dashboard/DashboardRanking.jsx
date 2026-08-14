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

const DashboardRanking = ({

    ranking

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

    const obtenerNombre = id =>

        empleadosMap.get(

            Number(id)

        ) ||

        `Empleado #${id}`;

    const columns = [

        {

            key: "puesto",

            title: "#",

            render: (

                row,

                index

            ) => index + 1

        },

        {

            key: "empleado",

            title: "Empleado",

            render: row =>

                obtenerNombre(

                    row.empleado_id

                )

        },

        {

            key: "cantidad",

            title: "Eval."

        },

        {

            key: "promedio",

            title: "%",

            render: row =>

                Number(

                    row.promedio

                ).toFixed(2)

        }

    ];

    return (

        <Card>

            <Card.Header>

                Ranking General

            </Card.Header>

            <Card.Body>

                <ERPTable

                    columns={columns}

                    data={ranking || []}

                    pagination={false}

                />

            </Card.Body>

        </Card>

    );

};

export default DashboardRanking;