import React, {
    useMemo,
    useState,
} from "react";

import {
    FiEdit2,
    FiTrash2,
} from "react-icons/fi";

import {
    ERPButton,
    ERPTable,
} from "../../common/erp";

import ReglaModal
    from "./ReglaModal";

const ReglasTab = ({
    reglas = [],
    campos = [],
    saving,
    canConfig,
    onCreate,
    onUpdate,
    onDelete,
}) => {

    const [
        selected,
        setSelected,
    ] = useState(null);

    const [
        showModal,
        setShowModal,
    ] = useState(false);

    const camposMap =
        useMemo(
            () =>
                new Map(
                    campos.map(
                        (campo) => [
                            Number(
                                campo.id
                            ),
                            campo.etiqueta,
                        ]
                    )
                ),
            [campos]
        );

    const columns = [
        {
            key: "campo_origen_id",
            title: "Origen",
            render: (row) =>
                camposMap.get(
                    Number(
                        row.campo_origen_id
                    )
                ) ||
                row.campo_origen_id,
        },
        {
            key: "operador",
            title: "Operador",
        },
        {
            key: "valor_comparacion",
            title: "Valor",
            render: (row) =>
                row.valor_comparacion ===
                null ||
                row.valor_comparacion ===
                undefined
                    ? "-"
                    : typeof row.valor_comparacion ===
                        "string"
                        ? row.valor_comparacion
                        : JSON.stringify(
                            row.valor_comparacion
                        ),
        },
        {
            key: "campo_destino_id",
            title: "Destino",
            render: (row) =>
                camposMap.get(
                    Number(
                        row.campo_destino_id
                    )
                ) ||
                row.campo_destino_id,
        },
        {
            key: "tipo_regla",
            title: "Regla",
        },
        {
            key: "prioridad",
            title: "Prioridad",
        },
    ];

    const actions =
        canConfig
            ? [
                {
                    variant:
                        "outline-primary",
                    icon: <FiEdit2 />,
                    onClick: (row) => {
                        setSelected(row);
                        setShowModal(true);
                    },
                },
                {
                    variant:
                        "outline-danger",
                    icon: <FiTrash2 />,
                    onClick: async (row) => {
                        if (
                            window.confirm(
                                "¿Eliminar la regla?"
                            )
                        ) {
                            await onDelete(
                                row.id
                            );
                        }
                    },
                },
            ]
            : [];

    const save =
        async (payload) => {
            if (selected?.id) {
                await onUpdate(
                    selected.id,
                    payload
                );
            } else {
                await onCreate(
                    payload
                );
            }

            setShowModal(false);
            setSelected(null);
        };

    return (
        <>
            {
                canConfig && (
                    <ERPButton
                        type="new"
                        label="Nueva regla"
                        className="mb-3"
                        disabled={
                            campos.length < 2
                        }
                        onClick={() => {
                            setSelected(null);
                            setShowModal(true);
                        }}
                    />
                )
            }

            <ERPTable
                columns={columns}
                data={reglas}
                actions={actions}
            />

            <ReglaModal
                show={showModal}
                item={selected}
                campos={campos}
                saving={saving}
                onHide={() => {
                    if (saving) return;
                    setShowModal(false);
                    setSelected(null);
                }}
                onSubmit={save}
            />
        </>
    );
};

export default ReglasTab;
