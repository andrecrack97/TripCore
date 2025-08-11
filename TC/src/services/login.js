export const loginUser = async (email, contraseña) => {
  try {
    console.log("→ Llamando a API con:", email, contraseña); // Debug

    const response = await fetch("http://localhost:3005/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, contraseña }),
    });

    const data = await response.json();
    console.log("← Respuesta del backend:", data);

    if (data.success) {
      // ✅ Guarda sesión (puede ser el email o un token)
      localStorage.setItem("usuario", email);
      // Si el backend devuelve un token JWT:
      // localStorage.setItem("token", data.token);

      return { success: true };
    } else {
      return {
        success: false,
        message: data.message || "Credenciales incorrectas",
      };
    }
  } catch (error) {
    console.error("❌ Error en fetch:", error);
    return { success: false, message: "Error de conexión" };
  }
};
