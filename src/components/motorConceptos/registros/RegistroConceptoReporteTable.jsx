import React from "react";

import {
    Badge,
    Table,
} from "react-bootstrap";

import {
    ERPCard,
} from "../../common/erp";

const formatDate = (value) => {

    if (!value) {
        return "-";
    }

    return new Date(value)
        .toLocaleDateString(
            "es-MX"
        );

};

const getEstadoLabel = (
    row
) => {

    switch (
    row.estado_visual ||
    row.estado
    ) {

        case "POR_VENCER":
            return "Próximo a vencer";

        case "VIGENTE":
            return "Vigente";

        case "VENCIDO":
            return "Vencido";

        case "BORRADOR":
            return "Borrador";

        case "PENDIENTE":
            return "Pendiente";

        case "ANULADO":
            return "Anulado";

        default:
            return row.estado;

    }

};

// const getEstadoVariant = (
//     estado
// ) => {

//     switch (estado) {

//         case "vigente":
//             return "success";

//         case "por_vencer":
//             return "warning";

//         case "vencido":
//             return "danger";

//         default:
//             return "secondary";

//     }

// };

const getEstadoVariant = (
    estado
) => {

    switch (
    String(
        estado || ""
    ).toUpperCase()
    ) {

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

const RegistroConceptoReporteTable = ({

    registros = [],

    loading = false,

}) => {

    if (loading) {

        return (

            <ERPCard>

                <div className="text-center py-5">

                    Cargando...

                </div>

            </ERPCard>

        );

    }

    return (

        <ERPCard>

            <div className="table-responsive">

                <Table
                    hover
                    striped
                    className="mb-0"
                >

                    <thead>

                        <tr>

                            <th>
                                Concepto
                            </th>

                            <th>
                                Tipo entidad
                            </th>

                            <th>
                                Estado
                            </th>

                            <th>
                                Versión
                            </th>

                            <th>
                                Fecha vencimiento
                            </th>

                            <th>
                                Días restantes
                            </th>

                            <th>
                                Último movimiento
                            </th>

                            <th className="text-center">
                                Versiones
                            </th>

                            <th className="text-center">
                                Archivos
                            </th>

                            <th className="text-center">
                                Activo
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            registros.length === 0 && (

                                <tr>

                                    <td
                                        colSpan={10}
                                        className="text-center py-4"
                                    >

                                        No existen registros.

                                    </td>

                                </tr>

                            )

                        }

                        {

                            registros.map(
                                row => (

                                    <tr
                                        key={row.id}
                                    >

                                        <td>

                                            {
                                                row.concepto?.nombre ||
                                                "-"
                                            }

                                        </td>

                                        <td>

                                            {
                                                row.entidad_tipo?.nombre ||
                                                "-"
                                            }

                                        </td>

                                        <td>

                                            <Badge
                                                bg={
                                                    getEstadoVariant(
                                                        row.estado_visual ||
                                                        row.estado
                                                    )
                                                }
                                            >

                                                {
                                                    getEstadoLabel(
                                                        row
                                                    )
                                                }

                                            </Badge>

                                        </td>

                                        <td>

                                            {

                                                row.version_actual

                                                    ? `V${row.version_actual.numero}`

                                                    : "-"

                                            }

                                        </td>

                                        <td>

                                            {
                                                formatDate(
                                                    row.fecha_vencimiento
                                                )
                                            }

                                        </td>

                                        <td>

                                            {

                                                row.dias_restantes ??

                                                "-"

                                            }

                                        </td>

                                        <td>

                                            {
                                                formatDate(
                                                    row.ultimo_movimiento
                                                )
                                            }

                                        </td>

                                        <td className="text-center">

                                            {

                                                row.total_versiones

                                            }

                                        </td>

                                        <td className="text-center">

                                            {

                                                row.total_archivos

                                            }

                                        </td>

                                        <td className="text-center">

                                            <Badge
                                                bg={
                                                    row.activo
                                                        ? "success"
                                                        : "secondary"
                                                }
                                            >

                                                {

                                                    row.activo

                                                        ? "Sí"

                                                        : "No"

                                                }

                                            </Badge>

                                        </td>

                                    </tr>

                                )
                            )

                        }

                    </tbody>

                </Table>

            </div>

        </ERPCard>

    );

};

export default RegistroConceptoReporteTable;