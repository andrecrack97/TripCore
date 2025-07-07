import React from 'react';
import './Registro.css'; 
export default function Registro() {
  return (
    <div className="registro-page">
      <div className="registro-box">
        <div className="registro-form">
          <h1>¡Registrate viajero!</h1>
          <input type="text" placeholder="Nombre completo" />
          <input type="email" placeholder="Correo electrónico" />
          <input type="password" placeholder="Contraseña" />
          <input type="password" placeholder="Confirmar contraseña" />
          <input type="text" placeholder="País de origen" />
          <a href="/Login" className="link">¿Ya tienes una cuenta? Inicia sesión.</a>
          <button>Registrarse</button>
        </div>
        <div className="registro-image">
          <img src="/assets/registrarse.png" alt="Viaje" />
        </div>
      </div>
    </div>
  );
}
