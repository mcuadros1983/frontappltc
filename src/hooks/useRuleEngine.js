import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import RuleEngine
    from "../services/ruleEngine";

const serialize = (
    value
) =>
    JSON.stringify(
        value || {}
    );

export const useRuleEngine = ({
    fields = [],
    rules = [],
    values = {},
    options = {},
    onChange,
}) => {
    const onChangeRef =
        useRef(onChange);

    useEffect(() => {
        onChangeRef.current =
            onChange;
    }, [onChange]);

    const serializedFields = useMemo(
        () => JSON.stringify(fields),
        [fields]
    );

    const serializedRules = useMemo(
        () => JSON.stringify(rules),
        [rules]
    );


    const engine =
        useMemo(
            () =>
                new RuleEngine({
                    fields,
                    rules,
                    values,
                    options,
                }),
            [
                serializedFields,
                serializedRules,
                options.maxPasses,
                options.strictCycles,
                options.profiling,
                options.tracing,
                options.useCache,
            ]
        );

    const engineRef =
        useRef(engine);

    const [
        snapshot,
        setSnapshot,
    ] = useState(
        engine.snapshot()
    );

    const [
        error,
        setError,
    ] = useState(null);

    const externalValuesRef =
        useRef(
            serialize(values)
        );

    useEffect(() => {
        engineRef.current =
            engine;

        setSnapshot(
            engine.snapshot()
        );

        setError(null);

        externalValuesRef.current =
            serialize(values);
    }, [engine]);

    const executeSafe =
        useCallback(
            (
                callback,
                fallback = null
            ) => {
                try {
                    setError(null);

                    return callback();
                } catch (
                executionError
                ) {
                    setError(
                        executionError
                    );

                    setSnapshot(
                        engineRef.current
                            .snapshot()
                    );

                    return fallback;
                }
            },
            []
        );

    useEffect(() => {
        const serialized =
            serialize(values);

        if (
            serialized ===
            externalValuesRef.current
        ) {
            return;
        }

        externalValuesRef.current =
            serialized;

        executeSafe(() => {
            const next =
                engineRef.current
                    .syncValues(
                        values
                    );

            console.log(
                "syncValues",
                {
                    values,
                    runtime: next.runtime,
                }
            );

            setSnapshot(next);
        });
    }, [
        values,
        executeSafe,
    ]);
    const publish =
        useCallback(

            (
                next,
                notify = true
            ) => {

                setSnapshot(next);

                if (
                    notify &&
                    onChangeRef.current
                ) {

                    onChangeRef.current(
                        next.values,
                        next.runtime
                    );

                }

                return next;

            },
            []
        );

    // const publish =
    //     useCallback(
    //         (
    //             next,
    //             notify = true
    //         ) => {

    //             setSnapshot(next);

    //             if (
    //                 notify &&
    //                 onChangeRef.current
    //             ) {

    //                 const current =
    //                     serialize(snapshot.values);

    //                 const incoming =
    //                     serialize(next.values);

    //                 if (
    //                     current !== incoming
    //                 ) {
    //                     onChangeRef.current(
    //                         next.values,
    //                         next.runtime
    //                     );
    //                 }

    //             }

    //             return next;

    //         },
    //         [
    //             snapshot.values,
    //         ]
    //     );

    const updateValue =
        useCallback(
            (
                fieldId,
                value
            ) =>
                executeSafe(
                    () =>
                        publish(
                            engineRef.current
                                .updateValue(
                                    fieldId,
                                    value
                                )
                                .snapshot
                        ),
                    snapshot
                ),
            [
                executeSafe,
                publish,
                snapshot,
            ]
        );

    const validate =
        useCallback(
            () =>
                executeSafe(
                    () => {
                        const result =
                            engineRef.current
                                .validate();

                        publish(
                            engineRef.current
                                .snapshot(),
                            false
                        );

                        return result;
                    },
                    {
                        valid: false,
                        errors: {},
                    }
                ),
            [
                executeSafe,
                publish,
            ]
        );

    const runEvent =
        useCallback(
            (
                eventName,
                eventOptions = {}
            ) =>
                executeSafe(
                    () => {
                        const result =
                            engineRef.current
                                .runEvent(
                                    eventName,
                                    eventOptions
                                );

                        publish(
                            result.snapshot
                        );

                        return result;
                    }
                ),
            [
                executeSafe,
                publish,
            ]
        );

    const prepareSave =
        useCallback(
            () =>
                executeSafe(
                    () => {
                        const result =
                            engineRef.current
                                .prepareSave();

                        publish({
                            runtime:
                                result.runtime,

                            values:
                                result.values,

                            cycles:
                                engineRef.current
                                    .cycles,

                            blocked:
                                engineRef.current
                                    .blocked,

                            diagnostics:
                                engineRef.current
                                    .diagnostics(),
                        });

                        return result;
                    },
                    {
                        valid: false,
                        errors: {},
                        warnings: {},
                        values:
                            snapshot.values,
                        runtime:
                            snapshot.runtime,
                    }
                ),
            [
                executeSafe,
                publish,
                snapshot,
            ]
        );

    const reset =
        useCallback(
            (
                nextValues = {}
            ) =>
                executeSafe(
                    () => {
                        const next =
                            engineRef.current
                                .reset(
                                    nextValues
                                );

                        publish(next);

                        return next;
                    }
                ),
            [
                executeSafe,
                publish,
            ]
        );

    const diagnostics =
        useCallback(
            () =>
                engineRef.current
                    .diagnostics(),
            []
        );

    return {
        runtime:
            snapshot.runtime,

        values:
            snapshot.values,

        cycles:
            snapshot.cycles,

        blocked:
            snapshot.blocked,

        diagnosticsData:
            snapshot.diagnostics,

        error,

        updateValue,
        validate,
        runEvent,
        prepareSave,
        reset,
        diagnostics,

        engine:
            engineRef.current,
    };
};

export default useRuleEngine;
