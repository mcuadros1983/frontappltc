import { api } from "./apiClient";

export const inspeccionPlantillaApi = {
  // ===============================
  // PLANTILLAS
  // ===============================

  listar: () =>
    api.get(
      "/inspecciones/plantillas"
    ),

  obtener: (id) =>
    api.get(
      `/inspecciones/plantillas/${id}`
    ),

  obtenerCompleta: (id) =>
    api.get(
      `/inspecciones/plantillas/${id}/completa`
    ),

  crear: (payload) =>
    api.post(
      "/inspecciones/plantillas",
      payload
    ),

  actualizar: (
    id,
    payload
  ) =>
    api.put(
      `/inspecciones/plantillas/${id}`,
      payload
    ),

  desactivar: (id) =>
    api.del(
      `/inspecciones/plantillas/${id}`
    ),

  // ===============================
  // CATEGORIAS
  // ===============================

  crearCategoria: (
    payload
  ) =>
    api.post(
      "/inspecciones/categorias",
      payload
    ),

  actualizarCategoria: (
    id,
    payload
  ) =>
    api.put(
      `/inspecciones/categorias/${id}`,
      payload
    ),

  desactivarCategoria: (
    id
  ) =>
    api.del(
      `/inspecciones/categorias/${id}`
    ),

  // ===============================
  // ITEMS
  // ===============================

  crearItem: (
    payload
  ) =>
    api.post(
      "/inspecciones/items",
      payload
    ),

  actualizarItem: (
    id,
    payload
  ) =>
    api.put(
      `/inspecciones/items/${id}`,
      payload
    ),

  desactivarItem: (
    id
  ) =>
    api.del(
      `/inspecciones/items/${id}`
    ),
};