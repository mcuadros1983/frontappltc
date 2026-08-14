import React, {
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

import ArchivoTipoModal
    from "./ArchivoTipoModal";

const ArchivosTab = ({
    items = [],
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

    const columns = [
        {
            key: "orden",
            title: "Orden",
        },
        {
            key: "codigo",
            title: "Código",
        },
        {
            key: "nombre",
            title: "Nombre",
        },
        {
            key: "obligatorio",
            title: "Obligatorio",
            render: (row) =>
                row.obligatorio
                    ? "Sí"
                    : "No",
        },
        {
            key: "permite_multiples",
            title: "Múltiples",
            render: (row) =>
                row.permite_multiples
                    ? "Sí"
                    : "No",
        },
        {
            key: "tamanio_maximo_mb",
            title: "Máximo MB",
            render: (row) =>
                row.tamanio_maximo_mb ??
                "-",
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
                                `¿Eliminar ${row.nombre}?`
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
                        label="Nuevo tipo de archivo"
                        className="mb-3"
                        onClick={() => {
                            setSelected(null);
                            setShowModal(true);
                        }}
                    />
                )
            }

            <ERPTable
                columns={columns}
                data={items}
                actions={actions}
            />

            <ArchivoTipoModal
                show={showModal}
                item={selected}
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

export default ArchivosTab;
