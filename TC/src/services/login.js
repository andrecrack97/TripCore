export const loginUser = async (email, contraseña) => {
    try {
      const response = await fetch("http://localhost:3005/api/login", {  // Asegúrate de que la URL sea correcta
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, contraseña }),  // Enviamos los datos
      });
  
      const data = await response.json();
  
      if (data.success) {
        // Si el login es exitoso, retornamos el éxito
        return { success: true };
      } else {
        // Si el login falla, retornamos el error
        return { success: false, message: data.message || "Credenciales incorrectas" };
      }
    } catch (error) {
      // Si hay un error de conexión, lo capturamos aquí
      return { success: false, message: "Error de conexión" };
    }
  };
  