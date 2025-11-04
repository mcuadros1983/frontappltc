// // src/services/documentosApi.js
// import { api } from "./apiClient"; // mismo cliente que usás hoy

// const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

// export const documentosApi = { 
//   async list(params = {}) {
//     // params puede tener { page, limit, tipo, q, vigentesHoy }
//     const res = await api.get("/documentos", { params });
//     return unwrap(res); // { items, page, total, limit }
//   },

//   async getById(id) {
//     const res = await api.get(`/documentos/${id}`);
//     return unwrap(res); // doc con pasos[] y archivos[]
//   },

//   async create(payload) {
//     // payload: ver POST /documentos
//     const res = await api.post("/documentos", payload);
//     return unwrap(res);
//   },

//   async update(id, payload) {
//     const res = await api.put(`/documentos/${id}`, payload);
//     return unwrap(res);
//   },

//   async remove(id) {
//     const res = await api.delete(`/documentos/${id}`);
//     return unwrap(res);
//   },
// };

// src/services/documentosApi.js

const API_BASE = process.env.REACT_APP_API || "http://localhost:5000";

export const documentosApi = {
  async list(params = {}) {
    const qs = new URLSearchParams();

    if (params.page) qs.append("page", params.page);
    if (params.limit) qs.append("limit", params.limit);
    if (params.tipo) qs.append("tipo", params.tipo);
    if (params.q) qs.append("q", params.q);
    if (params.vigentesHoy) qs.append("vigentesHoy", "true");
    if (params.categoria_id) qs.append("categoria_id", params.categoria_id);
    if (params.subcategoria_id) qs.append("subcategoria_id", params.subcategoria_id);

    const res = await fetch(`${API_BASE}/documentos?` + qs.toString(), {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Error listando documentos");
    }
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE}/documentos/${id}`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Error obteniendo documento");
    }
    return res.json();
  },

  async create(docData) {
    const res = await fetch(`${API_BASE}/documentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(docData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error creando documento");
    }
    return res.json();
  },

  async update(id, docData) {
    const res = await fetch(`${API_BASE}/documentos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(docData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error actualizando documento");
    }
    return res.json();
  },

  async remove(id) {
    const res = await fetch(`${API_BASE}/documentos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error eliminando documento");
    }
    return res.json();
  },

  // Upload de archivo a Drive. Devuelve metadata lista para meter en DocumentoArchivo.
  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/documentos/upload-file`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error subiendo archivo");
    }
    return res.json();
  },

  // nuevo:
  async deleteUploadedFile(fileId) {
    console.log("Eliminando archivo en Drive desde API client:", fileId);
    const resp = await fetch(
      `${API_BASE}/documentos/upload-file/${encodeURIComponent(fileId)}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!resp.ok) {
      throw new Error("Error eliminando archivo en Drive");
    }

    return await resp.json(); // { ok: true }
  },


};
