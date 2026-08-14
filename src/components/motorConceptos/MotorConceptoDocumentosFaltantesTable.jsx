import React from "react";

import {
    Badge,
    Button,
} from "react-bootstrap";

import ERPTable from "../../components/common/erp/ERPTable";

const badge = {

    CUMPLIDO: "success",

    FALTANTE: "danger",

    PROXIMO_A_VENCER: "warning",

    VENCIDO: "dark",

};

const MotorConceptoDocumentosFaltantesTable = ({
    loading,
    documentos,
    onOpen,
}) => {

    const columns = [

        {
            key: "codigo",
            title: "Código",
        },

        {
            key: "nombre",
            title: "Concepto",
        },

        {
            key: "estado",
            title: "Estado",
            render: row => (

                <Badge
                    bg={
                        badge[row.estado]
                    }
                >
                    {row.estado}
                </Badge>

            ),
        },

        {
            key: "fecha_vencimiento",
            title: "Vence",
            render: row =>
                row.fecha_vencimiento || "-",
        },

        {
            key: "acciones",
            title: "",
            render: row => (

                <Button
                    size="sm"
                    onClick={() =>
                        onOpen(row)
                    }
                >

                    {row.registro_id
                        ? "Ver"
                        : "Subir"}

                </Button>

            ),
        },

    ];

    return (

        <ERPTable

            loading={loading}

            columns={columns}

            data={documentos}

            emptyMessage="No existen documentos."

        />

    );

};

export default MotorConceptoDocumentosFaltantesTable;