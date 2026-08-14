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
} from "react-router-dom";

import {
    ERPButton,
    ERPCard,
    ERPPage,
    ERPSearch,
    ERPTable,
} from "../../components/common/erp";

import RegistroCrearModal
    from "../../components/motorConceptos/registro/RegistroCrearModal";

import RegistroEstadoBadge
    from "../../components/motorConceptos/registro/RegistroEstadoBadge";

import useRegistrosConcepto
    from "../../hooks/useRegistrosConcepto";

import motorConceptoApi
    from "../../services/motorConceptoApi";

import motorConceptoRegistroApi
    from "../../services/motorConceptoRegistroApi";

import {
    useSecurity,
} from "../../security/SecurityContext";

const RegistroConceptoListPage = () => {

    const navigate =
        useNavigate();

    const {
        can,
    } = useSecurity();

    const data =
        useRegistrosConcepto();

    const [
        conceptos,
        setConceptos,
    ] = useState([]);

    const [
        entidadTipos,
        setEntidadTipos,
    ] = useState([]);

    const [
        showCreate,
        setShowCreate,
    ] = useState(false);

    const [
        creating,
        setCreating,
    ] = useState(false);

    const [
        actionError,
        setActionError,
    ] = useState("");

    useEffect(() => {
        const loadMasters =
            async () => {
                try {
                    const [
                        conceptosResponse,
                        tiposResponse,
                    ] = await Promise.all([
                        motorConceptoApi
                            .listar({
                                activo:
                                    true,
                                limit:
                                    500,
                            }),
                        motorConceptoApi
                            .listarEntidadTipos(),
                    ]);

                    setConceptos(
                        Array.isArray(
                            conceptosResponse
                        )
                            ? conceptosResponse
                            : conceptosResponse
                                ?.items ||
                            []
                    );

                    setEntidadTipos(
                        Array.isArray(
                            tiposResponse
                        )
                            ? tiposResponse
                            : []
                    );
                } catch (error) {
                    setActionError(
                        error?.message ||
                        "No se pudieron cargar los datos maestros"
                    );
                }
            };

        loadMasters();
    }, []);

    const crearRegistro =
        async (payload) => {
            setCreating(true);
            setActionError("");

            try {
                const response =
                    await motorConceptoRegistroApi
                        .crear(payload);

                setShowCreate(false);

                navigate(
                    `/motor-conceptos/registros/${response.id}`
                );
            } catch (error) {
                setActionError(
                    error?.message ||
                    "No se pudo crear el registro"
                );
                throw error;
            } finally {
                setCreating(false);
            }
        };

    const columns = [
        {
            key: "concepto",
            title: "Concepto",
            render: (row) =>
                row.concepto?.nombre ||
                "-",
        },
        {
            key: "entidad_tipo",
            title: "Entidad",
            render: (row) =>
                row.entidadTipo?.nombre ||
                row.entidad_tipo?.nombre ||
                row.entidad_tipo_id,
        },
        {
            key: "entidad_id",
            title: "Entidad ID",
        },
        {
            key: "estado",
            title: "Estado",
            render: (row) => (
                <RegistroEstadoBadge
                    estado={
                        row.estado
                    }
                />
            ),
        },
        {
            key: "version",
            title: "Versión",
            render: (row) =>
                row.versionActual
                    ?.numero ||
                row.version_actual
                    ?.numero ||
                "-",
        },
        {
            key: "fecha_vencimiento",
            title: "Vence",
            render: (row) =>
                row.fecha_vencimiento ||
                "-",
        },
        {
            key: "ultimo_movimiento",
            title: "Último movimiento",
            render: (row) =>
                row.ultimo_movimiento ||
                "-",
        },
    ];

    const actions = [
        {
            variant:
                "outline-primary",
            icon:
                "Abrir",
            onClick: (row) =>
                navigate(
                    `/motor-conceptos/registros/${row.id}`
                ),
        },
        // {
        //     variant:
        //         "outline-secondary",
        //     icon:
        //         "Historial",
        //     onClick: (row) =>
        //         navigate(
        //             `/motor-conceptos/registros/${row.id}/historial`
        //         ),
        // },
    ];

    return (
        <ERPPage
            title="Registros de Conceptos"
            subtitle="Captura dinámica de información"
            actions={
                can(
                    "motorconceptos:registros.create"
                ) && (
                    <ERPButton
                        type="new"
                        label="Nuevo registro"
                        onClick={() =>
                            setShowCreate(
                                true
                            )
                        }
                    />
                )
            }
        >
            {
                (
                    data.error ||
                    actionError
                ) && (
                    <Alert variant="danger">
                        {
                            data.error ||
                            actionError
                        }
                    </Alert>
                )
            }

            <ERPCard>
                <Row className="g-3 mb-3">
                    <Col
                        xs={12}
                        md={6}
                    >
                        <ERPSearch
                            value={
                                data.filters.search
                            }
                            onChange={(value) =>
                                data.updateFilter(
                                    "search",
                                    value
                                )
                            }
                            placeholder="Buscar registros"
                        />
                    </Col>

                    <Col
                        xs={12}
                        md={3}
                    >
                        <Form.Select
                        className="form-control"
                            value={
                                data.filters.estado
                            }
                            onChange={(event) =>
                                data.updateFilter(
                                    "estado",
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Todos los estados
                            </option>
                            <option value="BORRADOR">
                                Borrador
                            </option>
                            <option value="PENDIENTE">
                                Pendiente
                            </option>
                            <option value="VIGENTE">
                                Vigente
                            </option>
                            <option value="VENCIDO">
                                Vencido
                            </option>
                            <option value="ANULADO">
                                Anulado
                            </option>
                        </Form.Select>
                    </Col>

                    <Col
                        xs={12}
                        md={3}
                        className="d-flex justify-content-end"
                    >
                        <ERPButton
                            type="refresh"
                            onClick={
                                data.cargar
                            }
                        />
                    </Col>
                </Row>

                <ERPTable
                    columns={columns}
                    data={data.items}
                    actions={actions}
                    loading={data.loading}
                />
            </ERPCard>

            <RegistroCrearModal
                show={
                    showCreate
                }
                conceptos={
                    conceptos
                }
                entidadTipos={
                    entidadTipos
                }
                saving={
                    creating
                }
                onHide={() =>
                    !creating &&
                    setShowCreate(
                        false
                    )
                }
                onSubmit={
                    crearRegistro
                }
            />
        </ERPPage>
    );
};

export default RegistroConceptoListPage;
