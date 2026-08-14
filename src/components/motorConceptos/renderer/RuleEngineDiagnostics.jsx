import React, {
    useMemo,
    useState,
} from "react";

import {
    Accordion,
    Badge,
    Button,
    Table,
} from "react-bootstrap";

const MetricTable = ({
    title,
    rows = [],
}) => (
    <div className="mb-4">
        <h6>{title}</h6>

        <Table
            size="sm"
            responsive
            bordered
        >
            <thead>
                <tr>
                    <th>Clave</th>
                    <th>Ejecuciones</th>
                    <th>Total ms</th>
                    <th>Promedio ms</th>
                    <th>Máximo ms</th>
                </tr>
            </thead>

            <tbody>
                {
                    rows.length === 0
                        ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center text-muted"
                                >
                                    Sin métricas
                                </td>
                            </tr>
                        )
                        : rows.map(
                            (row) => (
                                <tr
                                    key={row.key}
                                >
                                    <td>
                                        {row.key}
                                    </td>

                                    <td>
                                        {row.count}
                                    </td>

                                    <td>
                                        {row.totalMs.toFixed(3)}
                                    </td>

                                    <td>
                                        {row.averageMs.toFixed(3)}
                                    </td>

                                    <td>
                                        {row.maxMs.toFixed(3)}
                                    </td>
                                </tr>
                            )
                        )
                }
            </tbody>
        </Table>
    </div>
);

const RuleEngineDiagnostics = ({
    diagnostics,
}) => {
    const [
        copied,
        setCopied,
    ] = useState(false);

    const json =
        useMemo(
            () =>
                JSON.stringify(
                    diagnostics ||
                    {},
                    null,
                    2
                ),
            [diagnostics]
        );

    if (!diagnostics) {
        return null;
    }

    const handleCopy =
        async () => {
            if (
                navigator.clipboard
            ) {
                await navigator
                    .clipboard
                    .writeText(json);

                setCopied(true);

                setTimeout(
                    () =>
                        setCopied(false),
                    1500
                );
            }
        };

    return (
        <Accordion className="mt-3">
            <Accordion.Item eventKey="diagnostics">
                <Accordion.Header>
                    Diagnóstico del Motor
                    {
                        diagnostics.blocked && (
                            <Badge
                                bg="danger"
                                className="ms-2"
                            >
                                Bloqueado
                            </Badge>
                        )
                    }
                </Accordion.Header>

                <Accordion.Body>
                    <div className="d-flex gap-3 flex-wrap mb-3">
                        <Badge bg="secondary">
                            Nodos: {
                                diagnostics.graph
                                    ?.nodes ||
                                0
                            }
                        </Badge>

                        <Badge bg="secondary">
                            Dependencias: {
                                diagnostics.graph
                                    ?.edges ||
                                0
                            }
                        </Badge>

                        <Badge bg="secondary">
                            Caché: {
                                diagnostics.cacheSize ||
                                0
                            }
                        </Badge>

                        <Badge bg="secondary">
                            Fórmulas memoizadas: {
                                diagnostics.formulaMemoSize ||
                                0
                            }
                        </Badge>
                    </div>

                    <MetricTable
                        title="Eventos"
                        rows={
                            diagnostics.profiler
                                ?.events
                        }
                    />

                    <MetricTable
                        title="Reglas"
                        rows={
                            diagnostics.profiler
                                ?.rules
                        }
                    />

                    <MetricTable
                        title="Acciones"
                        rows={
                            diagnostics.profiler
                                ?.actions
                        }
                    />

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">
                            Traza
                        </h6>

                        <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={
                                handleCopy
                            }
                        >
                            {
                                copied
                                    ? "Copiado"
                                    : "Copiar diagnóstico"
                            }
                        </Button>
                    </div>

                    <pre
                        className="bg-light p-3 border rounded"
                        style={{
                            maxHeight:
                                350,
                            overflow:
                                "auto",
                        }}
                    >
                        {json}
                    </pre>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export default RuleEngineDiagnostics;
