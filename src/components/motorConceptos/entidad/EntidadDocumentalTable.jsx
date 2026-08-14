import React,
{
    useMemo,
} from "react";

import {
    Badge,
} from "react-bootstrap";

import {
    ERPButton,
    ERPTable,
} from "../../common/erp";


const formatFecha = (
    fecha
) => {

    if (
        !fecha
    ) {
        return "-";
    }

    try {

        return new Date(
            fecha
        ).toLocaleDateString();

    } catch {

        return fecha;

    }

};


const getEstadoBadge = (
    estado
) => {

    switch (
        estado
    ) {

        case "COMPLETO":

            return (
                <Badge bg="success">
                    Completo
                </Badge>
            );

        case "PENDIENTE":

            return (
                <Badge bg="danger">
                    Pendiente
                </Badge>
            );

        case "POR_VENCER":

            return (
                <Badge bg="warning">
                    Por vencer
                </Badge>
            );

        case "VENCIDO":

            return (
                <Badge bg="dark">
                    Vencido
                </Badge>
            );

        default:

            return (
                <Badge bg="secondary">
                    {
                        estado ||
                        "-"
                    }
                </Badge>
            );

    }

};


const EntidadDocumentalTable = ({

    asignaciones = [],

    loading = false,

    onNuevo,

    onEditar,

    onVer,

}) => {

    const columns =
        useMemo(
            () => [

                {
                    key:
                        "concepto",

                    title:
                        "Concepto",

                    render:
                        (row) =>

                            row
                                ?.concepto
                                ?.nombre ||

                            "-",
                },

                {
                    key:
                        "estado",

                    title:
                        "Estado",

                    render:
                        (row) =>

                            getEstadoBadge(
                                row.estado
                            ),
                },

                {
                    key:
                        "fecha_vencimiento",

                    title:
                        "Vencimiento",

                    render:
                        (row) =>

                            formatFecha(
                                row
                                    ?.registroActual
                                    ?.fecha_vencimiento
                            ),
                },

                {
                    key:
                        "registro_actual_id",

                    title:
                        "Registro",

                    render:
                        (row) =>

                            row
                                ?.registro_actual_id ||

                            "-",
                },

                {
                    key:
                        "acciones",

                    title:
                        "Acciones",

                    render:
                        (item) => {

                            const tieneRegistro =
                                Boolean(
                                    item
                                        ?.registro_actual_id
                                );

                            return (

                                <div className="d-flex gap-2">

                                    {
                                        tieneRegistro
                                            ? (

                                                <ERPButton

                                                    type="edit"

                                                    size="sm"

                                                    onClick={() =>
                                                        onEditar?.(
                                                            item
                                                        )
                                                    }

                                                />

                                            )
                                            : (

                                                <ERPButton

                                                    type="new"

                                                    size="sm"

                                                    onClick={() =>
                                                        onNuevo?.(
                                                            item
                                                        )
                                                    }

                                                />

                                            )
                                    }

                                    {
                                        tieneRegistro && (

                                            <ERPButton

                                                type="view"

                                                size="sm"

                                                onClick={() =>
                                                    onVer?.(
                                                        item
                                                    )
                                                }

                                            />

                                        )
                                    }

                                </div>

                            );

                        },
                },

            ],
            [
                onNuevo,
                onEditar,
                onVer,
            ]
        );


    return (

        <ERPTable

            columns={
                columns
            }

            data={
                asignaciones
            }

            loading={
                loading
            }

        />

    );

};


export default EntidadDocumentalTable;