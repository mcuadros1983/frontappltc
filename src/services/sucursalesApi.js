import { api } from './apiClient';

export const sucursalesApi = {
  list: () => api.get('/sucursales'),
  create: (payload) => api.post('/sucursales', payload),
};
