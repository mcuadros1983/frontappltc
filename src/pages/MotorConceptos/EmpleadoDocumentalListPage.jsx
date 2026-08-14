import React,
{
    useContext,
    useMemo,
    useCallback,
    useEffect,
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

const EmpleadoDocumentalListPage = () => {

    const navigate =
        useNavigate();

    const {
        empleados = [],
    } = useContext(
        Contexts.DataContext
    );

    console.log(
        "================ EMPLEADOS DATACONTEXT ================"
    );

    console.log(
        "empleados:",
        empleados
    );

    console.log(
        "empleados length:",
        empleados.length
    );

    console.log(
        "primer empleado:",
        empleados[0]
    );

    console.log(
        "segundo empleado:",
        empleados[1]
    );

    const {

        buscarPorCodigo,

        loading,

    } = useMotorEntidadTipos();

    const entidadTipo =
        buscarPorCodigo(
            "EMPLEADO"
        );

    console.log(
        "================ TIPO ENTIDAD EMPLEADO ================"
    );

    console.log(
        "entidadTipo:",
        entidadTipo
    );
    const [
        resumenDocumental,
        setResumenDocumental,
    ] = useState([]);

    const [
        resumenLoading,
        setResumenLoading,
    ] = useState(false);

    const [
        totalObligatorios,
        setTotalObligatorios,
    ] = useState(0);


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
                            Number(
                                response?.total_obligatorios ||
                                0
                            )
                        );

                    } catch (
                    error
                    ) {

                        console.error(
                            "Error cargando resumen documental:",
                            error
                        );

                        if (
                            mounted
                        ) {

                            setResumenDocumental(
                                []
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
                mounted = false;
            };

        },
        [
            entidadTipo?.id,
        ]
    );

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

    console.log(
        "========== DEBUG RESUMEN EMPLEADOS =========="
    );

    console.log(
        "entidadTipo:",
        entidadTipo
    );

    console.log(
        "resumenDocumental:",
        resumenDocumental
    );

    console.log(
        "resumen entidad 10:",
        resumenMap.get(10)
    );

    console.log(
        "resumen entidad 15:",
        resumenMap.get(15)
    );

    console.log(
        "============================================="
    );

    const empleadosTabla =
        useMemo(
            () => {

                return empleados.map(
                    (
                        emp
                    ) => {

                        console.log(
                            "----------------------------------------"
                        );

                        console.log(
                            "empleado original:",
                            emp
                        );

                        console.log(
                            "emp.id:",
                            emp?.id
                        );

                        console.log(
                            "emp.empleado:",
                            emp?.empleado
                        );

                        console.log(
                            "emp.clientePersona:",
                            emp?.clientePersona
                        );

                        console.log(
                            "emp.sucursal:",
                            emp?.sucursal
                        );

                        const id =

                            emp?.empleado?.id ??

                            emp?.id;

                        console.log(
                            "id calculado:",
                            id
                        );

                        const resumen =
                            resumenMap.get(
                                Number(id)
                            );

                        const apellido =

                            emp?.clientePersona?.apellido ??

                            emp?.empleado?.apellido ??

                            "";

                        console.log(
                            "apellido calculado:",
                            apellido
                        );

                        const nombre =

                            emp?.clientePersona?.nombre ??

                            emp?.empleado?.nombre ??

                            "";

                        console.log(
                            "nombre calculado:",
                            nombre
                        );

                        const sucursalNombre =

                            emp?.sucursal?.nombre ??

                            "";

                        console.log(
                            "sucursal calculada:",
                            sucursalNombre
                        );

                        console.log(
                            "registro normalizado:",
                            {
                                id,
                                apellido,
                                nombre,
                                sucursal:
                                    sucursalNombre,
                            }
                        );

                        return {

                            id,

                            legajo:
                                emp?.empleado?.legajo ??
                                emp?.legajo ??
                                "",

                            apellido,

                            nombre,

                            nombreCompleto:
                                `${apellido} ${nombre}`.trim(),

                            sucursal:
                                sucursalNombre,

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
                empleados,
                resumenMap,
                totalObligatorios,
            ]
        );

    console.log(
        "================ EMPLEADOS TABLA ================"
    );

    console.log(
        "empleadosTabla:",
        empleadosTabla
    );

    console.log(
        "primer empleado tabla:",
        empleadosTabla[0]
    );

    const abrirDocumentacion =
        useCallback(

            (
                empleado,
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
                                empleado.id,

                            entidad_nombre:
                                empleado.nombreCompleto,

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

    const columns =
        useMemo(
            () => [

                // {

                //     title:
                //         "Legajo",

                //     key:
                //         "legajo",

                // },

                {

                    title:
                        "Apellido",

                    key:
                        "apellido",

                },

                {

                    title:
                        "Nombre",

                    key:
                        "nombre",

                },

                // {

                //     title:
                //         "Sucursal",

                //     key:
                //         "sucursal",

                // },
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

            title="Documentación de Empleados"

            subtitle="Seleccione un empleado"

        >

            <ERPCard>

                <EntidadSelectorTable

                    data={
                        empleadosTabla
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

export default EmpleadoDocumentalListPage;