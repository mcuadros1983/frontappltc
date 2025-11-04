const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const proyeccionApi = {
  async calcularProyeccion({ sucursalIds, fechaInicio, fechaFin }) {
    const res = await fetch(`${API_BASE}/proyeccion/calcular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sucursalIds, fechaInicio, fechaFin }),
    });
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(errTxt || "Error calculando proyección");
    }
    return res.json();
  },

  // CONFIG - factores
  async getFactores() {
    const res = await fetch(`${API_BASE}/proyeccion/config/factores`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error cargando factores");
    return res.json();
  },

  async createFactor(payload) {
    const res = await fetch(`${API_BASE}/proyeccion/config/factores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando factor");
    return res.json();
  },

  async updateFactor(id, payload) {
    const res = await fetch(`${API_BASE}/proyeccion/config/factores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error actualizando factor");
    return res.json();
  },

  async deleteFactor(id) {
    const res = await fetch(`${API_BASE}/proyeccion/config/factores/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error eliminando factor");
    return res.json();
  },

  // CONFIG - feriados
  async getFeriados() {
    const res = await fetch(`${API_BASE}/proyeccion/config/feriados`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error cargando feriados");
    return res.json();
  },

  async createFeriado(payload) {
    const res = await fetch(`${API_BASE}/proyeccion/config/feriados`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creando feriado");
    return res.json();
  },

  async updateFeriado(id, payload) {
    const res = await fetch(`${API_BASE}/proyeccion/config/feriados/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error actualizando feriado");
    return res.json();
  },

  async deleteFeriado(id) {
    const res = await fetch(`${API_BASE}/proyeccion/config/feriados/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error eliminando feriado");
    return res.json();
  },

  // HISTÓRICO GUARDADO
  async getHistorico({ sucursalId, fechaDesde, fechaHasta, lote_calculo_id }) {
    const url = new URL(`${API_BASE}/proyeccion/historico`);

    if (sucursalId) url.searchParams.set("sucursalId", sucursalId);
    if (fechaDesde) url.searchParams.set("fechaDesde", fechaDesde);
    if (fechaHasta) url.searchParams.set("fechaHasta", fechaHasta);
    if (lote_calculo_id) url.searchParams.set("lote_calculo_id", lote_calculo_id);

    const res = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(errTxt || "Error cargando histórico");
    }

    return res.json();
  },

  // en src/services/proyeccionApi.js
  async getResumen({ fechaDesde, fechaHasta }) {

    const url = new URL(`${API_BASE}/proyeccion/resumen`);
    if (fechaDesde) url.searchParams.set("fechaDesde", fechaDesde);
    if (fechaHasta) url.searchParams.set("fechaHasta", fechaHasta);

    const res = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(errTxt || "Error cargando resumen");
    }

    return res.json();
  },

};