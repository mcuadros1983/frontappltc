// src/utils/navApi.js
const base = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

export async function getNavLinks({ roleId, userId, signal } = {}) {
  console.log("datos", roleId, userId, signal);
  // 🔎 logs
  console.log("[navApi.getNavLinks] params IN:", { roleId, userId, hasSignal: !!signal });

  const params = new URLSearchParams();
  if (roleId != null) params.set("roleId", String(roleId));
  if (userId != null) params.set("userId", String(userId));

  const url = `${base}/nav/links${params.toString() ? `?${params.toString()}` : ""}`;
  console.log("[navApi.getNavLinks] GET", url);

  const res = await fetch(url, {
    method: "GET",
    signal,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  console.log("[navApi.getNavLinks] status:", res.status);
  if (!res.ok) throw new Error(`getNavLinks failed: ${res.status}`);

  const data = await res.json();
  console.log("[navApi.getNavLinks] payload keys:", Object.keys(data));
  console.log("[navApi.getNavLinks] links len:", Array.isArray(data?.links) ? data.links.length : 0);

  return data;
}

export async function searchNav({ q = "", roleId, userId, signal } = {}) {
  console.log("[navApi.searchNav] params IN:", { q, roleId, userId, hasSignal: !!signal });

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (roleId != null) params.set("roleId", String(roleId));
  if (userId != null) params.set("userId", String(userId));

  const url = `${base}/nav/search?${params.toString()}`;
  console.log("[navApi.searchNav] GET", url);

  const res = await fetch(url, {
    method: "GET",
    signal,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  console.log("[navApi.searchNav] status:", res.status);
  if (!res.ok) throw new Error(`searchNav failed: ${res.status}`);

  const data = await res.json();
  console.log("[navApi.searchNav] payload keys:", Object.keys(data));
  console.log("[navApi.searchNav] results sizes:", {
    catalog: data?.results?.catalog?.length ?? 0,
    shortcuts: data?.results?.shortcuts?.length ?? 0,
  });

  return data;
}
