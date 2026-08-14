import React,
{
    useEffect,
} from "react";

import {
    Alert,
} from "react-bootstrap";

import {
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import EntidadDocumentalToolbar
    from "../../components/motorConceptos/entidad/EntidadDocumentalToolbar";

import EntidadDocumentalFilters
    from "../../components/motorConceptos/entidad/EntidadDocumentalFilters";

import EntidadDocumentalResumen
    from "../../components/motorConceptos/entidad/EntidadDocumentalResumen";

import EntidadDocumentalTable
    from "../../components/motorConceptos/entidad/EntidadDocumentalTable";

import EntidadDocumentalLoading
    from "../../components/motorConceptos/entidad/EntidadDocumentalLoading";

import EntidadDocumentalEmpty
    from "../../components/motorConceptos/entidad/EntidadDocumentalEmpty";

import useEntidadDocumental
    from "../../hooks/useEntidadDocumental";

const EntidadDocumentalPage = ({

    entidadTipoId,

    entidadId,

    entidadNombre,

    entidadTipoNombre,

}) => {

    const {

        asignaciones,

        loading,

        error,

        message,

        filters,

        changeFilters,

        refresh,

        loadEntidad,

    } = useEntidadDocumental();

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const state =
        location.state || {};

    const entidadTipoIdValue =

        entidadTipoId ||

        state.entidad_tipo_id;

    const entidadIdValue =

        entidadId ||

        state.entidad_id;

    const entidadNombreValue =

        entidadNombre ||

        state.entidad_nombre;

    const entidadTipoNombreValue =

        entidadTipoNombre ||

        state.entidad_tipo_nombre;

    useEffect(
        () => {

            if (

                !entidadTipoIdValue ||

                !entidadIdValue

            ) {

                return;

            }

            loadEntidad(

                entidadTipoIdValue,

                entidadIdValue

            );

        },
        [

            entidadTipoIdValue,

            entidadIdValue,

            loadEntidad,

        ]
    );

    const handleNuevo =
        (item) => {

            navigate(
                "/motor-conceptos/documentacion/entidad/nuevo",
                {

                    state: {

                        concepto_id:
                            item.concepto_id,

                        entidad_tipo_id:
                            item.entidad_tipo_id,

                        entidad_id:
                            item.entidad_id,

                        entidad_nombre:
                            entidadNombreValue,

                        entidad_tipo_nombre:
                            entidadTipoNombreValue,

                        fromEntidad:
                            true,

                        /*
                * Ruta de retorno después
                * de crear el registro.
                */
                        documentalPath:
                            "/motor-conceptos/documentacion/entidad",

                    },

                }
            );

        };

    const handleEditar =
        (item) => {

            if (
                !item.registro_actual_id
            ) {
                return;
            }

            navigate(
                `/motor-conceptos/registros/${item.registro_actual_id}`,
                {

                    state: {

                        entidad_tipo_id:
                            item.entidad_tipo_id,

                        entidad_id:
                            item.entidad_id,

                        entidad_nombre:
                            entidadNombreValue,

                        entidad_tipo_nombre:
                            entidadTipoNombreValue,

                        fromEntidad:
                            true,

                    },

                }
            );

        };

    const handleVer =
        (item) => {

            if (
                !item.registro_actual_id
            ) {
                return;
            }

            navigate(
                `/motor-conceptos/registros/${item.registro_actual_id}`,
                {

                    state: {

                        entidad_tipo_id:
                            item.entidad_tipo_id,

                        entidad_id:
                            item.entidad_id,

                        entidad_nombre:
                            entidadNombreValue,

                        entidad_tipo_nombre:
                            entidadTipoNombreValue,

                        fromEntidad:
                            true,

                        readOnly:
                            true,

                    },

                }
            );

        };

    console.log(
        "=========== ASIGNACIONES DOCUMENTALES ==========="
    );

    console.log(
        asignaciones
    );

    asignaciones.forEach(
        (item) => {

            console.log({
                concepto_id:
                    item.concepto_id,

                concepto:
                    item.concepto?.nombre,

                estado:
                    item.estado,

                registro_actual_id:
                    item.registro_actual_id,

                obligatorio:
                    item.obligatorio,
            });

        }
    );

    return (

        <ERPPage

            title="Gestión Documental"

            subtitle={
                entidadNombreValue || ""
            }

        >

            {
                error && (

                    <Alert
                        variant="danger"
                    >

                        {error}

                    </Alert>

                )
            }

            {
                message && (

                    <Alert
                        variant="success"
                    >

                        {message}

                    </Alert>

                )
            }

            <EntidadDocumentalToolbar

                loading={loading}

                onRefresh={refresh}

                onExport={() => {

                    console.log(
                        "Exportar"
                    );

                }}

            />

            <EntidadDocumentalResumen

                asignaciones={
                    asignaciones
                }

                entidadNombre={
                    entidadNombreValue
                }

                entidadTipoNombre={
                    entidadTipoNombreValue
                }

            />

            <ERPCard>

                <EntidadDocumentalFilters

                    filters={
                        filters
                    }

                    onChange={
                        changeFilters
                    }

                />

                {

                    loading

                        ? (

                            <EntidadDocumentalLoading />

                        )

                        : asignaciones.length === 0

                            ? (

                                <EntidadDocumentalEmpty

                                    title="Sin documentación"

                                    message="No existen conceptos asignados para esta entidad."

                                />

                            )

                            : (

                                <EntidadDocumentalTable

                                    asignaciones={
                                        asignaciones
                                    }

                                    loading={
                                        loading
                                    }

                                    onNuevo={
                                        handleNuevo
                                    }

                                    onEditar={
                                        handleEditar
                                    }

                                    onVer={
                                        handleVer
                                    }

                                />

                            )

                }

            </ERPCard>

        </ERPPage>

    );

};

export default EntidadDocumentalPage;