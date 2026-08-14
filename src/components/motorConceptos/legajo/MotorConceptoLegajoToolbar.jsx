import React from "react";

import {
    Button,
    Spinner,
} from "react-bootstrap";

const MotorConceptoLegajoToolbar =
    ({
        loading = false,
        canCreate = false,
        canViewMissing = false,
        onNew,
        onViewMissing,
        onRefresh,
    }) => (
        <div className="d-flex flex-wrap align-items-center gap-2">
            {canCreate && (
                <Button
                    type="button"
                    variant="primary"
                    disabled={
                        loading
                    }
                    onClick={
                        onNew
                    }
                >
                    <i className="bi bi-plus-lg me-2" />

                    Nuevo documento
                </Button>
            )}

            {canViewMissing && (
                <Button
                    type="button"
                    variant="warning"
                    disabled={loading}
                    onClick={onViewMissing}
                >
                    <i className="bi bi-exclamation-triangle me-2" />

                    Documentos faltantes
                </Button>
            )}

            <Button
                type="button"
                variant="outline-secondary"
                disabled={
                    loading
                }
                onClick={
                    onRefresh
                }
            >
                {loading ? (
                    <>
                        <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                        />

                        Actualizando
                    </>
                ) : (
                    <>
                        <i className="bi bi-arrow-clockwise me-2" />

                        Actualizar
                    </>
                )}
            </Button>
        </div>
    );

export default MotorConceptoLegajoToolbar;