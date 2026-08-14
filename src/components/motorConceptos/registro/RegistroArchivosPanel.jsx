import React, {
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Badge,
} from "react-bootstrap";

import {
    FiEye,
    FiTrash2,
} from "react-icons/fi";

import {
    ERPButton,
    ERPTable,
} from "../../common/erp";

import RegistroArchivoPreviewModal
    from "./RegistroArchivoPreviewModal";

import RegistroArchivoUploadModal
    from "./RegistroArchivoUploadModal";

import useRegistroArchivos
    from "../../../hooks/useRegistroArchivos";

const RegistroArchivosPanel = ({
    registroId,
    archivoTipos = [],
    readOnly = false,
}) => {

    const archivos =
        useRegistroArchivos(
            registroId,
            archivoTipos
        );

    const [
        showUpload,
        setShowUpload,
    ] = useState(false);

    const [
        preview,
        setPreview,
    ] = useState(null);

    const tiposMap =
        useMemo(
            () =>
                new Map(
                    archivoTipos.map(
                        (item) => [
                            Number(
                                item.id
                            ),
                            item,
                        ]
                    )
                ),
            [archivoTipos]
        );

    const columns = [
        {
            key: "nombre_logico",
            title: "Nombre lógico",
            render: (row) =>
                row.nombre_logico ||
                row.nombre ||
                "-",
        },
        {
            key: "archivo_tipo_id",
            title: "Tipo",
            render: (row) =>
                tiposMap.get(
                    Number(
                        row.archivo_tipo_id
                    )
                )?.nombre ||
                row.archivo_tipo?.nombre ||
                row.archivo_tipo_id,
        },
        {
            key: "nombre",
            title: "Archivo",
        },
        {
            key: "mime",
            title: "MIME",
            render: (row) =>
                row.mime ||
                row.mime_type ||
                "-",
        },
        {
            key: "peso",
            title: "Tamaño",
            render: (row) =>
                row.peso
                    ? `${(
                        Number(row.peso) /
                        1024 /
                        1024
                    ).toFixed(2)} MB`
                    : "-",
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

    const actions = [
        {
            variant:
                "outline-primary",
            icon:
                <FiEye />,
            onClick:
                setPreview,
        },
        ...(
            readOnly
                ? []
                : [
                    {
                        variant:
                            "outline-danger",
                        icon:
                            <FiTrash2 />,
                        onClick:
                            async (row) => {
                                if (
                                    window.confirm(
                                        `¿Eliminar ${row.nombre_logico || row.nombre}?`
                                    )
                                ) {
                                    await archivos
                                        .eliminar(
                                            row.id
                                        );
                                }
                            },
                    },
                ]
        ),
    ];

    return (
        <>
            {
                archivos.error && (
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={
                            archivos.clearMessages
                        }
                    >
                        {archivos.error}
                    </Alert>
                )
            }

            {
                archivos.message && (
                    <Alert
                        variant="success"
                        dismissible
                        onClose={
                            archivos.clearMessages
                        }
                    >
                        {
                            archivos.message
                        }
                    </Alert>
                )
            }

            {
                archivos.faltantes
                    .length > 0 && (
                    <Alert variant="warning">
                        <strong>
                            Archivos obligatorios pendientes:
                        </strong>

                        <div className="mt-2 d-flex flex-wrap gap-2">
                            {
                                archivos.faltantes
                                    .map(
                                        (item) => (
                                            <Badge
                                                key={
                                                    item.tipo.id
                                                }
                                                bg="warning"
                                                text="dark"
                                            >
                                                {
                                                    item.tipo.nombre
                                                }
                                            </Badge>
                                        )
                                    )
                            }
                        </div>
                    </Alert>
                )
            }

            {
                !readOnly && (
                    <ERPButton
                        type="new"
                        label="Subir archivo"
                        className="mb-3"
                        onClick={() =>
                            setShowUpload(
                                true
                            )
                        }
                    />
                )
            }

            <ERPTable
                columns={columns}
                data={
                    archivos.archivos
                }
                actions={actions}
                loading={
                    archivos.loading
                }
            />

            <RegistroArchivoUploadModal
                show={showUpload}
                archivoTipos={
                    archivoTipos
                }
                uploading={
                    archivos.uploading
                }
                onHide={() =>
                    !archivos.uploading &&
                    setShowUpload(false)
                }
                onSubmit={
                    archivos.subir
                }
            />

            <RegistroArchivoPreviewModal
                show={
                    Boolean(preview)
                }
                archivo={preview}
                onHide={() =>
                    setPreview(null)
                }
            />
        </>
    );
};

export default RegistroArchivosPanel;
