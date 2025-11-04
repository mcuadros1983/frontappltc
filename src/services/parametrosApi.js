import { api } from './apiClient';

export const parametrosApi = {
  get: () => api.get('/parametros'),
  update: (payload) => api.put('/parametros', payload),
};
