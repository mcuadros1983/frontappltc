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
    FiUserCheck

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


const ReporteSupervisorPage = () => {

    const dataContext = useContext(

        Contexts.DataContext

    );

    const empleados =

        dataContext?.empleados || [];


    const [datosEmpleado, setDatosEmpleado] = useState([]);

    const [

        supervisorSeleccionado,

        setSupervisorSeleccionado

    ] = useState("");

    const [

        busquedaSupervisor,

        setBusquedaSupervisor

    ] = useState("");

    const [reporte, setReporte] = useState(null);

    const [

        loadingSupervisores,

        setLoadingSupervisores

    ] = useState(true);

    const [

        loadingReporte,

        setLoadingReporte

    ] = useState(false);

    const [error, setError] = useState("");


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


    const getEmpleadoNombreContexto = useCallback((item) => {

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
       EMPLEADOS INDEXADOS POR ID
    ====================================================== */

    const empleadosPorId = useMemo(() => {

        const mapa = new Map();

        empleados.forEach(item => {

            const empleadoId = getEmpleadoId(item);

            if (

                empleadoId === null ||

                empleadoId === undefined ||

                empleadoId === ""

            ) {

                return;

            }

            const idNormalizado = Number(empleadoId);

            if (Number.isNaN(idNormalizado)) {

                return;

            }

            mapa.set(

                idNormalizado,

                {

                    id: idNormalizado,

                    nombreCompleto:

                        getEmpleadoNombreContexto(item) ||

                        `Empleado #${idNormalizado}`,

                    original: item

                }

            );

        });

        return mapa;

    }, [

        empleados,

        getEmpleadoId,

        getEmpleadoNombreContexto

    ]);


    /* ======================================================
       CARGAR DATOS EMPLEADO
    ====================================================== */

    useEffect(() => {

        let activo = true;

        const cargarDatosEmpleado = async () => {

            try {

                setLoadingSupervisores(true);

                setError("");

                const baseUrl = String(

                    apiUrl || ""

                ).replace(/\/$/, "");

                const response = await fetch(

                    `${baseUrl}/datosempleado?limit=1000`,

                    {

                        credentials: "include"

                    }

                );

                const data = await response

                    .json()

                    .catch(() => null);

                if (!response.ok) {

                    throw new Error(

                        data?.error ||

                        data?.message ||

                        "No se pudieron obtener los datos de empleados."

                    );

                }

                const items = Array.isArray(data?.items)

                    ? data.items

                    : Array.isArray(data)

                        ? data

                        : [];

                if (activo) {

                    setDatosEmpleado(items);

                }

            }
            catch (error) {

                console.error(

                    "Error cargando supervisores:",

                    error

                );

                if (activo) {

                    setDatosEmpleado([]);

                    setError(

                        error?.message ||

                        "No se pudieron cargar los supervisores."

                    );

                }

            }
            finally {

                if (activo) {

                    setLoadingSupervisores(false);

                }

            }

        };

        cargarDatosEmpleado();

        return () => {

            activo = false;

        };

    }, []);


    /* ======================================================
       SUPERVISORES / ENCARGADOS
    ====================================================== */

    const supervisores = useMemo(() => {

        return datosEmpleado

            .filter(item =>

                String(item?.tipo || "")

                    .trim()

                    .toUpperCase() === "ENCARGADO"

            )

            .map(item => {

                const empleadoId = Number(

                    item?.empleado_id

                );

                const empleadoContexto =

                    empleadosPorId.get(

                        empleadoId

                    );

                return {

                    ...item,

                    empleado_id: empleadoId,

                    nombreCompleto:

                        empleadoContexto?.nombreCompleto ||

                        `Empleado #${empleadoId}`,

                    empleadoContexto:

                        empleadoContexto?.original ||

                        null

                };

            })

            .filter(item =>

                !Number.isNaN(item.empleado_id)

            )

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

        datosEmpleado,

        empleadosPorId

    ]);


    /* ======================================================
       FILTRO VISUAL DE SUPERVISORES
    ====================================================== */

    const supervisoresFiltrados = useMemo(() => {

        const texto = String(

            busquedaSupervisor || ""

        )
            .trim()
            .toLocaleLowerCase("es");

        if (!texto) {

            return supervisores;

        }

        return supervisores.filter(item => {

            const nombre = String(

                item?.nombreCompleto || ""

            ).toLocaleLowerCase("es");

            const id = String(

                item?.empleado_id || ""

            ).toLocaleLowerCase("es");

            return (

                nombre.includes(texto) ||

                id.includes(texto)

            );

        });

    }, [

        supervisores,

        busquedaSupervisor

    ]);


    /* ======================================================
       SUPERVISOR SELECCIONADO
    ====================================================== */

    const supervisorActual = useMemo(() => {

        if (!supervisorSeleccionado) {

            return null;

        }

        return supervisores.find(item =>

            Number(item.empleado_id) ===

            Number(supervisorSeleccionado)

        ) || null;

    }, [

        supervisores,

        supervisorSeleccionado

    ]);


    /* ======================================================
       OBTENER REPORTE
    ====================================================== */

    const cargarReporte = useCallback(async (

        supervisorId

    ) => {

        if (!supervisorId) {

            setReporte(null);

            return;

        }

        try {

            setLoadingReporte(true);

            setError("");

            const resultado =

                await reporteEvaluacionService.obtenerReporte({

                    tipo: "SUPERVISOR",

                    id: supervisorId

                });

            setReporte(

                resultado || null

            );

        }
        catch (error) {

            console.error(

                "Error cargando reporte de supervisor:",

                error

            );

            setReporte(null);

            setError(

                error?.message ||

                "No se pudo obtener el reporte del supervisor."

            );

        }
        finally {

            setLoadingReporte(false);

        }

    }, []);


    useEffect(() => {

        if (!supervisorSeleccionado) {

            setReporte(null);

            return;

        }

        cargarReporte(

            supervisorSeleccionado

        );

    }, [

        supervisorSeleccionado,

        cargarReporte

    ]);


    /* ======================================================
       EVENTOS
    ====================================================== */

    const handleSupervisorChange = (event) => {

        const value = event.target.value;

        setSupervisorSeleccionado(value);

        setReporte(null);

        setError("");

    };


    const handleActualizarReporte = () => {

        if (!supervisorSeleccionado) {

            return;

        }

        cargarReporte(

            supervisorSeleccionado

        );

    };


    /* ======================================================
       RENDER
    ====================================================== */

    return (

        <ERPPage

            title="Reporte por supervisor"

            subtitle="Resultados de evaluaciones realizadas por encargados"

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

                                    Buscar supervisor

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

                                        value={busquedaSupervisor}

                                        placeholder="Apellido, nombre o código"

                                        onChange={event =>

                                            setBusquedaSupervisor(

                                                event.target.value

                                            )

                                        }

                                        style={{

                                            paddingLeft: "36px"

                                        }}

                                        disabled={

                                            loadingSupervisores

                                        }

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

                                    Supervisor

                                </Form.Label>

                                <Form.Select

                                    className="form-control"

                                    value={

                                        supervisorSeleccionado

                                    }

                                    onChange={

                                        handleSupervisorChange

                                    }

                                    disabled={

                                        loadingSupervisores

                                    }

                                >

                                    <option value="">

                                        Seleccione un supervisor

                                    </option>

                                    {

                                        supervisoresFiltrados.map(

                                            item => (

                                                <option

                                                    key={

                                                        item.empleado_id

                                                    }

                                                    value={

                                                        item.empleado_id

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

                                    !supervisorSeleccionado ||

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

                        supervisorActual && (

                            <Alert

                                variant="light"

                                className="border mt-3 mb-0"

                            >

                                <div className="d-flex align-items-center">

                                    <FiUserCheck

                                        className="me-2 text-primary"

                                        size={20}

                                    />

                                    <div>

                                        <div className="fw-semibold">

                                            Supervisor seleccionado

                                        </div>

                                        <div className="text-muted">

                                            {

                                                supervisorActual.nombreCompleto

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

                loadingSupervisores && (

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

                                Cargando supervisores...

                            </div>

                        </Card.Body>

                    </Card>

                )

            }


            {

                !loadingSupervisores &&

                supervisores.length === 0 && (

                    <Alert variant="warning">

                        No se encontraron empleados con tipo{" "}

                        <strong>ENCARGADO</strong>.

                    </Alert>

                )

            }


            {

                !loadingSupervisores &&

                !supervisorSeleccionado &&

                supervisores.length > 0 && (

                    <Card className="shadow-sm">

                        <Card.Body

                            className="text-center py-5"

                        >

                            <FiUserCheck

                                size={42}

                                className="text-muted mb-3"

                            />

                            <h5>

                                Seleccione un supervisor

                            </h5>

                            <p className="text-muted mb-0">

                                Seleccione un encargado para consultar

                                las evaluaciones realizadas.

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

                                Generando reporte del supervisor...

                            </div>

                        </Card.Body>

                    </Card>

                )

            }


            {

                !loadingReporte &&

                supervisorSeleccionado &&

                reporte &&

                Number(

                    reporte?.resumen?.totalEvaluaciones || 0

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

                                    label: "Supervisor",

                                    value:

                                        supervisorActual
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

                supervisorSeleccionado &&

                reporte &&

                Number(

                    reporte?.resumen
                        ?.totalEvaluaciones || 0

                ) === 0 &&

                !error && (

                    <Alert variant="info">

                        No existen datos de evaluación para el

                        supervisor seleccionado.

                    </Alert>

                )

            }

        </ERPPage>

    );

};


export default ReporteSupervisorPage;