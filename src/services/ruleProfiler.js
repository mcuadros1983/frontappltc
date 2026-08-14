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

const createMetric = () => ({
    count: 0,
    totalMs: 0,
    minMs: null,
    maxMs: 0,
});

const updateMetric = (
    metric,
    duration
) => {
    metric.count += 1;
    metric.totalMs += duration;
    metric.minMs =
        metric.minMs === null
            ? duration
            : Math.min(
                metric.minMs,
                duration
            );
    metric.maxMs =
        Math.max(
            metric.maxMs,
            duration
        );
};

export class RuleProfiler {
    constructor({
        enabled = false,
    } = {}) {
        this.enabled =
            enabled;

        this.events =
            new Map();

        this.rules =
            new Map();

        this.actions =
            new Map();
    }

    measure(
        type,
        key,
        callback
    ) {
        if (!this.enabled) {
            return callback();
        }

        const started =
            now();

        try {
            return callback();
        } finally {
            const duration =
                now() -
                started;

            const collection =
                type === "EVENT"
                    ? this.events
                    : type === "RULE"
                        ? this.rules
                        : this.actions;

            if (
                !collection.has(key)
            ) {
                collection.set(
                    key,
                    createMetric()
                );
            }

            updateMetric(
                collection.get(key),
                duration
            );
        }
    }

    snapshotCollection(
        collection
    ) {
        return [
            ...collection.entries(),
        ].map(
            ([key, metric]) => ({
                key,
                count:
                    metric.count,
                totalMs:
                    metric.totalMs,
                averageMs:
                    metric.count === 0
                        ? 0
                        : metric.totalMs /
                            metric.count,
                minMs:
                    metric.minMs ||
                    0,
                maxMs:
                    metric.maxMs,
            })
        );
    }

    snapshot() {
        return {
            events:
                this.snapshotCollection(
                    this.events
                ),

            rules:
                this.snapshotCollection(
                    this.rules
                ),

            actions:
                this.snapshotCollection(
                    this.actions
                ),
        };
    }

    reset() {
        this.events.clear();
        this.rules.clear();
        this.actions.clear();
    }
}

export default RuleProfiler;
