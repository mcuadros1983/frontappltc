const normalize = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === "string") {
        return value.trim();
    }

    return value;
};

const toComparable = (value) => {
    const normalized = normalize(value);

    if (normalized === null) {
        return null;
    }

    if (
        typeof normalized === "string" &&
        normalized !== "" &&
        !Number.isNaN(Number(normalized))
    ) {
        return Number(normalized);
    }

    return normalized;
};

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return [];
    }

    return [value];
};

const isEmpty = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    }

    if (
        typeof value === "object"
    ) {
        return Object.keys(value).length === 0;
    }

    return false;
};

export const operators = {
    IGUAL: (left, right) =>
        toComparable(left) ===
        toComparable(right),

    DISTINTO: (left, right) =>
        toComparable(left) !==
        toComparable(right),

    MAYOR: (left, right) =>
        Number(left) >
        Number(right),

    MAYOR_IGUAL: (left, right) =>
        Number(left) >=
        Number(right),

    MENOR: (left, right) =>
        Number(left) <
        Number(right),

    MENOR_IGUAL: (left, right) =>
        Number(left) <=
        Number(right),

    CONTIENE: (left, right) => {
        if (Array.isArray(left)) {
            return left.includes(right);
        }

        return String(left || "")
            .toLowerCase()
            .includes(
                String(right || "")
                    .toLowerCase()
            );
    },

    NO_CONTIENE: (left, right) =>
        !operators.CONTIENE(
            left,
            right
        ),

    EN: (left, right) =>
        toArray(right).includes(left),

    NO_EN: (left, right) =>
        !operators.EN(
            left,
            right
        ),

    ENTRE: (left, right) => {
        const values =
            toArray(right);

        if (values.length < 2) {
            return false;
        }

        const current =
            Number(left);

        return (
            current >=
                Number(values[0]) &&
            current <=
                Number(values[1])
        );
    },

    VACIO: (left) =>
        isEmpty(left),

    NO_VACIO: (left) =>
        !isEmpty(left),

    REGEX: (left, right) => {
        try {
            return new RegExp(
                right
            ).test(
                String(left || "")
            );
        } catch (_) {
            return false;
        }
    },
};

export const evaluateOperator = (
    operator,
    left,
    right
) => {
    const fn =
        operators[operator];

    if (!fn) {
        return false;
    }

    return fn(
        left,
        right
    );
};

export default operators;
