// Servicios de perfil y viajes
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3005";

export async function fetchUserTrips(userId) {
  const res = await fetch(`${BASE}/api/viajes`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter(v => String(v.id_usuario) === String(userId));
}

export async function fetchUserDetails(userId) {
  const res = await fetch(`${BASE}/api/usuarios/${userId}`);
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || `Error ${res.status}`);
  }
  return data.user;
}

export async function updateUser(userId, payload) {
  const res = await fetch(`${BASE}/api/usuarios/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || `Error ${res.status}`);
  }
  return data.user;
}


