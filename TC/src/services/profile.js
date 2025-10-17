// Servicios de perfil y viajes (con Bearer token)
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchUserTrips(tab = "history", page = 1, pageSize = 10) {
  const res = await fetch(`${BASE}/api/viajes?tab=${tab}&page=${page}&pageSize=${pageSize}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return Array.isArray(data?.items) ? data.items : [];
}

// Nuevo: usa /api/me del backend
export async function fetchMe() {
  const res = await fetch(`${BASE}/api/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
}

export async function updateMe(payload) {
  const res = await fetch(`${BASE}/api/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
}

export async function toggleFavoriteTrip(id) {
  const res = await fetch(`${BASE}/api/viajes/${id}/favorite`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
}

// Detalle de viaje
export async function fetchTripDetails(id) {
  const base = (BASE || "").replace(/\/+$/, "");
  const urls = [
    // preferimos proxy local para evitar CORS y diferencias de puerto
    `/api/viajes/${id}`,
    `${base}${base.endsWith("/api") ? "" : "/api"}/viajes/${id}`,
    `${base}/viajes/${id}`,
  ];

  let lastText = "";
  for (const url of urls) {
    const res = await fetch(url, { headers: authHeaders() });
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      return data;
    }
    lastText = await res.text();
    // si devolvió HTML de Vite o Express 404, probamos siguiente variante
  }
  const snippet = (lastText || "").slice(0, 140).replace(/\s+/g, " ");
  throw new Error(`No se pudo obtener JSON del detalle. Revisa que el backend esté corriendo y la variable VITE_API_URL apunte a tu API. Detalle: ${snippet}`);
}

