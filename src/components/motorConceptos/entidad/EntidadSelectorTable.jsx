import React,
{
    useMemo,
} from "react";

import {
    ERPButton,
    ERPTable,
} from "../../common/erp";

const EntidadSelectorTable = ({

    data = [],

    columns = [],

    entidadTipo,

    loading = false,

    onSeleccionar,

}) => {

    const tableColumns =
        useMemo(
            () => [

                ...columns,

                {

                    title:
                        "Acciones",

                    key:
                        "acciones",

                    render:
                        (row) => (

                            <ERPButton

                                type="view"

                                label="Documentación"

                                disabled={
                                    loading ||
                                    !entidadTipo
                                }

                                onClick={() =>
                                    onSeleccionar?.(
                                        row,
                                        entidadTipo
                                    )
                                }

                            />

                        ),

                },

            ],
            [

                columns,

                entidadTipo,

                loading,

                onSeleccionar,

            ]
        );

    return (

        <ERPTable

            columns={
                tableColumns
            }

            data={
                data
            }

            loading={
                loading
            }

        />

    );

};

export default EntidadSelectorTable;