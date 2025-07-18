export const registerUser = async (nombre, email, contraseña) => {
    try {
        const res = await fetch("http://localhost:3005/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, contraseña })
    });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error al registrar:", error);
      return { success: false, message: "No se pudo conectar al servidor" };
    }
  };
  