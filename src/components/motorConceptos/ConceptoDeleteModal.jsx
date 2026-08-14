import React from "react";

import {
    Alert,
} from "react-bootstrap";

import {
    ERPButton,
    ERPModal,
} from "../common/erp";

const ConceptoDeleteModal = ({
    show,
    concepto,
    deleting = false,
    onHide,
    onConfirm,
}) => {

    return (
        <ERPModal
            show={show}
            onHide={
                deleting
                    ? undefined
                    : onHide
            }
            title="Eliminar concepto"
            size="md"
            footer={
                <>
                    <ERPButton
                        type="cancel"
                        disabled={deleting}
                        onClick={onHide}
                    />

                    <ERPButton
                        type="delete"
                        variant="danger"
                        disabled={deleting}
                        onClick={onConfirm}
                    >
                        {
                            deleting
                                ? "Eliminando..."
                                : "Eliminar"
                        }
                    </ERPButton>
                </>
            }
        >
            <Alert
                variant="warning"
                className="mb-0"
            >
                Se realizará una eliminación lógica del concepto{" "}
                <strong>
                    {
                        concepto?.nombre ||
                        concepto?.codigo
                    }
                </strong>.
            </Alert>
        </ERPModal>
    );
};

export default ConceptoDeleteModal;
