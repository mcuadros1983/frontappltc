import { api } from "./apiClient";

const unwrap = (res) =>
  res && res.data !== undefined ? res.data : res;

export const produccionLoteApi = {

  async list() {
    const res = await api.get(
      "/produccion-lotes"
    );

    return unwrap(res);
  },

  async getById(id) {
    const res = await api.get(
      `/produccion-lotes/${id}`
    );

    return unwrap(res);
  },

  async create(data) {
    const res = await api.post(
      "/produccion-lotes",
      data
    );

    return unwrap(res);
  },

  async update(id, data) {
    const res = await api.put(
      `/produccion-lotes/${id}`,
      data
    );

    return unwrap(res);
  },

  async remove(id) {
    const res = await api.del(
      `/produccion-lotes/${id}`
    );

    return unwrap(res);
  },

  async obtenerArticulos() {
    const res = await api.get(
      "/produccion-lotes/articulos"
    );

    return unwrap(res);
  },

};