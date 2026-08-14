export class DependencyGraph {
    constructor() {
        this.edges =
            new Map();

        this.reverseEdges =
            new Map();
    }

    addNode(nodeId) {
        const key =
            String(nodeId);

        if (!this.edges.has(key)) {
            this.edges.set(
                key,
                new Set()
            );
        }

        if (
            !this.reverseEdges.has(
                key
            )
        ) {
            this.reverseEdges.set(
                key,
                new Set()
            );
        }
    }

    addDependency(
        sourceId,
        targetId
    ) {
        const source =
            String(sourceId);

        const target =
            String(targetId);

        this.addNode(source);
        this.addNode(target);

        this.edges
            .get(source)
            .add(target);

        this.reverseEdges
            .get(target)
            .add(source);
    }

    getDependents(nodeId) {
        const start =
            String(nodeId);

        const visited =
            new Set();

        const queue = [
            start,
        ];

        while (
            queue.length > 0
        ) {
            const current =
                queue.shift();

            const neighbors =
                this.edges.get(
                    current
                ) ||
                new Set();

            neighbors.forEach(
                (neighbor) => {
                    if (
                        !visited.has(
                            neighbor
                        )
                    ) {
                        visited.add(
                            neighbor
                        );

                        queue.push(
                            neighbor
                        );
                    }
                }
            );
        }

        visited.delete(start);

        return [
            ...visited,
        ];
    }

    getDependencies(nodeId) {
        return [
            ...(
                this.reverseEdges.get(
                    String(nodeId)
                ) ||
                new Set()
            ),
        ];
    }

    detectCycles() {
        const visiting =
            new Set();

        const visited =
            new Set();

        const cycles = [];

        const visit = (
            node,
            path
        ) => {
            if (
                visiting.has(node)
            ) {
                const index =
                    path.indexOf(node);

                cycles.push(
                    path
                        .slice(index)
                        .concat(node)
                );

                return;
            }

            if (
                visited.has(node)
            ) {
                return;
            }

            visiting.add(node);

            const nextPath = [
                ...path,
                node,
            ];

            (
                this.edges.get(node) ||
                new Set()
            ).forEach(
                (neighbor) =>
                    visit(
                        neighbor,
                        nextPath
                    )
            );

            visiting.delete(node);
            visited.add(node);
        };

        this.edges.forEach(
            (_, node) =>
                visit(
                    node,
                    []
                )
        );

        return cycles;
    }

    topologicalSort() {
        const indegree =
            new Map();

        this.edges.forEach(
            (_, node) => {
                indegree.set(
                    node,
                    0
                );
            }
        );

        this.edges.forEach(
            (targets) => {
                targets.forEach(
                    (target) => {
                        indegree.set(
                            target,
                            (
                                indegree.get(
                                    target
                                ) ||
                                0
                            ) +
                            1
                        );
                    }
                );
            }
        );

        const queue = [
            ...indegree.entries(),
        ]
            .filter(
                ([, degree]) =>
                    degree === 0
            )
            .map(
                ([node]) =>
                    node
            );

        const sorted = [];

        while (
            queue.length > 0
        ) {
            const current =
                queue.shift();

            sorted.push(
                current
            );

            (
                this.edges.get(current) ||
                new Set()
            ).forEach(
                (target) => {
                    const next =
                        indegree.get(
                            target
                        ) -
                        1;

                    indegree.set(
                        target,
                        next
                    );

                    if (next === 0) {
                        queue.push(
                            target
                        );
                    }
                }
            );
        }

        return {
            order:
                sorted,

            complete:
                sorted.length ===
                indegree.size,

            unresolved:
                [
                    ...indegree.entries(),
                ]
                    .filter(
                        ([node]) =>
                            !sorted.includes(
                                node
                            )
                    )
                    .map(
                        ([node]) =>
                            node
                    ),
        };
    }

    getStats() {
        let edgeCount = 0;

        this.edges.forEach(
            (targets) => {
                edgeCount +=
                    targets.size;
            }
        );

        return {
            nodes:
                this.edges.size,

            edges:
                edgeCount,

            cycles:
                this.detectCycles(),

            topological:
                this.topologicalSort(),
        };
    }
}

export default DependencyGraph;
