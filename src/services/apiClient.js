const API_BASE = process.env.REACT_APP_API_URL 

function baseHeaders() {
  return {
    'Content-Type': 'application/json'
    // Si más adelante agregamos auth, acá se inyecta
  };
}

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  get: async (path) => handle(await fetch(`${API_BASE}${path}`, { headers: baseHeaders(), credentials: "include" })),
  post: async (path, body) => handle(await fetch(`${API_BASE}${path}`, { method: 'POST', headers: baseHeaders(), body: JSON.stringify(body), credentials: "include" })),
  put: async (path, body) => handle(await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: baseHeaders(), body: JSON.stringify(body), credentials: "include" })),
  del: async (path) => handle(await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: baseHeaders(), credentials: "include" }))
};
