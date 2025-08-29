// src/views/registro.jsx
import React, { useState } from 'react';
import './Registro.css';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { registerUser } from "../../services/register";

export default function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    confirmar: '',
    pais: ''
  });

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setExito("");
  };

  const handleSubmit = async () => {
    if (loading) return;

    const { nombre, email, contraseña, confirmar, pais } = formData;

    if (!nombre || !email || !contraseña || !confirmar || !pais) {
      setError("Completá todos los campos");
      setExito("");
      return;
    }

    if (contraseña !== confirmar) {
      setError("Las contraseñas no coinciden");
      setExito("");
      return;
    }

    try {
      setLoading(true);
      // ⬇️ Ahora mandamos todos los campos al servicio
      const resp = await registerUser(nombre, email, contraseña, confirmar, pais);

      if (resp.success) {
        setError("");
        setExito("Registro exitoso. Redirigiendo...");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setExito("");
        setError(resp.message || "Error al registrar");
      }
    } catch (err) {
      console.error(err);
      setExito("");
      setError("Error al conectarse al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-box">
        <div className="registro-form">
          <h1>¡Registrate viajero!</h1>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {exito && <p style={{ color: "green" }}>{exito}</p>}

          <input type="text" name="nombre" placeholder="Nombre completo" onChange={handleChange} />
          <input type="email" name="email" placeholder="Correo electrónico" onChange={handleChange} />

          <div className="input-con-icono">
            <input
              type={verPass ? "text" : "password"}
              name="contraseña"
              placeholder="Contraseña"
              onChange={handleChange}
            />
            <FontAwesomeIcon
              icon={verPass ? faEyeSlash : faEye}
              onClick={() => setVerPass(!verPass)}
              className="icono-ojo"
            />
          </div>

          <div className="input-con-icono">
            <input
              type={verConfirmar ? "text" : "password"}
              name="confirmar"
              placeholder="Confirmar contraseña"
              onChange={handleChange}
            />
            <FontAwesomeIcon
              icon={verConfirmar ? faEyeSlash : faEye}
              onClick={() => setVerConfirmar(!verConfirmar)}
              className="icono-ojo"
            />
          </div>

          <input type="text" name="pais" placeholder="País de origen" onChange={handleChange} />

          <a href="/Login" className="link">¿Ya tienes una cuenta? Inicia sesión.</a>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </div>

        <div className="registro-image">
          <img src="/assets/registrarse.png" alt="Viaje" />
        </div>
      </div>
    </div>
  );
}
