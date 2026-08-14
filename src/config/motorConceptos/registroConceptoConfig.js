export const REGISTRO_ESTADOS = [
  {
    value:
      "",
    label:
      "Todos",
  },
  {
    value:
      "BORRADOR",
    label:
      "Borrador",
  },
  {
    value:
      "PENDIENTE",
    label:
      "Pendiente",
  },
  {
    value:
      "VIGENTE",
    label:
      "Vigente",
  },
  {
    value:
      "VENCIDO",
    label:
      "Vencido",
  },
  {
    value:
      "ANULADO",
    label:
      "Anulado",
  },
];

export const REGISTRO_LIMITS = [
  10,
  20,
  50,
  100,
];

export const REGISTRO_SORT_OPTIONS = [
  {
    value:
      "ultimo_movimiento",
    label:
      "Último movimiento",
  },
  {
    value:
      "created_at",
    label:
      "Fecha de creación",
  },
  {
    value:
      "fecha_vencimiento",
    label:
      "Fecha de vencimiento",
  },
  {
    value:
      "estado",
    label:
      "Estado",
  },
  {
    value:
      "id",
    label:
      "Identificador",
  },
];

export const REGISTRO_DEFAULT_FILTERS = {
  page:
    1,

  limit:
    20,

  search:
    "",

  concepto_id:
    "",

  entidad_tipo_id:
    "",

  entidad_id:
    "",

  estado:
    "",

  sucursal_id:
    "",

  fecha_inicio:
    "",

  fecha_fin:
    "",

  activo:
    true,

  sort:
    "ultimo_movimiento",

  order:
    "DESC",
};