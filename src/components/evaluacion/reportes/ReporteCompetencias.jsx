import React from "react";
import ReporteTable from "./ReporteTable";

const ReporteCompetencias = ({ data = [] }) => {

    const columns = [

        {
            Header: "Competencia",
            accessor: "competencia"
        },

        {
            Header: "Promedio",
            accessor: "promedio"
        },

        {
            Header: "%",
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

export default ReporteCompetencias;