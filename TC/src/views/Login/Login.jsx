import React from "react";
import "./Login.css";

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-form">
          <h1>¡Bienvenido de vuelta,<br />viajero!</h1>
          <input type="email" placeholder="Correo electrónico" />
          <input type="password" placeholder="Contraseña" required/>
          <a href="#" className="link">¿Olvidaste tu contraseña?</a>
          <a href="/Registro" className="link">¿No tienes una cuenta? Registrate.</a>
          <button>Iniciar sesión</button>
        </div>
        <div className="login-image">
        <img src="/assets/iniciosesion.png" alt="Viaje" />
        </div>
      </div>
    </div>
  );
}
