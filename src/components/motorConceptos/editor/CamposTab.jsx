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

import CampoModal
    from "./CampoModal";

const CamposTab = ({
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
            key: "etiqueta",
            title: "Etiqueta",
        },
        {
            key: "tipo",
            title: "Tipo",
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
            key: "visible",
            title: "Visible",
            render: (row) =>
                row.visible !== false
                    ? "Sí"
                    : "No",
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
                                `¿Eliminar el campo ${row.etiqueta}?`
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

    const handleSubmit =
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
                    <div className="mb-3">
                        <ERPButton
                            type="new"
                            label="Nuevo campo"
                            onClick={() => {
                                setSelected(null);
                                setShowModal(true);
                            }}
                        />
                    </div>
                )
            }

            <ERPTable
                columns={columns}
                data={campos}
                actions={actions}
            />

            <CampoModal
                show={showModal}
                campo={selected}
                saving={saving}
                onHide={() => {
                    if (saving) return;
                    setShowModal(false);
                    setSelected(null);
                }}
                onSubmit={
                    handleSubmit
                }
            />
        </>
    );
};

export default CamposTab;
