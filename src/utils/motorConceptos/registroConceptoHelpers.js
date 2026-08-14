export const getConceptoNombre = (
  registro
) => {
  const concepto =
    registro?.concepto;

  return (
    concepto?.nombre ||
    concepto?.descripcion ||
    concepto?.codigo ||
    `Concepto #${registro?.concepto_id || "-"}`
  );
};

export const getEntidadTipoNombre = (
  registro
) => {
  const entidadTipo =
    registro?.entidadTipo ||
    registro?.entidad_tipo;

  return (
    entidadTipo?.nombre ||
    entidadTipo?.descripcion ||
    entidadTipo?.codigo ||
    `Tipo #${registro?.entidad_tipo_id || "-"}`
  );
};

export const getEntidadDescripcion = (
  registro
) => {
  if (
    registro?.entidad?.nombre
  ) {
    return registro.entidad.nombre;
  }

  if (
    registro?.entidad?.descripcion
  ) {
    return registro.entidad.descripcion;
  }

  return `Entidad #${registro?.entidad_id || "-"}`;
};

export const getVersionNumero = (
  registro
) => {
  const version =
    registro?.versionActual ||
    registro?.version_actual;

  if (
    !version?.numero
  ) {
    return "-";
  }

  return `v${version.numero}`;
};

export const formatDate = (
  value
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "es-MX"
  );
};

export const formatDateTime = (
  value
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "es-MX"
  );
};

export const getEstadoVariant = (
  estado
) => {
  switch (estado) {
    case "BORRADOR":
      return "secondary";

    case "PENDIENTE":
      return "warning";

    case "VIGENTE":
      return "success";

    case "VENCIDO":
      return "danger";

    case "ANULADO":
      return "dark";

    default:
      return "secondary";
  }
};