import React, { useContext } from "react";
import DataContext from "../../../context/DataContext";
import ReporteTable from "./ReporteTable";
import Contexts from "../../../context/Contexts";
import obtenerNombreEvaluador from "./helpers/obtenerNombreEvaluador";
const ReporteHistorico = ({ data = [] }) => {

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
            Header: "Tipo",
            accessor: "tipo"
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
            Header: "Resultado",
            accessor: "porcentaje"
        },

        {
            Header: "Estado",
            accessor: "estado"
        }

    ];

    return (

        <ReporteTable

            columns={columns}

            data={data}

        />

    );

};

export default ReporteHistorico;