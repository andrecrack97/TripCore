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

