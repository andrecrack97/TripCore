export const registerUser = async (nombre, email, contraseña, confirmar, pais) => {
  try {
    const res = await fetch("http://localhost:3005/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // siempre mandamos todo para que el backend pueda mapear sin drama
        nombre,
        email,                 // variante 1
        mail: email,           // variante 2
        password: contraseña,  // variante 1
        contraseña,            // variante 2
        confirmPassword: confirmar,  // variante 1
        confirmar,                   // variante 2
        pais
      }),
    });

    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) return { success: false, message: data.message || `Error ${res.status}` };
    return { success: true, message: data.message || "Usuario registrado" };
  } catch (error) {
    console.error("❌ Error en fetch(register):", error);
    return { success: false, message: "No se pudo conectar al servidor" };
  }
};
