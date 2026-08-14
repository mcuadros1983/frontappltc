import React from "react";

import {
    FiEdit2,
    FiTrash2,
} from "react-icons/fi";

import {
    ERPBadge,
    ERPTable,
} from "../common/erp";

const obtenerEntidad = (row) => {
    if (row?.entidad) {
        return row.entidad;
    }

    if (
        row?.entidad_tipo?.nombre
    ) {
        return row.entidad_tipo.nombre;
    }

    if (
        row?.entidadTipo?.nombre
    ) {
        return row.entidadTipo.nombre;
    }

    if (
        Array.isArray(row?.entidades) &&
        row.entidades.length
    ) {
        return row.entidades
            .map((item) =>
                item?.nombre ||
                item?.codigo ||
                item?.entidad_tipo?.nombre ||
                item?.entidadTipo?.nombre
            )
            .filter(Boolean)
            .join(", ");
    }

    return "-";
};

const obtenerModoCaptura = (row) =>
    row?.modo_captura ??
    row?.modoCaptura ??
    "-";

const MotorConceptosTable = ({
    conceptos = [],
    loading = false,
    canUpdate = false,
    canDelete = false,
    onEdit,
    onDelete,
}) => {

    const columns = [
        {
            key: "codigo",
            title: "Código",
        },
        {
            key: "nombre",
            title: "Nombre",
        },
        {
            key: "modo_captura",
            title: "Modo captura",
            render: (row) =>
                obtenerModoCaptura(row),
        },
        {
            key: "entidad",
            title: "Entidad",
            render: (row) =>
                obtenerEntidad(row),
        },
        {
            key: "activo",
            title: "Activo",
            render: (row) => (
                <ERPBadge
                    variant={
                        row?.activo === false
                            ? "secondary"
                            : "success"
                    }
                >
                    {
                        row?.activo === false
                            ? "No"
                            : "Sí"
                    }
                </ERPBadge>
            ),
        },
    ];

    const actions = [];

    if (canUpdate) {
        actions.push({
            variant:
                "outline-primary",
            icon: <FiEdit2 />,
            onClick: onEdit,
        });
    }

    if (canDelete) {
        actions.push({
            variant:
                "outline-danger",
            icon: <FiTrash2 />,
            onClick: onDelete,
        });
    }

    return (
        <ERPTable
            columns={columns}
            data={conceptos}
            loading={loading}
            actions={actions}
        />
    );
};

export default MotorConceptosTable;
