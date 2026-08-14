// src/pages/evaluacion/MailsPage.jsx

import React, {

    useEffect,
    useMemo,
    useState

} from "react";

import {

    FiEye,
    FiRefreshCw,
    FiMail,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle

} from "react-icons/fi";

import {

    ERPPage,
    ERPToolbar,
    ERPTable,
    ERPKpiCard,
    ERPBadge

} from "../../components/common/erp";

import {

    comunicacionApi

} from "../../services/evaluacion/comunicacionApi";

const MailsPage = () => {

    /*=========================================
      ESTADOS
    =========================================*/

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        comunicaciones,

        setComunicaciones

    ] = useState([]);

    const [

        comunicacionSeleccionada,

        setComunicacionSeleccionada

    ] = useState(null);

    /*=========================================
      CARGAR
    =========================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const data =

                await comunicacionApi.listar();

            setComunicaciones(

                data || []

            );

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        cargar();

    }, []);

    /*=========================================
      KPIs
    =========================================*/

    const indicadores =

        useMemo(() => {

            const enviados =

                comunicaciones.filter(

                    item =>

                        item.estado ===

                        "ENVIADO"

                ).length;

            const pendientes =

                comunicaciones.filter(

                    item =>

                        item.estado ===

                        "PENDIENTE"

                ).length;

            const errores =

                comunicaciones.filter(

                    item =>

                        item.estado ===

                        "ERROR"

                ).length;

            const cancelados =

                comunicaciones.filter(

                    item =>

                        item.estado ===

                        "CANCELADO"

                ).length;

            return {

                enviados,

                pendientes,

                errores,

                cancelados

            };

        }, [

            comunicaciones

        ]);

    /*=========================================
      ACCIONES
    =========================================*/

    const verDetalle = async (row) => {

        try {

            const data =

                await comunicacionApi.obtener(

                    row.id

                );

            setComunicacionSeleccionada(

                data

            );

        }

        catch (error) {

            console.error(error);

        }

    };

    const actions = [

        {

            icon: <FiEye />,

            title: "Ver",

            variant: "outline-primary",

            onClick: verDetalle

        }

    ];

    /*=========================================
      ICONOS
    =========================================*/

    const obtenerIconoEstado = (

        estado

    ) => {

        switch (estado) {

            case "ENVIADO":

                return (

                    <FiCheckCircle

                        color="#198754"

                    />

                );

            case "PENDIENTE":

                return (

                    <FiClock

                        color="#ffc107"

                    />

                );

            case "ERROR":

                return (

                    <FiAlertTriangle

                        color="#dc3545"

                    />

                );

            default:

                return (

                    <FiMail />

                );

        }

    };

    /*=========================================
      COLUMNAS
    =========================================*/

    const columns = [

        {

            key: "fecha_envio",

            title: "Fecha"

        },

        {

            key: "tipo",

            title: "Tipo"

        },

        {

            key: "canal",

            title: "Canal"

        },

        {

            key: "destinatario",

            title: "Destinatario"

        },

        {

            key: "asunto",

            title: "Asunto"

        },

        {

            key: "estado",

            title: "Estado",

            render: row => (

                <div className="d-flex align-items-center gap-2">

                    {

                        obtenerIconoEstado(

                            row.estado

                        )

                    }

                    <ERPBadge

                        status={

                            row.estado

                        }

                    />

                </div>

            )

        }

    ];

        return (

        <ERPPage

            title="Centro de Comunicaciones"

            subtitle="Historial de comunicaciones generadas por el módulo de Evaluaciones"

        >

            <ERPToolbar />

            {/*=========================================
              KPI
            =========================================*/}

            <div className="row mb-4">

                <div className="col-lg-3 col-md-6 mb-3">

                    <ERPKpiCard

                        title="Enviados"

                        value={

                            indicadores.enviados

                        }

                        color="success"

                        icon="mail"

                    />

                </div>

                <div className="col-lg-3 col-md-6 mb-3">

                    <ERPKpiCard

                        title="Pendientes"

                        value={

                            indicadores.pendientes

                        }

                        color="warning"

                        icon="clock"

                    />

                </div>

                <div className="col-lg-3 col-md-6 mb-3">

                    <ERPKpiCard

                        title="Errores"

                        value={

                            indicadores.errores

                        }

                        color="danger"

                        icon="alert-triangle"

                    />

                </div>

                <div className="col-lg-3 col-md-6 mb-3">

                    <ERPKpiCard

                        title="Cancelados"

                        value={

                            indicadores.cancelados

                        }

                        color="secondary"

                        icon="x-circle"

                    />

                </div>

            </div>

            {/*=========================================
              TABLA
            =========================================*/}

            <ERPTable

                title="Historial de Comunicaciones"

                columns={columns}

                data={comunicaciones}

                actions={actions}

                loading={loading}

                emptyMessage="No existen comunicaciones registradas."

            />

            {/*=========================================
              MODAL DETALLE
            =========================================*/}

            {

                comunicacionSeleccionada && (

                    <div

                        className="modal fade show"

                        style={{

                            display: "block",

                            backgroundColor:

                                "rgba(0,0,0,.50)"

                        }}

                    >

                        <div className="modal-dialog modal-lg">

                            <div className="modal-content">

                                <div className="modal-header">

                                    <h5 className="modal-title">

                                        Detalle de Comunicación

                                    </h5>

                                    <button

                                        className="btn-close"

                                        onClick={() =>

                                            setComunicacionSeleccionada(

                                                null

                                            )

                                        }

                                    />

                                </div>

                                <div className="modal-body">

                                    <table className="table table-sm">

                                        <tbody>

                                            <tr>

                                                <th width="180">

                                                    Canal

                                                </th>

                                                <td>

                                                    {

                                                        comunicacionSeleccionada.canal

                                                    }

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Tipo

                                                </th>

                                                <td>

                                                    {

                                                        comunicacionSeleccionada.tipo

                                                    }

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Destinatario

                                                </th>

                                                <td>

                                                    {

                                                        comunicacionSeleccionada.destinatario

                                                    }

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Asunto

                                                </th>

                                                <td>

                                                    {

                                                        comunicacionSeleccionada.asunto

                                                    }

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Estado

                                                </th>

                                                <td>

                                                    <ERPBadge

                                                        status={

                                                            comunicacionSeleccionada.estado

                                                        }

                                                    />

                                                </td>

                                            </tr>

                                            <tr>

                                                <th>

                                                    Fecha Envío

                                                </th>

                                                <td>

                                                    {

                                                        comunicacionSeleccionada.fecha_envio ||

                                                        "-"

                                                    }

                                                </td>

                                            </tr>

                                        </tbody>

                                    </table>

                                    <div className="mb-3">

                                        <label className="form-label fw-bold">

                                            Contenido

                                        </label>

                                        <div

                                            className="border rounded p-3"

                                            style={{

                                                whiteSpace:

                                                    "pre-wrap",

                                                minHeight:

                                                    180

                                            }}

                                        >

                                            {

                                                comunicacionSeleccionada.contenido ||

                                                "Sin contenido."

                                            }

                                        </div>

                                    </div>

                                    {

                                        comunicacionSeleccionada.error && (

                                            <div className="alert alert-danger">

                                                <strong>

                                                    Error:

                                                </strong>

                                                <br />

                                                {

                                                    comunicacionSeleccionada.error

                                                }

                                            </div>

                                        )

                                    }

                                </div>

                                <div className="modal-footer">

                                    <button

                                        className="btn btn-secondary"

                                        onClick={() =>

                                            setComunicacionSeleccionada(

                                                null

                                            )

                                        }

                                    >

                                        Cerrar

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )

            }

        </ERPPage>

    );

};

export default MailsPage;