import { api } from "./apiClient";

const unwrap = (res) =>
  res && res.data !== undefined
    ? res.data
    : res;

export const transferenciaFabricaListApi = {

  async listar(
    filtros = {}
  ) {

    const params =
      new URLSearchParams(
        filtros
      ).toString();

    const res =
      await api.get(
        `/stock-fabrica/transferencias?${params}`
      );

    return unwrap(res);

  },

  async obtenerDetalle(
    fecha,
    sucursal
  ) {

    const res =
      await api.get(

        `/stock-fabrica/transferencias/detalle?fecha=${fecha}&sucursal=${sucursal}`

      );

    return unwrap(res);

  }

};