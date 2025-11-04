// services/jornadasApi.js
import { api } from './apiClient'; 

// mismo helper que usás en turnosApi
const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

export const jornadasApi = {
  /**
   * GET /jornadas
   * params opcionales: { page, limit, q }
   * Devuelve { items, page, limit, total }
   */
  async list(params = {}) {
    const res = await api.get('/jornadas', { params });
    return unwrap(res);
  },

  /**
   * GET /jornadas/:id
   * Devuelve la jornada con sus turnos asociados (include Turno + through attrs)
   */
  async getById(id) {
    const res = await api.get(`/jornadas/${id}`);
    return unwrap(res);
  },

  /**
   * POST /jornadas
   * body esperado:
   * {
   *   nombre: "Jornada X",
   *   turnos: [
   *     {
   *       turno_id: 5,         // opcional si el turno ya existe
   *       turno: {             // opcional si queremos crear turno nuevo
   *         nombre: "...",
   *         hora_entrada: "08:00",
   *         hora_salida: "17:00",
   *         tolerancia_min: 5
   *       },
   *       dia_semana: 1,
   *       vigente_desde: "2025-10-24T10:00:00Z",
   *       vigente_hasta: null,
   *       activo: true,
   *       orden: 1
   *     }
   *   ]
   * }
   * Respuesta: jornada creada con turnos incluidos.
   */
  async create(payload) {
    const res = await api.post('/jornadas', payload);
    return unwrap(res);
  },

  /**
   * PUT /jornadas/:id
   * body puede ser:
   * {
   *   nombre: "Nuevo nombre",
   *   turnos: [ ... ] // opcional; si lo mandás, REEMPLAZA todo el set
   * }
   * Respuesta: jornada actualizada con turnos incluidos.
   */
  async update(id, payload) {
    const res = await api.put(`/jornadas/${id}`, payload);
    return unwrap(res);
  },

  /**
   * DELETE /jornadas/:id
   * Respuesta: { ok: true }
   */
  async remove(id) {
    const res = await api.del(`/jornadas/${id}`);
    return unwrap(res);
  },

  /**
   * GET /jornadas/:id/turnos
   * Devuelve:
   * {
   *   items: [
   *     {
   *       id, jornada_id, turno_id,
   *       dia_semana, vigente_desde, vigente_hasta,
   *       activo, orden,
   *       turno: {
   *         id, nombre, hora_entrada, hora_salida, tolerancia_min, ...
   *       }
   *     },
   *     ...
   *   ]
   * }
   */
  async listTurnos(jornadaId) {
    const res = await api.get(`/jornadas/${jornadaId}/turnos`);
    return unwrap(res);
  },

  /**
   * POST /jornadas/:id/turnos
   * payload igual a UN ítem de "turnos":
   * {
   *   turno_id: 5,     // o "turno":{...} para crearlo nuevo
   *   turno: { ... },
   *   dia_semana,
   *   vigente_desde,
   *   vigente_hasta,
   *   activo,
   *   orden
   * }
   * Respuesta: la fila JornadaTurno creada (link pivote) con sus datos.
   */
  async addTurno(jornadaId, payload) {
    const res = await api.post(`/jornadas/${jornadaId}/turnos`, payload);
    return unwrap(res);
  },

  /**
   * DELETE /jornadas/:id/turnos/:turnoId
   * turnosId = ID del turno que querés desasociar de la jornada
   * Respuesta: { ok: true }
   */
  async removeTurno(jornadaId, turnoId) {
    const res = await api.del(`/jornadas/${jornadaId}/turnos/${turnoId}`);
    return unwrap(res);
  },
};
