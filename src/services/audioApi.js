import { api } from './apiClient';

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

export async function getAudioDashboard(filters = {}) {
  const query = buildQueryString(filters);
  return api.get(`/api/audio/dashboard${query}`);
}

export async function getAudioSegments(filters = {}) {
  const query = buildQueryString(filters);
  return api.get(`/api/audio/segments${query}`);
}

export async function getAudioSegmentById(id) {
  if (!id) {
    throw new Error("El id del segmento es obligatorio");
  }

  return api.get(`/api/audio/segments/${id}`);
}

export async function requestAudioSync(payload) {
  if (!payload?.sucursalCodigo) {
    throw new Error("La sucursal es obligatoria");
  }

  if (!payload?.fecha) {
    throw new Error("La fecha es obligatoria");
  }

  return api.post("/api/audio/dashboard/request-sync", payload);
}

const audioApi = {
  getAudioDashboard,
  getAudioSegments,
  getAudioSegmentById,
  requestAudioSync,
};

export default audioApi;