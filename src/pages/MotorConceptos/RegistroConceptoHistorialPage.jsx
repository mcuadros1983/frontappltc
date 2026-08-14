import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Col,
    Form,
    Row,
} from "react-bootstrap";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ERPButton,
    ERPCard,
    ERPPage,
    ERPTable,
} from "../../components/common/erp";

// import RegistroVersionCompareModal
//     from "../../components/motorConceptos/registro/RegistroVersionCompareModal";

import motorConceptoRegistroApi
    from "../../services/motorConceptoRegistroApi";

const RegistroConceptoHistorialPage = () => {

    const {
        registroId,
    } = useParams();

    const navigate =
        useNavigate();

    const [
        items,
        setItems,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        versionA,
        setVersionA,
    ] = useState("");

    const [
        versionB,
        setVersionB,
    ] = useState("");

    const [
        comparison,
        setComparison,
    ] = useState(null);

    const [
        comparing,
        setComparing,
    ] = useState(false);

    useEffect(() => {
        const load =
            async () => {
                try {
                    const response =
                        await motorConceptoRegistroApi
                            .obtenerVersiones(
                                registroId
                            );

                    setItems(
                        Array.isArray(response)
                            ? response
                            : response?.items ||
                            []
                    );
                } catch (err) {
                    setError(
                        err?.message ||
                        "No se pudo cargar el historial"
                    );
                } finally {
                    setLoading(false);
                }
            };

        load();
    }, [registroId]);

    const comparar =
        async () => {
            if (
                !versionA ||
                !versionB
            ) {
                setError(
                    "Debe seleccionar dos versiones"
                );
                return;
            }

            if (
                Number(versionA) ===
                Number(versionB)
            ) {
                setError(
                    "Debe seleccionar versiones diferentes"
                );
                return;
            }

            setComparing(true);
            setError("");

            try {
                const response =
                    await motorConceptoRegistroApi
                        .compararVersiones(
                            registroId,
                            versionA,
                            versionB
                        );

                setComparison(
                    response
                );
            } catch (err) {
                setError(
                    err?.message ||
                    "No se pudieron comparar las versiones"
                );
            } finally {
                setComparing(false);
            }
        };

    const columns = [
        {
            key: "numero",
            title: "Versión",
        },
        {
            key: "motivo",
            title: "Motivo",
        },
        {
            key: "comentario",
            title: "Comentario",
        },
        {
            key: "creado_por",
            title: "Creado por",
            render: (row) =>
                row.usuarioCreacion
                    ?.usuario ||
                row.creado_por ||
                "-",
        },
        {
            key: "created_at",
            title: "Fecha",
            render: (row) =>
                row.created_at ||
                row.createdAt ||
                "-",
        },
    ];

    return (
        <ERPPage
            title="Historial de versiones"
            actions={
                <ERPButton
                    type="back"
                    onClick={() =>
                        navigate(
                            `/motor-conceptos/registros/${registroId}`
                        )
                    }
                />
            }
        >
            {
                error && (
                    <Alert variant="danger">
                        {error}
                    </Alert>
                )
            }
{/* 
            <ERPCard
                title="Comparar versiones"
            >
                <Row className="g-3">
                    <Col
                        xs={12}
                        md={4}
                    >
                        <Form.Select
                            value={
                                versionA
                            }
                            onChange={(event) =>
                                setVersionA(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Versión A
                            </option>

                            {
                                items.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            Versión {
                                                item.numero
                                            }
                                        </option>
                                    )
                                )
                            }
                        </Form.Select>
                    </Col>

                    <Col
                        xs={12}
                        md={4}
                    >
                        <Form.Select
                            value={
                                versionB
                            }
                            onChange={(event) =>
                                setVersionB(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Versión B
                            </option>

                            {
                                items.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            Versión {
                                                item.numero
                                            }
                                        </option>
                                    )
                                )
                            }
                        </Form.Select>
                    </Col>

                    <Col
                        xs={12}
                        md={4}
                    >
                        <ERPButton
                            type="refresh"
                            label={
                                comparing
                                    ? "Comparando..."
                                    : "Comparar"
                            }
                            disabled={
                                comparing
                            }
                            onClick={
                                comparar
                            }
                        />
                    </Col>
                </Row>
            </ERPCard> */}

            <ERPCard>
                <ERPTable
                    columns={columns}
                    data={items}
                    loading={loading}
                />
            </ERPCard>

            {/* <RegistroVersionCompareModal
                show={
                    Boolean(comparison)
                }
                comparison={
                    comparison
                }
                onHide={() =>
                    setComparison(null)
                }
            /> */}
        </ERPPage>
    );
};

export default RegistroConceptoHistorialPage;
