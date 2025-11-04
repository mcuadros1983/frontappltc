// services/turnosApi.js
import { api } from './apiClient';

const unwrap = (res) => (res && res.data !== undefined ? res.data : res); // soporta axios o fetch envuelto

export const turnosApi = { 
  async list(params = {}) {
    // si usás axios, el segundo argumento puede ser { params }
    const res = await api.get('/turnos', { params });
    const data = unwrap(res);
    // si el backend devuelve { items, ... } tomo items; si devuelve un array directo, lo uso
    return Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
  },

  async create(payload) {
    console.log("creando...", process.env.REACT_APP_API_URL)
    const res = await api.post('/turnos', payload);
    console.log("res", res)
    return unwrap(res); // el backend responde el turno creado
  },

    async getById(id) {
    const res = await api.get(`/turnos/${id}`);
    return unwrap(res);
  },

  async update(id, payload) {
    const res = await api.put(`/turnos/${id}`, payload);
    return unwrap(res);
  },

  async remove(id) {
    const res = await api.del(`/turnos/${id}`);
    return unwrap(res);
  },
};
