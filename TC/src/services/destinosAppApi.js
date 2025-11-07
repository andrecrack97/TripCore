const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function httpGet(path, params = {}) {
  const url = new URL(path, API_BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Error ${res.status}`);
  }
  return res.json();
}

export const destinosAppApi = {
  autocomplete: ({ q, limit = 8 }) =>
    httpGet("/api/destinos-app/autocomplete", { q, limit }),

  top: ({ country, season, climate, limit = 12 } = {}) =>
    httpGet("/api/destinos-app/top", { country, season, climate, limit }),

  getById: (id) => httpGet(`/api/destinos-app/${id}`),

  detalle: (id) => httpGet(`/api/destinos-app/${id}/detalle`),
};
