import { api } from "./apiClient";

const unwrap = (res) => res?.data ?? res;

const gestionService = {
  getDashboard: async () => unwrap(await api.get("/gestion/dashboard")),
  getCalendar: async (params = {}) => unwrap(await api.get(`/gestion/calendario${toQuery(params)}`)),

  getKanban: async (params = {}) => unwrap(await api.get(`/gestion/tareas/kanban${toQuery(params)}`)),
  getTareas: async (params = {}) => unwrap(await api.get(`/gestion/tareas${toQuery(params)}`)),
  getTarea: async (id) => unwrap(await api.get(`/gestion/tareas/${id}`)),
  createTarea: async (payload) => unwrap(await api.post("/gestion/tareas", payload)),
  deleteTarea: async (id) =>
    unwrap(
      await api.del(
        `/gestion/tareas/${id}`
      )
    ),
  updateTarea: async (id, payload) => unwrap(await api.put(`/gestion/tareas/${id}`, payload)),

  deleteTarea: async (id) =>
    unwrap(
      await api.del(
        `/gestion/tareas/${id}`
      )
    ),

  changeEstado: async (id, payload) => unwrap(await api.post(`/gestion/tareas/${id}/estado`, payload)),
  addComentario: async (id, comentario) => unwrap(await api.post(`/gestion/tareas/${id}/comentarios`, { comentario })),
  addChecklist: async (id, payload) => unwrap(await api.post(`/gestion/tareas/${id}/checklist`, payload)),
  uploadArchivo: async (
    id,
    formData
  ) =>
    unwrap(
      await api.postFormData(
        `/gestion/tareas/${id}/archivos`,
        formData
      )
    ),
  completeChecklist: async (id, completado = true) => unwrap(await api.post(`/gestion/checklist/${id}/completar`, { completado })),

  getProyectos: async () => unwrap(await api.get("/gestion/proyectos")),
  getProyecto: async (id) => unwrap(await api.get(`/gestion/proyectos/${id}`)),
  createProyecto: async (payload) => unwrap(await api.post("/gestion/proyectos", payload)),
  deleteProyecto: async (id) =>
    unwrap(
      await api.del(
        `/gestion/proyectos/${id}`
      )
    ),
  updateProyecto: async (id, payload) => unwrap(await api.put(`/gestion/proyectos/${id}`, payload)),

  deleteProyecto: async (id) =>
    unwrap(
      await api.del(
        `/gestion/proyectos/${id}`
      )
    ),

  addMiembroProyecto: async (id, payload) =>
    unwrap(await api.post(`/gestion/proyectos/${id}/miembros`, payload)),

  removeMiembroProyecto: async (
    proyectoId,
    miembroId
  ) =>
    unwrap(
      await api.del(
        `/gestion/proyectos/${proyectoId}/miembros/${miembroId}`
      )
    ),

  addComentarioProyecto: async (id, comentario) =>
    unwrap(await api.post(`/gestion/proyectos/${id}/comentario`, { comentario })),

  closeProyecto: async (id) =>
    unwrap(await api.post(`/gestion/proyectos/${id}/cerrar`)),

  vincularDocumentoProyecto: async (id, documento_id) =>
    unwrap(await api.post(`/gestion/proyectos/${id}/documentos`, { documento_id })),

  updateChecklist: async (
    id,
    payload
  ) =>
    unwrap(
      await api.put(
        `/gestion/checklist/${id}`,
        payload
      )
    ),

  deleteChecklist: async (
    id
  ) =>
    unwrap(
      await api.del(
        `/gestion/checklist/${id}`
      )
    ),
};

function toQuery(params = {}) {
  const clean = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!clean.length) return "";
  return `?${new URLSearchParams(clean).toString()}`;
}

export default gestionService;
