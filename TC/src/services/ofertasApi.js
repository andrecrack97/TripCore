const win = typeof window !== "undefined" ? window : undefined;
const defaultOrigin = win?.location?.origin || "http://localhost:5173";
const fallbackApi = defaultOrigin.replace(/:\d+$/, (match) => `:${match.slice(1) === "5173" ? "3000" : match.slice(1)}`);

const rawBase = (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "").trim();
let API_BASE = fallbackApi;

if (rawBase) {
  try {
    const url = new URL(rawBase, defaultOrigin);
    API_BASE = url.origin.replace(/\/$/, "");
  } catch (err) {
    console.warn("[ofertasApi] VITE_API_* inválido, usando fallback", rawBase, err);
  }
}

console.debug("[ofertasApi] API_BASE:", API_BASE);

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

export const ofertasApi = {
  getAll: (params = {}) => {
    const { tipo, destino, fechas, limit } = params;
    const queryParams = {};
    if (tipo) queryParams.tipo = tipo;
    if (destino) queryParams.destino = destino;
    if (fechas) queryParams.fechas = fechas;
    if (limit) queryParams.limit = limit;
    return httpGet("/api/ofertas", queryParams);
  },
};

