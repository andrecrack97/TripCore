export const registerUser = async (nombre, email, contraseña) => {
  try {
    const res = await fetch("http://localhost:3005/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, contraseña }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Error al registrar" };
    }
    return { success: true, message: data.message || "Usuario registrado" };
  } catch (error) {
    console.error("❌ Error en fetch(register):", error);
    return { success: false, message: "No se pudo conectar al servidor" };
  }
};
