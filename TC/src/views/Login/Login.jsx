import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/login";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("juan@gmail.com");
  const [contraseña, setContraseña] = useState("juan");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !contraseña.trim()) {
      setError("Completa todos los campos");
      return;
    }
  
    try {
      const response = await loginUser(email, contraseña);
  
      if (response.success) {
        localStorage.setItem("usuario", email); // ✅ Guarda el usuario logueado
        setError("");
        navigate("/");
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Error al conectar al backend:", err);
      setError("No se pudo conectar al servidor.");
    }
  };
  

  return (
    <div className="login-page">
      <div className="login-box">
        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <h1>¡Bienvenido de vuelta,<br />viajero!</h1>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(""); // Limpia el error al escribir
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => {
              setContraseña(e.target.value);
              setError(""); // Limpia el error al escribir
            }}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <a href="#" className="link">¿Olvidaste tu contraseña?</a>
          <a href="/Registro" className="link">¿No tienes una cuenta? Registrate.</a>

          <button type="submit">Iniciar sesión</button>
        </form>

        <div className="login-image">
          <img src="/assets/iniciosesion.png" alt="Viaje" />
        </div>
      </div>
    </div>
  );
}
