// src/services/categoriasApi.js

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";
// ajustá esto si ya estás usando otra constante global

export const categoriasApi = {
  /* ======================
   * CATEGORÍAS
   * ====================== */


  async getCategorias() {
    const res = await fetch(`${API_BASE}/documentos/categorias`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error cargando categorías");
    }
    return res.json();
  },

  // AHORA recibe un objeto: { nombre }
  async createCategoria(data) {
    const res = await fetch(`${API_BASE}/documentos/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data), // 👈 { nombre: "MANUALES" }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error creando categoría");
    }
    return res.json();
  },

  // AHORA recibe (id, data)
  async updateCategoria(id, data) {
    const res = await fetch(`${API_BASE}/documentos/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data), // 👈 { nombre: "MANUALES" }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error actualizando categoría");
    }
    return res.json();
  },

  async deleteCategoria(id) {
    const res = await fetch(`${API_BASE}/documentos/categorias/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error eliminando categoría");
    }
    return res.json();
  },


  /* ======================
   * SUBCATEGORÍAS
   * ====================== */

  // lista subcategorías (opcionalmente filtradas por categoría)
  async getSubcategorias(categoria_id) {
    const url = new URL(`${API_BASE}/documentos/subcategorias`);

    if (categoria_id) {
      url.searchParams.set("categoria_id", categoria_id);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error cargando subcategorías");
    }

    // esperado: array de objetos tipo
    // {
    //   id,
    //   nombre,
    //   categoria_id,
    //   roles_permitidos: [1,2,3],
    //   ...
    // }
    return res.json();
  },

  // crear subcategoría
  // payload esperado:
  // {
  //   nombre: "RRHH",
  //   categoria_id: 1,
  //   roles_permitidos: [1, 2, 5]
  // }
  async createSubcategoria(payload) {
    const res = await fetch(`${API_BASE}/documentos/subcategorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error creando subcategoría");
    }

    return res.json();
  },

  // actualizar subcategoría
  // mismo payload que createSubcategoria
  async updateSubcategoria(id, payload) {
    const res = await fetch(`${API_BASE}/documentos/subcategorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error actualizando subcategoría");
    }

    return res.json();
  },

  // eliminar subcategoría
  async deleteSubcategoria(id) {
    const res = await fetch(`${API_BASE}/documentos/subcategorias/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error eliminando subcategoría");
    }

    return res.json();
  },
};
