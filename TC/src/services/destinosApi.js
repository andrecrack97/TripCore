// Servicio para consumir tu backend /api/destinos
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
  // Autocomplete
  searchCities: ({ q, countryIds, limit = 8, minPopulation = 10000, offset = 0 }) =>
    httpGet("/api/destinos/search", { q, countryIds, limit, minPopulation, offset }),

  // Detalle por id
  getCityById: (id) => httpGet(`/api/destinos/cities/${id}`),

  // Países
  listCountries: ({ limit = 100, offset = 0 } = {}) =>
    httpGet("/api/destinos/countries", { limit, offset }),

  // Populares
  popularCities: ({ minPopulation = 500000, limit = 12 } = {}) =>
    httpGet("/api/destinos/popular", { minPopulation, limit }),
};
