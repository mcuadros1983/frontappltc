// src/pages/evaluacion/MetasPage.jsx

import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiEye
} from "react-icons/fi";

import {
    useNavigate
} from "react-router-dom";

import {
    ERPPage,
    ERPToolbar,
    ERPTable,
    ERPKpiCard,
    ERPBadge
} from "../../components/common/erp";

import {
    metaApi
} from "../../services/evaluacion/metaApi";

const MetasPage = () => {

    const navigate = useNavigate();

    /*=========================================================
      ESTADOS
    =========================================================*/

    const [loading, setLoading] = useState(false);

    const [metas, setMetas] = useState([]);

    /*=========================================================
      CARGAR
    =========================================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const data =
                await metaApi.listarMetas();

            setMetas(data || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargar();

    }, []);

    /*=========================================================
      KPI
    =========================================================*/

    const indicadores = useMemo(() => {

        const activas = metas.filter(

            item => item.estado === "ACTIVA"

        ).length;

        const inactivas = metas.filter(

            item => item.estado === "INACTIVA"

        ).length;

        const prioridadAlta = metas.filter(

            item => item.prioridad === "ALTA"

        ).length;

        const frecuencia = metas.filter(

            item => item.categoria === "FRECUENCIA"

        ).length;

        const cumplimiento = metas.filter(

            item => item.categoria === "CUMPLIMIENTO"

        ).length;

        const brechas = metas.filter(

            item => item.categoria === "BRECHA"

        ).length;

        return {

            total: metas.length,

            activas,

            inactivas,

            prioridadAlta,

            frecuencia,

            cumplimiento,

            brechas

        };

    }, [metas]);

    /*=========================================================
      ACCIONES
    =========================================================*/

    const nuevo = () => {

        navigate(

            "/evaluacion/metas/nuevo"

        );

    };

    const editar = (row) => {

        navigate(

            `/evaluacion/metas/${row.id}`

        );

    };

    const detalle = (row) => {

        navigate(

            `/evaluacion/metas/${row.id}/detalle`

        );

    };

    const eliminar = async (row) => {

        if (

            !window.confirm(

                `¿Desea eliminar la meta "${row.nombre}"?`

            )

        ) {

            return;

        }

        try {

            await metaApi.eliminarMeta(

                row.id

            );

            cargar();

        }

        catch (error) {

            console.error(error);

        }

    };

    const actions = [

        {

            icon: <FiEye />,

            title: "Detalle",

            variant: "outline-info",

            onClick: detalle

        },

        {

            icon: <FiEdit />,

            title: "Editar",

            variant: "outline-warning",

            onClick: editar

        },

        {

            icon: <FiTrash2 />,

            title: "Eliminar",

            variant: "outline-danger",

            onClick: eliminar

        }

    ];

    /*=========================================================
      COLUMNAS
    =========================================================*/

    const columns = [

        {

            key: "codigo",

            title: "Código"

        },

        {

            key: "nombre",

            title: "Meta"

        },

        {

            key: "categoria",

            title: "Categoría",

            render: row => (

                <ERPBadge

                    status={row.categoria}

                />

            )

        },

        {

            key: "tipo",

            title: "Tipo"

        },

        {

            key: "capa",

            title: "Capa"

        },

        {

            key: "comparacion",

            title: "Comparación",

            render: row =>

                row.categoria === "BRECHA"

                    ? row.comparacion || "-"

                    : "-"

        },

        {

            key: "prioridad",

            title: "Prioridad",

            render: row => (

                <ERPBadge

                    status={row.prioridad}

                />

            )

        },

        {

            key: "valor_objetivo",

            title: "Objetivo"

        },

        {

            key: "unidad_medida",

            title: "Unidad",

            render: row =>

                row.unidad_medida || "-"

        },

        {

            key: "frecuencia_unidad",

            title: "Frecuencia",

            render: row =>

                row.categoria === "FRECUENCIA"

                    ? row.frecuencia_unidad || "-"

                    : "-"

        },

        {

            key: "ponderacion",

            title: "Peso (%)"

        },

        {

            key: "estado",

            title: "Estado",

            render: row => (

                <ERPBadge

                    status={row.estado}

                />

            )

        }

    ];

    const datos = useMemo(() => {

        return [...metas].sort((a, b) => {

            if (a.categoria !== b.categoria) {

                return a.categoria.localeCompare(

                    b.categoria

                );

            }

            return a.tipo.localeCompare(

                b.tipo

            );

        });

    }, [metas]);

    const inicializar = async () => {

        if (

            !window.confirm(

                "Se crearán las metas por defecto si aún no existen."

            )

        ) {

            return;

        }

        try {

            await metaApi.inicializarMetas();

            cargar();

        }

        catch (error) {

            console.error(error);

        }

    };


    return (

        <ERPPage

            title="Gestión de Metas"

            subtitle="Administración de metas y objetivos de desempeño"

        >

            {/*=========================================================
              TOOLBAR
            =========================================================*/}

            <ERPToolbar>

                <button

                    className="btn btn-primary"

                    onClick={nuevo}

                >

                    <FiPlus className="me-2" />

                    Nueva Meta

                </button>

                {metas.length === 0 && (

                    <button

                        className="btn btn-success ms-2"

                        onClick={inicializar}

                    >

                        Inicializar Configuración

                    </button>

                )}

            </ERPToolbar>

            {/*=========================================================
              KPI
            =========================================================*/}

            <div className="row mb-4">

                <div className="col-lg-2">

                    <ERPKpiCard

                        title="Metas"

                        value={indicadores.total}

                        color="primary"

                    />

                </div>

                <div className="col-lg-2">

                    <ERPKpiCard

                        title="Activas"

                        value={indicadores.activas}

                        color="success"

                    />

                </div>

                <div className="col-lg-2">

                    <ERPKpiCard

                        title="Frecuencia"

                        value={indicadores.frecuencia}

                        color="info"

                    />

                </div>

                <div className="col-lg-2">

                    <ERPKpiCard

                        title="Cumplimiento"

                        value={indicadores.cumplimiento}

                        color="warning"

                    />

                </div>

                <div className="col-lg-2">

                    <ERPKpiCard

                        title="Brechas"

                        value={indicadores.brechas}

                        color="danger"

                    />

                </div>

                <div className="col-lg-2">

                    <ERPKpiCard

                        title="Alta"

                        value={indicadores.prioridadAlta}

                        color="secondary"

                    />

                </div>

            </div>

            {/*=========================================================
              TABLA
            =========================================================*/}

            <ERPTable

                title="Catálogo de Metas"

                columns={columns}

                data={datos}

                actions={actions}

                loading={loading}

                emptyMessage="No existen metas registradas."

            />

        </ERPPage>

    );

};

export default MetasPage;

