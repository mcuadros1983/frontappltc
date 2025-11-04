// src/utils/phone.js

/**
 * Normaliza un número argentino a formato wa.me:
 * - Quita no-dígitos.
 * - Quita prefijos locales "0" y "15".
 * - Asegura prefijo "549" (móviles AR en WhatsApp).
 *
 * Ejemplos:
 *  - "38340664614"  -> "54938340664614"
 *  - "03834-1566..."-> "549383466..."
 *  - "+54 9 3834..."-> "5493834..."
 */
export function normalizeToWaAr(raw) {
  if (!raw) return null;
  let d = String(raw).replace(/\D+/g, "");

  // Si empieza con 0 (carrier/local), quitarlo
  if (d.startsWith("0")) d = d.slice(1);

  // Quitar "15" después del área (2-4 dígitos)
  d = d.replace(/^(\d{2})15/, "$1");
  d = d.replace(/^(\d{3})15/, "$1");
  d = d.replace(/^(\d{4})15/, "$1");

  // Si ya viene con país sin 9, agregarlo (54 -> 549)
  if (d.startsWith("54") && !d.startsWith("549")) {
    d = "549" + d.slice(2);
  }

  // Si ya viene como 549... OK
  if (d.startsWith("549")) return d;

  // Si no trae país, prepender 549
  return "549" + d;
}

/** Construye URL wa.me con texto */
export function buildWaUrl(numberWa, text) {
  const msg = encodeURIComponent(text || "");
  return `https://wa.me/${numberWa}?text=${msg}`;
}
