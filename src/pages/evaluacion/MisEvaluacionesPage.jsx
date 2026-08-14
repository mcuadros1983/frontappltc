// src/pages/evaluacion/MisEvaluacionesPage.jsx

import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
    FiClipboard,
    FiEye
} from "react-icons/fi";

import {

    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPTable,
    ERPButton,
    ERPSearch,
    ERPBadge

} from "../../components/common/erp";

import {
    evaluacionApi
} from "../../services/evaluacion/evaluacionApi";

const MisEvaluacionesPage = () => {

    const navigate =
        useNavigate();

    const [loading, setLoading] =
        useState(false);

    const [rows, setRows] =
        useState([]);

    const [search, setSearch] =
        useState("");



    /*=========================================
      CARGAR
    =========================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const data =
                await evaluacionApi
                    .listarMisEvaluaciones();

            setRows(data || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        cargar();

    }, []);





    /*=========================================
      BUSCADOR
    =========================================*/

    const datos =
        useMemo(() => {

            if (!search.trim())
                return rows;

            const s =
                search.toLowerCase();

            return rows.filter(row =>

                String(row.numero || "")
                    .toLowerCase()
                    .includes(s)

                ||

                String(
                    row.empleado?.apellido || ""
                )
                    .toLowerCase()
                    .includes(s)

                ||

                String(
                    row.empleado?.nombre || ""
                )
                    .toLowerCase()
                    .includes(s)

                ||

                String(
                    row.tipo?.descripcion || ""
                )
                    .toLowerCase()
                    .includes(s)

            );

        }, [

            rows,

            search

        ]);





    /*=========================================
      RESPONDER
    =========================================*/

    const responder = (row) => {

        navigate(

            `/evaluacion/${row.id}`

        );

    };





    /*=========================================
      RESULTADO
    =========================================*/

    const resultado = (row) => {

        navigate(

            `/evaluacion/${row.id}/resultado`

        );

    };





    /*=========================================
      COLUMNAS
    =========================================*/

    const columns = [

        {

            key: "numero",

            title: "Número"

        },

        {

            key: "empleado",

            title: "Empleado",

            render: row =>

                `${row.empleado?.apellido || ""} ${row.empleado?.nombre || ""}`

        },

        {

            key: "tipo",

            title: "Tipo",

            render: row =>

                row.tipo?.descripcion

        },

        {

            key: "periodo",

            title: "Período",

            render: row =>

                row.periodo?.descripcion

        },

        {

            key: "fecha",

            title: "Fecha"

        },

        {

            key: "estado",

            title: "Estado",

            render: row => (

                <ERPBadge

                    status={row.estado}

                />

            )

        },

        {

            key: "porcentaje",

            title: "%",

            render: row =>

                `${Number(
                    row.porcentaje || 0
                ).toFixed(2)} %`

        }

    ];





    /*=========================================
      ACCIONES
    =========================================*/

    const actions = [

        {

            icon: <FiClipboard />,

            variant: "outline-success",

            title: "Responder",

            visible: row =>

                row.estado !==
                "FINALIZADA",

            onClick: responder

        },

        {

            icon: <FiEye />,

            variant: "outline-primary",

            title: "Resultado",

            visible: row =>

                row.estado ===
                "FINALIZADA",

            onClick: resultado

        }

    ];

        /*=========================================
      RENDER
    =========================================*/

    return (

        <ERPPage

            title="Mis Evaluaciones"

            subtitle="Evaluaciones asignadas al usuario"

        >

            <ERPCard>

                <ERPToolbar

                    left={

                        <ERPSearch

                            value={search}

                            onChange={setSearch}

                            placeholder="Buscar evaluación..."

                        />

                    }

                    right={

                        <ERPButton

                            variant="secondary"

                            onClick={cargar}

                        >

                            Actualizar

                        </ERPButton>

                    }

                />

                <ERPTable

                    columns={columns}

                    data={datos}

                    actions={actions}

                    loading={loading}

                    emptyMessage="No existen evaluaciones asignadas."

                />

            </ERPCard>

        </ERPPage>

    );

};

export default MisEvaluacionesPage;