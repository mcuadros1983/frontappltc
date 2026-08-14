import {
    useEffect,
    useRef,
    useState,
} from "react";

export const useRegistroAutosave = ({
    enabled,
    values,
    save,
    delay = 1500,
}) => {

    const [
        status,
        setStatus,
    ] = useState("IDLE");

    const firstRender =
        useRef(true);

    const lastSaved =
        useRef("");

    useEffect(() => {
        if (!enabled) return;

        const serialized =
            JSON.stringify(values);

        if (firstRender.current) {
            firstRender.current =
                false;
            lastSaved.current =
                serialized;
            return;
        }

        if (
            serialized ===
            lastSaved.current
        ) {
            return;
        }

        setStatus("PENDING");

        const timer =
            window.setTimeout(
                async () => {
                    try {
                        setStatus(
                            "SAVING"
                        );

                        await save({
                            silencioso:
                                true,
                        });

                        lastSaved.current =
                            serialized;

                        setStatus(
                            "SAVED"
                        );
                    } catch (_) {
                        setStatus(
                            "ERROR"
                        );
                    }
                },
                delay
            );

        return () =>
            window.clearTimeout(
                timer
            );
    }, [
        enabled,
        values,
        save,
        delay,
    ]);

    return status;
};

export default useRegistroAutosave;
