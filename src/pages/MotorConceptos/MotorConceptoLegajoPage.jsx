import React, {
    useCallback,
} from "react";

import {
    Alert,
    Badge,
} from "react-bootstrap";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import {
    MotorConceptoLegajoFilters,
    MotorConceptoLegajoPagination,
    MotorConceptoLegajoResumen,
    MotorConceptoLegajoTable,
    MotorConceptoLegajoToolbar,
} from "../../components/motorConceptos/legajo";

import {
    MotorConceptoLegajoProvider,
    useMotorConceptoLegajoContext,
} from "../../context/MotorConceptoLegajoContext";

import {
    useSecurity,
} from "../../security/SecurityContext";

// import MotorConceptoDashboardCard
//     from "../../components/motorConceptos/dashboard/MotorConceptoDashboardCard";

import {
    MotorConceptoDashboard,
} from "../../components/motorConceptos/dashboard";


const MotorConceptoLegajoPageContent =
    () => {
        const navigate =
            useNavigate();

        const location =
            useLocation();

        const {
            user,
            can,
        } = useSecurity();

        const {
            entidadTipoId,
            entidadId,
            entidadTipo,

            registros,
            resumen,

            filters,
            pagination,

            loading,
            summaryLoading,

            error,
            message,

            validParams,

            clearAlerts,
            changeFilter,
            applyFilters,
            clearFilters,

            refresh,
            changePage,
            changeLimit,
        } =
            useMotorConceptoLegajoContext();

        const isAdmin =
            Number(
                user?.rol_id
            ) === 1;

        const canView =
            isAdmin ||
            can(
                "motorconceptos:registros.view"
            );

        const canCreate =
            isAdmin ||
            can(
                "motorconceptos:registros.create"
            );

        const legajoPath =
            `/motor-conceptos/legajo/${entidadTipoId}/${entidadId}`;

        const entityName =
            location.state
                ?.entidadNombre ||
            location.state
                ?.entidad_nombre ||
            "";

        const entityTypeName =
            entidadTipo?.nombre ||
            entidadTipo?.codigo ||
            location.state
                ?.entidadTipoNombre ||
            location.state
                ?.entidad_tipo_nombre ||
            "Entidad";

        const handleNew =
            useCallback(
                () => {
                    if (
                        !entidadTipoId ||
                        !entidadId
                    ) {
                        return;
                    }

                    navigate(
                        "/motor-conceptos/registros/nuevo",
                        {
                            state: {
                                entidad_tipo_id: entidadTipoId,
                                entidad_id: entidadId,
                                entidad_nombre: entityName,
                                entidad_tipo_nombre: entityTypeName,
                                fromLegajo: true,
                                legajoPath: location.pathname,
                            },
                        }
                    );
                },
                [
                    entidadId,
                    entidadTipoId,
                    entityName,
                    entityTypeName,
                    legajoPath,
                    navigate,
                ]
            );

        const handleOpen =
            useCallback(
                registro => {
                    if (
                        !registro?.id
                    ) {
                        return;
                    }

                    navigate(
                        `/motor-conceptos/registros/${registro.id}`,
                        {
                            state: {
                                fromLegajo:
                                    true,

                                legajoPath,

                                entidad_tipo_id:
                                    entidadTipoId,

                                entidad_id:
                                    entidadId,

                                entidad_nombre:
                                    entityName,

                                entidad_tipo_nombre:
                                    entityTypeName,
                            },
                        }
                    );
                },
                [
                    entidadId,
                    entidadTipoId,
                    entityName,
                    entityTypeName,
                    legajoPath,
                    navigate,
                ]
            );

        const subtitle = (
            <div className="d-flex flex-wrap align-items-center gap-2">
                <Badge bg="secondary">
                    {entityTypeName}
                </Badge>

                {entityName && (
                    <span className="fw-semibold">
                        {entityName}
                    </span>
                )}

                <span className="text-muted">
                    ID {entidadId}
                </span>
            </div>
        );

        if (
            !canView
        ) {
            return (
                <ERPPage
                    title="Legajo documental"
                >
                    <Alert variant="danger">
                        No tiene permisos para consultar registros del Motor de Conceptos.
                    </Alert>
                </ERPPage>
            );
        }

        if (
            !validParams
        ) {
            return (
                <ERPPage
                    title="Legajo documental"
                >
                    <Alert variant="warning">
                        No se recibió un tipo de entidad o una entidad válida.
                    </Alert>
                </ERPPage>
            );
        }

        return (
            <ERPPage
                title="Legajo documental"
                subtitle={
                    subtitle
                }
                actions={
                    <MotorConceptoLegajoToolbar
                        loading={loading}
                        canCreate={canCreate}
                        canViewMissing={can("motorconceptos:view")}
                        onNew={handleNew}
                        onViewMissing={() =>
                            navigate(
                                `/motor-conceptos/documentos-faltantes/${entidadTipoId}/${entidadId}`,
                                {
                                    state: {
                                        entidad_tipo_id: entidadTipoId,
                                        entidad_id: entidadId,
                                        entidad_nombre: entityName,
                                        entidad_tipo_nombre: entityTypeName,
                                        fromLegajo: true,
                                        legajoPath: location.pathname,
                                    }
                                }
                            )
                        }
                        onRefresh={refresh}
                    />
                }
            >
                {error && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={
                            clearAlerts
                        }
                    >
                        {error}
                    </Alert>
                )}

                {message && (
                    <Alert
                        variant="success"
                        dismissible
                        onClose={
                            clearAlerts
                        }
                    >
                        {message}
                    </Alert>
                )}

                <MotorConceptoLegajoResumen
                    resumen={resumen}
                    loading={summaryLoading}
                />

                <MotorConceptoDashboard
                    entidadTipoId={entidadTipoId}
                    entidadId={entidadId}
                    entidadNombre={entityName}
                    entidadTipoNombre={entityTypeName}
                />

                <ERPCard>
                    <MotorConceptoLegajoFilters
                        filters={
                            filters
                        }
                        loading={
                            loading
                        }
                        onChange={
                            changeFilter
                        }
                        onSearch={
                            applyFilters
                        }
                        onClear={
                            clearFilters
                        }
                    />

                    <MotorConceptoLegajoTable
                        registros={
                            registros
                        }
                        loading={
                            loading
                        }
                        canOpen={
                            canView
                        }
                        canCreate={
                            canCreate
                        }
                        onOpen={
                            handleOpen
                        }
                        onNew={
                            handleNew
                        }
                    />

                    {(
                        registros.length >
                        0 ||
                        pagination.total >
                        0
                    ) && (
                            <MotorConceptoLegajoPagination
                                pagination={
                                    pagination
                                }
                                loading={
                                    loading
                                }
                                onPageChange={
                                    changePage
                                }
                                onLimitChange={
                                    changeLimit
                                }
                            />
                        )}
                </ERPCard>
            </ERPPage>
        );
    };

const MotorConceptoLegajoPage =
    () => (
        <MotorConceptoLegajoProvider>
            <MotorConceptoLegajoPageContent />
        </MotorConceptoLegajoProvider>
    );

export default MotorConceptoLegajoPage;