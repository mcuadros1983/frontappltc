// src/services/rolesApi.js
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const rolesApi = {
  async getRoles() {
    const res = await fetch(`${API_BASE}/roles`, {
      method: "GET",
      credentials: "include", // para mandar cookie JWT si hace falta
    });

    if (!res.ok) {
      throw new Error("Error cargando roles");
    }

    const data = await res.json();
    // asumo que el controller devuelve array de roles tipo:
    // [ { id: 1, nombre: "Admin", ...}, ... ]
    return data;
  },
};
