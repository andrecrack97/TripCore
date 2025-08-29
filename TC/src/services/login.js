// src/services/login.js
export const loginUser = async (email, password) => {
  try {
    const response = await fetch("http://localhost:5432/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Error de login" };
    }

    // Guardamos token o email
    if (data.token) localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", data.user?.email || email);

    return { success: true, user: data.user };
  } catch (error) {
    console.error("❌ Error en fetch(login):", error);
    return { success: false, message: "Error de conexión con el servidor" };
  }
};
