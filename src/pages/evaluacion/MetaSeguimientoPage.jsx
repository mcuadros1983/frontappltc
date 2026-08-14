// src/pages/evaluacion/MetaSeguimientoPage.jsx

import React, {

    useEffect,
    useMemo,
    useState,
    useContext

} from "react";

import {

    Button,
    Modal,
    Form,
    Row,
    Col

} from "react-bootstrap";

import {

    FiTrendingUp,
    FiClock

} from "react-icons/fi";

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

import Contexts
    from "../../context/Contexts";

const MetaSeguimientoPage = () => {

    const context =
        useContext(
            Contexts.DataContext
        );

    /*=========================================================
      ESTADOS
    =========================================================*/

    const [

        loading,

        setLoading

    ] = useState(false);

    const [

        asignaciones,

        setAsignaciones

    ] = useState([]);

    const [

        avances,

        setAvances

    ] = useState([]);

    const [

        mostrarModal,

        setMostrarModal

    ] = useState(false);

    const [

        asignacionSeleccionada,

        setAsignacionSeleccionada

    ] = useState(null);

    const [

        guardando,

        setGuardando

    ] = useState(false);

    const [

        form,

        setForm

    ] = useState({

        fecha:

            new Date()

                .toISOString()

                .substring(0, 10),

        valor_actual: "",

        comentario: ""

    });

    /*=========================================================
      CARGAR
    =========================================================*/

    const cargar = async () => {

        try {

            setLoading(true);

            const [

                asignacionesData,

                avancesData

            ] = await Promise.all([

                metaApi.listarAsignaciones(),

                metaApi.listarAvances()

            ]);

            setAsignaciones(

                asignacionesData || []

            );

            setAvances(

                avancesData || []

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

    const indicadores = useMemo(() => {

        return {

            asignadas:

                asignaciones.filter(

                    x => x.estado === "ASIGNADA"

                ).length,

            proceso:

                asignaciones.filter(

                    x => x.estado === "EN_PROCESO"

                ).length,

            cumplidas:

                asignaciones.filter(

                    x => x.estado === "CUMPLIDA"

                ).length,

            promedio:

                asignaciones.length

                    ? (

                        asignaciones.reduce(

                            (a, b) =>

                                a +

                                Number(

                                    b.porcentaje_cumplimiento || 0

                                ),

                            0

                        ) /

                        asignaciones.length

                    ).toFixed(2)

                    : 0

        };

    }, [asignaciones]);

    const abrirModal = (row) => {

        setAsignacionSeleccionada(row);

        setForm({

            fecha:

                new Date()

                    .toISOString()

                    .substring(0, 10),

            valor_actual:

                row.valor_actual,

            comentario: ""

        });

        setMostrarModal(true);

    };

    const guardarAvance = async () => {

        try {

            setGuardando(true);

            await metaApi.registrarAvance({

                asignacion_id:

                    asignacionSeleccionada.id,

                ...form

            });

            setMostrarModal(false);

            cargar();

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setGuardando(false);

        }

    };

    const actions = [

        {

            icon: <FiTrendingUp />,

            title: "Registrar Avance",

            variant: "outline-success",

            onClick: abrirModal

        }

    ];

    const columns = [

        {

            key: "empleado",

            title: "Empleado",

            render: r =>

                r.empleado?.nombre_completo

        },

        {

            key: "meta",

            title: "Meta",

            render: r =>

                r.meta?.nombre

        },

        {

            key: "valor_actual",

            title: "Actual"

        },

        {

            key: "porcentaje_cumplimiento",

            title: "Cumplimiento (%)"

        },

        {

            key: "estado",

            title: "Estado",

            render: r =>

                <ERPBadge

                    status={r.estado}

                />

        }

    ];

    return (

        <ERPPage

            title="Seguimiento de Metas"

            subtitle="Registro y control del avance de las metas asignadas"

        >

            <ERPToolbar />

            {/*=========================================================
              KPI
            =========================================================*/}

            <Row className="mb-4">

                <Col md={3}>

                    <ERPKpiCard

                        title="Asignadas"

                        value={indicadores.asignadas}

                        color="primary"

                        icon="target"

                    />

                </Col>

                <Col md={3}>

                    <ERPKpiCard

                        title="En Proceso"

                        value={indicadores.proceso}

                        color="warning"

                        icon="clock"

                    />

                </Col>

                <Col md={3}>

                    <ERPKpiCard

                        title="Cumplidas"

                        value={indicadores.cumplidas}

                        color="success"

                        icon="check-circle"

                    />

                </Col>

                <Col md={3}>

                    <ERPKpiCard

                        title="% Promedio"

                        value={`${indicadores.promedio}%`}

                        color="info"

                        icon="trending-up"

                    />

                </Col>

            </Row>

            {/*=========================================================
              TABLA
            =========================================================*/}

            <ERPTable

                title="Seguimiento de Metas"

                columns={columns}

                data={asignaciones}

                actions={actions}

                loading={loading}

                emptyMessage="No existen metas asignadas."

            />

            {/*=========================================================
              MODAL REGISTRAR AVANCE
            =========================================================*/}

            <Modal

                show={mostrarModal}

                onHide={() => setMostrarModal(false)}

                backdrop="static"

                size="lg"

            >

                <Modal.Header closeButton>

                    <Modal.Title>

                        Registrar Avance

                    </Modal.Title>

                </Modal.Header>

                <Modal.Body>

                    {

                        asignacionSeleccionada && (

                            <>

                                <div className="alert alert-light border">

                                    <div>

                                        <strong>

                                            Meta:

                                        </strong>

                                        {" "}

                                        {

                                            asignacionSeleccionada.meta?.nombre

                                        }

                                    </div>

                                    <div>

                                        <strong>

                                            Empleado:

                                        </strong>

                                        {" "}

                                        {

                                            asignacionSeleccionada.empleado?.nombre_completo

                                        }

                                    </div>

                                    <div>

                                        <strong>

                                            Objetivo:

                                        </strong>

                                        {" "}

                                        {

                                            asignacionSeleccionada.meta?.valor_objetivo

                                        }

                                    </div>

                                    <div>

                                        <strong>

                                            Valor Actual:

                                        </strong>

                                        {" "}

                                        {

                                            asignacionSeleccionada.valor_actual

                                        }

                                    </div>

                                </div>

                                <Form>

                                    <Row>

                                        <Col md={4}>

                                            <Form.Group className="mb-3">

                                                <Form.Label>

                                                    Fecha

                                                </Form.Label>

                                                <Form.Control

                                                    type="date"

                                                    value={form.fecha}

                                                    onChange={(e) =>

                                                        setForm({

                                                            ...form,

                                                            fecha: e.target.value

                                                        })

                                                    }

                                                />

                                            </Form.Group>

                                        </Col>

                                        <Col md={8}>

                                            <Form.Group className="mb-3">

                                                <Form.Label>

                                                    Nuevo Valor Alcanzado

                                                </Form.Label>

                                                <Form.Control

                                                    type="number"

                                                    value={form.valor_actual}

                                                    onChange={(e) =>

                                                        setForm({

                                                            ...form,

                                                            valor_actual: e.target.value

                                                        })

                                                    }

                                                />

                                            </Form.Group>

                                        </Col>

                                    </Row>

                                    <Form.Group>

                                        <Form.Label>

                                            Comentario

                                        </Form.Label>

                                        <Form.Control

                                            as="textarea"

                                            rows={5}

                                            value={form.comentario}

                                            onChange={(e) =>

                                                setForm({

                                                    ...form,

                                                    comentario: e.target.value

                                                })

                                            }

                                        />

                                    </Form.Group>

                                </Form>

                            </>

                        )

                    }

                </Modal.Body>

                <Modal.Footer>

                    <Button

                        variant="secondary"

                        onClick={() =>

                            setMostrarModal(false)

                        }

                    >

                        Cancelar

                    </Button>

                    <Button

                        variant="primary"

                        onClick={guardarAvance}

                        disabled={guardando}

                    >

                        {

                            guardando

                                ? "Guardando..."

                                : "Registrar Avance"

                        }

                    </Button>

                </Modal.Footer>

            </Modal>

        </ERPPage>

    );

};

export default MetaSeguimientoPage;