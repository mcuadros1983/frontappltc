import RuleEngine
    from "../../src/services/motorConceptos/ruleEngine";

const createDefinition = (
    size
) => {
    const fields = [];
    const rules = [];

    for (
        let index = 1;
        index <= size;
        index += 1
    ) {
        fields.push({
            id: index,
            tipo:
                "DECIMAL",
        });

        if (index < size) {
            rules.push({
                id: index,
                evento:
                    "ON_CHANGE",

                condicion: {
                    campo_id:
                        index,

                    operador:
                        "NO_VACIO",
                },

                acciones: [
                    {
                        tipo:
                            "FORMULA",

                        campo_id:
                            index + 1,

                        formula: {
                            operacion:
                                "SUMA",

                            operandos: [
                                {
                                    tipo:
                                        "CAMPO",

                                    campo_id:
                                        index,
                                },

                                {
                                    tipo:
                                        "CONSTANTE",

                                    valor:
                                        1,
                                },
                            ],
                        },
                    },
                ],
            });
        }
    }

    return {
        fields,
        rules,
    };
};

const run = (
    size
) => {
    const definition =
        createDefinition(
            size
        );

    const compileStarted =
        Date.now();

    const engine =
        new RuleEngine({
            ...definition,

            options: {
                maxPasses:
                    size + 10,

                profiling:
                    true,

                tracing:
                    false,
            },
        });

    const compileMs =
        Date.now() -
        compileStarted;

    const executeStarted =
        Date.now();

    engine.updateValue(
        1,
        10
    );

    const executeMs =
        Date.now() -
        executeStarted;

    return {
        size,
        compileMs,
        executeMs,
        diagnostics:
            engine.diagnostics(),
    };
};

[
    100,
    250,
    500,
    1000,
].forEach(
    (size) => {
        console.log(
            JSON.stringify(
                run(size),
                null,
                2
            )
        );
    }
);
