import { api } from './apiClient';

export async function listarEmpleados() {
  return api.get('/empleados');
}

export async function crearEmpleado(payload) {
  return api.post('/empleados', payload);
}
