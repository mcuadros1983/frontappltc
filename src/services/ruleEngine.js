import DependencyGraph
    from "./dependencyGraph";

import EventEngine
    from "./eventEngine";

import FormulaEngine
    from "./formulaEngine";

import RuleCache, {
    sharedRuleCache,
} from "./ruleCache";

import RuleCompiler
    from "./ruleCompiler";

import RuleExecutor
    from "./ruleExecutor";

import RuleProfiler
    from "./ruleProfiler";

import RuleTrace
    from "./ruleTrace";

import ValidatorEngine
    from "./validatorEngine";

import {
    cloneRuntimeState,
    createRuntimeState,
    extractValues,
    resetRuntimeMessages,
} from "./runtimeState";

const DEFAULT_MAX_PASSES = 20;

export class RuleEngine {
    constructor({
        fields = [],
        rules = [],
        values = {},
        options = {},
    }) {
        this.fields =
            fields;

        this.options = {
            maxPasses:
                options.maxPasses ||
                DEFAULT_MAX_PASSES,

            strictCycles:
                options.strictCycles !==
                false,

            profiling:
                Boolean(
                    options.profiling
                ),

            tracing:
                Boolean(
                    options.tracing
                ),

            useCache:
                options.useCache !==
                false,
        };

        this.compiler =
            new RuleCompiler();

        this.eventEngine =
            new EventEngine();

        this.profiler =
            new RuleProfiler({
                enabled:
                    this.options
                        .profiling,
            });

        this.trace =
            new RuleTrace({
                enabled:
                    this.options
                        .tracing,
            });

        this.formulaEngine =
            new FormulaEngine({
                memoization:
                    true,
            });

        this.validatorEngine =
            new ValidatorEngine();

        this.cache =
            this.options.useCache
                ? sharedRuleCache
                : new RuleCache();

        const cacheKey =
            this.cache.createKey(
                fields,
                rules
            );

        const cached =
            this.options.useCache
                ? this.cache.get(
                    cacheKey
                )
                : null;

        if (cached) {
            this.compiledRules =
                cached.compiledRules;

            this.graph =
                cached.graph;
        } else {
            this.compiledRules =
                this.compiler.compile(
                    rules
                );

            this.graph =
                new DependencyGraph();

            this.compiler
                .getDependencies(
                    this.compiledRules
                )
                .forEach(
                    ({
                        source,
                        target,
                    }) =>
                        this.graph
                            .addDependency(
                                source,
                                target
                            )
                );

            this.cache.set(
                cacheKey,
                {
                    compiledRules:
                        this.compiledRules,

                    graph:
                        this.graph,
                }
            );
        }

        this.cycles =
            this.graph
                .detectCycles();

        this.topological =
            this.graph
                .topologicalSort();

        this.blocked =
            this.options
                .strictCycles &&
            this.cycles.length > 0;

        this.executor =
            new RuleExecutor({
                formulaEngine:
                    this.formulaEngine,

                profiler:
                    this.profiler,

                trace:
                    this.trace,
            });

        this.runtime =
            createRuntimeState(
                fields,
                values
            );

        if (!this.blocked) {
            this.runEvent(
                "ON_LOAD"
            );
        }
    }

    assertExecutable() {
        if (
            this.blocked
        ) {
            const error =
                new Error(
                    "El Motor de Reglas está bloqueado por dependencias cíclicas."
                );

            error.code =
                "RULE_ENGINE_CYCLE";

            error.cycles =
                this.cycles;

            throw error;
        }
    }

    getValues() {
        return extractValues(
            this.runtime
        );
    }

    orderRules(
        rules
    ) {
        const order =
            new Map(
                this.topological
                    .order
                    .map(
                        (
                            fieldId,
                            index
                        ) => [
                            String(
                                fieldId
                            ),
                            index,
                        ]
                    )
            );

        return [
            ...rules,
        ].sort(
            (left, right) => {
                const leftTarget =
                    left.acciones
                        .find(
                            (action) =>
                                action
                                    .campo_id
                        )
                        ?.campo_id;

                const rightTarget =
                    right.acciones
                        .find(
                            (action) =>
                                action
                                    .campo_id
                        )
                        ?.campo_id;

                const leftOrder =
                    order.get(
                        String(
                            leftTarget
                        )
                    ) ??
                    Number.MAX_SAFE_INTEGER;

                const rightOrder =
                    order.get(
                        String(
                            rightTarget
                        )
                    ) ??
                    Number.MAX_SAFE_INTEGER;

                if (
                    leftOrder !==
                    rightOrder
                ) {
                    return (
                        leftOrder -
                        rightOrder
                    );
                }

                return (
                    left.prioridad -
                    right.prioridad
                );
            }
        );
    }

    executeRules(
        rules
    ) {
        this.assertExecutable();

        let pass = 0;
        let changed = false;

        const orderedRules =
            this.orderRules(
                rules
            );

        do {
            changed = false;
            pass += 1;

            for (
                const rule of orderedRules
            ) {
                const result =
                    this.executor
                        .executeRule(
                            rule,
                            this.runtime
                        );

                changed =
                    result.changed ||
                    changed;

                if (
                    result.matched &&
                    rule.detener
                ) {
                    break;
                }
            }
        } while (
            changed &&
            pass <
                this.options
                    .maxPasses
        );

        if (
            changed &&
            pass >=
                this.options
                    .maxPasses
        ) {
            const error =
                new Error(
                    "El Motor de Reglas alcanzó el límite máximo de iteraciones."
                );

            error.code =
                "RULE_ENGINE_MAX_PASSES";

            error.maxPasses =
                this.options
                    .maxPasses;

            throw error;
        }

        return {
            passes:
                pass,

            stabilized:
                !changed,
        };
    }

    runEvent(
        eventName,
        {
            changedFieldId =
                null,

            validate =
                false,
        } = {}
    ) {
        const execute =
            () => {
                this.assertExecutable();

                this.runtime =
                    resetRuntimeMessages(
                        cloneRuntimeState(
                            this.runtime
                        )
                    );

                let rules =
                    this.eventEngine
                        .filterRules(
                            this.compiledRules,
                            eventName,
                            changedFieldId
                        );

                if (
                    eventName ===
                        "ON_CHANGE" &&
                    changedFieldId !==
                        null
                ) {
                    const affected =
                        new Set([
                            String(
                                changedFieldId
                            ),

                            ...this.graph
                                .getDependents(
                                    changedFieldId
                                ),
                        ]);

                    rules =
                        rules.filter(
                            (rule) =>
                                rule.condiciones
                                    .some(
                                        (condition) =>
                                            affected.has(
                                                String(
                                                    condition
                                                        .campo_id
                                                )
                                            )
                                    ) ||
                                rule.acciones
                                    .some(
                                        (action) =>
                                            affected.has(
                                                String(
                                                    action
                                                        .campo_id
                                                )
                                            )
                                    )
                        );
                }

                this.trace.add({
                    type:
                        "EVENT",

                    event:
                        eventName,

                    changedFieldId,

                    ruleCount:
                        rules.length,
                });

                const execution =
                    this.executeRules(
                        rules
                    );

                let validation =
                    null;

                if (validate) {
                    validation =
                        this.validate();
                }

                return {
                    ...execution,
                    validation,
                    snapshot:
                        this.snapshot(),
                };
            };

        return this.profiler.measure(
            "EVENT",
            eventName,
            execute
        );
    }

    updateValue(
        fieldId,
        value
    ) {
        this.assertExecutable();

        if (
            !this.runtime[fieldId]
        ) {
            return {
                snapshot:
                    this.snapshot(),
            };
        }

        this.runtime = {
            ...this.runtime,

            [fieldId]: {
                ...this.runtime[
                    fieldId
                ],

                value,
                dirty: true,
                touched: true,
            },
        };

        return this.runEvent(
            "ON_CHANGE",
            {
                changedFieldId:
                    fieldId,

                validate:
                    true,
            }
        );
    }

    validate() {
        this.assertExecutable();

        const result =
            this.validatorEngine
                .validateAll(
                    this.fields,
                    this.runtime
                );

        this.runtime = {
            ...this.runtime,
            ...result.runtime,
        };

        return result;
    }

    prepareSave() {
        this.assertExecutable();

        const eventResult =
            this.runEvent(
                "ON_SAVE",
                {
                    validate:
                        true,
                }
            );

        return {
            valid:
                eventResult
                    .validation
                    ?.valid !== false,

            errors:
                eventResult
                    .validation
                    ?.errors ||
                {},

            warnings:
                eventResult
                    .validation
                    ?.warnings ||
                {},

            values:
                this.getValues(),

            runtime:
                cloneRuntimeState(
                    this.runtime
                ),
        };
    }

    syncValues(
        values = {},
        {
            preserveDirty =
                true,
        } = {}
    ) {
        this.assertExecutable();

        Object.entries(
            values
        ).forEach(
            ([fieldId, value]) => {
                if (
                    !this.runtime[
                        fieldId
                    ]
                ) {
                    return;
                }

                if (
                    preserveDirty &&
                    this.runtime[
                        fieldId
                    ].dirty
                ) {
                    return;
                }

                this.runtime[
                    fieldId
                ] = {
                    ...this.runtime[
                        fieldId
                    ],
                    value,
                };
            }
        );

        this.runEvent(
            "ON_LOAD"
        );

        return this.snapshot();
    }

    reset(
        values = {}
    ) {
        this.runtime =
            createRuntimeState(
                this.fields,
                values
            );

        this.formulaEngine
            .clearMemo();

        this.trace.clear();
        this.profiler.reset();

        if (!this.blocked) {
            this.runEvent(
                "ON_LOAD"
            );
        }

        return this.snapshot();
    }

    diagnostics() {
        return {
            blocked:
                this.blocked,

            cycles:
                [
                    ...this.cycles,
                ],

            graph:
                this.graph
                    .getStats(),

            cacheSize:
                this.cache
                    .size(),

            formulaMemoSize:
                this.formulaEngine
                    .getMemoSize(),

            profiler:
                this.profiler
                    .snapshot(),

            trace:
                this.trace
                    .getEntries(),
        };
    }

    snapshot() {
        return {
            runtime:
                cloneRuntimeState(
                    this.runtime
                ),

            values:
                this.getValues(),

            cycles:
                [
                    ...this.cycles,
                ],

            blocked:
                this.blocked,

            diagnostics:
                this.diagnostics(),
        };
    }
}

export default RuleEngine;
