import React from "react";

import {
    Badge,
    Button,
    Spinner,
    Table,
} from "react-bootstrap";

import {
    formatDate,
    getExpirationStatus,
    getExpirationText,
} from "./utils/legajoVencimiento";

const getConceptName =
    registro =>
        registro?.concepto?.nombre ||
        registro?.concepto_nombre ||
        "-";

const getConceptCode =
    registro =>
        registro?.concepto?.codigo ||
        registro?.concepto_codigo ||
        "";

const getVersionNumber =
    registro =>
        registro?.versionActual
            ?.numero ??
        registro?.versionActual
            ?.numero_version ??
        registro?.version_actual
            ?.numero ??
        registro?.version_actual
            ?.numero_version ??
        registro?.numero_version ??
        "-";

const getCreatedAt =
    registro =>
        registro?.created_at ||
        registro?.createdAt ||
        null;

const getUpdatedAt =
    registro =>
        registro?.ultimo_movimiento ||
        registro?.updated_at ||
        registro?.updatedAt ||
        null;

const MotorConceptoLegajoTable =
    ({
        registros = [],
        loading = false,
        canOpen = false,
        canCreate = false,
        onOpen,
        onNew,
    }) => {
        if (
            loading &&
            registros.length === 0
        ) {
            return (
                <div className="py-5 text-center">
                    <Spinner
                        animation="border"
                        role="status"
                    />

                    <div className="mt-3 text-muted">
                        Cargando legajo documental...
                    </div>
                </div>
            );
        }

        if (
            registros.length === 0
        ) {
            return (
                <div className="py-5 text-center">
                    <div className="mb-3">
                        <i
                            className="bi bi-folder2-open text-muted"
                            style={{
                                fontSize:
                                    "3rem",
                            }}
                        />
                    </div>

                    <h5>
                        No existen documentos registrados
                    </h5>

                    <p className="text-muted mb-4">
                        No se encontraron documentos para la entidad y los filtros seleccionados.
                    </p>

                    {canCreate &&
                        onNew && (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={
                                    onNew
                                }
                            >
                                <i className="bi bi-plus-lg me-2" />

                                Nuevo documento
                            </Button>
                        )}
                </div>
            );
        }

        return (
            <Table
                hover
                responsive
                className="align-middle mb-0"
            >
                <thead>
                    <tr>
                        <th>
                            Concepto
                        </th>

                        <th>
                            Estado
                        </th>

                        <th>
                            Vencimiento
                        </th>

                        <th>
                            Creación
                        </th>

                        <th>
                            Último movimiento
                        </th>

                        <th className="text-center">
                            Versión
                        </th>

                        <th className="text-end">
                            Acciones
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {registros.map(
                        registro => {
                            const expirationStatus =
                                getExpirationStatus(
                                    registro
                                );

                            const expirationText =
                                getExpirationText(
                                    registro
                                );

                            const conceptName =
                                getConceptName(
                                    registro
                                );

                            const conceptCode =
                                getConceptCode(
                                    registro
                                );

                            return (
                                <tr
                                    key={
                                        registro.id
                                    }
                                    role={
                                        canOpen
                                            ? "button"
                                            : undefined
                                    }
                                    tabIndex={
                                        canOpen
                                            ? 0
                                            : undefined
                                    }
                                    style={{
                                        cursor:
                                            canOpen
                                                ? "pointer"
                                                : "default",
                                    }}
                                    onDoubleClick={
                                        canOpen
                                            ? () =>
                                                onOpen(
                                                    registro
                                                )
                                            : undefined
                                    }
                                    onKeyDown={
                                        canOpen
                                            ? event => {
                                                if (
                                                    event.key ===
                                                        "Enter" ||
                                                    event.key ===
                                                        " "
                                                ) {
                                                    event.preventDefault();

                                                    onOpen(
                                                        registro
                                                    );
                                                }
                                            }
                                            : undefined
                                    }
                                >
                                    <td>
                                        <div className="d-flex align-items-start gap-2">
                                            <i
                                                className={
                                                    `${expirationStatus.icon} text-${expirationStatus.variant} mt-1`
                                                }
                                            />

                                            <div>
                                                <div className="fw-semibold">
                                                    {conceptName}
                                                </div>

                                                {conceptCode && (
                                                    <small className="text-muted">
                                                        {conceptCode}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <Badge
                                            bg={
                                                expirationStatus.variant
                                            }
                                            className="d-inline-flex align-items-center gap-1"
                                        >
                                            <i
                                                className={
                                                    expirationStatus.icon
                                                }
                                            />

                                            {
                                                expirationStatus.label
                                            }
                                        </Badge>

                                        {registro?.estado &&
                                            String(
                                                registro.estado
                                            ).toUpperCase() !==
                                                expirationStatus.key &&
                                            expirationStatus.key ===
                                                "PROXIMO_VENCER" && (
                                                <div className="small text-muted mt-1">
                                                    Estado:{" "}
                                                    {
                                                        registro.estado
                                                    }
                                                </div>
                                            )}
                                    </td>

                                    <td>
                                        <div
                                            className={
                                                expirationStatus.variant ===
                                                "danger"
                                                    ? "text-danger fw-semibold"
                                                    : expirationStatus.variant ===
                                                      "warning"
                                                    ? "text-warning fw-semibold"
                                                    : ""
                                            }
                                        >
                                            {formatDate(
                                                registro
                                                    ?.fecha_vencimiento
                                            )}
                                        </div>

                                        <small
                                            className={
                                                `text-${expirationStatus.variant}`
                                            }
                                        >
                                            {expirationText}
                                        </small>
                                    </td>

                                    <td>
                                        {formatDate(
                                            getCreatedAt(
                                                registro
                                            )
                                        )}
                                    </td>

                                    <td>
                                        {formatDate(
                                            getUpdatedAt(
                                                registro
                                            )
                                        )}
                                    </td>

                                    <td className="text-center">
                                        <Badge bg="light" text="dark">
                                            {getVersionNumber(
                                                registro
                                            )}
                                        </Badge>
                                    </td>

                                    <td className="text-end">
                                        {canOpen && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline-primary"
                                                title="Abrir documento"
                                                onClick={
                                                    event => {
                                                        event.stopPropagation();

                                                        onOpen(
                                                            registro
                                                        );
                                                    }
                                                }
                                            >
                                                <i className="bi bi-folder2-open me-2" />

                                                Abrir
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        }
                    )}
                </tbody>
            </Table>
        );
    };

export default MotorConceptoLegajoTable;