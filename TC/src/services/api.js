export function createAPI(baseUrl = import.meta.env.VITE_API_URL) {
    const api = async (path, { method = "GET", body, token } = {}) => {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
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
  