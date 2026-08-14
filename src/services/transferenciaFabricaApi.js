import { api } from "./apiClient";

const unwrap = (res) =>
  res && res.data !== undefined ? res.data : res;

export const transferenciaFabricaApi = {
  async transferir(data) {
    const res = await api.post("/stock-fabrica/transferir", data);
    return unwrap(res);
  },
};