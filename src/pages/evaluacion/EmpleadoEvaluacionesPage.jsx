// src/pages/evaluacion/EmpleadoEvaluacionesPage.jsx

import React, {
    useEffect,
    useState
} from "react";

import {

    FiEye,
    FiDownload,
    FiFilter,
    FiRefreshCw

} from "react-icons/fi";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    FiEye
} from "react-icons/fi";

import {

    ERPPage,
    ERPCard,
    ERPToolbar,
    ERPTable,
    ERPButton,
    ERPBadge,
    ERPKpiCard,
    ERPLineChart,
    ERPBarChart

} from "../../components/common/erp";

import {
    evaluacionApi
} from "../../services/evaluacion/evaluacionApi";

import ResultadoEvaluacionModal
    from "../../components/evaluacion/ResultadoEvaluacionModal";


const EmpleadoEvaluacionesPage = () => {

    const { id } = useParams();

    const navigate =
        useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [empleado, setEmpleado] =
        useState(null);

    const [indicadores, setIndicadores] =
        useState({

            cantidad: 0,

            promedio: 0,

            mejor: 0,

            ultima: 0

        });

    const [evaluaciones, setEvaluaciones] =
        useState([]);

    const [estadoFiltro, setEstadoFiltro] =
        useState("");

    const [tipoFiltro, setTipoFiltro] =
        useState("");

    const [buscar, setBuscar] =
        useState("");

    const [

        resultado,

        setResultado

    ] = useState(null);

    const [

        mostrarResultado,

        setMostrarResultado

    ] = useState(false);

    const [

        resultado,

        setResultado

    ] = useState(null);

    /*=========================================
      CARGAR
    =========================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const data =
                await evaluacionApi.obtenerEvaluacionesEmpleado(
                    id
                );

            setEmpleado(
                data.empleado
            );

            setIndicadores(
                data.indicadores
            );

            setEvaluaciones(
                data.evaluaciones || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };





    useEffect(() => {

        cargar();

    }, [id]);





    /*=========================================
      RESULTADO
    =========================================*/

    const verResultado = async (row) => {

        try {

            const data =

                await evaluacionApi.obtenerResultado(

                    row.id

                );

            setResultado(data);

            setMostrarResultado(true);

        }

        catch (error) {

            console.error(error);

        }

    };

    /*=========================================
      COLUMNAS
    =========================================*/

    const columns = [

        {

            key: "fecha",

            title: "Fecha"

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

            key: "evaluador",

            title: "Evaluador",

            render: row =>

                row.evaluador?.usuario

        },

        {

            key: "estado",

            title: "Estado",

            render: row =>

                <ERPBadge

                    status={row.estado}

                />

        },

        {

            key: "porcentaje",

            title: "Resultado",

            render: row =>

                `${Number(
                    row.porcentaje || 0
                ).toFixed(2)} %`

        }

    ];


    /*=========================================
      DATOS GRAFICOS
    =========================================*/

    const datosHistoricos =

        [...evaluaciones]

            .reverse()

            .map(item => ({

                periodo:

                    item.periodo?.descripcion ||

                    item.fecha,

                resultado:

                    Number(
                        item.porcentaje || 0
                    )

            }));

    const resumenTipos =

        evaluaciones.reduce(

            (acc, item) => {

                const descripcion =

                    item.tipo?.descripcion ||

                    "Sin Tipo";

                const porcentaje =

                    Number(
                        item.porcentaje || 0
                    );

                if (!acc[descripcion]) {

                    acc[descripcion] = {

                        descripcion,

                        cantidad: 0,

                        total: 0

                    };

                }

                acc[descripcion].cantidad++;

                acc[descripcion].total += porcentaje;

                return acc;

            },

            {}

        );

    const datosTipos =

        Object.values(resumenTipos)

            .map(item => ({

                descripcion:

                    item.descripcion,

                promedio:

                    Number(

                        (

                            item.total /

                            item.cantidad

                        ).toFixed(2)

                    ),

                cantidad:

                    item.cantidad

            }));



    /*=========================================
FILTROS
=========================================*/

    const evaluacionesFiltradas =

        evaluaciones.filter(item => {

            const coincideEstado =

                !estadoFiltro ||

                item.estado === estadoFiltro;

            const coincideTipo =

                !tipoFiltro ||

                item.tipo?.descripcion === tipoFiltro;

            const texto =

                `${item.numero}

             ${item.tipo?.descripcion || ""}

             ${item.periodo?.descripcion || ""}

             ${item.evaluador?.usuario || ""}`

                    .toLowerCase();

            const coincideBusqueda =

                texto.includes(

                    buscar.toLowerCase()

                );

            return (

                coincideEstado &&

                coincideTipo &&

                coincideBusqueda

            );

        });

    const descargarPdf = (row) => {

        window.open(

            `${process.env.REACT_APP_API_URL}/evaluacion/${row.id}/pdf`,

            "_blank"

        );

    };
    /*=========================================
      ACCIONES
    =========================================*/

    const actions = [

        {

            icon: <FiEye />,

            title: "Resultado",

            variant: "outline-primary",

            onClick: verResultado

        },

        {

            icon: <FiDownload />,

            title: "PDF",

            variant: "outline-success",

            onClick: descargarPdf

        }

    ];




    if (loading) {

        return (

            <ERPPage

                title="Historial del Empleado"

            >

                Cargando...

            </ERPPage>

        );

    } return (

        <ERPPage

            title="Historial de Evaluaciones"

            subtitle={`${empleado?.apellido || ""} ${empleado?.nombre || ""}`}

        >

            <ERPToolbar />

            {/*=========================================
              KPI
            =========================================*/}

            <div className="row mb-4">

                <div className="col-md-3">

                    <ERPKpiCard

                        title="Evaluaciones"

                        value={indicadores.cantidad}

                        color="primary"

                    />

                </div>

                <div className="col-md-3">

                    <ERPKpiCard

                        title="Promedio"

                        value={`${Number(
                            indicadores.promedio || 0
                        ).toFixed(2)} %`}

                        color="success"

                    />

                </div>

                <div className="col-md-3">

                    <ERPKpiCard

                        title="Mejor Resultado"

                        value={`${Number(
                            indicadores.mejor || 0
                        ).toFixed(2)} %`}

                        color="info"

                    />

                </div>

                <div className="col-md-3">

                    <ERPKpiCard

                        title="Último Resultado"

                        value={`${Number(
                            indicadores.ultima || 0
                        ).toFixed(2)} %`}

                        color="warning"

                    />

                </div>

            </div>

            {/*=========================================
  EVOLUCIÓN HISTÓRICA
=========================================*/}

            <div className="row mb-4">

                <div className="col-12">

                    <ERPLineChart

                        title="Evolución Histórica del Desempeño"

                        data={datosHistoricos}

                        xKey="periodo"

                        yKey="resultado"

                        color="#0d6efd"

                    />

                </div>

            </div>

            {/*=========================================
  RESULTADOS POR TIPO
=========================================*/}

            <div className="row mb-4">

                <div className="col-12">

                    <ERPBarChart

                        title="Promedio por Tipo de Evaluación"

                        data={datosTipos}

                        xKey="descripcion"

                        yKey="promedio"

                        color="#198754"

                    />

                </div>

            </div>


            {/*=========================================
              DATOS EMPLEADO
            =========================================*/}

            <ERPCard className="mb-4">

                <div className="row">

                    <div className="col-md-6">

                        <strong>Empleado</strong>

                        <div>

                            {empleado?.apellido} {empleado?.nombre}

                        </div>

                    </div>

                    <div className="col-md-3">

                        <strong>ID</strong>

                        <div>

                            {empleado?.id}

                        </div>

                    </div>

                    <div className="col-md-3">

                        <strong>Total Evaluaciones</strong>

                        <div>

                            {indicadores.cantidad}

                        </div>

                    </div>

                </div>

            </ERPCard>

            {/*=========================================
              HISTORIAL
            =========================================*/}

            <ERPCard>

                <h5 className="mb-3">

                    Historial de Evaluaciones

                </h5>

                <div className="row mb-3">

                    <div className="col-md-4">

                        <input

                            className="form-control"

                            placeholder="Buscar..."

                            value={buscar}

                            onChange={e =>

                                setBuscar(

                                    e.target.value

                                )

                            }

                        />

                    </div>

                    <div className="col-md-3">

                        <select

                            className="form-select"

                            value={estadoFiltro}

                            onChange={e =>

                                setEstadoFiltro(

                                    e.target.value

                                )

                            }

                        >

                            <option value="">

                                Todos los estados

                            </option>

                            <option value="PENDIENTE">

                                Pendiente

                            </option>

                            <option value="FINALIZADA">

                                Finalizada

                            </option>

                        </select>

                    </div>

                    <div className="col-md-3">

                        <select

                            className="form-select"

                            value={tipoFiltro}

                            onChange={e =>

                                setTipoFiltro(

                                    e.target.value

                                )

                            }

                        >

                            <option value="">

                                Todos los tipos

                            </option>

                            {

                                [...new Set(

                                    evaluaciones.map(

                                        x =>

                                            x.tipo?.descripcion

                                    )

                                )]

                                    .filter(Boolean)

                                    .map(tipo => (

                                        <option

                                            key={tipo}

                                            value={tipo}

                                        >

                                            {tipo}

                                        </option>

                                    ))

                            }

                        </select>

                    </div>

                    <div className="col-md-2">

                        <button

                            className="btn btn-outline-secondary w-100"

                            onClick={() => {

                                setBuscar("");

                                setEstadoFiltro("");

                                setTipoFiltro("");

                            }}

                        >

                            <FiRefreshCw />

                            {" "}Limpiar

                        </button>

                    </div>

                </div>

                {/*=========================================
              MODIFICAR SI HAY ERROR
            =========================================*/}

                <ResultadoEvaluacionModal

                    show={mostrarResultado}

                    onHide={() => {

                        setMostrarResultado(false);

                        setResultado(null);

                    }}

                    resultado={resultado}

                />

                <ERPTable

                    columns={columns}

                    data={evaluacionesFiltradas}

                    actions={actions}

                    loading={loading}

                    emptyMessage="El empleado no posee evaluaciones."

                />

            </ERPCard>

        </ERPPage>



    );

};

export default EmpleadoEvaluacionesPage;