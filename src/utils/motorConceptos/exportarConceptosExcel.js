const escapeCsv = (value) => {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const text = String(value)
        .replace(/"/g, '""');

    return `"${text}"`;
};

const obtenerEntidad = (concepto) => {
    if (concepto?.entidad) {
        return concepto.entidad;
    }

    if (concepto?.entidad_tipo?.nombre) {
        return concepto.entidad_tipo.nombre;
    }

    if (concepto?.entidadTipo?.nombre) {
        return concepto.entidadTipo.nombre;
    }

    if (
        Array.isArray(concepto?.entidades) &&
        concepto.entidades.length
    ) {
        return concepto.entidades
            .map((item) =>
                item?.nombre ||
                item?.codigo ||
                item?.entidad_tipo?.nombre ||
                item?.entidadTipo?.nombre
            )
            .filter(Boolean)
            .join(", ");
    }

    return "-";
};

const obtenerModoCaptura = (concepto) =>
    concepto?.modo_captura ??
    concepto?.modoCaptura ??
    "";

const obtenerActivo = (concepto) =>
    concepto?.activo === false
        ? "No"
        : "Sí";

export const exportarConceptosExcel = (
    conceptos = []
) => {
    const encabezados = [
        "Código",
        "Nombre",
        "Modo captura",
        "Entidad",
        "Activo",
    ];

    const filas = conceptos.map(
        (concepto) => [
            concepto?.codigo,
            concepto?.nombre,
            obtenerModoCaptura(concepto),
            obtenerEntidad(concepto),
            obtenerActivo(concepto),
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

    const url = URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download =
        `motor_conceptos_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

export default exportarConceptosExcel;
