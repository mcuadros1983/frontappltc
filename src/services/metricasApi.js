import { api } from './apiClient';

export async function fetchResumenMetricas({ desde, hasta, sucursal_id, turno_id } = {}) {
  const qs = new URLSearchParams();
  if (desde) qs.set('desde', desde);
  if (hasta) qs.set('hasta', hasta);
  if (sucursal_id) qs.set('sucursal_id', String(sucursal_id));
  if (turno_id) qs.set('turno_id', String(turno_id));
  const q = qs.toString() ? `?${qs.toString()}` : '';
  return api.get(`/metricas/resumen${q}`);
}
