const DEFAULT_MAX_ENTRIES = 100;

const stableSerialize = (value) => {
    if (
        value === null ||
        typeof value !== "object"
    ) {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value
            .map(stableSerialize)
            .join(",")}]`;
    }

    const keys =
        Object.keys(value)
            .sort();

    return `{${keys
        .map(
            (key) =>
                `${JSON.stringify(key)}:${stableSerialize(value[key])}`
        )
        .join(",")}}`;
};

const createHash = (value) => {
    const serialized =
        stableSerialize(value);

    let hash = 0;

    for (
        let index = 0;
        index < serialized.length;
        index += 1
    ) {
        hash =
            (
                (
                    hash << 5
                ) -
                hash
            ) +
            serialized.charCodeAt(index);

        hash |= 0;
    }

    return String(hash);
};

export class RuleCache {
    constructor({
        maxEntries =
            DEFAULT_MAX_ENTRIES,
    } = {}) {
        this.maxEntries =
            maxEntries;

        this.entries =
            new Map();
    }

    createKey(
        fields = [],
        rules = []
    ) {
        return createHash({
            fields,
            rules,
        });
    }

    get(key) {
        if (
            !this.entries.has(key)
        ) {
            return null;
        }

        const value =
            this.entries.get(key);

        this.entries.delete(key);
        this.entries.set(
            key,
            value
        );

        return value;
    }

    set(
        key,
        value
    ) {
        if (
            this.entries.has(key)
        ) {
            this.entries.delete(key);
        }

        this.entries.set(
            key,
            value
        );

        while (
            this.entries.size >
            this.maxEntries
        ) {
            const oldestKey =
                this.entries
                    .keys()
                    .next()
                    .value;

            this.entries.delete(
                oldestKey
            );
        }
    }

    clear() {
        this.entries.clear();
    }

    size() {
        return this.entries.size;
    }
}

export const sharedRuleCache =
    new RuleCache();

export default RuleCache;
