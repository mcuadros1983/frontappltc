import { api } from './apiClient';

export const dispositivosApi = {
  list: () => api.get('/dispositivos'),
  create: (payload) => api.post('/dispositivos', payload),
};
