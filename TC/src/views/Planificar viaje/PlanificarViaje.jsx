import React, { useState } from "react";
import "./PlanificarViaje.css";
import { useNavigate } from "react-router-dom";

export default function PlanificarViaje() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!origen || !destino) {
      setError("Por favor completá ambos campos");
      setExito("");
      return;
    }

    try {
      const response = await fetch("http://localhost:3005/api/viajes/planificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origen, destino }),
      });

      const data = await response.json();

      if (data.success) {
        setExito("✅ Viaje planificado con éxito");
        setError("");
        setOrigen("");
        setDestino("");
        setTimeout(() => navigate("/"), 2000); // volver al home
      } else {
        setError(data.message || "❌ Error al planificar el viaje");
        setExito("");
      }
    } catch (err) {
      setError("❌ Error al conectar con el servidor");
      setExito("");
    }
  };

  return (
    <div className="planificador-container">
      <div className="planificador-box">
        <p className="breadcrumb">Planificador de Viajes &nbsp; ❯ &nbsp; <span>1: Elegir destino</span></p>
        <h2>Paso 1</h2>
        <h1>Planea tu proximo viaje</h1>

        <form onSubmit={handleSubmit}>
          <label>Elegir punto de partida</label>
          <input
            type="text"
            placeholder="Países, ciudades etc"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
          />

          <label>Elegir destino</label>
          <input
            type="text"
            placeholder="Países, ciudades etc"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
          />

          {error && <p className="error">{error}</p>}
          {exito && <p className="exito">{exito}</p>}

          <p className="ayuda">Aún no estás seguro de donde ir?</p>
          <button
            type="button"
            className="btn-explorar"
            onClick={() => navigate("/explorar")}
          >
            📍 Explorar destinos
          </button>

          <button type="submit" className="btn-siguiente">
            Siguiente &nbsp; ➤
          </button>
        </form>
      </div>
    </div>
  );
}
