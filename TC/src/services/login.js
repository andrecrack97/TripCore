export const loginUser = async (email, contraseña) => {
  try {
    const response = await fetch("http://localhost:3005/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, contraseña }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Error de login" };
    }

    // Podés guardar token o email
    localStorage.setItem("usuario", data.user?.email || email);

    return { success: true, user: data.user };
  } catch (error) {
    console.error("❌ Error en fetch(login):", error);
    return { success: false, message: "Error de conexión" };
  }
};
