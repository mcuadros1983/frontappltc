import { api } from "./apiClient";

const unwrap = (res) =>
  res && res.data !== undefined
    ? res.data
    : res;

export const stockFabricaApi = {

  async obtenerInventarios() {

    const res =
      await api.get(
        "/stock-fabrica/inventarios"
      );

    return unwrap(res);

  },

  async obtener(
    inventarioId,
    fechaDesde,
    fechaHasta
  ) {

    const res =
      await api.get(
        `/stock-fabrica?inventarioId=${inventarioId}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
      );

    console.log("res", res)

    return unwrap(res);

  },



  async obtenerDetalle(
    codigobarra,
    inventarioId,
    fechaDesde,
    fechaHasta
  ) {

    const res =
      await api.get(
        `/stock-fabrica/detalle/${codigobarra}?inventarioId=${inventarioId}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
      );

    return unwrap(res);

  }

};