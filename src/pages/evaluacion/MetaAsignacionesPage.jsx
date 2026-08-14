// src/pages/evaluacion/MetaAsignacionesPage.jsx

import React, {
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {

    Modal,
    Form,
    Row,
    Col,
    Button

} from "react-bootstrap";

import {

    FiPlus,
    FiEdit,
    FiCheckCircle,
    FiXCircle

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

const MetaAsignacionesPage = () => {

    const context =
        useContext(
            Contexts.DataContext
        );


    const usuariosTabla =
        context?.usuariosTabla || [];

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

        metas,

        setMetas

    ] = useState([]);

    const empleados =
        context?.empleados || [];

    const supervisores =
        usuariosTabla;

    const [

        periodos,

        setPeriodos

    ] = useState([]);

    const [

        mostrarModal,

        setMostrarModal

    ] = useState(false);

    const [

        guardando,

        setGuardando

    ] = useState(false);

    const [

        form,

        setForm

    ] = useState({

        meta_id: "",

        empleado_id: "",

        supervisor_id: "",

        periodo_id: "",

        fecha_inicio: "",

        fecha_fin: ""

    });

    /*=========================================================
      CARGAR ASIGNACIONES
    =========================================================*/

    const cargarAsignaciones = async () => {

        try {

            setLoading(true);

            const data =

                await metaApi.listarAsignaciones();

            setAsignaciones(

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

    /*=========================================================
      CARGAR CATÁLOGOS
    =========================================================*/

    const cargarCatalogos = async () => {

        try {

            const [

                listaMetas,

                listaPeriodos

            ] = await Promise.all([

                metaApi.listarMetas(),

                evaluacionConfiguracionApi.listarPeriodos()

            ]);

            setMetas(listaMetas || []);

            setPeriodos(listaPeriodos || []);

        }

        catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        cargarAsignaciones();

        cargarCatalogos();

    }, []);

    const indicadores = useMemo(() => {

        return {

            asignadas:

                asignaciones.filter(

                    x =>

                        x.estado ===

                        "ASIGNADA"

                ).length,

            proceso:

                asignaciones.filter(

                    x =>

                        x.estado ===

                        "EN_PROCESO"

                ).length,

            cumplidas:

                asignaciones.filter(

                    x =>

                        x.estado ===

                        "CUMPLIDA"

                ).length,

            canceladas:

                asignaciones.filter(

                    x =>

                        x.estado ===

                        "CANCELADA"

                ).length

        };

    }, [asignaciones]);

    const nuevaAsignacion = () => {

        setForm({

            meta_id: "",

            empleado_id: "",

            supervisor_id: "",

            periodo_id: "",

            fecha_inicio: "",

            fecha_fin: ""

        });

        setMostrarModal(

            true

        );

    };

    const cerrarModal = () => {

        setMostrarModal(

            false

        );

    };

    const guardarAsignacion = async () => {

        try {

            setGuardando(true);

            await metaApi.crearAsignacion(

                form

            );

            cerrarModal();

            cargarAsignaciones();

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setGuardando(false);

        }

    };

    const columns = [

        {

            key: "empleado",

            title: "Empleado",

            render: row =>

                row.empleado?.nombre_completo

        },

        {

            key: "meta",

            title: "Meta",

            render: row =>

                row.meta?.nombre

        },

        {

            key: "periodo",

            title: "Período",

            render: row =>

                row.periodo?.descripcion

        },

        {

            key: "supervisor",

            title: "Supervisor",

            render: row =>

                row.supervisor?.nombre

        },

        {

            key: "porcentaje_cumplimiento",

            title: "Cumplimiento"

        },

        {

            key: "estado",

            title: "Estado",

            render: row =>

                <ERPBadge

                    status={

                        row.estado

                    }

                >

                </ERPBadge>

        }

    ];

    return (

        <ERPPage

            title="Asignación de Metas"

            subtitle="Administración de metas asignadas a los colaboradores"

        >

            <ERPToolbar>

                <Button

                    variant="primary"

                    onClick={nuevaAsignacion}

                >

                    <FiPlus className="me-2" />

                    Nueva Asignación

                </Button>

            </ERPToolbar>

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

                        title="Canceladas"

                        value={indicadores.canceladas}

                        color="danger"

                        icon="x-circle"

                    />

                </Col>

            </Row>

            {/*=========================================================
              TABLA
            =========================================================*/}

            <ERPTable

                title="Asignaciones"

                columns={columns}

                data={asignaciones}

                loading={loading}

                emptyMessage="No existen asignaciones registradas."

            />

            {/*=========================================================
              MODAL
            =========================================================*/}

            <Modal

                show={mostrarModal}

                onHide={cerrarModal}

                size="lg"

                backdrop="static"

            >

                <Modal.Header closeButton>

                    <Modal.Title>

                        Nueva Asignación

                    </Modal.Title>

                </Modal.Header>

                <Modal.Body>

                    <Form>

                        <Row>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>

                                        Meta

                                    </Form.Label>

                                    <Form.Select

                                        value={form.meta_id}

                                        onChange={(e) =>

                                            setForm({

                                                ...form,

                                                meta_id:

                                                    e.target.value

                                            })

                                        }

                                    >

                                        <option value="">

                                            Seleccione...

                                        </option>

                                        {

                                            metas.map(item => (

                                                <option

                                                    key={item.id}

                                                    value={item.id}

                                                >

                                                    {item.nombre}

                                                </option>

                                            ))

                                        }

                                    </Form.Select>

                                </Form.Group>

                            </Col>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>

                                        Empleado

                                    </Form.Label>

                                    <Form.Select

                                        value={form.empleado_id}

                                        onChange={(e) =>

                                            setForm({

                                                ...form,

                                                empleado_id:

                                                    e.target.value

                                            })

                                        }

                                    >

                                        <option value="">

                                            Seleccione...

                                        </option>

                                        {

                                            empleados.map(item => (

                                                <option

                                                    key={item.id}

                                                    value={item.id}

                                                >

                                                    {item.nombre_completo}

                                                </option>

                                            ))

                                        }

                                    </Form.Select>

                                </Form.Group>

                            </Col>

                        </Row>

                        <Row>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>

                                        Supervisor

                                    </Form.Label>

                                    <Form.Select

                                        value={form.supervisor_id}

                                        onChange={(e) =>

                                            setForm({

                                                ...form,

                                                supervisor_id:

                                                    e.target.value

                                            })

                                        }

                                    >

                                        <option value="">

                                            Seleccione...

                                        </option>

                                        {

                                            supervisores.map(item => (

                                                <option

                                                    key={item.id}

                                                    value={item.id}

                                                >

                                                    {item.nombre}

                                                </option>

                                            ))

                                        }

                                    </Form.Select>

                                </Form.Group>

                            </Col>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>

                                        Período

                                    </Form.Label>

                                    <Form.Select

                                        value={form.periodo_id}

                                        onChange={(e) =>

                                            setForm({

                                                ...form,

                                                periodo_id:

                                                    e.target.value

                                            })

                                        }

                                    >

                                        <option value="">

                                            Seleccione...

                                        </option>

                                        {

                                            periodos.map(item => (

                                                <option

                                                    key={item.id}

                                                    value={item.id}

                                                >

                                                    {item.descripcion}

                                                </option>

                                            ))

                                        }

                                    </Form.Select>

                                </Form.Group>

                            </Col>

                        </Row>

                        <Row>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>

                                        Fecha Inicio

                                    </Form.Label>

                                    <Form.Control

                                        type="date"

                                        value={form.fecha_inicio}

                                        onChange={(e) =>

                                            setForm({

                                                ...form,

                                                fecha_inicio:

                                                    e.target.value

                                            })

                                        }

                                    />

                                </Form.Group>

                            </Col>

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>

                                        Fecha Fin

                                    </Form.Label>

                                    <Form.Control

                                        type="date"

                                        value={form.fecha_fin}

                                        onChange={(e) =>

                                            setForm({

                                                ...form,

                                                fecha_fin:

                                                    e.target.value

                                            })

                                        }

                                    />

                                </Form.Group>

                            </Col>

                        </Row>

                    </Form>

                </Modal.Body>

                <Modal.Footer>

                    <Button

                        variant="secondary"

                        onClick={cerrarModal}

                    >

                        Cancelar

                    </Button>

                    <Button

                        variant="primary"

                        onClick={guardarAsignacion}

                        disabled={guardando}

                    >

                        {

                            guardando

                                ? "Guardando..."

                                : "Guardar"

                        }

                    </Button>

                </Modal.Footer>

            </Modal>

        </ERPPage>

    );

};

export default MetaAsignacionesPage;