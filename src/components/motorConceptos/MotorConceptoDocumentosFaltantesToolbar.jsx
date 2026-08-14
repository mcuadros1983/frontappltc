import React from "react";

import {
    Button,
    Spinner,
} from "react-bootstrap";

const MotorConceptoDocumentosFaltantesToolbar = ({
    loading = false,
    onRefresh,
    onBack,
}) => (
    <div className="d-flex flex-wrap align-items-center gap-2">

        <Button
            type="button"
            variant="outline-secondary"
            onClick={onBack}
        >
            <i className="bi bi-arrow-left me-2" />
            Regresar
        </Button>

        <Button
            type="button"
            variant="outline-secondary"
            disabled={loading}
            onClick={onRefresh}
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

export default MotorConceptoDocumentosFaltantesToolbar;