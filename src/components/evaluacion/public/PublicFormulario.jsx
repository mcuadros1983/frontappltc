import React, {
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import Contexts from "../../../context/Contexts";

import {
    Card,
    Button,
    ProgressBar,
    Form,
    Row,
    Col,
    Alert,
    ListGroup,
    InputGroup,
    Spinner
} from "react-bootstrap";

import {
    FiSearch
} from "react-icons/fi";

import {
    evaluacionPublicApi
} from "../../../services/evaluacion/evaluacionPublicApi";


const apiUrl = process.env.REACT_APP_API_URL;

const PublicFormulario = ({

    formulario

}) => {

    const dataContext = useContext(
        Contexts.DataContext
    );

    const empleados =
        dataContext?.empleados || [];

    const [pantalla, setPantalla] = useState("identificacion");

    const [guardando, setGuardando] = useState(false);

    const [paso, setPaso] = useState(0);

    const [empleadoId, setEmpleadoId] = useState("");

    const [evaluadorId, setEvaluadorId] = useState("");

    const [busquedaEmpleado, setBusquedaEmpleado] = useState("");

    const [busquedaSupervisor, setBusquedaSupervisor] = useState("");

    const [respuestas, setRespuestas] = useState({});

    const [error, setError] = useState("");

    const [finalizado, setFinalizado] = useState(false);

    const [datosEmpleado, setDatosEmpleado] = useState([]);

    const [loadingEmpleados, setLoadingEmpleados] = useState(true);

    const getEmpleadoId = (item) => {

        return (

            item?.empleado?.id ??

            item?.empleado_id ??

            item?.id ??

            null

        );

    };

    const getEmpleadoNombreContexto = (item) => {

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

        const nombreCompleto =

            `${apellido} ${nombre}`.trim();

        return nombreCompleto;

    };

    useEffect(() => {

        let activo = true;

        const cargarDatosEmpleado = async () => {

            try {

                setLoadingEmpleados(true);

                const response = await fetch(

                    `${apiUrl}/datosempleado?limit=1000`,

                    {

                        credentials: "include"

                    }

                );

                const data = await response
                    .json()
                    .catch(() => null);

                // console.log("Datos de empleados obtenidos:",

                //     data);

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

                    "Error cargando datosempleado:",

                    error

                );

                if (activo) {

                    setError(

                        error.message ||

                        "No se pudieron cargar los empleados."

                    );

                }

            }
            finally {

                if (activo) {

                    setLoadingEmpleados(false);

                }

            }

        };

        cargarDatosEmpleado();

        return () => {

            activo = false;

        };

    }, []);

    const empleadosPorId = useMemo(() => {

        const mapa = new Map();

        empleados.forEach(item => {

            const id = getEmpleadoId(item);

            if (id === null) {

                return;

            }

            mapa.set(

                Number(id),

                {

                    id: Number(id),

                    nombreCompleto:

                        getEmpleadoNombreContexto(item) ||

                        `Empleado #${id}`,

                    original: item

                }

            );

        });

        return mapa;

    }, [empleados]);

    const vendedores = useMemo(() => {

        return datosEmpleado

            .filter(item =>

                String(item.tipo || "")
                    .toUpperCase() === "VENDEDOR"

            )

            .map(item => {

                const empleadoId = Number(

                    item.empleado_id

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

                        `Empleado #${empleadoId}`

                };

            })

            .sort((a, b) =>

                a.nombreCompleto.localeCompare(

                    b.nombreCompleto,

                    "es"

                )

            );

    }, [

        datosEmpleado,

        empleadosPorId

    ]);

    const encargados = useMemo(() => {

        console.log("datosEmpleado:", datosEmpleado[0]);

        return datosEmpleado

            .filter(item =>

                String(item.tipo || "")
                    .toUpperCase() === "ENCARGADO"

            )

            .map(item => {

                const empleadoId = Number(

                    item.empleado_id

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

                        `Empleado #${empleadoId}`

                };

            })

            .sort((a, b) =>

                a.nombreCompleto.localeCompare(

                    b.nombreCompleto,

                    "es"

                )

            );

    }, [

        datosEmpleado,

        empleadosPorId

    ]);

    const tipoEvaluacion = (

        formulario?.tipo?.codigo ||

        formulario?.tipo?.descripcion ||

        ""

    ).toUpperCase();

    const vendedoresFiltrados = useMemo(() => {

        const texto = busquedaEmpleado
            .trim()
            .toLocaleLowerCase("es");

        if (!texto) {

            return vendedores;

        }

        return vendedores.filter(item =>

            item.nombreCompleto

                .toLocaleLowerCase("es")

                .includes(texto)

        );

    }, [

        vendedores,

        busquedaEmpleado

    ]);

    const encargadosFiltrados = useMemo(() => {

        const texto = busquedaSupervisor
            .trim()
            .toLocaleLowerCase("es");

        if (!texto) {

            return encargados;

        }

        return encargados.filter(item =>

            item.nombreCompleto

                .toLocaleLowerCase("es")

                .includes(texto)

        );

    }, [

        encargados,

        busquedaSupervisor

    ]);

    if (

        !formulario ||

        !formulario.criterios ||

        formulario.criterios.length === 0

    ) {

        return (

            <div className="container py-5">

                <Card>

                    <Card.Body>

                        No existen preguntas para esta campaña.

                    </Card.Body>

                </Card>

            </div>

        );

    }

    const criterio = formulario.criterios[paso];

    const porcentaje =

        ((paso + 1) / formulario.criterios.length) * 100;

    const responder = (

        campo,

        valor

    ) => {

        setRespuestas(prev => ({

            ...prev,

            [criterio.id]: {

                ...(prev[criterio.id] || {}),

                [campo]: valor

            }

        }));

    };

    // const vendedoresFiltrados = useMemo(() => {

    //     if (!busquedaEmpleado.trim()) {

    //         return vendedores;

    //     }

    //     return vendedores.filter(item =>

    //         getEmpleadoNombre(item)

    //             .toLowerCase()

    //             .includes(

    //                 busquedaEmpleado.toLowerCase()

    //             )

    //     );

    // }, [

    //     vendedores,

    //     busquedaEmpleado,

    //     getEmpleadoNombre

    // ]);

    // const encargadosFiltrados = useMemo(() => {

    //     if (!busquedaSupervisor.trim()) {

    //         return encargados;

    //     }

    //     return encargados.filter(item =>

    //         getEmpleadoNombre(item)

    //             .toLowerCase()

    //             .includes(

    //                 busquedaSupervisor.toLowerCase()

    //             )

    //     );

    // }, [

    //     encargados,

    //     busquedaSupervisor,

    //     getEmpleadoNombre

    // ]);

    const continuar = () => {

        setError("");

        if (!empleadoId) {

            setError(

                "Debe seleccionar un empleado."

            );

            return;

        }

        if (

            tipoEvaluacion === "SUPERVISOR" &&

            !evaluadorId

        ) {

            setError(

                "Debe seleccionar un supervisor."

            );

            return;

        }

        setPantalla("preguntas");

    };

    const siguiente = () => {

        if (

            paso < formulario.criterios.length - 1

        ) {

            setPaso(

                paso + 1

            );

        }

    };

    const anterior = () => {

        if (

            paso > 0

        ) {

            setPaso(

                paso - 1

            );

        }

    };

    console.log({
        tipoEvaluacion,
        formularioTipo: formulario.tipo,
        vendedores: vendedores.length,
        encargados: encargados.length
    });

    console.log(
        [...new Set(datosEmpleado.map(x => x.tipo))]
    );

    if (pantalla === "identificacion") {

        if (loadingEmpleados) {

            return (

                <div className="container py-5 text-center">

                    <Spinner

                        animation="border"

                        role="status"

                    />

                    <div className="mt-3">

                        Cargando empleados...

                    </div>

                </div>

            );

        }

        return (

            <div
                className="container py-3"
                style={{
                    maxWidth: 700
                }}
            >

                <Card>

                    <Card.Body>

                        <h3 className="mb-2">

                            {formulario.plantilla.descripcion}

                        </h3>

                        <p className="text-muted">

                            {formulario.observaciones}

                        </p>

                        <hr />

                        <Alert variant="info">

                            Antes de comenzar necesitamos identificar quién realizará la evaluación.

                        </Alert>

                        {

                            tipoEvaluacion === "AUTO" && (

                                <>

                                    <Form.Label>

                                        Empleado

                                    </Form.Label>

                                    <InputGroup className="mb-3">

                                        <InputGroup.Text>

                                            <FiSearch />

                                        </InputGroup.Text>

                                        <Form.Control

                                            placeholder="Escriba nombre o apellido..."

                                            value={busquedaEmpleado}

                                            onChange={(e) => {

                                                setBusquedaEmpleado(

                                                    e.target.value

                                                );

                                            }}

                                        />

                                    </InputGroup>

                                    <ListGroup
                                        style={{
                                            maxHeight: 250,
                                            overflowY: "auto"
                                        }}
                                    >

                                        {

                                            vendedoresFiltrados.map(item => (

                                                <ListGroup.Item

                                                    action

                                                    active={

                                                        Number(empleadoId) ===

                                                        Number(item.empleado_id)

                                                    }

                                                    key={item.id}

                                                    onClick={() => {

                                                        setEmpleadoId(

                                                            item.empleado_id

                                                        );

                                                        setBusquedaEmpleado(

                                                            item.nombreCompleto

                                                        );

                                                    }}

                                                >

                                                    {item.nombreCompleto}

                                                </ListGroup.Item>

                                            ))

                                        }

                                    </ListGroup>

                                </>

                            )

                        }

                        {

                            tipoEvaluacion === "SUPERVISOR" && (

                                <>

                                    <Form.Group className="mb-4">

                                        <Form.Label>

                                            Supervisor

                                        </Form.Label>

                                        <InputGroup>

                                            <InputGroup.Text>

                                                <FiSearch />

                                            </InputGroup.Text>

                                            <Form.Control

                                                placeholder="Buscar supervisor..."

                                                value={busquedaSupervisor}

                                                onChange={(e) =>

                                                    setBusquedaSupervisor(

                                                        e.target.value

                                                    )

                                                }

                                            />

                                        </InputGroup>

                                    </Form.Group>

                                    <ListGroup
                                        className="mb-4"
                                        style={{
                                            maxHeight: 200,
                                            overflowY: "auto"
                                        }}
                                    >

                                        {

                                            // encargadosFiltrados.map(item => (

                                            //     <ListGroup.Item

                                            //         action

                                            //         active={

                                            //             Number(evaluadorId) ===

                                            //             Number(item.empleado_id)

                                            //         }

                                            //         key={item.id}

                                            //         onClick={() => {

                                            //             setEvaluadorId(

                                            //                 item.empleado_id

                                            //             );

                                            //             setBusquedaSupervisor(

                                            //                 item.nombreCompleto

                                            //             );

                                            //         }}

                                            //     >

                                            //         {item.nombreCompleto}

                                            //     </ListGroup.Item>

                                            // ))

                                            encargadosFiltrados.map(item => (

                                                <ListGroup.Item

                                                    key={item.empleado_id}

                                                    action

                                                    active={

                                                        Number(evaluadorId) ===

                                                        Number(item.empleado_id)

                                                    }

                                                    onClick={() => {

                                                        setEvaluadorId(

                                                            item.empleado_id

                                                        );

                                                        setBusquedaSupervisor(

                                                            item.nombreCompleto

                                                        );

                                                    }}

                                                >

                                                    {item.nombreCompleto}

                                                </ListGroup.Item>

                                            ))

                                        }

                                    </ListGroup>

                                    <Form.Group>

                                        <Form.Label>

                                            Vendedor evaluado

                                        </Form.Label>

                                        <InputGroup>

                                            <InputGroup.Text>

                                                <FiSearch />

                                            </InputGroup.Text>

                                            <Form.Control

                                                placeholder="Buscar vendedor..."

                                                value={busquedaEmpleado}

                                                onChange={(e) =>

                                                    setBusquedaEmpleado(

                                                        e.target.value

                                                    )

                                                }

                                            />

                                        </InputGroup>

                                    </Form.Group>

                                    <ListGroup
                                        className="mt-3"
                                        style={{
                                            maxHeight: 250,
                                            overflowY: "auto"
                                        }}
                                    >

                                        {

                                            // vendedoresFiltrados.map(item => (

                                            //     <ListGroup.Item

                                            //         key={getEmpleadoId(item)}

                                            //         action

                                            //         active={
                                            //             empleadoId === getEmpleadoId(item)
                                            //         }

                                            //         onClick={() => {

                                            //             setEmpleadoId(

                                            //                 getEmpleadoId(item)

                                            //             );

                                            //             setBusquedaEmpleado(

                                            //                 getEmpleadoNombreContexto(item)

                                            //             );

                                            //         }}

                                            //     >

                                            //         {getEmpleadoNombreContexto(item)}

                                            //     </ListGroup.Item>

                                            // ))

                                            vendedoresFiltrados.map(item => (

                                                <ListGroup.Item

                                                    key={item.empleado_id}

                                                    action

                                                    active={

                                                        Number(empleadoId) ===

                                                        Number(item.empleado_id)

                                                    }

                                                    onClick={() => {

                                                        setEmpleadoId(

                                                            item.empleado_id

                                                        );

                                                        setBusquedaEmpleado(

                                                            item.nombreCompleto

                                                        );

                                                    }}

                                                >

                                                    {item.nombreCompleto}

                                                </ListGroup.Item>

                                            ))

                                        }

                                    </ListGroup>

                                </>

                            )

                        }

                        {

                            tipoEvaluacion === "MYSTERY" && (

                                <>

                                    <Form.Label>

                                        Seleccione el vendedor

                                    </Form.Label>

                                    <InputGroup className="mb-3">

                                        <InputGroup.Text>

                                            <FiSearch />

                                        </InputGroup.Text>

                                        <Form.Control

                                            placeholder="Buscar vendedor..."

                                            value={busquedaEmpleado}

                                            onChange={(e) =>

                                                setBusquedaEmpleado(

                                                    e.target.value

                                                )

                                            }

                                        />

                                    </InputGroup>

                                    <ListGroup
                                        style={{
                                            maxHeight: 300,
                                            overflowY: "auto"
                                        }}
                                    >

                                        {

                                            // vendedoresFiltrados.map(item => (

                                            //     <ListGroup.Item

                                            //         key={getEmpleadoId(item)}

                                            //         action

                                            //         active={
                                            //             empleadoId === getEmpleadoId(item)
                                            //         }

                                            //         onClick={() => {

                                            //             setEmpleadoId(

                                            //                 getEmpleadoId(item)

                                            //             );

                                            //             setBusquedaEmpleado(

                                            //                 getEmpleadoNombreContexto(item)

                                            //             );

                                            //         }}

                                            //     >

                                            //         {getEmpleadoNombreContexto(item)}

                                            //     </ListGroup.Item>

                                            // ))

                                            vendedoresFiltrados.map(item => (

                                                <ListGroup.Item

                                                    key={item.empleado_id}

                                                    action

                                                    active={

                                                        Number(empleadoId) ===

                                                        Number(item.empleado_id)

                                                    }

                                                    onClick={() => {

                                                        setEmpleadoId(

                                                            item.empleado_id

                                                        );

                                                        setBusquedaEmpleado(

                                                            item.nombreCompleto

                                                        );

                                                    }}

                                                >

                                                    {item.nombreCompleto}

                                                </ListGroup.Item>

                                            ))

                                        }

                                    </ListGroup>

                                </>

                            )

                        }

                        {

                            error && (

                                <Alert
                                    className="mt-4"
                                    variant="danger"
                                >

                                    {error}

                                </Alert>

                            )

                        }

                        <div className="d-grid mt-4">

                            <Button

                                size="lg"

                                onClick={continuar}

                            >

                                Comenzar evaluación

                            </Button>

                        </div>

                    </Card.Body>

                </Card>

            </div>

        );

    }

    const finalizar = async () => {

        try {

            setGuardando(true);

            const payload = {

                tipo_respuesta: tipoEvaluacion,

                empleado_id: empleadoId,

                evaluador_id:

                    tipoEvaluacion === "SUPERVISOR"

                        ? evaluadorId

                        : null,

                observaciones: "",

                respuestas:

                    Object.entries(respuestas).map(

                        ([criterio_id, dato]) => ({

                            criterio_id:

                                Number(criterio_id),

                            valor:

                                dato.valor,

                            comentario:

                                dato.comentario || ""

                        })

                    )

            };

            // console.log("Finalizando evaluación con payload:", formulario.token);

            await evaluacionPublicApi.responder(

                formulario.token,

                payload

            );

            setFinalizado(true);

        }

        catch (error) {

            console.error(error);

            alert(

                error?.response?.data?.message ||

                "No fue posible registrar la evaluación."

            );

        }

        finally {

            setGuardando(false);

        }

    };

    if (finalizado) {

        return (

            <div
                className="container py-5"
                style={{
                    maxWidth: 700
                }}
            >

                <Card>

                    <Card.Body className="text-center">

                        <h2>

                            ✅ Muchas gracias

                        </h2>

                        <p className="lead mt-4">

                            Su evaluación fue registrada correctamente.

                        </p>

                        <p className="text-muted">

                            Ya puede cerrar esta ventana.

                        </p>

                    </Card.Body>

                </Card>

            </div>

        );

    }


    return (

        <div

            className="container py-3"

            style={{

                maxWidth: 700

            }}

        >

            <Card>

                <Card.Body>

                    <h5>

                        Pregunta {paso + 1} de {formulario.criterios.length}

                    </h5>

                    <ProgressBar

                        className="mb-4"

                        now={porcentaje}

                    />

                    <h4>

                        {criterio.pregunta || criterio.descripcion}

                    </h4>

                    {

                        criterio.descripcion && (

                            <p className="text-muted">

                                {criterio.descripcion}

                            </p>

                        )

                    }

                    <Row className="mt-4">

                        {

                            [

                                1,

                                2,

                                3,

                                4,

                                5

                            ].map(

                                nota => (

                                    <Col

                                        xs={12}

                                        key={nota}

                                        className="mb-2"

                                    >

                                        <Button

                                            type="button"

                                            className="w-100"

                                            size="lg"

                                            variant={

                                                respuestas[criterio.id]?.valor === nota

                                                    ? "primary"

                                                    : "outline-primary"

                                            }

                                            onClick={() =>

                                                responder(

                                                    "valor",

                                                    nota

                                                )

                                            }

                                        >

                                            {nota}

                                        </Button>

                                    </Col>

                                )

                            )

                        }

                    </Row>

                    {

                        criterio.permite_comentario && (

                            <Form.Group className="mt-4">

                                <Form.Label>

                                    Comentario

                                </Form.Label>

                                <Form.Control

                                    as="textarea"

                                    rows={4}

                                    value={

                                        respuestas[criterio.id]?.comentario ||

                                        ""

                                    }

                                    onChange={e =>

                                        responder(

                                            "comentario",

                                            e.target.value

                                        )

                                    }

                                />

                            </Form.Group>

                        )

                    }

                    <hr />

                    <div className="d-flex justify-content-between">

                        <Button

                            type="button"

                            variant="secondary"

                            disabled={paso === 0}

                            onClick={anterior}

                        >

                            Anterior

                        </Button>

                        {

                            paso === formulario.criterios.length - 1

                                ?

                                (

                                    <Button

                                        type="button"

                                        variant="success"

                                        disabled={guardando}

                                        onClick={finalizar}

                                    >

                                        {

                                            guardando

                                                ?

                                                <>

                                                    <Spinner

                                                        animation="border"

                                                        size="sm"

                                                        className="me-2"

                                                    />

                                                    Enviando...

                                                </>

                                                :

                                                "Finalizar evaluación"

                                        }

                                    </Button>

                                )

                                :

                                (

                                    <Button

                                        type="button"

                                        onClick={siguiente}

                                    >

                                        Siguiente

                                    </Button>

                                )

                        }

                    </div>

                </Card.Body>

            </Card>

        </div>

    );

};

export default PublicFormulario;