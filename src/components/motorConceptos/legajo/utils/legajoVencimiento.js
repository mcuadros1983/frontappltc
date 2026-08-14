const DAY_IN_MILLISECONDS =
    24 * 60 * 60 * 1000;

const normalizeDateOnly = (
    value
) => {
    if (!value) {
        return null;
    }

    const rawValue =
        String(value)
            .slice(0, 10);

    const parts =
        rawValue.split("-");

    if (parts.length !== 3) {
        return null;
    }

    const [
        year,
        month,
        day,
    ] = parts.map(Number);

    if (
        !year ||
        !month ||
        !day
    ) {
        return null;
    }

    const date =
        new Date(
            year,
            month - 1,
            day
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
};

export const getTodayDate =
    () => {
        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        return today;
    };

export const getDaysUntilExpiration =
    (
        value,
        referenceDate =
            getTodayDate()
    ) => {
        const expirationDate =
            normalizeDateOnly(
                value
            );

        if (
            !expirationDate
        ) {
            return null;
        }

        return Math.ceil(
            (
                expirationDate.getTime() -
                referenceDate.getTime()
            ) /
            DAY_IN_MILLISECONDS
        );
    };

export const formatDate =
    value => {
        const date =
            normalizeDateOnly(
                value
            );

        if (!date) {
            return "-";
        }

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const year =
            date.getFullYear();

        return `${day}/${month}/${year}`;
    };

export const getExpirationStatus =
    (
        registro,
        warningDays = 30
    ) => {
        const estado =
            String(
                registro?.estado ||
                ""
            ).toUpperCase();

        const fechaVencimiento =
            registro
                ?.fecha_vencimiento;

        const days =
            getDaysUntilExpiration(
                fechaVencimiento
            );

        if (
            estado === "ANULADO"
        ) {
            return {
                key:
                    "ANULADO",

                label:
                    "Anulado",

                variant:
                    "dark",

                icon:
                    "bi-x-circle",

                days,

                priority:
                    5,
            };
        }

        if (
            estado === "BORRADOR"
        ) {
            return {
                key:
                    "BORRADOR",

                label:
                    "Borrador",

                variant:
                    "secondary",

                icon:
                    "bi-pencil-square",

                days,

                priority:
                    3,
            };
        }

        if (
            estado === "PENDIENTE"
        ) {
            return {
                key:
                    "PENDIENTE",

                label:
                    "Pendiente",

                variant:
                    "warning",

                icon:
                    "bi-clock-history",

                days,

                priority:
                    2,
            };
        }

        if (
            estado === "VENCIDO" ||
            (
                days !== null &&
                days < 0
            )
        ) {
            return {
                key:
                    "VENCIDO",

                label:
                    "Vencido",

                variant:
                    "danger",

                icon:
                    "bi-exclamation-octagon",

                days,

                priority:
                    0,
            };
        }

        if (
            days !== null &&
            days <= warningDays
        ) {
            return {
                key:
                    "PROXIMO_VENCER",

                label:
                    "Próximo a vencer",

                variant:
                    "warning",

                icon:
                    "bi-exclamation-triangle",

                days,

                priority:
                    1,
            };
        }

        if (
            estado === "VIGENTE" ||
            days !== null
        ) {
            return {
                key:
                    "VIGENTE",

                label:
                    "Vigente",

                variant:
                    "success",

                icon:
                    "bi-check-circle",

                days,

                priority:
                    4,
            };
        }

        return {
            key:
                estado ||
                "SIN_ESTADO",

            label:
                estado ||
                "Sin estado",

            variant:
                "secondary",

            icon:
                "bi-dash-circle",

            days,

            priority:
                6,
        };
    };

export const getExpirationText =
    (
        registro,
        warningDays = 30
    ) => {
        const status =
            getExpirationStatus(
                registro,
                warningDays
            );

        if (
            status.days === null
        ) {
            return "Sin vencimiento";
        }

        if (
            status.days === 0
        ) {
            return "Vence hoy";
        }

        if (
            status.days === 1
        ) {
            return "Vence mañana";
        }

        if (
            status.days > 1
        ) {
            return `Vence en ${status.days} días`;
        }

        const elapsedDays =
            Math.abs(
                status.days
            );

        if (
            elapsedDays === 1
        ) {
            return "Vencido hace 1 día";
        }

        return `Vencido hace ${elapsedDays} días`;
    };

export const compareLegajoRecords =
    (
        first,
        second
    ) => {
        const firstStatus =
            getExpirationStatus(
                first
            );

        const secondStatus =
            getExpirationStatus(
                second
            );

        if (
            firstStatus.priority !==
            secondStatus.priority
        ) {
            return (
                firstStatus.priority -
                secondStatus.priority
            );
        }

        const firstDays =
            firstStatus.days;

        const secondDays =
            secondStatus.days;

        if (
            firstDays !== null &&
            secondDays !== null &&
            firstDays !==
            secondDays
        ) {
            return (
                firstDays -
                secondDays
            );
        }

        if (
            firstDays !== null &&
            secondDays === null
        ) {
            return -1;
        }

        if (
            firstDays === null &&
            secondDays !== null
        ) {
            return 1;
        }

        const firstConcept =
            String(
                first?.concepto?.nombre ||
                first?.concepto_nombre ||
                ""
            );

        const secondConcept =
            String(
                second?.concepto?.nombre ||
                second?.concepto_nombre ||
                ""
            );

        return firstConcept.localeCompare(
            secondConcept,
            "es",
            {
                sensitivity:
                    "base",
            }
        );
    };

export const sortLegajoRecords =
    registros =>
        [
            ...(
                Array.isArray(
                    registros
                )
                    ? registros
                    : []
            ),
        ].sort(
            compareLegajoRecords
        );