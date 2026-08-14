import React from "react";

import {
    Alert,
} from "react-bootstrap";

import {
    ERPButton,
    ERPModal,
} from "../../common/erp";

const RegistroArchivoPreviewModal = ({
    show,
    archivo,
    onHide,
}) => {

    const url =
        archivo?.url ||
        archivo?.webViewLink ||
        archivo?.web_view_link ||
        archivo?.webContentLink ||
        archivo?.web_content_link;

    const mime =
        archivo?.mime ||
        archivo?.mime_type ||
        "";

    const isImage =
        mime.startsWith(
            "image/"
        );

    const isPdf =
        mime ===
        "application/pdf";

    return (
        <ERPModal
            show={show}
            onHide={onHide}
            title={
                archivo?.nombre_logico ||
                archivo?.nombre ||
                "Vista previa"
            }
            size="xl"
            footer={
                <>
                    {
                        url && (
                            <ERPButton
                                type="save"
                                label="Abrir en nueva pestaña"
                                onClick={() =>
                                    window.open(
                                        url,
                                        "_blank",
                                        "noopener,noreferrer"
                                    )
                                }
                            />
                        )
                    }

                    <ERPButton
                        type="cancel"
                        label="Cerrar"
                        onClick={onHide}
                    />
                </>
            }
        >
            {
                !url && (
                    <Alert variant="warning">
                        El archivo no tiene una URL disponible.
                    </Alert>
                )
            }

            {
                url &&
                isImage && (
                    <div className="text-center">
                        <img
                            src={url}
                            alt={
                                archivo?.nombre_logico ||
                                archivo?.nombre ||
                                "Archivo"
                            }
                            style={{
                                maxWidth:
                                    "100%",
                                maxHeight:
                                    "70vh",
                            }}
                        />
                    </div>
                )
            }

            {
                url &&
                isPdf && (
                    <iframe
                        title={
                            archivo?.nombre ||
                            "PDF"
                        }
                        src={url}
                        style={{
                            width: "100%",
                            height: "70vh",
                            border: 0,
                        }}
                    />
                )
            }

            {
                url &&
                !isImage &&
                !isPdf && (
                    <Alert variant="info">
                        Este tipo de archivo no admite vista previa embebida. Use “Abrir en nueva pestaña”.
                    </Alert>
                )
            }
        </ERPModal>
    );
};

export default RegistroArchivoPreviewModal;
