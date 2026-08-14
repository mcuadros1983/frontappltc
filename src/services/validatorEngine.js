const patterns = {
    EMAIL:
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    URL:
        /^https?:\/\/[^\s]+$/i,

    TELEFONO:
        /^[0-9+\-\s()]{7,20}$/,

    CURP:
        /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i,

    RFC:
        /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i,

    ENTERO:
        /^-?\d+$/,

    DECIMAL:
        /^-?\d+(\.\d+)?$/,
};

const isEmpty = (
    value
) =>
    value === undefined ||
    value === null ||
    value === "" ||
    (
        Array.isArray(value) &&
        value.length === 0
    );

const pushByLevel = (
    result,
    level,
    message
) => {
    if (!message) return;

    if (
        level === "WARNING"
    ) {
        result.warnings.push(
            message
        );

        return;
    }

    if (
        level === "INFO"
    ) {
        result.info.push(
            message
        );

        return;
    }

    result.errors.push(
        message
    );
};

export class ValidatorEngine {
    validateDynamic(
        validation,
        value,
        result
    ) {
        const type =
            String(
                validation.tipo ||
                validation.validacion ||
                ""
            ).toUpperCase();

        const expected =
            validation.valor;

        let valid = true;

        switch (type) {
            case "MIN":
                valid =
                    Number(value) >=
                    Number(expected);
                break;

            case "MAX":
                valid =
                    Number(value) <=
                    Number(expected);
                break;

            case "LONGITUD_MINIMA":
                valid =
                    String(value).length >=
                    Number(expected);
                break;

            case "LONGITUD_MAXIMA":
                valid =
                    String(value).length <=
                    Number(expected);
                break;

            case "REGEX":
                try {
                    valid =
                        new RegExp(
                            expected
                        ).test(
                            String(value)
                        );
                } catch (_) {
                    valid = false;
                }
                break;

            case "NO_VACIO":
                valid =
                    !isEmpty(value);
                break;

            default:
                return;
        }

        if (!valid) {
            pushByLevel(
                result,
                validation.nivel ||
                    "ERROR",
                validation.mensaje ||
                    "El valor no cumple la validación"
            );
        }
    }

    validateField(
        field,
        runtime
    ) {
        const result = {
            errors: [
                ...(runtime.errors || []),
            ],

            warnings: [
                ...(runtime.warnings || []),
            ],

            info: [
                ...(runtime.info || []),
            ],
        };

        const value =
            runtime.value;

        if (
            !runtime.visible
        ) {
            return result;
        }

        if (
            runtime.required &&
            isEmpty(value)
        ) {
            result.errors.push(
                field.mensaje_obligatorio ||
                "Este campo es obligatorio"
            );
        }

        if (
            isEmpty(value)
        ) {
            return result;
        }

        if (
            field.longitud_minima &&
            String(value).length <
                Number(
                    field.longitud_minima
                )
        ) {
            result.errors.push(
                `Debe contener al menos ${field.longitud_minima} caracteres`
            );
        }

        if (
            field.longitud_maxima &&
            String(value).length >
                Number(
                    field.longitud_maxima
                )
        ) {
            result.errors.push(
                `No debe superar ${field.longitud_maxima} caracteres`
            );
        }

        if (
            field.valor_minimo !==
                undefined &&
            field.valor_minimo !==
                null &&
            Number(value) <
                Number(
                    field.valor_minimo
                )
        ) {
            result.errors.push(
                `El valor mínimo es ${field.valor_minimo}`
            );
        }

        if (
            field.valor_maximo !==
                undefined &&
            field.valor_maximo !==
                null &&
            Number(value) >
                Number(
                    field.valor_maximo
                )
        ) {
            result.errors.push(
                `El valor máximo es ${field.valor_maximo}`
            );
        }

        const type =
            String(
                field.tipo ||
                ""
            ).toUpperCase();

        if (
            patterns[type] &&
            !patterns[type].test(
                String(value)
            )
        ) {
            result.errors.push(
                field.mensaje_validacion ||
                `El valor no tiene formato ${type}`
            );
        }

        if (
            field.regex
        ) {
            try {
                if (
                    !new RegExp(
                        field.regex
                    ).test(
                        String(value)
                    )
                ) {
                    result.errors.push(
                        field.mensaje_validacion ||
                        "El formato no es válido"
                    );
                }
            } catch (_) {
                result.warnings.push(
                    "La expresión de validación no es válida"
                );
            }
        }

        (
            runtime.dynamicValidations ||
            []
        ).forEach(
            (validation) =>
                this.validateDynamic(
                    validation,
                    value,
                    result
                )
        );

        return result;
    }

    validateAll(
        fields,
        runtime
    ) {
        const result = {
            runtime: {},
            valid: true,
            errors: {},
            warnings: {},
        };

        fields.forEach(
            (field) => {
                const fieldRuntime =
                    runtime[
                        field.id
                    ];

                if (!fieldRuntime) {
                    return;
                }

                const messages =
                    this.validateField(
                        field,
                        fieldRuntime
                    );

                result.runtime[
                    field.id
                ] = {
                    ...fieldRuntime,
                    ...messages,
                };

                if (
                    messages.errors
                        .length > 0
                ) {
                    result.valid =
                        false;

                    result.errors[
                        field.id
                    ] =
                        messages.errors;
                }

                if (
                    messages.warnings
                        .length > 0
                ) {
                    result.warnings[
                        field.id
                    ] =
                        messages.warnings;
                }
            }
        );

        return result;
    }
}

export default ValidatorEngine;
