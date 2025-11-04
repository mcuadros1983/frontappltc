import { api } from './apiClient';

const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

export const asistenciasApi = {
  async list(params = {}) {
    // versión simple, por compat
    const q = new URLSearchParams(params).toString();
    const res = await api.get(`/asistencias?${q}`);
    return unwrap(res);
  },

  async listDetallado(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await api.get(`/asistencias/detallado?${q}`); 
    return unwrap(res);
  },
};
