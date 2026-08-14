const now = () => {
    if (
        typeof performance !==
        "undefined" &&
        performance.now
    ) {
        return performance.now();
    }

    return Date.now();
};

export class RuleTrace {
    constructor({
        enabled = false,
        maxEntries = 1000,
    } = {}) {
        this.enabled =
            enabled;

        this.maxEntries =
            maxEntries;

        this.entries = [];
    }

    add(entry) {
        if (!this.enabled) {
            return;
        }

        this.entries.push({
            timestamp:
                new Date().toISOString(),

            time:
                now(),

            ...entry,
        });

        if (
            this.entries.length >
            this.maxEntries
        ) {
            this.entries.splice(
                0,
                this.entries.length -
                this.maxEntries
            );
        }
    }

    clear() {
        this.entries = [];
    }

    getEntries() {
        return [
            ...this.entries,
        ];
    }

    export() {
        return JSON.stringify(
            this.entries,
            null,
            2
        );
    }
}

export default RuleTrace;
