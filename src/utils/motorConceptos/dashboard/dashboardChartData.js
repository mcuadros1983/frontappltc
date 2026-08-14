import {

    ESTADO_COLORS,

    ESTADO_LABELS,

} from "./dashboardColors";

export const buildPieData = (resumen = {}) => ([
    {
        name: ESTADO_LABELS.CUMPLIDO,
        value: resumen.cumplidos || 0,
        color: ESTADO_COLORS.CUMPLIDO,
    },
    {
        name: ESTADO_LABELS.PROXIMO_A_VENCER,
        value: resumen.proximos || 0,
        color: ESTADO_COLORS.PROXIMO_A_VENCER,
    },
    {
        name: ESTADO_LABELS.VENCIDO,
        value: resumen.vencidos || 0,
        color: ESTADO_COLORS.VENCIDO,
    },
    {
        name: ESTADO_LABELS.FALTANTE,
        value: resumen.faltantes || 0,
        color: ESTADO_COLORS.FALTANTE,
    },
]);

export const buildBarData = (resumen = {}) => ([
    {
        estado: "Cumplidos",
        cantidad: resumen.cumplidos || 0,
    },
    {
        estado: "Próximos",
        cantidad: resumen.proximos || 0,
    },
    {
        estado: "Vencidos",
        cantidad: resumen.vencidos || 0,
    },
    {
        estado: "Faltantes",
        cantidad: resumen.faltantes || 0,
    },
]);