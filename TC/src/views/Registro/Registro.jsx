import React, { useState } from 'react';
import './Registro.css';

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    confirmar: '',
    pais: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (formData.contraseña !== formData.confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registro exitoso");
        window.location.href = "/Login";
      } else {
        alert(data.mensaje);
      }
    } catch (err) {
      console.error(err);
      alert("Error al registrarse");
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-box">
        <div className="registro-form">
          <h1>¡Registrate viajero!</h1>
          <input type="text" name="nombre" placeholder="Nombre completo" onChange={handleChange} />
          <input type="email" name="email" placeholder="Correo electrónico" onChange={handleChange} />
          <input type="password" name="contraseña" placeholder="Contraseña" onChange={handleChange} />
          <input type="password" name="confirmar" placeholder="Confirmar contraseña" onChange={handleChange} />
          <input type="text" name="pais" placeholder="País de origen" onChange={handleChange} />
          <a href="/Login" className="link">¿Ya tienes una cuenta? Inicia sesión.</a>
          <button onClick={handleSubmit}>Registrarse</button>
        </div>
        <div className="registro-image">
          <img src="/assets/registrarse.png" alt="Viaje" />
        </div>
      </div>
    </div>
  );
}
