import React, {

    useContext,

    useMemo

} from "react";

import Contexts from "../../../context/Contexts";

import {

    Badge,

    Card

} from "react-bootstrap";

import {

    ERPTable

} from "../../common/erp";

const DashboardUltimas = ({

    ultimas

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

    const badgeEstado = estado => {

        switch (estado) {

            case "FINALIZADA":

                return (

                    <Badge bg="success">

                        FINALIZADA

                    </Badge>

                );

            case "PENDIENTE":

                return (

                    <Badge bg="warning">

                        PENDIENTE

                    </Badge>

                );

            default:

                return (

                    <Badge bg="secondary">

                        {estado}

                    </Badge>

                );

        }

    };

    const columns = [

        {

            key: "numero",

            title: "Número"

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

            key: "tipo",

            title: "Tipo",

            render: row =>

                row.tipo?.descripcion

        },

        {

            key: "periodo",

            title: "Período",

            render: row =>

                row.periodo?.descripcion

        },

        {

            key: "estado",

            title: "Estado",

            render: row =>

                badgeEstado(

                    row.estado

                )

        }

    ];

    return (

        <Card>

            <Card.Header>

                Últimas Evaluaciones

            </Card.Header>

            <Card.Body>

                <ERPTable

                    columns={columns}

                    data={ultimas || []}

                    pagination={false}

                />

            </Card.Body>

        </Card>

    );

};

export default DashboardUltimas;