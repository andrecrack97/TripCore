import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/login";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos");
      return;
    }
    const resp = await loginUser(email, password);
    if (resp.success) {
      setError("");
      navigate("/"); // redirigir a home/dashboard
    } else {
      setError(resp.message);
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
          <h1>
            ¡Bienvenido de vuelta,<br />viajero!
          </h1>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <a href="/olvide" className="link">
            ¿Olvidaste tu contraseña?
          </a>
          <a href="/Registro" className="link">
            ¿No tienes una cuenta? Registrate.
          </a>

          <button type="submit">Iniciar sesión</button>
        </form>

        <div className="login-image">
          <img src="/assets/iniciosesion.png" alt="Viaje" />
        </div>
      </div>
    </div>
  );
}
