import React, {

    useEffect,

    useState

} from "react";

import {

    useNavigate,

    useParams

} from "react-router-dom";

import {

    Alert,

    Card,

    Col,

    Row,

    Spinner

} from "react-bootstrap";

import {

    ERPPage,

    ERPToolbar,

    ERPButton,

    ERPBadge

} from "../../components/common/erp";

import {

    metaApi

} from "../../services/evaluacion/metaApi";

const MetaDetallePage = () => {

    const {

        id

    } = useParams();

    const navigate = useNavigate();

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        error,

        setError

    ] = useState("");

    const [

        meta,

        setMeta

    ] = useState(null);

    /*=========================================================
      CARGAR META
    =========================================================*/

    useEffect(() => {

        let activo = true;

        const cargar = async () => {

            try {

                setLoading(true);

                setError("");

                const data =

                    await metaApi.obtenerMeta(

                        id

                    );

                if (activo) {

                    setMeta(

                        data

                    );

                }

            }

            catch (error) {

                console.error(error);

                if (activo) {

                    setError(

                        error.message ||

                        "No fue posible obtener la meta."

                    );

                }

            }

            finally {

                if (activo) {

                    setLoading(false);

                }

            }

        };

        cargar();

        return () => {

            activo = false;

        };

    }, [

        id

    ]);

    /*=========================================================
      NAVEGACIÓN
    =========================================================*/

    const volver = () => {

        navigate(

            "/evaluacion/metas"

        );

    };

    const editar = () => {

        navigate(

            `/evaluacion/metas/${id}`

        );

    };

    /*=========================================================
      FORMATO
    =========================================================*/

    const mostrarValor = valor => {

        if (

            valor === null ||

            valor === undefined ||

            valor === ""

        ) {

            return "-";

        }

        return valor;

    };

    const obtenerUnidad = () => {

        if (

            meta?.categoria === "FRECUENCIA"

        ) {

            return (

                meta.frecuencia_unidad ||

                meta.unidad_medida ||

                "-"

            );

        }

        return (

            meta?.unidad_medida ||

            "-"

        );

    };

    /*=========================================================
      CARGANDO
    =========================================================*/

    if (loading) {

        return (

            <ERPPage

                title="Detalle de Meta"

            >

                <div

                    className="d-flex justify-content-center align-items-center py-5"

                >

                    <Spinner

                        animation="border"

                    />

                </div>

            </ERPPage>

        );

    }

    /*=========================================================
      ERROR
    =========================================================*/

    if (error) {

        return (

            <ERPPage

                title="Detalle de Meta"

            >

                <Alert

                    variant="danger"

                >

                    {error}

                </Alert>

                <ERPButton

                    variant="secondary"

                    onClick={volver}

                >

                    Volver

                </ERPButton>

            </ERPPage>

        );

    }

    /*=========================================================
      SIN DATOS
    =========================================================*/

    if (!meta) {

        return (

            <ERPPage

                title="Detalle de Meta"

            >

                <Alert

                    variant="warning"

                >

                    No se encontró la meta solicitada.

                </Alert>

                <ERPButton

                    variant="secondary"

                    onClick={volver}

                >

                    Volver

                </ERPButton>

            </ERPPage>

        );

    }

    return (

        <ERPPage

            title={`Meta ${

                meta.codigo || ""

            }`}

            subtitle="Detalle de configuración de la meta"

        >

            <ERPToolbar

                right={

                    <div className="d-flex gap-2">

                        <ERPButton

                            variant="secondary"

                            onClick={volver}

                        >

                            Volver

                        </ERPButton>

                        <ERPButton

                            variant="primary"

                            onClick={editar}

                        >

                            Editar

                        </ERPButton>

                    </div>

                }

            />

            {/*=========================================================
              INFORMACIÓN GENERAL
            =========================================================*/}

            <Card className="shadow-sm mb-4">

                <Card.Header>

                    <strong>

                        Información General

                    </strong>

                </Card.Header>

                <Card.Body>

                    <Row>

                        <Col

                            md={3}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Código

                            </div>

                            <div className="fw-semibold">

                                {

                                    mostrarValor(

                                        meta.codigo

                                    )

                                }

                            </div>

                        </Col>

                        <Col

                            md={6}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Nombre

                            </div>

                            <div className="fw-semibold">

                                {

                                    mostrarValor(

                                        meta.nombre

                                    )

                                }

                            </div>

                        </Col>

                        <Col

                            md={3}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Estado

                            </div>

                            <div>

                                <ERPBadge

                                    status={

                                        meta.estado

                                    }

                                />

                            </div>

                        </Col>

                    </Row>

                    <Row>

                        <Col

                            md={12}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Descripción

                            </div>

                            <div>

                                {

                                    mostrarValor(

                                        meta.descripcion

                                    )

                                }

                            </div>

                        </Col>

                    </Row>

                </Card.Body>

            </Card>

            {/*=========================================================
              CONFIGURACIÓN
            =========================================================*/}

            <Card className="shadow-sm mb-4">

                <Card.Header>

                    <strong>

                        Configuración

                    </strong>

                </Card.Header>

                <Card.Body>

                    <Row>

                        <Col

                            md={3}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Categoría

                            </div>

                            <div>

                                <ERPBadge

                                    status={

                                        meta.categoria

                                    }

                                />

                            </div>

                        </Col>

                        <Col

                            md={3}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Tipo

                            </div>

                            <div className="fw-semibold">

                                {

                                    mostrarValor(

                                        meta.tipo

                                    )

                                }

                            </div>

                        </Col>

                        <Col

                            md={3}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Capa

                            </div>

                            <div className="fw-semibold">

                                {

                                    meta.categoria === "BRECHA"

                                        ? "-"

                                        : mostrarValor(

                                            meta.capa

                                        )

                                }

                            </div>

                        </Col>

                        <Col

                            md={3}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Prioridad

                            </div>

                            <div>

                                <ERPBadge

                                    status={

                                        meta.prioridad

                                    }

                                />

                            </div>

                        </Col>

                    </Row>

                    {

                        meta.categoria === "BRECHA" && (

                            <Row>

                                <Col

                                    md={6}

                                    className="mb-3"

                                >

                                    <div className="text-muted small">

                                        Comparación

                                    </div>

                                    <div className="fw-semibold">

                                        {

                                            mostrarValor(

                                                meta.comparacion

                                            )

                                        }

                                    </div>

                                </Col>

                            </Row>

                        )

                    }

                    <Row>

                        <Col

                            md={3}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Valor objetivo

                            </div>

                            <div className="fw-semibold">

                                {

                                    mostrarValor(

                                        meta.valor_objetivo

                                    )

                                }

                            </div>

                        </Col>

                        <Col

                            md={3}

                            className="mb-3"

                        >

                            <div className="text-muted small">

                                Unidad

                            </div>

                            <div className="fw-semibold">

                                {

                                    obtenerUnidad()

                                }

                            </div>

                        </Col>

                        {

                            meta.categoria === "FRECUENCIA" && (

                                <Col

                                    md={3}

                                    className="mb-3"

                                >

                                    <div className="text-muted small">

                                        Unidad de frecuencia

                                    </div>

                                    <div className="fw-semibold">

                                        {

                                            mostrarValor(

                                                meta.frecuencia_unidad

                                            )

                                        }

                                    </div>

                                </Col>

                            )

                        }

                        {

                            meta.categoria === "CUMPLIMIENTO" && (

                                <Col

                                    md={3}

                                    className="mb-3"

                                >

                                    <div className="text-muted small">

                                        Ponderación

                                    </div>

                                    <div className="fw-semibold">

                                        {

                                            Number(

                                                meta.ponderacion || 0

                                            ).toFixed(2)

                                        } %

                                    </div>

                                </Col>

                            )

                        }

                    </Row>

                </Card.Body>

            </Card>

            {/*=========================================================
              OBSERVACIONES
            =========================================================*/}

            <Card className="shadow-sm">

                <Card.Header>

                    <strong>

                        Observaciones

                    </strong>

                </Card.Header>

                <Card.Body>

                    {

                        mostrarValor(

                            meta.observaciones

                        )

                    }

                </Card.Body>

            </Card>

        </ERPPage>

    );

};

export default MetaDetallePage;