const escapeCsv = (value) => {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return `"${String(value)
        .replace(/"/g, '""')}"`;

};

const formatDate = (value) => {

    if (!value) {
        return "";
    }

    return new Date(value)
        .toLocaleDateString("es-MX");

};

const obtenerVersion = (registro) => {

    if (!registro?.version_actual) {
        return "";
    }

    return `V${registro.version_actual.numero}`;

};

const obtenerActivo = (registro) =>
    registro?.activo
        ? "Sí"
        : "No";

export const exportarRegistroConceptoReporteExcel = (
    registros = []
) => {

    const encabezados = [

        "Concepto",
        "Tipo Entidad",
        "Estado",
        "Versión",
        "Fecha Vencimiento",
        "Días Restantes",
        "Último Movimiento",
        "Versiones",
        "Archivos",
        "Activo",

    ];

    const filas = registros.map(
        (registro) => [

            registro?.concepto?.nombre,

            registro?.entidad_tipo?.nombre,

            registro?.estado,

            obtenerVersion(registro),

            formatDate(
                registro?.fecha_vencimiento
            ),

            registro?.dias_restantes,

            formatDate(
                registro?.ultimo_movimiento
            ),

            registro?.total_versiones,

            registro?.total_archivos,

            obtenerActivo(registro),

        ]
    );

    const contenido = [
        encabezados,
        ...filas,
    ]
        .map((fila) =>
            fila
                .map(escapeCsv)
                .join(";")
        )
        .join("\r\n");

    const blob = new Blob(
        [
            "\uFEFF",
            contenido,
        ],
        {
            type: "text/csv;charset=utf-8;",
        }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `motor_concepto_registros_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

};

export default exportarRegistroConceptoReporteExcel;