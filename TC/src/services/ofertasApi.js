function resolveApiBase() {
  const win = typeof window !== "undefined" ? window : undefined;
  const raw = (
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    ""
  ).trim();

  if (!raw) {
    if (win) {
      const hostname = win.location.hostname || "localhost";
      const protocol = win.location.protocol || "http:";
      return `${protocol}//${hostname}:3000`;
    }
    return "http://localhost:3000";
  }

  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
  if (raw.startsWith("//")) {
    const protocol = win?.location.protocol || "http:";
    return `${protocol}${raw}`.replace(/\/$/, "");
  }
  if (raw.startsWith(":")) {
    const hostname = win?.location.hostname || "localhost";
    const protocol = win?.location.protocol || "http:";
    return `${protocol}//${hostname}${raw}`.replace(/\/$/, "");
  }
  if (raw.startsWith("/")) {
    const origin = win?.location.origin || "http://localhost:3000";
    return `${origin}${raw}`.replace(/\/$/, "");
  }
  const protocol = win?.location.protocol || "http:";
  const hostname = win?.location.hostname || "localhost";
  return `${protocol}//${hostname}/${raw}`.replace(/\/$/, "");
}

let API_BASE = resolveApiBase();

try {
  const testUrl = new URL("/api/ofertas", API_BASE);
  if (testUrl.hostname === "") {
    throw new Error("invalid host");
  }
} catch (_) {
  const win = typeof window !== "undefined" ? window : undefined;
  const protocol = win?.location.protocol || "http:";
  const hostname = win?.location.hostname || "localhost";
  API_BASE = `${protocol}//${hostname}:3000`;
}

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
    const { tipo, destino, fechas } = params;
    const queryParams = {};
    if (tipo) queryParams.tipo = tipo;
    if (destino) queryParams.destino = destino;
    if (fechas) queryParams.fechas = fechas;
    return httpGet("/api/ofertas", queryParams);
  },
};

