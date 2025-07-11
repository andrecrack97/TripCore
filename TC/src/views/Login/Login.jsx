import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/login";  // Importamos el servicio
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Llamamos al servicio de login
      const response = await loginUser(email, contraseña);

      if (response.success) {
        // Si el login es exitoso, redirigimos al usuario a la página principal
        navigate("/");  // Redirigir a la página de inicio
      } else {
        // Si no es exitoso, mostramos el mensaje de error
        setError(response.message);  // Mostrar el error recibido
      }
    } catch (err) {
      console.error("Error al conectar al backend:", err);
      setError("No se pudo conectar al servidor.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-form">
          <h1>¡Bienvenido de vuelta,<br />viajero!</h1>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />
          {error && <p style={{ color: "red" }}>{error}</p>} {/* Mostrar errores si los hay */}
          <a href="#" className="link">¿Olvidaste tu contraseña?</a>
          <a href="/Registro" className="link">¿No tienes una cuenta? Registrate.</a>
          <button onClick={handleLogin}>Iniciar sesión</button>
        </div>
        <div className="login-image">
          <img src="/assets/iniciosesion.png" alt="Viaje" />
        </div>
      </div>
    </div>
  );
}
