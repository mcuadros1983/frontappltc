export const createFieldRuntime = (
    field,
    value
) => ({
    id: field.id,
    value:
        value !== undefined
            ? value
            : field.valor_defecto ?? null,

    visible:
        field.visible !== false,

    enabled:
        field.habilitado !== false,

    required:
        Boolean(field.obligatorio),

    readOnly:
        Boolean(field.solo_lectura),

    calculated:
        Boolean(field.calculado),

    dirty: false,
    touched: false,
    loading: false,

    errors: [],
    warnings: [],
    info: [],

    dynamicValidations: [],
});

export const createRuntimeState = (
    fields = [],
    values = {}
) =>
    fields.reduce(
        (acc, field) => {
            acc[field.id] =
                createFieldRuntime(
                    field,
                    values[field.id]
                );

            return acc;
        },
        {}
    );

export const cloneRuntimeState = (
    runtime = {}
) =>
    Object.entries(runtime)
        .reduce(
            (acc, [key, state]) => {
                acc[key] = {
                    ...state,

                    errors: [
                        ...(state.errors || []),
                    ],

                    warnings: [
                        ...(state.warnings || []),
                    ],

                    info: [
                        ...(state.info || []),
                    ],

                    dynamicValidations: [
                        ...(
                            state.dynamicValidations ||
                            []
                        ),
                    ],
                };

                return acc;
            },
            {}
        );

export const extractValues = (
    runtime = {}
) =>
    Object.entries(runtime)
        .reduce(
            (acc, [key, state]) => {
                acc[key] =
                    state.value;

                return acc;
            },
            {}
        );

export const resetRuntimeMessages = (
    runtime = {}
) =>
    Object.entries(runtime)
        .reduce(
            (acc, [key, state]) => {
                acc[key] = {
                    ...state,
                    errors: [],
                    warnings: [],
                    info: [],
                    dynamicValidations: [],
                };

                return acc;
            },
            {}
        );
