import React from "react";
import "./Registro.css";

export default function Registro() {
    return (
      <div className="login-page">
        <div className="login-box">
          <div className="login-form">
            <h1>¡Registrate<br />viajero!</h1>
            <input type="text" placeholder="Nombre completo" />
            <input type="email" placeholder="Correo electrónico" />
            <input type="password" placeholder="Contraseña" required/>
            <input type="password" placeholder="Confirmar contraseña" required/>
            <input type="text" placeholder="País de origen"/>
            <a href="/views/Login/Login" className="link">¿Ya tienes una cuenta? Inicia sesión.</a>
            <button>Registrarse</button>
          </div>
          <div className="login-image">
            <img src="/assets/iniciosesion.png" alt="Viaje" />
          </div>
        </div>
      </div>
    );
}