import {
    evaluateOperator,
} from "./operators";

const setBoolean = (
    runtime,
    fieldId,
    property,
    value
) => {
    if (!runtime[fieldId]) {
        return false;
    }

    if (
        runtime[fieldId][property] ===
        value
    ) {
        return false;
    }

    runtime[fieldId] = {
        ...runtime[fieldId],
        [property]: value,
    };

    return true;
};

const setValue = (
    runtime,
    fieldId,
    value,
    calculated = false
) => {
    if (!runtime[fieldId]) {
        return false;
    }

    if (
        Object.is(
            runtime[fieldId].value,
            value
        )
    ) {
        return false;
    }

    runtime[fieldId] = {
        ...runtime[fieldId],
        value,
        calculated:
            calculated ||
            runtime[fieldId]
                .calculated,
        dirty: true,
    };

    return true;
};

const appendMessage = (
    runtime,
    fieldId,
    level,
    message
) => {
    if (
        !runtime[fieldId] ||
        !message
    ) {
        return false;
    }

    const key =
        level === "WARNING"
            ? "warnings"
            : level === "INFO"
                ? "info"
                : "errors";

    if (
        runtime[fieldId][key]
            .includes(message)
    ) {
        return false;
    }

    runtime[fieldId] = {
        ...runtime[fieldId],
        [key]: [
            ...runtime[fieldId][key],
            message,
        ],
    };

    return true;
};

export class RuleExecutor {
    constructor({
        formulaEngine,
        profiler = null,
        trace = null,
    }) {
        this.formulaEngine =
            formulaEngine;

        this.profiler =
            profiler;

        this.trace =
            trace;
    }

    matchesCondition(
        condition,
        values
    ) {
        if (
            !condition?.campo_id
        ) {
            return true;
        }

        const left =
            values[
                condition.campo_id
            ];

        const right =
            condition.valor_campo_id
                ? values[
                    condition
                        .valor_campo_id
                ]
                : condition.valor;

        return evaluateOperator(
            condition.operador,
            left,
            right
        );
    }

    matchesRule(
        rule,
        values
    ) {
        const results =
            rule.condiciones.map(
                (condition) =>
                    this.matchesCondition(
                        condition,
                        values
                    )
            );

        if (
            rule.combinador ===
            "OR"
        ) {
            return results.some(
                Boolean
            );
        }

        return results.every(
            Boolean
        );
    }

    executeAction(
        action,
        runtime,
        values,
        rule
    ) {
        const execute =
            () => {
                const fieldId =
                    action.campo_id;

                switch (
                    action.tipo
                ) {
                    case "MOSTRAR":
                    case "VISIBLE_CUANDO":
                        return setBoolean(
                            runtime,
                            fieldId,
                            "visible",
                            true
                        );

                    case "OCULTAR":
                    case "OCULTAR_CUANDO":
                        return setBoolean(
                            runtime,
                            fieldId,
                            "visible",
                            false
                        );

                    case "OBLIGATORIO":
                    case "OBLIGATORIO_CUANDO":
                        return setBoolean(
                            runtime,
                            fieldId,
                            "required",
                            true
                        );

                    case "NO_OBLIGATORIO":
                    case "NO_OBLIGATORIO_CUANDO":
                        return setBoolean(
                            runtime,
                            fieldId,
                            "required",
                            false
                        );

                    case "SOLO_LECTURA":
                    case "SOLO_LECTURA_CUANDO":
                        return setBoolean(
                            runtime,
                            fieldId,
                            "readOnly",
                            true
                        );

                    case "EDITABLE":
                    case "EDITABLE_CUANDO":
                        return setBoolean(
                            runtime,
                            fieldId,
                            "readOnly",
                            false
                        );

                    case "HABILITAR":
                    case "HABILITAR_CUANDO":
                        return setBoolean(
                            runtime,
                            fieldId,
                            "enabled",
                            true
                        );

                    case "DESHABILITAR":
                    case "DESHABILITAR_CUANDO":
                        return setBoolean(
                            runtime,
                            fieldId,
                            "enabled",
                            false
                        );

                    case "ASIGNAR_VALOR":
                        return setValue(
                            runtime,
                            fieldId,
                            action.valor
                        );

                    case "LIMPIAR_VALOR":
                        return setValue(
                            runtime,
                            fieldId,
                            null
                        );

                    case "COPIAR_VALOR":
                        return setValue(
                            runtime,
                            fieldId,
                            values[
                                action
                                    .campo_origen_id
                            ]
                        );

                    case "FORMULA":
                        return setValue(
                            runtime,
                            fieldId,
                            this.formulaEngine
                                .evaluate(
                                    action.formula,
                                    values
                                ),
                            true
                        );

                    case "MENSAJE":
                        return appendMessage(
                            runtime,
                            fieldId,
                            action.nivel,
                            action.mensaje
                        );

                    case "VALIDAR":
                        if (
                            !runtime[fieldId] ||
                            !action.validacion
                        ) {
                            return false;
                        }

                        runtime[fieldId] = {
                            ...runtime[fieldId],
                            dynamicValidations: [
                                ...runtime[fieldId]
                                    .dynamicValidations,

                                {
                                    ...action.validacion,

                                    mensaje:
                                        action.mensaje ||
                                        action.validacion
                                            .mensaje,

                                    nivel:
                                        action.nivel ||
                                        action.validacion
                                            .nivel ||
                                        "ERROR",
                                },
                            ],
                        };

                        return true;

                    default:
                        return false;
                }
            };

        const key =
            `${rule.id || "SIN_ID"}:${action.tipo || "SIN_TIPO"}`;

        const changed =
            this.profiler
                ? this.profiler.measure(
                    "ACTION",
                    key,
                    execute
                )
                : execute();

        this.trace?.add({
            type:
                "ACTION",

            ruleId:
                rule.id,

            action:
                action.tipo,

            fieldId:
                action.campo_id,

            changed,
        });

        return changed;
    }

    executeRule(
        rule,
        runtime
    ) {
        const execute =
            () => {
                const values =
                    Object.entries(
                        runtime
                    ).reduce(
                        (
                            acc,
                            [key, state]
                        ) => {
                            acc[key] =
                                state.value;

                            return acc;
                        },
                        {}
                    );

                const matched =
                    this.matchesRule(
                        rule,
                        values
                    );

                this.trace?.add({
                    type:
                        "RULE",

                    ruleId:
                        rule.id,

                    event:
                        rule.evento,

                    matched,
                });

                if (!matched) {
                    return {
                        matched: false,
                        changed: false,
                    };
                }

                let changed = false;

                rule.acciones.forEach(
                    (action) => {
                        changed =
                            this.executeAction(
                                action,
                                runtime,
                                values,
                                rule
                            ) ||
                            changed;
                    }
                );

                return {
                    matched: true,
                    changed,
                };
            };

        return this.profiler
            ? this.profiler.measure(
                "RULE",
                String(
                    rule.id ||
                    "SIN_ID"
                ),
                execute
            )
            : execute();
    }
}

export default RuleExecutor;
