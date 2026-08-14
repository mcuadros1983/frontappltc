import React, {
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback
} from "react";

import {
    Alert,
    Form,
    Spinner,
    Tab,
    Tabs,
} from "react-bootstrap";

import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ERPButton,
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import FormRenderer
    from "../../components/motorConceptos/renderer/FormRenderer";

import RegistroArchivosPanel
    from "../../components/motorConceptos/registro/RegistroArchivosPanel";

import RegistroAutosaveStatus
    from "../../components/motorConceptos/registro/RegistroAutosaveStatus";

import RegistroHeader
    from "../../components/motorConceptos/registro/RegistroHeader";

import RegistroNuevaVersionModal
    from "../../components/motorConceptos/registro/RegistroNuevaVersionModal";

import RegistroToolbar
    from "../../components/motorConceptos/registro/RegistroToolbar";

import Contexts
    from "../../context/Contexts";

import useRegistroAutosave
    from "../../hooks/useRegistroAutosave";

import useRegistroConcepto
    from "../../hooks/useRegistroConcepto";

import useMotorConceptoRegistroArchivos
    from "../../hooks/useMotorConceptoRegistroArchivos";

import {
    useSecurity,
} from "../../security/SecurityContext";

import motorConceptoApi
    from "../../services/motorConceptoApi";

const normalizarListado =
    (response) => {

        if (
            Array.isArray(response)
        ) {
            return response;
        }

        if (
            Array.isArray(
                response?.rows
            )
        ) {
            return response.rows;
        }

        if (
            Array.isArray(
                response?.items
            )
        ) {
            return response.items;
        }

        if (
            Array.isArray(
                response?.data
            )
        ) {
            return response.data;
        }

        if (
            Array.isArray(
                response?.data?.rows
            )
        ) {
            return response.data.rows;
        }

        if (
            Array.isArray(
                response?.data?.items
            )
        ) {
            return response.data.items;
        }

        return [];

    };

const normalizarCodigo =
    (codigo) =>
        String(
            codigo || ""
        )
            .trim()
            .toUpperCase();

const RegistroConceptoEditorPage = () => {

    const {
        registroId,
    } = useParams();

    const navigate =
        useNavigate();

    const location =
        useLocation();

    // const isFromLegajo = Boolean(
    //     location.state?.entidad_tipo_id &&
    //     location.state?.entidad_id
    // );

    const isNew =
        registroId === "nuevo";

    const legajoContext =
        useMemo(
            () => ({
                entidadTipoId:
                    location.state
                        ?.entidad_tipo_id,

                entidadId:
                    location.state
                        ?.entidad_id,

                legajoPath:
                    location.state
                        ?.legajoPath,

                fromLegajo:
                    Boolean(
                        location.state
                            ?.fromLegajo &&
                        location.state
                            ?.entidad_tipo_id &&
                        location.state
                            ?.entidad_id
                    ),
            }),
            [
                location.state,
            ]
        );

    const isFromLegajo =
        legajoContext.fromLegajo;

    const formRef =
        useRef(null);

    const {
        can,
    } = useSecurity();

    const dataContext =
        useContext(
            Contexts.DataContext
        );

    // console.log("datacontext", dataContext);

    const {
        empleados = [],
        sucursales = [],
        empresasTabla = [],
    } = dataContext || {};

    
    const registro =
        useRegistroConcepto(
            isNew
                ? null
                : registroId
        );

    const archivos =
        useMotorConceptoRegistroArchivos({
            registroId: isNew
                ? null
                : registroId,
        });

    const {
        datosIniciales,
        setDatosIniciales,
    } = registro;


    useEffect(() => {

        if (!isNew) {
            return;
        }

        const state =
            location.state;

        if (!state) {
            return;
        }

        if (
            !state.entidad_tipo_id ||
            !state.entidad_id
        ) {
            return;
        }

        setDatosIniciales(current => ({

            ...current,

            entidad_tipo_id:
                current.entidad_tipo_id ||
                state.entidad_tipo_id,

            entidad_id:
                current.entidad_id ||
                state.entidad_id,

        }));

    }, [
        isNew,
        location.state,
        setDatosIniciales,
    ]);

    useEffect(
        () => {
            if (
                !isNew ||
                !isFromLegajo
            ) {
                return;
            }

            setDatosIniciales(
                current => ({
                    ...current,

                    entidad_tipo_id:
                        current
                            ?.entidad_tipo_id ||
                        legajoContext
                            .entidadTipoId,

                    entidad_id:
                        current
                            ?.entidad_id ||
                        legajoContext
                            .entidadId,
                })
            );
        },
        [
            isFromLegajo,
            isNew,
            legajoContext
                .entidadId,
            legajoContext
                .entidadTipoId,
            setDatosIniciales,
        ]
    );

    // useEffect(() => {

    //     if (
    //         isNew ||
    //         !registro.registro
    //     ) {
    //         return;
    //     }

    //     setDatosIniciales(current => ({

    //         ...current,

    //         observaciones:
    //             registro.registro.observaciones || "",

    //         fecha_vencimiento:
    //             registro.registro.fecha_vencimiento || null,

    //     }));

    // }, [
    //     isNew,
    //     registro.registro,
    //     setDatosIniciales,
    // ]);

    const handleBack =
        useCallback(
            () => {
                if (
                    legajoContext
                        .legajoPath
                ) {
                    navigate(
                        legajoContext
                            .legajoPath,
                        {
                            replace:
                                false,

                            state: {
                                entidadNombre:
                                    location.state
                                        ?.entidad_nombre,

                                entidadTipoNombre:
                                    location.state
                                        ?.entidad_tipo_nombre,
                            },
                        }
                    );

                    return;
                }

                navigate(
                    "/motor-conceptos/registros"
                );
            },
            [
                legajoContext
                    .legajoPath,
                location.state,
                navigate,
            ]
        );
    const [
        conceptos,
        setConceptos,
    ] = useState([]);

    const [
        entidadTipos,
        setEntidadTipos,
    ] = useState([]);

    const [
        catalogosLoading,
        setCatalogosLoading,
    ] = useState(false);

    const [
        activeTab,
        setActiveTab,
    ] = useState("datos");

    const [
        validationErrors,
        setValidationErrors,
    ] = useState({});

    const [
        ruleError,
        setRuleError,
    ] = useState("");

    const [
        autosaveEnabled,
        setAutosaveEnabled,
    ] = useState(false);

    const [
        showVersionModal,
        setShowVersionModal,
    ] = useState(false);

    useEffect(
        () => {

            if (
                !isNew
            ) {
                return;
            }

            let mounted =
                true;

            const cargarCatalogos =
                async () => {

                    setCatalogosLoading(
                        true
                    );

                    setRuleError("");

                    try {

                        const [
                            conceptosResponse,
                            entidadTiposResponse,
                        ] =
                            await Promise.all([
                                motorConceptoApi.listar({
                                    activo:
                                        true,
                                    page:
                                        1,
                                    limit:
                                        1000,
                                }),

                                motorConceptoApi
                                    .listarEntidadTipos(),
                            ]);

                        console.log("conceptosResponse", conceptosResponse, entidadTiposResponse);

                        if (
                            !mounted
                        ) {
                            return;
                        }

                        setConceptos(
                            normalizarListado(
                                conceptosResponse
                            )
                        );

                        setEntidadTipos(
                            normalizarListado(
                                entidadTiposResponse
                            )
                        );

                    } catch (error) {

                        if (
                            !mounted
                        ) {
                            return;
                        }

                        setRuleError(
                            error?.response
                                ?.data
                                ?.message ||
                            error?.message ||
                            "No se pudieron cargar los datos necesarios para crear el registro."
                        );

                    } finally {

                        if (
                            mounted
                        ) {
                            setCatalogosLoading(
                                false
                            );
                        }

                    }

                };

            cargarCatalogos();

            return () => {
                mounted = false;
            };

        },
        [
            isNew,
        ]
    );

    const entidadTipoSeleccionado =
        useMemo(
            () =>
                entidadTipos.find(
                    (item) =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            datosIniciales
                                ?.entidad_tipo_id
                        )
                ) ||
                null,
            [
                entidadTipos,
                datosIniciales
                    ?.entidad_tipo_id,
            ]
        );


    const entidades =
        useMemo(
            () => {



                const codigo =
                    normalizarCodigo(
                        entidadTipoSeleccionado?.codigo
                    );



                if (
                    [
                        "EMPLEADO",
                        "EMPLEADOS",
                    ].includes(codigo)
                ) {


                    return Array.isArray(empleados)
                        ? empleados
                        : [];
                }

                if (
                    [
                        "SUCURSAL",
                        "SUCURSALES",
                    ].includes(codigo)
                ) {

                    // console.log("➡ Retornando sucursales");

                    return Array.isArray(sucursales)
                        ? sucursales
                        : [];
                }

                if (
                    [
                        "EMPRESA",
                        "EMPRESAS",
                    ].includes(codigo)
                ) {

                    // console.log("➡ Retornando empresas");

                    return Array.isArray(empresasTabla)
                        ? empresasTabla
                        : [];
                }

                // console.log("➡ No coincide ningún tipo");

                return [];

            },
            [
                entidadTipoSeleccionado,
                empleados,
                sucursales,
                empresasTabla,
            ]
        );

    const handleDatoInicial =
        (field) =>
            (event) => {

                const value =
                    event.target.value;

                setRuleError("");

                setDatosIniciales(
                    (current) => {

                        const next = {
                            ...current,
                            [field]:
                                value,
                        };

                        if (
                            field === "concepto_id" &&
                            !isFromLegajo
                        ) {
                            next.entidad_tipo_id = "";
                            next.entidad_id = "";
                        }

                        if (
                            field === "entidad_tipo_id" &&
                            !isFromLegajo
                        ) {
                            next.entidad_id = "";
                        }

                        return next;

                    }
                );

            };

    const canUpdate =
        can(
            "motorconceptos:registros.update"
        );

    const readOnly =
        !isNew &&
        (
            !canUpdate ||
            [
                "ANULADO",
                "VENCIDO",
            ].includes(
                registro.registro?.estado
            )
        );

    const validarDatosIniciales =
        () => {

            setRuleError("");

            if (
                !datosIniciales
                    ?.concepto_id
            ) {

                setRuleError(
                    "Debe seleccionar un concepto."
                );

                return false;

            }

            if (
                conceptoSeleccionado?.usa_vencimiento &&
                !datosIniciales.fecha_vencimiento
            ) {
                setRuleError(
                    "Debe indicar la fecha de vencimiento."
                );

                return false;
            }

            if (
                !datosIniciales
                    ?.entidad_tipo_id
            ) {

                setRuleError(
                    "Debe seleccionar un tipo de entidad."
                );

                return false;

            }

            if (
                !datosIniciales
                    ?.entidad_id
            ) {

                setRuleError(
                    "Debe seleccionar una entidad."
                );

                return false;

            }

            return true;

        };

    const prepareAction =
        () => {

            setRuleError("");

            const result =
                formRef.current
                    ?.prepareSave();

            if (
                result &&
                !result.valid
            ) {

                setValidationErrors(
                    result.errors ||
                    {}
                );

                setRuleError(
                    "El formulario contiene errores y no puede guardarse."
                );

                setActiveTab(
                    "datos"
                );

                return false;

            }

            return true;

        };



    const handleSave =
        async () => {

            if (
                isNew
            ) {

                if (
                    !validarDatosIniciales()
                ) {
                    return;
                }

                const response =
                    await registro.guardar({
                        concepto_id:
                            Number(
                                datosIniciales.concepto_id
                            ),

                        entidad_tipo_id:
                            Number(
                                datosIniciales.entidad_tipo_id
                            ),

                        entidad_id:
                            Number(
                                datosIniciales.entidad_id
                            ),

                        observaciones:
                            datosIniciales.observaciones ||
                            null,

                        fecha_vencimiento:
                            datosIniciales.fecha_vencimiento ||
                            null,
                    });

                if (
                    response?.id
                ) {

                    navigate(
                        `/motor-conceptos/registros`,
                        {
                            replace: true,
                            state: {
                                ...location.state
                            }
                        }
                    );

                }

                return;

            }

            if (
                !prepareAction()
            ) {
                return;
            }

            await registro.guardar();

        };

    const handleSaveDraft =
        async () => {

            if (
                isNew
            ) {

                if (
                    !validarDatosIniciales()
                ) {
                    return;
                }

                const response =
                    await registro.guardarBorrador({
                        concepto_id:
                            Number(
                                datosIniciales
                                    .concepto_id
                            ),

                        entidad_tipo_id:
                            Number(
                                datosIniciales
                                    .entidad_tipo_id
                            ),

                        entidad_id:
                            Number(
                                datosIniciales
                                    .entidad_id
                            ),

                        observaciones:
                            datosIniciales
                                .observaciones ||
                            null,

                        fecha_vencimiento:
                            datosIniciales
                                .fecha_vencimiento ||
                            null,
                    });

                if (
                    response?.id
                ) {

                    navigate(
                        `/motor-conceptos/registros/${response.id}`,
                        {
                            replace: true,
                            state: {
                                ...location.state
                            }
                        }
                    );

                }

                return;

            }

            formRef.current
                ?.runEvent(
                    "ON_SAVE",
                    {
                        validate:
                            false,
                    }
                );

            await registro
                .guardarBorrador();

        };

    const handleFinish =
        async () => {

            if (
                isNew
            ) {
                return;
            }

            if (
                !prepareAction()
            ) {
                return;
            }

            await registro.finalizar();

            if (
                location.state?.fromLegajo &&
                location.state?.legajoPath
            ) {

                navigate(
                    location.state.legajoPath
                );

            }

        };

    const autosaveStatus =
        useRegistroAutosave({

            enabled:

                !isNew &&

                autosaveEnabled &&

                !readOnly &&

                !registro.loading,

            values:

                registro.valores,

            save:

                async () => {

                    formRef.current
                        ?.runEvent(
                            "ON_SAVE",
                            {
                                validate:
                                    false,
                            }
                        );

                    await registro.guardar({
                        silencioso:
                            true,
                    });

                },

        });

    if (

        registro.loading &&

        !registro.registro &&

        !isNew

    ) {

        return (

            <ERPPage
                title="Registro"
            >

                <ERPCard>

                    <div className="p-5 text-center">

                        <Spinner />

                    </div>

                </ERPCard>

            </ERPPage>

        );

    }

    const archivoTipos =

        registro.concepto
            ?.archivosTipos ||

        registro.concepto
            ?.archivoTipos ||

        registro.concepto
            ?.archivo_tipos ||

        [];

    const getEntidadOption = (item) => {

        if (item.empleado) {

            return {
                id: item.empleado.id,
                nombre: `${item.empleado.apellido}, ${item.empleado.nombre}`,
            };

        }

        if (item.clientePersona) {

            return {
                id: item.clientePersona.id,
                nombre: `${item.clientePersona.apellido}, ${item.clientePersona.nombre}`,
            };

        }

        return {

            id: item.id,

            nombre:
                item.nombre ||
                item.descripcion ||
                item.razon_social ||
                "",

        };

    };

    const conceptoSeleccionado =
        conceptos.find(
            (item) =>
                Number(item.id) ===
                Number(datosIniciales.concepto_id)
        );

    return (
        <ERPPage
            title={
                isNew
                    ? "Nuevo registro"
                    : (
                        registro.concepto?.nombre ||
                        "Registro de concepto"
                    )
            }

            subtitle={
                isNew
                    ? "Creación de registro"
                    : "Formulario dinámico"
            }

            actions={
                <div className="d-flex gap-2 align-items-center">

                    {
                        !isNew && (
                            <RegistroAutosaveStatus
                                status={
                                    autosaveStatus
                                }
                            />
                        )
                    }

                    <ERPButton
                        type="refresh"
                        disabled={
                            registro.loading ||
                            catalogosLoading
                        }
                        onClick={
                            registro.cargar
                        }
                    />

                    <ERPButton
                        type="back"
                        onClick={() => {

                            if (
                                location.state?.fromLegajo &&
                                location.state?.legajoPath
                            ) {

                                navigate(
                                    location.state.legajoPath,
                                    {
                                        state: {
                                            entidadNombre:
                                                location.state?.entidad_nombre,

                                            entidadTipoNombre:
                                                location.state?.entidad_tipo_nombre,
                                        },
                                    }
                                );

                                return;

                            }

                            navigate(
                                "/motor-conceptos/registros"
                            );

                        }}
                    />



                </div>
            }
        >

            {
                (
                    registro.error ||
                    ruleError
                ) && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={() => {
                            registro.clearMessages();
                            setRuleError("");
                        }}
                    >
                        {
                            registro.error ||
                            ruleError
                        }
                    </Alert>
                )
            }

            {
                registro.message && (
                    <Alert
                        variant="success"
                        dismissible
                        onClose={
                            registro.clearMessages
                        }
                    >
                        {
                            registro.message
                        }
                    </Alert>
                )
            }

            {
                isNew ? (

                    <>

                        <ERPCard>

                            <div>

                                <h5 className="mb-1">
                                    Nuevo Registro
                                </h5>

                                <small className="text-muted">
                                    Seleccione el concepto y la entidad para crear el registro.
                                </small>

                            </div>

                        </ERPCard>

                        <ERPCard>

                            {
                                catalogosLoading
                                    ? (
                                        <div className="text-center p-5">
                                            <Spinner />
                                        </div>
                                    )
                                    : (

                                        <div className="row">

                                            <div className="col-md-6 mb-3">

                                                <Form.Group>

                                                    <Form.Label>
                                                        Concepto
                                                    </Form.Label>

                                                    <Form.Select
                                                        className="form-control"
                                                        value={
                                                            datosIniciales.concepto_id || ""
                                                        }
                                                        onChange={
                                                            handleDatoInicial(
                                                                "concepto_id"
                                                            )
                                                        }
                                                    >

                                                        <option value="">
                                                            Seleccione...
                                                        </option>

                                                        {
                                                            conceptos.map(
                                                                (item) => (

                                                                    <option
                                                                        key={item.id}
                                                                        value={item.id}
                                                                    >
                                                                        {item.nombre}
                                                                    </option>

                                                                )
                                                            )
                                                        }

                                                    </Form.Select>

                                                </Form.Group>

                                            </div>

                                            <div className="col-md-6 mb-3">

                                                <Form.Group>

                                                    <Form.Label>
                                                        Tipo de entidad
                                                    </Form.Label>

                                                    <Form.Select
                                                        className="form-control"
                                                        value={
                                                            datosIniciales.entidad_tipo_id || ""
                                                        }
                                                        onChange={
                                                            handleDatoInicial(
                                                                "entidad_tipo_id"
                                                            )
                                                        }

                                                        // disabled={
                                                        //     catalogosLoading ||
                                                        //     isFromLegajo ||
                                                        //     !datosIniciales
                                                        //         ?.entidad_tipo_id
                                                        // }
                                                        disabled={catalogosLoading}
                                                    >

                                                        <option value="">
                                                            Seleccione...
                                                        </option>

                                                        {
                                                            entidadTipos.map(
                                                                (item) => (

                                                                    <option
                                                                        key={item.id}
                                                                        value={item.id}
                                                                    >
                                                                        {item.nombre}
                                                                    </option>

                                                                )
                                                            )
                                                        }

                                                    </Form.Select>

                                                </Form.Group>

                                            </div>

                                            <div className="col-md-12 mb-4">

                                                <Form.Group>

                                                    <Form.Label>
                                                        Entidad
                                                    </Form.Label>

                                                    <Form.Select
                                                        className="form-control"
                                                        value={
                                                            datosIniciales.entidad_id || ""
                                                        }
                                                        onChange={
                                                            handleDatoInicial(
                                                                "entidad_id"
                                                            )
                                                        }

                                                    >

                                                        <option value="">
                                                            Seleccione...
                                                        </option>

                                                        {
                                                            entidades.map((item) => {

                                                                const entidad = getEntidadOption(item);

                                                                return (
                                                                    <option
                                                                        key={entidad.id}
                                                                        value={entidad.id}
                                                                    >
                                                                        {entidad.nombre}
                                                                    </option>
                                                                );

                                                            })
                                                        }

                                                    </Form.Select>

                                                </Form.Group>

                                            </div>

                                            {
                                                conceptoSeleccionado?.usa_vencimiento && (

                                                    <div className="col-md-6 mb-3">

                                                        <Form.Group>

                                                            <Form.Label>
                                                                Fecha de vencimiento
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="date"
                                                                value={
                                                                    datosIniciales.fecha_vencimiento || ""
                                                                }
                                                                onChange={(e) =>
                                                                    setDatosIniciales((prev) => ({
                                                                        ...prev,
                                                                        fecha_vencimiento:
                                                                            e.target.value || null,
                                                                    }))
                                                                }
                                                            />

                                                        </Form.Group>

                                                    </div>

                                                )
                                            }

                                        </div>

                                    )
                            }

                        </ERPCard>

                        <ERPCard>

                            <div className="d-flex justify-content-end">

                                <ERPButton
                                    type="save"
                                    disabled={
                                        registro.saving
                                    }
                                    onClick={
                                        handleSave
                                    }
                                >
                                    Crear Registro
                                </ERPButton>

                            </div>

                        </ERPCard>

                    </>

                ) : (

                    <>

                        <ERPCard>

                            <RegistroHeader
                                registro={
                                    registro.registro
                                }
                            />

                        </ERPCard>

                        <ERPCard>

                            <div className="d-flex justify-content-end mb-3">

                                <Form.Check
                                    type="switch"
                                    label="Autoguardado"
                                    checked={
                                        autosaveEnabled
                                    }
                                    disabled={
                                        readOnly
                                    }
                                    onChange={(event) =>
                                        setAutosaveEnabled(
                                            event.target.checked
                                        )
                                    }
                                />

                            </div>

                            {
                                !isNew &&
                                registro.registro?.estado === "BORRADOR" && (

                                    <ERPCard
                                        title="Datos del registro"
                                        className="mb-3"
                                    >

                                        <div className="row">



                                            {
                                                registro.concepto?.usa_vencimiento && (

                                                    <div className="col-md-4">

                                                        <Form.Group>

                                                            <Form.Label>
                                                                Fecha de vencimiento
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="date"
                                                                value={
                                                                    datosIniciales.fecha_vencimiento || ""
                                                                }
                                                                onChange={(e) =>
                                                                    setDatosIniciales((prev) => ({
                                                                        ...prev,
                                                                        fecha_vencimiento:
                                                                            e.target.value || null,
                                                                    }))
                                                                }
                                                            />

                                                        </Form.Group>

                                                    </div>

                                                )
                                            }

                                            <div className="col-md-8">

                                                <Form.Group>

                                                    <Form.Label>
                                                        Observaciones
                                                    </Form.Label>

                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={
                                                            datosIniciales.observaciones || ""
                                                        }
                                                        onChange={(e) =>
                                                            setDatosIniciales((prev) => ({
                                                                ...prev,
                                                                observaciones:
                                                                    e.target.value,
                                                            }))
                                                        }
                                                    />

                                                </Form.Group>

                                            </div>

                                        </div>

                                    </ERPCard>

                                )
                            }

                            <Tabs
                                activeKey={
                                    activeTab
                                }
                                onSelect={(key) =>
                                    setActiveTab(key)
                                }
                                mountOnEnter
                                unmountOnExit={false}
                            >

                                <Tab
                                    eventKey="datos"
                                    title="Datos"
                                >

                                    <div className="pt-4">


                                        <FormRenderer
                                            ref={
                                                formRef
                                            }

                                            fields={
                                                registro.campos
                                            }

                                            rules={
                                                registro.reglas
                                            }

                                            values={
                                                registro.valores
                                            }

                                            disabled={
                                                readOnly ||
                                                registro.saving
                                            }

                                            onChange={
                                                registro.setValor
                                            }

                                            onValidationChange={
                                                setValidationErrors
                                            }
                                        />

                                    </div>

                                </Tab>

                                <Tab
                                    eventKey="archivos"
                                    title="Archivos"
                                >

                                    <div className="pt-4">

                                        <RegistroArchivosPanel
                                            registroId={
                                                registroId
                                            }

                                            archivoTipos={
                                                archivoTipos
                                            }

                                            readOnly={
                                                readOnly
                                            }
                                        />

                                    </div>

                                </Tab>

                            </Tabs>

                        </ERPCard>

                        <ERPCard>

                            <RegistroToolbar
                                saving={
                                    registro.saving
                                }

                                readOnly={
                                    readOnly
                                }

                                hasErrors={
                                    Object.keys(
                                        validationErrors
                                    ).length > 0
                                }

                                onSave={
                                    handleSave
                                }

                                onSaveDraft={
                                    handleSaveDraft
                                }

                                onFinish={
                                    handleFinish
                                }

                                // onNewVersion={() =>
                                //     setShowVersionModal(
                                //         true
                                //     )
                                // }

                                // onHistory={() =>
                                //     navigate(
                                //         `/motor-conceptos/registros/${registroId}/historial`
                                //     )
                                // }
                                onNewVersion={null}
                                onHistory={null}
                            />

                        </ERPCard>

                        {/* <RegistroNuevaVersionModal
                            show={showVersionModal}
                            saving={registro.saving}
                            onHide={() =>
                                !registro.saving &&
                                setShowVersionModal(false)
                            }
                            onSubmit={registro.crearVersion}
                            archivoTipos={archivoTipos}
                            onUploadArchivos={async (
                                archivoTipoId,
                                files
                            ) => {

                                const archivoTipo =
                                    archivoTipos.find(
                                        item =>
                                            item.id === archivoTipoId
                                    );

                                if (!archivoTipo) {
                                    return;
                                }

                                await archivos.uploadMultiple(
                                    archivoTipo,
                                    files
                                );

                            }}
                        /> */}

                    </>

                )
            }

        </ERPPage>
    );

};
export default RegistroConceptoEditorPage;