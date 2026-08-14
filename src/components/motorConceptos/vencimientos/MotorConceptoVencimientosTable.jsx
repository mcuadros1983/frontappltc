import React from "react";

import {
    ERPBadge,
    ERPCard,
    ERPEmpty,
    ERPTable,
} from "../../common/erp";

import MotorConceptoVencimientosActions
    from "./MotorConceptoVencimientosActions";

const getEstadoVariant = (estado) => {

    switch (estado) {

        case "VIGENTE":
            return "success";

        case "POR_VENCER":
            return "warning";

        case "VENCIDO":
            return "danger";

        case "PENDIENTE":
            return "info";

        case "BORRADOR":
            return "secondary";

        case "ANULADO":
            return "dark";

        default:
            return "secondary";

    }

};
const columns = [

    {
        key: "entidad",
        label: "Entidad",
    },

    {
        key: "tipo_entidad",
        label: "Tipo",
    },

    {
        key: "concepto",
        label: "Concepto",
    },

    {
        key: "documento",
        label: "Documento",
    },

    {
        key: "fecha_documento",
        label: "Fecha emisión",
    },

    {
        key: "fecha_vencimiento",
        label: "Fecha vencimiento",
    },

    {
        key: "dias_restantes",
        label: "Días",
    },

    {
        key: "estado",
        label: "Estado",
    },

    {
        key: "acciones",
        label: "",
        align: "right",
    },

];

const MotorConceptoVencimientosTable = ({

    documentos = [],

    pagination,

    onPageChange,

    onView,

    onRenew,

    onDownload,

    onLegajo,

}) => {

    if (!documentos.length) {

        return (

            <ERPEmpty

                title="No se encontraron vencimientos"

                description="No existen documentos para los filtros seleccionados."

            />

        );

    }

    return (

        <ERPCard>

            <ERPTable

                columns={columns}

                data={documentos}

                pagination={pagination}

                onPageChange={onPageChange}

                rowKey="id"

                renderCell={(column, row) => {

                    switch (column.key) {

                        case "estado":

                            return (

                                <ERPBadge
                                    variant={getEstadoVariant(row.estado_visual)}
                                >
                                    {row.estado_visual}
                                </ERPBadge>

                            );

                        case "acciones":

                            return (

                                <MotorConceptoVencimientosActions

                                    row={row}

                                    onView={onView}

                                    onRenew={onRenew}

                                    onDownload={onDownload}

                                    onLegajo={onLegajo}

                                />

                            );

                        default:

                            return row[column.key];

                    }

                }}

            />

        </ERPCard>

    );

};

export default MotorConceptoVencimientosTable;