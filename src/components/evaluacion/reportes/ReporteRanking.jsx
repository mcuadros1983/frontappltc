import React, { useContext } from "react";
import DataContext from "../../../context/DataContext";
import ReporteTable from "./ReporteTable";
import Contexts from "../../../context/Contexts";

const ReporteRanking = ({ data = [] }) => {

    const {

        empleados,
        sucursales

    } = useContext(

        Contexts.DataContext

    );

    const columns = [

        {
            Header: "#",
            accessor: "posicion"
        },

        {
            Header: "Empleado",
            accessor: row => {

                const empleado = empleados.find(

                    item => item.empleado.id === row.empleado_id

                );

                return empleado

                    ? `${empleado.empleado.nombre} ${empleado.empleado.apellido}`

                    : "-";

            }
        },

        {
            Header: "Promedio",
            accessor: "promedio"
        },

        {
            Header: "Evaluaciones",
            accessor: "evaluaciones"
        }

    ];

    return (

        <ReporteTable

            columns={columns}

            data={data}

        />

    );

};

export default ReporteRanking;