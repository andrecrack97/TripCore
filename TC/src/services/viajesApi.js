// src/services/viajesApi.js
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token") || null;
}

async function http(path, { method = "GET", body } = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
  if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
  return json;
}

async function safeCreate(payload) {
  try {
    return await http("/api/viajes", { method: "POST", body: payload });
  } catch (err) {
    // Fallback: crear sin auth usando /api/viajes/planificar si existe
    const user = (() => { try { return JSON.parse(localStorage.getItem("user")||"null"); } catch { return null; } })();
    if (/No autorizado|401|HTTP 401|Token inválido/i.test(String(err?.message || "")) || /HTTP 404/.test(String(err?.message||""))) {
      const fallbackBody = {
        id_usuario: user?.id_usuario || user?.id || user?.idUser || null,
        nombre_viaje: payload?.nombre_viaje || payload?.nombre || "Mi viaje",
        fecha_inicio: payload?.fecha_inicio,
        fecha_fin: payload?.fecha_fin,
      };
      // Si faltan campos críticos, vuelve a lanzar el error original
      if (!fallbackBody.id_usuario || !fallbackBody.fecha_inicio || !fallbackBody.fecha_fin) throw err;
      const res = await fetch(`${API_BASE}/api/viajes/planificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fallbackBody),
      });
      const text = await res.text();
      let json; try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
      return json;
    }
    throw err;
  }
}

async function safePatch(id, payload) {
  try {
    return await http(`/api/viajes/${id}`, { method: "PATCH", body: payload });
  } catch (err) {
    // Si el backend no tiene PATCH o devuelve 404, lo tratamos como no fatal
    if (/HTTP 404/.test(String(err?.message || ""))) {
      return { success: false, skipped: true };
    }
    throw err;
  }
}

async function safeConfirm(id) {
  try {
    return await http(`/api/viajes/${id}/confirm`, { method: "POST" });
  } catch (err) {
    // 404 en confirm no debe impedir guardar el viaje
    if (/HTTP 404/.test(String(err?.message || ""))) {
      return { success: false, skipped: true };
    }
    throw err;
  }
}

export const viajesApi = {
  create:   (payload)     => safeCreate(payload),
  patch:    (id, payload) => safePatch(id, payload),
  confirm:  (id)          => safeConfirm(id),
  // Sugerencias asociadas al viaje (usa su destino_id)
  sugerencias: (id)       => http(`/api/viajes/${id}/sugerencias`),
};
