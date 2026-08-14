const normalizeCondition = (
    condition = {}
) => ({
    campo_id:
        condition.campo_id ||
        condition.origen_campo_id ||
        condition.field_id ||
        null,

    operador:
        condition.operador ||
        "IGUAL",

    valor:
        condition.valor ??
        condition.value ??
        null,

    valor_campo_id:
        condition.valor_campo_id ||
        condition.value_field_id ||
        null,
});

const normalizeConditions = (
    rule
) => {
    const raw =
        rule.condiciones ||
        rule.conditions ||
        (
            rule.condicion
                ? [rule.condicion]
                : [rule]
        );

    return raw.map(
        normalizeCondition
    );
};

const normalizeAction = (
    action = {},
    rule = {}
) => ({
    tipo:
        action.tipo ||
        action.accion ||
        rule.accion ||
        rule.tipo_accion ||
        rule.tipo,

    campo_id:
        action.campo_id ||
        action.campo_destino_id ||
        action.destino_campo_id ||
        rule.campo_destino_id ||
        rule.destino_campo_id ||
        rule.campo_id ||
        null,

    valor:
        action.valor ??
        action.valor_accion ??
        rule.valor_accion ??
        rule.valor ??
        null,

    formula:
        action.formula ||
        rule.formula ||
        null,

    campo_origen_id:
        action.campo_origen_id ||
        rule.campo_origen_id ||
        null,

    mensaje:
        action.mensaje ||
        rule.mensaje ||
        null,

    nivel:
        action.nivel ||
        rule.nivel ||
        "ERROR",

    validacion:
        action.validacion ||
        rule.validacion ||
        null,
});

const normalizeActions = (
    rule
) => {
    const raw =
        rule.acciones ||
        rule.actions ||
        [rule];

    return raw.map(
        (action) =>
            normalizeAction(
                action,
                rule
            )
    );
};

export class RuleCompiler {
    compile(
        rules = []
    ) {
        return rules
            .filter(
                (rule) =>
                    rule.activo !== false
            )
            .map(
                (rule) => ({
                    id: rule.id,

                    prioridad:
                        Number(
                            rule.prioridad ||
                            0
                        ),

                    evento:
                        String(
                            rule.evento ||
                            "ON_CHANGE"
                        ).toUpperCase(),

                    combinador:
                        String(
                            rule.combinador ||
                            rule.logical_operator ||
                            "AND"
                        ).toUpperCase(),

                    condiciones:
                        normalizeConditions(
                            rule
                        ),

                    acciones:
                        normalizeActions(
                            rule
                        ),

                    detener:
                        Boolean(
                            rule.detener_ejecucion ||
                            rule.stop_execution
                        ),
                })
            )
            .sort(
                (a, b) =>
                    a.prioridad -
                    b.prioridad
            );
    }

    getDependencies(
        compiledRules = []
    ) {
        const dependencies = [];

        compiledRules.forEach(
            (rule) => {
                const sourceIds =
                    rule.condiciones
                        .map(
                            (condition) =>
                                condition.campo_id
                        )
                        .filter(Boolean);

                rule.acciones
                    .map(
                        (action) =>
                            action.campo_id
                    )
                    .filter(Boolean)
                    .forEach(
                        (targetId) => {
                            sourceIds.forEach(
                                (sourceId) => {
                                    dependencies.push({
                                        source:
                                            sourceId,
                                        target:
                                            targetId,
                                    });
                                }
                            );
                        }
                    );
            }
        );

        return dependencies;
    }
}

export default RuleCompiler;
