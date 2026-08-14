import React,
{
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import Contexts
    from "../../context/Contexts";

import useMotorEntidadTipos
    from "../../hooks/useMotorEntidadTipos";

import EntidadSelectorTable
    from "../../components/motorConceptos/entidad/EntidadSelectorTable";

import motorConceptoRegistroApi
    from "../../services/motorConceptoRegistroApi";


const EmpresaDocumentalListPage = () => {

    const navigate =
        useNavigate();


    const {
        empresasTabla = [],
    } = useContext(
        Contexts.DataContext
    );


    const {
        buscarPorCodigo,
        loading,
    } = useMotorEntidadTipos();


    const entidadTipo =
        buscarPorCodigo(
            "EMPRESA"
        );


    /*
     * =========================================================
     * RESUMEN DOCUMENTAL
     * =========================================================
     */

    const [
        resumenDocumental,
        setResumenDocumental,
    ] = useState([]);

    const [
        totalObligatorios,
        setTotalObligatorios,
    ] = useState(0);

    const [
        resumenLoading,
        setResumenLoading,
    ] = useState(false);


    useEffect(
        () => {

            if (
                !entidadTipo?.id
            ) {
                return;
            }


            let mounted =
                true;


            const cargarResumen =
                async () => {

                    setResumenLoading(
                        true
                    );

                    try {

                        const response =
                            await motorConceptoRegistroApi
                                .obtenerResumenEntidades(
                                    entidadTipo.id
                                );


                        if (
                            !mounted
                        ) {
                            return;
                        }


                        setResumenDocumental(
                            Array.isArray(
                                response
                            )
                                ? response
                                : response?.rows ||
                                []
                        );

                        setTotalObligatorios(
                            Array.isArray(
                                response
                            )
                                ? 0
                                : Number(
                                    response?.total_obligatorios ||
                                    0
                                )
                        );

                    } catch (
                    error
                    ) {

                        console.error(
                            "Error cargando resumen documental de empresas:",
                            error
                        );


                        if (
                            mounted
                        ) {

                            setResumenDocumental(
                                []
                            );

                            setTotalObligatorios(
                                0
                            );

                        }

                    } finally {

                        if (
                            mounted
                        ) {

                            setResumenLoading(
                                false
                            );

                        }

                    }

                };


            cargarResumen();


            return () => {

                mounted =
                    false;

            };

        },
        [
            entidadTipo?.id,
        ]
    );


    /*
     * =========================================================
     * MAPA DE RESUMEN POR EMPRESA
     * =========================================================
     *
     * Key:
     * entidad_id
     *
     * Value:
     * {
     *   vigentes,
     *   por_vencer,
     *   vencidos,
     *   pendientes
     * }
     */

    const resumenMap =
        useMemo(
            () =>
                new Map(
                    resumenDocumental.map(
                        (item) => [
                            Number(
                                item.entidad_id
                            ),
                            item,
                        ]
                    )
                ),
            [
                resumenDocumental,
            ]
        );


    /*
     * =========================================================
     * DATOS DE TABLA
     * =========================================================
     */

    const empresasDocumentales =
        useMemo(
            () => {

                return empresasTabla.map(
                    (empresa) => {

                        const resumen =
                            resumenMap.get(
                                Number(
                                    empresa.id
                                )
                            );


                        return {

                            ...empresa,

                            vigentes:
                                Number(
                                    resumen?.vigentes ||
                                    0
                                ),

                            porVencer:
                                Number(
                                    resumen?.por_vencer ||
                                    0
                                ),

                            vencidos:
                                Number(
                                    resumen?.vencidos ||
                                    0
                                ),

                            pendientes:
                                resumen
                                    ? Number(
                                        resumen.pendientes ||
                                        0
                                    )
                                    : Number(
                                        totalObligatorios ||
                                        0
                                    ),
                        };

                    }
                );

            },
            [
                empresasTabla,
                resumenMap,
                totalObligatorios
            ]
        );


    /*
     * =========================================================
     * ABRIR DOCUMENTACIÓN
     * =========================================================
     */

    const abrirDocumentacion =
        useCallback(

            (
                empresa,
                entidadTipo
            ) => {

                if (
                    !entidadTipo
                ) {
                    return;
                }


                navigate(

                    "/motor-conceptos/documentacion/entidad",

                    {

                        state: {

                            entidad_tipo_id:
                                entidadTipo.id,

                            entidad_id:
                                empresa.id,

                            entidad_nombre:
                                empresa.descripcion,

                            entidad_tipo_nombre:
                                entidadTipo.nombre,

                        },

                    }

                );

            },

            [
                navigate,
            ]

        );


    /*
     * =========================================================
     * COLUMNAS
     * =========================================================
     */

    const columns =
        useMemo(
            () => [

                {

                    title:
                        "ID",

                    key:
                        "id",

                },

                {

                    title:
                        "Empresa",

                    key:
                        "descripcion",

                },

                {

                    title:
                        "CUIT",

                    key:
                        "cuit",

                },

                {

                    title:
                        "Nombre Corto",

                    key:
                        "nombrecorto",

                    render:
                        (empresa) =>
                            empresa.nombrecorto ||
                            "-",

                },

                {

                    title:
                        "Vigentes",

                    key:
                        "vigentes",

                },

                {

                    title:
                        "Por vencer",

                    key:
                        "porVencer",

                },

                {

                    title:
                        "Vencidos",

                    key:
                        "vencidos",

                },

                {

                    title:
                        "Pendientes",

                    key:
                        "pendientes",

                },

            ],
            []
        );


    return (

        <ERPPage

            title="Documentación de Empresas"

            subtitle="Seleccione una empresa"

        >

            <ERPCard>

                <EntidadSelectorTable

                    data={
                        empresasDocumentales
                    }

                    columns={
                        columns
                    }

                    entidadTipo={
                        entidadTipo
                    }

                    loading={
                        loading ||
                        resumenLoading
                    }

                    onSeleccionar={
                        abrirDocumentacion
                    }

                />

            </ERPCard>

        </ERPPage>

    );

};


export default EmpresaDocumentalListPage;