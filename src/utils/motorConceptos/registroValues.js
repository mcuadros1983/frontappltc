export const getValueFromRow = (row) => {
    if (!row) return null;

    const typedKeys = [
        "valor_texto",
        "valor_entero",
        "valor_decimal",
        "valor_fecha",
        "valor_datetime",
        "valor_boolean",
        "valor_json",
    ];

    const key = typedKeys.find(
        (item) =>
            row[item] !== undefined &&
            row[item] !== null
    );

    return key
        ? row[key]
        : null;
};

export const normalizeValues = (
    values = []
) => {
    if (
        values &&
        !Array.isArray(values) &&
        typeof values === "object"
    ) {
        return values;
    }

    return values.reduce(
        (acc, row) => {
            acc[row.campo_id] =
                getValueFromRow(row);
            return acc;
        },
        {}
    );
};

// export const serializeValues = (
//     fields = [],
//     values = {}
// ) =>
//     fields.map(
//         (field) => ({
//             campo_id: field.id,
//             valor:
//                 values[field.id] ??
//                 null,
//         })
//     );

export const serializeValues = (
    fields = [],
    values = {}
) => {

    return fields.reduce(
        (acc, field) => {

            const hasValue =
                Object.prototype
                    .hasOwnProperty.call(
                        values,
                        field.id
                    );

            acc[field.codigo] =
                hasValue
                    ? values[field.id]
                    : field.valor_defecto ??
                    null;

            return acc;

        },
        {}
    );

};
export const isEmptyValue = (
    value
) =>
    value === null ||
    value === undefined ||
    value === "" ||
    (
        Array.isArray(value) &&
        value.length === 0
    );
