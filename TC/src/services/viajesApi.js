// src/services/viajesApi.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function http(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json;
}

export const viajesApi = {
  create:   (payload)     => http("/api/viajes", { method: "POST",  body: payload }),
  patch:    (id, payload) => http(`/api/viajes/${id}`, { method: "PATCH", body: payload }),
  confirm:  (id)          => http(`/api/viajes/${id}/confirm`, { method: "POST" }),
  // Sugerencias asociadas al viaje (usa su destino_id)
  sugerencias: (id)       => http(`/api/viajes/${id}/sugerencias`),
};
