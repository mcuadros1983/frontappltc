const toNumber = (
    value
) => {
    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};

const operationHandlers = {
    SUMA: (args) =>
        args.reduce(
            (total, value) =>
                total +
                toNumber(value),
            0
        ),

    RESTA: (args) => {
        if (
            args.length === 0
        ) {
            return 0;
        }

        return args
            .slice(1)
            .reduce(
                (total, value) =>
                    total -
                    toNumber(value),
                toNumber(args[0])
            );
    },

    MULTIPLICACION: (args) =>
        args.reduce(
            (total, value) =>
                total *
                toNumber(value),
            1
        ),

    DIVISION: (args) => {
        if (
            args.length < 2
        ) {
            return toNumber(
                args[0]
            );
        }

        return args
            .slice(1)
            .reduce(
                (total, value) => {
                    const divisor =
                        toNumber(value);

                    return divisor === 0
                        ? total
                        : total /
                            divisor;
                },
                toNumber(args[0])
            );
    },

    PORCENTAJE: (args) =>
        toNumber(args[0]) *
        (
            toNumber(args[1]) /
            100
        ),

    REDONDEAR: (args) => {
        const decimals =
            Math.max(
                0,
                Number(
                    args[1] ||
                    0
                )
            );

        const factor =
            10 ** decimals;

        return (
            Math.round(
                toNumber(args[0]) *
                factor
            ) /
            factor
        );
    },

    ABSOLUTO: (args) =>
        Math.abs(
            toNumber(args[0])
        ),
};

const createMemoKey = (
    formula,
    values
) =>
    JSON.stringify({
        formula,
        values,
    });

export class FormulaEngine {
    constructor({
        memoization = true,
        maxEntries = 500,
    } = {}) {
        this.memoization =
            memoization;

        this.maxEntries =
            maxEntries;

        this.memo =
            new Map();
    }

    resolveOperand(
        operand,
        values
    ) {
        if (
            operand &&
            typeof operand ===
                "object" &&
            operand.tipo ===
                "CAMPO"
        ) {
            return values[
                operand.campo_id
            ];
        }

        if (
            operand &&
            typeof operand ===
                "object" &&
            operand.tipo ===
                "CONSTANTE"
        ) {
            return operand.valor;
        }

        return operand;
    }

    evaluate(
        formula,
        values = {}
    ) {
        if (!formula) {
            return null;
        }

        const operation =
            formula.operacion ||
            formula.tipo;

        const handler =
            operationHandlers[
                operation
            ];

        if (!handler) {
            return null;
        }

        const operands =
            formula.operandos ||
            formula.argumentos ||
            [];

        const resolved =
            operands.map(
                (operand) =>
                    this.resolveOperand(
                        operand,
                        values
                    )
            );

        const key =
            createMemoKey(
                formula,
                resolved
            );

        if (
            this.memoization &&
            this.memo.has(key)
        ) {
            return this.memo.get(
                key
            );
        }

        const result =
            handler(resolved);

        if (this.memoization) {
            this.memo.set(
                key,
                result
            );

            while (
                this.memo.size >
                this.maxEntries
            ) {
                const oldestKey =
                    this.memo
                        .keys()
                        .next()
                        .value;

                this.memo.delete(
                    oldestKey
                );
            }
        }

        return result;
    }

    clearMemo() {
        this.memo.clear();
    }

    getMemoSize() {
        return this.memo.size;
    }
}

export default FormulaEngine;
