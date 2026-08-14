import {
    isEmptyValue,
} from "./registroValues";

const toComparable = (value) => {
    if (
        value === null ||
        value === undefined
    ) {
        return value;
    }

    if (typeof value === "string") {
        return value.trim();
    }

    return value;
};

export const evaluateOperator = (
    operator,
    currentValue,
    expectedValue
) => {
    const current =
        toComparable(
            currentValue
        );

    const expected =
        toComparable(
            expectedValue
        );

    switch (operator) {
        case "IGUAL":
            return current === expected;

        case "DISTINTO":
            return current !== expected;

        case "MAYOR":
            return Number(current) >
                Number(expected);

        case "MAYOR_IGUAL":
            return Number(current) >=
                Number(expected);

        case "MENOR":
            return Number(current) <
                Number(expected);

        case "MENOR_IGUAL":
            return Number(current) <=
                Number(expected);

        case "CONTIENE":
            return Array.isArray(current)
                ? current.includes(expected)
                : String(current || "")
                    .includes(
                        String(expected || "")
                    );

        case "NO_CONTIENE":
            return !evaluateOperator(
                "CONTIENE",
                current,
                expected
            );

        case "EN":
            return Array.isArray(expected)
                ? expected.includes(current)
                : false;

        case "NO_EN":
            return !evaluateOperator(
                "EN",
                current,
                expected
            );

        case "VACIO":
            return isEmptyValue(current);

        case "NO_VACIO":
            return !isEmptyValue(current);

        default:
            return false;
    }
};

export const getFieldRuntimeState = (
    field,
    rules = [],
    values = {}
) => {
    const fieldRules =
        rules.filter(
            (rule) =>
                Number(
                    rule.campo_destino_id
                ) ===
                Number(
                    field.id
                ) &&
                rule.activo !== false
        );

    return fieldRules.reduce(
        (state, rule) => {
            const matches =
                evaluateOperator(
                    rule.operador,
                    values[
                        rule.campo_origen_id
                    ],
                    rule.valor_comparacion
                );

            if (
                rule.tipo_regla ===
                "VISIBLE_CUANDO"
            ) {
                state.visible =
                    matches;
            }

            if (
                rule.tipo_regla ===
                "OBLIGATORIO_CUANDO"
            ) {
                state.required =
                    matches;
            }

            if (
                rule.tipo_regla ===
                "SOLO_LECTURA_CUANDO"
            ) {
                state.readOnly =
                    matches;
            }

            return state;
        },
        {
            visible:
                field.visible !== false,
            required:
                Boolean(
                    field.obligatorio
                ),
            readOnly:
                Boolean(
                    field.solo_lectura
                ),
        }
    );
};
