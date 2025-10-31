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

export const destinosApi = {
  // búsqueda de ciudades grandes (fallback)
  searchCities: ({ q, countryIds, limit = 10, major = true }) =>
    httpGet("/api/destinos/search", { q, countryIds, limit, major }),

  // top ciudades grandes (opcional)
  topCities: ({ minPopulation = 500000, limit = 12 }) =>
    httpGet("/api/destinos/top", { minPopulation, limit }),

  getCityById: (id) => httpGet(`/api/destinos/cities/${id}`),
  listCountries: ({ limit = 250 } = {}) =>
    httpGet("/api/destinos/countries", { limit }),
};
