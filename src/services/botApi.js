import { api } from "./apiClient";

function cleanParams(params = {}) {
  const cleaned = {};

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(typeof value === "number" && Number.isNaN(value))
    ) {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

function buildQueryString(params = {}) {
  const cleaned = cleanParams(params);
  const searchParams = new URLSearchParams();

  Object.entries(cleaned).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

// ==========================
// CONFIGURACIÓN DEL BOT
// ==========================

export async function getBotSettings() {
  return api.get("/bot/settings");
}

export async function updateBotSettings(payload) {
  return api.put("/bot/settings", payload);
}

// ==========================
// METADATA DE PRODUCTOS
// ==========================

export async function getBotProductMeta(filters = {}) {
  const query = buildQueryString(filters);
  return api.get(`/bot/product-meta${query}`);
}

export async function getBotProductMetaById(id) {
  if (!id) {
    throw new Error("El id de metadata es obligatorio");
  }

  return api.get(`/bot/product-meta/${id}`);
}

export async function createBotProductMeta(payload) {
  return api.post("/bot/product-meta", payload);
}

export async function updateBotProductMeta(id, payload) {
  if (!id) {
    throw new Error("El id de metadata es obligatorio");
  }

  return api.put(`/bot/product-meta/${id}`, payload);
}

export async function deleteBotProductMeta(id) {
  if (!id) {
    throw new Error("El id de metadata es obligatorio");
  }

  return api.del(`/bot/product-meta/${id}`);
}

// ==========================
// CONVERSACIONES
// ==========================

export async function getBotConversations(filters = {}) {
  const query = buildQueryString(filters);
  return api.get(`/bot/conversations${query}`);
}

export async function getBotConversationById(id) {
  if (!id) {
    throw new Error("El id de conversación es obligatorio");
  }

  return api.get(`/bot/conversations/${id}`);
}

// ==========================
// DERIVACIONES A HUMANO
// ==========================

export async function getBotHandoffs(filters = {}) {
  const query = buildQueryString(filters);
  return api.get(`/bot/handoffs${query}`);
}

export async function takeBotHandoff(id) {
  if (!id) {
    throw new Error("El id de derivación es obligatorio");
  }

  return api.put(`/bot/handoffs/${id}/take`, {});
}

export async function closeBotHandoff(id) {
  if (!id) {
    throw new Error("El id de derivación es obligatorio");
  }

  return api.put(`/bot/handoffs/${id}/close`, {});
}

// ==========================
// METADATA DE SUCURSALES
// ==========================

export async function getBotBranchMeta(filters = {}) {
  const query = buildQueryString(filters);
  return api.get(`/bot/branch-meta${query}`);
}

export async function getBotBranchMetaById(id) {
  return api.get(`/bot/branch-meta/${id}`);
}

export async function createBotBranchMeta(payload) {
  return api.post("/bot/branch-meta", payload);
}

export async function updateBotBranchMeta(id, payload) {
  return api.put(`/bot/branch-meta/${id}`, payload);
}

export async function deleteBotBranchMeta(id) {
  return api.del(`/bot/branch-meta/${id}`);
}

// ==========================
// BENEFICIOS DEL BOT
// ==========================

export async function getBotBenefitMeta(filters = {}) {
  const query = buildQueryString(filters);
  return api.get(`/bot/benefit-meta${query}`);
}

export async function getBotBenefitMetaById(id) {
  return api.get(`/bot/benefit-meta/${id}`);
}

export async function createBotBenefitMeta(payload) {
  return api.post("/bot/benefit-meta", payload);
}

export async function updateBotBenefitMeta(id, payload) {
  return api.put(`/bot/benefit-meta/${id}`, payload);
}

export async function deleteBotBenefitMeta(id) {
  return api.del(`/bot/benefit-meta/${id}`);
}

// ==========================
// EVENTOS DEL BOT
// ==========================

export async function getBotEventMeta(filters = {}) {
  const query = buildQueryString(filters);
  return api.get(`/bot/event-meta${query}`);
}

export async function getBotEventMetaById(id) {
  return api.get(`/bot/event-meta/${id}`); 
}

export async function createBotEventMeta(payload) {
  return api.post("/bot/event-meta", payload);
}

export async function updateBotEventMeta(id, payload) {
  return api.put(`/bot/event-meta/${id}`, payload);
}

export async function deleteBotEventMeta(id) {
  return api.del(`/bot/event-meta/${id}`);
}

const botApi = {
  getBotSettings,
  updateBotSettings,
  getBotProductMeta,
  getBotProductMetaById,
  createBotProductMeta,
  updateBotProductMeta,
  deleteBotProductMeta,
  getBotConversations,
  getBotConversationById,
  getBotHandoffs,
  takeBotHandoff,
  closeBotHandoff,

  getBotBranchMeta,
  getBotBranchMetaById,
  createBotBranchMeta,
  updateBotBranchMeta,
  deleteBotBranchMeta,

  getBotBenefitMeta,
  getBotBenefitMetaById,
  createBotBenefitMeta,
  updateBotBenefitMeta,
  deleteBotBenefitMeta,

  getBotEventMeta,
  getBotEventMetaById,
  createBotEventMeta,
  updateBotEventMeta,
  deleteBotEventMeta,
};

export default botApi;