import React, {
    useCallback,
} from "react";

import {
    Alert,
} from "react-bootstrap";

import {
    useNavigate,
} from "react-router-dom";

import {
    useSecurity,
} from "../../security/SecurityContext";

import {
    ERPCard,
    ERPPage,
} from "../../components/common/erp";

import RegistroConceptoFilters
    from "../../components/motorConceptos/registros/RegistroConceptoFilters";

import RegistroConceptoToolbar
    from "../../components/motorConceptos/registros/RegistroConceptoToolbar";

import RegistroConceptoTable
    from "../../components/motorConceptos/registros/RegistroConceptoTable";

import RegistroConceptoPagination
    from "../../components/motorConceptos/registros/RegistroConceptoPagination";

import RegistroConceptoDeleteModal
    from "../../components/motorConceptos/registros/RegistroConceptoDeleteModal";

// import {
//     useRegistroConceptosContext,
// } from "../../context/RegistroConceptosContext";

import {
    RegistroConceptosProvider,
    useRegistroConceptosContext,
} from "../../context/RegistroConceptosContext";

const RegistroConceptoListPageContent =
    () => {
        const navigate =
            useNavigate();

        const {
            user,
            can,
        } =
            useSecurity();

        const {
            registros,
            conceptos,
            entidadTipos,
            sucursales,

            estados,
            sortOptions,

            filters,
            pagination,

            loading,
            loadingCatalogs,
            deleting,

            selectedRegistro,
            showDeleteModal,

            error,
            message,

            clearAlerts,
            changeFilters,

            search,
            refresh,
            clearFilters,

            changePage,
            changeLimit,
            changeSort,
            applySort,

            openDeleteModal,
            closeDeleteModal,
            removeRegistro,
        } =
            useRegistroConceptosContext();

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

        const canUpdate =
            isAdmin ||
            can(
                "motorconceptos:registros.update"
            );

        const canDelete =
            isAdmin ||
            can(
                "motorconceptos:registros.delete"
            );

        const canExport =
            canView;

        const handleNew =
            useCallback(
                () => {
                    navigate(
                        "/motor-conceptos/registros/nuevo"
                    );
                },
                [
                    navigate,
                ]
            );

        const handleEdit =
            useCallback(
                (
                    registro
                ) => {
                    if (
                        !registro?.id
                    ) {
                        return;
                    }

                    navigate(
                        `/motor-conceptos/registros/${registro.id}`
                    );
                },
                [
                    navigate,
                ]
            );

        const handleHistory =
            useCallback(
                (
                    registro
                ) => {
                    if (
                        !registro?.id
                    ) {
                        return;
                    }

                    navigate(
                        `/motor-conceptos/registros/${registro.id}/historial`
                    );
                },
                [
                    navigate,
                ]
            );

        const handleExport =
            useCallback(
                () => {
                    /*
                     * La exportación se completa
                     * en la Entrega 6.1B.
                     *
                     * No se agrega una librería
                     * ni un helper provisional.
                     */
                    window.alert(
                        "La exportación Excel se integrará en la siguiente entrega del Sprint 6.1."
                    );
                },
                []
            );

        const disabled =
            loading ||
            loadingCatalogs ||
            deleting;

        if (!canView) {
            return (
                <ERPPage
                    title="Registros de conceptos"
                >
                    <Alert
                        variant="danger"
                        className="mb-0"
                    >
                        No tiene permisos para consultar los registros del Motor de Conceptos.
                    </Alert>
                </ERPPage>
            );
        }

        return (
            <ERPPage
                title="Registros de conceptos"
                actions={
                    <RegistroConceptoToolbar
                        canCreate={
                            canCreate
                        }
                        canExport={
                            canExport
                        }
                        loading={
                            disabled
                        }
                        onNew={
                            handleNew
                        }
                        onExport={
                            handleExport
                        }
                        onRefresh={
                            refresh
                        }
                    />
                }
            >

                {
                    error && (
                        <Alert
                            variant="danger"
                            dismissible
                            onClose={
                                clearAlerts
                            }
                        >
                            {error}
                        </Alert>
                    )
                }

                {
                    message && (
                        <Alert
                            variant="success"
                            dismissible
                            onClose={
                                clearAlerts
                            }
                        >
                            {message}
                        </Alert>
                    )
                }

                <RegistroConceptoFilters
                    filters={
                        filters
                    }
                    conceptos={
                        conceptos
                    }
                    entidadTipos={
                        entidadTipos
                    }
                    sucursales={
                        sucursales
                    }
                    estados={
                        estados
                    }
                    sortOptions={
                        sortOptions
                    }
                    disabled={
                        disabled
                    }
                    onChange={
                        changeFilters
                    }
                    onSearch={
                        search
                    }
                    onClear={
                        clearFilters
                    }
                    onApplySort={
                        applySort
                    }
                />

                <ERPCard>

                    <RegistroConceptoTable
                        registros={
                            registros
                        }
                        loading={
                            loading
                        }
                        canUpdate={
                            canUpdate
                        }
                        canDelete={
                            canDelete
                        }
                        sortBy={
                            filters.sortBy
                        }
                        sortOrder={
                            filters.sortOrder
                        }
                        onSort={
                            changeSort
                        }
                        onEdit={
                            handleEdit
                        }
                        onHistory={
                            handleHistory
                        }
                        onDelete={
                            openDeleteModal
                        }
                    />

                    <RegistroConceptoPagination
                        page={
                            pagination.page
                        }
                        limit={
                            pagination.limit
                        }
                        total={
                            pagination.total
                        }
                        totalPages={
                            pagination.totalPages
                        }
                        disabled={
                            disabled
                        }
                        onPageChange={
                            changePage
                        }
                        onLimitChange={
                            changeLimit
                        }
                    />

                </ERPCard>

                <RegistroConceptoDeleteModal
                    show={
                        showDeleteModal
                    }
                    registro={
                        selectedRegistro
                    }
                    deleting={
                        deleting
                    }
                    onHide={
                        closeDeleteModal
                    }
                    onConfirm={
                        removeRegistro
                    }
                />

            </ERPPage>
        );
    };

const RegistroConceptoListPage =
    () => (
        <RegistroConceptosProvider>
            <RegistroConceptoListPageContent /> 
        </RegistroConceptosProvider>
    );

export default RegistroConceptoListPage;

