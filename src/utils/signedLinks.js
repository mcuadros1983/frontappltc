import crypto from "crypto";

/**
 * Firma una ruta con query ?exp=… usando HMAC-SHA256.
 * @param {string} basePathWithQuery - ej: /public/recibo/123.pdf?exp=1735600000
 * @param {string} secret - PDF_SIGN_SECRET
 * @returns {string} firma hexadecimal (64 chars)
 */
export function signPath(basePathWithQuery, secret) {
  return crypto.createHmac("sha256", secret).update(basePathWithQuery).digest("hex");
}

/**
 * Verifica que la firma y la expiración sean válidas.
 * @param {string} pathWithQuery - ej: /public/recibo/123.pdf?exp=...&sig=...
 * @param {string} secret
 * @param {number} [grace=300] - segundos extra de gracia (desfase de reloj)
 */
export function verifySignedPath(pathWithQuery, secret, grace = 300) {
  const url = new URL("http://dummy" + pathWithQuery); // base dummy para parsear
  const exp = Number(url.searchParams.get("exp"));
  const sig = url.searchParams.get("sig");
  if (!exp || !sig) return false;

  // expiración con +gracia
  const now = Math.floor(Date.now() / 1000);
  if (now > exp + grace) return false;

  // recomponer base sin sig
  url.searchParams.delete("sig");
  const base = url.pathname + "?" + url.searchParams.toString();

  const expected = signPath(base, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/**
 * Construye un link firmado completo (ruta + exp + sig).
 * @param {string} path - ej: /public/recibo/123.pdf
 * @param {number} ttlSeconds - ej: 72*3600
 * @param {string} secret
 * @returns {string} - ej: /public/recibo/123.pdf?exp=...&sig=...
 */
export function buildSignedPath(path, ttlSeconds, secret) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const base = `${path}?exp=${exp}`;
  const sig = signPath(base, secret);
  return `${base}&sig=${sig}`;
}
