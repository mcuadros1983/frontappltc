// src/utils/shortcutsApi.js
const base = process.env.REACT_APP_API_URL;

export async function getShortcuts(userId) {
  const r = await fetch(`${base}/usuarios/${userId}/shortcuts`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error("getShortcuts failed");
  return r.json();
}

export async function addShortcut(userId, payload) {
  const r = await fetch(`${base}/usuarios/${userId}/shortcuts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!r.ok) throw new Error("addShortcut failed");
  // puede devolver la lista completa o solo el item; dejamos que el caller decida
  return r.json();
}

export async function removeShortcut(userId, shortcutId) {
  const r = await fetch(`${base}/usuarios/${userId}/shortcuts/${shortcutId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!r.ok) throw new Error("removeShortcut failed");
  return r.json(); // ⬅️ esperamos lista completa (según backend nuevo)
}

export async function reorderShortcuts(userId, orderedIds) {
  const r = await fetch(`${base}/usuarios/${userId}/shortcuts/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: orderedIds }),
    credentials: "include",
  });
  if (!r.ok) throw new Error("reorderShortcuts failed");
  return r.json(); // ⬅️ lista completa
}
