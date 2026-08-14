const SUPPORTED_EVENTS = new Set([
    "ON_LOAD",
    "ON_CHANGE",
    "ON_SAVE",
]);

export class EventEngine {
    normalize(
        eventName
    ) {
        const normalized =
            String(
                eventName ||
                ""
            ).toUpperCase();

        if (
            !SUPPORTED_EVENTS.has(
                normalized
            )
        ) {
            throw new Error(
                `Evento no soportado: ${eventName}`
            );
        }

        return normalized;
    }

    filterRules(
        rules,
        eventName,
        changedFieldId = null
    ) {
        const event =
            this.normalize(
                eventName
            );

        return rules.filter(
            (rule) => {
                if (
                    rule.evento !==
                    event
                ) {
                    return false;
                }

                if (
                    event !==
                    "ON_CHANGE" ||
                    changedFieldId ===
                        null ||
                    changedFieldId ===
                        undefined
                ) {
                    return true;
                }

                return rule.condiciones
                    .some(
                        (condition) =>
                            String(
                                condition.campo_id
                            ) ===
                            String(
                                changedFieldId
                            )
                    );
            }
        );
    }
}

export default EventEngine;
