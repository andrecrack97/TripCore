export function createAPI(baseUrl = import.meta.env.VITE_API_URL) {
    const api = async (path, { method = "GET", body, token } = {}) => {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // No credentials to avoid CORS preflight rejection with wildcard origins
        body: body ? JSON.stringify(body) : undefined,
      });
      let data = null;
      try { data = await res.json(); } catch (_) {}
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
      return data;
    };
    return {
      get: (p, o) => api(p, { ...o, method: "GET" }),
      post: (p, body, o) => api(p, { ...o, method: "POST", body }),
      put: (p, body, o) => api(p, { ...o, method: "PUT", body }),
    };
  }
  
  // Helper específico para auth/usuarios comunes desde el frontend
  export const API = createAPI(import.meta.env.VITE_API_URL || "http://localhost:3005");
  
  // Servicio para restablecer contraseña
  export async function resetPasswordByEmail({ email, password, confirmPassword }) {
    // Enviamos confirmación solo para validar en el backend, nunca se persiste
    return API.post("/api/usuarios/reset-password", { email, password, confirmPassword });
  }

  // Sugerencias planificar viaje
  export async function fetchSuggestions(params = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return API.get(`/api/viajes/sugerencias?${qs}`);
  }

  // Seguros services
  export async function fetchSegurosPlanes(params = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return API.get(`/api/seguros/planes${qs ? `?${qs}` : ""}`);
  }

  export async function fetchSegurosCompanias() {
    return API.get(`/api/seguros/companias`);
  }

  export async function fetchAlertasSanitarias() {
    return API.get(`/api/seguros/alertas`);
  }
  