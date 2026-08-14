import React, { useContext } from "react";
import DataContext from "../../../context/DataContext";
import ReporteTable from "./ReporteTable";
import Contexts from "../../../context/Contexts";
import obtenerNombreEvaluador from "./helpers/obtenerNombreEvaluador";
const ReporteComentarios = ({ data = [] }) => {

    const {

        empleados,
        sucursales

    } = useContext(

        Contexts.DataContext

    );

    const columns = [

        {
            Header: "Fecha",
            accessor: "fecha"
        },

        {
            Header: "Evaluador",
            accessor: row =>

                obtenerNombreEvaluador(

                    empleados,

                    row

                )
        },

        {
            Header: "Criterio",
            accessor: "criterio"
        },

        {
            Header: "Comentario",
            accessor: "comentario"
        }

    ];

    return (

        <ReporteTable

            columns={columns}

            data={data}

        />

    );

};

export default ReporteComentarios;