import React, {

    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState

} from "react";

import {

    Alert,
    Button,
    Card,
    Col,
    Form,
    Row,
    Spinner

} from "react-bootstrap";

import {

    FiRefreshCw,
    FiSearch,
    FiUsers

} from "react-icons/fi";

import Contexts from "../../../context/Contexts";

import ERPPage from "../../../components/common/erp/ERPPage";

import reporteEvaluacionService from "../../../services/evaluacion/reporteEvaluacionService";

import ReporteResumen from "../../../components/evaluacion/reportes/ReporteResumen";
/*import ReporteIndicadores from "../../../components/evaluacion/reportes/ReporteIndicadores";*/
import ReporteCompetencias from "../../../components/evaluacion/reportes/ReporteCompetencias";
import ReporteRadar from "../../../components/evaluacion/reportes/ReporteRadar";
import ReporteHistorico from "../../../components/evaluacion/reportes/ReporteHistorico";
import ReporteRanking from "../../../components/evaluacion/reportes/ReporteRanking";
import ReporteComentarios from "../../../components/evaluacion/reportes/ReporteComentarios";


const apiUrl = process.env.REACT_APP_API_URL;


const ReporteMysteryPage = () => {

    const dataContext = useContext(

        Contexts.DataContext

    );

    const empleados =

        dataContext?.empleados || [];


    const [

        empleadoSeleccionado,

        setEmpleadoSeleccionado

    ] = useState("");


    const [

        busquedaEmpleado,

        setBusquedaEmpleado

    ] = useState("");


    const [

        reporte,

        setReporte

    ] = useState(null);


    const [

        loadingReporte,

        setLoadingReporte

    ] = useState(false);


    const [

        error,

        setError

    ] = useState("");


    /* ======================================================
       HELPERS EMPLEADOS
    ====================================================== */

    const getEmpleadoId = useCallback((item) => {

        return (

            item?.empleado?.id ??

            item?.empleado_id ??

            item?.id ??

            null

        );

    }, []);


    const getEmpleadoNombre = useCallback((item) => {

        const apellido =

            item?.empleado?.apellido ||

            item?.clientePersona?.apellido ||

            item?.apellido ||

            "";

        const nombre =

            item?.empleado?.nombre ||

            item?.clientePersona?.nombre ||

            item?.nombre ||

            "";

        return `${apellido} ${nombre}`.trim();

    }, []);


    /* ======================================================
       EMPLEADOS NORMALIZADOS
    ====================================================== */

    const listaEmpleados = useMemo(() => {

        return empleados

            .map(item => {

                const empleadoId = Number(

                    getEmpleadoId(item)

                );

                if (Number.isNaN(empleadoId)) {

                    return null;

                }

                return {

                    id: empleadoId,

                    nombreCompleto:

                        getEmpleadoNombre(item) ||

                        `Empleado #${empleadoId}`,

                    original: item

                };

            })

            .filter(Boolean)

            .sort((a, b) =>

                a.nombreCompleto.localeCompare(

                    b.nombreCompleto,

                    "es",

                    {

                        sensitivity: "base"

                    }

                )

            );

    }, [

        empleados,

        getEmpleadoId,

        getEmpleadoNombre

    ]);

        /* ======================================================
       FILTRO VISUAL DE EMPLEADOS
    ====================================================== */

    const empleadosFiltrados = useMemo(() => {

        const texto = String(

            busquedaEmpleado || ""

        )
            .trim()
            .toLocaleLowerCase("es");

        if (!texto) {

            return listaEmpleados;

        }

        return listaEmpleados.filter(item => {

            const nombre = String(

                item?.nombreCompleto || ""

            ).toLocaleLowerCase("es");

            const id = String(

                item?.id || ""

            ).toLocaleLowerCase("es");

            return (

                nombre.includes(texto) ||

                id.includes(texto)

            );

        });

    }, [

        listaEmpleados,

        busquedaEmpleado

    ]);


    /* ======================================================
       EMPLEADO SELECCIONADO
    ====================================================== */

    const empleadoActual = useMemo(() => {

        if (!empleadoSeleccionado) {

            return null;

        }

        return listaEmpleados.find(item =>

            Number(item.id) ===

            Number(empleadoSeleccionado)

        ) || null;

    }, [

        listaEmpleados,

        empleadoSeleccionado

    ]);


    /* ======================================================
       OBTENER REPORTE
    ====================================================== */

    const cargarReporte = useCallback(async (

        empleadoId

    ) => {

        if (!empleadoId) {

            setReporte(null);

            return;

        }

        try {

            setLoadingReporte(true);

            setError("");

            const resultado =

                await reporteEvaluacionService.obtenerReporte({

                    tipo: "MYSTERY",

                    id: Number(

                        empleadoId

                    )

                });

            setReporte(

                resultado || null

            );

        }
        catch (error) {

            console.error(

                "Error cargando reporte Mystery:",

                error

            );

            setReporte(null);

            setError(

                error?.message ||

                "No se pudo obtener el reporte Mystery."

            );

        }
        finally {

            setLoadingReporte(false);

        }

    }, []);


    /* ======================================================
       EFECTOS
    ====================================================== */

    useEffect(() => {

        if (!empleadoSeleccionado) {

            setReporte(null);

            return;

        }

        cargarReporte(

            empleadoSeleccionado

        );

    }, [

        empleadoSeleccionado,

        cargarReporte

    ]);


    /* ======================================================
       EVENTOS
    ====================================================== */

    const handleEmpleadoChange = (event) => {

        const value = event.target.value;

        setEmpleadoSeleccionado(value);

        setReporte(null);

        setError("");

    };


    const handleActualizarReporte = () => {

        if (!empleadoSeleccionado) {

            return;

        }

        cargarReporte(

            empleadoSeleccionado

        );

    };

        /* ======================================================
       RENDER
    ====================================================== */

    return (

        <ERPPage

            title="Reporte Mystery Shopper"

            subtitle="Resultados de evaluaciones Mystery Shopper por empleado"

        >

            <Card className="mb-4 shadow-sm">

                <Card.Body>

                    <Row className="g-3 align-items-end">

                        <Col

                            xs={12}

                            lg={5}

                        >

                            <Form.Group>

                                <Form.Label>

                                    Buscar empleado

                                </Form.Label>

                                <div className="position-relative">

                                    <FiSearch

                                        className="position-absolute top-50 translate-middle-y text-muted"

                                        style={{

                                            left: "12px",

                                            zIndex: 2

                                        }}

                                    />

                                    <Form.Control

                                        type="text"

                                        value={busquedaEmpleado}

                                        placeholder="Apellido, nombre o código"

                                        onChange={event =>

                                            setBusquedaEmpleado(

                                                event.target.value

                                            )

                                        }

                                        style={{

                                            paddingLeft: "36px"

                                        }}

                                    />

                                </div>

                            </Form.Group>

                        </Col>

                        <Col

                            xs={12}

                            lg={5}

                        >

                            <Form.Group>

                                <Form.Label>

                                    Empleado

                                </Form.Label>

                                <Form.Select

                                    className="form-control"

                                    value={

                                        empleadoSeleccionado

                                    }

                                    onChange={

                                        handleEmpleadoChange

                                    }

                                >

                                    <option value="">

                                        Seleccione un empleado

                                    </option>

                                    {

                                        empleadosFiltrados.map(

                                            item => (

                                                <option

                                                    key={

                                                        item.id

                                                    }

                                                    value={

                                                        item.id

                                                    }

                                                >

                                                    {

                                                        item.nombreCompleto

                                                    }

                                                </option>

                                            )

                                        )

                                    }

                                </Form.Select>

                            </Form.Group>

                        </Col>

                        <Col

                            xs={12}

                            lg={2}

                        >

                            <Button

                                type="button"

                                variant="outline-primary"

                                className="w-100"

                                onClick={

                                    handleActualizarReporte

                                }

                                disabled={

                                    !empleadoSeleccionado ||

                                    loadingReporte

                                }

                            >

                                {

                                    loadingReporte

                                        ? (

                                            <>

                                                <Spinner

                                                    animation="border"

                                                    size="sm"

                                                    className="me-2"

                                                />

                                                Cargando

                                            </>

                                        )

                                        : (

                                            <>

                                                <FiRefreshCw

                                                    className="me-2"

                                                />

                                                Actualizar

                                            </>

                                        )

                                }

                            </Button>

                        </Col>

                    </Row>

                    {

                        empleadoActual && (

                            <Alert

                                variant="light"

                                className="border mt-3 mb-0"

                            >

                                <div className="d-flex align-items-center">

                                    <FiUsers

                                        className="me-2 text-primary"

                                        size={20}

                                    />

                                    <div>

                                        <div className="fw-semibold">

                                            Empleado seleccionado

                                        </div>

                                        <div className="text-muted">

                                            {

                                                empleadoActual.nombreCompleto

                                            }

                                        </div>

                                    </div>

                                </div>

                            </Alert>

                        )

                    }

                </Card.Body>

            </Card>

                        {

                error && (

                    <Alert

                        variant="danger"

                        dismissible

                        onClose={() =>

                            setError("")

                        }

                    >

                        {error}

                    </Alert>

                )

            }


            {

                !empleadoSeleccionado && (

                    <Card className="shadow-sm">

                        <Card.Body

                            className="text-center py-5"

                        >

                            <FiUsers

                                size={42}

                                className="text-muted mb-3"

                            />

                            <h5>

                                Seleccione un empleado

                            </h5>

                            <p className="text-muted mb-0">

                                Seleccione un empleado para consultar

                                sus evaluaciones Mystery Shopper.

                            </p>

                        </Card.Body>

                    </Card>

                )

            }


            {

                loadingReporte && (

                    <Card className="shadow-sm">

                        <Card.Body

                            className="text-center py-5"

                        >

                            <Spinner

                                animation="border"

                                variant="primary"

                                className="mb-3"

                            />

                            <div className="text-muted">

                                Generando reporte Mystery Shopper...

                            </div>

                        </Card.Body>

                    </Card>

                )

            }


            {

                !loadingReporte &&

                empleadoSeleccionado &&

                reporte &&

                Number(

                    reporte?.resumen

                        ?.totalEvaluaciones || 0

                ) > 0 && (

                    <>

                        <ReporteResumen

                            items={[

                                {

                                    label: "Evaluaciones",

                                    value:

                                        reporte?.resumen

                                            ?.totalEvaluaciones ?? 0

                                },

                                {

                                    label: "Respuestas",

                                    value:

                                        reporte?.resumen

                                            ?.totalRespuestas ?? 0

                                },

                                {

                                    label: "Última evaluación",

                                    value:

                                        reporte?.resumen

                                            ?.ultimaEvaluacion || "-"

                                },

                                {

                                    label: "Empleado",

                                    value:

                                        empleadoActual

                                            ?.nombreCompleto || "-"

                                }

                            ]}

                        />

                        {/*

                        <ReporteIndicadores

                            data={

                                reporte?.indicadores || []

                            }

                        />

                        */}

                        <ReporteCompetencias

                            data={

                                reporte?.competencias || []

                            }

                        />

                        <ReporteRadar

                            data={

                                reporte?.radar || []

                            }

                        />

                        <ReporteHistorico

                            data={

                                reporte?.historico || []

                            }

                        />

                        <ReporteRanking

                            data={

                                reporte?.ranking || []

                            }

                        />

                        <ReporteComentarios

                            data={

                                reporte?.comentarios || []

                            }

                        />

                    </>

                )

            }


            {

                !loadingReporte &&

                empleadoSeleccionado &&

                reporte &&

                Number(

                    reporte?.resumen

                        ?.totalEvaluaciones || 0

                ) === 0 &&

                !error && (

                    <Alert variant="info">

                        No existen evaluaciones Mystery Shopper para el

                        empleado seleccionado.

                    </Alert>

                )

            }

        </ERPPage>

    );

};


export default ReporteMysteryPage;