import React, {
    useMemo,
} from "react";

import {
    Table,
} from "react-bootstrap";

import {
    ERPButton,
    ERPModal,
} from "../../common/erp";

const stringify = (
    value
) => {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return typeof value ===
        "string"
        ? value
        : JSON.stringify(value);
};

const RegistroVersionCompareModal = ({
    show,
    comparison,
    onHide,
}) => {

    const rows =
        useMemo(
            () =>
                comparison?.diferencias ||
                comparison?.items ||
                [],
            [comparison]
        );

    return (
        <ERPModal
            show={show}
            onHide={onHide}
            title="Comparación de versiones"
            size="xl"
            footer={
                <ERPButton
                    type="cancel"
                    label="Cerrar"
                    onClick={onHide}
                />
            }
        >
            <Table
                responsive
                bordered
                hover
            >
                <thead>
                    <tr>
                        <th>Campo</th>
                        <th>Versión A</th>
                        <th>Versión B</th>
                        <th>Cambió</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        rows.map(
                            (
                                row,
                                index
                            ) => (
                                <tr
                                    key={
                                        row.campo_id ||
                                        index
                                    }
                                >
                                    <td>
                                        {
                                            row.etiqueta ||
                                            row.campo_nombre ||
                                            row.campo_id
                                        }
                                    </td>
                                    <td>
                                        {
                                            stringify(
                                                row.valor_a
                                            )
                                        }
                                    </td>
                                    <td>
                                        {
                                            stringify(
                                                row.valor_b
                                            )
                                        }
                                    </td>
                                    <td>
                                        {
                                            row.cambio
                                                ? "Sí"
                                                : "No"
                                        }
                                    </td>
                                </tr>
                            )
                        )
                    }
                </tbody>
            </Table>
        </ERPModal>
    );
};

export default RegistroVersionCompareModal;
