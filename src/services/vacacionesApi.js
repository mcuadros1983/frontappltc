import { api } from "./apiClient";

// 📘 Obtener todas las asignaciones de vacaciones
export async function getAllVacaciones() {
  return api.get("/asignacionesvacaciones");
}

// 🗓️ Obtener vacaciones dentro de un rango (opcional sucursal_id)
export async function getVacacionesEnIntervalo(startDate, endDate, sucursalId = "") {
  if (sucursalId) {
    return api.get(`/asignacionesvacaciones/interval/${startDate}/${endDate}/${sucursalId}`);
  } else {
    return api.get(`/asignacionesvacaciones/interval/${startDate}/${endDate}`);
  }
}

// 👤 Obtener vacaciones por empleado
export async function getVacacionesPorEmpleado(empleadoId) {
  return api.get(`/asignacionesvacaciones/employee/${empleadoId}`);
}

// 📊 Obtener estado de vacaciones (asignadas, tomadas, restantes)
export async function getEstadoVacaciones(empleadoId, periodo) {
  return api.get(`/asignacionesvacaciones/status/${empleadoId}/${periodo}`); 
}

// ➕ Crear asignación
export async function crearVacacion(body) {
  return api.post("/asignacionesvacaciones", body);
}

// ✏️ Actualizar asignación
export async function actualizarVacacion(id, body) {
  return api.put(`/asignacionesvacaciones/${id}`, body);
}

// 🗑️ Eliminar asignación
export async function eliminarVacacion(id) {
  return api.del(`/asignacionesvacaciones/${id}`);
}
