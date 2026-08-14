import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
} from "react";

import {
    Alert,
    Col,
    Row,
} from "react-bootstrap";

import FieldRenderer
    from "./FieldRenderer";

import RuleEngineDiagnostics
    from "./RuleEngineDiagnostics";

import useRuleEngine
    from "../../../hooks/useRuleEngine";

const FormRenderer = forwardRef(
    (
        {
            fields = [],
            rules = [],
            values = {},
            disabled = false,
            onChange,
            onValidationChange,
            onEngineReady,
            engineOptions = {},
            showDiagnostics = false,
        },
        ref
    ) => {
        const engine =
            useRuleEngine({
                fields,
                rules,
                values,

                options:
                    engineOptions,

                onChange:
                    (
                        nextValues
                    ) => {

                        if (!onChange) {
                            return;
                        }

                        Object.entries(
                            nextValues
                        ).forEach(
                            ([
                                fieldId,
                                value,
                            ]) => {

                                if (
                                    values[
                                    fieldId
                                    ] === value
                                ) {
                                    return;
                                }

                                onChange(
                                    Number(fieldId),
                                    value
                                );

                            }
                        );

                    },
            });

        useImperativeHandle(
            ref,
            () => ({
                validate:
                    engine.validate,

                runEvent:
                    engine.runEvent,

                prepareSave:
                    engine.prepareSave,

                reset:
                    engine.reset,

                diagnostics:
                    engine.diagnostics,

                getValues:
                    () =>
                        engine.values,

                getRuntime:
                    () =>
                        engine.runtime,
            }),
            [engine]
        );

        useEffect(() => {
            if (
                onEngineReady
            ) {
                onEngineReady({
                    validate:
                        engine.validate,

                    runEvent:
                        engine.runEvent,

                    prepareSave:
                        engine.prepareSave,

                    reset:
                        engine.reset,

                    diagnostics:
                        engine.diagnostics,
                });
            }
        }, [
            engine.validate,
            engine.runEvent,
            engine.prepareSave,
            engine.reset,
            engine.diagnostics,
            onEngineReady,
        ]);

        // useEffect(() => {
        //     if (
        //         engine.blocked
        //     ) {
        //         if (
        //             onValidationChange
        //         ) {
        //             onValidationChange({
        //                 motor:
        //                     [
        //                         "El motor está bloqueado por dependencias cíclicas.",
        //                     ],
        //             });
        //         }

        //         return;
        //     }

        //     const result =
        //         engine.validate();

        //     if (
        //         onValidationChange
        //     ) {
        //         onValidationChange(
        //             result.errors
        //         );
        //     }
        // }, [
        //     engine.values,
        //     engine.blocked,
        //     onValidationChange,
        // ]);



        return (
            <>
                {
                    engine.error && (
                        <Alert variant="danger">
                            {
                                engine.error
                                    .message
                            }
                        </Alert>
                    )
                }

                {
                    engine.cycles
                        .length > 0 && (
                        <Alert variant="danger">
                            <strong>
                                Configuración inválida.
                            </strong>

                            {" "}

                            Se detectaron dependencias cíclicas y el formulario fue bloqueado.

                            <pre className="mt-2 mb-0">
                                {
                                    JSON.stringify(
                                        engine.cycles,
                                        null,
                                        2
                                    )
                                }
                            </pre>
                        </Alert>
                    )
                }

                <Row className="g-3">
                    {
                        fields
                            .filter(
                                (field) =>
                                    field.activo !== false
                            )
                            .sort(
                                (a, b) =>
                                    Number(
                                        a.orden ||
                                        0
                                    ) -
                                    Number(
                                        b.orden ||
                                        0
                                    )
                            )
                            .map(
                                (field) => {



                                    const runtime =
                                        engine.runtime[
                                        field.id
                                        ];

                                    if (!runtime) {
                                        return null;
                                    }

                                    return (
                                        <Col
                                            key={
                                                field.id
                                            }

                                            xs={
                                                field.columnas_xs ??
                                                12
                                            }

                                            md={
                                                field.columnas_md ??
                                                6
                                            }

                                            lg={
                                                field.columnas_lg ??
                                                undefined
                                            }
                                        >
                                            <FieldRenderer
                                                field={
                                                    field
                                                }

                                                runtime={{
                                                    ...runtime,

                                                    enabled:
                                                        disabled ||
                                                            engine.blocked
                                                            ? false
                                                            : runtime
                                                                .enabled,

                                                    readOnly:
                                                        disabled ||
                                                            engine.blocked
                                                            ? true
                                                            : runtime
                                                                .readOnly,
                                                }}

                                                onChange={
                                                    engine
                                                        .updateValue
                                                }
                                            />
                                        </Col>
                                    );
                                }
                            )
                    }
                </Row>

                {
                    showDiagnostics && (
                        <RuleEngineDiagnostics
                            diagnostics={
                                engine
                                    .diagnosticsData
                            }
                        />
                    )
                }
            </>
        );
    }
);

FormRenderer.displayName =
    "FormRenderer";

export default FormRenderer;
