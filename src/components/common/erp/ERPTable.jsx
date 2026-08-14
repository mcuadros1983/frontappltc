import React from "react";
import {
    Table,
    Spinner,
    Button
} from "react-bootstrap";

import ERPEmpty from "./ERPEmpty";

const ERPTable = ({
    columns = [],
    data = [],
    loading = false,
    actions = [],
    className = "",
    rowClassName = null,
}) => {

    if (loading) {

        return (

            <div className="text-center p-5">

                <Spinner />

            </div>

        );

    }

    if (!data.length) {

        return <ERPEmpty />;

    }

    return (

        <Table

            hover

            responsive

            className={className}

        >

            <thead>

                <tr>

                    {

                        columns.map((c) => (

                            <th key={c.key}>

                                {c.title}

                            </th>

                        ))

                    }

                    {

                        actions.length > 0 && (

                            <th
                                width={120}
                            >

                                Acciones

                            </th>

                        )

                    }

                </tr>

            </thead>

            <tbody>

                {

                    data.map((row, index) => (

                        <tr

                            key={
                                row.id ??
                                row.codigo ??
                                row.uuid ??
                                row.key ??
                                index
                            }

                            className={

                                rowClassName

                                    ? rowClassName(row)

                                    : ""

                            }

                        >

                            {

                                columns.map((c) => (

                                    <td key={c.key}>

                                        {

                                            c.render
                                                ? c.render(row, index)
                                                : row[c.key]

                                        }

                                    </td>

                                ))

                            }

                            {

                                actions.length > 0 && (

                                    <td>

                                        {

                                            actions.map((a, index) => (

                                                <Button

                                                    key={index}

                                                    variant={a.variant}

                                                    size="sm"

                                                    className="me-2"

                                                    onClick={() =>
                                                        a.onClick(row)
                                                    }

                                                >

                                                    {a.icon}

                                                </Button>

                                            ))

                                        }

                                    </td>

                                )

                            }

                        </tr>

                    ))

                }

            </tbody>

        </Table>

    );

};

export default ERPTable;