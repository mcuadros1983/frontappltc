import React, {
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Col,
    Form,
    Row,
    Table,
} from "react-bootstrap";

import {
    ERPButton,
    ERPModal,
    ERPTable,
} from "../../common/erp";

const normalizarItems = (
    items = []
) =>
    items.map(
        (item, index) => ({
            valor:
                item.valor ||
                "",
            etiqueta:
                item.etiqueta ||
                "",
            color:
                item.color ||
                "",
            orden:
                item.orden ??
                index,
            activo:
                item.activo !== false,
        })
    );

const ListasTab = ({
    campos = [],
    saving,
    canConfig,
    onUpdate,
}) => {

    const listas =
        useMemo(
            () =>
                campos.filter(
                    (campo) =>
                        campo.tipo ===
                        "LISTA"
                ),
            [campos]
        );

    const [
        selected,
        setSelected,
    ] = useState(null);

    const [
        items,
        setItems,
    ] = useState([]);

    const [
        permiteMultiple,
        setPermiteMultiple,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const open = (campo) => {
        setSelected(campo);
        setItems(
            normalizarItems(
                campo?.lista?.items
            )
        );
        setPermiteMultiple(
            Boolean(
                campo?.lista
                    ?.permite_multiple
            )
        );
        setError("");
    };

    const updateItem = (
        index,
        field,
        value
    ) => {
        setItems(
            (current) =>
                current.map(
                    (item, itemIndex) =>
                        itemIndex === index
                            ? {
                                ...item,
                                [field]:
                                    value,
                            }
                            : item
                )
        );
    };

    const save =
        async () => {
            const invalid =
                items.some(
                    (item) =>
                        !item.valor.trim() ||
                        !item.etiqueta.trim()
                );

            if (invalid) {
                setError(
                    "Todos los ítems deben tener valor y etiqueta"
                );
                return;
            }

            await onUpdate(
                selected.id,
                {
                    permite_multiple:
                        permiteMultiple,
                    items:
                        items.map(
                            (
                                item,
                                index
                            ) => ({
                                ...item,
                                valor:
                                    item.valor.trim(),
                                etiqueta:
                                    item.etiqueta.trim(),
                                color:
                                    item.color ||
                                    null,
                                orden:
                                    Number(
                                        item.orden ??
                                        index
                                    ),
                            })
                        ),
                }
            );

            setSelected(null);
        };

    const columns = [
        {
            key: "codigo",
            title: "Campo",
        },
        {
            key: "etiqueta",
            title: "Etiqueta",
        },
        {
            key: "permite_multiple",
            title: "Selección múltiple",
            render: (row) =>
                row?.lista
                    ?.permite_multiple
                    ? "Sí"
                    : "No",
        },
        {
            key: "items",
            title: "Ítems",
            render: (row) =>
                row?.lista?.items
                    ?.length ||
                0,
        },
    ];

    const actions =
        canConfig
            ? [
                {
                    variant:
                        "outline-primary",
                    icon:
                        "Editar",
                    onClick: open,
                },
            ]
            : [];

    return (
        <>
            <Alert variant="info">
                Las listas pertenecen a campos de tipo LISTA. Para crear una nueva lista, cree primero un campo con ese tipo.
            </Alert>

            <ERPTable
                columns={columns}
                data={listas}
                actions={actions}
            />

            <ERPModal
                show={Boolean(selected)}
                onHide={() =>
                    !saving &&
                    setSelected(null)
                }
                title={
                    selected
                        ? `Ítems de ${selected.etiqueta}`
                        : "Ítems"
                }
                size="xl"
                footer={
                    <>
                        <ERPButton
                            type="cancel"
                            disabled={saving}
                            onClick={() =>
                                setSelected(null)
                            }
                        />

                        <ERPButton
                            type="save"
                            disabled={saving}
                            onClick={save}
                        />
                    </>
                }
            >
                {
                    error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )
                }

                <Form.Check
                    type="switch"
                    className="mb-3"
                    label="Permite selección múltiple"
                    checked={
                        permiteMultiple
                    }
                    onChange={(event) =>
                        setPermiteMultiple(
                            event.target.checked
                        )
                    }
                />

                <ERPButton
                    type="new"
                    label="Agregar ítem"
                    className="mb-3"
                    onClick={() =>
                        setItems(
                            (current) => [
                                ...current,
                                {
                                    valor: "",
                                    etiqueta: "",
                                    color: "",
                                    orden:
                                        current.length,
                                    activo: true,
                                },
                            ]
                        )
                    }
                />

                <Table responsive>
                    <thead>
                        <tr>
                            <th>Valor</th>
                            <th>Etiqueta</th>
                            <th>Color</th>
                            <th>Orden</th>
                            <th>Activo</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {
                            items.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <tr
                                        key={
                                            index
                                        }
                                    >
                                        <td>
                                            <Form.Control
                                                value={
                                                    item.valor
                                                }
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "valor",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                value={
                                                    item.etiqueta
                                                }
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "etiqueta",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                value={
                                                    item.color
                                                }
                                                placeholder="#000000"
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "color",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                value={
                                                    item.orden
                                                }
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "orden",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <Form.Check
                                                type="switch"
                                                checked={
                                                    item.activo
                                                }
                                                onChange={(event) =>
                                                    updateItem(
                                                        index,
                                                        "activo",
                                                        event.target.checked
                                                    )
                                                }
                                            />
                                        </td>
                                        <td>
                                            <ERPButton
                                                type="delete"
                                                size="sm"
                                                onClick={() =>
                                                    setItems(
                                                        (current) =>
                                                            current.filter(
                                                                (
                                                                    _,
                                                                    itemIndex
                                                                ) =>
                                                                    itemIndex !==
                                                                    index
                                                            )
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                )
                            )
                        }
                    </tbody>
                </Table>
            </ERPModal>
        </>
    );
};

export default ListasTab;
